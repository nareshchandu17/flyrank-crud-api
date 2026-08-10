require('dotenv').config();
const { classifyTask } = require('./src/controllers/task.controller');

async function testEndpoint() {
    const req = {
        body: { title: "Test", description: "This is a test task for checkpoint validation." }
    };
    const res = {
        status: (code) => ({
            json: (data) => console.log(`[Status ${code}]`, JSON.stringify(data)),
            send: (text) => console.log(`[Status ${code}]`, text)
        })
    };

    console.log(`Running with LLM_ENABLED=${process.env.LLM_ENABLED}`);
    console.log(`Running with LLM_API_KEY=${process.env.LLM_API_KEY ? 'present (first 5: ' + process.env.LLM_API_KEY.slice(0, 5) + '...)' : 'missing'}`);
    
    await classifyTask(req, res);
}

testEndpoint().catch(console.error);
