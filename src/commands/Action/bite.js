// Import necessary Discord.js classes
const { SlashCommandBuilder } = require('discord.js');

// Import necessary modules
const path = require('path');

// Import embedBuilder
const { createMiyukiEmbed, createErrorEmbed } = require(path.resolve(__dirname, '../../utils/embedBuilder'));

// Import error handler
const { errorHandler } = require(path.resolve(__dirname, '../../utils/errorHandler'));

// Import errorLog database repo
const { actionGif } = require(path.resolve(__dirname, '../../database/repo'));

// Array of Bite Messages
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
        .setDescription('Bite Someone!')
        .addUserOption(opt =>
            opt.setName('target')
                .setDescription('The User u want to Bite')
                .setRequired(true)
        ),
    category: 'Action',
    usage: '/bite <User>',
    async execute(interaction, miyuki) {

        // Get target User and Sender
        const target = interaction.options.getUser('target');
        const sender = interaction.user;

        // Validate target user
        if (!target) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'User Not Found',
                desc: 'Please specify a valid User to Bite.'
            })] });
        }

        // Prevent users from biting themselves
        if (target.id === sender.id) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'Cannot Bite Yourself',
                desc: 'Oops! You can\'t Bite yourself, silly! \n Try biting someone else~'
            })] });
        }

        // Defer the reply to have more time
        await interaction.deferReply();

        try {

            // Select a Random Bite Msg
            const randomBiteMsg = biteMsgs[Math.floor(Math.random() * biteMsgs.length)](sender, target);

            // Fetch a Random Bite Gif from the Database and Check if one exists
            const gifObj = await actionGif.getRandomGifByAction('bite');

            if (!gifObj) {
                return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                    title: 'No Gifs Available',
                    desc: 'No Bite Gifs are available at the moment. Please try again later.'
                })] });
            }

            // Extract Gif Details from Database Object
            const gifId = gifObj?.id;
            const gifUrl = gifObj?.url;

            // Send the Bite Embed
            return interaction.editReply({ embeds: [createMiyukiEmbed(miyuki, {
                desc: randomBiteMsg,
                image: gifUrl,
                footer: { text: `GIF ID: ${gifId}` }
            })] });

        } catch (error) {
            await errorHandler(error, {
                context: 'Command',
                category: 'Action',
                file: 'bite',
                interaction,
                client: miyuki
            });
        }
    }
}