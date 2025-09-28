// Import necessary modules
const path = require('path');

// Import Scheduler tasks
const { startWarnCleanup } = require(path.join(__dirname, './warnCleanUp'));

// Start Scheduler tasks
function startSchedulers() {
    startWarnCleanup();
}

module.exports = { startSchedulers }