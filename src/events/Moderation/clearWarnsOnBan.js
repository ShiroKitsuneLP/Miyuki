// Import necessary discord.js modules
const { Events } = require('discord.js');

// Import necessary modules
const path = require('path');

// Import embedBuilder
const { createMiyukiEmbed } = require(path.join(__dirname, './../../utils/embedBuilder'));

// Import error handler
const { errorHandler } = require(path.join(__dirname, './../../utils/errorHandler'));

// Import warn and guild settings database repo
const { warn, guildSettings } = require(path.join(__dirname, './../../database/repo'));

module.exports = {
    name: Events.GuildBanAdd,
    once: false,
    async execute(ban, miyuki) {

        try {

            // Clear warns for the banned user
            await warn.clearWarnsByUser(ban.guild.id, ban.user.id);

            // Fetch log channel from guild settings if exists
            const logChannelId = guildSettings.getLogChannel(ban.guild.id);

            // If log channel is set, send a log message
            if (logChannelId) {
                const logChannel = await miyuki.channels.fetch(logChannelId).catch(() => null);

                if (logChannel && logChannel.isTextBased()) {

                    // Send log message to the log channel
                    await logChannel.send({ embeds: [createMiyukiEmbed(miyuki, {
                        title: 'User Banned - Warns Cleared',
                        description: `All warnings for **${ban.user.tag}** have been cleared due to a ban.`,
                    })] });
                }
            }

        } catch (error) {
            
            // Log error in database
            errorHandler(error, {
                context: 'Event',
                file: 'clearWarnsOnBan'
            });
        }
    }
}