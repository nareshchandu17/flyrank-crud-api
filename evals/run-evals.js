require('dotenv').config({ path: '../.env' }); // Make sure we load the parent .env if needed
const { classifyTask } = require('../src/controllers/task.controller');
const cases = require('./cases.json');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function runEvals() {
    let matched = 0;
    const failed = [];

    console.log("Running evals against", process.env.LLM_MODEL);

    for (let i = 0; i < cases.length; i++) {
        const testCase = cases[i];
        const req = { body: testCase.input };
        let responseData = null;
        
        const res = {
            status: (code) => {
                return {
                    json: (data) => { responseData = data; },
                    send: (text) => { responseData = text; }
                };
            },
            json: (data) => { responseData = data; }
        };

        try {
            await classifyTask(req, res);
            
            if (responseData && responseData.category === testCase.expected.category) {
                matched++;
            } else {
                failed.push({
                    case: testCase.input.title,
                    expected: testCase.expected.category,
                    actual: responseData ? responseData.category : 'Error',
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

    const percentage = ((matched / cases.length) * 100).toFixed(1);
    console.log(`\n=== Eval Results ===`);
    console.log(`Matched: ${matched} out of ${cases.length} (${percentage}%)`);
    
    if (failed.length > 0) {
        console.log(`\nFailed cases:`);
        failed.forEach(f => {
            console.log(`- Title: "${f.case}"`);
            console.log(`  Expected: ${f.expected}`);
            console.log(`  Actual: ${f.actual}`);
            console.log(`  Response:`, f.rawResponse);
        });
    }
}

runEvals().catch(console.error);
