const fs = require("fs");
const path = require("path");
const llmProvider = require("../llm/provider");
const taskModel = require("../models/task.model");
const { taskInputSchema, taskOutputSchema } = require("../llm/schema");

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


const getAllTasks = async (req, res) => {
    const tasks = await taskModel.getAllTasks();
    res.status(200).json(tasks);
};

const getTaskById = async (req, res) => {
    const id = parseInt(req.params.id);

    const task = await taskModel.getTaskById(id);

    if (!task) {
        return res.status(404).json({
            error: "Task not found",
        });
    }

    res.status(200).json(task);
};

const createTask = async (req, res) => {
    const { title } = req.body;

    if (!title || title.trim() === "") {
        return res.status(400).json({
            error: "Title is required",
        });
    }

    const newTask = await taskModel.createTask(title.trim());

    res.status(201).json(newTask);
};

const updateTask = async (req, res) => {
    const id = parseInt(req.params.id);
    const { title, done } = req.body;

    if (title === undefined && done === undefined) {
        return res.status(400).json({
            error: "Request body cannot be empty",
        });
    }

    if (title !== undefined && title.trim() === "") {
        return res.status(400).json({
            error: "Title cannot be empty",
        });
    }

    if (done !== undefined && typeof done !== "boolean") {
        return res.status(400).json({
            error: "Done must be a boolean",
        });
    }

    const existingTask = await taskModel.getTaskById(id);

    if (!existingTask) {
        return res.status(404).json({
            error: "Task not found",
        });
    }

    const updatedTask = await taskModel.updateTask(
        id,
        title ?? existingTask.title,
        done ?? existingTask.done
    );

    res.status(200).json(updatedTask);
};

const deleteTask = async (req, res) => {
    const id = parseInt(req.params.id);

    const deleted = await taskModel.deleteTask(id);

    if (!deleted) {
        return res.status(404).json({
            error: "Task not found",
        });
    }

    res.status(204).send();
};

const getStats = async (req, res) => {
    const allTasks = await taskModel.getAllTasks();
    const total = allTasks.length;
    const done = allTasks.filter(task => task.done).length;
    const open = total - done;

    res.json({ total, done, open });
};

const resetTasks = (req, res) => {
    res.status(501).json({
        error: "Reset not supported with database storage",
    });
};

const classifyTask = async (req, res) => {
    const result = taskInputSchema.safeParse(req.body);

    if (!result.success) {
        const errorMsg = result.error.issues[0];
        return res.status(400).json({
            error: `Invalid field: ${errorMsg.path.join('.')}`,
            details: errorMsg.message
        });
    }

    if (process.env.LLM_ENABLED === "false") {
        return res.status(503).json({
            error: "Service Unavailable",
            details: "AI classification is currently disabled."
        });
    }

    if (process.env.LLM_STUB === "1") {
        return res.status(200).json({
            category: "development",
            urgency: "normal",
            effort: "medium",
            confidence: 0.95
        });
    }

    try {
        const promptPath = path.join(__dirname, "../../prompts/task-classifier-v1.md");
        const systemPrompt = fs.readFileSync(promptPath, "utf-8");
        const rawJsonInput = JSON.stringify(result.data);
        const userContent = `<user_input>\n${rawJsonInput}\n</user_input>`;

        // Measure before you spend: Heuristic token count
        const estimatedTokens = Math.ceil((systemPrompt.length + userContent.length) / 4);
        if (estimatedTokens > 2000) {
            return res.status(413).json({
                error: "Payload Too Large",
                details: `Estimated tokens (${estimatedTokens}) exceeds the limit of 2000.`
            });
        }

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
                    input: result.data,
                    raw_output: rawOutput,
                    error: secondError.message
                };
                
                const logDir = path.join(__dirname, "../../logs");
                if (!fs.existsSync(logDir)) {
                    fs.mkdirSync(logDir);
                }
                fs.appendFileSync(
                    path.join(logDir, "quarantine.jsonl"), 
                    JSON.stringify(logEntry) + "\n"
                );

                return res.status(422).json({
                    error: "Unprocessable Entity",
                    details: "Failed to generate valid classification from the model after repair attempt."
                });
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
            needed_repair: neededRepair
        };
        const logDir = path.join(__dirname, "../../logs");
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
        fs.appendFileSync(path.join(logDir, "usage.jsonl"), JSON.stringify(usageLog) + "\n");

        res.status(200).json(finalData);
    } catch (error) {
        console.error("LLM Error:", error);
        if (llmProvider.isTimeoutError(error)) {
            return res.status(504).json({ error: "Gateway Timeout", details: "The AI provider took too long to respond." });
        }
        res.status(500).json({ error: "Failed to classify task" });
    }
};

module.exports = {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    getStats,
    resetTasks,
    classifyTask,
};
