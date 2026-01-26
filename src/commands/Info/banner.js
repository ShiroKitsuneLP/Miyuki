// Import necessary Discord.js classes
const { SlashCommandBuilder } = require('discord.js');

// Import necessary modules
const path = require('path');

// Import embedBuilder
const { createMiyukiEmbed, createErrorEmbed } = require(path.join(__dirname, './../../utils/embedBuilder'));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('banner')
        .setDescription('Get the Banner of a User')
        .addUserOption(opt =>
            opt.setName('user')
                .setDescription('The user whose banner you want to get')
        ),
    category: 'Info',
    usage: '/banner [User]',
    async execute(interaction, miyuki) {

        // Get the User option if provided
        let user = interaction.options.getUser('user') || interaction.user;
        const title = user.id === interaction.user.id ? 'Your Banner' : `${user.username}'s Banner`;

        // Fetch the User to get Banner info
        const fetchedUser = await user.fetch();
        const bannerUrl = fetchedUser.bannerURL({ size: 2048 });

        // Check if the user has a Banner
        if (!bannerUrl) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'No Banner Found',
                description: `${user.username} does not have a banner.`
            })] });
        }

        // Send the Banner Embed
        return interaction.reply({ embeds: [createMiyukiEmbed(miyuki, {
            title: title,
            image: bannerUrl
        })] });
    }
}