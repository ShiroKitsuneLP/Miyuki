// Import necessary classes from discord.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Import color configuration
const { color } = require('./../../config/color.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gtn')
        .setDescription('Play Guess The Number with Miyuki!')
        .addIntegerOption(option =>
            option.setName('number')
                .setDescription('Your guess (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)
        ),
    usage: '/gtn <number>',
    async execute(interaction, miyuki) {

        // Get the user's guess
        const userGuess = interaction.options.getInteger('number');

        // Generate a random number between 1 and 100
        const randomNumber = Math.floor(Math.random() * 100) + 1;

        // Create the embed message
        const gtnEmbed = new EmbedBuilder()
            .setColor(color.default)
            .setTitle('Guess The Number!')
            .setAuthor({
                name: miyuki.user.username,
                iconURL: miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 })
            })
            .setThumbnail(miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 }))
            .addFields(
                { name: 'Your Guess', value: userGuess.toString(), inline: true },
                { name: 'Miyuki\'s Number', value: randomNumber.toString(), inline: true },
                { name: 'Result', value: userGuess === randomNumber ? 'You guessed it!' : 'Try again!' }
            );

        await interaction.reply({ embeds: [gtnEmbed] });
    }
}