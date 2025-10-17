// Import necessary discord.js modules
const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

// Import necessary modules
const path = require('path');

// Import embedBuilder
const { createMiyukiEmbed, createErrorEmbed } = require(path.join(__dirname, './../../utils/embedBuilder'));

// Import error handler
const { errorHandler } = require(path.join(__dirname, './../../utils/errorHandler'));

// Import errorLog database repo
const { errorLog } = require(path.join(__dirname, './../../database/repo'));

// Import owner IDs
const { ownerIds } = require(path.join(__dirname, './../../config/config.json'));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('showerrorlog')
        .setDescription('Shows an error log by its ID')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addIntegerOption(opt =>
            opt.setName('id')
                .setDescription('ID of the error log to display')
                .setRequired(true)
        ),
    category: 'Utility',
    usage: '/showerrorlog <id>',
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

            // Fetch the error log by ID from the database
            const log = errorLog.getErrorLogById(id);

            // Check if the log exists
            if (!log) {
                return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                    title: 'Error Log Not Found',
                    description: `No error log found with ID ${id}.`
                })], flags: MessageFlags.Ephemeral });
            }

            // Send the error log details in an embed
            return interaction.editReply({ embeds: [createMiyukiEmbed(miyuki, {
                title: `Error Log ID: ${log.id}`,
                fields: [
                    { name: 'Guild ID', value: log.guild_id || 'N/A' },
                    { name: 'User ID', value: log.user_id || 'N/A' },
                    { name: 'Command', value: log.command || 'N/A' },
                    { name: 'Timestamp', value: log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A' },
                    { name: 'Error Message', value: log.error_message ? String(log.error_message).slice(0, 1000) : 'N/A' },
                    { name: 'Stack Trace', value: log.stack_trace ? `\`\`\`${String(log.stack_trace).slice(0, 1000)}\`\`\`` : 'N/A' }
                ]
            })] });

        } catch (error) {
            console.error(error);

            // Log the error in the database
            errorHandler(error, {
                guildId: interaction.guild?.id,
                userId: interaction.user.id,
                command: 'showerrorlog',
                context: 'Showing an error log by ID'
            });

            // Send error embed
            return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                description: 'An error occurred while trying to fetch the error log. Please try again later.',
                showPrivacyFooter: true
            })] });
        }
    }
}