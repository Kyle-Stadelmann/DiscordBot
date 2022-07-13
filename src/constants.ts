const { Collection } = require("discord.js");
const path = require("path");

// Cooldowns are measured in ms
const cooldownColl = new Collection();
cooldownColl.set("move", 5 * 60 * 1000);
cooldownColl.set("listroles", 0);
cooldownColl.set("randommove", 10 * 60 * 1000);
cooldownColl.set("sword", 7 * 24 * 60 * 60 * 1000);
cooldownColl.set("scramble", 60 * 60 * 1000);
cooldownColl.set("whip", 60 * 60 * 1000);

export const AFK_CHANNEL_ID = "temp";
export const PREFIX = ">";
export const cooldownTimes = cooldownColl;
export const DANIEL_ID = "250076166323568640";
export const CARTER_ID = "186540977610031104";
export const BOT_STUFF_CHANNEL_ID = "217149187207200769";
export const KHANG_ID = "123260646576881679";
export const ALLEN_ID = "145042861451116545";
export const BD4_ID = "191318875667824650";
export const BIPEN_IMG_URL = "https =//i.imgur.com/cIoLOxW.jpg";
export const ZACH_ID = "95734974409351168";
export const BD4_BOT_ID = "480909013593227277";
export const HEAVY_DOLLAR_SIGN = "💲";
export const DANIEL_WPM = "48";
export const ASIAN_KYLE_ID = "191266619387936770";
export const QUESTION_MARK_URL =
	"https =//media.discordapp.net/attachments/201577195901026304/481948179110297631/kyledumbquestion.PNG";
export const SUNGLASSES = "😎";
export const KHANG_NEKO_EMOJI = "cat_thonk";
// TODO: Standardize paths
export const COOLDOWN_JSON_LOC = path.resolve(`${__dirname}/../database/cooldowns.json`);
export const TYPE_SPEED_RESET_TIME = 30 * 1000;
