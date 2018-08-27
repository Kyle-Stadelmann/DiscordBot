const Discord = require("discord.js");
const bot = new Discord.Client();
bot.commands = new Discord.Collection();

/* Bot settings - Global settings this file can use */
// Bot prefix
const prefix = ">";

function printSpace() {
  console.log();
  console.log("--------------------------------------------------------------");
  console.log();
}

var constants = require("./constants.js");

require("fs").readdir("./Commands/", (err, files) => {
 	if(err) console.error(err);

  	let jsfiles = files.filter(f => f.split(".").pop() === "js");
  	if(jsfiles.length <= 0) {
    	console.log("No commands to load!");
    	return;
  	}

  	console.log(`Loading ${jsfiles.length} commands!`);

  	jsfiles.forEach((f, i) => {
    	let props = require(`./Commands/${f}`);
		console.log(`${i + 1}: ${f} loaded!`)
		bot.commands.set(props.help.CommandName, props);
 	});
})

// Listener event: runs whenever the bot sends a ready event (when it first starts for example)
bot.on("ready", () => {
	console.log("Bot starting up...");
    printSpace();

	bot.user.setActivity("With Khang's Catgirls");
});

// Listener event: runs whenever a message is received
bot.on('message', async (message) => {

	// Return if non-command
	if (message.content.indexOf(prefix) !== 0) return;
	if (message.author.bot) return;
    if (message.channel.type === "dm") return;

	// Messsage is a command

	let messageArray = message.content.toLowerCase().split(" ");
	// Cmd String
	let cmdStr = messageArray[0].slice(prefix.length);
	// Args String array
	let args = messageArray.slice(1);


	// Grab actual command from collection
	let cmd = bot.commands.get(cmdStr);

    // Command handling
    if (cmd) {
		cmd.run(bot, message, args);
		printSpace();
	}
});

// Login to the correct bot token
bot.login(process.env.BOT_TOKEN);

/// TEST HIGH JUSTIN
