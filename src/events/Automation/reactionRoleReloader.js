// Import necessary discord.js modules
const { Events } = require('discord.js');

// Import necessary modules
const path = require('path');

// Import error handler
const { errorHandler } = require(path.join(__dirname, './../../utils/errorHandler'));

// Import reaction role database repo
const { reactionRole } = require(path.join(__dirname, "./../../database/repo"));

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(miyuki) {

        try {

            // Reload all reaction role messages into cache
            await reactionRole.getAllReactionRoleMessages();

            for (const rrMsg of reactionRole.getAllReactionRoleMessages()) {
                const channel = miyuki.channels.cache.get(rrMsg.channel_id);

                if(channel) {
                    channel.messages.fetch(rrMsg.message_id).catch(() => null);
                }
            }

        } catch (error) {

            // Log error in database
            errorHandler(error, {
                context: 'Event',
                file: 'reactionRoleReloader'
            });
        }
    }
}