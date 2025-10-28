// Import necessary discord.js modules
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

// Import necessary modules
const path = require('path');

// Import embedBuilder
const { createMiyukiEmbed, createSuccessEmbed, createErrorEmbed } = require(path.join(__dirname, './../../utils/embedBuilder'));

// Import error handler
const { errorHandler } = require(path.join(__dirname, './../../utils/errorHandler'));

// Import errorLog database repo
const { errorLog } = require(path.join(__dirname, './../../database/repo'));

// Import owner IDs
const { ownerIds } = require(path.join(__dirname, './../../config/config.json'));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('errorlog')
        .setDescription('Manage error logs')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sc =>
            sc.setName('show')
                .setDescription('Shows all error logs')
                .addIntegerOption(opt =>
                    opt.setName('page')
                        .setDescription('Page number of error logs to display')
                )
        )
        .addSubcommand(sc =>
            sc.setName('showid')
                .setDescription('Shows a specific error log by ID')
                .addIntegerOption(opt =>
                    opt.setName('id')
                        .setDescription('ID of the error log to display')
                        .setRequired(true)
                )
        )
        .addSubcommand(sc =>
            sc.setName('remove')
                .setDescription('Removes a specific error log by ID')
                .addIntegerOption(opt =>
                    opt.setName('id')
                        .setDescription('ID of the error log to remove')
                        .setRequired(true)
                )
        )
        .addSubcommand(sc =>
            sc.setName('clear')
                .setDescription('Clears all error logs')
        ),
    category: 'Utility',
    usage: '/errorlog <show|showid|remove|clear> [options]',
    async execute(interaction, miyuki) {

        // Check if the user is an owner
        if(!ownerIds.includes(interaction.user.id)) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'Permission Denied',
                description: 'You do not have permission to use this command.'
            })] });
        }

        // Defer reply to allow more time for processing
        await interaction.deferReply();

        // Get the subcommand
        const subcommand = interaction.options.getSubcommand(false);

        try {

            // Show all error logs
            if (subcommand === 'show') {

                // Get the page option if provided, default to 1
                const page = interaction.options.getInteger('page') || 1;
                const logsPerPage = 10;

                // Fetch all error logs from the database
                const allLogs = errorLog.listErrorLogs();
                const totalLogs = allLogs.length;

                // If no logs, send a simple embed and return
                if (totalLogs === 0) {
                    return interaction.editReply({ embeds: [createMiyukiEmbed(miyuki, {
                        title: 'Error Logs',
                        description: 'No error logs found.',
                        footer: { text: 'Total Logs: 0' }
                    })] });
                }

                const totalPages = Math.ceil(totalLogs / logsPerPage);

                // Validate page number
                if (page < 1 || page > totalPages) {
                    return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                        title: 'Invalid Page Number',
                        description: `Please provide a valid page number between 1 and ${totalPages}.`
                    })] });
                }

                // Get the logs for the requested page
                const start = (page - 1) * logsPerPage;
                const end = start + logsPerPage;
                const logsToShow = allLogs.slice(start, end);


                const lines = logsToShow.map(log => {
                    const date = new Date(log.timestamp).toLocaleString();
                    return `**ID:** ${log.id} | **Command:** ${log.command} | **Time:** ${date}`;
                });

                // Send the embed message with error logs
                await interaction.editReply({ embeds: [createMiyukiEmbed(miyuki, {
                    title: `Error Logs (Page ${page} of ${totalPages})`,
                    description: lines.join('\n'),
                    footer: { text: `Total Logs: ${totalLogs}` }
                })] });
            }

            // Show a specific error log by ID
            if (subcommand === 'showid') {

                // Get the ID option
                const id = interaction.options.getInteger('id', true);

                // Fetch the error log by ID from the database
                const log = errorLog.getErrorLogById(id);

                // Check if the log exists
                if (!log) {
                    return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                        title: 'Error Log Not Found',
                        description: `No error log found with ID ${id}.`
                    })] });
                }

                // Send the error log details in an embed
                return interaction.editReply({ embeds: [createMiyukiEmbed(miyuki, {
                    title: `Error Log ID: ${log.id}`,
                    fields: [
                        { name: 'Command', value: log.command || 'N/A' },
                        { name: 'Timestamp', value: log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A' },
                        { name: 'Error Message', value: log.error_message ? String(log.error_message).slice(0, 1000) : 'N/A' },
                        { name: 'Stack Trace', value: log.stack_trace ? `\`\`\`${String(log.stack_trace).slice(0, 1000)}\`\`\`` : 'N/A' }
                    ]
                })] });
            }

            // Remove a specific error log by ID
            if (subcommand === 'remove') {

                // Get the ID option
                const id = interaction.options.getInteger('id', true);

                // Attempt to remove the error log by ID
                const result = errorLog.removeErrorLogById(id);

                // Check if any row was deleted
                if (result.changes === 0) {
                    return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                        title: 'Error Log Not Found',
                        description: `No error log found with ID ${id}.`
                    })] });
                }

                // Send success embed
                return interaction.editReply({ embeds: [createSuccessEmbed(miyuki, {
                    title: 'Error Log Deleted',
                    description: `The error log with ID ${id} has been successfully deleted.`
                })] });
            }

            // Clear all error logs
            if (subcommand === 'clear') {

                // Clear all error logs from the database
                errorLog.clearErrorLogs();

                // Send success embed
                return interaction.editReply({ embeds: [createSuccessEmbed(miyuki, {
                    title: 'Error Logs Cleared',
                    description: 'All error logs have been successfully cleared from the database.'
                })] });
            }

        } catch (error) {

            // Log error in database
            errorHandler(error, {
                command: 'errorlog'
            });

            try {

                // Send error embed
                return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                    description: 'An unexpected error occurred while executing the command. The error has been logged.'
                })] });

            } catch (err) {
                // Fallback
            }
        }
    }
}