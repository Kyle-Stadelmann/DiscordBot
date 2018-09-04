const Discord = require("discord.js");
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
bot.events = new Discord.Collection();


bot.printSpace = () => {
  console.log();
  console.log("--------------------------------------------------------------");
  console.log();
}

var constants = require("./constants.js");

// Load all commands into our bot.commands collection
require("fs").readdir("./Commands/", (err, files) => {
	bot.printSpace();
 	if(err) return console.error(err);

  	let jsfiles = files.filter(f => f.split(".").pop() === "js");
  	if(jsfiles.length <= 0) {
    	console.log("No commands to load!");
    	return;
  	}

  	console.log(`Loading ${jsfiles.length} commands!`);

  	jsfiles.forEach((f, i) => {
		// Load command file
    	let props = require(`./Commands/${f}`);
		console.log(`${i + 1}: ${f} loaded!`)
		bot.commands.set(props.help.CommandName, props);
 	});
});


// Bind all tracked events to our event objects
require("fs").readdir("./Events/", (err, files) => {
	bot.printSpace();
 	if(err) return console.error(err);

  	let jsfiles = files.filter(f => f.split(".").pop() === "js");
  	if(jsfiles.length <= 0) {
    	console.log("No events to load!");
    	return;
  	}

  	console.log(`Loading ${jsfiles.length} random events!`);

  	jsfiles.forEach((f, i) => {
		// Load event file
    	let event = require(`./Events/${f}`);
		// Get event name from the file name
		let eventName = f.split(".")[0];

		// Does the actual event binding and includes the event params with it
		bot.on(eventName, event.bind(null, bot));

		console.log(`${i + 1}: ${f} loaded!`)
		delete require.cache[require.resolve(`./events/${f}`)];
 	});
	bot.printSpace();
});

// Login to the correct bot token
bot.login(process.env.BOT_TOKEN);
