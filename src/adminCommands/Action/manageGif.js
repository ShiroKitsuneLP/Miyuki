// Import nessessary discord.js modules
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

// Import necessary modules
const path = require('path');

// Import embedBuilder
const { createMiyukiEmbed, createSuccessEmbed, createErrorEmbed } = require(path.join(__dirname, './../../utils/embedBuilder'));

// Import actiongif database repo
const { actiongif } = require(path.join(__dirname, './../../database/repo'));

// Import owner IDs
const { ownerIds } = require(path.join(__dirname, './../../config/config.json'));

// Available actions
const actions = [
    'hug',
    'kiss',
    'pat'
];

// Function to check if a string is a valid URL
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch {
        return false;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('managegif')
        .setDescription('Manage action gifs for the bot')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sc => 
            sc.setName('add')
              .setDescription('Add a new action gif')
              .addStringOption(opt =>
                  opt.setName('action')
                     .setDescription('The action to add a gif for')
                     .setRequired(true)
                     .addChoices(actions.map(action => ({
                         name: action,
                         value: action
                     })))
              )
              .addStringOption(opt =>
                  opt.setName('url')
                     .setDescription('The URL of the gif')
                     .setRequired(true)
              )
        )
        .addSubcommand(sc => 
            sc.setName('show')
              .setDescription('Show all gifs for a specific action')
              .addStringOption(opt =>
                  opt.setName('action')
                     .setDescription('The action to show the gif for')
                     .setRequired(true)
                     .addChoices(actions.map(action => ({
                         name: action,
                         value: action
                     })))
              )
                .addIntegerOption(opt =>
                    opt.setName('page')
                       .setDescription('Page number')
                       .setRequired(false)
                )
        )
        .addSubcommand(sc => 
            sc.setName('showid')
              .setDescription('Show a specific action gif by its ID')
              .addStringOption(opt =>
                  opt.setName('id')
                     .setDescription('The ID of the gif to show')
                     .setRequired(true)
              )
        )
        .addSubcommand(sc => 
            sc.setName('showall')
              .setDescription('Show all action gifs in the database')
                .addIntegerOption(opt =>
                    opt.setName('page')
                       .setDescription('Page number')
                       .setRequired(false)
                )
        )
        .addSubcommand(sc => 
            sc.setName('remove')
              .setDescription('Remove an action gif by its ID')
              .addStringOption(opt =>
                  opt.setName('id')
                     .setDescription('The ID of the gif to remove')
                     .setRequired(true)
              )
        ),
    usage: '/managegif <add|show|showall|remove> [options]',
    async execute(interaction, miyuki) {

        // Check if the user is an owner
        if(!ownerIds.includes(interaction.user.id)) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'Permission Denied',
                description: 'You do not have permission to use this command.'
            })] });
        }

        await interaction.deferReply();

        // Get the subcommand
        const subcommand = interaction.options.getSubcommand(false);

        try {
            if(!subcommand) {
                return interaction.editReply({ embeds: [createMiyukiEmbed(miyuki, {
                    title: 'Manage GIFs Help',
                    description: 'Here are the available subcommands for managing action gifs:',
                    fields: [
                        { name: 'Add a GIF', value: '`/managegif add action:<action> url:<url>` \n Add a new action gif to the database.', inline: false },
                        { name: 'Show GIFs by Action', value: '`/managegif show action:<action> [page:<page>]` \n Show all gifs for a specific action.', inline: false },
                        { name: 'Show GIF by ID', value: '`/managegif showid id:<id>` \n Show a specific action gif by its ID.', inline: false },
                        { name: 'Show All GIFs', value: '`/managegif showall [page:<page>]` \n Show all action gifs in the database.', inline: false },
                        { name: 'Remove a GIF', value: '`/managegif remove id:<id>` \n Remove an action gif by its ID.', inline: false }
                    ]
                })], ephemeral: true });
            }

            // Add a GIF to the database
            if(subcommand === 'add') {
                const action = interaction.options.getString('action', true);
                const url = interaction.options.getString('url', true).trim();

                if(!isValidUrl(url)) {
                    return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                        title: 'Invalid URL',
                        description: 'The provided URL is not valid. Please provide a valid URL.'
                    })] });
                }

                actiongif.addGif(action, url);

                return interaction.editReply({ embeds: [createSuccessEmbed(miyuki, {
                    title: 'GIF Added',
                    description: `Successfully added a new GIF for the action **${action}**.`,
                    fields: [
                        { name: 'Action', value: action, inline: true },
                        { name: 'URL', value: url, inline: true }
                    ]
                })] });
            }

            // Show GIFs for a specific action
            if(subcommand === 'show') {
                const action = interaction.options.getString('action', true);
                const page = interaction.options.getInteger('page') || 1;

                const gifs = actiongif.listActionGifs(action, 10, page);

                if(!gifs.length) {
                    return interaction.editReply({ embeds: [createMiyukiEmbed(miyuki, {
                        title: 'No GIFs Found',
                        description: `No GIFs found for the action **${action}** (Page ${page}).`
                    })] });
                }

                const lines = gifs.map(gif => `**ID:** ${gif.id} | [Link](${gif.url})`).join('\n');
                return interaction.editReply({ embeds: [createMiyukiEmbed(miyuki, {
                    title: `GIFs for Action: ${action} (Page ${page})`,
                    description: lines,
                })] });

            }

            // Show a specific action gif by its ID
            if(subcommand === 'showid') {
                const id = interaction.options.getString('id', true).trim();

                const gifObj = actiongif.getGifById(id);

                if (!gifObj) {
                    return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                        title: 'No GIF Found',
                        description: 'No GIF found with the specified ID.'
                    })] });
                }

                const gifId = gifObj?.id;
                const gifAction = gifObj?.action;
                const gifUrl = gifObj?.url;

                return interaction.editReply({ embeds: [createMiyukiEmbed(miyuki, {
                    title: `GIF Details for ID: ${gifId}`,
                    fields: [
                        { name: 'Action', value: gifAction, inline: true },
                        { name: 'URL', value: gifUrl, inline: true }
                    ],
                    image: gifUrl,
                })] });
            }

            // Show all action gifs in the database
            if(subcommand === 'showall') {
                const page = interaction.options.getInteger('page') || 1;

                const gifs = actiongif.listAllGifs(10, page);

                if(!gifs.length) {
                    return interaction.editReply({ embeds: [createMiyukiEmbed(miyuki, {
                        title: 'No GIFs Found',
                        description: `No GIFs found in the database (Page ${page}).`
                    })] });
                }

                const lines = gifs.map(gif => `**ID:** ${gif.id} | **Action:** ${gif.action} | [Link](${gif.url})`).join('\n');
                return interaction.editReply({ embeds: [createMiyukiEmbed(miyuki, {
                    title: `All Action GIFs (Page ${page})`,
                    description: lines,
                })] });
            }

            if(subcommand === 'remove') {
                const id = interaction.options.getString('id', true).trim();

                const changes = actiongif.removeById(id);

                if(!changes) {
                    return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                        title: 'GIF Not Found',
                        description: `No GIF found with the ID **${id}**.`
                    })] });
                }

                return interaction.editReply({ embeds: [createSuccessEmbed(miyuki, {
                    title: 'GIF Removed',
                    description: `Successfully removed the GIF with ID **${id}** from the database.`
                })] });
            }
        } catch (error) {
            console.error(`[ERROR] Error executing managegif command`);
            console.error(error);

            return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                description: 'An error occurred while executing the command. Please try again later.'
            })] });
        }
    }
}