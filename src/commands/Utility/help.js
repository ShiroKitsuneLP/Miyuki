// Import necessary Discord.js classes
const { SlashCommandBuilder } = require('discord.js');

// Import necessary modules
const fs = require('fs');
const path = require('path');

// Import embedBuilder
const { createMiyukiEmbed } = require(path.resolve(__dirname, '../../utils/embedBuilder'));

// Import error handler
const { errorHandler } = require(path.resolve(__dirname, '../../utils/errorHandler'));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Provides a List of available commands or detailed info about a specific command.')
        .addStringOption(opt =>
            opt.setName('query')
                .setDescription('Category or Command')
        ),
    category: 'Utility',
    usage: '/help [Category or Command]',
    async execute(interaction, miyuki) {

        // Get query Option if provided
        const query = interaction.options.getString('query');

        // Define paths to commands folders
        const commandsPath = path.join(__dirname, './..');
        const categories = fs.readdirSync(commandsPath).filter(file => fs.lstatSync(path.join(commandsPath, file)).isDirectory());
        
        // Defer the reply to have more time
        await interaction.deferReply();

        try {

            // Check if Query is provided
            if (!query) {
                const categoryFields = [];

                // Loop through each Category and count Commands
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

                // Send the Embed Msg with all Categories with Counted Commands
                await interaction.editReply({ embeds: [createMiyukiEmbed(miyuki, {
                    title: 'Command Categories',
                    desc: 'Here\'s an overview of all command categories. To see the commands within a specific category, use `/help [Category]`',
                    fields: categoryFields
                })] });

                return;
            }

            const lowerCaseQuery = query.toLowerCase();

            // Check if Query Input matches a Category
            const matchedCategory = categories.find(cat => cat.toLowerCase() === lowerCaseQuery);

            if (matchedCategory) {
                const commandFields = [];

                // List all Commands in that Category
                const folderPath = path.join(commandsPath, matchedCategory);
                const commandFiles = fs.readdirSync(folderPath)
                    .filter(file => file.endsWith('.js'))
                    .sort((a, b) => a.localeCompare(b));

                // Loop through each Command file in that Category
                for (const file of commandFiles) {
                    const command = require(path.join(folderPath, file));

                    commandFields.push({
                        name: command.data.name,
                        value: command.data.description || 'No Description available.',
                        inline: true
                    });
                }

                // Send Embed Msg with all Commands in that Category
                await interaction.editReply({ embeds: [createMiyukiEmbed(miyuki, {
                    title: `Commands in ${matchedCategory}`,
                    desc: 'Here\'s a list of all commands in this category:',
                    fields: commandFields
                })] });

                return;
            }

            // Check if Query Input matches a specific Command 
            const command = miyuki.commands.find(cmd => cmd.data.name.toLowerCase() === lowerCaseQuery);

            if (command) {

                // Send Embed Msg with all Info's from that Command
                await interaction.editReply({ embeds: [createMiyukiEmbed(miyuki, {
                    title: `Command: ${command.data.name}`,
                    desc: command.data.description || 'No description available.',
                    fields: [
                        { name: 'Category', value: command.category || 'No category information available.' },
                        { name: 'Usage', value: command.usage || 'No usage information available.' }
                    ]
                })] });

                return;
            }

        } catch (error) {
            await errorHandler(error, {
                context: 'Commands',
                category: 'Utility',
                file: 'help',
                interaction,
                client: miyuki
            });
        }
    }
}