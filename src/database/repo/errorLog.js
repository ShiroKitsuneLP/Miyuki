// Import necessary modules
const path = require('path');

// Import database connection
const { db } = require(path.join(__dirname, './../db'));

// Prepare statements
const existsErrorLogStmt = db.prepare(`
    SELECT 1 FROM error_logs
    WHERE context = @context AND file = @file AND error_message = @error_message AND stack_trace = @stack_trace
    LIMIT 1;
`);

const insertErrorLog = db.prepare(`
    INSERT INTO error_logs (context, file, error_message, stack_trace, timestamp)
    VALUES (@context, @file, @error_message, @stack_trace, @timestamp)
`);

const listErrorLogsStmt = db.prepare(`
    SELECT * FROM error_logs
    ORDER BY id
    LIMIT @limit OFFSET @offset;
`);

const getErrorLogByIdStmt = db.prepare(`
    SELECT * FROM error_logs
    WHERE id = @id;
`);

const removeErrorLogByIdStmt = db.prepare(`
    DELETE FROM error_logs
    WHERE id = @id;
`);

const clearErrorLogsStmt = db.prepare(`
    DELETE FROM error_logs;
`);

function errorLogExists(context, file, errorMessage, stackTrace) {
    return !!existsErrorLogStmt.get({
        context,
        file,
        error_message: errorMessage,
        stack_trace: stackTrace
    });
}

// Function to log an error only if not already present
function logError(context, file, errorMessage, stackTrace) {
    if (!errorLogExists(context, file, errorMessage, stackTrace)) {
        insertErrorLog.run({
            context: context,
            file: file,
            error_message: errorMessage,
            stack_trace: stackTrace,
            timestamp: Date.now()
        });
    }
}

// Function to list error logs with pagination
function listErrorLogs(limit = 50, offset = 0) {
    return listErrorLogsStmt.all({ limit, offset });
}

// Function to get a specific error log by ID
function getErrorLogById(id) {
    return getErrorLogByIdStmt.get({ id });
}

function removeErrorLogById(id) {
    return removeErrorLogByIdStmt.run({ id });
}

function clearErrorLogs() {
    return clearErrorLogsStmt.run();
}

module.exports = {
    errorLogExists,
    logError,
    listErrorLogs,
    getErrorLogById,
    removeErrorLogById,
    clearErrorLogs
}