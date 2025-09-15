const { startWarnCleanup } = require('./warncleanup');

function startUtils() {
    startWarnCleanup();
}

module.exports = { startUtils };
