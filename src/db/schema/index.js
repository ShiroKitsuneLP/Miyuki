// Import individual schema setup functions
const { setupActionGIFSchema } = require('./actiongif.js');
const { setupTriviaSchema } = require('./trivia.js');
const { setupWelcomeSchema } = require('./welcome.js');


// Function to set up all database schemas
function setupSchema() {
    setupActionGIFSchema();
    setupTriviaSchema();
    setupWelcomeSchema();
}

module.exports = { setupSchema };