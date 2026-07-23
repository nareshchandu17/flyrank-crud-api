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

// Update a task, return the updated row or null if not found
function updateTask(id, title, done) {
    const stmt = db.prepare(`
        UPDATE tasks
        SET title = ?, done = ?
        WHERE id = ?
    `);

    const result = stmt.run(title, done, id);

    if (result.changes === 0) {
        return null;
    }

    return getTaskById(id);
}

// Delete a task, return true if deleted, false if not found
function deleteTask(id) {
    const stmt = db.prepare(`
        DELETE FROM tasks
        WHERE id = ?
    `);

    const result = stmt.run(id);

    return result.changes > 0;
}

module.exports = {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
};
