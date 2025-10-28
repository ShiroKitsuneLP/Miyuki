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

// Array of slap messages
const slapMsgs = [
    (sender, target) => `${sender} gives ${target} a playful slap! Ouch!`,
    (sender, target) => `${sender} slaps ${target} gently!`,
    (sender, target) => `${sender} slaps ${target} softly. Feeling the love?`,
    (sender, target) => `${sender} gives ${target} a light slap. You're not alone!`,
    (sender, target) => `${sender} slaps ${target}. There, there, everything will be okay!`,
    (sender, target) => `${sender} delivers a firm slap to ${target}! Watch out!`,
    (sender, target) => `${sender} slaps ${target} on the back! Keep it up!`,
    (sender, target) => `${sender} gives ${target} a quick slap! You're special!`,
    (sender, target) => `${sender} slaps ${target} with affection! Feel the love!`,
    (sender, target) => `${sender} gives ${target} a surprising slap! Careful now!`
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slap')
        .setDescription('Slap someone!')
        .addUserOption(opt => 
            opt.setName('target')
                .setDescription('The user to slap')
                .setRequired(true)
        ),
    category: 'Action',
    usage: '/slap <target>',
    async execute(interaction, miyuki) {

        // Get target user and sender
        const target = interaction.options.getUser('target');
        const sender = interaction.user;

        // Validate target user
        if (!target) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'User Not Found',
                description: 'Please specify a valid user to slap.'
            })] });
        }

        // Prevent users from slapping themselves
        if (target.id === sender.id) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'Cannot Slap Yourself',
                description: 'Oops! You can\'t slap yourself, silly! \n Try slapping someone else~'
            })] });
        }

        // Defer reply to allow more time for processing
        await interaction.deferReply();

        try {

            // Select a random slap message
            const randomSlapMsg = slapMsgs[Math.floor(Math.random() * slapMsgs.length)](sender, target);

            // Fetch a random slap GIF from the database and check if one exists
            const gifObj = await actionGif.getRandomGif('slap');

            if (!gifObj) {
                return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                    title: 'No GIFs Available',
                    description: 'No slap GIFs are available at the moment. Please try again later.'
                })] });
            }

            const gifId = gifObj?.id;
            const gifUrl = gifObj?.url;

            // Send the slap embed
            return interaction.editReply({ embeds: [createMiyukiEmbed(miyuki, {
                description: randomSlapMsg,
                image: gifUrl,
                footer: { text: `GIF ID: ${gifId}` }
            })] });

        } catch (error) {

            // Log error in database
            errorHandler(error, {
                command: 'slap'
            });

            try {

                // Send error embed to user
                await interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                    description: 'Sorry, something went wrong while trying to slap that user. Please try again later!'
                })] });

            } catch (err) {
                // Fallback
            }
        }
    }
}