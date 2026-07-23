const { tasks, initialTasks } = require("../data/tasks");

const getNextId = () => {
    if (tasks.length === 0) return 1;
    return tasks[tasks.length - 1].id + 1;
};

const getAllTasks = (req, res) => {
    let result = [...tasks];

    const { done, search } = req.query;

    // Filter by done status
    if (done !== undefined) {
        const isDone = done === "true";
        result = result.filter(task => task.done === isDone);
    }

    // Search by title
    if (search) {
        result = result.filter(task =>
            task.title.toLowerCase().includes(search.toLowerCase())
        );
    }

    res.status(200).json(result);
};

const getTaskById = (req, res) => {
  const id = Number(req.params.id);

  const task = tasks.find(task => task.id === id);

  if (!task) {
    return res.status(404).json({
      error: `Task ${id} not found`
    });
  }

  res.status(200).json(task);
};

const createTask = (req, res) => {
    const { title } = req.body;

    // Validation
    if (!title || title.trim() === "") {
        return res.status(400).json({
            error: "Title is required"
        });
    }

    const newTask = {
        id: getNextId(),
        title: title.trim(),
        done: false
    };

    tasks.push(newTask);

    res.status(201).json(newTask);
};

const updateTask = (req, res) => {
    const id = Number(req.params.id);

    const task = tasks.find(task => task.id === id);

    if (!task) {
        return res.status(404).json({
            error: `Task ${id} not found`
        });
    }

    const { title, done } = req.body;

    if (title === undefined && done === undefined) {
        return res.status(400).json({
            error: "Nothing to update"
        });
    }

    if (title !== undefined) {
        if (title.trim() === "") {
            return res.status(400).json({
                error: "Title cannot be empty"
            });
        }

        task.title = title.trim();
    }

    if (done !== undefined) {
        if (typeof done !== "boolean") {
            return res.status(400).json({
                error: "Done must be true or false"
            });
        }

        task.done = done;
    }

    res.status(200).json(task);
};

const deleteTask = (req, res) => {
    const id = Number(req.params.id);

    const index = tasks.findIndex(task => task.id === id);

    if (index === -1) {
        return res.status(404).json({
            error: `Task ${id} not found`
        });
    }

    tasks.splice(index, 1);

    res.sendStatus(204);
};

const getStats = (req, res) => {
    const total = tasks.length;
    const done = tasks.filter(task => task.done).length;
    const open = total - done;

    res.json({
        total,
        done,
        open
    });
};

const resetTasks = (req, res) => {
    tasks.length = 0;
    initialTasks.forEach(task => tasks.push({ ...task }));

    res.json({
        message: "Tasks reset successfully",
        tasks
    });
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getStats,
  resetTasks
};