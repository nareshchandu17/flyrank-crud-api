class MockProvider {
    /**
     * @param {string} systemPrompt 
     * @param {string} userContent 
     * @param {string} model 
     * @param {string} [assistantOutput] Optional previous assistant output for repair attempts
     * @param {string} [repairPrompt] Optional user prompt for repair attempts
     */
    async complete(systemPrompt, userContent, model, assistantOutput, repairPrompt) {
        // Return a mock schema-valid response
        return {
            raw_output: JSON.stringify({
                category: "development",
                urgency: "normal",
                effort: "medium",
                confidence: 0.95
            }),
            input_tokens: 100,
            output_tokens: 40
        };
    }

    isTimeoutError(error) {
        return false;
    }
}

module.exports = new MockProvider();
