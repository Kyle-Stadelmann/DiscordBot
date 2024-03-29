import { getVoiceConnection } from "@discordjs/voice";
import { Message } from "discord.js";
import { bdbot } from "../../app.js";
import { X_MARK } from "../../constants.js";
import { Command, CommandCategory, CommandConfig } from "../../types/command.js";

const cmdConfig: CommandConfig = {
	name: "disconnect",
	description: "BD4 Bot disconnects from its current voice channel.",
	category: CommandCategory.Utility,
	usage: `disconnect`,
};

class DisconnectCommand extends Command {
	public async run(msg: Message): Promise<boolean> {
		const connection = getVoiceConnection(msg.guildId);
		const musicQueue = bdbot.player.queues.resolve(msg.guildId);

		if (!connection && !musicQueue) {
			console.log(`Bot is not in a voice channel`);
			await msg.react(X_MARK);
			return false;
		}

		if (connection) connection.destroy();
		if (musicQueue) musicQueue.delete();

		return true;
	}
}

export default new DisconnectCommand(cmdConfig);
