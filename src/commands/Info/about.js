// Import necessary classes from discord.js
const { SlashCommandBuilder, EmbedBuilder, version } = require('discord.js');

// Import Discord Links from config.json
const { discordLinks } = require('./../../config/config.json');

// Import color configuration
const { color } = require('./../../config/color.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('about')
        .setDescription('Provides information about the bot.'),
    usage: '/about',
    async execute(interaction, miyuki) {

        // All Users over all Servers
        let totalUsers = 0;

        for (const guild of miyuki.guilds.cache.values()) {
            try {
                const members = await guild.members.fetch()
                const humans = members.filter(member => !member.user.bot)
                totalUsers += humans.size
            } catch (err) {
                console.error(`Error loading ${guild.name}:`, err)
            }
        }

        // All Commands
        const totalCommands = miyuki.commands?.size ?? 0;

        // Create the embed message
        const aboutEmbed = new EmbedBuilder()
            .setColor(color.default)
            .setTitle('About Miyuki')
            .setAuthor({
                name: miyuki.user.username,
                iconURL: miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 })
            })
            .setThumbnail(miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 }))
            .setDescription('Hello! I\'m Miyuki, your helpful companion on Discord. I\'m here to bring some fun and useful tools to your server. Let\'s make your community even better together! ❤️')
            .addFields(
                // Basic Info
                { name: 'Developer', value: '[ShiroKitsune](https://github.com/ShiroKitsuneLP)', inline: false },
                { name: 'Bot ID', value: miyuki.user.id, inline: false },

                // Version Info
                { name: 'Bot Version', value: 'v1.0.0', inline: true },
                { name: 'discord.js', value: `v${version}`, inline: true },
                { name: 'Node.js', value: process.version, inline: true },
                
                // Stats
                { name: 'Servers', value: `${miyuki.guilds.cache.size}`, inline: true },
                { name: 'Users', value: `${totalUsers}`, inline: true },
                { name: 'Commands', value: `${totalCommands}`, inline: true },

                // Spacer
                { name: '', value: '', inline: false },

                // Links
                { name: 'Invite Me', value: `[Click Here](${discordLinks.invite})`, inline: true },
                { name: 'Miyuki\'s Hideout', value: `[Click Here](${discordLinks.supportServer})`, inline: true },
                { name: 'Website', value: `[Click Here](${discordLinks.website})`, inline: true },

                // Fun Info
                { name: 'Personality', value: 'Cute, helpful & always online~', inline: false },
                { name: 'Powered by', value: 'JavaScript & sweet server hugs~', inline: false }
            )
            .setFooter({ text: 'Thank you for using Miyuki! ❤️' });

        await interaction.reply({ embeds: [aboutEmbed] });
    }
}