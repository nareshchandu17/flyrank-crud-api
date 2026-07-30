const { pool } = require("../database/db");

// Get all tasks
async function getAllTasks() {
    const { rows } = await pool.query("SELECT * FROM tasks ORDER BY id");
    return rows;
}

// Get task by ID
async function getTaskById(id) {
    const { rows } = await pool.query(
        "SELECT * FROM tasks WHERE id = $1",
        [id]
    );
    return rows[0] || null;
}

// Insert a new task, return the created row
async function createTask(title) {
    const { rows } = await pool.query(
        "INSERT INTO tasks (title, done) VALUES ($1, false) RETURNING *",
        [title]
    );
    return rows[0];
}

// Update a task, return the updated row or null if not found
async function updateTask(id, title, done) {
    const { rows } = await pool.query(
        "UPDATE tasks SET title = $1, done = $2 WHERE id = $3 RETURNING *",
        [title, done, id]
    );
    return rows[0] || null;
}

// Delete a task, return true if deleted, false if not found
async function deleteTask(id) {
    const result = await pool.query(
        "DELETE FROM tasks WHERE id = $1",
        [id]
    );
    return result.rowCount > 0;
}

module.exports = {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
};
