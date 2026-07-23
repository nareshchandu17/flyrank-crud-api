const app = require("./app");

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Tasks API: http://localhost:${PORT}/tasks`);
    console.log(`Swagger Docs: http://localhost:${PORT}/docs`);
});