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
        .setName('kick')
        .setDescription('Kick a user from the server')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption(opt => 
            opt.setName('user')
                .setDescription('The user to kick')
                .setRequired(true)
        )
        .addStringOption(opt => 
            opt.setName('reason')
                .setDescription('The reason for the kick')
                .setRequired(false)
        ),
    category: 'Moderation',
    usage: '/kick <user> [reason]',
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
                title: 'You cannot kick Miyuki',
                description: 'Miyuki is a good bot and does not deserve to be kicked.'
            })] });
        }

        // Check if user is a bot
        if (user.bot) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'You cannot kick bots',
                description: 'Bots cannot be kicked. Please try kicking a human user.'
            })] });
        }

        // Check if user is moderator
        if (user.id === moderator.id) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'You cannot kick yourself',
                description: 'If you want to leave the server, please do so voluntarily.'
            })] });
        }

        // Check if user is same or higher role than moderator
        const memberToKick = await guild.members.fetch(user.id);
        const modMember = await guild.members.fetch(moderator.id);

        if (memberToKick.roles.highest.position >= modMember.roles.highest.position) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'You cannot kick this user',
                description: 'The user you are trying to kick has the same or higher role than you.'
            })] });
        }

        // Check if user has admin permissions
        if (memberToKick.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'You cannot kick this user',
                description: 'Administrators cannot be kicked.'
            })] });
        }

        // Defer the reply to have more time
        await interaction.deferReply();

        try {

            // Kick the user
            await guild.members.kick(user.id, {
                reason: `Kicked by ${moderator.tag} | Reason: ${reason}`
            });

            // Send success embed
            await interaction.editReply({ embeds: [createSuccessEmbed(miyuki, {
                title: 'User Kicked',
                description: `Successfully kicked <@${user.id}> from the server.`,
                fields: [
                    { name: 'Reason', value: reason, inline: false },
                    { name: 'Moderator', value: `<@${moderator.id}>`, inline: true }
                ]
            })] });
            
            try {
                await user.send({ embeds: [createMiyukiEmbed(miyuki, {
                    title: `You have been kicked from ${guild.name}`,
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
                file: 'kick'
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