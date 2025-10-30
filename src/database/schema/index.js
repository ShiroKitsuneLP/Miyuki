// Import necessary modules
const path = require('path');

// Import schema setup functions
const { setupActionGifSchema } = require(path.join(__dirname, './actionGif'));
const { setupErrorLogSchema } = require(path.join(__dirname, './errorLog'));
const { setupGuildSettingsSchema } = require(path.join(__dirname, './guildSettings'));
const { setupWarnSchema } = require(path.join(__dirname, './warn'));

// Function to setup database schema
function setupSchema() {
    setupActionGifSchema();
    setupErrorLogSchema();
    setupGuildSettingsSchema();
    setupWarnSchema();
}

module.exports = { setupSchema }