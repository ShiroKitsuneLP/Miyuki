// Import individual schema setup functions
const { setupActionGIFSchema } = require('./actiongif.js');
const { setupLogChannelSchema } = require('./logchannel.js');
const { setupTriviaSchema } = require('./trivia.js');
const { setupWarnSchema } = require('./warn.js');
const { setupWelcomeSchema } = require('./welcome.js');

// Function to set up all database schemas
function setupSchema() {
    setupActionGIFSchema();
    setupLogChannelSchema();
    setupTriviaSchema();
    setupWarnSchema();
    setupWelcomeSchema();
}

module.exports = { setupSchema };