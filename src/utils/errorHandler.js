// Import necessary modules
const path = require('path');

// Import errorLog database repo
const { errorLog } = require(path.join(__dirname, '../database/repo'));

// Centralized error handler
function errorHandler(error, { context = null, file = null } = {}) {
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
	if (!errorLog.errorLogExists(context, file, errorMessage, stackTrace)) {
		errorLog.logError(context, file, errorMessage, stackTrace);
	}
}

module.exports = { errorHandler }
