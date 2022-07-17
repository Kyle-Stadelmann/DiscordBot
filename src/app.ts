import { Client, Intents } from "discord.js";
import { BDBot } from "./types/containers/bot_container";
import { isDevMode } from "./util";

// Import .env file variables (for BOT_TOKEN)
require("dotenv").config({ path: `${__dirname}/.env` });

// Enable all intents for now; private server support only atm
let myIntents: Intents;
// eslint-disable-next-line no-restricted-syntax
for (const intent in Intents.FLAGS) {
	myIntents.add(+intent);
}
export const client = new Client({
	intents: myIntents,
});

// Bot state
export const bdbot = new BDBot();

if (isDevMode()) {
	// eslint-disable-next-line @typescript-eslint/no-floating-promises
	client.login(process.env.DEV_BOT_TOKEN);
} else {
	// eslint-disable-next-line @typescript-eslint/no-floating-promises
	client.login(process.env.BOT_TOKEN);
}
