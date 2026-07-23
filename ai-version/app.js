const express = require("express");
const swaggerUi = require("swagger-ui-express");

const taskRoutes = require("./routes/taskRoutes");
const swaggerSpec = require("./swagger/swagger");

const app = express();

// Middleware
app.use(express.json());

/**
 * @swagger
 * /
 * get:
 *   summary: API Information
 *   responses:
 *     200:
 *       description: API information
 */
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Task Management REST API",
        version: "1.0.0"
    });
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health Check
 *   responses:
 *     200:
 *       description: Server health
 */
app.get("/health", (req, res) => {
    res.json({
        status: "ok"
    });
});

// Routes
app.use("/tasks", taskRoutes);

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

module.exports = app;
