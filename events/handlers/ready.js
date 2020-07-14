// Listener event: runs whenever the bot sends a ready event (when it first starts for example)
module.exports = async (bot) => {
    console.log("Bot starting up...");
    bot.printSpace();

    // Status rotation
    var statusMessages = require("../status_messages.js");
    var possibleStatuses = statusMessages.length;
    var i = Math.floor(Math.random() * possibleStatuses);

    function statLoop() {
        setTimeout(function () {
            bot.user.setActivity(statusMessages[i]);
            i = Math.floor(Math.random() * possibleStatuses);
            statLoop();
            // New status every 5 minutes
        }, 300000)
    }

    statLoop();
};
