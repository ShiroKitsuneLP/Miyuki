// Import necessary discord.js modules
const { SlashCommandBuilder } = require('discord.js');

// Import necessary modules
const path = require('path');

// Import embedBuilder
const { createMiyukiEmbed, createErrorEmbed } = require(path.join(__dirname, './../../utils/embedBuilder'));

// Import actionGif database repo
const { actionGif } = require(path.join(__dirname, './../../database/repo'));

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

        // Array of bite messages
        const biteMsgs = [
            `${sender} playfully bites ${target}! Nom nom~`,
            `${sender} gives ${target} a gentle nibble!`,
            `${sender} bites ${target} softly. Feeling the love?`,
            `${sender} gives ${target} a cute little bite. You're not alone!`,
            `${sender} bites ${target}. There, there, everything will be okay!`
        ];

        // Select a random bite message
        const randomBiteMsg = biteMsgs[Math.floor(Math.random() * biteMsgs.length)];

        // Fetch a random bite GIF from the database and check if one exists
        const gifObj = actionGif.getRandomGif('bite');

        if (!gifObj) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'No GIFs Available',
                description: 'No bite GIFs are available at the moment.'
            })] });
        }

        const gifId = gifObj.id;
        const gifUrl = gifObj.url;

        // send the bite embed
        await interaction.reply({ embeds: [createMiyukiEmbed(miyuki, {
            title: 'Bite!',
            description: randomBiteMsg,
            image: gifUrl,
            footer: { text: `Bite provided by Miyuki | GIF ID: ${gifId ?? 'unknown'}`, iconURL: miyuki.user.displayAvatarURL() }
        })] });
    }
}