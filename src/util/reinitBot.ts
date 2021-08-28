const path = require('path');
const fs = require('fs');
const { constants } = require('buffer');

// Watches important bot files (e.g. commands, events, constants, etc.) to
// register when files have been changed for use in reInitBot whenever a message is
// sent on the Discord dev channel.
// Input: Bot client that contains the bot.changedFiles map that's used to register
// when a relevant file has changed.
export const watchBotFiles = (bot) => {
    // Init the changedFiles property that tracks our files we want to watch for changes
    bot.changedFiles = {
        commands: new Map(),
        util: new Map(),
        eventLibs: {},
        constants: false,
        event_percentages: false
    };

    const rootDir = __dirname + "/.."

    // Watch command, util directories
    const cmdDir = rootDir + "/commands/";
    watchBotDir(cmdDir, bot.changedFiles.commands);
    const utilDir = rootDir + "/util/";
    watchBotDir(utilDir, bot.changedFiles.util);

    // Watch constants, event_percentages files
    const constFile = rootDir + "/constants.js";
    watchBotFile(bot, constFile, "constants");
    const event_percentagesFile = rootDir + "/events/event_percentages.js";
    watchBotFile(bot, event_percentagesFile, "event_percentages");

}

// Reload commands, events, constants, etc. that have had their file changed.
// (this only happens in dev mode).
// Input: Bot client that contains the commands, events, constants, etc. collections
// as well as a bot.changedFiles map that's used to know what files changed.
export const reInitBot = (bot) => {
    reinitCmds(bot);
    reinitUtil(bot);

    const rootDir = __dirname + "/..";
    // TODO: TypeScript migration
    // bot.constants = reinitFile(bot, rootDir + "/constants.js", "constants");
    bot.event_percentages = reinitFile(bot, rootDir + "/events/event_percentages.js", "event_percentages");
}

/*
function watchBotHelper(bot, path, helperFunc) {
    fs.watch(path, (event, filename) => {
        if (filename && event === "change" && filterJsFiles(filename)) {
            helperFunc(bot, reloadModule(path + filename));
        }
    });
}

function reinitCmd(bot, cmd) {

}*/

// ChangedFilesMap should be a map in the bot.changedFiles object
function watchBotDir(dirPath, changedFilesMap) {
    fs.watch(dirPath, (event, filename) => {
        if (filename && event === "change" && filterJsFiles(filename)) {
            changedFilesMap.set(dirPath + filename, true);
        }
    });
}

// ChangedFilesProp should be a boolean in the bot.changedFiles object
function watchBotFile(bot, filePath, changedFilesProp) {
    fs.watch(filePath, (event, filename) => {
        if (filename && event === "change" && filename === path.basename(filePath)) {
            bot.changedFiles[changedFilesProp] = true;
        }
    });
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

function reinitUtil(bot) {
    let i = 1;
    const numUtilChanged = bot.changedFiles.util.size;
    if (numUtilChanged > 0) {
        console.log(`Reloading ${numUtilChanged} util files...`);
        bot.changedFiles.util.forEach((_, filename) => {
            let bufferFunction = reloadModule(filename);
            console.log(`${i++}: ${path.basename(filename)} reloaded!`);
            
            let functionKeys = Object.keys(bufferFunction);
            let functionValues = Object.values(bufferFunction);
        
            for (i=0; i<functionKeys.length; i++) {
                bot.util[`${functionKeys[i]}`] = functionValues[i];
            }
            bot.changedFiles.util.delete(filename);
        });
        bot.printSpace();
    }
}

// ChangedFilesProp should be a boolean in the bot.changedFiles object
function reinitFile(bot, file, changedFilesProp) {
    if (bot.changedFiles[changedFilesProp]) {
        console.log(`${path.basename(file)} reloaded!`);
        bot.printSpace();

        bot.changedFiles[changedFilesProp] = false;
        // Delete module from cache and require again
        return reloadModule(file);
    } else {
        // Require module from cache
        return require(file);
    }
}