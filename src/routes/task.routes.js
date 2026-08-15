const express = require("express");

const router = express.Router();

const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getStats,
  resetTasks,
  classifyTask,
  getClassificationStatus
} = require("../controllers/task.controller");

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get all tasks
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: List of tasks
 */
router.get("/", getAllTasks);

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *     responses:
 *       201:
 *         description: Task created
 */
router.post("/", createTask);

/**
 * @swagger
 * /tasks/stats:
 *   get:
 *     summary: Get task statistics
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: Task statistics
 */
router.get("/stats", getStats);

/**
 * @swagger
 * /tasks/reset:
 *   post:
 *     summary: Reset tasks to initial state
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: Tasks reset successfully
 *       403:
 *         description: Feature disabled
 */
router.post("/reset", resetTasks);

/**
 * @swagger
 * /tasks/classify:
 *   post:
 *     summary: Enqueues a new task for classification
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 maxLength: 2000
 *             required:
 *               - title
 *               - description
 *     responses:
 *       202:
 *         description: Classification job accepted
 *       400:
 *         description: Validation error
 */
router.post("/classify", classifyTask);

/**
 * @swagger
 * /tasks/classify/{jobId}:
 *   get:
 *     summary: Get classification job status
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job status returned
 *       404:
 *         description: Job not found
 */
router.get("/classify/:jobId", getClassificationStatus);

/**
 * @swagger
 * /tasks/{id}:
 *   get:

 *     summary: Get task by ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task found
 *       404:
 *         description: Task not found
 */
router.get("/:id", getTaskById);

/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Updated successfully
 */
router.put("/:id", updateTask);

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Deleted
 */
router.delete("/:id", deleteTask);

module.exports = router;