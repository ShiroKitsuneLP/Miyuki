// Import necessary discord.js modules
const { SlashCommandBuilder } = require('discord.js');

// Import necessary modules
const path = require('path');

// Import embedBuilder
const { createMiyukiEmbed, createErrorEmbed } = require(path.join(__dirname, './../../utils/embedBuilder'));

// Import actiongif database repo
const { actiongif } = require(path.join(__dirname, './../../database/repo'));

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

        // Array of kiss messages
        const kissMsgs = [
            `${sender} gives ${target} a sweet kiss! Mwah~`,
            `${sender} gently kisses ${target} on the cheek!`,
            `${sender} pulls ${target} in for a tender kiss. Feeling the love?`,
            `${sender} gives ${target} a loving kiss. You're not alone!`,
            `${sender} kisses ${target}. There, there, everything will be okay!`
        ];

        // Select a random kiss message
        const randomKissMsg = kissMsgs[Math.floor(Math.random() * kissMsgs.length)];

        // Fetch a random kiss GIF from the database and check if one exists
        const gifObj = actiongif.getRandomGif('kiss');

        if (!gifObj) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'No GIFs Available',
                description: 'No kiss GIFs are available at the moment.'
            })] });
        }

        const gifId = gifObj.id;
        const gifUrl = gifObj.url;

        // send the kiss embed
        await interaction.reply({ embeds: [createMiyukiEmbed(miyuki, {
            title: 'Kiss!',
            description: randomKissMsg,
            image: gifUrl,
            footer: { text: `Pat provided by Miyuki | GIF ID: ${gifId ?? 'unknown'}`, iconURL: miyuki.user.displayAvatarURL() }
        })] });
    }
}