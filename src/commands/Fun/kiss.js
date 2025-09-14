// Import necessary classes from discord.js
const { SlashCommandBuilder, MessageFlags, EmbedBuilder } = require('discord.js');

// Import Color configuration
const { color } = require('./../../config/color.json');

// Import actiongif repository
const { actiongif } = require('../../db/repo');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kiss')
        .setDescription('Kiss someone!')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The user to kiss')
                .setRequired(true)
        ),
    usage: '/kiss <User>',
    async execute(interaction, miyuki) {

        // Get the target user and sender
        const target = interaction.options.getUser('target');
        const sender = interaction.user;

        // Prevent users from kissing themselves
        if (target.id === interaction.user.id) {
            const errorEmbed = new EmbedBuilder()
                .setColor(color.error)
                .setAuthor({
                    name: miyuki.user.username,
                    iconURL: miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 })
                })
                .setDescription('Aww, you can\'t kiss yourself! But here\'s a big virtual kiss from me to you!');

            return interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
        }

        // Array of kiss messages
        const kissMsg = [
            `${sender} gives ${target} a sweet kiss!`,
            `${sender} plants a gentle kiss on ${target}'s cheek!`,
            `${sender} kisses ${target} softly. Mwah!`,
            `${sender} shares a loving kiss with ${target}. You're special!`,
            `${sender} gives ${target} a tender kiss. Feel the love!`
        ];

        // Select a random kiss message
        const randomKissMsg = kissMsg[Math.floor(Math.random() * kissMsg.length)];

        // Get a random kiss GIF from the database
        const gifObj = actiongif.getRandom('kiss');
        const gifUrl = typeof gifObj === 'string' ? gifObj : gifObj?.url;

        const kissEmbed = new EmbedBuilder()
            .setColor(color.default)
            .setTitle('A Sweet Kiss!')
            .setAuthor({
                name: miyuki.user.username,
                iconURL: miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 })
            })
            .setDescription(randomKissMsg)
            .setImage(gifUrl)
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });

        return interaction.reply({ embeds: [kissEmbed] });
    }
}