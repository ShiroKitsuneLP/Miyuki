// Import necessary modules
const path = require('path');

// Import errorLog database repo
const { errorLog } = require(path.resolve(__dirname, '../database/repo'));

// Centralized error handler
async function errorHandler(error, { context = null, file = null } = {}) {
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

	// Log Error
	try {
		await errorLog.logError(context, file, errorMessage, stackTrace);
	} catch (error) {
		console.error('[Database] Couldn\'t Log Error:', error);
	}
}

module.exports = { errorHandler }