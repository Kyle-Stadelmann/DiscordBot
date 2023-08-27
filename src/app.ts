import "reflect-metadata";
import * as dotenv from "dotenv";
import { dirname, importx } from "@discordx/importer";
import { Client } from "discordx";
import { GatewayIntentBits, Partials } from "discord.js";
import { SRC_DIR } from "./constants.js";
import { BDBot } from "./types/containers/bot-container.js";
import { initDb, isDevMode, isProdMode } from "./util/index.js";

dotenv.config({ path: `${SRC_DIR}/../.env` });

initDb();

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
});

// Bot state
export const bdbot = new BDBot();

client.on("interactionCreate", (interaction) => {
	client.executeInteraction(interaction);
});

export async function startup() {
	const fileType = isProdMode() ? "js" : "ts";

	await Promise.all([
		importx(`${dirname(import.meta.url)}/events/**/*.${fileType}`),
		importx(`${dirname(import.meta.url)}/commands/**/*.${fileType}`),
	]);

	if (isDevMode()) {
		await client.login(process.env.DEV_BOT_TOKEN);
	} else {
		await client.login(process.env.BOT_TOKEN);
	}

	await bdbot.initContainter();
}

startup().catch(console.error);
