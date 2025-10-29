// Import necessary modules
const path = require('path');

// Import database connection
const { db } = require(path.join(__dirname, './../db'));

// Prepare statements
const insertWarnStmt = db.prepare(`
    INSERT INTO warns (guild_id, user_id, moderator_id, reason, timestamp) 
    VALUES (@guild_id, @user_id, @moderator_id, @reason, @timestamp);
`);

const getWarnsStmt = db.prepare(`
    SELECT * FROM warns 
    WHERE guild_id = @guild_id AND user_id = @user_id 
    ORDER BY timestamp DESC;
`);

const getWarnByIdStmt = db.prepare(`
    SELECT * FROM warns 
    WHERE id = @id;
`);

const getWarnCountsForGuildStmt = db.prepare(`
    SELECT user_id, COUNT(*) as count
    FROM warns
    WHERE guild_id = @guild_id
    GROUP BY user_id;
`);

const countWarnsStmt = db.prepare(`
    SELECT COUNT(*) as count 
    FROM warns 
    WHERE guild_id = @guild_id AND user_id = @user_id;
`);

const clearWarnsByUserStmt = db.prepare(`
    DELETE FROM warns 
    WHERE guild_id = @guild_id AND user_id = @user_id;
`);

const deleteWarnByIdStmt = db.prepare(`
    DELETE FROM warns 
    WHERE id = @id;
`);

const deleteWarnsOlderThanStmt = db.prepare(`
    DELETE FROM warns 
    WHERE timestamp < @timestamp;
`);

// Function to add a new warning
function addWarn(guildId, userId, moderatorId, reason) {
    insertWarnStmt.run({
        guild_id: guildId,
        user_id: userId,
        moderator_id: moderatorId,
        reason: reason,
        timestamp: Date.now()
    });
}

// Function to get all warnings for a user in a guild
function getWarns(guildId, userId) {
    return getWarnsStmt.all({
        guild_id: guildId,
        user_id: userId
    });
}

// Function to get a warning by its ID
function getWarnById(id) {
    return getWarnByIdStmt.get({ id });
}

// Function to get all warned users and their warn count for a guild
function getWarnCountsForGuild(guildId) {
    return getWarnCountsForGuildStmt.all({ guild_id: guildId });
}

// Function to get the count of warnings for a user in a guild
function countWarns(guildId, userId) {
    const row = countWarnsStmt.get({
        guild_id: guildId,
        user_id: userId
    });
    
    return row ? row.count : 0;
}

// Function to delete all warnings for a user in a guild
function clearWarnsByUser(guildId, userId) {
    const info = clearWarnsByUserStmt.run({
        guild_id: guildId,
        user_id: userId
    });

    return info.changes;
}

// Function to delete a warning by its ID
function deleteWarnById(id) {
    const info = deleteWarnByIdStmt.run({ id });
    return info.changes;
}

// Function to delete warnings older than a certain timestamp
function deleteWarnsOlderThan(timestamp) {
    deleteWarnsOlderThanStmt.run({ timestamp });
}

module.exports = {
    addWarn,
    getWarns,
    getWarnById,
    countWarns,
    clearWarnsByUser,
    deleteWarnById,
    deleteWarnsOlderThan,
    getWarnCountsForGuild
}