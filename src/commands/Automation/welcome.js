// Import necessary classes from discord.js
const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, MessageFlags, EmbedBuilder } = require('discord.js');

// Import welcome repository
const { welcome } = require('../../db/repo');

// Import color configuration
const { color } = require('./../../config/color.json');

// Embed builders
function successEmbed(desc, client) {
    return new EmbedBuilder()
        .setColor(color.success)
        .setTitle('Success')
        .setAuthor({ 
            name: client.user.username, 
            iconURL: client.user.displayAvatarURL({ dynamic: true, size: 2048 })
        })
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 2048 }))
        .setDescription(desc);
}

function errorEmbed(desc, client) {
    return new EmbedBuilder()
        .setColor(color.error)
        .setTitle('Error')
        .setAuthor({ 
            name: client.user.username, 
            iconURL: client.user.displayAvatarURL({ dynamic: true, size: 2048 })
        })
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 2048 }))
        .setDescription(desc);
}

function infoEmbed(desc, client) {
    return new EmbedBuilder()
        .setColor(color.default)
        .setTitle('Info')
        .setAuthor({ 
            name: client.user.username, 
            iconURL: client.user.displayAvatarURL({ dynamic: true, size: 2048 })
        })
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 2048 }))
        .setDescription(desc);
}

// Embed Color Validator
function isHex6(v) {
    return /^#?[0-9a-fA-F]{6}$/.test(v || '');
}

function s(v) {
    return typeof v === 'string' ? v.trim() : '';
}

