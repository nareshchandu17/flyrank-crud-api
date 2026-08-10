const openaiProvider = require("./providers/openai");
const mockProvider = require("./providers/mock");

function getProvider() {
    // Determine which provider to use. 
    // If LLM_STUB=1, we use the mock provider. 
    // We could extend this to check LLM_PROVIDER=anthropic, etc.
    if (process.env.LLM_STUB === "1") {
        return mockProvider;
    }
    return openaiProvider;
}

module.exports = {
    /**
     * @param {string} systemPrompt 
     * @param {string} userContent 
     * @param {string} model 
     * @param {string} [assistantOutput] 
     * @param {string} [repairPrompt] 
     */
    async complete(systemPrompt, userContent, model, assistantOutput, repairPrompt) {
        return await getProvider().complete(systemPrompt, userContent, model, assistantOutput, repairPrompt);
    },
    
    isTimeoutError(error) {
        return getProvider().isTimeoutError(error);
    }
};
