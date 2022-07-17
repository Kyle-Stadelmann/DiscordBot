import { getVoiceConnection } from "@discordjs/voice";
import { Message } from "discord.js";
import { Command, CommandConfig } from "../../types/command";
import { sendErrorMessage, sendMessage } from "../../util";

const cmdConfig: CommandConfig = {
	name: "disconnect",
	description: "BD4 Bot disconnects from its current voice channel.",
	usage: `disconnect`,
};

class DisconnectCommand extends Command {
	public async run(msg: Message): Promise<boolean> {
		const connection = getVoiceConnection(msg.guildId);
		const textChannel = msg.channel;

		if (!connection) {
			await sendErrorMessage(textChannel, "I am not currently connected to a voice channel!");
			return false;
		}

		connection.destroy();

		await sendMessage(textChannel, "Successfully disconnected!");

		return true;
	}
}

export default new DisconnectCommand(cmdConfig);