function hasAnyWelcomeMessage(cfg) {
    return Boolean(s(cfg.text_content)) || Boolean(s(cfg.embed_title) || s(cfg.embed_description));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcome')
        .setDescription('Configure welcome messages for new members.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sc =>
            sc.setName('enable')
                .setDescription('Enable welcome messages in this server.')
            )
        .addSubcommand(sc =>
            sc.setName('disable')
                .setDescription('Disable welcome messages in this server.')
            )
        .addSubcommand(sc =>
            sc.setName('setchannel')
                .setDescription('Set the channel for welcome messages.')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('The channel to send welcome messages in.')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)
                )
            )
        .addSubcommand(sc =>
            sc.setName('settext')
                .setDescription('Set the text message for welcomes.')
                .addStringOption(option =>
                    option.setName('content')
                        .setDescription('Supports {user}, {username}, {guild}.')
                        .setRequired(true)
                )
                .addBooleanOption(option =>
                    option.setName('ping')
                        .setDescription('Whether to ping the user in the welcome message.')
                )
            )
        .addSubcommand(sc =>
            sc.setName('setembed')
                .setDescription('Set the embed message for welcomes.')
                .addStringOption(option =>
                    option.setName('title')
                        .setDescription('The title of the embed message.')
                )
                .addStringOption(option =>
                    option.setName('description')
                        .setDescription('The description of the embed message. Supports {user}, {username}, {guild}.')
                )
                .addStringOption(option =>
                    option.setName('color')
                        .setDescription('The color of the embed in hex format (e.g. #FF0000).')
                )
                .addStringOption(option =>
                    option.setName('thumbnail')
                        .setDescription('The URL of the thumbnail image. Use {user} to get the user avatar.')
                )
                .addStringOption(option =>
                    option.setName('image')
                        .setDescription('The URL of the main image.')
                )
                .addStringOption(option =>
                    option.setName('footer')
                        .setDescription('The footer text of the embed.')
                )
                .addBooleanOption(option =>
                    option.setName('timestamp')
                    .setDescription('Whether to include the current timestamp in the embed.')
                )
                .addBooleanOption(option =>
                    option.setName('ping')
                    .setDescription('Whether to ping the user in the welcome message.')
                )
            )
            .addSubcommand(sc =>
            sc.setName('setextra')
                .setDescription('Set extra options for welcome messages.')
                .addBooleanOption(option =>
                    option.setName('ping')
                    .setDescription('Whether to ping the user in the welcome message.')
                )
            )
        .addSubcommand(sc =>
            sc.setName('preview')
                .setDescription('Show the current welcome configuration for this server.')
            )
        .addSubcommand(sc =>
            sc.setName('clear')
                .setDescription('Clear the welcome configuration for this server.')
        ),
    usage: '/welcome <subcommand>',
    async execute(interaction) {

        // Ensure the command is used in a guild
        if (!interaction.inGuild()) {
            return interaction.reply({ embeds: [errorEmbed('This command can only be used in a server.')], flags: MessageFlags.Ephemeral });
        }

        // Defer the reply to allow more time for processing
        await interaction.deferReply();

        const guildId = interaction.guild.id;
        const subcommand = interaction.options.getSubcommand();

        try {

            // Enable welcome messages
            if (subcommand === 'enable') {
                const cfg = welcome.getConfig(guildId) ?? {};

                const issues = [];

                if (!cfg.channel_id) {
                    issues.push('Note: No channel is set yet. Use `/welcome setchannel` to set one.');
                }

                if (!hasAnyWelcomeMessage(cfg)) {
                    issues.push('Note: No welcome message is set yet. Use `/welcome settext` or `/welcome setembed` to set one.');
                }

                if (issues.length) {
                    return interaction.editReply({ embeds: [errorEmbed(`Cannot enable welcome messages yet.\n${issues.join('\n')}`)] });
                }

                welcome.enable(guildId, true);
                return interaction.editReply({ embeds: [successEmbed('Welcome messages have been enabled for this server.')] });
            }
        
            // Disable welcome messages
            if (subcommand === 'disable') {
                const cfg = welcome.getConfig(guildId) ?? {};

                if(!cfg || Object.keys(cfg).length === 0) {
                    return interaction.editReply({ embeds: [infoEmbed('Welcome messages already disabled or not configured')] });
                }

                welcome.enable(guildId, false);

                const final = welcome.getConfig(guildId);
                const channel = final.channel_id ? `<#${final.channel_id}>` : 'Not set';
                return interaction.editReply({ embeds: [successEmbed(`Welcome messages have been disabled for this server.\nCurrent channel: ${channel}`)] });
            }

            // Set the channel for welcome messages
            if (subcommand === 'setchannel') {
                const channel = interaction.options.getChannel('channel');
                welcome.setChannel(guildId, channel.id);
                return interaction.editReply({ embeds: [successEmbed(`Welcome channel has been set to ${channel}.`)] });
            }

            // Set text welcome message
            if (subcommand === 'settext') {
                const content = (interaction.options.getString('content', true) || '').trim();
                const ping = interaction.options.getBoolean('ping');

                if (!content) {
                    return interaction.editReply({ embeds: [errorEmbed('Content cannot be empty. Example: Welcome {User} to {guild}')] });
                }

                if (content.length > 1000) {
                    return interaction.editReply({ embeds: [errorEmbed('Content is too long. Maximum length is 1000 characters.')] });
                }

                welcome.setText(guildId, content, { ping_user: ping ?? undefined });
                return interaction.editReply({ embeds: [successEmbed('Welcome text message has been set.')] });
            }

            // Set embed welcome message
            if (subcommand === 'setembed') {
                const title = interaction.options.getString('title');
                const description = interaction.options.getString('description');
                let color = interaction.options.getString('color');
                const thumbnail_url = interaction.options.getString('thumbnail');
                const image_url = interaction.options.getString('image');
                const footer = interaction.options.getString('footer');
                const timestamp = interaction.options.getBoolean('timestamp') ?? false;
                const ping = interaction.options.getBoolean('ping') ?? false;

                // Normalize & validate color if provided
                if (color) {
                    if(!color.startsWith('#')) {
                        color = `#${color}`;
                    }
                    if (!isHex6(color)) {
                    return interaction.editReply({ embeds: [errorEmbed('Invalid color format. Please provide a valid hex color code (e.g. #FF0000).')] });
                    }
                }
                
                welcome.setEmbed(guildId, {
                    title, 
                    description, 
                    color, 
                    thumbnail_url, 
                    image_url, 
                    footer,
                    timestamp: timestamp ?? undefined, 
                    ping_user: ping ?? undefined
                });

                const lines = [
                    title ? `**Title:** ${title}` : null,
                    description ? `**Description:** ${description}` : null,
                    color ? `**Color:** ${color}` : null,
                    thumbnail_url ? `**Thumbnail URL:** ${thumbnail_url}` : null,
                    image_url ? `**Image URL:** ${image_url}` : null,
                    footer ? `**Footer:** ${footer}` : null,
                    timestamp != null ? `**Timestamp:** ${timestamp ? 'Yes' : 'No'}`: null,
                    ping != null ?`**Ping User:** ${ping ? 'Yes' : 'No'}`: null,
                ].filter(Boolean).join('\n') || 'Embed fields saved.';
                return interaction.editReply({ embeds: [successEmbed(`Welcome embed message has been set with the following fields:\n${lines}`)] });
            }

            // Set extra options for welcome messages
            if (subcommand === 'setextra') {
                const ping = interaction.options.getBoolean('ping');
                if (ping == null) {
                    return interaction.editReply({ embeds: [infoEmbed('No changes made. Please provide at least one option to update.')] });
                }
                welcome.setConfig(guildId, { ping_user: ping ? 1 : 0 });
                return interaction.editReply({ embeds: [successEmbed(`Welcome message extra options have been updated:\n**Ping User:** ${ping ? 'Yes' : 'No'}`)] });
            }

            // Show current welcome configuration
            if (subcommand === 'preview') {
                const cfg = welcome.getConfig(guildId);
                if (!cfg) {
                    return interaction.editReply({ embeds: [infoEmbed('No welcome configuration found for this server.')] });
                }

                const welcomeEmbed = new EmbedBuilder()
                    .setTitle('Welcome Configuration Preview')
                    .setColor(color.default)
                    .addFields(
                        { name: 'Enabled', value: cfg.enabled ? 'Yes' : 'No', inline: true },
                        { name: 'Channel', value: cfg.channel_id ? `<#${cfg.channel_id}>` : 'Not set', inline: true },
                        { name: 'Mode', value: cfg.mode === 'embed' ? 'Embed' : 'Text', inline: true },
                    );

                if (cfg.mode === 'text') {
                    welcomeEmbed.addFields(
                        { name: 'Text Content', value: cfg.text_content || 'Not set' },
                    );
                } else {
                    welcomeEmbed.addFields(
                        { name: 'Embed Title', value: cfg.embed_title || 'Not set' },
                        { name: 'Embed Description', value: cfg.embed_description || 'Not set' },
                        { name: 'Embed Color', value: cfg.embed_color || 'Not set', inline: true },
                        { name: 'Embed Thumbnail', value: cfg.embed_thumbnail_url || 'Not set', inline: true },
                        { name: 'Embed Image', value: cfg.embed_image_url || 'Not set', inline: true },
                        { name: 'Embed Footer', value: cfg.embed_footer || 'Not set', inline: true },
                        { name: 'Embed Timestamp', value: cfg.embed_timestamp ? 'Yes' : 'No', inline: true },
                    );
                }

                welcomeEmbed.addFields(
                    { name: 'Ping User', value: cfg.ping_user ? 'Yes' : 'No', inline: true },
                );

                return interaction.editReply({ embeds: [welcomeEmbed] });
            }

            // Clear welcome configuration
            if (subcommand === 'clear') {
                welcome.clear(guildId);
                return interaction.editReply({ embeds: [successEmbed('Welcome configuration has been cleared for this server.')] });
            }

            return interaction.editReply({ embeds: [errorEmbed('Unknown subcommand. Please use a valid subcommand.')], flags: MessageFlags.Ephemeral  });
        } catch (err) {
            console.error('Error executing welcome command:', err);
            return interaction.editReply({ embeds: [errorEmbed('An error occurred while executing the command. Please try again later.')], flags: MessageFlags.Ephemeral  });
        }
    }
}