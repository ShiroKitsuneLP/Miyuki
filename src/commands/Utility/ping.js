// Import necessary Discord.js classes
const { SlashCommandBuilder } = require('discord.js');

// Import necessary modules
const path = require('path');

// Import embedBuilder
const { createMiyukiEmbed } = require(path.join(__dirname, './../../utils/embedBuilder'));

// Import error handler
const { errorHandler } = require(path.resolve(__dirname, '../../utils/errorHandler'));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    category: 'Utility',
    usage: '/ping',
    async execute(interaction, miyuki) {

        // Sent initial reply
        const sent = await interaction.reply({ embeds: [createMiyukiEmbed(miyuki, {
            title: 'Pong!',
            fields: [
                { name: 'Ping', value: 'Pinging...', inline: true },
                { name: 'API Latency', value: 'Pinging...', inline: true }
            ]
        })], withResponse: true });

        try {

            // Calculate ping and latency
            const sentObj = sent.resource.message;
            const ping = sentObj.createdTimestamp - interaction.createdTimestamp;
            const latency = Math.round(interaction.client.ws.ping);

            // Update the embed with the Calculated values
            await interaction.editReply({ embeds: [createMiyukiEmbed(miyuki, {
                title: 'Pong!',
                fields: [
                    { name: 'Ping', value: `${ping}ms`, inline: true },
                    { name: 'API Latency', value: `${latency}ms`, inline: true }
                ]
            })] });

        } catch (error) {
            await errorHandler(error, {
                context: 'Command',
                category: 'Utility',
                file: 'ping',
                interaction,
                client: miyuki
            });
        }
    }
}