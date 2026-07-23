// In-memory storage
let tasks = [];

let currentId = 1;

/**
 * Get all tasks
 */
exports.getAllTasks = (req, res) => {
    res.status(200).json(tasks);
};

/**
 * Get task by ID
 */
exports.getTaskById = (req, res) => {

    const id = Number(req.params.id);

    const task = tasks.find(task => task.id === id);

    if (!task) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    res.status(200).json(task);
};

/**
 * Create Task
 */
exports.createTask = (req, res) => {

    const { title } = req.body;

    if (!title || title.trim() === "") {
        return res.status(400).json({
            message: "Title is required"
        });
    }

    const newTask = {
        id: currentId++,
        title: title.trim(),
        done: false
    };

    tasks.push(newTask);

    res.status(201).json(newTask);
};

/**
 * Update Task
 */
exports.updateTask = (req, res) => {

    const id = Number(req.params.id);

    const task = tasks.find(task => task.id === id);

    if (!task) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    const { title, done } = req.body;

    if (title !== undefined) {

        if (typeof title !== "string" || title.trim() === "") {
            return res.status(400).json({
                message: "Invalid title"
            });
        }

        task.title = title.trim();
    }

    if (done !== undefined) {

        if (typeof done !== "boolean") {
            return res.status(400).json({
                message: "done must be boolean"
            });
        }

        task.done = done;
    }

    res.status(200).json(task);
};

/**
 * Delete Task
 */
exports.deleteTask = (req, res) => {

    const id = Number(req.params.id);

    const index = tasks.findIndex(task => task.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    tasks.splice(index, 1);

    res.sendStatus(204);
};
