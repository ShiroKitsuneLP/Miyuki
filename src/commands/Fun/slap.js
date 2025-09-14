// Import necessary classes from discord.js
const { SlashCommandBuilder, MessageFlags, EmbedBuilder } = require('discord.js');

// Import color configuration
const { color } = require('./../../config/color.json');

// Import actiongif repository
const { actiongif } = require('../../db/repo');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slap')
        .setDescription('Slap someone!')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user to slap')
                .setRequired(true)
        ),
    usage: '/slap <User>',
    async execute(interaction, miyuki) {

        // Get the target user and sender
        const target = interaction.options.getUser('target');
        const sender = interaction.user;

        // Prevent users from slapping themselves
        if (target.id === interaction.user.id) {
            const errorEmbed = new EmbedBuilder()
                .setColor(color.error)
                .setAuthor({
                    name: miyuki.user.username,
                    iconURL: miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 })
                })
                .setDescription('Hey! You can\'t slap yourself! But here\'s a gentle slap from me to you! 👋');

            return await interaction.reply({ embeds: [errorEmbed] });
        }

        // Array of slap messages
        const slapMsg = [
            `${sender} slaps ${target} with a big trout!`,
            `${sender} gives ${target} a playful slap!`,
            `${sender} slaps ${target} across the face! Ouch!`,
            `${sender} delivers a swift slap to ${target}!`,
            `${sender} slaps ${target} with a giant foam hand!`
        ];

        // Select a random slap message
        const randomSlapMsg = slapMsg[Math.floor(Math.random() * slapMsg.length)];

        // Get a random slap GIF from the actiongif repository
        const gifObj = actiongif.getRandom('slap');
        const gifUrl = typeof gifObj === 'string' ? gifObj : gifObj?.url;

        const slapEmbed = new EmbedBuilder()
            .setColor(color.default)
            .setTitle('A Playful Slap!')
            .setAuthor({
                name: miyuki.user.username,
                iconURL: miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 })
            })
            .setDescription(randomSlapMsg)
            .setImage(gifUrl)
            .setTimestamp();

        return await interaction.reply({ embeds: [slapEmbed] });
    }
}