import { ArgsOf, Discord, On } from "discordx";

let activeTrain = false;
let previousString = "";
let previousUser = "";
@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class Train {
	@On({ event: "messageCreate" })
	private async handleTrain([msg]: ArgsOf<"messageCreate">) {
		if (!activeTrain) {
			// eslint-disable-next-line no-void
			void msg.channel.messages.fetch({ limit: 2 }).then(async (msgs) => {
				for await (const element of msgs) {
					if (previousString === element[1].content && previousUser !== element[1].author.id) {
						// last 2 messages were the same and written by different people, train time bby
						activeTrain = true;
						await msg.channel.send(previousString);
						break;
					} else {
						// buisness as usual...
						previousString = element[1].content;
						previousUser = element[1].author.id;
					}
				}
			});
		} else if (previousString !== msg.content) {
			// wait to end activeTrain
			activeTrain = false;
		} else {
			previousString = msg.content;
		}
	}
}
