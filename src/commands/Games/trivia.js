// Import necessary classes from discord.js
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');

// Import trivia repository
const { trivia } = require('../../db/repo');

// Import color configuration
const { color } = require('./../../config/color.json');

const categories = ['Anime', 'Gaming'];

// Embed builders
function errorEmbed(desc, client) {
    return new EmbedBuilder()
        .setColor(color.error)
        .setAuthor({ 
            name: client.user.username, 
            iconURL: client.user.displayAvatarURL({ dynamic: true, size: 2048 })
        })
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 2048 }))
        .setDescription(desc);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trivia')
        .setDescription('Answer a random trivia question')
        .addStringOption(o =>
            o.setName('category')
                .setDescription('Category of the trivia question')
                .setRequired(false)
                .addChoices(...categories.map(c => ({ name: c, value: c.toLowerCase() })))
        ),
    usage: '/trivia [category]',
    async execute(interaction, miyuki) {

        // Get the category option if provided
        const category = interaction.options.getString('category') ?? null;

        // Fetch a random trivia question from the database and check if it exists
        const questionData = trivia.getRandom(category);

        if (!questionData) {
            return interaction.reply({ embeds: [errorEmbed(`No trivia questions found${category ? ` for category **${category}**` : ''}.`, miyuki)], flags: MessageFlags.Ephemeral }); 
        }

        // Shuffle answers
        const shuffledAnswers = questionData.answers.map((answer, idx) => ({
            answer,
            isCorrect: idx === questionData.correct_index
        })).sort(() => Math.random() - 0.5);

        // Find the new index of the correct answer after shuffling
        const newCorrectIndex = shuffledAnswers.findIndex(a => a.isCorrect);

        // Save trivia session for the user
        interaction.client.trivia ??= {};
        interaction.client.trivia[interaction.user.id] = {
            questionId: questionData.id,
            correctAnswer: newCorrectIndex,
            timestamp: Date.now(),
            answers: shuffledAnswers.map(a => a.answer)
        };

        // Create buttons for each answer
        const row = new ActionRowBuilder();
        shuffledAnswers.forEach((a, i) => {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`trivia_${interaction.user.id}_${i}`)
                    .setLabel(a.answer)
                    .setStyle(ButtonStyle.Primary)
            );
        });

        // Create the embed message
        const triviaEmbed = new EmbedBuilder()
            .setColor(color.default)
            .setTitle(`${questionData.category} Trivia Question`)
            .setAuthor({ 
                name: miyuki.user.username, 
                iconURL: miyuki.user.displayAvatarURL() 
            })
            .setThumbnail(miyuki.user.displayAvatarURL())
            .setDescription(questionData.question)
            .setFooter({ text: `Question ID: ${questionData.id}` });

        // Send the embed message
        await interaction.reply({ embeds: [triviaEmbed], components: [row] });
    }
}