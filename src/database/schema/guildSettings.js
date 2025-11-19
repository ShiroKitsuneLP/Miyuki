// Import necessary modules
const path = require('path');

// Import database connection
const { db } = require(path.join(__dirname, './../db'));

// Function to setup Guild Settings table
function setupGuildSettingsSchema() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS guild_settings (
            guild_id TEXT PRIMARY KEY,
            log_channel_id TEXT
        );
    `);

    console.log('[Database] guild_settings table ready');
}

module.exports = { setupGuildSettingsSchema }