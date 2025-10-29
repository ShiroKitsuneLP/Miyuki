// Import necessary discord.js modules
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

// Import necessary modules
const path = require('path');

// Import embedBuilder
const { createErrorEmbed, createWarnEmbed, createDMWarnEmbed } = require(path.join(__dirname, './../../utils/embedBuilder'));

// Import error handler
const { errorHandler } = require(path.join(__dirname, './../../utils/errorHandler'));

// Import warn database repo
const { warn } = require(path.join(__dirname, './../../database/repo'));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn a user')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption(opt => 
            opt.setName('user')
                .setDescription('The user to warn')
                .setRequired(true)
        )
        .addStringOption(opt => 
            opt.setName('reason')
                .setDescription('The reason for the warning')
                .setRequired(false)
        ),
    category: 'Moderation',
    usage: '/warn <user> [reason]',
    async execute(interaction, miyuki) {

        // Ensure the command is used in a guild
        if (!interaction.inGuild()) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'Guild Only Command',
                description: 'This command can only be used in a server.'
            })] });
        }

        // Get command options
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const guild = interaction.guild;
        const moderator = interaction.user;

        // Check if user is miyuki
        if (user.id === miyuki.user.id) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'You cannot warn Miyuki',
                description: 'Miyuki is a good bot and does not deserve to be warned.'
            })] });
        }

        // Check if user is a bot
        if (user.bot) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'Cannot Warn Bots',
                description: 'Bots cannot be warned. Please try warning a human user.'
            })] });
        }

        // Check if user is moderator
        if (user.id === moderator.id) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'Cannot Warn Yourself',
                description: 'You cannot warn yourself. Please try warning another user.'
            })] });
        }

        // Check if user is same or higher role than moderator
        const memberToWarn = await guild.members.fetch(user.id);
        const moderatorMember = await guild.members.fetch(moderator.id);

        if (memberToWarn.roles.highest.position >= moderatorMember.roles.highest.position) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'Cannot Warn User',
                description: 'You cannot warn this user because they have the same or higher role than you.'
            })] });
        }

        // check if user has admin permissions
        if (memberToWarn.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'Cannot Warn Admins',
                description: 'Administrators cannot be warned. Please try warning a non-admin user.'
            })] });
        }

        // Defer reply to allow more time for processing
        await interaction.deferReply();

        try {

            // Add warning to database
            warn.addWarn(guild.id, user.id, moderator.id, reason);

            const warnCount = warn.countWarns(guild.id, user.id);

            // Send success embed
            await interaction.editReply({ embeds: [createWarnEmbed(miyuki, {
                user,
                moderator,
                reason,
                warnCount
            })] });

            // Try to send DM to warned user
            try {
                await user.send({ embeds: [createDMWarnEmbed(miyuki, {
                    guild,
                    moderator,
                    reason
                })] });

            } catch (dmError) {
                // DM are closed
            }
        } catch (error) {

            // Log error in database
            errorHandler(error, {
                command: 'warn'
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