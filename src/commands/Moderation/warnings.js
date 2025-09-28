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
        .setName('warnings')
        .setDescription('Show all warnings for a user or all warned users')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption(opt =>
            opt.setName('user')
                .setDescription('The user to show warnings for')
                .setRequired(false)
        )
        .addIntegerOption(opt =>
            opt.setName('page')
                .setDescription('Page number for all warned users')
                .setRequired(false)
        ),
    category: 'Moderation',
    usage: '/warnings [user] [page]',
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
        const page = interaction.options.getInteger('page') || 1;
        const guild = interaction.guild;
        const perPage = 10;

        // Defer reply to allow more time for processing
        await interaction.deferReply();

        try {
            if (user) {

                // Show all warnings for a specific user
                const warns = warn.getWarns(guild.id, user.id);

                if (!warns.length) {
                    return interaction.editReply({ embeds: [createMiyukiEmbed(miyuki, {
                        title: 'No Warnings Found',
                        description: `${user.tag} has no warnings.`,
                    })] });
                }

                // Show warnings for the user
                const warningFields = warns.map(w => `**ID:** ${w.id} | **Date:** <t:${Math.floor(w.timestamp / 1000)}:f> | **Reason:** ${w.reason}`).join('\n\n');

                return interaction.editReply({ embeds: [createMiyukiEmbed(miyuki, {
                    title: `Warnings for ${user.tag}`,
                    description: `Total Warnings: ${warns.length} \n\n ${warningFields}`,
                })] });
            }

            // Show all warned users (paginated)
            const allWarns = warn.getWarnCountsForGuild(guild.id);

            if (!allWarns.length) {
                return interaction.editReply({ embeds: [createMiyukiEmbed(miyuki, {
                    title: 'No Warned Users',
                    description: 'There are no warned users in this server.',
                })] });
            }

            const totalPages = Math.ceil(allWarns.length / perPage);

            // Validate page number
            if (page > totalPages) {
                return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                    title: 'Invalid Page',
                    description: totalPages === 1 ? 'There is only 1 page.' : `There are only ${totalPages} page(s).`
                })] });
            }

            const pageWarns = allWarns.slice((page - 1) * perPage, page * perPage);

            const warnedUsersList = pageWarns.map((w, i) =>
                `**${(page - 1) * perPage + i + 1}.** <@${w.user_id}> - ${w.count} warning${w.count === 1 ? '' : 's'}`
            ).join('\n');

            // Send paginated list of warned users
            return interaction.editReply({ embeds: [createMiyukiEmbed(miyuki, {
                title: 'Warned Users',
                description: warnedUsersList,
                footer: { text: `Page ${page} of ${totalPages}` }
            })] });
        } catch (error) {
            console.error('[Error] Error executing warnings command:');
            console.error(error);

            await interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                description: 'An error occurred while fetching warnings. Please try again later.'
            })], flags: MessageFlags.Ephemeral });
        }
    }
}