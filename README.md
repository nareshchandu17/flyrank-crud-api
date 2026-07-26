# FlyRank CRUD API

A simple REST API built with Node.js and Express for the FlyRank Backend Internship.

## Tech Stack

- Node.js
- Express.js
- SQLite (via better-sqlite3)
- Swagger UI
- JavaScript

## Features

- Create Task
- Get All Tasks
- Get Task by ID
- Update Task
- Delete Task
- Filter Tasks by Done Status
- Search Tasks by Title
- Task Statistics
- Reset Tasks to Initial State
- Swagger Documentation

## Installation

```bash
git clone https://github.com/nareshchandu17/flyrank-crud-api.git
cd flyrank-crud-api
npm install
npm run dev
```

The database file `tasks.db` is created automatically on first run. No manual setup required.

## Why SQLite?

- Lightweight, file-based database
- No separate database server required
- Zero configuration
- Data persists even after server restarts
- Perfect for small backend applications and learning SQL

## Database

The application uses a SQLite database named `tasks.db`.

The database file is created automatically when the server starts.

If the database is empty, three sample tasks are seeded automatically:

| id | title | done |
|----|-------|------|
| 1 | Learn Express | 0 |
| 2 | Complete FlyRank Assignment | 0 |
| 3 | Push project to GitHub | 1 |

## Example SQL Query

```sql
SELECT * FROM tasks;
```

Returns every task stored in the SQLite database.

## Database Screenshot

![SQLite Database](./assets/database.png)

> **Note:** Screenshot taken from DB Browser for SQLite showing the `tasks` table with seeded data.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | / | Root endpoint |
| GET | /health | Health check |
| GET | /tasks | Get all tasks (supports ?done=true/false and ?search=query) |
| GET | /tasks/:id | Get task by ID |
| POST | /tasks | Create a new task |
| PUT | /tasks/:id | Update a task |
| DELETE | /tasks/:id | Delete a task |
| GET | /tasks/stats | Get task statistics |
| POST | /tasks/reset | Reset tasks to initial state |

## Swagger

Visit:

http://localhost:3000/docs

![Swagger UI Screenshot](assets/swagger-ui.png)

## Sample curl Command

```bash
curl -X POST http://localhost:3000/tasks \
-H "Content-Type: application/json" \
-d '{"title":"Buy milk"}'
```

## Storage

This API uses SQLite via `better-sqlite3` for persistent storage.

All tasks survive server restarts because they are written to `tasks.db` on disk.
This replaces the in-memory JavaScript array used in Assessment 1.

---

# AI vs Me

## AI Prompt

```
Build a RESTful Task Management API using Node.js and Express.

Requirements:

- Use Express.js.
- Store tasks in memory using a JavaScript array (no database).
- Implement CRUD operations.

Endpoints:

GET /
Return API information.

GET /health
Return { "status": "ok" }

GET /tasks
Return all tasks.

GET /tasks/:id
Return a single task by id.
Return 404 if the task does not exist.

POST /tasks
Accept JSON:

{
  "title": "Buy milk"
}

Validate that title is provided and is not empty.
Return 400 for invalid input.
Create a new task with:
- auto-incrementing id
- done = false
Return status 201 and the created task.

PUT /tasks/:id
Allow updating title and done.
Return 404 for unknown ids.
Return 400 for invalid data.

DELETE /tasks/:id
Delete the task.
Return 204 on success.
Return 404 if the task doesn't exist.

Use proper HTTP status codes.

Organize the project using:
- controllers
- routes
- app.js
- server.js

Use Swagger UI for API documentation.

Provide complete code with comments.
```

---

## What AI Did Better

- Added a Task schema definition in Swagger components for better API documentation
- Used consistent JSDoc comments throughout the code
- Clean separation of concerns with proper MVC structure
- Used `/api-docs` endpoint which is a common convention for Swagger
- Included helpful comments explaining each function

---

## What AI Got Wrong

