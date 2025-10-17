// Import necessary modules
const path = require('path');

// Import errorLog database repo
const { logError } = require(path.join(__dirname, '../database/repo/errorLog'));

// Centralized error handler
function errorHandler(error, { guildId = null, userId = null, command = null, context = null } = {}) {
	let errorMessage, stackTrace;

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

	// Log to database
	logError(guildId, userId, command, context, errorMessage, stackTrace);
}

module.exports = { errorHandler }
