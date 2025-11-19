// Import necessary discord.js modules
const { Events } = require('discord.js');

// Import necessary modules
const path = require('path');

// Import error handler
const { errorHandler } = require(path.join(__dirname, './../../utils/errorHandler'));

// Import reaction role database repo
const { reactionRole } = require(path.join(__dirname, "./../../database/repo"));

module.exports = {
    name: Events.MessageReactionAdd,
    once: false,
    async execute(reaction, user) {

        // Ignore bot reactions
        if (user.bot) return;

        const msg = reaction.message;
        const guild = msg.guild;

        if (!guild) return;

        try {
            // Check if message is a reaction role message
            const rrMsg = await reactionRole.getMessageById(guild.id, msg.id);
            if (!rrMsg) return;

            let emojiKey;
            if (reaction.emoji.id) {
                emojiKey = reaction.emoji.id; // Custom emoji
            } else {
                emojiKey = reaction.emoji.name; // Unicode emoji
            }

            // Get the role for the reacted emoji
            const roleEntry = await reactionRole.getReactionRoleByEmoji(guild.id, msg.id, emojiKey);
            const roleId = roleEntry?.role_id;
            if (!roleId) return;

            // Add role to the user
            const member = await guild.members.fetch(user.id).catch(() => null);
            if (!member) return;

            await member.roles.add(roleId);
        } catch (error) {
            // Log error in database
            errorHandler(error, {
                context: 'Event',
                file: 'reactionRoleAdd'
            });
        }
    }
}