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

// Array of Kiss Messages
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
        .setDescription('Kiss Someone!')
        .addUserOption(opt =>
            opt.setName('target')
                .setDescription('The User u want to Kiss')
                .setRequired(true)
        ),
    category: 'Action',
    usage: '/kiss <User>',
    async execute(interaction, miyuki) {

        // Get target User and Sender
        const target = interaction.options.getUser('target');
        const sender = interaction.user;

        // Validate target user
        if (!target) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'User Not Found',
                desc: 'Please specify a valid User to Kiss.'
            })] });
        }

        // Prevent users from kissing themselves
        if (target.id === sender.id) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'Cannot Kiss Yourself',
                desc: 'Oops! You can\'t Kiss yourself, silly! \n Try kissing someone else~'
            })] });
        }

        // Defer the reply to have more time
        await interaction.deferReply();

        try {

            // Select a Random Kiss Msg
            const randomKissMsg = kissMsgs[Math.floor(Math.random() * kissMsgs.length)](sender, target);

            // Fetch a Random Kiss Gif from the Database and Check if one exists
            const gifObj = await actionGif.getRandomGifByAction('kiss');

            if (!gifObj) {
                return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                    title: 'No Gifs Available',
                    desc: 'No Kiss Gifs are available at the moment. Please try again later.'
                })] });
            }

            // Extract Gif Details from Database Object
            const gifId = gifObj?.id;
            const gifUrl = gifObj?.url;

            // Send the Kiss Embed
            return interaction.editReply({ embeds: [createMiyukiEmbed(miyuki, {
                desc: randomKissMsg,
                image: gifUrl,
                footer: { text: `GIF ID: ${gifId}` }
            })] });

        } catch (error) {
            await errorHandler(error, {
                context: 'Command',
                category: 'Action',
                file: 'kiss',
                interaction,
                client: miyuki
            });
        }
    }
}