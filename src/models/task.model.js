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

module.exports = {
    getAllTasks,
    getTaskById,
};
