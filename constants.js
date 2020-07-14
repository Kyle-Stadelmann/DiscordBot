const Discord = require("discord.js");

// Cooldowns are measured in ms
let cooldownColl = new Discord.Collection();
cooldownColl.set("move", 5 * 60 * 1000);
cooldownColl.set("help", 0);
cooldownColl.set("listroles", 0);
cooldownColl.set("ping", 0);
cooldownColl.set("role", 0);
cooldownColl.set("randommove", 5 * 60 * 1000);
cooldownColl.set("sword", 7 * 24 * 60 * 60 * 1000);
cooldownColl.set("scramble", 60 * 60 * 1000);


module.exports = {
    PREFIX: ">",
    cooldownTimes: cooldownColl,
    DANIEL_ID: "250076166323568640",
    CARTER_ID: "186540977610031104",
    BOT_STUFF_CHANNEL_ID: "217149187207200769",
    KHANG_ID: "123260646576881679",
    ALLEN_ID: "145042861451116545",
    BD4_ID: "191318875667824650",
    BIPEN_IMG_URL: "https://i.imgur.com/cIoLOxW.jpg",
    ZACH_ID: '95734974409351168',
    MIN_SHARPEN_TIME: 30 * 60 * 1000,
    BD4_BOT_ID: '480909013593227277',
    HEAVY_DOLLAR_SIGN: '💲',
    DANIEL_WPM: "48",
    ASIAN_KYLE_ID: "191266619387936770",
    QUESTION_MARK_URL: "https://media.discordapp.net/attachments/201577195901026304/481948179110297631/kyledumbquestion.PNG",
}
