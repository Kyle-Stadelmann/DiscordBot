import { MessageEmbed } from 'discord.js';
import Constants from '../../constants';

// Listener event: runs whenever a message is received
module.exports = async (bot, message) => {
    // if message comes from a bot, don't perform any of the below events
    // (to stop bd4 bot from triggering other bots events)
    if (message.author.bot) {
        return;
    }

    if (bot.settings.botMode === bot.settings.botModeEnum.DEV) {
        bot.util.reInitBot(bot);
    }

    // Command processing, check if message is a commandd
    if (message.content.indexOf(Constants.PREFIX) == 0) {
        await processCmd(bot, message);
    }

    // Run all the event libs (epic, khang_neko, zach_zacc, etc.)
    bot.util.runEventLibs(bot, "message", [message]);
};

async function processCmd(bot, message) {
    //if (message.channel.type === "dm") return;

    let cmdArgs = parseArgs(message.content.toLowerCase());
    let cmdStr = cmdArgs[0].slice(Constants.PREFIX.length);

    // Args String array, get rid of command string
    let args = cmdArgs.slice(1);

    // Grab actual command from collection
    let cmd = bot.commands.get(cmdStr);
    // Test if the command actually exists
    if (cmd == null) return;

    // Make sure if we're in a dm to check if this cmd is allowed in a dm
    if (message.channel.type === "dm" && !cmd.dmAllow) return;

    // If help command was triggered
    if (args[0] != null && args[0].toLowerCase() === "help") {
        handleHelpCmd(bot, message, cmd);
        return;
    }

    console.log(`${cmd.help.commandName} command detected by: ${message.author.username}`);

    // Check if cooldown is over
    // If we are in DEV mode ignore this, as there are no cooldowns in DEV mode
    if (bot.util.isOnCooldown(bot, cmdStr, message.member) && bot.settings.botMode !== bot.settings.botModeEnum.DEV) {
        console.log("Command was NOT successful, member is on cooldown.")
        message.channel.send("Command was NOT successful, you are on cooldown for this command.");
        bot.printSpace();
        return;
    }
    
    // Whether we will activate the cooldown after executing it or not
    // (If cmd fails, will be set to false)
    let activateCooldown;
    // Command handling - if we got here, cooldown is over
    if (cmd) {
        if (await cmd.run(bot, message, args)) {
            console.log("Command was successful.");
            // Command succeeded, set cooldown afterwards
            activateCooldown = true;
        } else {
            console.log("Command was NOT successful.");
            // Command failed, don't activate cooldown since cmd wasn't activated
            activateCooldown = false;
        }
        bot.printSpace();
    }

    // Activate cooldown if necessary, don't bother if DEV mode
    if (activateCooldown && bot.settings.botMode !== bot.settings.botModeEnum.DEV) {
        bot.util.activateCooldown(bot, cmdStr, message.member);
    }
}

// From GAwesomeBot's parser
function parseArgs(content, delim = " ") {
	if (delim === "") return [content];

	const args = [];
	let current = "";
	let open = false;

	for (let i = 0; i < content.length; i++) {
		if (!open && content.slice(i, i + delim.length) === delim) {
			if (current !== "") args.push(current);
			current = "";
			i += delim.length - 1;
			continue;
		}
		if (content[i] === '"') {
			open = !open;
			if (current !== "") args.push(current);
			current = "";
			continue;
		}
	    current += content[i];
	}
	if (current !== "") args.push(current);

	return args.length === 1 && args[0] === "" ? [] : args.filter(a => a !== delim && a !== " ");
}

// Handles the help call for a specific command
// called when for ex: '>rally help' is sent
function handleHelpCmd(bot, message, cmd) {
    console.log(`Help for the ${cmd.help.commandName} command detected by: ${message.author.username}`);

    let helpStr = new MessageEmbed()
        .addField("Command", `\`${cmd.help.commandName}\``, true)
        .addField("Description", cmd.help.description)
        .addField("Usage", `\`${Constants.PREFIX}${cmd.help.usage}\``)
        .setColor(0x0)

    let examples = cmd.help.examples;
    if (examples != null && examples.length) {
        let examplesStr = "";
        for (let i = 0; i < examples.length; i++) {
            examplesStr += `\`${Constants.PREFIX}${examples[i]}\``;
            if (i !== examples.length-1) examplesStr += "\n";
        }
        helpStr.addField("Examples", examplesStr);
    }

    message.channel.send({embeds: [helpStr]});
    console.log("Help was successful.");
    bot.printSpace();
}
