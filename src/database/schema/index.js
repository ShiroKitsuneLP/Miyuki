// Import necessary modules
const path = require('path');

// Import schema setup functions
const { setupActionGifSchema } = require(path.join(__dirname, './actionGif'));
const { setupChatFilterSchema } = require(path.join(__dirname, './chatFilter'));
const { setupWarnSchema } = require(path.join(__dirname, './warn'));

// Function to setup database schema
function setupSchema() {
    setupActionGifSchema();
    setupChatFilterSchema();
    setupWarnSchema();
}

module.exports = { setupSchema }