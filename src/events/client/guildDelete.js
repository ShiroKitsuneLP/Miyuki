// Import necessary discord.js modules
const { Events } = require("discord.js");

// Import necessary modules
const path = require("path");

// Import embedBuilder
const { createMiyukiEmbed } = require(path.join(__dirname, './../../utils/embedBuilder'));

// Import error handler
const { errorHandler } = require(path.join(__dirname, './../../utils/errorHandler'));

// Import guild settings database repo
const { guildSettings, warn } = require(path.join(__dirname, './../../database/repo'));

module.exports = {
    name: Events.GuildDelete,
    once: false,
    async execute(guild, miyuki) {

        try {

            // Remove guild from database
            await guildSettings.removeGuild(guild.id);
            await warn.clearWarnsByGuild(guild.id);

        } catch (error) {

            // Log error in database
            errorHandler(error, {
                context: 'Event',
                file: 'guildDelete'
            });
        }
    }
}