// Import necessary classes from discord.js
const { SlashCommandBuilder, MessageFlags, EmbedBuilder } = require('discord.js');

// Import color configuration
const { color } = require('./../../config/color.json');

// Import actiongif repository
const { actiongif } = require('../../db/repo');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hug')
        .setDescription('Hug someone!')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The user to hug')
                .setRequired(true)
        ),
    usage: '/hug <User>',
    async execute(interaction, miyuki) {

        // Get the target user and sender
        const target = interaction.options.getUser('target');
        const sender = interaction.user;

        // Prevent users from hugging themselves
        if (target.id === interaction.user.id) {
            const errorEmbed = new EmbedBuilder()
                .setColor(color.error)
                .setAuthor({
                    name: miyuki.user.username,
                    iconURL: miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 })
                })
                .setDescription('Aww, you can\'t hug yourself! But here\'s a big virtual hug from me to you!');

            return interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
        }

        // Array of hug messages
        const hugMsg = [
            `${sender} gives ${target} a warm hug!`,
            `${sender} wraps their arms around ${target} for a big hug!`,
            `${sender} hugs ${target} tightly. You're safe now!`,
            `${sender} shares a comforting hug with ${target}. You're not alone!`,
            `${sender} gives ${target} a gentle hug. Everything will be okay!`
        ];

        // Select a random hug message
        const randomHugMsg = hugMsg[Math.floor(Math.random() * hugMsg.length)];

        // Get a random hug GIF from the database
        const gifObj = actiongif.getRandom('hug');
        const gifUrl = typeof gifObj === 'string' ? gifObj : gifObj?.url;

        const hugEmbed = new EmbedBuilder()
            .setColor(color.default)
            .setTitle('A Warm Hug!')
            .setAuthor({
                name: miyuki.user.username,
                iconURL: miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 })
            })
            .setDescription(randomHugMsg)
            .setImage(gifUrl)
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });

        await interaction.reply({ embeds: [hugEmbed] });
    }
}