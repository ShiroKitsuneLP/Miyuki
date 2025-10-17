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
        .setName('errorlogs')
        .setDescription('Shows all error logs')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addIntegerOption(opt =>
            opt.setName('page')
                .setDescription('Page number of error logs to display')
        ),
    category: 'Utility',
    usage: '/errorlogs [page]',
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

            // Show Error Logs
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

        } catch (error) {

            // Log the error in the database
            errorHandler(error, {
                guildId: interaction.guild?.id,
                userId: interaction.user.id,
                command: 'errorlogs',
                context: 'Fetching error logs'
            });

            return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                description: 'An error occurred while fetching error logs. Please try again later.',
                showPrivacyFooter: true
            })], flags: MessageFlags.Ephemeral });
        }
    }
}