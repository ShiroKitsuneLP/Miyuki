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

// Array of kiss messages
const kissMsgs = [
    (sender, target) => `${sender} gives ${target} a sweet kiss! Mwah~`,
    (sender, target) => `${sender} gently kisses ${target} on the cheek!`,
    (sender, target) => `${sender} pulls ${target} in for a tender kiss. Feeling the love?`,
    (sender, target) => `${sender} gives ${target} a loving kiss. You're not alone!`,
    (sender, target) => `${sender} kisses ${target}. There, there, everything will be okay!`,
    (sender, target) => `${sender} places a soft kiss on ${target}'s forehead! So much love!`,
    (sender, target) => `${sender} gives ${target} a passionate kiss! Stay warm!`,
    (sender, target) => `${sender} pulls ${target} close for a romantic kiss! You're special!`,
    (sender, target) => `${sender} gives ${target} a playful kiss! Careful now!`,
    (sender, target) => `${sender} steals a quick kiss from ${target}! Surprise!`
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kiss')
        .setDescription('Kiss someone!')
        .addUserOption(opt => 
            opt.setName('target')
                .setDescription('The user to kiss')
                .setRequired(true)
        ),
    category: 'Action',
    usage: '/kiss <target>',
    async execute(interaction, miyuki) {

        // Get target user and sender
        const target = interaction.options.getUser('target');
        const sender = interaction.user;

        // Validate target user
        if (!target) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'User Not Found',
                description: 'Please specify a valid user to kiss.'
            })] });
        }

        // Prevent users from kissing themselves
        if (target.id === sender.id) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'Cannot Kiss Yourself',
                description: 'Oops! You can\'t kiss yourself, silly! \n Try kissing someone else~'
            })] });
        }

        // Defer reply to allow more time for processing
        await interaction.deferReply();

        try {

            // Select a random kiss message
            const randomKissMsg = kissMsgs[Math.floor(Math.random() * kissMsgs.length)](sender, target);

            // Fetch a kiss GIF from the database and check if one exists
            const gifObj = actionGif.getRandomGif('kiss');

            if (!gifObj) {
                return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                    title: 'No Kiss GIFs Found',
                    description: 'No kiss GIFs are available at the moment. Please try again later.'
                })] });
            }

            const gifId = gifObj?.id;
            const gifUrl = gifObj?.url;

            // Send the kiss embed
            return interaction.editReply({ embeds: [createMiyukiEmbed(miyuki, {
                description: randomKissMsg,
                image: gifUrl,
                footer: { text: `GIF ID: ${gifId}` }
            })] });

        } catch (error) {

            // Log error in database
            errorHandler(error, {
                context: 'Command',
                file: 'kiss'
            });

            try {

                // Send error embed
                return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                    description: 'An unexpected error occurred while executing the command. Please try again later.'
                })] });
                
            } catch (err) {
                // Fallback
            }
        }
    }
}