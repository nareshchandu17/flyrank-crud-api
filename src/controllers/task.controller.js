const taskModel = require("../models/task.model");

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

module.exports = {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    getStats,
    resetTasks,
};
