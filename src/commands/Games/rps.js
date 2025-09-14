// Import necessary classes from discord.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Import color configuration
const { color } = require('./../../config/color.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rps')
        .setDescription('Play Rock, Paper, Scissors against Miyuki!')
        .addStringOption(option =>
            option.setName('choice')
                .setDescription('Your choice: rock, paper, or scissors')
                .setRequired(true)
                .addChoices(
                    { name: 'Rock', value: 'rock' },
                    { name: 'Paper', value: 'paper' },
                    { name: 'Scissors', value: 'scissors' }
                )
        ),
    usage: '/rps <choice>',
    async execute(interaction, miyuki) {

        // Get the user's choice
        const userChoice = interaction.options.getString('choice').toLowerCase();

        const choices = [
            'rock', 
            'paper', 
            'scissors'
        ];

        // Pick a random choice for Miyuki
        const botChoice = choices[Math.floor(Math.random() * choices.length)];

        // Determine the winner
        let result;

        if (userChoice === botChoice) {
            result = 'It\'s a tie!';
        } else if ((userChoice === 'rock' && botChoice === 'scissors') || (userChoice === 'paper' && botChoice === 'rock') || (userChoice === 'scissors' && botChoice === 'paper')) {
            result = 'You win!';
        } else {
            result = 'Miyuki wins!';
        }

        // Create the embed message
        const rpsEmbed = new EmbedBuilder()
            .setColor(color.default)
            .setTitle('Rock, Paper, Scissors!')
            .setAuthor({
                name: miyuki.user.username,
                iconURL: miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 })
            })
            .setThumbnail(miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 }))
            .addFields(
                { name: 'Your Choice', value: userChoice.charAt(0).toUpperCase() + userChoice.slice(1), inline: true },
                { name: 'Miyuki\'s Choice', value: botChoice.charAt(0).toUpperCase() + botChoice.slice(1), inline: true },
                { name: 'Result', value: result }
            );

        await interaction.reply({ embeds: [rpsEmbed] });
    }
}