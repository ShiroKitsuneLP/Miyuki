// Import necessary classes from discord.js
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

// Import nasessary modules
const fs = require('fs');
const path = require('path');

// Import color configuration
const { color } = require('./../../config/color.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows all commands or info about a category or command.')
        .addStringOption(option =>
            option
                .setName('query')
                .setDescription('Category or command name')
                .setRequired(false)
        ),
    usage: '/help [Categorie or Command]',
    async execute(interaction, miyuki) {

        // Get the query option if provided
        const query = interaction.options.getString('query');

        // Define paths to commands folders
        const commandsPath = path.join(__dirname, '..');
        const categories = fs.readdirSync(commandsPath).filter(file => fs.lstatSync(path.join(commandsPath, file)).isDirectory());

        // Check if no query is provided
        if (!query) {
            const fields = [];

            // Loop through each category and count commands
            for (const category of categories) {
                const folderPath = path.join(commandsPath, category);
                const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

                // Add category info to fields
                fields.push({
                    name: category,
                    value: `${commandFiles.length} Commands`,
                    inline: true
                });
            }

            // Create the embed message for categories
            const helpEmbed = new EmbedBuilder()
                .setColor(color.default)
                .setTitle('Command Categories')
                .setAuthor({
                    name: miyuki.user.username,
                    iconURL: miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 })
                })
                .setDescription('Here\'s an overview of all command categories. To see the commands within a specific category, use `/help [Category]`')
                .setThumbnail(miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 }))
                .addFields(fields);

            return await interaction.reply({ embeds: [helpEmbed] });
        }

        // Check if the query matches a category
        const matchedCategory  = categories.find(cat => cat.toLowerCase() === query.toLowerCase());
        if (matchedCategory) {

            // If a category is matched, show all commands in that category
            const fields = [];
            const categoryPath = path.join(commandsPath, matchedCategory);
            const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));

            // Loop through each command file in the matched category
            for (const file of commandFiles) {
                const command = require(path.join(categoryPath, file));
                if (command.data) {
                    fields.push({
                        name: `${command.data.name}`,
                        value: command.data.description || 'No description provided.',
                        inline: true
                    });
                }
            }

            // Create the embed message for commands in the category
            const helpCategoryEmbed = new EmbedBuilder()
                .setColor(color.default)
                .setTitle(`Commands in ${matchedCategory} category`)
                .setAuthor({
                    name: miyuki.user.username,
                    iconURL: miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 })
                })
                .setDescription(`Here are all commands in the **${matchedCategory}** category:`)
                .setThumbnail(miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 }))
                .addFields(fields);

            return await interaction.reply({ embeds: [helpCategoryEmbed] });
        }

        // If no category is matched, check if the query matches a command
        let foundCommand = null;
        let commandCategory = null;

        // Loop through each category to find the command
        for (const category of categories) {
            const categoryPath = path.join(commandsPath, category);
            const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));

            // Loop through each command file in the category
            for (const file of commandFiles) {
                const command = require(path.join(categoryPath, file));
                if (command.data && command.data.name.toLowerCase() === query.toLowerCase()) {
                    foundCommand = command;
                    commandCategory = category;
                    break;
                }
            }
            if (foundCommand) break;
        }

        // If a command is matched, show detailed info about the command
        if (foundCommand) {
            const helpCommandEmbed = new EmbedBuilder()
                .setColor(color.default)
                .setTitle(`Command: ${foundCommand.data.name}`)
                .setAuthor({
                    name: miyuki.user.username,
                    iconURL: miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 })
                })
                .setDescription(foundCommand.data.description || 'No description provided.')
                .setThumbnail(miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 }))
                .addFields(
                    { name: 'Category', value: commandCategory || 'Unknown', inline: true },
                    { name: 'Usage', value: foundCommand.usage || 'No usage information provided.', inline: true }
                );

            return await interaction.reply({ embeds: [helpCommandEmbed] });
        } else {
            // If no match is found, inform the user
            return await interaction.reply({ content: `No category or command found matching "${query}". Please check your input and try again.`, flags: MessageFlags.Ephemeral });
        }

    }
}