- **No initial data**: AI started with an empty tasks array, while my implementation includes 3 initial tasks for testing
- **ID generation approach**: AI uses a simple counter (`currentId++`) which could cause issues if tasks are deleted. My implementation calculates the next ID based on the highest existing ID using `getNextId()`
- **Missing features**: AI didn't implement the optional extras (filtering, search, stats, reset) that I added
- **Error response format**: AI uses `"message"` key for errors, while I use `"error"` key - both are valid but inconsistent
- **Update validation**: AI doesn't check if the user is trying to update without providing any data, my implementation returns 400 for "Nothing to update"
- **Data separation**: AI stores tasks directly in the controller file, while I separated data into a dedicated `data/tasks.js` file for better organization

---

## What My Prompt Missed

I didn't specify:
- Whether to include initial seed data
- The exact ID generation strategy (counter vs. max existing ID)
- The error response format (message vs error key)
- Whether to implement optional features like filtering and search
- Whether to separate data into its own file

---

## Comparison Summary

| Aspect | My Implementation | AI Implementation |
|--------|------------------|-------------------|
| Initial Data | 3 seed tasks | Empty array |
| ID Generation | Based on max existing ID | Simple counter |
| Data Storage | Separate data file | In controller |
| Filtering | ✅ ?done=true/false | ❌ |
| Search | ✅ ?search=query | ❌ |
| Stats Endpoint | ✅ /tasks/stats | ❌ |
| Reset Endpoint | ✅ /tasks/reset | ❌ |
| Error Key | `"error"` | `"message"` |
| Update Validation | Checks for empty update | No check |
| Swagger Schema | Basic | Includes Task schema |
| Swagger Path | /docs | /api-docs |

---

## Improved Prompt

Based on this comparison, an improved prompt would include:

```
Build a RESTful Task Management API using Node.js and Express.

Requirements:

- Use Express.js.
- Store tasks in memory using a JavaScript array (no database).
- Include 3 initial seed tasks for testing.
- Implement CRUD operations.

ID Generation:
- Calculate next ID based on the highest existing ID (not a simple counter)
- This handles task deletion correctly

Endpoints:

GET /
Return API information including name, version, and available endpoints.

GET /health
Return { "status": "ok" }

GET /tasks
Return all tasks.
Support query parameters:
- ?done=true - filter completed tasks
- ?done=false - filter incomplete tasks
- ?search=query - search by title (case-insensitive)

GET /tasks/:id
Return a single task by id.
Return 404 with { "error": "Task {id} not found" } if not found.

POST /tasks
Accept JSON: { "title": "Buy milk" }
Validate that title is provided and is not empty.
Return 400 with { "error": "Title is required" } for invalid input.
Create a new task with auto-incrementing id and done=false.
Return status 201 and the created task.

PUT /tasks/:id
Allow updating title and done.
Return 404 with { "error": "Task {id} not found" } for unknown ids.
Return 400 with { "error": "Nothing to update" } if no data provided.
Return 400 with { "error": "Title cannot be empty" } for empty title.
Return 400 with { "error": "Done must be true or false" } for invalid done value.

DELETE /tasks/:id
Delete the task.
Return 204 on success.
Return 404 with { "error": "Task {id} not found" } if not found.

GET /tasks/stats
Return { total, done, open } statistics.

POST /tasks/reset
Reset tasks to initial seed data.

Use proper HTTP status codes (200, 201, 204, 400, 404).
Use "error" key in error responses.

Organize the project using:
- data/ folder for initial data
- controllers/ folder
- routes/ folder
- swagger/ folder
- app.js
- server.js

Use Swagger UI at /docs endpoint with Task schema definition.
```

---

## Running the AI Version

The AI-generated version is in the `ai-version/` folder:

```bash
cd ai-version
npm install
npm run dev
```

It runs on port 3001 to avoid conflict with the main implementation (port 3000).

Swagger docs: http://localhost:3001/api-docs
