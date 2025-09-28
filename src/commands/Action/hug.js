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

        // Array of hug messages
        const hugMsgs = [
            `${sender} gives ${target} a big warm hug! There, there~`,
            `${sender} wraps their arms around ${target} in a comforting hug!`,
            `${sender} pulls ${target} into a tight hug. Feeling better now?`,
            `${sender} gives ${target} a gentle hug. You're not alone!`,
            `${sender} hugs ${target}. There, there, everything will be okay!`
        ];

        // Select a random hug message
        const randomHugMsg = hugMsgs[Math.floor(Math.random() * hugMsgs.length)];

        // Fetch a random hug GIF from the database and check if one exists
        const gifObj = actiongif.getRandomGif('hug');

        if (!gifObj) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'No GIFs Available',
                description: 'No hug GIFs are available at the moment. Please try again later.'
            })] });
        }

        const gifId = gifObj?.id;
        const gifUrl = gifObj?.url;

        // Send the hug embed
        await interaction.reply({ embeds: [createMiyukiEmbed(miyuki, {
            title: 'A Sweet Hug!',
            description: randomHugMsg,
            image: gifUrl,
            footer: { text: `Hug provided by Miyuki | GIF ID: ${gifId ?? 'unknown'}`, iconURL: miyuki.user.displayAvatarURL() }
        })] });
    }
}