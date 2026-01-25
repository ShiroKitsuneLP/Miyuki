// Import necessary Discord.js classes
const { SlashCommandBuilder } = require('discord.js');

// Import necessary modules
const path = require('path');

// Import embedBuilder
const { createMiyukiEmbed } = require(path.join(__dirname, './../../utils/embedBuilder'));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Get the Avatar of a User')
        .addUserOption(opt => 
            opt.setName('user')
                .setDescription('The User whose Avatar you want to get')
        ),
    category: 'Info',
    usage: '/avatar [User]',
    async execute(interaction, miyuki) {

        // Get the User option if provided
        let user = interaction.options.getUser('user') || interaction.user;
        const title = user.id === interaction.user.id ? 'Your Avatar' : `${user.username}'s Avatar`;

        // Send the Avatar Embed
        return interaction.reply({ embeds: [createMiyukiEmbed(miyuki, {
            title: title,
            image: user.displayAvatarURL({ dynamic: true, size: 2048 })
        })] });
    }
}