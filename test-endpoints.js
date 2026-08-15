const http = require('http');

function postRequest(path, data) {
    const dataStr = JSON.stringify(data);
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(dataStr)
        }
    };

    return new Promise((resolve, reject) => {
        const req = http.request(options, res => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body }));
        });
        req.on('error', e => reject(e));
        req.write(dataStr);
        req.end();
    });
}

async function runTests() {
    console.log('--- Testing Gemini Classification ---');
    try {
        const res1 = await postRequest('/tasks/classify', {
            title: "Fix the login bug",
            description: "Users cannot log in when using Safari."
        });
        console.log('Status:', res1.status);
        console.log('Body:', res1.body);
    } catch (e) { console.error(e); }

    console.log('\n--- Testing Supabase Auth Signup ---');
    try {
        const res2 = await postRequest('/auth/signup', {
            email: `test_${Date.now()}@example.com`,
            password: "password123"
        });
        console.log('Status:', res2.status);
        console.log('Body:', res2.body);
    } catch (e) { console.error(e); }
}

runTests();
