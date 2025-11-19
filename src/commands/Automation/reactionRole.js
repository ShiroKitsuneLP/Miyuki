// Import necessary discord.js modules
const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } = require("discord.js");

// Import necessary modules
const path = require("path");

// Import embedBuilder
const { createMiyukiEmbed, createSuccessEmbed, createErrorEmbed } = require(path.join(__dirname, "./../../utils/embedBuilder"));

// Import error handler
const { errorHandler } = require(path.join(__dirname, './../../utils/errorHandler'));

// Import reaction role database repo
const { reactionRole } = require(path.join(__dirname, "./../../database/repo"));

// Check if Hex color is valid
function isValidHexColor(color) {
    return /^#?[0-9A-Fa-f]{6}$/.test(color);
}

// Check if URL is valid
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reactionrole')
        .setDescription('Manage reaction roles for this server.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addSubcommand(sc =>
            sc.setName('create')
                .setDescription('Create a new reaction role message.')
                .addStringOption(opt =>
                    opt.setName('name')
                        .setDescription('The name of the reaction role message.')
                        .setRequired(true)
                )
                .addChannelOption(opt =>
                    opt.setName('channel')
                        .setDescription('The channel to send the reaction role message in.')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)
                )
        )
        .addSubcommand(sc =>
            sc.setName('list')
                .setDescription('List all reaction role messages in this server.')
        )
        .addSubcommand(sc =>
            sc.setName('details')
                .setDescription('Get details of a specific reaction role message.')
                .addStringOption(opt =>
                    opt.setName('name')
                        .setDescription('The name of the reaction role message.')
                        .setRequired(true)
                )
        )
        .addSubcommand(sc =>
            sc.setName('settext')
                .setDescription('Set the text for a reaction role message.')
                .addStringOption(opt =>
                    opt.setName('name')
                        .setDescription('The name of the reaction role message.')
                        .setRequired(true)
                )
                .addStringOption(opt =>
                    opt.setName('text')
                        .setDescription('The text to set for the reaction role message.')
                        .setRequired(true)
                )
        )
        .addSubcommand(sc =>
            sc.setName('setembed')
                .setDescription('Set the embed for a reaction role message.')
                .addStringOption(opt =>
                    opt.setName('name')
                        .setDescription('The name of the reaction role message.')
                        .setRequired(true)
                )
                .addStringOption(opt =>
                    opt.setName('title')
                        .setDescription('The title of the embed.')
                )
                .addStringOption(opt =>
                    opt.setName('description')
                        .setDescription('The description of the embed.')
                )
                .addStringOption(opt =>
                    opt.setName('color')
                        .setDescription('The color of the embed. (Hex code (#123456) or color name (/colors))')
                )
                .addStringOption(opt =>
                    opt.setName('thumbnail')
                        .setDescription('The thumbnail URL of the embed.')
                )
                .addStringOption(opt =>
                    opt.setName('image')
                        .setDescription('The image URL of the embed.')
                )
                .addStringOption(opt =>
                    opt.setName('footer')
                        .setDescription('The footer text of the embed.')
                )
        )
        .addSubcommand(sc =>
            sc.setName('addrole')
                .setDescription('Add a reaction role to a reaction role message.')
                .addStringOption(opt =>
                    opt.setName('name')
                        .setDescription('The name of the reaction role message.')
                        .setRequired(true)
                )
                .addRoleOption(opt =>
                    opt.setName('role')
                        .setDescription('The role ID to add as a reaction role.')
                        .setRequired(true)
                )
                .addStringOption(opt =>
                    opt.setName('emoji')
                        .setDescription('The emoji to use for the reaction role.')
                        .setRequired(true)
                )
        )
        .addSubcommand(sc =>
            sc.setName('removerole')
                .setDescription('Remove a reaction role from a reaction role message.')
                .addStringOption(opt =>
                    opt.setName('name')
                        .setDescription('The name of the reaction role message.')
                        .setRequired(true)
                )
                .addRoleOption(opt =>
                    opt.setName('role')
                        .setDescription('The role ID to remove from the reaction role message.')
                        .setRequired(true)
                )
        )
        .addSubcommand(sc =>
            sc.setName('togglerolelist')
                .setDescription('Toggle the display of the role list in the reaction role message.')
                .addStringOption(opt =>
                    opt.setName('name')
                        .setDescription('The name of the reaction role message.')
                        .setRequired(true)
                )
        )
        .addSubcommand(sc =>
            sc.setName('delete')
                .setDescription('Delete a reaction role message.')
                .addStringOption(opt =>
                    opt.setName('name')
                        .setDescription('The name of the reaction role message.')
                        .setRequired(true)
                )
        ),
    category: 'Automation',
    usage: '/reactionrole <subcommand> [options]',
    async execute(interaction, miyuki) {

        // Ensure the command is used in a guild
        if (!interaction.inGuild()) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'Guild Only Command',
                description: 'This command can only be used in a server.'
            })] });
        }

        // Defer the reply to allow more time for processing
        await interaction.deferReply();

        // Get the subcommand
        const subcommand = interaction.options.getSubcommand(false);

        const guildId = interaction.guild.id;

        try {

            if (subcommand === 'create') {

                const name = interaction.options.getString('name');
                const channel = interaction.options.getChannel('channel');

                // Check if channel is a text channel
                if(!channel || channel.type !== ChannelType.GuildText) {
                    return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                        title: 'Invalid Channel',
                        description: 'Please specify a valid text channel for the reaction role message.'
                    })] });
                }

                // Create placeholder message
                const msg = await channel.send({ embeds: [createMiyukiEmbed(miyuki, {
                    title: 'Reaction Role Message',
                    description: 'This is a Placeholder reaction role message. Use the `/reactionrole settext` or `/reactionrole setembed` commands to customize this message, and `/reactionrole addrole` to add reaction roles!'
                })] });

                // Save to database
                await reactionRole.createMessage(guildId, channel.id, msg.id, name);

                return interaction.editReply({ embeds: [createSuccessEmbed(miyuki, {
                    title: 'Reaction Role Message Created',
                    description: `Successfully created reaction role message **${name}** in ${channel}.`
                })] });
            }

            if (subcommand === 'list') {

                // Fetch all reaction role messages for the guild
                const rrMsgs = await reactionRole.getAllReactionRoleMessages(guildId);

                // Check if there are no reaction role messages
                if (rrMsgs.length === 0) {
                    return interaction.editReply({ embeds: [createMiyukiEmbed(miyuki, {
                        title: 'No Reaction Role Messages',
                        description: 'There are no reaction role messages set up on this server.'
                    })] });
                }

                // List all reaction role messages
                return interaction.editReply({ embeds: [createMiyukiEmbed(miyuki, {
                    title: 'Reaction Role Messages',
                    description: rrMsgs.map(rr => `**${rr.name}** in <#${rr.channel_id}> (Message ID: \`${rr.message_id}\`)`).join('\n')
                })] });
            }

            if (subcommand === 'details') {

                const name = interaction.options.getString('name');

                // Fetch reaction role message by name
                const rrMsg = await reactionRole.getMessageByName(guildId, name);

                // Check if reaction role message exists
                if (!rrMsg) {
                    return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                        title: 'Reaction Role Message Not Found',
                        description: `No reaction role message found with the name **${name}**.`
                    })] });
                }

                // Show details of the reaction role message
                return interaction.editReply({ embeds: [createMiyukiEmbed(miyuki, {
                    title: `Reaction Role Message: ${rrMsg.name}`,
                    description: `All details for the reaction role message **${rrMsg.name}**:`,
                    fields: [
                        { name: 'Channel', value: `<#${rrMsg.channel_id}>`, inline: true },
                        { name: 'Message ID', value: `\`${rrMsg.message_id}\``, inline: true },
                        { name: 'Show Role List', value: !!rrMsg.show_role_list ? 'Yes' : 'No', inline: true }
                    ]
                })] });
            }

            if (subcommand === 'settext') {

                const name = interaction.options.getString('name');
                const text = interaction.options.getString('text');

                // Fetch reaction role message by name
                const rrMsg = await reactionRole.getMessageByName(guildId, name);

                // Check if reaction role message exists
                if (!rrMsg) {
                    return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                        title: 'Reaction Role Message Not Found',
                        description: `No reaction role message found with the name **${name}**.`
                    })] });
                }

                // Fetch the message to edit
                const channel = interaction.guild.channels.cache.get(rrMsg.channel_id);

                // Check if channel is a text channel
                if (!channel || !channel.isTextBased()) {
                    return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                        title: 'Channel Not Found',
                        description: 'The channel for this reaction role message could not be found. It may have been deleted.'
                    })] });
                }

                const msg = await channel.messages.fetch(rrMsg.message_id).catch(() => null);

                // Check if message exists
                if (!msg) {
                    return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                        title: 'Message Not Found',
                        description: 'The reaction role message could not be found. It may have been deleted.'
                    })] });
                }

                // Edit the message with the new text
                await msg.edit({ content: text, embeds: [] });

                // Check if Role List is enabled and set it
                if (rrMsg && !!rrMsg.show_role_list) {
                    const roles = await reactionRole.getReactionRolesByMessageId(guildId, rrMsg.message_id);

                    let list = '';

                    for (const r of roles) {
                        list += `${r.emoji} - <@&${r.role_id}>\n`;
                    }

                    await msg.edit({ content: msg.content.split('\n---\n')[0] + '\n---\n' + list });
                }

                // Send success embed
                return interaction.editReply({ embeds: [createSuccessEmbed(miyuki, {
                    title: 'Reaction Role Message Updated',
                    description: `Successfully updated the text for reaction role message **${name}**.`
                })] });
            }

            if (subcommand === 'setembed') {

                const name = interaction.options.getString('name');
                const title = interaction.options.getString('title');
                const description = interaction.options.getString('description');
                const color = interaction.options.getString('color');
                const thumbnail = interaction.options.getString('thumbnail');
                const image = interaction.options.getString('image');
                const footer = interaction.options.getString('footer');

                // Import color config
                const { colors } = require(path.join(__dirname, './../../config/color.json'));

                // Fetch reaction role message by name
                const rrMsg = await reactionRole.getMessageByName(guildId, name);
                if (!rrMsg) {
                    return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                        title: 'Reaction Role Message Not Found',
                        description: `No reaction role message found with the name **${name}**.`
                    })] });
                }

                // Fetch the message to edit
                const channel = interaction.guild.channels.cache.get(rrMsg.channel_id);
                if (!channel || !channel.isTextBased()) {
                    return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                        title: 'Channel Not Found',
                        description: 'The channel for this reaction role message could not be found. It may have been deleted.'
                    })] });
                }

                // Fetch the message to edit
                const msg = await channel.messages.fetch(rrMsg.message_id).catch(() => null);

                if (!msg) {
                    return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                        title: 'Message Not Found',
                        description: 'The reaction role message could not be found. It may have been deleted.'
                    })] });
                }

                // Color validation: first check hex, then color name
                let embedColor;

                if (color) {
                    if (isValidHexColor(color)) {
                        embedColor = color.startsWith('#') ? color : `#${color}`;
                    } else if (colors[color.toLowerCase()]) {
                        embedColor = colors[color.toLowerCase()].hex;
                    } else {
                        return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                            title: 'Invalid Color',
                            description: 'Please provide a valid color name (see /colors) or a valid hex code (e.g. #123456).'
                        })] });
                    }
                }

                // Validate thumbnail URL
                if (thumbnail && !isValidUrl(thumbnail)) {
                    return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                        title: 'Invalid Thumbnail URL',
                        description: 'Please provide a valid URL for the thumbnail.'
                    })] });
                }

                // Validate image URL
                if (image && !isValidUrl(image)) {
                    return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                        title: 'Invalid Image URL',
                        description: 'Please provide a valid URL for the image.'
                    })] });
                }

                // Build the embed
                await msg.edit({ content: '', embeds: [createMiyukiEmbed(miyuki, {
                    title: title || null,
                    description: description || null,
                    color: embedColor || null,
                    thumbnail: thumbnail || null,
                    image: image || null,
                    footer: { text: footer || null }
                })] });

                // Check if Role List is enabled and set it
                if (rrMsg && !!rrMsg.show_role_list) {
                    const roles = await reactionRole.getReactionRolesByMessageId(guildId, rrMsg.message_id);

                    const embed = EmbedBuilder.from(msg.embeds[0]);
                    embed.data.fields = [];

                    embed.addFields({ name: 'Roles', value: roles.map(r => `${r.emoji} - <@&${r.role_id}>`).join('\n') || 'No reaction roles set.' });

                    await msg.edit({ embeds: [embed] });
                }

                // Send success embed
                return interaction.editReply({ embeds: [createSuccessEmbed(miyuki, {
                    title: 'Reaction Role Message Updated',
                    description: `Successfully updated the embed for reaction role message **${name}**.`
                })] });
            }

            if (subcommand === 'addrole') {

                const name = interaction.options.getString('name');
                const roleId = interaction.options.getRole('role').id;
                let emojiRaw = interaction.options.getString('emoji');

                let emoji;

                // Emoji normalization
                if (/^<a?:\w+:\d+>$/.test(emojiRaw)) {

                    // Custom emoji: store only the ID
                    emoji = emojiRaw.match(/\d+/)[0];
                    
                    if (!emoji) {
                        return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                            title: 'Invalid Emoji',
                            description: 'The specified custom emoji could not be found in this server.'
                        })] });
                    }
                } else {
                    // Unicode emoji: store only the name
                    emoji = emojiRaw;
                }

                // Fetch reaction role message by name
                const rrMsg = await reactionRole.getMessageByName(guildId, name);

                if (!rrMsg) {
                    return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                        title: 'Reaction Role Message Not Found',
                        description: `No reaction role message found with the name **${name}**.`
                    })] });
                }

                const channel = interaction.guild.channels.cache.get(rrMsg.channel_id);
                const msg = await channel.messages.fetch(rrMsg.message_id);

                // Check if msg exists
                if (!msg) {
                    return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                        title: 'Message Not Found',
                        description: `The message for reaction role **${name}** could not be found in the specified channel.`
                    })] });
                }

                // Add reaction role to database
                await reactionRole.addReactionRole(guildId, rrMsg.message_id, roleId, emoji);
                await msg.react(emoji);

                // Update Role List in message if enabled
                if (rrMsg && !!rrMsg.show_role_list) {
                    const roles = await reactionRole.getReactionRolesByMessageId(guildId, rrMsg.message_id);

                    if (msg.embeds.length > 0) {
                        const embed = EmbedBuilder.from(msg.embeds[0]);
                        embed.data.fields = [];

                        embed.addFields({ name: 'Roles', value: roles.map(r => `${r.emoji} - <@&${r.role_id}>`).join('\n') || 'No reaction roles set.' });

                        await msg.edit({ embeds: [embed] });
                    } else {
                        let list = '';

                        for (const r of roles) {
                            list += `${r.emoji} - <@&${r.role_id}>\n`;
                        }

                        await msg.edit({ content: msg.content.split('\n---\n')[0] + '\n---\n' + list });
                    }
                }

                return interaction.editReply({ embeds: [createSuccessEmbed(miyuki, {
                    title: 'Reaction Role Added',
                    description: `Successfully added the reaction role to message **${name}**.`
                })] });
            }

            if (subcommand === 'removerole') {

                const name = interaction.options.getString('name');
                const roleId = interaction.options.getRole('role').id;

                // Fetch reaction role message by name
                const rrMsg = await reactionRole.getMessageByName(guildId, name);

                if (!rrMsg) {
                    return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                        title: 'Reaction Role Message Not Found',
                        description: `No reaction role message found with the name **${name}**.`
                    })] });
                }

                const channel = interaction.guild.channels.cache.get(rrMsg.channel_id);
                const msg = await channel.messages.fetch(rrMsg.message_id);

                // Check if msg exists
                if (!msg) {
                    return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                        title: 'Message Not Found',
                        description: `The message for reaction role **${name}** could not be found in the specified channel.`
                    })] });
                }

                // Remove the reaction from the message
                const roles = await reactionRole.getReactionRolesByMessageId(guildId, rrMsg.message_id);
                const target = roles.find(r => r.role_id === roleId);

                if (target) {
                    await msg.reactions.resolve(target.emoji)?.remove();
                }

                // Remove reaction role from database
                await reactionRole.deleteReactionRole(guildId, rrMsg.message_id, roleId);

                // Update Role List in message if enabled
                if (rrMsg && !!rrMsg.show_role_list) {
                    const roles = await reactionRole.getReactionRolesByMessageId(guildId, rrMsg.message_id);

                    if (msg.embeds.length > 0) {
                        const embed = EmbedBuilder.from(msg.embeds[0]);
                        embed.data.fields = [];

                        embed.addFields({ name: 'Roles', value: roles.map(r => `${r.emoji} - <@&${r.role_id}>`).join('\n') || 'No reaction roles set.' });

                        await msg.edit({ embeds: [embed] });
                    } else {
                        let list = '';

                        for (const r of roles) {
                            list += `${r.emoji} - <@&${r.role_id}>\n`;
                        }

                        await msg.edit({ content: msg.content.split('\n---\n')[0] + '\n---\n' + list });
                    }
                }

                return interaction.editReply({ embeds: [createSuccessEmbed(miyuki, {
                    title: 'Reaction Role Removed',
                    description: `Successfully removed the reaction role from message **${name}**.`
                })] });
            }

            if (subcommand === 'togglerolelist') {

                const name = interaction.options.getString('name');

                // Fetch reaction role message by name
                const rrMsg = await reactionRole.getMessageByName(guildId, name);

                if (!rrMsg) {
                    return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                        title: 'Reaction Role Message Not Found',
                        description: `No reaction role message found with the name **${name}**.`
                    })] });
                }

                // Toggle show_role_list
                const newShowRoleList = !rrMsg.show_role_list;
                await reactionRole.updateShowRoleList(guildId, rrMsg.message_id, newShowRoleList);

                const channel = interaction.guild.channels.cache.get(rrMsg.channel_id);
                const msg = await channel.messages.fetch(rrMsg.message_id);

                // Update Role List in message
                if (newShowRoleList) {
                    const roles = await reactionRole.getReactionRolesByMessageId(guildId, rrMsg.message_id);

                    if (msg.embeds.length > 0) {
                        const embed = EmbedBuilder.from(msg.embeds[0]);
                        embed.data.fields = [];

                        embed.addFields({ name: 'Roles', value: roles.map(r => `${r.emoji} - <@&${r.role_id}>`).join('\n') || 'No reaction roles set.' });

                        await msg.edit({ embeds: [embed] });
                    } else {
                        let list = '';

                        for (const r of roles) {
                            list += `${r.emoji} - <@&${r.role_id}>\n`;
                        }

                        await msg.edit({ content: msg.content.split('\n---\n')[0] + '\n---\n' + list });
                    }
                } else {
                    if (msg.embeds.length > 0) {
                        const embed = EmbedBuilder.from(msg.embeds[0]);
                        embed.data.fields = [];
                        await msg.edit({ embeds: [embed] });
                    } else {
                        await msg.edit({ content: msg.content.split('\n---\n')[0] });
                    }
                }

                return interaction.editReply({ embeds: [createSuccessEmbed(miyuki, {
                    title: 'Role List Toggled',
                    description: `Successfully ${newShowRoleList ? 'enabled' : 'disabled'} the role list display for reaction role message **${name}**.`
                })] });
            }

            if (subcommand === 'delete') {

                const name = interaction.options.getString('name');

                // Fetch reaction role message by name
                const rrMsg = await reactionRole.getMessageByName(guildId, name);

                if (!rrMsg) {
                    return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                        title: 'Reaction Role Message Not Found',
                        description: `No reaction role message found with the name **${name}**.`
                    })] });
                }

                // Delete from database
                await reactionRole.deleteMessage(guildId, rrMsg.message_id);

                // Delete the message from the channel
                const channel = interaction.guild.channels.cache.get(rrMsg.channel_id);
                const msg = await channel.messages.fetch(rrMsg.message_id).catch(() => null);

                if (msg) {
                    await msg.delete().catch(() => null);
                }

                return interaction.editReply({ embeds: [createSuccessEmbed(miyuki, {
                    title: 'Reaction Role Message Deleted',
                    description: `Successfully deleted reaction role message **${name}**.`
                })] });
            }

        } catch (error) {

            // Log error in database
            errorHandler(error, {
                context: 'Command',
                file: 'reactionRole'
            });

            try {

                // Send error embed
                return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                    description: 'An unexpected error occurred while executing the command. Please try again later.'
                })] });

            } catch (err) {
                // Fallback
            }
        }
    }
}