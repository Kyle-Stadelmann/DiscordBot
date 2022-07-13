import { getVoiceConnection } from "@discordjs/voice";
import { Message } from "discord.js";
import { Command } from "../../interfaces/command";
import { CommandConfig } from "../../types/types";

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
			await this.sendErrorMessage(
				textChannel, "I am not currently connected to a voice channel!"
			);
			return false;
		}

		connection.destroy();

		await this.sendMessage(textChannel, "Successfully disconnected!");

		return true;
	}
}

export default new DisconnectCommand(cmdConfig);