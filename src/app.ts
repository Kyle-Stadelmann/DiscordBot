import "reflect-metadata";
import { dirname, importx } from "@discordx/importer";
import { Client } from "discordx";
import { GatewayIntentBits, Partials } from "discord.js";
import { BDBot } from "./types/containers/bot-container.js";
import { ExceptionCatcher, initDb, isDevMode, isProdMode } from "./util/index.js";
import { REPEAT_CS_REMINDER_CHECK_TIME_MS, tryRemindCSPlayers } from "./scripts/cs-predict-reminder.js";

const myIntents = [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMembers,
	GatewayIntentBits.GuildEmojisAndStickers,
	GatewayIntentBits.GuildIntegrations,
	GatewayIntentBits.GuildVoiceStates,
	GatewayIntentBits.GuildPresences,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.GuildMessageReactions,
	GatewayIntentBits.GuildMessageTyping,
	GatewayIntentBits.DirectMessages,
	GatewayIntentBits.DirectMessageReactions,
	GatewayIntentBits.DirectMessageTyping,
	GatewayIntentBits.MessageContent,
];

export const client = new Client({
	intents: myIntents,
	partials: [Partials.Message, Partials.Channel], // Needed to get messages from DM's as well
	guards: [ExceptionCatcher],
});

// Bot state
export const bdbot = new BDBot();

async function startup() {
	initDb();

	client.once("ready", async () => {
		await client.initApplicationCommands();
		await bdbot.initContainter();
	});

	const fileType = isProdMode() ? "js" : "ts";

	await Promise.all([
		importx(`${dirname(import.meta.url)}/events/**/*.${fileType}`),
		importx(`${dirname(import.meta.url)}/commands/**/*.${fileType}`),
		importx(`${dirname(import.meta.url)}/context-menus/**/*.${fileType}`),
	]);

	if (isDevMode()) {
		await client.login(process.env.DEV_BOT_TOKEN);
	} else {
		await client.login(process.env.BOT_TOKEN);
	}
}

startup().catch(console.error);

// eslint-disable-next-line @typescript-eslint/return-await
if (isProdMode()) setInterval(async () => await tryRemindCSPlayers(), REPEAT_CS_REMINDER_CHECK_TIME_MS);
