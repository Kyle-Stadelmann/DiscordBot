import { Discord, On } from "discordx";
import { client } from "../../app.js";
import { printSpace } from "../../util/print_space.js";
import { getRandomElement } from "../../util/random.js";
import { sleep } from "../../util/sleep.js";

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
	@On("ready")
	private async handleStatusRotation() {
		console.log("Bot starting up...");
		printSpace();

		while (true) {
			const randomStatus = getRandomElement(statuses);
			client.user.setActivity({ name: randomStatus });
			// eslint-disable-next-line no-await-in-loop
			await sleep(STATUS_ROTATION_TIME);
		}
	}
}
