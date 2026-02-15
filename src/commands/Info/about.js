// Import necessary Discord.js classes
const { SlashCommandBuilder, version } = require('discord.js');

// Import necessary modules
const path = require('path');

// Import embedBuilder
const { createMiyukiEmbed } = require(path.resolve(__dirname, '../../utils/embedBuilder'));

// Import error handler
const { errorHandler } = require(path.resolve(__dirname, '../../utils/errorHandler'));

const { discord, website } = require(path.resolve(__dirname, '../../config/link.json'))

module.exports = {
    data: new SlashCommandBuilder()
        .setName('about')
        .setDescription('Information about Miyuki'),
    category: 'Info',
    usage: '/about',
    async execute(interaction, miyuki) {

        try {

            // Cound All User over all Server
            let totalUsers = 0;

            for (const guild of miyuki.guilds.cache.values()) {
                const members = await guild.members.fetch();
                const humans = await members.filter(member => !member.user.bot);

                totalUsers += humans.size;
            }

            // All Commands
            const totalCommands = miyuki.commands?.size ?? 0;

            // Send About Embed
            await interaction.reply({ embeds: [createMiyukiEmbed(miyuki, {
                title: 'About Miyuki',
                thumb: miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 }),
                desc: 'Hello! I\'m Miyuki, your helpful companion on Discord. I\'m here to bring some fun and useful tools to your server. Let\'s make your community even better together! ❤️',
                fields: [
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
                    { name: 'Invite Me', value: `[Click Here](${discord.botInvite})`, inline: true },
                    { name: 'Miyuki\'s Hideout', value: `[Click Here](${discord.serverInvite})`, inline: true },
                    { name: 'Website', value: `[Click Here](${website})`, inline: true },

                    // Fun Info
                    { name: 'Personality', value: 'Cute, helpful & always online~', inline: false },
                    { name: 'Powered by', value: 'JavaScript & sweet server hugs~', inline: false }
                ],
                footer: { text: 'Thank you for using Miyuki! ❤️' }
            })] })

        } catch (error) {
            await errorHandler(error, {
                context: 'Commands',
                category: 'Info',
                file: 'about',
                interaction,
                client: miyuki
            });
        }
    }
}