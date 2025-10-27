// Import necessary modules
const path = require('path');

// Import errorLog database repo
const { logError, errorLogExists } = require(path.join(__dirname, '../database/repo/errorLog'));

// Centralized error handler
function errorHandler(error, { command = null } = {}) {
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

	// Log only if not already present
	if (!errorLogExists(command, errorMessage, stackTrace)) {
		logError(command, errorMessage, stackTrace);
	}
}

module.exports = { errorHandler }
