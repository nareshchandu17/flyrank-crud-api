const tasks = require("../data/tasks");

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

module.exports = {
  getAllTasks,
  getTaskById
};