import "reflect-metadata";

import { Intents } from "discord.js";
import * as dotenv from "dotenv";
import { dirname, importx } from "@discordx/importer";
import { Client } from "discordx";
import { SRC_DIR } from "./constants.js";
import { BDBot } from "./types/containers/bot_container.js";
import { initDb, isDevMode } from "./util/index.js";

dotenv.config({ path: `${SRC_DIR}/../.env` });

initDb();

// Enable all intents for now; private server support only atm
const myIntents = new Intents();
// eslint-disable-next-line no-restricted-syntax
for (const flag in Intents.FLAGS) {
	const bitfield = Intents.FLAGS[flag];
	myIntents.add(bitfield);
}
export const client = new Client({
	// botGuilds: [(myClient) => myClient.guilds.cache.map((guild) => guild.id)],
	intents: myIntents,
	partials: ["CHANNEL"],
});

// Bot state
export const bdbot = new BDBot();

client.on("interactionCreate", (interaction) => {
	client.executeInteraction(interaction);
});

export async function startup() {
	await Promise.all([
		importx(`${dirname(import.meta.url)}/events/**/*.{ts,js}`),
		importx(`${dirname(import.meta.url)}/commands/**/*.{js,ts}`)
	]);

	if (isDevMode()) {
		await client.login(process.env.DEV_BOT_TOKEN);
	} else {
		await client.login(process.env.BOT_TOKEN);
	}

	await bdbot.initContainter();
}

startup().catch(console.error);
