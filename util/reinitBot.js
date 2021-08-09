const path = require('path');
const fs = require('fs');

// Watches important bot files (e.g. commands, events, constants, etc.) to
// register when files have been changed for use in reInitBot whenever a message is
// sent on the Discord dev channel.
// Input: Bot client that contains the bot.changedFiles map that's used to register
// when a relevant file has changed.
module.exports.watchBotFiles = (bot) => {
    bot.changedFiles = {};
    bot.changedFiles.commands = new Map();

    const rootDir = __dirname + "/.."

    // Watch command files
    const cmdDir = rootDir + "/commands/";
    fs.watch(cmdDir, (event, filename) => {
        if (filename && event === "change" && filterJsFiles(filename)) {
            bot.changedFiles.commands.set(cmdDir + filename, true);
        }
    });
}

// Reload commands, events, constants, etc. that have had their file changed.
// (this only happens in dev mode).
// Input: Bot client that contains the commands, events, constants, etc. collections
// as well as a bot.changedFiles map that's used to know what files changed.
module.exports.reInitBot = (bot) => {
    reinitCmds(bot);
}

function filterJsFiles(file) {
    if (file.split(".").pop() !== "js") return false;
    if (file === "index.js") return false;
    return true;
}

function reloadModule(module) {
    delete require.cache[require.resolve(module)];
    return require(module);
}

function reinitCmds(bot) {
    let i = 1;
    const numCmdsChanged = bot.changedFiles.commands.size;
    if (numCmdsChanged > 0) {
        console.log(`Reloading ${numCmdsChanged} commands...`);
        bot.changedFiles.commands.forEach((_, filename) => {
            let props = reloadModule(filename);
            console.log(`${i++}: ${path.basename(filename)} reloaded!`);
            
            // Set command to be that of the reloaded module
            bot.commands.set(props.help.commandName, props);
            bot.changedFiles.commands.delete(filename);
        });
        bot.printSpace();
    }
}