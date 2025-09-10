// Import necessary classes from discord.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Import color configuration
const { color } = require('./../../config/color.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Ask the magic 8ball a question.')
        .addStringOption(option =>
            option
                .setName('question')
                .setDescription('The question you want to ask the 8ball.')
                .setRequired(true)
        ),
    usage: '/8ball <question>',
    async execute(interaction, miyuki) {
        
        // Get the question from the options
        const question = interaction.options.getString('question');

        // List of possible 8ball responses
        const responses = [
            'Absolutely~',
            'Yup yup!',
            'For sure~',
            'Definitely~ I pinky promise!',
            'Mhm... yes~',
            'Nope!',
            'Nuh-uh! Not happening~',
            'No way, silly!',
            'Don\'t count on it~',
            'Hmm... maybe?',
            'It\'s a mystery~',
            'Possibly... who knows?',
            'Try asking again, but cuter~',
            'I\'m not telling~ hehehe~',
            'My tails say yes~',
            'Too fluffy to answer right now~',
            'Ask again when you\'re holding a plushie~',
            'Only if you bring me snacks~',
            'You already know the answer, don\'t you~?',
            'UwU... let fate decide~'
        ];

        // Select a random response
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];

        // Create the embed message
        const eightBallEmbed = new EmbedBuilder()
            .setColor(color.default)
            .setTitle('The Magic 8ball')
            .setAuthor({
                name: miyuki.user.username,
                iconURL: miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 })
            })
            .addFields(
                { name: 'Your Question', value: question },
                { name: '8ball\'s Answer', value: randomResponse }
            );

        await interaction.reply({ embeds: [eightBallEmbed] });
        
    }
}