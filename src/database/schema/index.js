// Import necessary modules
const path = require('path');

// Import schema setup functions
const { setupActionGifSchema } = require(path.join(__dirname, './actiongif'));
const { setupWarnSchema } = require(path.join(__dirname, './warn'));

// Function to setup database schema
function setupSchema() {
    setupActionGifSchema();
    setupWarnSchema();
}

module.exports = { setupSchema }