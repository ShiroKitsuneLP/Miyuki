// Import necessary modules
const path = require('path');

// Export all database repo modules
module.exports = {
    actionGif: require(path.join(__dirname, './actionGif')),
    errorLog: require(path.join(__dirname, './errorLog')),
    warn: require(path.join(__dirname, './warn'))
}