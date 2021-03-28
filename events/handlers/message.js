const discord = require('discord.js');
const { writeCooldowns } = require('../../util/cooldown.js');

// Listener event: runs whenever a message is received
module.exports = async (bot, message) => {
    // if message comes from a bot, don't perform any of the below events
    // (to stop bd4 bot from triggering other bots events)
    if (message.author.bot) {
        return;
    }

    // Command processing, check if message is a commandd
    if (message.content.indexOf(bot.constants.PREFIX) == 0) {
        //if (message.channel.type === "dm") return;

        let cmdArgs = parseArgs(message.content.toLowerCase());
        let cmdStr = cmdArgs[0].slice(bot.constants.PREFIX.length);

        // Args String array, get rid of command string
        let args = cmdArgs.slice(1);

        // Grab actual command from collection
        let cmd = bot.commands.get(cmdStr);
        // test if the command actually exists
        if (cmd == null) return;

        // If help command was triggered
        if (args[0] != null && args[0].toLowerCase() === "help") {
            console.log(`Help for the ${cmd.help.commandName} command detected by: ${message.author.username}`);

            let helpStr = new discord.MessageEmbed()
                .addField("Command", `\`${cmd.help.commandName}\``, true)
                .addField("Description", cmd.help.description)
                .addField("Usage", `\`${bot.constants.PREFIX}${cmd.help.usage}\``)
                .setColor(0x0)

            if (cmd.help.example != null) {
                helpStr.addField("Example", `\`${bot.constants.PREFIX}${cmd.help.example}\``);
            }

            message.channel.send(helpStr);
            console.log("Help was successful.");
            bot.printSpace();
            return;
        }

        console.log(`${cmd.help.commandName} command detected by: ${message.author.username}`);


        // Check if cooldown is over
        if (!bot.util.tryEndCooldown(bot, cmdStr, message.member)) {
            console.log("Command was NOT successful, member is on cooldown.")
            message.channel.send("Command was NOT successful, you are on cooldown for this command.");
            bot.printSpace();
            return;
        }

        bot.util.cooldown(bot, cmdStr, message.member);
        // Command handling - if we got here, cooldown is over
        if (cmd) {
            if (await cmd.run(bot, message, args)) {
                console.log("Command was successful.");
            } else {
                console.log("Command was NOT successful.");
                // command failed, reset cooldown by giving it forceCooldownEnd = true
                bot.util.tryEndCooldown(bot, cmdStr, message.member, true);
            }
            bot.printSpace();
        }
    }

    require("../lib/nyaa_embed.js")(bot, message);

    // KhangNeko RandomEvent
    if (message.author.id === bot.constants.KHANG_ID) {
        require("../lib/khang_neko.js")(bot, message);
    }

    // Heavy Dollar Sign RandomEvent
    require("../lib/heavy_dollar_sign.js")(bot, message);

    // DanielWPM RandomEvent & Daniel_TY event! 
    if (message.author.id === bot.constants.DANIEL_ID) {
        require("../lib/daniel_wpm.js")(bot, message);
	    require("../lib/daniel_ty.js")(bot, message);
    }

    // Question Mark Ending RandomEvent
    if (message.content.charAt(message.content.length - 1) === '?') {
        require("../lib/question_mark_ending.js")(bot, message);
    }

    // Zach => Zacc Event
    if (message.content.toLowerCase().includes("zach")) {
        require("../lib/zach_zacc.js")(bot, message);
    }

    //Epic sunglasses event
    require("../lib/epic.js")(bot,message);
};

// Taken from GAwesomeBot's great parser
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