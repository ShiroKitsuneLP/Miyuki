// Import necessary discord.js modules
const { EmbedBuilder } = require('discord.js');

// Import necessary modules
const path = require('path');

// Import color config
const { miyukiColors } = require(path.join(__dirname, './../config/color.json'));

// Function to create a standardized embed for Miyuki
function createMiyukiEmbed(client, options = {}) {
    const embed = new EmbedBuilder()

    // Set Embed Author
    embed.setAuthor({
        name: client.user.username,
        iconURL: client.user.displayAvatarURL()
    })

    // Set Embed Color
    embed.setColor(options.color || miyukiColors.default);

    // Set Embed Title if provided
    if(options.title) {
        embed.setTitle(options.title);
    }

    // set URL if provided
    if(options.url) {
        embed.setURL(options.url);
    }

    // Set Embed Description if provided
    if(options.description) {
        embed.setDescription(options.description);
    }

    // Set Embed Thumbnail if provided
    if(options.thumbnail) {
        embed.setThumbnail(options.thumbnail);
    }

    // Add fields if provided
    if (options.fields && Array.isArray(options.fields)) {
        embed.addFields(...options.fields);
    }

    // Set Embed Image if provided
    if(options.image) {
        embed.setImage(options.image);
    }

    // Set Embed Footer if provided
    if(options.footer) {
        embed.setFooter({
            text: options.footer.text,
            iconURL: options.footer.iconURL
        });
    }

    // Set Embed Timestamp if specified
    if(options.timestamp) {
        embed.setTimestamp(options.timestamp === true ? new Date() : options.timestamp);
    }

    return embed;
}

// Function to create a success embed
function createSuccessEmbed(client, options = {}) {
    return createMiyukiEmbed(client, {
        color: miyukiColors.success,
        title: options.title || 'Success',
        url: options.url,
        description: options.description || 'Operation completed successfully.',
        thumbnail: options.thumbnail,
        fields: options.fields,
        image: options.image,
        footer: options.footer,
        timestamp: options.timestamp
    });
}

// Function to create an error embed
function createErrorEmbed(client, options = {}) {
    return createMiyukiEmbed(client, {
        color: miyukiColors.error,
        title: options.title || 'Error',
        url: options.url,
        description: options.description || 'An error occurred.',
        thumbnail: options.thumbnail,
        fields: options.fields,
        image: options.image,
        footer: options.footer,
        timestamp: options.timestamp
    });
}

// Function to create a warn embed
function createWarnEmbed(client, options = {}) {
    return createMiyukiEmbed(client, {
        color: miyukiColors.warn,
        title: 'User Warned',
        description: `${options.user} has been warned.`,
        fields: [
            { name: 'Reason', value: options.reason || 'No reason provided', inline: false },
            { name: 'Total Warns', value: `${options.warnCount}`, inline: true },
            { name: 'Moderator', value: `<@${options.moderator.id}>`, inline: true }
        ]
    });
}

// Function to create a DM warn embed
function createDMWarnEmbed(client, options = {}) {
    return createMiyukiEmbed(client, {
        color: miyukiColors.warn,
        title: 'You have been warned',
        description: `You have received a warning in **${options.guild.name}**.`,
        fields: [
            { name: 'Reason', value: options.reason || 'No reason provided', inline: false },
            { name: 'Moderator', value: `<@${options.moderator.id}>`, inline: true }
        ]
    });
}

module.exports = {
    createMiyukiEmbed,
    createSuccessEmbed,
    createErrorEmbed,
    createWarnEmbed,
    createDMWarnEmbed
}