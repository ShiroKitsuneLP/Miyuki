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

// Array of Slap Messages
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
        .setDescription('Slap Someone!')
        .addUserOption(opt =>
            opt.setName('target')
                .setDescription('The User u want to Slap')
                .setRequired(true)
        ),
    category: 'Action',
    usage: '/slap <User>',
    async execute(interaction, miyuki) {

        // Get target User and Sender
        const target = interaction.options.getUser('target');
        const sender = interaction.user;

        // Validate target user
        if (!target) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'User Not Found',
                desc: 'Please specify a valid User to Slap.'
            })] });
        }

        // Prevent users from slapping themselves
        if (target.id === sender.id) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'Cannot Slap Yourself',
                desc: 'Oops! You can\'t Slap yourself, silly! \n Try slapping someone else~'
            })] });
        }

        // Defer the reply to have more time
        await interaction.deferReply();

        try {

            // Select a Random Slap Msg
            const randomSlapMsg = slapMsgs[Math.floor(Math.random() * slapMsgs.length)](sender, target);

            // Fetch a Random Slap Gif from the Database and Check if one exists
            const gifObj = await actionGif.getRandomGifByAction('slap');

            if (!gifObj) {
                return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                    title: 'No Gifs Available',
                    desc: 'No Slap Gifs are available at the moment. Please try again later.'
                })] });
            }

            // Extract Gif Details from Database Object
            const gifId = gifObj?.id;
            const gifUrl = gifObj?.url;

            // Send the Slap Embed
            return interaction.editReply({ embeds: [createMiyukiEmbed(miyuki, {
                desc: randomSlapMsg,
                image: gifUrl,
                footer: { text: `GIF ID: ${gifId}` }
            })] });

        } catch (error) {
            await errorHandler(error, {
                context: 'Command',
                category: 'Action',
                file: 'slap',
                interaction,
                client: miyuki
            });
        }
    }
}