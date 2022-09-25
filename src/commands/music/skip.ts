import { Message } from "discord.js";
import { bdbot } from "../../app.js";
import { Command, CommandConfig } from "../../types/command.js";
import { sendMessage } from "../../util/message-channel.js";

const cmdConfig: CommandConfig = {
	name: "skip",
	description: "Skips current track",
	usage: "skip",
};

class SkipCommand extends Command {
	public async run(msg: Message): Promise<boolean> {
		const queue = bdbot.player.getQueue(msg.guildId);
		await sendMessage(msg.channel, `Skipping...`);
		return queue.skip();
	}
}

export default new SkipCommand(cmdConfig);
