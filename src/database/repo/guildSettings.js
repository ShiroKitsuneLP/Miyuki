// Import necessary modules
const path = require('path');

// Import database connection
const { db } = require(path.join(__dirname, './../db'));

// Prepare statements
const addGuildIdStmt = db.prepare(`
    INSERT OR IGNORE INTO guild_settings (guild_id)
    VALUES (@guild_id);
`);

const setLogChannelStmt = db.prepare(`
    UPDATE guild_settings
    SET log_channel_id = @log_channel_id
    WHERE guild_id = @guild_id;
`);

const getLogChannelStmt = db.prepare(`
    SELECT log_channel_id
    FROM guild_settings
    WHERE guild_id = @guild_id;
`);

const removeGuildStmt = db.prepare(`
    DELETE FROM guild_settings
    WHERE guild_id = @guild_id;
`);

// Function to add a guild to the settings table
function addGuild(guildId) {
    addGuildIdStmt.run({ guild_id: guildId });
}

// Function to set the log channel for a guild
function setLogChannel(guildId, channelId) {
    setLogChannelStmt.run({ guild_id: guildId, log_channel_id: channelId });
}

// Function to get the log channel for a guild
function getLogChannel(guildId) {
    const row = getLogChannelStmt.get({ guild_id: guildId });
    return row ? row.log_channel_id : null;
}

// Function to remove a guild from the settings table
function removeGuild(guildId) {
    removeGuildStmt.run({ guild_id: guildId });
}

module.exports = {
    addGuild,
    setLogChannel,
    getLogChannel,
    removeGuild
};