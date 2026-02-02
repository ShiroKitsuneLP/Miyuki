// Import necessary moduls
const path = require('path');

// Import Database SetupSchema
const { setupSchema } = require(path.join(__dirname, './database/schema/index'));

// Import Function to Start Miyuki
const { startMiyuki } = require(path.join(__dirname, './utils/client'));


// Start Bot
(async () => {
    try {
        await setupSchema();
        await startMiyuki();
    } catch (error) {
        console.error('[Miyuki] ', error);
        process.exit(1);
    }
})();