import { Client, Intents } from "discord.js";
import { SRC_DIR } from "./constants.js";
import { BDBot } from "./types/containers/bot_container.js";
import { isDevMode } from "./util/is_dev_mode.js";

// Import .env file variables (for BOT_TOKEN)
require("dotenv").config({ path: `${SRC_DIR}/../.env`});

// Enable all intents for now; private server support only atm
const myIntents = new Intents();
// eslint-disable-next-line no-restricted-syntax
for (const flag in Intents.FLAGS) {
	const bitfield = Intents.FLAGS[flag];
	myIntents.add(bitfield);
}
export const client = new Client({
	intents: myIntents,
});

// Bot state
export const bdbot = new BDBot();

async function startup() {
	if (isDevMode()) {
		// eslint-disable-next-line @typescript-eslint/no-floating-promises
		await client.login(process.env.DEV_BOT_TOKEN);
	} else {
		// eslint-disable-next-line @typescript-eslint/no-floating-promises
		await client.login(process.env.BOT_TOKEN);
	}
	await bdbot.loadCommands();
}

startup().catch(console.error);
