require("dotenv").config();
const app = require("./app");
const { initDb } = require("./database/db");
const supabase = require("./config/supabase");

const PORT = process.env.PORT || 3000;

// Initialise the database, then start the HTTP server
initDb()
    .then(() => {
        console.log("✅ Connected to Supabase");
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📋 Tasks API:    http://localhost:${PORT}/tasks`);
            console.log(`📖 Swagger Docs: http://localhost:${PORT}/docs`);
        });
    })
    .catch((err) => {
        console.error("❌ Failed to connect to database:", err.message);
        process.exit(1);
    });
