const express = require("express");
const taskRoutes = require("./routes/task.routes");

const app = express();

// Middleware
app.use(express.json());

// Root Endpoint
app.get("/", (req, res) => {
    res.json({
        name: "Task API",
        version: "1.0",
        endpoints: ["/tasks"]
    });
});

// Health Check Endpoint
app.get("/health", (req, res) => {
    res.json({
        status: "ok"
    });
});

// Task Routes
app.use("/tasks", taskRoutes);

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Tasks API: http://localhost:${PORT}/tasks`);
});

module.exports = app;