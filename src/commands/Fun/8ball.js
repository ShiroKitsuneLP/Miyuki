// Import necessary discord.js modules
const { SlashCommandBuilder } = require('discord.js');

// Import necessary modules
const path = require('path');

// Import embedBuilder
const { createMiyukiEmbed } = require(path.join(__dirname, './../../utils/embedBuilder'));

// Import error handler
const { errorHandler } = require(path.resolve(__dirname, '../../utils/errorHandler'));

// Magic 8ball responses
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
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Ask the magic 8ball a question!')
        .addStringOption(opt => 
            opt.setName('question')
                .setDescription('The question you want to ask the magic 8ball')
                .setRequired(true)
        ),
    category: 'Fun',
    usage: '/8ball <question>',
    async execute(interaction, miyuki) {

        // Simulate Thinking
        await interaction.deferReply();

        await new Promise(resolve => setTimeout(resolve, 2000));

        try {

            // Get the question from options
            const question = interaction.options.getString('question');

            // Select a random response
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];

            // Send the embed reply
            return interaction.editReply({ embeds: [createMiyukiEmbed(miyuki, {
                title: 'The Magic 8ball',
                fields: [
                    { name: 'Your Question', value: question },
                    { name: '8ball\'s Answer', value: randomResponse }
                ]
            })] });
            
        } catch (error) {
            await errorHandler(error, {
                context: 'Command',
                category: 'Utility',
                file: '8ball',
                interaction,
                client: miyuki
            });
        }
    }
}