// Import the database connection
const db = require('./../database.js');

// Function to set up the logchannel table
function setupLogChannelSchema() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS logchannels (
            guild_id TEXT PRIMARY KEY,
            channel_id TEXT NOT NULL
        );
    `);
    console.log('[DB] logchannels table ready');
}

module.exports = { setupLogChannelSchema };
