const Database = require("better-sqlite3");

// Open (or create) the database file
const db = new Database("tasks.db");

// Create the tasks table if it doesn't exist
db.prepare(`
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        done INTEGER NOT NULL
    )
`).run();

// Check if the table is empty
const rowCount = db.prepare("SELECT COUNT(*) AS count FROM tasks").get();

// Seed initial data only once
if (rowCount.count === 0) {
    const insert = db.prepare(
        "INSERT INTO tasks (title, done) VALUES (?, ?)"
    );

    insert.run("Learn Express", 0);
    insert.run("Complete FlyRank Assignment", 0);
    insert.run("Push project to GitHub", 1);

    console.log("✅ Sample tasks inserted.");
}

module.exports = db;