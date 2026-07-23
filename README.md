# FlyRank CRUD API

A simple REST API built with Node.js and Express for the FlyRank Backend Internship.

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

## Memory Storage Observation

This API stores all tasks in memory using a JavaScript array.

When the server restarts, all newly created or updated tasks are lost because the data is not persisted to a database. This demonstrates why databases are essential for storing application data permanently.
