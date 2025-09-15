// Import necessary classes from discord.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Import color configuration
const { color } = require('./../../config/color.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('Shows how long Miyuki has been online.'),
    usage: '/uptime',
    async execute(interaction, miyuki) {

        // Calculate uptime
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);

        // Create the uptime parts
        let parts = [];

        if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
        if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
        if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
        if (seconds > 0) parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`);

        // Create the embed message
        const uptimeEmbed = new EmbedBuilder()
            .setColor(color.default)
            .setTitle('Miyuki Uptime')
            .setAuthor({
                name: miyuki.user.username,
                iconURL: miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 })
            })
            .setThumbnail(miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 }))
            .setDescription(`I have been online for **${parts.join(', ')}**!`);

        await interaction.reply({ embeds: [uptimeEmbed] });

    }
}