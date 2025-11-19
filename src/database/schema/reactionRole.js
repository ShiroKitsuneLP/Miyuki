// Import necessary modules
const path = require('path');

// Import database connection
const { db } = require(path.join(__dirname, './../db'));

// Function to setup Reaction Role table
function setupReactionRoleSchema() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS reaction_roles_messages (
            guild_id TEXT NOT NULL,
            channel_id TEXT NOT NULL,
            message_id TEXT NOT NULL,
            name TEXT NOT NULL,
            show_role_list INTEGER DEFAULT 1,
            PRIMARY KEY (guild_id, message_id),
            UNIQUE (guild_id, name)
        );
    `);

    db.exec(`
        CREATE TABLE IF NOT EXISTS reaction_roles (
            guild_id TEXT NOT NULL,
            message_id TEXT NOT NULL,
            role_id TEXT NOT NULL,
            emoji TEXT NOT NULL,
            PRIMARY KEY (guild_id, message_id, role_id, emoji)
        );
    `);

    console.log('[Database] reaction_roles tables ready');
}

module.exports = { setupReactionRoleSchema }