const express = require("express");
const swaggerUi = require("swagger-ui-express");

const taskRoutes = require("./routes/task.routes");
const authRoutes = require("./routes/auth.routes");
const publicRoutes = require("./routes/public.routes");
const protectedRoutes = require("./routes/protected.routes");
const swaggerSpec = require("./swagger/swagger");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    name: "Task API",
    version: "1.0",
    endpoints: ["/tasks"]
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok"
  });
});

app.use("/tasks",     taskRoutes);
app.use("/auth",      authRoutes);
app.use("/public",    publicRoutes);
app.use("/protected", protectedRoutes);

app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);

module.exports = app;