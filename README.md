# FlyRank CRUD API

A RESTful Task Management API built with Node.js, Express, PostgreSQL, and Supabase authentication. Fully containerised with Docker Compose.

## Run the Project

```bash
git clone https://github.com/nareshchandu17/flyrank-crud-api.git
cd flyrank-crud-api
cp .env.example .env       # Windows: copy .env.example .env
# fill in SUPABASE_URL and SUPABASE_KEY in .env
docker compose up
```

That's it — one command starts both the API and the PostgreSQL database. No manual database setup needed.

## Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

| Variable        | Where to get it                                      |
|-----------------|------------------------------------------------------|
| `DATABASE_URL`  | Pre-filled for Docker Compose (no change needed)     |
| `SUPABASE_URL`  | Supabase dashboard → Project Settings → API          |
| `SUPABASE_KEY`  | Supabase dashboard → Project Settings → API (anon key) |
| `PORT`          | Default 3000                                         |
| `LLM_BASE_URL`  | The base URL of the LLM provider                     |
| `LLM_API_KEY`   | API key for your LLM provider                        |
| `LLM_MODEL`     | The model ID to use (e.g., `gemini-2.5-flash`)       |

> 💡 **Note:** The LLM client is configured entirely via environment variables. This allows switching between providers (like Gemini, OpenRouter, or a local Ollama instance) by changing just three variables, with zero code changes.

> ⚠️ Never commit your real `.env` file. It is listed in `.gitignore`.

## Tech Stack

- Node.js + Express
- PostgreSQL via `pg`
- Supabase (authentication)
- Docker + Docker Compose
- Swagger UI

## API Reference

### Public — no auth required

| Method | Endpoint        | Description                  |
|--------|-----------------|------------------------------|
| GET    | /public/info    | Public welcome message       |
| POST   | /auth/signup    | Register a new user          |
| POST   | /auth/login     | Log in, receive JWT tokens   |

### Protected — requires `Authorization: Bearer <token>`

| Method | Endpoint             | Description                  |
|--------|----------------------|------------------------------|
| POST   | /auth/logout         | Invalidate session           |
| GET    | /protected/profile   | Authenticated user's profile |
| GET    | /protected/dashboard | Authenticated dashboard      |

### Tasks — no auth required

| Method | Endpoint       | Description              |
|--------|----------------|--------------------------|
| GET    | /tasks         | Get all tasks            |
| GET    | /tasks/:id     | Get one task             |
| POST   | /tasks         | Create a task            |
| PUT    | /tasks/:id     | Update a task            |
| DELETE | /tasks/:id     | Delete a task            |
| GET    | /tasks/stats   | Task statistics          |

## Example Requests

**Sign up:**
```bash
curl -i -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

**Log in and get token:**
```bash
curl -i -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

**Access protected profile:**
```bash
curl -i http://localhost:3000/protected/profile \
  -H "Authorization: Bearer <your_access_token>"
```

**Create a task:**
```bash
curl -i -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Learn Docker\"}"
```

## Swagger Docs

Visit http://localhost:3000/docs — click **Authorize**, paste your JWT, and use **Try it out** on any protected route.

![Swagger UI Screenshot](assets/swagger-ui.png)

## Database

PostgreSQL is managed by Docker Compose. The table is created and seeded automatically on first run:

| id | title                       | done  |
|----|-----------------------------|-------|
| 1  | Learn Express               | false |
| 2  | Complete FlyRank Assignment | false |
| 3  | Push project to GitHub      | true  |

Data persists across restarts via a Docker volume (`taskdata`).

---

# Assessment History

| Assessment | Description                     | Status |
|------------|---------------------------------|--------|
| 1          | In-memory CRUD API              | ✅     |
| 2          | SQLite persistent storage       | ✅     |
| 3          | PostgreSQL + Docker             | ✅     |
| 4          | Supabase authentication         | ✅     |

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
Accept JSON: { "title": "Buy milk" }
Validate that title is provided and is not empty.
Return 400 for invalid input.
Create a new task with auto-incrementing id and done=false.
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
Organize the project using controllers, routes, app.js, server.js.
Use Swagger UI for API documentation.
```

## What AI Did Better

- Added a Task schema definition in Swagger components
- Used consistent JSDoc comments throughout
- Clean MVC structure
- Used `/api-docs` (common convention)

## What AI Got Wrong

- No initial seed data
- Simple counter for ID generation (breaks after deletes)
- Missing filtering, search, stats, reset features
- Uses `"message"` key for errors instead of `"error"`
- No validation for empty update body

## Comparison Summary

| Aspect            | My Implementation        | AI Implementation    |
|-------------------|--------------------------|----------------------|
| Initial Data      | 3 seed tasks             | Empty array          |
| ID Generation     | Max existing ID          | Simple counter       |
| Filtering         | ✅ ?done=true/false      | ❌                   |
| Search            | ✅ ?search=query         | ❌                   |
| Stats Endpoint    | ✅ /tasks/stats          | ❌                   |
| Error Key         | `"error"`                | `"message"`          |
| Update Validation | Checks for empty update  | No check             |

---

## Running the AI Version

```bash
cd ai-version
npm install
npm run dev
```

Runs on port 3001. Swagger: http://localhost:3001/api-docs

## Testing the LLM Endpoint (Stub Mode)

To test the task classification endpoint without making actual LLM calls, set the `LLM_STUB=1` environment variable and use these `curl` commands.

### Valid Request
```bash
curl -X POST http://localhost:3000/tasks/classify \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Fix the login bug",
    "description": "Users cannot log in when using Safari."
  }'
```
*Expected response: `200 OK` with JSON matching the output schema.*

### Invalid Request
```bash
curl -X POST http://localhost:3000/tasks/classify \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Too short description",
    "description": ""
  }'
```
*Expected response: `400 Bad Request` with an error message naming the invalid field (`description`).*

## LLM Testing (Stage 33 & 35)

*Retry Policy:* We explicitly implemented our own custom retry logic (disabling the SDK's default by setting `maxRetries: 0`). It handles 429 (respecting `Retry-After`) and 5xx errors (with a 30-second client timeout) using exponential backoff with jitter (1s, 2s, 4s).

I ran the LLM integration on three real inputs, including a typical task, an ambiguous question, and a hostile prompt injection attempt. 

**What surprised me:**
1. The model handled the hostile prompt perfectly. When told to ignore instructions and write a poem, it returned the exact JSON schema with category `"other"` and a low confidence score (`0.20`), refusing to break the JSON structure!
2. Even though I asked it to output *exactly* a JSON object, the model consistently wrapped the response in Markdown code blocks (e.g. ` ```json\n { ... } \n``` `). The shape inside the block is perfect every time, but parsing it will require stripping those backticks in the future.
3. Keeping the user content separate from the system prompt by encoding it as a JSON string `{"role": "user", "content": "..."}` was highly effective at neutralizing the prompt injection.

