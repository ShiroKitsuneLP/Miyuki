// Import necessary modules
const path = require('path');

// Import schema setup functions
const { setupActionGifSchema } = require(path.join(__dirname, './actiongif'));

// Function to setup database schema
function setupSchema() {
    setupActionGifSchema();
}

module.exports = { setupSchema }