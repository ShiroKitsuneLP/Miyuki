// Import necessary modules
const path = require('path');

// Import database connection
const { db } = require(path.resolve(__dirname, '../db'));

// Function to setup Error Logs table
async function setupActionGifSchema() {
    await db.query(`
        CREATE TABLE IF NOT EXISTS action_gifs (
            id serial PRIMARY KEY,
            action text NOT NULL,
            url text NOT NULL
        );

        CREATE UNIQUE INDEX IF NOT EXISTS idx_action_url ON action_gifs(action, url);
    `);

    console.log('[Database] Action GIFs table ready');
}

module.exports = { setupActionGifSchema }