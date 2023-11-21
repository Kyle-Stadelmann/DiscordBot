import { Discord, On } from "discordx";
import { client } from "../../app.js";
import { getRandomElement, printSpace, sleep } from "../../util/index.js";

const STATUS_ROTATION_TIME = 5 * 60 * 1000;

const statuses = [
	"With Khang's Catgirls",
	"Kyle is there a reason why I was demode?",
	"Guten",
	"Valhen",
	"Skowhen",
	"Hanabihen",
	"Toontownhen",
	"Increasing Daniel's WPM...",
	"Watching Kyle blow more money on maple",
	"With your permissions",
];

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class StatusMessage {
	@On({ event: "ready" })
	private async handleStatusRotation() {
		console.log("Bot starting up...");
		printSpace();

		// eslint-disable-next-line no-constant-condition
		while (true) {
			const randomStatus = getRandomElement(statuses);
			client.user.setActivity({ name: randomStatus, type: 4 });
			// eslint-disable-next-line no-await-in-loop
			await sleep(STATUS_ROTATION_TIME);
		}
	}
}
