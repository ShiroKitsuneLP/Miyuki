// Import necessary Discord.js classes
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

// Import necessary modules
const path = require('path');

// Import embedBuilder
const { createMiyukiEmbed, createSuccessEmbed, createErrorEmbed } = require(path.resolve(__dirname, '../../utils/embedBuilder'));

// Import error handler
const { errorHandler } = require(path.resolve(__dirname, '../../utils/errorHandler'));

// Import errorLog database repo
const { errorLog } = require(path.resolve(__dirname, '../../database/repo'));

// Import owner IDs
const { ownerIds } = require(path.resolve(__dirname, '../../config/config.json'));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('errorlog')
        .setDescription('Manage Error logs')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sc =>
            sc.setName('show')
                .setDescription('Shows all Error logs')
                .addIntegerOption(opt =>
                    opt.setName('page')
                        .setDescription('Page number of Error logs to Display')
                )
        )
        .addSubcommand(sc =>
            sc.setName('showid')
                .setDescription('Shows a specific Error log by ID')
                .addIntegerOption(opt =>
                    opt.setName('id')
                        .setDescription('ID of the Error log to Display')
                        .setRequired(true)
                )
        )
        .addSubcommand(sc =>
            sc.setName('remove')
                .setDescription('Removes a specific Error log by ID')
                .addIntegerOption(opt =>
                    opt.setName('id')
                        .setDescription('ID of the Error log to remove')
                        .setRequired(true)
                )
        )
        .addSubcommand(sc =>
            sc.setName('clear')
                .setDescription('Clears all Error logs')
        ),
    category: 'Utility',
    usage: '/errorlog <show|showid|remove|clear> [options]',
    async execute(interaction, miyukiAdmin) {

        // Check if User is an Owner of Miyuki
        if(!ownerIds.includes(interaction.user.id)) {
            return interaction.reply({ embeds: [createErrorEmbed(miyukiAdmin, {
                title: 'Permission Denied',
                desc: 'You are not an Owner of Miyuki.'
            })] });
        }

        // Defer reply to allow more time for processing
        await interaction.deferReply();

        // Get the subcommand
        const subCommand = interaction.options.getSubcommand(false);

        try {

            let id;

            switch (subCommand) {

                // Show all Error Logs
                case 'show':
                    
                    // Get the page option if provided, default to 1
                    const page = interaction.options.getInteger('page') || 1;
                    const logsPerPage = 10;

                    // Fetch all error logs from the database
                    const allLogs = await errorLog.listErrorLogs();
                    const totalLogs = allLogs.length;

                    // Check no Error Log exists
                    if (totalLogs === 0) {
                        return interaction.editReply({ embeds: [createMiyukiEmbed(miyukiAdmin, {
                            title: 'Error Logs',
                            desc: 'No Error Logs found.',
                            footer: { text: 'Total Logs: 0' }
                        })] });
                    }

                    const totalPages = Math.ceil(totalLogs / logsPerPage);

                    // Validate Page Number
                    if (page < 1 || page > totalPages) {
                        return interaction.editReply({ embeds: [createErrorEmbed(miyukiAdmin, {
                            title: 'Invalid Page Number',
                            desc: `Please provide a valid page number between 1 and ${totalPages}.`
                        })] });
                    }

                    // Get the Logs for the requested Page
                    const start = (page - 1) * logsPerPage;
                    const end = start + logsPerPage;
                    const logsToShow = allLogs.slice(start, end);

                    const lines = logsToShow.map(log => {
                        const date = new Date(log.timestamp).toLocaleString();
                        return `**ID:** ${log.id} | **${log.context}:** ${log.file} | **Time:** ${date}`;
                    });

                    // Send Embed Message with Error Logs
                    return await interaction.editReply({ embeds: [createMiyukiEmbed(miyukiAdmin, {
                        title: `Error Logs (Page ${page} of ${totalPages})`,
                        desc: lines.join('\n'),
                        footer: { text: `Total Logs: ${totalLogs}` }
                    })] });

                // Show a specific Error Log by ID
                case 'showid':

                    // Get the ID option
                    id = interaction.options.getInteger('id', true);

                    // Fetch the error log by ID from the database
                    const log = await errorLog.getErrorLogById(id);

                    // Check if the Log exists
                    if (!log) {
                        return interaction.editReply({ embeds: [createErrorEmbed(miyukiAdmin, {
                            title: 'Error Log Not Found',
                            desc: `No Error Log found with ID: ${id}.`
                        })] });
                    }

                    // Send the Error Log details Embed
                    return await interaction.editReply({ embeds: [createMiyukiEmbed(miyukiAdmin, {
                        title: `Error Log ID: ${log.id}`,
                        fields: [
                            { name: log.category, value: log.context || 'N/A' },
                            { name: 'File', value: log.file || 'N/A' },
                            { name: 'Timestamp', value: log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A' },
                            { name: 'Error Message', value: log.error_message ? String(log.error_message).slice(0, 1000) : 'N/A' },
                            { name: 'Stack Trace', value: log.stack_trace ? `\`\`\`${String(log.stack_trace).slice(0, 1000)}\`\`\`` : 'N/A' }
                        ]
                    })] });

                // Remove a specific Error Log by ID
                case 'remove':

                    // Get the ID option
                    id = interaction.options.getInteger('id', true);

                    // Try to Remove the Error Log by ID
                    const result = await errorLog.removeErrorLogById(id);

                    // Check if any Error Log was deleted
                    if (result.rowCount === 0) {
                        return interaction.editReply({ embeds: [createErrorEmbed(miyukiAdmin, {
                            title: 'Error Log Not Found',
                            desc: `No Error Log found with ID: ${id}.`
                        })] });
                    }

                    return await interaction.editReply({ embeds: [createSuccessEmbed(miyukiAdmin, {
                        title: 'Error Log Deleted',
                        desc: `The Error Log with ID ${id} has been successfully deleted.`
                    })] });

                // Clear all Error Logs
                case 'clear':

                    // Clear all Error Logs from Database
                    await errorLog.clearErrorLogs();

                    // Send success Embed
                    return await interaction.editReply({ embeds: [createSuccessEmbed(miyukiAdmin, {
                        title: 'Error Logs Cleared',
                        desc: 'All error logs have been successfully cleared from the database.'
                    })] });
                default:
                    // Fallback
                   return interaction.editReply({ embeds: [createErrorEmbed(miyukiAdmin, {
                    title: 'Unknown Subcommand',
                    desc: 'This subcommand does not exist.'
                   })] });
            }

        } catch (error) {
            await errorHandler(error, {
                context: 'AdminCommand',
                category: 'Utility',
                file: 'errorLog',
                interaction,
                client: miyukiAdmin
            });
        }
    }
}