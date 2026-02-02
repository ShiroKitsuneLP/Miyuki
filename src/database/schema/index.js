// Import necessary modules
const path = require('path');

// Import schema setup functions
const { setupErrorLogSchema } = require(path.join(__dirname, './errorLog'));

// Function to setup database schema
async function setupSchema() {
    await setupErrorLogSchema();
}

module.exports = { setupSchema }