// Import necessary Discord.js classes
const { Events, MessageFlags } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, miyuki) {

        // Check if the interaction is a slash command
        if (!interaction.isChatInputCommand()) return;

        // Get the command from the client's commands collection and check if it exists
        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`[WARNING] No command matching ${interaction.commandName} was found.`);
            return;
        }

        // Try to execute the command
        try {
            await command.execute(interaction, miyuki);
        } catch (error) {
            console.error(`[Error] Error executing ${interaction.commandName}`);
            console.error(error);

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
            }
        }
    }
}