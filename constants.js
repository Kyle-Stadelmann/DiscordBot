const {Collection} = require("discord.js");
const path = require("path");

// Cooldowns are measured in ms
let cooldownColl = new Collection();
cooldownColl.set("move", 5 * 60 * 1000);
cooldownColl.set("listroles", 0);
cooldownColl.set("randommove", 10 * 60 * 1000);
cooldownColl.set("sword", 7 * 24 * 60 * 60 * 1000);
cooldownColl.set("scramble", 60 * 60 * 1000);
cooldownColl.set("whip", 60 * 60 * 1000);


module.exports = {
    PREFIX: ">",
    cooldownTimes: cooldownColl,
    DANIEL_ID: "250076166323568640",
    CARTER_ID: "186540977610031104",
    BOT_STUFF_CHANNEL_ID: "217149187207200769",
    KHANG_ID: "123260646576881679",
    ALLEN_ID: "145042861451116545",
    BD4_ID: "191318875667824650",
    BD5_ID: "505214234393706499",
    DEV_SERVER_ID: "723147134605590598",
    BIPEN_IMG_URL: "https://i.imgur.com/cIoLOxW.jpg",
    ZACH_ID: '95734974409351168',
    MIN_SHARPEN_TIME: 30 * 60 * 1000,
    BD4_BOT_ID: '480909013593227277',
    HEAVY_DOLLAR_SIGN: '💲',
    DANIEL_WPM: "48",
    ASIAN_KYLE_ID: "191266619387936770",
    QUESTION_MARK_URL: "https://media.discordapp.net/attachments/201577195901026304/481948179110297631/kyledumbquestion.PNG",
    SUNGLASSES: '😎',
    KHANG_NEKO_EMOJI: 'cat_thonk',
    NUM_CHANNELS_WHIPPED: 10,
    COOLDOWN_JSON_LOC: path.resolve(`${__dirname}/database/cooldowns.json`),
    TYPE_SPEED_RESET_TIME: 30*1000,  // milliseconds
    DEV_SERVER_GROUP_1_ID: "894353801086124082",
    DEV_SERVER_GROUP_2_ID: "894353859068166204",
    DEV_SERVER_GROUP_BOTS_ID: "894354004769923113",
}
