// Import schema setup functions
const { setupActionGifSchema } = require('./actionGif');
const { setupErrorLogSchema } = require('./errorLog');

// Function to setup database schema
async function setupSchema() {
    await setupActionGifSchema();
    await setupErrorLogSchema();
}

module.exports = { setupSchema }