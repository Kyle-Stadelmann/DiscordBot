const Discord = require("discord.js");

// Cooldowns are measured in ms
let cooldownColl = new Discord.Collection();
cooldownColl.set("move", 5*60*1000);
cooldownColl.set("help", 0);
cooldownColl.set("listroles", 0);
cooldownColl.set("ping", 0);
cooldownColl.set("role", 0);
cooldownColl.set("randommove", 5*60*1000);


module.exports = {
	PREFIX: ">",
	cooldownTimes: cooldownColl,
	DANIEL_ID: "250076166323568640",
	CARTER_ID: "186540977610031104",
	AFK_CHANNEL_ID: "201880000478183425",
	BOT_STUFF_CHANNEL_ID: "217149187207200769",
	KHANG_ID: "123260646576881679",
	ALLEN_ID: "145042861451116545",
	BD4_ID: "191318875667824650"
}
