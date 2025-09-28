// Import necessary discord.js modules
const { SlashCommandBuilder, PermissionFlagsBits,MessageFlags } = require('discord.js');

// Import necessary modules
const path = require('path');

// Import embedBuilder
const { createErrorEmbed, createSuccessEmbed } = require(path.join(__dirname, './../../utils/embedBuilder'));

// Import warn database repo
const { warn } = require(path.join(__dirname, './../../database/repo'));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clearwarns')
        .setDescription('Clear all warnings for a specific user')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption(opt =>
            opt.setName('user')
                .setDescription('The user to clear warnings for')
                .setRequired(true)
        ),
    category: 'Moderation',
    usage: '/clearwarns <user>',
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
        const guild = interaction.guild;

        // Check if the user has any warnings
        const userWarns = warn.getWarns(guild.id, user.id);

        if (userWarns.length === 0) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'No Warnings Found',
                description: `${user.tag} has no warnings to clear.`
            })], flags: MessageFlags.Ephemeral });
        }

        // Clear all warnings for the user
        const deletedCount = warn.deleteWarnsByUser(guild.id, user.id);

        return interaction.reply({ embeds: [createSuccessEmbed(miyuki, {
            title: 'Warnings Cleared',
            description: `Successfully cleared ${deletedCount} warnings for ${user.tag}.`
        })] });
    }
}