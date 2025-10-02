// Import necessary discord.js modules
const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

// Import necessary modules
const path = require('path');

// Import embedBuilder
const { createMiyukiEmbed ,createSuccessEmbed, createErrorEmbed } = require(path.join(__dirname, './../../../utils/embedBuilder'));

// Import chatFilter repo
const { chatFilter } = require(path.join(__dirname, './../../../database/repo'));

// Import owner IDs
const { ownerIds } = require(path.join(__dirname, './../../config/config.json'));

// Function to check if a string is a valid URL or domain
function isValidLink(string) {

    // Accepts full URLs (http/https) or domains like example.com
    const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/i;
    return urlPattern.test(string);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('managebadlinks')
        .setDescription('Add or remove bad links from the chat filter.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sc =>
            sc.setName('add')
                .setDescription('Add a bad link to the chat filter.')
                .addStringOption(opt =>
                    opt.setName('link')
                        .setDescription('The bad link to add.')
                        .setRequired(true)
                )
        )
        .addSubcommand(sc =>
            sc.setName('showid')
                .setDescription('Show a bad link by its ID.')
                .addIntegerOption(opt =>
                    opt.setName('id')
                        .setDescription('The ID of the bad link to show.')
                        .setRequired(true)
                )
        )
        .addSubcommand(sc =>
            sc.setName('showlink')
                .setDescription('Show a bad link by its link.')
                .addStringOption(opt =>
                    opt.setName('link')
                        .setDescription('The link to show.')
                        .setRequired(true)
                )
        )
        .addSubcommand(sc =>
            sc.setName('showall')
                .setDescription('Show all bad links.')
                .addIntegerOption(opt =>
                    opt.setName('page')
                        .setDescription('The page number to view (10 links per page).')
                        .setRequired(false)
                )
        )
        .addSubcommand(sc =>
            sc.setName('remove')
                .setDescription('Remove a bad link from the chat filter.')
                .addStringOption(opt =>
                    opt.setName('link')
                        .setDescription('The bad link to remove.')
                        .setRequired(true)
                )
        ),
    usage: '/managebadlinks <add|showid|showurl|showall|remove> [options]',
    async execute(interaction, miyuki) {

        // Defer the reply to allow more time for processing
        await interaction.deferReply({ ephemeral: true });

        // Check if the user is an owner
        if(!ownerIds.includes(interaction.user.id)) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'Permission Denied',
                description: 'You do not have permission to use this command.'
            })] });
        }

        // Get the subcommand
        const subcommand = interaction.options.getSubcommand();

        try {
            if (!subcommand) {
                return interaction.editReply({ embeds: [createMiyukiEmbed(miyuki, {
                    title: 'Manage Bad Links Help',
                    description: 'Here are the available subcommands for managing bad links:',
                    fields: [
                        { name: 'add', value: 'Add a bad link to the chat filter. Usage: `/managebadlinks add <link>`', inline: false },
                        { name: 'showid', value: 'Show a bad link by its ID. Usage: `/managebadlinks showid <id>`', inline: false },
                        { name: 'showlink', value: 'Show a bad link by its link. Usage: `/managebadlinks showlink <link>`', inline: false },
                        { name: 'showall', value: 'Show all bad links. Usage: `/managebadlinks showall [page]`', inline: false },
                        { name: 'remove', value: 'Remove a bad link from the chat filter. Usage: `/managebadlinks remove <link>`', inline: false },
                    ]
                })], flags: MessageFlags.Ephemeral });
            }

            // Add a bad link to the chat filter
            if (subcommand === 'add') {
                const link = interaction.options.getString('link');

                // Validate the link (URL or domain)
                if (!isValidLink(link)) {
                    return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                        title: 'Invalid Link',
                        description: 'The provided link is not a valid URL or domain. Please provide a valid link (e.g. https://example.com or example.com).'
                    })], flags: MessageFlags.Ephemeral });
                }

                // Check if the link already exists
                const existingLink = await chatFilter.getBadLinkByUrl(link);

                if (existingLink) {
                    return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                        title: 'Link Already Exists',
                        description: 'The provided link already exists in the chat filter.'
                    })], flags: MessageFlags.Ephemeral });
                }

                // Add the link to the database
                chatFilter.addBadLink(link);

                return interaction.editReply({ embeds: [createSuccessEmbed(miyuki, {
                    title: 'Link Added',
                    description: `The link \`${link}\` has been added to the chatfilter.`
                })] });
            }

            // Show a bad link by its ID
            if (subcommand === 'showid') {
                const id = interaction.options.getInteger('id');

                // Fetch the link from the database
                const badLinkObj = await chatFilter.getBadLinkById(id);

                if (!badLinkObj) {
                    return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                        title: 'Link Not Found',
                        description: `No bad link found with ID \`${id}\`.`
                    })], flags: MessageFlags.Ephemeral });
                }

                const badLinkId = badLinkObj.id;
                const badLinkUrl = badLinkObj.bad_link;

                return interaction.editReply({ embeds: [createMiyukiEmbed(miyuki, {
                    title: 'Bad Link Found',
                    fields: [
                        { name: 'ID', value: `${badLinkId}`, inline: true },
                        { name: 'Link', value: `${badLinkUrl}`, inline: true }
                    ]
                })] });
            }

            // Show a bad link by its link
            if (subcommand === 'showlink') {
                const link = interaction.options.getString('link');

                // Fetch the link from the database
                const badLinkObj = await chatFilter.getBadLinkByUrl(link);

                if (!badLinkObj) {
                    return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                        title: 'Link Not Found',
                        description: `No bad link found with link \`${link}\`.`
                    })], flags: MessageFlags.Ephemeral });
                }

                const badLinkId = badLinkObj.id;
                const badLink = badLinkObj.bad_link;

                return interaction.editReply({ embeds: [createMiyukiEmbed(miyuki, {
                    title: 'Bad Link Found',
                    fields: [
                        { name: 'ID', value: `${badLinkId}`, inline: true },
                        { name: 'Link', value: `${badLink}`, inline: true }
                    ]
                })] });
            }

            // Show all bad links with pagination
            if (subcommand === 'showall') {
                const page = interaction.options.getInteger('page') || 1;

                const badLinks = chatFilter.listAllBadLinks(10, page);

                if (!badLinks.length) {
                    return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                        title: 'No Links Found',
                        description: 'No bad links found in the chat filter.'
                    })], flags: MessageFlags.Ephemeral });
                }

                const lines = badLinks.map(link => `**ID:** ${link.id} | **Link:** ${link.bad_link}`).join('\n');

                return interaction.editReply({ embeds: [createMiyukiEmbed(miyuki, {
                    title: 'Bad Links List',
                    description: lines,
                    footer: { text: `Page ${page}` }
                })] });
            }

            // Remove a bad link from the chat filter
            if (subcommand === 'remove') {
                const link = interaction.options.getString('link');

                // Remove the link from the database
                const success = await chatFilter.removeBadLink(link);

                if (!success) {
                    return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                        title: 'Link Not Found',
                        description: `No bad link found with link \`${link}\`.`
                    })], flags: MessageFlags.Ephemeral });
                }

                return interaction.editReply({ embeds: [createSuccessEmbed(miyuki, {
                    title: 'Link Removed',
                        description: `The link \`${link}\` has been removed from the chatfilter.`
                })] });
            }

        } catch (error) {
            console.error(`[ERROR] Error executing managebadlinks command`);
            console.error(error);

            return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                description: 'An error occurred while executing the command. Please try again later.'
            })] });
        }
    }
}