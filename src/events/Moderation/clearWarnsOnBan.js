// Import necessary discord.js modules
const { Events } = require('discord.js');
const { once } = require('events');

// Import necessary modules
const path = require('path');

// Import error handler
const { errorHandler } = require(path.join(__dirname, './../../utils/errorHandler'));

// Import warn database repo
const { warn } = require(path.join(__dirname, './../../database/repo'));

module.exports = {
    name: Events.GuildBanAdd,
    once: false,
    async execute(ban, miyuki) {

        // Clear warns for the banned user
        try {

            await warn.clearWarnsByUser(ban.guild.id, ban.user.id);

        } catch (error) {
            
            // Log error in database
            errorHandler(error, {
                context: 'Event',
                file: 'clearWarnsOnBan'
            });
        }
    }
}