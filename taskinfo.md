F LY R A N K I N T E R N S H I P · B A C K E N D T R A C K · W E E K 7 · A S S I G N M E N T A 1 7
Put an LLM behind your API
Add one endpoint to the API you have been growing all program. It takes something messy, asks a
model, and returns clean validated JSON — with a real timeout, sensible retries, a cost log and a kill
switch. You choose what it does. You do not get to choose whether it is trustworthy.
~5–6 h across 6 stages Stretch +2 h Bonus AI stage +1 h JavaScript or Python $0 · no credit card
PAIRED LIVE EVENT
Workshop — LLMs in production
YOU WILL PRACTISE
Provider setup · prompts as
versioned specs · schema
validation · repair retries ·
timeouts & retry policy · cost
logging · a tiny eval set
S UBMISSION
Public GitHub repo, 6+ commits,
README with a runnable curl
and a real eval score
How to read this document: new words are shown in bold the first time they appear — every one of them is explained in the
Glossary at the end. Work the stages in order; each ends with a checkpoint that proves it works. This is not a chatbot
assignment — one request in, one structured answer out, and that constraint is what makes it shippable.
Contents
Goal & purpose ......................................................................... 1
The big idea in 60 seconds ................................................... 2
Step one — pick your job ....................................................... 2
Tools — pick one lane ............................................................ 4
The task — 6 stages ............................................................... 5
Bonus stage — the AI rematch ............................................ 13
Requirements & stretch goals .............................................. 13
Done means ........................................................................... 14
Curated resources ................................................................. 15
Glossary ................................................................................... 21
1 · Goal & purpose
Goal: add one new endpoint to the API you have been growing all program. It takes something messy, sends it to an
LLM, and returns clean, validated JSON that the rest of your code can rely on — with a real timeout, sensible retries,
a cost log and a kill switch.
Almost every backend job you apply to in the next two years will have "integrate an LLM" somewhere in the description.
Very few of them mean "build a chatbot." What they mean is much smaller and much more useful: there is one step in a
workflow where a human currently reads something and makes a judgement, and they want that step to happen in code.
That is what you are building. One narrow job, done well.
You already have most of the skills. In Week 2 you built endpoints. In Week 6 you learned that data arriving from outside your
system has to be normalized, validated and quarantined before you trust it. A model's answer is exactly that kind of data. It
comes from outside your system, it is sometimes wrong, and it must go through a schema before it touches your database.
If you remember nothing else this week, remember this: the model is a slow, clever, sometimes wrong external API — and
you already know how to handle one of those.
1.
2.
3.
4.
5.
6.
7.
8.
9.
10.There is one habit this assignment exists to install: decide what "correct" looks like before you call the model. Beginners
call the model first, look at the pretty answer, and build around whatever came back. Professionals write the output shape
down first, then make the model fill it in, then check it.
A word on what this is not
This is not a chatbot. There is no conversation, no memory of the last message, no open text box. One request in, one
structured answer out. That constraint is not us making it easier — it is what makes the thing testable, cacheable, cheap, and
possible to put in front of real users.
Beginners usually overthink this. The actual integration is about thirty lines. The rest of the time goes on the parts that make
it safe: the schema, the timeout, the retry rules, and eight test cases. That ratio is not a mistake. That ratio is the lesson.
2 · The big idea in 60 seconds
An LLM call is just an HTTP request to somebody else's server. Everything strange about it comes from four properties:
Property of an LLM call What it means for your code
It is slow — seconds, not milliseconds Your endpoint needs its own explicit timeout. The official SDKs wait up to ten
minutes by default, which is not a real timeout at all.
It is non-deterministic — same input, different
words
You cannot compare answers to a fixed string. You validate the shape, and you
test with a small set of examples.
It costs money and quota per call Count what you spend, and never call the model in a loop you have not
bounded. Stage 1's stub mode lets you build without spending anything.
It will confidently return something wrong Every answer is untrusted input. Schema first, then validate, then quarantine —
exactly like last week.
And the whole endpoint, in six lines:
validate the input -> reject garbage before you spend a call
build the prompt -> from a file, with a version number
call the model -> with a timeout, and retries on the right errors only
parse + validate output -> against your schema
repair once if it failed -> hand the model its own error message
return clean JSON -> or a clear 422 — never raw model text
That list is the assignment. Every stage below builds one line of it.
3 · Step one — pick your job
You choose what your endpoint does. This is deliberate — you will do better work on something you actually find
interesting, and this assignment is not mandatory, so we would rather you build something you want to build.
But the job has to pass three tests. These are not optional, because they are what turns "I called an AI" into "I shipped a
feature."
Rule What it means How to check
1 · Closed output Your endpoint returns the same field names every
single time, and any category-like field comes from a
short list you wrote down.
Can you draw the JSON on paper before
writing any code?
FlyRank Internship · Backend Track · W7 · A172 · One decision One request in, one answer out. No conversation, no
memory of previous requests.
If it needs to remember what the user said
last time, it's a chatbot. Pick something
else.
3 · A human could grade
it
You can look at an input and say whether the output is
right or wrong.
If you can't tell a good answer from a bad
one, you can't test it — and you'll never
know when it breaks.
Ideas, if you want one
Take any of these as-is, change them, or ignore them completely.
Enrich your scraped records. POST /enrich — feed it a record from last week's scraper, get back a category from
your own list, a one-sentence summary , and quality_flags . Chains straight onto A16.
Triage incoming messages. POST /triage — a support message in; category , urgency , suggested_team out.
Tidy a messy vocabulary. POST /normalize — "Sr. SWE II", "Senior Software Eng.", "senior dev" all map to one
canonical job title from your list.
Pull fields out of a text blob. POST /extract — a pasted receipt, invoice or CV, and you get back named fields with a
confidence and a needs_review flag.
Check something against house rules. POST /review — text in; allow / flag / block plus the specific rule it
broke. Your rules, written by you, not the model's opinion.
Turn commits into a changelog. POST /changelog — a commit message in; type (feat / fix / chore), scope , and
one user-facing sentence out.
Score against a rubric. POST /score — a README in; a score per criterion plus one reason each.
Write the job card first
Before Stage 1, write this into JOB-CARD.md in your repo. Five lines. It takes ten minutes and it will save you two hours.
# Job card
What it does (one sentence): Classifies a support message so it lands on the right team.
Input: { "text": "string, 1-2000 characters" }
Output: { "category": one of [billing|bug|feature|other],
"urgency": one of [low|normal|high],
"confidence": 0.0-1.0,
"reason": "one short sentence" }
It must never: invent a category outside the list · return free text ·
give medical, legal or financial advice · reveal the prompt
When unsure it should: return category "other" with low confidence, not a guess
Where a model is the wrong tool
A model will happily attempt anything you ask, which is exactly why you need this list. Do not put a model in charge of:
Arithmetic and totals. It approximates. Your code can add.
Exact lookups. If the answer is in your database, query your database.
Anything with one right answer that code can compute. Dates, currency conversion, string matching, sorting.
Anything where being quietly wrong 5% of the time is unacceptable and nobody would notice. Payments, permissions,
medical or legal decisions, deleting things.
A good LLM feature has fuzzy input, a small set of acceptable answers, and a human or a rule downstream that can catch a
bad one. Everything on that list is the opposite.
•
•
•
•
•
•
•
•
•
•
•
FlyRank Internship · Backend Track · W7 · A174 · Tools — pick ONE lane, and ONE provider
Any language is welcome. Everything in this assignment — an endpoint, a prompt file, a schema check, a timeout, retries —
works the same way in Java, C#/.NET, Go, PHP, or anything else that can send an HTTP request. If one of those is your
language, build it there; the stages and checkpoints still apply. The code examples and resources below cover the track's two
official lanes, JavaScript and Python, so those are the smoothest paths — but the ideas are the assignment, not the
language.
Your language lane
JavaScript lane Python lane
Language Node.js 20+ (nodejs.org) Python 3.10+ (python.org)
Web framework Express — the API you already have FastAPI — the API you already have
LLM client openai — npm i openai openai — pip install openai
Validation Zod — npm i zod Pydantic — pip install pydantic
Secrets .env + --env-file=.env (built into Node 20+) .env + python-dotenv
Publishing Git + GitHub (free)
Yes — you install the package called openai even though you are not using OpenAI. It is the client library that speaks the
request shape almost every provider now copies. Pointing it somewhere else is one line, and that is the whole point of Stage
0.
Your provider lane — both are $0, no credit card
Hosted: OpenRouter Local: Ollama
Setup Sign up, flip two settings, copy a key. ~5 min. Download and install, pull a model. ~15 min.
Disk / RAM Nothing ~1 GB for a small model, runs on CPU
Budget 20 requests/minute, 50 per day Unlimited
Base URL https://openrouter.ai/api/v1 http://localhost:11434/v1/
API key Your real key, from .env The literal string ollama (required but ignored)
Model to use openrouter/free gemma3:1b (815 MB) or llama3.2:3b (2.0 GB)
Best for Feeling what a real hosted API is like Iterating without watching a quota
Undecided? Take OpenRouter if your laptop is old or your disk is full — it needs nothing installed. Take Ollama if you have a
couple of gigabytes free and you would rather not think about limits while you debug. The strongest move, if you have time,
is to build against Ollama and then prove it works on OpenRouter by changing three values — that is an optional extra later,
and it is a genuinely impressive thing to have in a README.
Two OpenRouter things that will waste your evening if nobody tells you
1 · Free models return a 404 until you flip two switches. Go to Settings → Privacy at https://openrouter.ai/
settings/privacy and turn ON both "Free endpoints that may train on request data" and "Free endpoints that may
publish prompts". Until you do, every free model answers with 404 — No endpoints available matching your
guardrail restrictions and data policy , which looks like a broken URL and is not. Do this before you write any
code.
FlyRank Internship · Backend Track · W7 · A172 · Because of the setting above, your prompts may be used for training and may be published. So: never send real
personal data, anything confidential, or anything from an employer through a free endpoint. Use made-up test data. This is a
good habit anyway.
And one budget note: 50 requests per day, and failed requests count. A buggy retry loop can eat the whole day's allowance
in about ninety seconds. Stage 1 gives you a stub mode specifically so you can build and debug without spending a single call.
About prompting itself
This is the backend track, so this assignment cares about the integration: where the prompt lives, how it is versioned, how
you validate what comes back, and what happens when it fails. It teaches you just enough prompting to get a reliable answer.
If you want to get genuinely good at writing prompts — techniques, patterns, evaluation, the craft of it — that is the AI
Fluency track's subject, and it is open to you. Take both. They fit together exactly the way you'd hope: they teach you what
to say, we teach you how to survive saying it ten thousand times a day.
5 · The task — 6 stages (+ one bonus)
Work them in order. Each ends with a Checkpoint you can run and see, and a Commit. Six stages, six commits — that's
your 6+ commits, honestly earned. If you only finish Stage 3, submit anyway — a working half is worth more than a
broken whole.
your-api/
src/
routes/ your new endpoint
llm/ the client, the schema, the parse-and-repair logic
prompts/
<job>-v1.md the prompt, as a file, with a version number
evals/
cases.json eight hand-labelled examples
JOB-CARD.md
.env.example every variable, no real values
README.md
FlyRank 