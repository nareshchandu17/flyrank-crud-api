const data = {
    title: "Fix the login bug",
    description: "Users cannot log in when using Safari."
};

fetch('http://localhost:3000/tasks/classify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
})
.then(res => res.json())
.then(data => {
    console.log("POST Response:");
    console.log(data);
    if(data.jobId) {
        console.log("Polling status for 5 seconds...");
        const interval = setInterval(() => {
            fetch('http://localhost:3000/tasks/classify/' + data.jobId)
                .then(res => res.json())
                .then(status => {
                    console.log("Status:", status.status);
                    if(status.status === 'completed' || status.status === 'failed') {
                        console.log("Result:", status.result);
                        clearInterval(interval);
                    }
                })
        }, 1000);
    }
});
