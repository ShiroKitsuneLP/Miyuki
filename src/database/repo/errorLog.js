// Import necessary modules
const path = require('path');

// Import database connection
const { db } = require(path.join(__dirname, './../db'));

// Prepare statements
const existsErrorLogStmt = db.prepare(`
    SELECT 1 FROM error_logs
    WHERE command = @command AND error_message = @error_message AND stack_trace = @stack_trace
    LIMIT 1;
`);

const insertErrorLog = db.prepare(`
    INSERT INTO error_logs (command, error_message, stack_trace, timestamp)
    VALUES (@command, @error_message, @stack_trace, @timestamp)
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

function errorLogExists(command, errorMessage, stackTrace) {
    return !!existsErrorLogStmt.get({
        command,
        error_message: errorMessage,
        stack_trace: stackTrace
    });
}

// Function to log an error only if not already present
function logError(command, errorMessage, stackTrace) {
    if (!errorLogExists(command, errorMessage, stackTrace)) {
        insertErrorLog.run({
            command: command,
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