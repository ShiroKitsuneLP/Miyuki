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
        .setName('slap')
        .setDescription('Slap someone!')
        .addUserOption(opt => 
            opt.setName('target')
               .setDescription('The user to slap')
                .setRequired(true)
        ),
    usage: '/slap <target>',
    async execute(interaction, miyuki) {

        // Get target user and sender
        const target = interaction.options.getUser('target');
        const sender = interaction.user;

        // Validate target user
        if (!target) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'User Not Found',
                description: 'Please specify a valid user to slap.'
            })] });
        }

        // Prevent users from slapping themselves
        if (target.id === sender.id) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'Cannot Slap Yourself',
                description: 'Oops! You can\'t slap yourself, silly! \n Try slapping someone else~'
            })] });
        }

        // Array of slap messages
        const slapMsgs = [
            `${sender} gives ${target} a playful slap! Ouch!`,
            `${sender} slaps ${target} gently!`,
            `${sender} slaps ${target} softly. Feeling the love?`,
            `${sender} gives ${target} a light slap. You're not alone!`,
            `${sender} slaps ${target}. There, there, everything will be okay!`
        ];

        // Select a random slap message
        const randomSlapMsg = slapMsgs[Math.floor(Math.random() * slapMsgs.length)];

        // Fetch a random slap GIF from the database and check if one exists
        const gifObj = actiongif.getRandomGif('slap');

        if (!gifObj) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'No GIFs Available',
                description: 'Sorry, there are no slap GIFs available at the moment. Please try again later.'
            })] });
        }

        const gifId = gifObj.id;
        const gifUrl = gifObj.url;

        // Send the slap embed
        await interaction.reply({ embeds: [createMiyukiEmbed(miyuki, {
            title: 'Slap!',
            description: randomSlapMsg,
            image: gifUrl,
            footer: { text: `Slap provided by Miyuki | GIF ID: ${gifId ?? 'unknown'}`, iconURL: miyuki.user.displayAvatarURL() }
        })] });
    }
}