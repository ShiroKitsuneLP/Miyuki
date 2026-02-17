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

// Array of Hug Mmessages
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
        .setDescription('Hug Someone!')
        .addUserOption(opt =>
            opt.setName('target')
                .setDescription('The User u want to Hug')
                .setRequired(true)
        ),
    category: 'Action',
    usage: '/hug <User>',
    async execute(interaction, miyuki) {

        // Get target User and Sender
        const target = interaction.options.getUser('target');
        const sender = interaction.user;

        // Validate target user
        if (!target) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'User Not Found',
                desc: 'Please specify a valid User to Hug.'
            })] });
        }

        // Prevent users from Hugging themselves
        if (target.id === sender.id) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'Cannot Hug Yourself',
                desc: 'Oops! You can\'t Hug yourself, silly! \n Try hugging someone else~'
            })] });
        }

        // Defer the reply to have more time
        await interaction.deferReply();

        try {

            // Select a Random Hug Msg
            const randomHugMsg = hugMsgs[Math.floor(Math.random() * hugMsgs.length)](sender, target);

            // Fetch a Random Hug Gif from the Database and Check if one exists
            const gifObj = await actionGif.getRandomGifByAction('hug');

            if (!gifObj) {
                return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                    title: 'No Gifs Available',
                    desc: 'No Hug Gifs are available at the moment. Please try again later.'
                })] });
            }

            // Extract Gif Details from Database Object
            const gifId = gifObj?.id;
            const gifUrl = gifObj?.url;

            // Send the Hug Embed
            return interaction.editReply({ embeds: [createMiyukiEmbed(miyuki, {
                desc: randomHugMsg,
                image: gifUrl,
                footer: { text: `GIF ID: ${gifId}` }
            })] });

        } catch (error) {
            await errorHandler(error, {
                context: 'Command',
                category: 'Action',
                file: 'hug',
                interaction,
                client: miyuki
            });
        }
    }
}