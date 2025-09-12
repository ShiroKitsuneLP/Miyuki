// Import individual schema setup functions
const { setupWelcomeSchema } = require('./welcome.js');

// Function to set up all database schemas
function setupSchema() {
    setupWelcomeSchema();
}

module.exports = { setupSchema };