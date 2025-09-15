// Import the database connection
const db = require('./../database.js');

// Prepared statement to insert a new warning
const addWarn = db.prepare(`
    INSERT INTO warns (guild_id, user_id, moderator_id, reason, timestamp)
    VALUES (@guild_id, @user_id, @moderator_id, @reason, @timestamp)
`);

// Prepared statement to get all warnings for a user in a guild
const getWarns = db.prepare(`
    SELECT * FROM warns WHERE guild_id = ? AND user_id = ? ORDER BY timestamp DESC
`);

// Prepared statement to get the count of warnings for a user in a guild
const countWarns = db.prepare(`
    SELECT COUNT(*) as count FROM warns WHERE guild_id = ? AND user_id = ?
`);

// Prepared statement to delete all warnings for a user in a guild
const deleteWarnsByUser = db.prepare(`
    DELETE FROM warns WHERE guild_id = ? AND user_id = ?
`);

const deleteWarnById = db.prepare(`
    DELETE FROM warns WHERE id = ?
`);

// Prepared statement to delete warnings older than a certain timestamp
const deleteWarnsOlderThan = db.prepare(`
    DELETE FROM warns WHERE timestamp < ?
`);

// Prepared statement to get all warned users and their warn count for a guild
const getWarnCountsForGuild = db.prepare(`
    SELECT user_id, COUNT(*) as count
    FROM warns
    WHERE guild_id = ?
    GROUP BY user_id
    ORDER BY count DESC
`);

module.exports = {
    
    // Add a new warning
    add(guildId, userId, moderatorId, reason) {
        addWarn.run({
            guild_id: guildId,
            user_id: userId,
            moderator_id: moderatorId,
            reason,
            timestamp: Date.now()
        });
    },

    // Get all warnings for a user in a guild
    getAll(guildId, userId) {
        return getWarns.all(guildId, userId);
    },

    // Get warn count for a user in a guild
    getCount(guildId, userId) {
        return countWarns.get(guildId, userId).count;
    },

    // Delete all warnings for a user in a guild
    clearUser(guildId, userId) {
        return deleteWarnsByUser.run(guildId, userId).changes;
    },

    // Delete a warning by its ID
    deleteById(warnId) {
        return deleteWarnById.run(warnId).changes;
    },

    // Delete warnings older than a timestamp
    clearOld(cutoffTimestamp) {
        return deleteWarnsOlderThan.run(cutoffTimestamp).changes;
    },

    // Get all warned users and their warn count for a guild
    getWarnCountsForGuild(guildId) {
        return getWarnCountsForGuild.all(guildId);
    }
};