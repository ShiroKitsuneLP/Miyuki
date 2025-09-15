// Import the warn repository
const { warn } = require('../db/repo');

// Warn-Cleanup Utility
function removeOldWarns() {
    const cutoff = Date.now() - 180 * 24 * 60 * 60 * 1000;
    const removed = warn.clearOld(cutoff);
    if (removed > 0) {
        console.log(`[WARN] Removed ${removed} old warnings.`);
    }
}

// Function to start the cleanup
function startWarnCleanup() {
    console.log('[WARN] Starting daily warn cleanup task.');
    removeOldWarns();
    setInterval(removeOldWarns, 24 * 60 * 60 * 1000);
}

module.exports = { startWarnCleanup };
