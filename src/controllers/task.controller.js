const fs = require("fs");
const path = require("path");
const taskModel = require("../models/task.model");
const { taskInputSchema } = require("../llm/schema");
const { classificationQueue } = require("../jobs/queue");
const { pool } = require("../database/db");
const crypto = require("crypto");




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

    // Generate idempotency/job ID based on hash of the input
    const jobId = crypto.createHash('sha256').update(rawJsonInput).digest('hex');

    try {
        // Initial insert into db as pending (idempotent due to ON CONFLICT)
        await pool.query(
            `INSERT INTO job_results (job_id, status) VALUES ($1, $2)
             ON CONFLICT (job_id) DO NOTHING`,
            [jobId, 'pending']
        );

        // Add to queue with 3 retries, exponential backoff
        await classificationQueue.add("classify", { inputData: result.data }, {
            jobId: jobId,
            attempts: 4, // initial + 3 retries
            backoff: {
                type: 'exponential',
                delay: 1000,
            }
        });

        // Accept fast, return 202
        return res.status(202).json({
            message: "Classification job accepted.",
            jobId: jobId,
            statusUrl: `/tasks/classify/${jobId}`
        });

    } catch (error) {
        console.error("Queue Error:", error);
        res.status(500).json({ error: "Failed to enqueue task classification" });
    }
};

const getClassificationStatus = async (req, res) => {
    const { jobId } = req.params;

    try {
        const { rows } = await pool.query(`SELECT * FROM job_results WHERE job_id = $1`, [jobId]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Job not found" });
        }

        const job = rows[0];
        res.status(200).json({
            jobId: job.job_id,
            status: job.status,
            result: job.result_data,
            created_at: job.created_at,
            updated_at: job.updated_at
        });
    } catch (error) {
        console.error("Status Error:", error);
        res.status(500).json({ error: "Failed to fetch job status" });
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
    getClassificationStatus,
};
