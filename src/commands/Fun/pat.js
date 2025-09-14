// Import necessary classes from discord.js
const { SlashCommandBuilder, MessageFlags, EmbedBuilder } = require('discord.js');

// Import color configuration
const { color } = require('./../../config/color.json');

// Import actiongif repository
const { actiongif } = require('../../db/repo');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pat')
        .setDescription('Pat someone!')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The user to pat')
                .setRequired(true)
        ),
    async execute(interaction, miyuki) {

        // Get the target user and sender
        const target = interaction.options.getUser('target');
        const sender = interaction.user;

        // Prevent users from patting themselves
        if (target.id === interaction.user.id) {
            const errorEmbed = new EmbedBuilder()
                .setColor(color.error)
                .setAuthor({
                    name: miyuki.user.username,
                    iconURL: miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 })
                })
                .setDescription('Oops! You can\'t pat yourself, silly! \n Try patting someone else~');

            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        // Array of pat messages
        const patMsg = [
            `${sender} gently pats ${target}. There, there!`,
            `${sender} gives ${target} a warm pat on the head!`,
            `${sender} softly pats ${target}. Feeling better now?`,
            `${sender} gives ${target} a comforting pat. You're not alone!`,
            `${sender} pats ${target}. There, there, everything will be okay!`
        ];

        // Select a random pat message
        const randomPatMsg = patMsg[Math.floor(Math.random() * patMsg.length)];

        // Get a random pat GIF from the database
        const gifObj = actiongif.getRandom('pat');
        const gifUrl = typeof gifObj === 'string' ? gifObj : gifObj?.url;

        const patEmbed = new EmbedBuilder()
            .setColor(color.default)
            .setTitle('A Sweet Pat!')
            .setAuthor({
                name: miyuki.user.username,
                iconURL: miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 })
            })
            .setDescription(randomPatMsg)
            .setImage(gifUrl)
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });

        await interaction.reply({ embeds: [patEmbed] });
    }
}