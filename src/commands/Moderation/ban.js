// Import necessary discord.js modules
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

// Import necessary modules
const path = require('path');

// Import embedBuilder
const { createMiyukiEmbed, createErrorEmbed, createSuccessEmbed } = require(path.join(__dirname, './../../utils/embedBuilder'));

// Import error handler
const { errorHandler } = require(path.join(__dirname, './../../utils/errorHandler'));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user from the server')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption(opt => 
            opt.setName('user')
                .setDescription('The user to ban')
                .setRequired(true)
        )
        .addStringOption(opt => 
            opt.setName('reason')
                .setDescription('The reason for the ban')
                .setRequired(false)
        ),
    category: 'Moderation',
    usage: '/ban <user> [reason]',
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
                title: 'You cannot ban Miyuki',
                description: 'Miyuki is a good bot and does not deserve to be banned.'
            })] });
        }

        // Check if user is a bot
        if (user.bot) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'You cannot ban bots',
                description: 'Bots cannot be banned. Please try banning a human user.'
            })] });
        }

        // Check if user is moderator
        if (user.id === moderator.id) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'You cannot ban yourself',
                description: 'Moderators cannot ban themselves.'
            })] });
        }

        // Check if user is same or higher role than moderator
        const memberToBan = await guild.members.fetch(user.id);
        const moderatorMember = await guild.members.fetch(moderator.id);

        if (memberToBan.roles.highest.position >= moderatorMember.roles.highest.position) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'You cannot ban this user',
                description: 'You cannot ban this user because they have the same or higher role than you.'
            })] });
        }

        // Check if user has admin permissions
        if (memberToBan.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'You cannot ban admins',
                description: 'Administrators cannot be banned. Please try banning a non-admin user.'
            })] });
        }

        // Defer reply to allow more time for processing
        await interaction.deferReply();

        try {

            // Ban the user
            await guild.members.ban(user.id, { 
                reason: `Banned by ${moderator.tag} | Reason: ${reason}` 
            });

            // Send success embed
            await interaction.editReply({ embeds: [createSuccessEmbed(miyuki, {
                title: 'User Banned',
                description: `<@${user.id}> has been banned from the server.`,
                fields: [
                    { name: 'Reason', value: reason, inline: false },
                    { name: 'Moderator', value: `<@${moderator.id}>`, inline: true }
                ]
            })] });

            // Try to send DM to banned user
            try {
                await user.send({ embeds: [createMiyukiEmbed(miyuki, {
                    title: `You have been banned from ${guild.name}`,
                    description: `If you have any questions, please contact the server staff.`,
                    fields: [
                        { name: 'Reason', value: reason, inline: false },
                        { name: 'Moderator', value: `<@${moderator.id}>`, inline: true }
                    ]
                })] });

            } catch (dmError) {
                // DM are closed
            }
        } catch (error) {

            // Log error in database
            errorHandler(error, {
                context: 'Command',
                file: 'ban'
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