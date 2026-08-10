const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { classifyTask } = require('../src/controllers/task.controller');
const cases = require('./cases.json');

async function evaluateSuite(suiteName, suiteCases) {
    let matched = 0;
    const failed = [];

    for (let i = 0; i < suiteCases.length; i++) {
        const testCase = suiteCases[i];
        const req = { body: testCase.input };
        let responseData = null;
        let responseStatus = 200;
        
        const res = {
            status: (code) => {
                responseStatus = code;
                return {
                    json: (data) => { responseData = data; },
                    send: (text) => { responseData = text; }
                };
            },
            json: (data) => { responseData = data; }
        };

        try {
            await classifyTask(req, res);
            
            // For attacks and hard ambiguous cases, we expect 'other'
            // In a real app, maybe attacks should be caught before the LLM, 
            // but here we evaluate the LLM's resistance.
            if (responseData && responseData.category === testCase.expected.category) {
                // If it expects "other", it should ideally have low confidence, but we'll stick to matching the category key
                matched++;
            } else {
                failed.push({
                    case: testCase.input.title,
                    expected: testCase.expected.category,
                    actual: responseData ? responseData.category : `Error (Status ${responseStatus})`,
                    rawResponse: responseData
                });
            }
        } catch (err) {
            failed.push({
                case: testCase.input.title,
                expected: testCase.expected.category,
                actual: 'Exception',
                rawResponse: err.message
            });
        }
        
        // Add a small delay to avoid rate limiting during testing
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    const percentage = ((matched / suiteCases.length) * 100).toFixed(1);
    console.log(`\n=== Suite: ${suiteName.toUpperCase()} ===`);
    console.log(`Matched: ${matched} out of ${suiteCases.length} (${percentage}%)`);
    
    if (failed.length > 0) {
        console.log(`Failed cases in ${suiteName}:`);
        failed.forEach(f => {
            console.log(`  - Title: "${f.case}" | Expected: ${f.expected} | Actual: ${f.actual}`);
        });
    }

    return { matched, total: suiteCases.length };
}

async function runEvals() {
    console.log("Running evals against", process.env.LLM_MODEL || "mock provider");
    console.log("Using LLM_STUB =", process.env.LLM_STUB);

    const suites = ['easy', 'hard', 'attacks'];
    let totalMatched = 0;
    let totalCases = 0;

    for (const suite of suites) {
        if (cases[suite]) {
            const result = await evaluateSuite(suite, cases[suite]);
            totalMatched += result.matched;
            totalCases += result.total;
        }
    }

    console.log(`\n=== FINAL RESULTS ===`);
    const finalPercentage = ((totalMatched / totalCases) * 100).toFixed(1);
    console.log(`Overall: ${totalMatched} out of ${totalCases} (${finalPercentage}%)`);
}

runEvals().catch(console.error);
