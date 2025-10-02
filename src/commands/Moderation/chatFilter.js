// Import necessary discord.js modules
const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

// Import necessary modules
const path = require('path');

// Import embedBuilder
const { createSuccessEmbed, createErrorEmbed } = require(path.join(__dirname, '../../../utils/embedBuilder'));

// Import chatFilter repo
const { chatFilter } = require(path.join(__dirname, '../../../database/repo'));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('chatfilter')
        .setDescription('Toggle chat filter options for this server.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(sc =>
            sc.setName('toggle')
                .setDescription('Toggle a chat filter option.')
                .addStringOption(opt =>
                    opt.setName('option')
                        .setDescription('Which filter to toggle')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Bad Links', value: 'badLinks' },
                            { name: 'NSFW Links', value: 'nsfwLinks' },
                            { name: 'Auto Warn', value: 'autoWarn' }
                        )
                )
                .addBooleanOption(opt =>
                    opt.setName('enabled')
                        .setDescription('Enable or disable this filter')
                        .setRequired(true)
                )
        ),
    category: 'Moderation',
    usage: '/chatfilter toggle <option> <enabled>',
    async execute(interaction, miyuki) {

        // Ensure the command is used in a guild
        if (!interaction.inGuild()) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'Guild Only Command',
                description: 'This command can only be used in a server.'
            })], flags: MessageFlags.Ephemeral });
        }

        // Defer the reply to allow more time for processing
        await interaction.deferReply();

        const subcommand = interaction.options.getSubcommand();

        try {
            if (subcommand === 'toggle') {
                const option = interaction.options.getString('option');
                const enabled = interaction.options.getBoolean('enabled') ? 1 : 0;
                const guildId = interaction.guild.id;

                // Update the chat filter settings in the database
                chatFilter.setChatFilterSettings(guildId, option, enabled);

                return interaction.editReply({ embeds: [createSuccessEmbed(miyuki, {
                    title: 'Chat Filter Updated',
                    description: `The **${option}** filter has been ${enabled ? 'enabled' : 'disabled'}.`,
                })] });
            }
        } catch (error) {
            console.error(`[ERROR] Error executing chatFilter command`);
            console.error(error);

            return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                description: 'An error occurred while executing the command. Please try again later.'
            })] });
        }
    }
}