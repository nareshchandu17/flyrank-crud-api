const db = require("../database/db");

// Get all tasks
function getAllTasks() {
    const stmt = db.prepare("SELECT * FROM tasks");
    return stmt.all();
}

// Get task by ID
function getTaskById(id) {
    const stmt = db.prepare("SELECT * FROM tasks WHERE id = ?");
    return stmt.get(id);
}

// Insert a new task, return the full created row
function createTask(title) {
    const stmt = db.prepare("INSERT INTO tasks (title, done) VALUES (?, 0)");
    const result = stmt.run(title);
    return getTaskById(result.lastInsertRowid);
}

module.exports = {
    getAllTasks,
    getTaskById,
    createTask,
};
