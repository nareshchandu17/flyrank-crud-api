const { Worker } = require("bullmq");
const fs = require("fs");
const path = require("path");
const { connection } = require("./queue");
const { pool } = require("../database/db");
const llmProvider = require("../llm/provider");
const { taskOutputSchema } = require("../llm/schema");

function parseAndValidateLlmOutput(text) {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1) {
        throw new Error("No JSON object found in response");
    }
    const jsonStr = text.substring(start, end + 1);
    const parsed = JSON.parse(jsonStr);
    
    const result = taskOutputSchema.safeParse(parsed);
    if (!result.success) {
        const errorMsg = result.error.issues[0];
        throw new Error(`Invalid output field: ${errorMsg.path.join('.')} - ${errorMsg.message}`);
    }
    return result.data;
}

const worker = new Worker("classificationQueue", async (job) => {
    console.log(`[Worker] Processing job ${job.id}`);
    const { inputData } = job.data;

    // Update job status to processing
    await pool.query(
        `INSERT INTO job_results (job_id, status) VALUES ($1, $2)
         ON CONFLICT (job_id) DO UPDATE SET status = $2, updated_at = NOW()`,
        [job.id, 'processing']
    );

    if (process.env.LLM_STUB === "1") {
        const stubResult = {
            category: "development",
            urgency: "normal",
            effort: "medium",
            confidence: 0.95
        };
        await pool.query(
            `UPDATE job_results SET status = $1, result_data = $2, updated_at = NOW() WHERE job_id = $3`,
            ['completed', JSON.stringify(stubResult), job.id]
        );
        return stubResult;
    }

    const promptPath = path.join(__dirname, "../../prompts/task-classifier-v1.md");
    const systemPrompt = fs.readFileSync(promptPath, "utf-8");
    const rawJsonInput = JSON.stringify(inputData);
    const userContent = `<user_input>\n${rawJsonInput}\n</user_input>`;

    const startTime = Date.now();
    let inputTokens = 0;
    let outputTokens = 0;
    let neededRepair = false;

    let completion = await llmProvider.complete(systemPrompt, userContent, process.env.LLM_MODEL);
    let rawOutput = completion.raw_output;
    inputTokens += completion.input_tokens || 0;
    outputTokens += completion.output_tokens || 0;
    let finalData;

    try {
        finalData = parseAndValidateLlmOutput(rawOutput);
    } catch (parseError) {
        neededRepair = true;
        const repairPrompt = `Your previous answer was rejected for this reason: ${parseError.message}. Return only corrected JSON matching the schema.`;
        
        completion = await llmProvider.complete(systemPrompt, userContent, process.env.LLM_MODEL, rawOutput, repairPrompt);
        
        rawOutput = completion.raw_output;
        inputTokens += completion.input_tokens || 0;
        outputTokens += completion.output_tokens || 0;
        
        try {
            finalData = parseAndValidateLlmOutput(rawOutput);
        } catch (secondError) {
            const logEntry = {
                timestamp: new Date().toISOString(),
                prompt_version: "v1",
                input: inputData,
                raw_output: rawOutput,
                error: secondError.message
            };
            
            const logDir = path.join(__dirname, "../../logs");
            if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
            fs.appendFileSync(
                path.join(logDir, "quarantine.jsonl"), 
                JSON.stringify(logEntry) + "\n"
            );

            // Let it throw so BullMQ retries
            throw new Error("Failed to generate valid classification after repair attempt.");
        }
    }

    const durationMs = Date.now() - startTime;
    const usageLog = {
        timestamp: new Date().toISOString(),
        prompt_version: "v1",
        model: process.env.LLM_MODEL,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        duration_ms: durationMs,
        needed_repair: neededRepair,
        job_id: job.id
    };
    const logDir = path.join(__dirname, "../../logs");
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
    fs.appendFileSync(path.join(logDir, "usage.jsonl"), JSON.stringify(usageLog) + "\n");

    // Idempotent update on success
    await pool.query(
        `UPDATE job_results SET status = $1, result_data = $2, updated_at = NOW() WHERE job_id = $3`,
        ['completed', JSON.stringify(finalData), job.id]
    );

    return finalData;

}, { 
    connection,
    // BullMQ standard retry options are defined on the queue side when adding jobs,
    // but the worker itself just processes them.
});

worker.on('failed', async (job, err) => {
    console.error(`[Worker] Job ${job.id} failed:`, err.message);
    
    // Update DB to failed if it's the final attempt
    // BullMQ keeps track of job.attemptsMade and job.opts.attempts
    if (job.attemptsMade >= job.opts.attempts) {
        try {
            await pool.query(
                `UPDATE job_results SET status = $1, updated_at = NOW() WHERE job_id = $2`,
                ['failed', job.id]
            );
        } catch (dbErr) {
            console.error(`[Worker] Failed to update job_results for job ${job.id}:`, dbErr);
        }
        
        // Log to alerts.jsonl
        const logDir = path.join(__dirname, "../../logs");
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
        fs.appendFileSync(
            path.join(logDir, "alerts.jsonl"),
            JSON.stringify({
                timestamp: new Date().toISOString(),
                job_id: job.id,
                error: err.message,
                stack: err.stack
            }) + "\n"
        );
    }
});

console.log("[Worker] Started background worker for classificationQueue");

module.exports = worker;
