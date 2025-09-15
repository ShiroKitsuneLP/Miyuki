// Import the database connection
const db = require('../database');

// Prepare statements for get a guild's log channel
const getLogChannel = db.prepare('SELECT channel_id FROM logchannels WHERE guild_id = ?');

// Prepare statements for set a guild's log channel
const setLogChannel = db.prepare(`
    INSERT INTO logchannels (guild_id, channel_id)
    VALUES (@guild_id, @channel_id)
    ON CONFLICT(guild_id) DO UPDATE SET channel_id = excluded.channel_id
`);

// Prepare statements for delete a guild's log channel
const clearLogChannel = db.prepare('DELETE FROM logchannels WHERE guild_id = ?');

module.exports = {

    // Get the log channel ID for a guild
    get(guildId) {
        const row = getLogChannel.get(guildId);
        return row ? row.channel_id : null;
    },

    // Set the log channel ID for a guild
    set(guildId, channelId) {
        setLogChannel.run({ guild_id: guildId, channel_id: channelId });
    },

    // Delete the log channel for a guild
    clear(guildId) {
        clearLogChannel.run(guildId);
    }
};
