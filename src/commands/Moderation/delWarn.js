// Import necessary discord.js modules
const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

// Import necessary modules
const path = require('path');

// Import embedBuilder
const { createSuccessEmbed, createErrorEmbed } = require(path.join(__dirname, './../../utils/embedBuilder'));

// Import warn database repo
const { warn } = require(path.join(__dirname, './../../database/repo'));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delwarn')
        .setDescription('Delete a warning from a user')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addIntegerOption(opt =>
            opt.setName('id')
                .setDescription('The ID of the warning to delete')
                .setRequired(true)
        ),
    category: 'Moderation',
    usage: '/delwarn <id>',
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

        // Fetch the warning from the database
        const warnObj = warn.getWarnById(warnId);

        const warnUserId = warnObj ? warnObj.user_id : null;

        // Check if warning exists
        if (!warnObj) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'Warning Not Found',
                description: `No warning found with ID #${warnId}.`
            })], flags: MessageFlags.Ephemeral });
        }

        // Check if user is the warned user
        if (warnUserId === interaction.user.id) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'No Permission',
                description: 'You cannot delete your own warnings.'
            })], flags: MessageFlags.Ephemeral });
        }

        // Defer reply to allow more time for processing
        await interaction.deferReply();

        try {

            // Delete warning from database
            const changes = warn.deleteWarnById(warnId);

            if (changes > 0) {

                // Send success embed
                return interaction.editReply({ embeds: [createSuccessEmbed(miyuki, {
                    title: 'Warning Deleted',
                    description: `Warning #${warnId} has been deleted.`
                })] });
            }

            return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                title: 'Warning Not Found',
                description: `No warning found with ID #${warnId}.`
            })], flags: MessageFlags.Ephemeral });
            
        } catch (error) {
            console.error('[Error] Error executing delwarn command');
            console.error(error);

            return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                description: 'An error occurred while trying to delete the warning. Please try again later.'
            })], flags: MessageFlags.Ephemeral });
        }
    }
}