'use strict';
const http = require('http');
const { Worker } = require('worker_threads');

const workerPoolConfig = {
    size: 4, // Start a pool of four workers
    task: './worker.js'
}

const workerPool = [];
const waiting = [];

function fillWorkerPool() {
    while (workerPool.length < workerPoolConfig.size) {
        workerPool.push(new Worker(workerPoolConfig.task))
    }
}

fillWorkerPool();

var server = http.createServer((req, res) => {
    let body = '';
    req.setEncoding('utf8');  // Receive strings rather than binary data
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
        let data;
        try {
            data = JSON.parse(body);
        } catch (err) {
            res.writeHead(400);
            res.end(`Failed to parse body: ${err}`);
            return;
        }

        res.writeHead(200, {
            'Content-Type': 'application/json'
        });

        if (workerPool.length > 0) {
            handleRequest(res, data, workerPool.shift());
        } else {
            waiting.push((worker) => handleRequest(res, data, worker));
        }
    });
});

server.listen(1337, () => {
    console.log("Server is running in port 1337")
});

function handleRequest(res, data, worker) {
    //Send message to worker
    worker.postMessage(data);
    //Listen message from worker
    worker.once('message', (solutionData) => {
        res.end(solutionData);
        //Check the waiting queue
        if (waiting.length > 0)
            //Shift from waiting queue
            waiting.shift()(worker);
        else
            // Put the Worker back in the queue.
            workerPool.push(worker);
    });
    worker.on('error', (error) => {
        workerPool.push(new Worker(workerPoolConfig.task))
        console.log(error);
    });
    worker.on('exit', (code) => {
        workerPool.push(new Worker(workerPoolConfig.task))
        if (code !== 0) {
            new Error(`Worker stopped with exit code ${code}`);
        }
    });
}