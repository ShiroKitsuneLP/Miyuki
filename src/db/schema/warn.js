// Import the database connection
const db = require('./../database.js');

// Function to set up the warns table
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
    console.log('[DB] warns table ready');
}

module.exports = { setupWarnSchema };
