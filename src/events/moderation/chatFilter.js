// Import necessary discord.js modules
const { Events } = require('discord.js');
const { once } = require('events');

// Import necessary modules
const path = require('path');

// Import chatFilter and warn repo
const { chatFilter, warn } = require(path.join(__dirname, '../../../database/repo'));

// Import embedBuilder
const { createWarnEmbed } = require(path.join(__dirname, '../../../utils/embedBuilder'));

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message, miyuki) {

        // Ignore messages not in a guild
        if (!message.guild) return;

        try {
            // Fetch guild settings
            const guildSettings = chatFilter.getGuildSettings(message.guild.id);

            const badLinksEnabled = guildSettings ? guildSettings.badLinks : 0;
            const nsfwLinksEnabled = guildSettings ? guildSettings.nsfwLinks : 0;
            const autoWarnEnabled = guildSettings ? guildSettings.autoWarn : 0;

            // If no filters are enabled, skip processing
            if (!badLinksEnabled && !nsfwLinksEnabled) return;

            // Check if the message is in an ignored channel
            const ignoredChannels = chatFilter.getIgnoredChannels(message.guild.id).map(c => c.channel_id);

            if (ignoredChannels.includes(message.channel.id)) return;

            // Check if the message author has an ignored role
            const ignoredRoles = chatFilter.getIgnoredRoles(message.guild.id).map(r => r.role_id);

            if (message.member.roles.cache.some(role => ignoredRoles.includes(role.id))) return;

            // Define regex patterns for link detection
            const urlPattern = /(https?:\/\/[^\s]+)/gi;
            const domainPattern = /([a-zA-Z0-9-]+\.[a-zA-Z]{2,})(\/[^\s]*)?/gi;

            // Function to check if a link is bad or NSFW
            const isBadLink = (link) => {
                const badLinks = chatFilter.getBadLinks();
                return badLinks.some(badLink => link.includes(badLink.link));
            };

            const isNsfwLink = (link) => {
                const nsfwLinks = chatFilter.getNsfwLinks();
                return nsfwLinks.some(nsfwLink => link.includes(nsfwLink.link));
            }

            // Extract links from the message
            const links = [];
            let match;

            while ((match = urlPattern.exec(message.content)) !== null) {
                links.push(match[0]);
            }

            while ((match = domainPattern.exec(message.content)) !== null) {
                links.push(match[0]);
            }

            // Check each link against the bad and NSFW lists
            let containsBadLink = false;
            let containsNsfwLink = false;

            for (const link of links) {
                if (badLinksEnabled && isBadLink(link)) {
                    containsBadLink = true;
                }

                if (nsfwLinksEnabled && isNsfwLink(link)) {
                    containsNsfwLink = true;
                }

                // Check if message has bad link
                if (containsBadLink) {
                    await message.delete().catch(err => console.error(`Failed to delete message: ${err}`));

                    // Auto warn if enabled
                    if (autoWarnEnabled) {
                        const warnCount = warn.addWarn(message.guild.id, message.author.id, miyuki.user.id, 'Posted a bad link');

                        // Send warn embed in the channel
                        await message.channel.send({ embeds: [createWarnEmbed(miyuki, {
                            user: message.author,
                            moderator: miyuki.user,
                            reason: 'Posted a bad link',
                            warnCount
                        })] });
                    }

                    break;
                }

                if (containsNsfwLink) {
                    await message.delete().catch(err => console.error(`Failed to delete message: ${err}`));

                    // Auto warn if enabled
                    if (autoWarnEnabled) {
                        const warnCount = warn.addWarn(message.guild.id, message.author.id, miyuki.user.id, 'Posted an NSFW link');

                        // Send warn embed in the channel
                        await message.channel.send({ embeds: [createWarnEmbed(miyuki, {
                            user: message.author,
                            moderator: miyuki.user,
                            reason: 'Posted an NSFW link',
                            warnCount
                        })] });
                    }

                    break;
                }
            }
        } catch (error) {
            console.error('[Error] Error processing message for chat filter');
            console.error(error);
        }
    }
}