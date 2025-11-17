// Import necessary discord.js modules
const { SlashCommandBuilder } = require('discord.js');

// Import necessary modules
const path = require('path');

// Import embedBuilder
const { createMiyukiEmbed, createErrorEmbed } = require(path.join(__dirname, './../../utils/embedBuilder'));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('banner')
        .setDescription('Get the banner of a user')
        .addUserOption(opt => 
            opt.setName('user')
                .setDescription('The user whose banner you want to get')
                .setRequired(false)
        ),
    category: 'Info',
    usage: '/banner [user]',
    async execute(interaction, miyuki) {

        // Get the user option if provided, else use the interaction user
        const user = interaction.options.getUser('user') || interaction.user;

        // Fetch the user to get banner info
        const fetchedUser = await user.fetch();
        const bannerUrl = fetchedUser.bannerURL({ size: 2048 });

        // Check if the user has a banner
        if (!bannerUrl) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'No Banner Found',
                description: `${user.username} does not have a banner.`
            })] });
        }

        // Send the banner embed
        return interaction.reply({ embeds: [createMiyukiEmbed(miyuki, {
            title: `${user.username}'s Banner`,
            image: bannerUrl
        })] });
    }
}