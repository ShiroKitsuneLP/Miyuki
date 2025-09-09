// Import necessary classes from discord.js
const { Events, MessageFlags } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, miyuki) {
        // Only handle slash commands
        if(!interaction.isChatInputCommand()) return

        // Retrieve the command from the bot's collection
        const command = miyuki.commands.get(interaction.commandName);

        // If the command doesn't exist, log an error and return
        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        // Try to execute the command
        try {
            await command.execute(interaction, miyuki);
        } catch (err) {
            console.error(err);
            if(interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
            }
        }
    },
}