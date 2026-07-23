const tasks = require("../data/tasks");

const getNextId = () => {
    if (tasks.length === 0) return 1;
    return tasks[tasks.length - 1].id + 1;
};

const getAllTasks = (req, res) => {
  res.status(200).json(tasks);
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

module.exports = {
  getAllTasks,
  getTaskById,
  createTask
};