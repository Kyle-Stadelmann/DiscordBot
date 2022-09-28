import { Message } from "discord.js";
import { bdbot } from "../../app.js";
import { Command, CommandCategory, CommandConfig } from "../../types/command.js";
import { sendMessage } from "../../util/message-channel.js";

const cmdConfig: CommandConfig = {
	name: "back",
	description: "Plays the previous track",
	category: CommandCategory.Music,
	usage: "back",
};

class BackCommand extends Command {
	public async run(msg: Message): Promise<boolean> {
		const queue = bdbot.player.getQueue(msg.guildId);
		try {
			await queue.back();
		} catch (error) {
			await sendMessage(msg.channel, "Could not find previous track");
			return false;
		}

		return true;
	}
}

export default new BackCommand(cmdConfig);
