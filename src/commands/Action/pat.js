// Import necessary discord.js modules
const { SlashCommandBuilder } = require('discord.js');

// Import necessary modules
const path = require('path');

// Import embedBuilder
const { createMiyukiEmbed, createErrorEmbed } = require(path.join(__dirname, './../../utils/embedBuilder'));

// Import actiongif database repo
const { actiongif } = require(path.join(__dirname, './../../database/repo'));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pat')
        .setDescription('Pat someone!')
        .addUserOption(opt => 
            opt.setName('target')
               .setDescription('The user to pat')
               .setRequired(true)
        ),
    usage: '/pat <target>',
    async execute(interaction, miyuki) {

        // Get target user and sender
        const target = interaction.options.getUser('target');
        const sender = interaction.user;

        // Validate target user
        if (!target) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'User Not Found',
                description: 'Please specify a valid user to pat.'
            })] });
        }

        // Prevent users from patting themselves
        if (target.id === sender.id) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'Cannot Pat Yourself',
                description: 'Oops! You can\'t pat yourself, silly! \n Try patting someone else~'
            })] });
        }

        // Array of pat messages
        const patMsgs = [
            `${sender} gently pats ${target}. There, there!`,
            `${sender} gives ${target} a warm pat on the head!`,
            `${sender} softly pats ${target}. Feeling better now?`,
            `${sender} gives ${target} a comforting pat. You're not alone!`,
            `${sender} pats ${target}. There, there, everything will be okay!`
        ];

        // Select a random pat message
        const randomPatMsg = patMsgs[Math.floor(Math.random() * patMsgs.length)];

        // Fetch a random pat GIF from the database and check if one exists
        const gifObj = actiongif.getRandomGif('pat');

        if (!gifObj) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'No GIF Found',
                description: 'No pat GIFs are available at the moment.'
            })] });
        }

        const gifId = gifObj?.id;
        const gifUrl = gifObj?.url;

        // Send the pat embed
        await interaction.reply({ embeds: [createMiyukiEmbed(miyuki, {
            title: 'A Sweet Pat!',
            description: randomPatMsg,
            image: gifUrl,
            footer: { text: `Pat provided by Miyuki | GIF ID: ${gifId ?? 'unknown'}`, iconURL: miyuki.user.displayAvatarURL() }
        })] });
    }
}