// Import necessary modules
const path = require('path');

// Import database connection
const { db } = require(path.join(__dirname, './../db'));

// Function to setup Chat Filter table
function setupChatFilterSchema() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS chatfilter_badlinks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bad_link TEXT NOT NULL
        )
    `);

    db.exec(`
        CREATE TABLE IF NOT EXISTS chatfilter_nsfwlinks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nsfw_link TEXT NOT NULL
        )
    `);

    db.exec(`
        CREATE TABLE IF NOT EXISTS chatfilter_settings (
            guild_id TEXT NOT NULL PRIMARY KEY,
            bad_links_toggle INTEGER DEFAULT 0,
            nsfw_links_toggle INTEGER DEFAULT 0,
            auto_warn INTEGER DEFAULT 0
        )
    `);

    db.exec(`
        CREATE TABLE IF NOT EXISTS chatfilter_ignored_channels (
            guild_id TEXT NOT NULL,
            channel_id TEXT NOT NULL,
            PRIMARY KEY (guild_id, channel_id)
        )
    `);

    db.exec(`
        CREATE TABLE IF NOT EXISTS chatfilter_ignored_roles (
            guild_id TEXT NOT NULL,
            role_id TEXT NOT NULL,
            PRIMARY KEY (guild_id, role_id)
        )
    `);

    console.log('[Database] Chat Filter tables ready.');
}

module.exports = { setupChatFilterSchema }