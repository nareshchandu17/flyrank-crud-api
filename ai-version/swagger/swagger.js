const swaggerJsdoc = require("swagger-jsdoc");

const options = {

    definition: {
        openapi: "3.0.0",

        info: {
            title: "Task Management API",
            version: "1.0.0",
            description: "RESTful API built with Express"
        },

        servers: [
            {
                url: "http://localhost:3001"
            }
        ]
    },

    apis: [
        "./app.js",
        "./routes/*.js"
    ]
};

module.exports = swaggerJsdoc(options);
