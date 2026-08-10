const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
const taskModel = require("../models/task.model");
const { taskInputSchema } = require("../llm/schema");

const client = new OpenAI({
  baseURL: process.env.LLM_BASE_URL,
  apiKey: process.env.LLM_API_KEY,
});

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

        const completion = await client.chat.completions.create({
            model: process.env.LLM_MODEL,
            temperature: 0.1,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: JSON.stringify(result.data) }
            ],
        });

        res.status(200).send(completion.choices[0].message.content);
    } catch (error) {
        console.error("LLM Error:", error);
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
