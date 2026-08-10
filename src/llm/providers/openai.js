const OpenAI = require("openai");

const client = new OpenAI({
  baseURL: process.env.LLM_BASE_URL,
  apiKey: process.env.LLM_API_KEY,
  timeout: 30000,
  maxRetries: 0,
});

async function callLlmWithRetry(params) {
    const maxAttempts = 4; // Initial + 3 retries (1s, 2s, 4s)
    const baseDelays = [1000, 2000, 4000];

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            return await client.chat.completions.create(params);
        } catch (error) {
            const status = error.status;
            
            // Never retry on client errors 400, 401, 403
            if (status === 400 || status === 401 || status === 403) {
                throw error;
            }

            // Retry on timeout (no status or 408), 429, and 5xx
            const isTimeout = error instanceof OpenAI.APIConnectionTimeoutError || status === 408;
            const isRateLimit = status === 429;
            const isServerError = status >= 500 && status < 600;

            if (!isTimeout && !isRateLimit && !isServerError) {
                throw error; // Some other error, don't retry
            }

            if (attempt === maxAttempts - 1) {
                throw error; // Out of retries
            }

            let delay = baseDelays[attempt] + Math.random() * 500; // jitter

            if (isRateLimit && error.headers && error.headers['retry-after']) {
                const retryAfter = error.headers['retry-after'];
                if (!isNaN(retryAfter)) {
                    delay = parseInt(retryAfter) * 1000;
                } else {
                    const date = new Date(retryAfter);
                    if (!isNaN(date.getTime())) {
                        delay = Math.max(0, date.getTime() - Date.now());
                    }
                }
            }

            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

class OpenAIProvider {
    /**
     * @param {string} systemPrompt 
     * @param {string} userContent 
     * @param {string} model 
     * @param {string} [assistantOutput] Optional previous assistant output for repair attempts
     * @param {string} [repairPrompt] Optional user prompt for repair attempts
     */
    async complete(systemPrompt, userContent, model, assistantOutput, repairPrompt) {
        const messages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent }
        ];

        if (assistantOutput && repairPrompt) {
            messages.push({ role: "assistant", content: assistantOutput });
            messages.push({ role: "user", content: repairPrompt });
        }

        const completion = await callLlmWithRetry({
            model: model,
            temperature: 0.1,
            messages: messages,
        });

        return {
            raw_output: completion.choices[0].message.content,
            input_tokens: completion.usage?.prompt_tokens || 0,
            output_tokens: completion.usage?.completion_tokens || 0
        };
    }
    
    isTimeoutError(error) {
        return error instanceof OpenAI.APIConnectionTimeoutError;
    }
}

module.exports = new OpenAIProvider();
