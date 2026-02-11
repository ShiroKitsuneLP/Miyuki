// Import necessary Discord.js classes
const { SlashCommandBuilder } = require('discord.js');

// Import necessary modules
const path = require('path');

// Import embedBuilder
const { createMiyukiEmbed, createErrorEmbed } = require(path.join(__dirname, './../../utils/embedBuilder'));

// Import error handler
const { errorHandler } = require(path.resolve(__dirname, '../../utils/errorHandler'));

// Import errorLog database repo
const { actionGif } = require(path.resolve(__dirname, '../../database/repo'));

// Array of Pat Messages
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
        .setDescription('Pat Someone!')
        .addUserOption(opt =>
            opt.setName('target')
                .setDescription('The User u want to Pat')
                .setRequired(true)
        ),
    category: 'Action',
    usage: '/pat <User>',
    async execute(interaction, miyuki) {

        // Get target User and Sender
        const target = interaction.options.getUser('target');
        const sender = interaction.user;

        // Validate target user
        if (!target) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'User Not Found',
                desc: 'Please specify a valid User to Pat.'
            })] });
        }

        // Prevent users from patting themselves
        if (target.id === sender.id) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'Cannot Pat Yourself',
                desc: 'Oops! You can\'t Pat yourself, silly! \n Try patting someone else~'
            })] });
        }

        // Defer the reply to have more time
        await interaction.deferReply();

        try {

            // Select a Random Pat Msg
            const randomPatMsg = patMsgs[Math.floor(Math.random() * patMsgs.length)](sender, target);

            // Fetch a Random Pat Gif from the Database and Check if one exists
            const gifObj = await actionGif.getRandomGifByAction('pat');

            if (!gifObj) {
                return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                    title: 'No Gifs Available',
                    desc: 'No Pat Gifs are available at the moment. Please try again later.'
                })] });
            }

            // Extract Gif Details from Database Object
            const gifId = gifObj?.id;
            const gifUrl = gifObj?.url;

            // Send the Pat Embed
            return interaction.editReply({ embeds: [createMiyukiEmbed(miyuki, {
                desc: randomPatMsg,
                image: gifUrl,
                footer: { text: `GIF ID: ${gifId}` }
            })] });

        } catch (error) {
            await errorHandler(error, {
                context: 'Command',
                category: 'Action',
                file: 'pat',
                interaction,
                client: miyuki
            });
        }
    }
}