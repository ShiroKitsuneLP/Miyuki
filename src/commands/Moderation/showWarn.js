// Import necessary discord.js modules
const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

// Import necessary modules
const path = require('path');

// Import embedBuilder
const { createMiyukiEmbed, createErrorEmbed } = require(path.join(__dirname, './../../utils/embedBuilder'));

// Import warn database repo
const { warn } = require(path.join(__dirname, './../../database/repo'));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('showwarn')
        .setDescription('Show details of a specific warning by its ID')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addIntegerOption(option =>
            option.setName('id')
                .setDescription('The ID of the warning to show')
                .setRequired(true)
        ),
    category: 'Moderation',
    usage: '/showwarn <id>',
    async execute(interaction, miyuki) {

        // Ensure the command is used in a guild
        if (!interaction.inGuild()) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'Guild Only Command',
                description: 'This command can only be used in a server.'
            })], flags: MessageFlags.Ephemeral });
        }

        // Get command options
        const warnId = interaction.options.getInteger('id');

        // Fetch the warning details from the database
        const warning = warn.getWarnById(warnId);

        if (!warning) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'Warning Not Found',
                description: `No warning found with ID ${warnId}.`
            })], flags: MessageFlags.Ephemeral });
        }

        // Send the warning details
        return interaction.reply({ embeds: [createMiyukiEmbed(miyuki, {
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
}