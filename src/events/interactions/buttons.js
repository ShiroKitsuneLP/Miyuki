//Import necessary classes from discord.js
const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, MessageFlags } = require('discord.js');


const { color } = require('./../../config/color.json');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, miyuki) {
        if (!interaction.isButton()) return;

        if (interaction.customId.startsWith('trivia_')) {
            await interaction.deferUpdate();

            // Trivia session per user
            const triviaSession = miyuki.trivia?.[interaction.user.id];
            if (!triviaSession) {
                return await interaction.followUp({
                    content: 'This trivia is not for you, or the quiz has already finished/expired!',
                    flags: MessageFlags.Ephemeral
                });
            }

            // Timeout check (e.g. 30 seconds)
            if (Date.now() - triviaSession.timestamp > 30 * 1000) {
                await interaction.followUp({
                    content: 'This trivia question has expired!',
                    flags: MessageFlags.Ephemeral
                });
                delete miyuki.trivia[interaction.user.id];
                return;
            }

            // Get selected answer index
            const selectedIndex = parseInt(interaction.customId.split('_').pop());
            const correctIndex = triviaSession.correctAnswer;

            // Disable buttons after answer
            const disabledComponents = interaction.message.components.map(row => {
                const newRow = new ActionRowBuilder();
                row.components.forEach(button => {
                    newRow.addComponents(ButtonBuilder.from(button).setDisabled(true));
                });
                return newRow;
            });
            await interaction.message.edit({ components: disabledComponents });

            // Build result embed
            let embed;
            if (selectedIndex === correctIndex) {
                embed = new EmbedBuilder()
                    .setTitle('Correct!')
                    .setColor(color.success)
                    .setDescription('You answered the question correctly! 🎉');
            } else {
                embed = new EmbedBuilder()
                    .setTitle('Incorrect!')
                    .setColor(color.error)
                    .setDescription('Your answer was wrong.')
                    .addFields(
                        { name: 'Your Answer', value: `\`${triviaSession.answers[selectedIndex]}\``, inline: true },
                        { name: 'Correct Answer', value: `\`${triviaSession.answers[correctIndex]}\``, inline: true }
                    );
            }

            await interaction.followUp({ embeds: [embed], flags: MessageFlags.Ephemeral });

            // Remove session
            delete miyuki.trivia[interaction.user.id];
        }
    }
};