// Import necessary Discord.js classes
const { EmbedBuilder } = require('discord.js');

// Import necessary modules
const path = require('path');

// Import Color Config
const { miyukiColors } = require(path.join(__dirname, './../config/color.json'));

// Function to create a standardized embed for Miyuki
function createMiyukiEmbed(client, options = {}) {
    const embed = new EmbedBuilder();

    // Set Embed Author
    embed.setAuthor({
        name: client.user.username,
        iconURL: client.user.displayAvatarURL()
    });

    // Set Embed Color
    embed.setColor(options.color || miyukiColors.default);

    // Set Embed Title if privided
    if(options.title) {
        embed.setTitle(options.title);
    }

    // Set URL if provided
    if(options.url) {
        embed.setURL(options.url);
    }

    // Set Embed Description if provided
    // Short Version: desc
    if(options.description || options.desc) {
        embed.setDescription(options.description || options.desc);
    }

    // Set Thumbnaul if provided
    // Short Version: thumb
    if(options.thumbnail || options.thumb) {
        embed.setThumbnail(options.thumbnail || options.thumb);
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

module.exports = {
    createMiyukiEmbed
}