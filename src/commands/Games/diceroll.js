// Import necessary classes from discord.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Import color configuration
const { color } = require('./../../config/color.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('diceroll')
        .setDescription('Roll a dice!')
        .addIntegerOption(option =>
            option.setName('type')
                .setDescription('Type of dice (6, 12, 20')
                .setRequired(true)
                .addChoices(
                    { name: 'D6', value: 6 },
                    { name: 'D12', value: 12 },
                    { name: 'D20', value: 20 }
                )
        )
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Number of dice to roll (1-5)')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(5)
        ),
    usage: '/diceroll <type> [amount]',
    async execute(interaction, miyuki) {

        // Get the type of dice and amount from options
        const type = interaction.options.getInteger('type');
        const amount = interaction.options.getInteger('amount') ?? 1;

        // Roll the dice
        const rolls = [];

        for (let i = 0; i < amount; i++) {
            const roll = Math.floor(Math.random() * type) + 1;
            rolls.push(roll);
        }

        // Create the embed message
        const diceEmbed = new EmbedBuilder()
            .setColor(color.default)
            .setTitle('Dice Roll!')
            .setAuthor({
                name: miyuki.user.username,
                iconURL: miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 })
            })
            .setThumbnail(miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 }))
            .addFields(
                { name: 'Dice Type', value: `D${type}`, inline: true },
                { name: 'Number of Dice', value: amount.toString(), inline: true },
                { name: 'Rolls', value: rolls.join(', ') },
                { name: 'Total', value: rolls.reduce((a, b) => a + b, 0).toString(), inline: true }
            );

        await interaction.reply({ embeds: [diceEmbed] });
    }
}