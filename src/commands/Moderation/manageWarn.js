// Import necessary discord.js modules
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

// Import necessary modules
const path = require('path');

// Import embedBuilder
const { createMiyukiEmbed, createErrorEmbed, createSuccessEmbed } = require(path.join(__dirname, './../../utils/embedBuilder'));

// Import error handler
const { errorHandler } = require(path.join(__dirname, './../../utils/errorHandler'));

// Import warn database repo
const { warn } = require(path.join(__dirname, './../../database/repo'));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('managewarn')
        .setDescription('Manage Warnings')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addSubcommand(sc =>
            sc.setName('showall')
                .setDescription('Show all warnings (All or by user)')
                .addUserOption(opt =>
                    opt.setName('user')
                        .setDescription('The user to show warnings for')
                        .setRequired(false)
                )
                .addIntegerOption(opt =>
                    opt.setName('page')
                        .setDescription('Page number for all warned users')
                        .setRequired(false)
                )
        )
        .addSubcommand(sc =>
            sc.setName('showid')
                .setDescription('Show a specific warning by ID')
                .addIntegerOption(opt =>
                    opt.setName('id')
                        .setDescription('The ID of the warning to show')
                        .setRequired(true)
                )
        )
        .addSubcommand(sc =>
            sc.setName('delete')
                .setDescription('Delete a warning by ID')
                .addIntegerOption(opt =>
                    opt.setName('id')
                        .setDescription('The ID of the warning to delete')
                        .setRequired(true)
                )
        )
        .addSubcommand(sc =>
            sc.setName('clear')
                .setDescription('Clear all warnings for a user')
                .addUserOption(opt =>
                    opt.setName('user')
                        .setDescription('The user to clear warnings for')
                        .setRequired(true)
                )
        ),
    category: 'Moderation',
    usage: '/managewarn <subcommand>',
    async execute(interaction, miyuki) {

        // Ensure the command is used in a guild
        if (!interaction.inGuild()) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'Guild Only Command',
                description: 'This command can only be used in a server.'
            })] });
        }

        // Defer reply to allow more time for processing
        await interaction.deferReply();

        // Get the subcommand
        const subcommand = interaction.options.getSubcommand(false);

        try {
            if (subcommand === 'showall') {
                
                const user = interaction.options.getUser('user');
                const page = interaction.options.getInteger('page') || 1;
                const guild = interaction.guild;
                const perPage = 10;

                // Show all warnings for a specific user
                if (user) {
                    const warns = warn.getWarns(guild.id, user.id);

                    if (!warns.length) {
                        return interaction.editReply({ embeds: [createMiyukiEmbed(miyuki, {
                            title: 'No Warnings Found',
                            description: `${user.tag} has no warnings.`,
                        })] });
                    }

                    // Show warnings for the user
                    const lines = warns.map(w => `**ID:** ${w.id} | **Date:** <t:${Math.floor(w.timestamp / 1000)}:f> | **Reason:** ${w.reason}`).join('\n\n');

                    return interaction.editReply({ embeds: [createMiyukiEmbed(miyuki, {
                        title: `Warnings for ${user.tag}`,
                        description: `Total Warnings: ${warns.length} \n\n ${lines}`,
                    })] });
                }

                // Show all warned users
                const allWarns = warn.getWarnCountsForGuild(guild.id);

                if (!allWarns.length) {
                    return interaction.editReply({ embeds: [createMiyukiEmbed(miyuki, {
                        title: 'No Warnings Found',
                        description: 'There are no warnings in this server.',
                    })] });
                }

                const totalPages = Math.ceil(allWarns.length / perPage);

                // Validate page number
                if (page > totalPages) {
                    return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                        title: 'Invalid Page',
                        description: `The requested page ${page} exceeds the total pages ${totalPages}.`
                    })] });
                }

                const pagedWarns = allWarns.slice((page - 1) * perPage, page * perPage);

                const lines = pagedWarns.map(w => `**User:** <@${w.user_id}> | **Warnings:** ${w.count}`).join('\n');

                return interaction.editReply({ embeds: [createMiyukiEmbed(miyuki, {
                    title: `Warned Users (Page ${page}/${totalPages})`,
                    description: lines,
                })] });
            }

            if (subcommand === 'showid') {

                const warnId = interaction.options.getInteger('id');

                // Fetch the warning details from the database
                const warning = warn.getWarnById(warnId);

                if (!warning) {
                    return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                        title: 'Warning Not Found',
                        description: `No warning found with ID ${warnId}.`
                    })] });
                }

                // Send the warning details
                return interaction.editReply({ embeds: [createMiyukiEmbed(miyuki, {
                    title: 'Warning Details',
                    description: `Details for warning ID ${warnId}:`,
                    fields: [
                        { name: 'User', value: `<@${warning.user_id}>`, inline: true },
                        { name: 'Moderator', value: `<@${warning.moderator_id}>`, inline: true },
                        { name: 'Date', value: `<t:${Math.floor(warning.timestamp / 1000)}:f>`, inline: false },
                        { name: 'Reason', value: warning.reason, inline: false }
                    ]
                })] });  
            }

            if (subcommand === 'delete') {

                const warnId = interaction.options.getInteger('id');

                // Fetch the warning from the database
                const warnObj = warn.getWarnById(warnId);

                if (!warnObj) {
                    return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                        title: 'Warning Not Found',
                        description: `No warning found with ID ${warnId}.`
                    })] });
                }

                // Check if user is warned user
                if (warnObj.user_id === interaction.user.id) {
                    return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                        title: 'No Permission',
                        description: 'You cannot delete your own warnings.'
                    })] });
                }

                // Delete the warning
                const changes = warn.deleteWarnById(warnId);

                if (changes > 0) {
                    return interaction.editReply({ embeds: [createSuccessEmbed(miyuki, {
                        title: 'Warning Deleted',
                        description: `Successfully deleted warning ID ${warnId}.`
                    })] });
                }
            }

            if (subcommand === 'clear') {

                const user = interaction.options.getUser('user');

                // Fetch all warnings for the user
                const userWarns = warn.getWarns(interaction.guild.id, user.id);

                if (!userWarns.length) {
                    return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                        title: 'No Warnings Found',
                        description: `${user.tag} has no warnings to clear.`
                    })] });
                }

                // Check if user is warned user
                if (user.id === interaction.user.id) {
                    return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                        title: 'No Permission',
                        description: 'You cannot clear your own warnings.'
                    })] });
                }

                // Clear all warnings for the user
                const changes = deletedCount = warn.clearWarnsByUser(interaction.guild.id, user.id);

                if (changes > 0) {
                    return interaction.editReply({ embeds: [createSuccessEmbed(miyuki, {
                        title: 'Warnings Cleared',
                        description: `Successfully cleared ${changes} warnings for ${user.tag}.`
                    })] });
                }
            }

        } catch (error) {

            // Log error in database
            errorHandler(error, {
                context: 'Command',
                file: 'manageWarn'
            });

            try {

                // Send error embed
                return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                    description: 'An unexpected error occurred while executing the command. Please try again later.'
                })] });

            } catch (err) {
                // Fallback
            }
        }
    }
}