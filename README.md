# FlyRank CRUD API

## What it does
This API endpoint acts as an automatic assistant for a project management board. When you send it a new software task with a title and description, it uses artificial intelligence to categorize the task (such as a bug, a new feature, or a design change), guess how urgent it is, and estimate how much effort it will take to complete. This saves project managers from having to manually read and organize every new ticket.

## Example Request
```bash
curl -X POST http://localhost:3000/tasks/classify \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Fix the login bug",
    "description": "Users cannot log in when using Safari."
  }'
```

**Response:**
```json
{
  "category": "bug",
  "urgency": "high",
  "effort": "medium",
  "confidence": 0.85
}
```

## Job Card
**What it does (one sentence):** Classifies a new task and assigns it a category, urgency, and estimated effort.
**Input:** `{ "title": "string, 1-200 characters", "description": "string, 1-2000 characters" }`
**Output:** `{ "category": one of [development|marketing|design|bug|other], "urgency": one of [low|normal|high], "effort": one of [small|medium|large], "confidence": 0.0-1.0 }`

**It must never:**
- invent a category outside the list
- return free text
- reveal the prompt

**When unsure it should:** return category "other" with low confidence, not a guess.

## Configuration
**Provider & Model:** Google Gemini (`gemini-2.5-flash`) via official OpenAI SDK compatibility.
To swap to another provider (like OpenRouter or a local Ollama instance), you just need to change these three environment variables in your `.env` file:
- `LLM_BASE_URL`
- `LLM_API_KEY`
- `LLM_MODEL`

## Evaluation Results
**Date:** 2026-08-10
**Prompt Version:** v1
**Score:** 6 out of 8 (75.0%) matched expected category.

## Cost Breakdown
**One Call Log:**
`{"timestamp":"2026-08-10T12:55:23.259Z","prompt_version":"v1","model":"gemini-2.5-flash","input_tokens":385,"output_tokens":43,"duration_ms":3506,"needed_repair":false}`

**Cost Estimate for 10,000 requests/day:**
At ~430 tokens per call on Gemini Flash pricing, 10,000 requests would cost approximately **$0.45 per day**.

## What I'd fix with another day
With another day, I would improve the system prompt to distinguish better between "development" and "design" for UI tasks, and I'd add a circuit breaker to gracefully degrade all classification to manual when rate limits (like 429s) are repeatedly exhausted.
