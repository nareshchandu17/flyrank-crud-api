const express = require("express");

const router = express.Router();

const {
  getAllTasks,
  getTaskById,
  createTask
} = require("../controllers/task.controller");

router.get("/", getAllTasks);

router.get("/:id", getTaskById);

router.post("/", createTask);

module.exports = router;