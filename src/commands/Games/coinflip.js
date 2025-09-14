// Import necessary classes from discord.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Import color configuration
const { color } = require('./../../config/color.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Flip a coin with Miyuki!')
        .addStringOption(option =>
            option.setName('call')
                .setDescription('Your call (heads/tails)')
                .setRequired(true)
                .addChoices(
                    { name: 'Heads', value: 'heads' },
                    { name: 'Tails', value: 'tails' }
                )
        ),
    usage: '/coinflip <call>',
    async execute(interaction, miyuki) {

        // Get the user's call
        const userCall = interaction.options.getString('call');

        // Flip the coin
        const sides = [
            'heads',
             'tails'
            ];

        const coinFlip = sides[Math.floor(Math.random() * sides.length)];

        // Create the embed message
        const coinEmbed = new EmbedBuilder()
            .setColor(color.default)
            .setTitle('Coin Flip!')
            .setAuthor({
                name: miyuki.user.username,
                iconURL: miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 })
            })
            .setThumbnail(miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 }))
            .addFields(
                { name: 'Your Call', value: userCall, inline: true },
                { name: 'Coin Flip Result', value: coinFlip, inline: true },
                { name: 'Result', value: userCall === coinFlip ? 'You guessed it!' : 'Try again!' }
            );

        await interaction.reply({ embeds: [coinEmbed] });
    }
}