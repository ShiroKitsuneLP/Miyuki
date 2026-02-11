// Import necessary modules
const path = require('path');

// Import errorLog database repo
const { errorLog } = require(path.resolve(__dirname, '../database/repo'));

// Import embedBuilder
const { createErrorEmbed } = require( './embedBuilder');

// Centralized error handler
async function errorHandler(error, { context = null, category = null, file = null, interaction = null, client = null } = {}) {
	let errorMessage, stackTrace;

	const timestamp = new Date();

	if (typeof error === 'string') {
		errorMessage = error;
		stackTrace = null;
	} else if (error instanceof Error) {
		errorMessage = error.message;
		stackTrace = error.stack;
	} else {
		errorMessage = String(error);
		stackTrace = null;
	}

	// Log Error
	try {
		await errorLog.addErrorLog(context, category, file, errorMessage, stackTrace, timestamp);
	} catch (error) {
		console.error('[Database] Failed to Log Error: ', error);
	}

	// Send Error Embed to Sender
	if (interaction && client) {
		try {
			if (interaction.deferred || interaction.replied) {
				await interaction.editReply({ embeds: [createErrorEmbed(client, {
					desc: 'An unexpected error occurred while executing the command. Please try again later.'
				})] });
			} else {
				await interaction.reply({ embeds: [createErrorEmbed(client, {
					desc: 'An unexpected error occurred while executing the command. Please try again later.'
				})] });
			}
		} catch {
			// Fallback
		}
	}
}

module.exports = { errorHandler }