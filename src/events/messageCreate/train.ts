import { ArgsOf, Discord, On } from "discordx";
import { client } from "../../app.js";

const activeTrains = new Set<String>();

const START_TRAIN_COUNT = 4;

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class Train {
	@On({ event: "messageCreate" })
	private async handleTrain([msg]: ArgsOf<"messageCreate">) {
		const msgs = await msg.channel.messages.fetch({ limit: START_TRAIN_COUNT });

		if (msgs.every((e) => e.content === "")) return;
		// Checks if train started/continued off of a bot message
		if (msgs.some((e) => e.author.id === client.user.id)) return;

		const msgContents = new Set(msgs.map((m) => m.content));
		const msgAuthors = new Set(msgs.map((m) => m.author.id));

		if (!activeTrains.has(msg.channelId) && msgContents.size === 1 && msgAuthors.size === START_TRAIN_COUNT) {
			activeTrains.add(msg.channelId);
			await msg.channel.send(msgs.at(0).content);
		} else if (msgContents.size > 1) {
			activeTrains.delete(msg.channelId);
		}
	}
}
