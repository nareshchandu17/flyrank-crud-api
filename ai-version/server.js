const app = require("./app");

const PORT = 3001;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Swagger Docs: http://localhost:${PORT}/api-docs`);
});
