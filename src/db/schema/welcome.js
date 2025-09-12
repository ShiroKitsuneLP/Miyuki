// Import the database connection
const db = require('./../database.js');

// Function to set up the welcome_messages table
function setupWelcomeSchema() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS welcome_messages (
            guild_id TEXT PRIMARY KEY,
            enabled INTEGER NOT NULL DEFAULT 0,
            channel_id TEXT,
            mode TEXT NOT NULL DEFAULT 'text', -- 'text' | 'embed'

            -- text
            text_content TEXT,

            -- embed
            embed_title TEXT,
            embed_description TEXT,
            embed_color TEXT,
            embed_thumbnail_url TEXT,
            embed_image_url TEXT,
            embed_footer TEXT,
            embed_timestamp INTEGER NOT NULL DEFAULT 0,

            -- extra
            ping_user INTEGER NOT NULL DEFAULT 0
        );
    `);
    console.log('[DB] welcome_messages table ready');
}

module.exports = { setupWelcomeSchema };