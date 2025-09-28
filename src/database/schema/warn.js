// Import necessary modules
const path = require('path');

// Import database connection
const { db } = require(path.join(__dirname, './../db'));

// Function to setup Warns table
function setupWarnSchema() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS warns (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guild_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            moderator_id TEXT NOT NULL,
            reason TEXT NOT NULL,
            timestamp INTEGER NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_warns_guild_user ON warns(guild_id, user_id);
    `);
    console.log('[Database] warns table ready');
}

module.exports = { setupWarnSchema }