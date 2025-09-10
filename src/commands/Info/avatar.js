// Import necessary classes from discord.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Import color configuration
const { color } = require('./../../config/color.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Get the avatar of a user or yourself.')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user whose avatar you want to get.')
                .setRequired(true)
        ),
    usage: '/avatar <user>',
    async execute(interaction, miyuki) {

        // Get the user from the options
        const user = interaction.options.getUser('user');

        // Create the embed message
        const avatarEmbed = new EmbedBuilder()
            .setColor(color.default)
            .setTitle(`${user.username}'s Avatar`)
            .setImage(user.displayAvatarURL({ dynamic: true, size: 2048 }))
            .setAuthor({
                name: miyuki.user.username,
                iconURL: miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 })
            })

        await interaction.reply({ embeds: [avatarEmbed] });
    }
}