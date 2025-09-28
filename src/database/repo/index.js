// Import necessary modules
const path = require('path');

// Export all database repo modules
module.exports = {
    actiongif: require(path.join(__dirname, './actiongif')),
    warn: require(path.join(__dirname, './warn'))
}