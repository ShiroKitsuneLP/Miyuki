// Import necessary modules
const path = require('path');

// Import database connection
const { db } = require(path.join(__dirname, './../db'));

// Function to setup Action GIFs table
function setupActionGifSchema() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS action_gifs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            action TEXT NOT NULL,
            url TEXT NOT NULL
        );

        CREATE UNIQUE INDEX IF NOT EXISTS idx_action_url ON action_gifs(action, url);
    `);

    console.log('[Database] Action GIFs table ready.');
}

module.exports = { setupActionGifSchema }