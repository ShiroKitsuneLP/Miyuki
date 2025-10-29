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

// Array of hug messages
const hugMsgs = [
    (sender, target) => `${sender} gives ${target} a big warm hug! There, there~`,
    (sender, target) => `${sender} wraps their arms around ${target} in a comforting hug!`,
    (sender, target) => `${sender} pulls ${target} into a tight hug. Feeling better now?`,
    (sender, target) => `${sender} gives ${target} a gentle hug. You're not alone!`,
    (sender, target) => `${sender} hugs ${target}. There, there, everything will be okay!`,
    (sender, target) => `${sender} squeezes ${target} in a loving hug! So much love!`,
    (sender, target) => `${sender} gives ${target} a cozy hug! Stay warm!`,
    (sender, target) => `${sender} wraps ${target} in a big hug! You're special!`,
    (sender, target) => `${sender} pulls ${target} close for a heartfelt hug! Feel the love!`,
    (sender, target) => `${sender} gives ${target} a playful hug! Careful now!`
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hug')
        .setDescription('Hug someone!')
        .addUserOption(opt => 
            opt.setName('target')
                .setDescription('The user to hug')
                .setRequired(true)
        ),
    category: 'Action',
    usage: '/hug <target>',
    async execute(interaction, miyuki) {

        // Get target user and sender
        const target = interaction.options.getUser('target');
        const sender = interaction.user;

        // Validate target user
        if (!target) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'User Not Found',
                description: 'Please specify a valid user to hug.'
            })] });
        }

        // Prevent users from hugging themselves
        if (target.id === sender.id) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'Cannot Hug Yourself',
                description: 'Oops! You can\'t hug yourself, silly! \n Try hugging someone else~'
            })] });
        }

        // Defer the reply to have more time
        await interaction.deferReply();

        try {

            // Select a random hug message
            const randomHugMsg = hugMsgs[Math.floor(Math.random() * hugMsgs.length)](sender, target);

            // Fetch a random hug GIF from the database and check if one exists
            const gifObj = actionGif.getRandomGif('hug');

            if (!gifObj) {
                return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                    title: 'No GIF Found',
                    description: 'No hug GIFs are available at the moment. Please try again later.'
                })] });
            }

            const gifId = gifObj?.id;
            const gifUrl = gifObj?.url;

            // Send the hug embed
            return interaction.editReply({ embeds: [createMiyukiEmbed(miyuki, {
                description: randomHugMsg,
                image: gifUrl,
                footer: { text: `GIF ID: ${gifId}` }
            })] });

        } catch (error) {

            // Log error in database
            errorHandler(error, {
                context: 'Command',
                file: 'hug'
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