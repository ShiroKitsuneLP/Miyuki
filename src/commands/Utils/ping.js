// Import necessary classes from discord.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Import color configuration
const { color } = require('./../../config/color.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong.'),
    usage: '/ping',
    async execute(interaction, miyuki) {

        // Create the initial embed message
        const pingEmbed = new EmbedBuilder()
            .setColor(color.default)
            .setTitle('Pong!')
            .setAuthor({
                name: miyuki.user.username,
                iconURL: miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 })
            })
            .addFields(
                { name: 'Ping', value: 'Pinging...', inline: true },
                { name: 'API Latency', value: 'Pinging...', inline: true }
            );
        const sent = await interaction.reply({ embeds: [pingEmbed] });

        // Calculate ping and latency
        const ping = sent.createdTimestamp - interaction.createdTimestamp;
        const latency = Math.round(interaction.client.ws.ping);

        // Update the embed with actual ping and latency values
        pingEmbed.setFields(
            { name: 'Ping', value: `${ping}ms`, inline: true },
            { name: 'API Latency', value: `${latency}ms`, inline: true }
        );
        await interaction.editReply({ embeds: [pingEmbed] });
    }
}