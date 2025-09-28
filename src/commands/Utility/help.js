// Import nessesary discord.js modules
const { SlashCommandBuilder, MessageFlags } = require("discord.js");

// Import necessary modules
const fs = require("fs");
const path = require('path');

// Import embedBuilder
const { createMiyukiEmbed, createErrorEmbed } = require(path.join(__dirname, './../../utils/embedBuilder'));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Provides information about Miyuki and its commands.')
        .addStringOption(opt =>
            opt.setName('query')
                .setDescription('Category or command name')
                .setRequired(false)
        ),
    category: 'Utility',
    usage: '/help [Category or Command]',
    async execute(interaction, miyuki) {

        // Defer the reply to allow more time for processing
        await interaction.deferReply();

        // Get the query option if provided
        const query = interaction.options.getString('query');

    // Define paths to commands folders
    const commandsPath = path.join(__dirname, './..');
    const categories = fs.readdirSync(commandsPath).filter(file => fs.lstatSync(path.join(commandsPath, file)).isDirectory());

        try {

            // Check if no query is provided
            if (!query) {
                const categoryFields = [];

                // Loop through each category and count commands
                for (const category of categories) {
                    const folderPath = path.join(commandsPath, category);
                    const commandFiles = fs.readdirSync(folderPath)
                        .filter(file => file.endsWith('.js'))
                        .sort((a, b) => a.localeCompare(b));

                    // Add category info to fields
                    categoryFields.push({
                        name: category,
                        value: `${commandFiles.length} Commands`,
                        inline: true
                    });
                }

                // Send the embed message for categories
                await interaction.editReply({ embeds: [createMiyukiEmbed(miyuki, {
                    title: 'Command Categories',
                    description: 'Here\'s an overview of all command categories. To see the commands within a specific category, use `/help [Category]`',
                    fields: categoryFields
                })] });
                return;
            }

            // Check if the query matches a category
            const matchedCategory = categories.find(cat => cat.toLowerCase() === query.toLowerCase());

            if (matchedCategory) {

                const commandFields = [];

                // if a category is matched, list all commands in that category
                const folderPath = path.join(commandsPath, matchedCategory);
                const commandFiles = fs.readdirSync(folderPath)
                    .filter(file => file.endsWith('.js'))
                    .sort((a, b) => a.localeCompare(b));

                // Loop through each command file in the matched category
                for (const file of commandFiles) {
                    const command = require(path.join(folderPath, file));

                    commandFields.push({
                        name: command.data.name,
                        value: command.data.description || 'No description available.',
                        inline: true
                    });
                }

                // Send the embed message for commands in the matched category
                await interaction.editReply({ embeds: [createMiyukiEmbed(miyuki, {
                    title: `Commands in ${matchedCategory}`,
                    description: `Here\'s a list of all commands in the ${matchedCategory} category.`,
                    fields: commandFields
                })] });
                return;
            }

            // Check if the query matches a command
            const command = miyuki.commands.get(query.toLowerCase()) || miyuki.commands.find(cmd => cmd.data.name.toLowerCase() === query.toLowerCase());

            if (command) {

                // If a command is matched, show detailed info about the command
                await interaction.editReply({ embeds: [createMiyukiEmbed(miyuki, {
                    title: `Command: ${command.data.name}`,
                    description: command.data.description || 'No description available.',
                    fields: [
                        { name: 'Category', value: command.category || 'No category information available.' },
                        { name: 'Usage', value: command.usage || 'No usage information available.' }
                    ]
                })] });
                return;
            }
        } catch (error) {
            await interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                description: 'An error occurred while processing your request.'
            })], flags: MessageFlags.Ephemeral });
            console.error('Error executing help command:', error);
        }
    }
}