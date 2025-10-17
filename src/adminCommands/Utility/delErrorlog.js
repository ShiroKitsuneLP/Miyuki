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
        .setName('delerrorlog')
        .setDescription('Deletes an error log by its ID')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addIntegerOption(opt =>
            opt.setName('id')
                .setDescription('ID of the error log to delete')
                .setRequired(true)
        ),
    category: 'Utility',
    usage: '/delerrorlog <id>',
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

            // Get the ID option
            const id = interaction.options.getInteger('id');

            // Attempt to remove the error log by ID
            const result = errorLog.removeErrorLogById(id);

            // Check if any row was deleted
            if (result.changes === 0) {
                return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                    title: 'Error Log Not Found',
                    description: `No error log found with ID ${id}.`
                })], flags: MessageFlags.Ephemeral });
            }

            // Send success embed
            return interaction.editReply({ embeds: [createSuccessEmbed(miyuki, {
                title: 'Error Log Deleted',
                description: `The error log with ID ${id} has been successfully deleted.`
            })] });

        } catch (error) {

            // Log the error in the database
            errorHandler(error, {
                guildId: interaction.guild?.id,
                userId: interaction.user.id,
                command: 'delerrorlog',
                context: 'Deleting an error log by ID'
            });

            // Send error embed
            return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                description: 'An error occurred while trying to delete the error log. Please try again later.',
                showPrivacyFooter: true
            })], flags: MessageFlags.Ephemeral });
        }
    }
}