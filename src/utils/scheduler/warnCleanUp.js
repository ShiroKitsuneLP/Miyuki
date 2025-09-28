// Import necessary modules
const path = require('path');

// Import warn database repo
const { warn } = require(path.join(__dirname, './../../database/repo'));

// Function to delete warnings older than 180 days
function clearOldWarns() {
    const cutoff = Date.now() - 180 * 24 * 60 * 60 * 1000;
    const deletedCount = warn.deleteWarnsOlderThan(cutoff);
    if (deletedCount > 0) {
        console.log(`[Warn-Cleanup] Deleted ${deletedCount} old warnings.`);
    }
}

// Function to start the cleanup task
function startWarnCleanup() {
    console.log('[Warn-Cleanup] Starting daily warn cleanup task.');
    clearOldWarns();
    setInterval(clearOldWarns, 24 * 60 * 60 * 1000);
}

module.exports = { startWarnCleanup }