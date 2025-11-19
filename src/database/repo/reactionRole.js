// Import necessary modules
const path = require('path');

// Import database connection
const { db } = require(path.join(__dirname, './../db'));

// Prepare Statements
const insertReactionRoleMessageStmt = db.prepare(`
    INSERT INTO reaction_roles_messages (guild_id, channel_id, message_id, name, show_role_list) 
    VALUES (@guild_id, @channel_id, @message_id, @name, @show_role_list)
    ON CONFLICT(guild_id, message_id) DO UPDATE SET
        channel_id = excluded.channel_id,
        name = excluded.name,
        show_role_list = excluded.show_role_list;
`);

const getReactionRoleMessageByIdStmt = db.prepare(`
    SELECT * FROM reaction_roles_messages 
    WHERE guild_id = @guild_id AND message_id = @message_id;
`);

const getReactionRoleMessageByNameStmt = db.prepare(`
    SELECT * FROM reaction_roles_messages 
    WHERE guild_id = @guild_id AND name = @name;
`);

const getAllReactionRoleMessagesByGuildStmt = db.prepare(`
    SELECT * FROM reaction_roles_messages 
    WHERE guild_id = @guild_id;
`);

const getAllReactionRoleMessagesStmt = db.prepare(`
    SELECT * FROM reaction_roles_messages;
`);

const listReactionRolesMessagesStmt = db.prepare(`
    UPDATE reaction_roles_messages 
    SET show_role_list = @show_role_list
    WHERE guild_id = @guild_id AND message_id = @message_id;
`);

const deleteReactionRoleMessageStmt = db.prepare(`
    DELETE FROM reaction_roles_messages 
    WHERE guild_id = @guild_id AND message_id = @message_id;
`);

const insertReactionRoleStmt = db.prepare(`
    INSERT INTO reaction_roles (guild_id, message_id, role_id, emoji) 
    VALUES (@guild_id, @message_id, @role_id, @emoji)
    ON CONFLICT(guild_id, message_id, role_id, emoji) DO UPDATE SET
        role_id = excluded.role_id,
        emoji = excluded.emoji;
`);

const getReactionRolesByMessageIdStmt = db.prepare(`
    SELECT * FROM reaction_roles 
    WHERE guild_id = @guild_id AND message_id = @message_id;
`);

const getReactionRoleByEmojiStmt = db.prepare(`
    SELECT * FROM reaction_roles 
    WHERE guild_id = @guild_id AND message_id = @message_id AND emoji = @emoji;
`);

const deleteReactionRoleStmt = db.prepare(`
    DELETE FROM reaction_roles 
    WHERE guild_id = @guild_id AND message_id = @message_id AND role_id = @role_id;
`);

const deleteReactionRolesByMessageIdStmt = db.prepare(`
    DELETE FROM reaction_roles 
    WHERE guild_id = @guild_id AND message_id = @message_id;
`);

// Function to create a reaction role message entry
function createMessage(guildId, channelId, messageId, name, showRoleList = 1) {
    insertReactionRoleMessageStmt.run({
        guild_id: guildId,
        channel_id: channelId,
        message_id: messageId,
        name: name,
        show_role_list: showRoleList
    });
}

// Function to get a reaction role message by ID
function getMessageById(guildId, messageId) {
    return getReactionRoleMessageByIdStmt.get({
        guild_id: guildId,
        message_id: messageId
    });
}

// Function to get a reaction role message by name
function getMessageByName(guildId, name) {
    return getReactionRoleMessageByNameStmt.get({
        guild_id: guildId,
        name: name
    });
}

// Function to get all reaction role messages for a guild
function getAllMessagesByGuild(guildId) {
    return getAllReactionRoleMessagesByGuildStmt.all({
        guild_id: guildId
    });
}

// Function to get all reaction role messages
function getAllReactionRoleMessages() {
    return getAllReactionRoleMessagesStmt.all();
}

// Function to update show_role_list for a reaction role message
function updateShowRoleList(guildId, messageId, showRoleList) {
    listReactionRolesMessagesStmt.run({
        guild_id: guildId,
        message_id: messageId,
        show_role_list: showRoleList ? 1 : 0
    });
}

// Function to delete a reaction role message
function deleteMessage(guildId, messageId) {
    deleteReactionRoleMessageStmt.run({
        guild_id: guildId,
        message_id: messageId
    });

    deleteReactionRolesByMessageIdStmt.run({
        guild_id: guildId,
        message_id: messageId
    });
}

// Function to add a reaction role to a message
function addReactionRole(guildId, messageId, roleId, emoji) {
    insertReactionRoleStmt.run({
        guild_id: guildId,
        message_id: messageId,
        role_id: roleId,
        emoji: emoji
    });
}

// Function to get all reaction roles for a message
function getReactionRolesByMessageId(guildId, messageId) {
    return getReactionRolesByMessageIdStmt.all({
        guild_id: guildId,
        message_id: messageId
    });
}

// Function to get a reaction role by emoji
function getReactionRoleByEmoji(guildId, messageId, emoji) {
    return getReactionRoleByEmojiStmt.get({
        guild_id: guildId,
        message_id: messageId,
        emoji: emoji
    });
}

// Function to delete a reaction role from a message
function deleteReactionRole(guildId, messageId, roleId) {
    deleteReactionRoleStmt.run({
        guild_id: guildId,
        message_id: messageId,
        role_id: roleId
    });
}

module.exports = {
    createMessage,
    getMessageById,
    getMessageByName,
    getAllMessagesByGuild,
    getAllReactionRoleMessages,
    updateShowRoleList,
    deleteMessage,
    addReactionRole,
    getReactionRolesByMessageId,
    getReactionRoleByEmoji,
    deleteReactionRole
}