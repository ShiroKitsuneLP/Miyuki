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

// Array of bite messages
const biteMsgs = [
    (sender, target) => `${sender} playfully bites ${target}! Nom nom~`,
    (sender, target) => `${sender} gives ${target} a gentle nibble!`,
    (sender, target) => `${sender} bites ${target} softly. Feeling the love?`,
    (sender, target) => `${sender} gives ${target} a cute little bite. You're not alone!`,
    (sender, target) => `${sender} bites ${target}. There, there, everything will be okay!`,
    (sender, target) => `${sender} sinks their teeth into ${target}! Ouch!`,
    (sender, target) => `${sender} bites ${target} gently! Watch out!`,
    (sender, target) => `${sender} takes a big bite out of ${target}! Delicious!`,
    (sender, target) => `${sender} nibbles on ${target}! So cute!`,
    (sender, target) => `${sender} gives ${target} a playful bite! Careful now!`
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bite')
        .setDescription('Bite someone!')
        .addUserOption(opt => 
            opt.setName('target')
                .setDescription('The user to bite')
                .setRequired(true)
        ),
    category: 'Action',
    usage: '/bite <target>',
    async execute(interaction, miyuki) {

        // Get target user and sender
        const target = interaction.options.getUser('target');
        const sender = interaction.user;

        // Validate target user
        if (!target) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'User Not Found',
                description: 'Please specify a valid user to bite.'
            })] });
        }

        // Prevent users from biting themselves
        if (target.id === sender.id) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'Cannot Bite Yourself',
                description: 'Oops! You can\'t bite yourself, silly! \n Try biting someone else~'
            })] });
        }

        // Defer the reply to have more time
        await interaction.deferReply();

        try {

            // Select a random bite message
            const randomBiteMsg = biteMsgs[Math.floor(Math.random() * biteMsgs.length)](sender, target);

            // Fetch a random bite GIF from the database and check if one exists
            const gifObj = await actionGif.getRandomGif('bite');

            if (!gifObj) {
                return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                    title: 'No GIFs Available',
                    description: 'No bite GIFs are available at the moment. Please try again later.'
                })] });
            }

            const gifId = gifObj?.id;
            const gifUrl = gifObj?.url;

            // Send the bite embed
            return interaction.editReply({ embeds: [createMiyukiEmbed(miyuki, {
                description: randomBiteMsg,
                image: gifUrl,
                footer: { text: `GIF ID: ${gifId}` }
            })] });

        } catch (error) {

            // Log error in database
            errorHandler(error, {
                command: 'bite'
            });

            try {

                // Send error embed
                return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                    description: 'An error occurred while executing the command. Please try again later.'
                })] });

            } catch (err) {
                // Fallback
            }
        }
    }
}