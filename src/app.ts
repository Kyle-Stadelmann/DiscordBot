import {Client} from 'discord.js';
import { Intents, Collection } from 'discord.js';
import {readDiskCooldowns, watchBotFiles} from './util';
const fs = require('fs');

// import .env file variables (for BOT_TOKEN)
require('dotenv').config({path: `${__dirname}/.env`})

// Enable all intents for now even though it's bad practice oops
let myIntents: Intents[] = [];
// TODO: TS migration
for (let intent in Intents.FLAGS) myIntents.push(intent as any);
const bot = new Client({
    // TODO: TS migration
    intents: myIntents
});

// TODO: TS migration
const banana: any = {};
banana.commands = new Collection();
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

banana.printSpace = () => {
    console.log();
    console.log("--------------------------------------------------------------");
    console.log();
}

// Load all commands into our banana.commands collection
fs.readdir(`${__dirname}/commands/`, (err, files) => {
    banana.printSpace();
    if (err) return console.error(err);

    let jsfiles = files.filter(f => f.split(".").pop() === "js");
    if (jsfiles.length === 0) {
        console.log("No commands to load!");
        return;
    }

    console.log(`Loading commands...`);

    let i = 1;
    jsfiles.forEach((f) => {
        // Load command file
        let props = require(`${__dirname}/commands/${f}`);

        // only load command if its not disabled
        // But if DEV mode is activated, load disabled commands
        if (!props.disabled || banana.settings.botMode === banana.settings.botModeEnum.DEV) {
            console.log(`${i++}: ${f} loaded!`);
            banana.commands.set(props.help.commandName, props);
        }
    });
});


// Bind all tracked events to our event objects
fs.readdir(`${__dirname}/events/handlers/`, (err, files) => {
    banana.printSpace();
    if (err) return console.error(err);

    let jsfiles = files.filter(f => f.split(".").pop() === "js");
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
        banana.on(eventName, event.bind(null, bot));

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
