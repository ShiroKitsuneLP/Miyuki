// Import necessary classes from discord.js
const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, EmbedBuilder } = require('discord.js');

// Import actiongif repository
const { actiongif } = require('../../db/repo');

// Import color configuration
const { color } = require('./../../config/color.json');

// Import OwnerId
const { ownerId } = require('./../../config/config.json');

// Available actions
const actions = ['pat', 'hug', 'kiss', 'slap'];

// Check if its a Valid Link
function isValidUrl(v) {
    try { 
        new URL(v); 
        return true; 
    } catch { 
        return false; 
    } 
}

// Embed builders
function successEmbed(desc) {
    return new EmbedBuilder()
        .setColor(color.success)
        .setTitle('Success')
        .setDescription(desc);
}

function errorEmbed(desc) {
    return new EmbedBuilder()
        .setColor(color.error)
        .setTitle('Error')
        .setDescription(desc);
}

function infoEmbed(desc) {
    return new EmbedBuilder()
        .setColor(color.default)
        .setTitle('Info')
        .setDescription(desc);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('editgif')
        .setDescription('Manage Global Action-GIFs')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sc => 
            sc.setName('add')
                .setDescription('Add a Action-GIF')
                .addStringOption(o =>
                    o.setName('action')
                        .setDescription('Action (Hug, Pat, etc.)')
                        .setRequired(true)
                        .addChoices(...actions.map(a => ({ name: a, value: a })))

                )
                .addStringOption(o =>
                    o.setName('link')
                        .setDescription('GIF Link')
                        .setRequired(true)
                )
        )
        .addSubcommand(sc =>
            sc.setName('show')
                .setDescription('Shows a List of all GIFs')
                .addStringOption(o =>
                    o.setName('action')
                        .setDescription('Action (Hug, Pat, etc.)')
                        .setRequired(true)
                        .addChoices(...actions.map(a => ({ name: a, value: a })))

                )
                .addIntegerOption(o => 
                    o.setName('page')
                        .setDescription('Page (Default 1)')
                )
        )
        .addSubcommand(sc =>
            sc.setName('delete')
                .setDescription('Delete a Action-GIF by id')
                .addIntegerOption(o =>
                    o.setName('id')
                        .setDescription('GIF ID (you can Find the GIF ID in /editgif show)')
                        .setRequired(true)
                )
        ),
    usage: '/editgif <subcommand>',
    async execute(interaction) {

        // Check if the user is the bot owner
        if (interaction.user.id !== ownerId) {
            return interaction.reply({ embeds: [errorEmbed('Only the bot owner can use this command.')], flags: MessageFlags.Ephemeral });
        }

        await interaction.deferReply();

        const subcommand = interaction.options.getSubcommand();

        try {

            // Add a GIF
            if (subcommand === 'add') {
                const action = interaction.options.getString('action', true);
                const link = interaction.options.getString('link', true).trim();

                if (!isValidUrl(link)) {
                    return interaction.editReply({ embeds: [errorEmbed('Invalid URL. Please provide a full https:// URL.')] });
                }

                actiongif.add(action, link);
                return interaction.editReply({ embeds: [successEmbed(`Added to **${action}**:\n${link}`)] });
            }

            // Shows the GIF
            if (subcommand === 'show') {
                const action = interaction.options.getString('action', true);
                const page   = interaction.options.getInteger('page') ?? 1;

                const rows = actiongif.list(action, 15, page);

                if (!rows.length) {
                    return interaction.editReply({ embeds: [infoEmbed(`No GIF's for **${action}** (Page ${page}).`)] });
                }

                const lines = rows.map(r => `\`${r.id}\` • ${r.url}`);
                return interaction.editReply({ embeds: [infoEmbed(lines.join('\n')).setTitle(`GIF's for ${action} - Page: ${page}`)] });
            }

            // Remove a GIF
            if (subcommand === 'delete') {
                const id = interaction.options.getInteger('id', true);
                const removed = actiongif.removeById(id);

                if (!removed) {
                    return interaction.editReply({ embeds: [errorEmbed(`No entry with ID \`${id}\` found.`)] });
                }
                return interaction.editReply({ embeds: [successEmbed(`Entry \`${id}\` deleted.`)] });
            }

            return interaction.editReply({ embeds: [errorEmbed('Unknown Subcommand.')] });
        } catch (err) {
            return interaction.editReply({ embeds: [errorEmbed('Unexpected error while executing the command.')] });
        }
    }
}