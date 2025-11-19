//Import necessary discord.js modules
const { SlashCommandBuilder } = require('discord.js');

// Import necessary modules
const path = require('path');

// Import embedBuilder
const { createMiyukiEmbed } = require(path.join(__dirname, './../../utils/embedBuilder'));

// Import color config
const { colors } = require(path.join(__dirname, './../../config/color.json'));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('colors')
        .setDescription('Displays a list of available colors.'),
    category: 'Utility',
    usage: '/colors',
    async execute(interaction, miyuki) {

        // Send the embed message for colors
        await interaction.reply({ embeds: [createMiyukiEmbed(miyuki, {
            title: 'Available Colors',
            description: Object.entries(colors).map(([name, { emoji, hex }]) => `${emoji} **${name}**: \`${hex}\``).join('\n')
        })] });
    }
}