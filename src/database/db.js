require("dotenv").config();
const { Pool } = require("pg");

// Create a connection pool using environment variables
const pool = new Pool({
    host:     process.env.PGHOST,
    port:     process.env.PGPORT,
    user:     process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
});

// Create table and seed initial data if empty
async function initDb() {
    // Create the tasks table if it doesn't exist
    await pool.query(`
        CREATE TABLE IF NOT EXISTS tasks (
            id   SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            done  BOOLEAN NOT NULL DEFAULT false
        )
    `);

    // Seed only if table is empty
    const { rows } = await pool.query("SELECT COUNT(*) AS count FROM tasks");

    if (parseInt(rows[0].count) === 0) {
        await pool.query(`
            INSERT INTO tasks (title, done) VALUES
            ('Learn Express',              false),
            ('Complete FlyRank Assignment', false),
            ('Push project to GitHub',      true)
        `);
        console.log("✅ Sample tasks inserted.");
    }

    console.log("🐘 Connected to PostgreSQL");
}

module.exports = { pool, initDb };
