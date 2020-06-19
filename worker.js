'use strict';
const { parentPort } = require('worker_threads');
const simplePoW = require('./simplePoW.js');

// parentPort is the Worker’s way of communicating with the parent
parentPort.on('message', (data) => {
    const solution = simplePoW(data.input);
    parentPort.postMessage(solution);
});
