require("dotenv").config();
const { Pool } = require("pg");

// Single connection string from .env
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Create table and seed initial data if empty
async function initDb() {
    // Create the tasks table if it doesn't exist
    await pool.query(`
        CREATE TABLE IF NOT EXISTS tasks (
            id    SERIAL PRIMARY KEY,
            title TEXT    NOT NULL,
            done  BOOLEAN NOT NULL DEFAULT false
        );

        CREATE TABLE IF NOT EXISTS job_results (
            job_id      TEXT PRIMARY KEY,
            status      TEXT NOT NULL,
            result_data JSONB,
            created_at  TIMESTAMP DEFAULT NOW(),
            updated_at  TIMESTAMP DEFAULT NOW()
        );
    `);

    // Seed only if table is empty
    const { rows } = await pool.query("SELECT COUNT(*) AS count FROM tasks");

    if (parseInt(rows[0].count) === 0) {
        await pool.query(`
            INSERT INTO tasks (title, done) VALUES
            ('Learn Express',               false),
            ('Complete FlyRank Assignment', false),
            ('Push project to GitHub',      true)
        `);
        console.log("✅ Sample tasks inserted.");
    }

    console.log("🐘 Connected to PostgreSQL");
}

module.exports = { pool, initDb };
