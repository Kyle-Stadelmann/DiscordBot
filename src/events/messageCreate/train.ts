import { ArgsOf, Discord, On } from "discordx";

let activeTrain = false;
@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class Train {
	@On({ event: "messageCreate" })
	private async handleTrain([msg]: ArgsOf<"messageCreate">) {
		if (!activeTrain) {
			const msgs = await msg.channel.messages.fetch({ limit: 2 });
			console.log(`msgs:${msgs}`);
			console.log("++++++++++++++++++++++++++++++++++++++++++++++++++");
			console.log("++++++++++++++++++++++++++++++++++++++++++++++++++");
			console.log("++++++++++++++++++++++++++++++++++++++++++++++++++");
			console.log(`msgs[0]:${msgs[0]}`);
			if (msgs[0].content === msgs[1].content && msgs[0].user.id !== msgs[1].user.id) {
				// last 2 messages were the same and written by different people, train time bby
				activeTrain = true;
				await msg.channel.send(msgs[0].content);
			} else if (msgs[0].content !== msgs[1].content) {
				activeTrain = false;
			}
		}
	}
}
