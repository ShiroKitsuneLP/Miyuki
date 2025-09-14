// Import necessary classes from discord.js
const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, EmbedBuilder } = require('discord.js');

// Import trivia repository
const { trivia } = require('../../db/repo');

// Import color configuration
const { color } = require('./../../config/color.json');

// Import OwnerId
const { ownerId } = require('./../../config/config.json');

// Embed builders
function successEmbed(desc, client) {
    return new EmbedBuilder()
        .setColor(color.success)
        .setAuthor({ 
            name: client.user.username, 
            iconURL: client.user.displayAvatarURL({ dynamic: true, size: 2048 }) 
        })
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 2048 }))
        .setDescription(desc)
}

function errorEmbed(desc, client) {
    return new EmbedBuilder()
        .setColor(color.error)
        .setAuthor({ 
            name: client.user.username, 
            iconURL: client.user.displayAvatarURL({ dynamic: true, size: 2048 }) 
        })
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 2048 }))
        .setDescription(desc)
}

function infoEmbed(desc, client) {
    return new EmbedBuilder()
        .setColor(color.default)
        .setAuthor({ 
            name: client.user.username, 
            iconURL: client.user.displayAvatarURL({ dynamic: true, size: 2048 }) 
        })
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 2048 }))
        .setDescription(desc)
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('managetrivia')
        .setDescription('Manage Trivia Questions.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sc => 
            sc.setName('add')
                .setDescription('Add a Trivia Question')
                .addStringOption(o =>
                    o.setName('category')
                        .setDescription('The category of the trivia question')
                        .setRequired(true)
                )
                .addStringOption(o =>
                    o.setName('question')
                        .setDescription('The trivia question')
                        .setRequired(true)
                )
                .addStringOption(o =>
                    o.setName('answers')
                        .setDescription('The answers to the trivia question (comma-separated)')
                        .setRequired(true)
                )
                .addIntegerOption(o =>
                    o.setName('correct')
                        .setDescription('The correct answer option')
                        .setRequired(true)
                )
        )
        .addSubcommand(sc => 
            sc.setName('show')
                .setDescription('Show trivia questions')
                .addStringOption(o =>
                    o.setName('category')
                        .setDescription('Category')
                        .setRequired(false)
                )
                .addIntegerOption(o =>
                    o.setName('page')
                        .setDescription('Page number (default: 1)')
                        .setRequired(false)
                )
        )
        .addSubcommand(sc =>
            sc.setName('showid')
                .setDescription('Show trivia question by ID')
                .addIntegerOption(o =>
                    o.setName('id')
                        .setDescription('Trivia Question ID')
                        .setRequired(true)
                )
        )
        .addSubcommand(sc =>
            sc.setName('update')
                .setDescription('Update a trivia question by ID')
                .addIntegerOption(o =>
                    o.setName('id')
                        .setDescription('Trivia Question ID')
                        .setRequired(true)
                )
                .addStringOption(o =>
                    o.setName('category')
                        .setDescription('The category of the trivia question')
                        .setRequired(true)
                )
                .addStringOption(o =>
                    o.setName('question')
                        .setDescription('The trivia question')
                        .setRequired(true)
                )
                .addStringOption(o =>
                    o.setName('answers')
                        .setDescription('The answers to the trivia question (comma-separated)')
                        .setRequired(true)
                )
                .addIntegerOption(o =>
                    o.setName('correct')
                        .setDescription('The correct answer option (0-based index)')
                        .setRequired(true)
                )

        )
        .addSubcommand(sc =>
            sc.setName('delete')
                .setDescription('Delete a trivia question by ID')
                .addIntegerOption(o =>
                    o.setName('id')
                        .setDescription('Trivia Question ID')
                        .setRequired(true)
                )
        ),
    usage: '/managetrivia <subcommand> [options]',
    async execute(interaction, miyukiAdmin) {

        // Check if the user is the bot owner
        if (interaction.user.id !== ownerId) {
            return interaction.reply({ embeds: [errorEmbed('Only the bot owner can use this command.', miyukiAdmin)], flags: MessageFlags.Ephemeral });
        }

        await interaction.deferReply();

        const subcommand = interaction.options.getSubcommand();

        try {

            // Add a trivia question
            if (subcommand === 'add') {
                const category = interaction.options.getString('category', true);
                const question = interaction.options.getString('question', true);
                const answersRaw = interaction.options.getString('answers', true);
                const correct = interaction.options.getInteger('correct', true);
            
                const answers = answersRaw.split(',').map(a => a.trim()).filter(a => a.length);
                if (answers.length < 2) {
                    return interaction.editReply({ embeds: [errorEmbed('Please provide at least two answers, separated by commas.')] });
                }
                if (correct < 0 || correct >= answers.length) {
                    return interaction.editReply({ embeds: [errorEmbed(`Correct answer index must be between 0 and ${answers.length - 1}.`, miyukiAdmin)] });
                }
            
                trivia.add(category, question, answers, correct);
                return interaction.editReply({ embeds: [successEmbed(`Added trivia question in **${category}**.`, miyukiAdmin)] });
            }
            
            // Show trivia questions
            if (subcommand === 'show') {
                const category = interaction.options.getString('category');
                const page = interaction.options.getInteger('page') ?? 1;
                const limit = 10;
            
                const questions = trivia.list(category, limit, page);
                if (!questions.length) {
                    return interaction.editReply({ embeds: [infoEmbed(`No trivia questions found${category ? ` for **${category}**` : ''} (Page ${page}).`, miyukiAdmin)] });
                }
            
                const lines = questions.map(q =>
                    `\`${q.id}\` • ${q.question} [${q.answers.map((a, i) => i === q.correct_index ? `**${a}**` : a).join(', ')}]`
                );
                return interaction.editReply({ embeds: [infoEmbed(lines.join('\n'), miyukiAdmin).setTitle(`Trivia Questions${category ? `: ${category}` : ''} - Page: ${page}`)] });
            }
            
            // Show trivia question by ID
            if (subcommand === 'showid') {
                const id = interaction.options.getInteger('id', true);
                const question = trivia.showById(id);
            
                if (!question) {
                    return interaction.editReply({ embeds: [errorEmbed(`No trivia question found with ID \`${id}\`.`, miyukiAdmin)] });
                }
            
                return interaction.editReply({ embeds: [infoEmbed(`\`${question.id}\` • ${question.question}\nAnswers: ${question.answers.map((a, i) => i === question.correct_index ? `**${a}**` : a).join(', ')}`, miyukiAdmin)] });
            }
            
            // Update a trivia question
            if (subcommand === 'update') {
                const id = interaction.options.getInteger('id', true);
                const category = interaction.options.getString('category', true);
                const question = interaction.options.getString('question', true);
                const answersRaw = interaction.options.getString('answers', true);
                const correct = interaction.options.getInteger('correct', true);
            
                const answers = answersRaw.split(',').map(a => a.trim()).filter(a => a.length);
                if (answers.length < 2) {
                    return interaction.editReply({ embeds: [errorEmbed('Please provide at least two answers, separated by commas.', miyukiAdmin)] });
                }
                if (correct < 0 || correct >= answers.length) {
                    return interaction.editReply({ embeds: [errorEmbed(`Correct answer index must be between 0 and ${answers.length - 1}.`, miyukiAdmin)] });
                }
            
                const updated = trivia.update({
                    id,
                    category,
                    question,
                    answers,
                    correct_index: correct
                });
            
                if (!updated || updated.changes === 0) {
                    return interaction.editReply({ embeds: [errorEmbed(`No trivia question with ID \`${id}\` found or nothing changed.`, miyukiAdmin)] });
                }
                return interaction.editReply({ embeds: [successEmbed(`Trivia question \`${id}\` updated.`, miyukiAdmin)] });
            }
            
            // Delete a trivia question
            if (subcommand === 'delete') {
                const id = interaction.options.getInteger('id', true);
                const removed = trivia.removeById(id);
            
                if (!removed || removed.changes === 0) {
                    return interaction.editReply({ embeds: [errorEmbed(`No trivia question with ID \`${id}\` found.`, miyukiAdmin)] });
                }
                return interaction.editReply({ embeds: [successEmbed(`Trivia question \`${id}\` deleted.`, miyukiAdmin)] });
            }
        } catch (err) {
            return interaction.editReply({ embeds: [errorEmbed('Unexpected error while executing the command.', miyukiAdmin)] });
        }
    }
}