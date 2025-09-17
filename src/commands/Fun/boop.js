// Import necessary classes from discord.js
const { SlashCommandBuilder, MessageFlags, EmbedBuilder } = require('discord.js');

// Import color configuration
const { color } = require('./../../config/color.json');

// Import actiongif repository
const { actiongif } = require('../../db/repo');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('boop')
        .setDescription('Boop someone!')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The user to boop')
                .setRequired(true)
        ),
    usage: '/boop <User>',
    async execute(interaction, miyuki) {

        // Get the target user and sender
        const target = interaction.options.getUser('target');
        const sender = interaction.user;

        // Prevent users from booping themselves
        if (target.id === interaction.user.id) {
            const errorEmbed = new EmbedBuilder()
                .setColor(color.error)
                .setAuthor({
                    name: miyuki.user.username,
                    iconURL: miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 })
                })
                .setDescription('Oops! You can\'t boop yourself, silly! \n Try booping someone else~');

            return interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
        }

        // Array of boop messages
        const boopMsg = [
            `${sender} gives ${target} a gentle boop on the nose!`,
            `${sender} playfully boops ${target}. Boop!`,
            `${sender} softly boops ${target}. There, there!`,
            `${sender} gives ${target} a cute little boop!`,
            `${sender} boops ${target}. Boop! You're special!`

        ];

        // Select a random boop message
        const randomBoopMsg = boopMsg[Math.floor(Math.random() * boopMsg.length)];

        // Get a random boop GIF from the database
        const gifObj = actiongif.getRandom('boop');
        const gifUrl = typeof gifObj === 'string' ? gifObj : gifObj?.url;

        const boopEmbed = new EmbedBuilder()
            .setColor(color.default)
            .setTitle('A Cute Boop!')
            .setAuthor({
                name: miyuki.user.username,
                iconURL: miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 })
            })
            .setDescription(randomBoopMsg)
            .setImage(gifUrl)
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });

        await interaction.reply({ embeds: [boopEmbed] });
    }
}