// Import necessary discord.js modules
const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");

// Import necessary modules
const path = require("path");

// Import embedBuilder
const { createErrorEmbed, createWarnEmbed, createDMWarnEmbed } = require(path.join(__dirname, './../../utils/embedBuilder'));

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
            })], flags: MessageFlags.Ephemeral });
        }

        // Get command options
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');
        const guild = interaction.guild;
        const moderator = interaction.user;

        // Check if user is miyuki
        if (user.id === miyuki.user.id) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'You cannot warn Miyuki',
                description: 'Miyuki is a good bot and does not deserve to be warned.'
            })], flags: MessageFlags.Ephemeral });
        }

        // Check if user is a bot
        if (user.bot) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'You cannot warn a bot',
                description: 'Bots cannot be warned.'
            })], flags: MessageFlags.Ephemeral });
        }

        // Check if user is moderator
        if (user.id === moderator.id) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'You cannot warn yourself',
                description: 'You cannot warn yourself.'
            })], flags: MessageFlags.Ephemeral });
        }

        // Check if user is same or higher role than moderator
        const targetMember = await guild.members.fetch(user.id);
        const moderatorMember = await guild.members.fetch(moderator.id);

        if (targetMember.roles.highest.position === moderatorMember.roles.highest.position) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'Cannot Warn User',
                description: 'You cannot warn a user with the same role as you.'
            })], flags: MessageFlags.Ephemeral });
        }

        if (targetMember.roles.highest.position > moderatorMember.roles.highest.position) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'Cannot Warn User',
                description: 'You cannot warn a user with a higher role than you.'
            })], flags: MessageFlags.Ephemeral });
        }

        // Defer the reply to allow more time for processing
        await interaction.deferReply();

        try {

            // Add warning to database
            warn.addWarn(guild.id, user.id, moderator.id, reason || 'No reason provided');
            const warnCount = warn.countWarns(guild.id, user.id);

            // Send warn embed
            await interaction.editReply({ embeds: [createWarnEmbed(miyuki, {
                user,
                moderator,
                reason,
                warnCount
            })] });

            // Try to DM the user
            try {
                await user.send({ embeds: [createDMWarnEmbed(miyuki, {
                    guild,
                    moderator,
                    reason
                })] });
            } catch (error) {
                // DMs closed
            }

        } catch (error)  {
            console.error('[Error] Error executing warn command');
            console.error(error);

            return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                description: 'An error occurred while trying to warn the user. Please try again later.'
            })], flags: MessageFlags.Ephemeral });
        }
    }
}