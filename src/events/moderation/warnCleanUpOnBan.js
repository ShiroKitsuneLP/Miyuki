// Import necessary classes from discord.js
const { Events, EmbedBuilder } = require('discord.js');

// Import warn repository
const { logchannel, warn } = require('../../db/repo');

// Import color configuration
const { color } = require('./../../config/color.json');

module.exports = {
    name: Events.GuildBanAdd,
    once: false,
    async execute(ban, miyuki) {
        try {

            // ban is a GuildBan object
            const guildId = ban.guild.id;
            const userId = ban.user.id;

            // Get the number of warns for this user in this guild
            const count = warn.getCount(guildId, userId);
            if (count > 0) {

                // Remove all warns for this user in this guild
                warn.clearUser(guildId, userId);

                // Try to send embed to log channel
                const channelId = logchannel.get(guildId);
                if (channelId) {
                    const channel = ban.guild.channels.cache.get(channelId) ?? await ban.guild.channels.fetch(channelId).catch(() => null);
                    if (channel) {
                        const embed = new EmbedBuilder()
                            .setColor(color.default)
                            .setTitle('Warns Cleared After Ban')
                            .setAuthor({
                                name: miyuki.user.username,
                                iconURL: miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 })
                            })
                            .setDescription(`All warns for <@${userId}> have been cleared after ban.`)
                            .addFields(
                                { name: 'User', value: `<@${userId}> (${userId})`, inline: true },
                                { name: 'Total Warns', value: String(count), inline: true }
                            );
                        await channel.send({ embeds: [embed] });
                    }
                }
            }
        } catch (err) {
            console.log('[warnCleanupOnBan] Failed to clean up warns on ban:', err);
        }
    }
};
