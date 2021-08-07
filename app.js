// import .env file variables (for BOT_TOKEN)
require('dotenv').config({path: `${__dirname}/.env`})

const Discord = require("discord.js");
const fs = require('fs');

const bot = new Discord.Client();
bot.commands = new Discord.Collection();
bot.cooldowns = new Discord.Collection();
bot.events = new Discord.Collection();
bot.schedules = new Discord.Collection();

// Bind all util functions to bot.util
bot.util = require(`${__dirname}/util`);
// Bind all constants to bot.constants
bot.constants = require(`${__dirname}/constants.js`);
// Load in the cooldowns from disk into bot.cooldowns
bot.util.readDiskCooldowns(bot);
// Load all event percentages
bot.event_percentages = require(`${__dirname}/events/event_percentages.js`);


bot.printSpace = () => {
    console.log();
    console.log("--------------------------------------------------------------");
    console.log();
}

// Load all commands into our bot.commands collection
fs.readdir(`${__dirname}/commands/`, (err, files) => {
    bot.printSpace();
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
        if (!props.disabled) {
            console.log(`${i++}: ${f} loaded!`);
            bot.commands.set(props.help.commandName, props);
        }
    });
});


// Bind all tracked events to our event objects
fs.readdir(`${__dirname}/events/handlers/`, (err, files) => {
    bot.printSpace();
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
        bot.on(eventName, event.bind(null, bot));

        console.log(`${i + 1}: ${f} loaded!`);
        delete require.cache[require.resolve(`${__dirname}/events/handlers/${f}`)];
    });
    bot.printSpace();
});

// Bind all tracked event helpers to bot.events_lib
// each event type gets its own object of helpers
// ex: bot.events_lib.eventName.helperName()
bot.events_lib = require(`${__dirname}/events/lib`)(bot);

// Login to the correct bot token
bot.login(process.env.BOT_TOKEN);
