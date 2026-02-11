// Import necessary Discord.js classes
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

// Import necessary modules
const path = require('path');

// Import embedBuilder
const { createMiyukiEmbed, createSuccessEmbed, createErrorEmbed } = require(path.resolve(__dirname, '../../utils/embedBuilder'));

// Import error handler
const { errorHandler } = require(path.resolve(__dirname, '../../utils/errorHandler'));

// Import errorLog database repo
const { actionGif } = require(path.resolve(__dirname, '../../database/repo'));

// Import owner IDs
const { ownerIds } = require(path.resolve(__dirname, '../../config/config.json'));

// Available Actions
const actions = [
    'bite',
    'hug',
    'kiss',
    'pat',
    'slap'
];

// Function to Check if a String is a Valid URL
function isValidUrl(str) {
    try {
        new URL(str);
        return true;
    } catch {
        return false;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('actiongif')
        .setDescription('Manage Action Gifs for Miyuki')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sc =>
            sc.setName('add')
                .setDescription('Add a new Action Gif')
                .addStringOption(opt =>
                    opt.setName('action')
                        .setDescription('The Action to add a Gif for')
                        .setRequired(true)
                        .addChoices(actions.map(actions => ({
                            name: actions,
                            value: actions
                        })))
                )
                .addStringOption(opt =>
                    opt.setName('url')
                        .setDescription('The URL of the Gif')
                        .setRequired(true)
                )
        )
        .addSubcommand(sc =>
            sc.setName('show')
                .setDescription('Show all Gifs for a specific Action')
                .addStringOption(opt =>
                    opt.setName('action')
                        .setDescription('The Action to show all Gifs for')
                        .setRequired(true)
                        .addChoices(actions.map(actions => ({
                            name: actions,
                            value: actions
                        })))
                )
                .addIntegerOption(opt =>
                    opt.setName('page')
                        .setDescription('Page Number')
                )
        )
        .addSubcommand(sc =>
            sc.setName('showid')
                .setDescription('Show a specific Action Gif by ID')
                .addIntegerOption(opt =>
                    opt.setName('id')
                        .setDescription('The ID of the Gif')
                        .setRequired(true)
                )
        )
        .addSubcommand(sc =>
            sc.setName('showall')
                .setDescription('Show all Action Gifs')
                .addIntegerOption(opt =>
                    opt.setName('page')
                        .setDescription('Page Number')

                )
        )
        .addSubcommand(sc =>
            sc.setName('remove')
                .setDescription('Remove a specific Action Gif by ID')
                .addIntegerOption(opt =>
                    opt.setName('id')
                        .setDescription('The ID of the Gif to remove')
                        .setRequired(true)
                )
        ),
    usage: '/actiongif <add|show|showid|showall|remove> [Options]',
    async execute(interaction, miyukiAdmin) {

        // Check if User is an Owner of Miyuki
        if(!ownerIds.includes(interaction.user.id)) {
            return interaction.reply({ embeds: [createErrorEmbed(miyukiAdmin, {
                title: 'Permission Denied',
                desc: 'You are not an Owner of Miyuki.'
            })] });
        }

        // Defer reply to allow more time for processing
        await interaction.deferReply();

        // Get the subcommand
        const subCommand = interaction.options.getSubcommand(false);

        try {

            let action;
            let url;
            let id;

            let page;
            let limit = 10;
            let offset;

            let gifs;

            let lines;

            switch (subCommand) {

                // Add a Action Gif to the Database
                case 'add':

                    // Get provided Options
                    action = interaction.options.getString('action', true);
                    url = interaction.options.getString('url', true).trim();

                    // Check if provided URl is a URL
                    if (!isValidUrl(url)) {
                        return interaction.editReply({ embeds: [createErrorEmbed(miyukiAdmin, {
                            title: 'Invalid URL',
                            desc: 'The provided URL is not valid. Please provide a valid URL.'
                        })] });
                    }

                    // Upload Gif URL to Database
                    await actionGif.addActionGif(action, url);

                    // Send Success Embed
                    return await interaction.editReply({ embeds: [createSuccessEmbed(miyukiAdmin, {
                        title: 'New Action Gif Successfully added',
                        desc: `Successfully added a new **${action}** Gif.`,
                        fields: [
                            { name: 'Action', value: action, inline: true },
                            { name: 'URL', value: url, inline: true }
                        ]
                    })] });

                // Show all Gifs for a specific Action
                case 'show':

                    // Get provided Options
                    action = interaction.options.getString('action', true);
                    page = interaction.options.getInteger('page') || 1;

                    offset = (page - 1) * limit;

                    gifs = await actionGif.listActionGifs(action, limit, offset);

                    // Check if GIfs are available
                    if (!gifs.length) {
                        return interaction.editReply({ embeds: [createErrorEmbed(miyukiAdmin, {
                            title: 'No GIFs Found',
                            desc: `No GIFs found for the action **${action}** (Page ${page}).`
                        })] });
                    }

                    // Format Gifs as a List for Embed Display
                    lines = gifs.map(gif => `**ID:** ${gif.id} | [Link](${gif.url})`).join('\n');

                    // Send Embed with a List of Gifs
                    return await interaction.editReply({ embeds: [createMiyukiEmbed(miyukiAdmin, {
                        title: `Gifs for Action ${action}`,
                        desc: lines,
                        footer: {
                            text: `Page: ${page}`
                        }
                    })] });

                // Show a specific Action Gif by ID
                case 'showid':

                    // Get the ID option
                    id = interaction.options.getInteger('id', true);

                    // Get the Action Gif Object
                    const gifObj = await actionGif.getGifById(id);

                    // Check if Action Gif Object exists
                    if (!gifObj) {
                        return interaction.editReply({ embeds: [createErrorEmbed(miyukiAdmin, {
                            title: 'No Action Gif Found',
                            desc: 'No GIF found with the specified ID.'
                        })] });
                    }

                    // Extract Gif Details from Database Object
                    const gifId = gifObj?.id;
                    const gifAction = gifObj?.action;
                    const gifUrl = gifObj?.url;

                    // Send Embed with Details for that Gif
                    return await interaction.editReply({ embeds: [createMiyukiEmbed(miyukiAdmin, {
                        title: `GIF Details for ID: ${gifId}`,
                        fields: [
                            { name: 'Action', value: gifAction, inline: true },
                            { name: 'URL', value: gifUrl, inline: true }
                        ],
                        image: gifUrl
                    })] });
                    
                // Show all Action Gifs
                case 'showall':

                    // Get Options if provided
                    page = interaction.options.getInteger('page') || 1;

                    offset = (page - 1) * limit;

                    gifs = await actionGif.listAllActionGifs(limit, offset);

                    if (!gifs.length) {
                        return interaction.editReply({ embeds: [createMiyukiEmbed(miyukiAdmin, {
                            title: 'No GIFs Found',
                            desc: `No GIFs found in the database (Page ${page}).`
                        })] });
                    }

                    // Format Gifs as a List for Embed Display
                    lines = gifs.map(gif => `**ID:** ${gif.id} | **Action:** ${gif.action} | [Link](${gif.url})`).join('\n');

                    // Send Embed with a List of Gifs
                    return await interaction.editReply({ embeds: [createMiyukiEmbed(miyukiAdmin, {
                        title: 'All Action Gifs',
                        desc: lines,
                        footer: {
                            text: `Page: ${page}`
                        }
                    })] });
                
                // Remove a specific Action Gif by ID
                case 'remove':

                    // Get the ID option
                    id = interaction.options.getInteger('id', true);

                    // Remove Gif from Database
                    const rem = await actionGif.removeActionGifById(id);

                    // Check if a Gif was Removed
                    if (!rem) {
                        return interaction.editReply({ embeds: [createErrorEmbed(miyukiAdmin, {
                            title: 'Gif Not Found',
                            desc: `No Gif found with the ID **${id}**.`
                        })] });
                    }

                    // Send Success Embed
                    return await interaction.editReply({ embeds: [createSuccessEmbed(miyukiAdmin, {
                        title: 'Action Gif Successfully removed',
                        desc: `Successfully removed the GIF with ID **${id}** from the database.`
                    })] });

                default:

                    // Fallback
                    return interaction.editReply({ embeds: [createErrorEmbed(miyukiAdmin, {
                        title: 'Unknown Subcommand',
                        desc: 'This subcommand does not exist.'
                    })] });
            }


        } catch (error) {
            await errorHandler(error, {
                context: 'AdminCommand',
                category: 'Action',
                file: 'actionGIf',
                interaction,
                client: miyukiAdmin
            });
        }
    }
}