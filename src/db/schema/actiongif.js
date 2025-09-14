// Import the database connection
const db = require('./../database.js');

// Function to set up the action_gifs table
function setupActionGIFSchema() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS action_gifs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            action TEXT NOT NULL,
            url TEXT NOT NULL
        );

        CREATE UNIQUE INDEX IF NOT EXISTS idx_action_url ON action_gifs(action, url);
    `);
    console.log('[DB] action_gifs table ready');
}

module.exports = { setupActionGIFSchema }