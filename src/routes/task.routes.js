const express = require("express");

const router = express.Router();

const {
  getAllTasks,
  getTaskById
} = require("../controllers/task.controller");

router.get("/", getAllTasks);

router.get("/:id", getTaskById);

module.exports = router;