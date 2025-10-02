// Import necessary modules
const path = require('path');

// Export all database repo modules
module.exports = {
    actionGif: require(path.join(__dirname, './actionGif')),
    chatFilter: require(path.join(__dirname, './chatFilter')),
    warn: require(path.join(__dirname, './warn'))
}