import { ArgsOf, Discord, On } from "discordx";

let activeTrain = false;
@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class Train {
	@On({ event: "messageCreate" })
	private async handleTrain([msg]: ArgsOf<"messageCreate">) {
		const msgs = await msg.channel.messages.fetch({ limit: 2 });
		if (
			!activeTrain &&
			msgs.at(0).content === msgs.at(1).content &&
			msgs.at(0).author.id !== msgs.at(1).author.id
		) {
			activeTrain = true;
			await msg.channel.send(msgs.at(0).content);
		} else if (msgs.at(0).content !== msgs.at(1).content) {
			activeTrain = false;
		}
	}
}
