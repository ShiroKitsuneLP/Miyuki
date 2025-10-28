// Import necessary discord.js modules
const { SlashCommandBuilder } = require('discord.js');

// Import necessary modules
const path = require('path');

// Import embedBuilder
const { createMiyukiEmbed, createErrorEmbed } = require(path.join(__dirname, './../../utils/embedBuilder'));

// Import error handler
const { errorHandler } = require(path.join(__dirname, './../../utils/errorHandler'));

// Import actionGif database repo
const { actionGif } = require(path.join(__dirname, './../../database/repo'));

// Array of pat messages
const patMsgs = [
    (sender, target) => `${sender} gently pats ${target}. There, there!`,
    (sender, target) => `${sender} gives ${target} a warm pat on the head!`,
    (sender, target) => `${sender} softly pats ${target}. Feeling better now?`,
    (sender, target) => `${sender} gives ${target} a comforting pat. You're not alone!`,
    (sender, target) => `${sender} pats ${target}. There, there, everything will be okay!`,
    (sender, target) => `${sender} gives ${target} a playful pat! Careful now!`,
    (sender, target) => `${sender} pats ${target} on the back! Keep it up!`,
    (sender, target) => `${sender} gives ${target} a reassuring pat! You're special!`,
    (sender, target) => `${sender} pats ${target} with affection! Feel the love!`,
    (sender, target) => `${sender} gives ${target} a quick pat! Stay positive!`
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pat')
        .setDescription('Pat someone!')
        .addUserOption(opt => 
            opt.setName('target')
               .setDescription('The user to pat')
               .setRequired(true)
        ),
    category: 'Action',
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

        // Defer reply to allow more time for processing
        await interaction.deferReply();

        try {

            // Select a random pat message
            const randomPatMsg = patMsgs[Math.floor(Math.random() * patMsgs.length)](sender, target);

            // Fetch a random pat GIF from the database and check if one exists
            const gifObj = await actionGif.getRandomGif('pat');

            if (!gifObj) {
                return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                    title: 'No GIFs Available',
                    description: 'No pat GIFs are available at the moment. Please try again later.'
                })] });
            }

            const gifId = gifObj?.id;
            const gifUrl = gifObj?.url;

            // Send the pat embed
            return interaction.editReply({ embeds: [createMiyukiEmbed(miyuki, {
                description: randomPatMsg,
                image: gifUrl,
                footer: { text: `GIF ID: ${gifId}` }
            })] });

        } catch (error) {

            // Log error in database
            errorHandler(error, {
                command: 'pat'
            })

            try {

                // Send error embed
                return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                    description: 'An unexpected error occurred while executing the command. The error has been logged.'
                })] });

            } catch (err) {
                // Fallback
            }
        }
    }
}