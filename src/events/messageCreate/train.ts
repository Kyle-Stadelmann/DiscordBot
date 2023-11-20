import { ArgsOf, Discord, On } from "discordx";

const activeTrains = new Set<String>();
@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class Train {
	@On({ event: "messageCreate" })
	private async handleTrain([msg]: ArgsOf<"messageCreate">) {
		const msgs = await msg.channel.messages.fetch({ limit: 2 });
		if (
			!activeTrains.has(msg.channelId) &&
			msgs.at(0).content === msgs.at(1).content &&
			msgs.at(0).author.id !== msgs.at(1).author.id
		) {
			activeTrains.add(msg.channelId);
			await msg.channel.send(msgs.at(0).content);
		} else if (msgs.at(0).content !== msgs.at(1).content) {
			activeTrains.delete(msg.channelId);
		}
	}
}
