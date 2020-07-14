// Listener event: runs whenever the bot sends a ready event (when it first starts for example)
module.exports = async (bot) => {
    console.log("Bot starting up...");
    bot.printSpace();

    // Status rotation

    // TODO: add random choosing of messages with an integer that is randomly generated and an array of messages (strings, so it can be stored in a seperate file and dosen't clutter ready.js)
    var i = 1;
    var statuses = 11;
    function statusLoop() {
        setTimeout(function () {
            switch (i % statuses) {
                case 1:
                    bot.user.setActivity("With Khang's Catgirls");
                    break;
                case 2:
                    bot.user.setActivity("Kyle is there a reason why I was demodded?");
                    break;
                case 3:
                    bot.user.setActivity("Guten");
                    break;
                case 4:
                    bot.user.setActivity("Valhen");
                    break;
                case 5:
                    bot.user.setActivity("Skowhen");
                    break;
                case 6:
                    bot.user.setActivity("HanabiHen");
                    break;
                case 7:
                    bot.user.setActivity("Toontownhen");
                    break;
                case 8:
                    bot.user.setActivity("Increasing Daniel's WPM...");
                    break;
                case 9:
                    bot.user.setActivity("Watching Kyle blow more money on maple");
                    break;
                case 10:
                    bot.user.setActivity("With your permissions");
                    i = 1;
                    break;
                default:
                    bot.user.setActivity("THIS IS AN ERROR LOL");
                    i = 1;
            }
            i++;
            if (i < statuses){
                statusLoop();
            }
            // 10 minute intervals
        }, 600000)
    }

    statusLoop();
};
