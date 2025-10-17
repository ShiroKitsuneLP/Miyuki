// Import necessary discord.js modules
const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

// Import necessary modules
const path = require('path');

// Import embedBuilder
const { createSuccessEmbed, createErrorEmbed } = require(path.join(__dirname, './../../utils/embedBuilder'));

// Import error handler
const { errorHandler } = require(path.join(__dirname, './../../utils/errorHandler'));

// Import errorLog database repo
const { errorLog } = require(path.join(__dirname, './../../database/repo'));

// Import owner IDs
const { ownerIds } = require(path.join(__dirname, './../../config/config.json'));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clearerrorlogs')
        .setDescription('Clears all error logs from the database')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    category: 'Utility',
    usage: '/clearerrorlogs',
    async execute(interaction, miyuki) {

        // Check if the user is an owner
        if(!ownerIds.includes(interaction.user.id)) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'Permission Denied',
                description: 'You do not have permission to use this command.'
            })] });
        }

        // Defer the reply to allow more time for processing
        await interaction.deferReply();

        try {

            // Clear all error logs from the database
            errorLog.clearErrorLogs();

            // Send success embed
            return interaction.editReply({ embeds: [createSuccessEmbed(miyuki, {
                title: 'Error Logs Cleared',
                description: 'All error logs have been successfully cleared from the database.'
            })] });
        } catch (error) {

            // Log the error in the database
            errorHandler(error, {
                guildId: interaction.guild?.id,
                userId: interaction.user.id,
                command: 'clearerrorlogs',
                context: 'Clearing all error logs'
            });

            // Send error embed
            return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                description: 'An error occurred while clearing error logs. Please try again later.',
                showPrivacyFooter: true
            })], flags: MessageFlags.Ephemeral });
        }
    }
}