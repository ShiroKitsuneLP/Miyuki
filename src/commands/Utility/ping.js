//Import necessary discord.js modules
const { SlashCommandBuilder } = require('discord.js');

// Import necessary modules
const path = require('path');

// Import embedBuilder
const { createMiyukiEmbed } = require(path.join(__dirname, './../../utils/embedBuilder'));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    usage: '/ping',
    async execute(interaction, miyuki) {
        
        // Send initial reply
        const sent = await interaction.reply({ embeds: [createMiyukiEmbed(miyuki, {
            title: 'Pong!',
            fields: [
                { name: 'Ping', value: 'Pinging...', inline: true },
                { name: 'API Latency', value: 'Pinging...', inline: true }
            ]
        })], fetchReply: true });

        // Calculate ping and latency
        const ping = sent.createdTimestamp - interaction.createdTimestamp;
        const latency = Math.round(interaction.client.ws.ping);

        // Update the embed with the Calculated values
        await interaction.editReply({ embeds: [createMiyukiEmbed(miyuki, {
            title: 'Pong!',
            fields: [
                { name: 'Ping', value: `${ping}ms`, inline: true },
                { name: 'API Latency', value: `${latency}ms`, inline: true }
            ]
        })] });
    }
}