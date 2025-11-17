// Import necessary discord.js modules
const { SlashCommandBuilder } = require('discord.js');

// Import necessary modules
const path = require('path');

// Import embedBuilder
const { createMiyukiEmbed } = require(path.join(__dirname, './../../utils/embedBuilder'));

module.exports = {
    data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Get the avatar of a user')
    .addUserOption(opt => 
        opt.setName('user')
            .setDescription('The user whose avatar you want to get')
            .setRequired(false)
    ),
    category: 'Info',
    usage: '/avatar [user]',
    async execute(interaction, miyuki) {

        // Get the user option if provided, else use the interaction user
        const user = interaction.options.getUser('user') || interaction.user;

        // Send the avatar embed
        return interaction.reply({ embeds: [createMiyukiEmbed(miyuki, {
            title: `${user.username}'s Avatar`,
            image: user.displayAvatarURL({ dynamic: true, size: 2048 })
        })] });
    }
}