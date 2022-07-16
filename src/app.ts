/* eslint-disable no-restricted-syntax */
import { Client, Collection, Intents } from "discord.js";
import fs from "fs";
import { CommandContainer } from "./commands";

// Import .env file variables (for BOT_TOKEN)
require("dotenv").config({ path: `${__dirname}/.env` });

// Enable all intents for now; private server support only atm
let myIntents: Intents;
for (const intent in Intents.FLAGS) { myIntents.add(+intent); }
const bot = new Client({
	intents: myIntents
});

// TODO: TS migration
const banana: any = {};

banana.commands = new CommandContainer().loadCommandMap();
banana.cooldowns = new Collection();
banana.events = new Collection();
banana.schedules = new Collection();
banana.typingTimestamps = new Collection().set("250076166323568640", null);

// Load in the cooldowns from disk into banana.cooldowns
readDiskCooldowns(bot);
// Load all event percentages
banana.event_percentages = require(`${__dirname}/events/event_percentages.js`);
// Load bot settings
banana.settings = require(`${__dirname}/settings.js`);


// Bind all tracked events to our event objects
fs.readdir(`${__dirname}/events/handlers/`, (err, files) => {
	banana.printSpace();
	if (err) return console.error(err);

	let jsfiles = files.filter((f) => f.split(".").pop() === "js");
	if (jsfiles.length === 0) {
		console.log("No events to load!");
		return;
	}

	console.log(`Loading ${jsfiles.length} event handlers...`);

	jsfiles.forEach((f, i) => {
		// Load event file
		let event = require(`${__dirname}/events/handlers/${f}`);
		// Get event name from the file name
		let eventName = f.split(".")[0];

		// Does the actual event binding and includes the event params with it
		bot.on(eventName, event.bind(null, bot));

		console.log(`${i + 1}: ${f} loaded!`);
		delete require.cache[require.resolve(`${__dirname}/events/handlers/${f}`)];
	});
	banana.printSpace();
});

// Bind all tracked event helpers to banana.events_lib
// each event type gets its own object of helpers
// ex: banana.events_lib.eventName.helperName()
banana.events_lib = require(`${__dirname}/events/lib`)(bot);

// If in bot mode, watch files that change in order to reload them without restarting bot
if (banana.settings.botMode === banana.settings.botModeEnum.DEV) {
	watchBotFiles(bot);
}

// Login to the correct bot token
if (banana.settings.botMode === banana.settings.botModeEnum.DEV) {
	bot.login(process.env.DEV_BOT_TOKEN);
} else {
	bot.login(process.env.BOT_TOKEN);
}
