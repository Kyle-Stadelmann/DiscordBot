import { getVoiceConnection } from "@discordjs/voice";
import { Message } from "discord.js";
import { Command } from "../../interfaces/command";
import { CommandConfig } from "../../types/types";

const cmdConfig: CommandConfig = {
	name: "disconnect",
	description: "BD4 Bot disconnects from its current voice channel.",
	usage: `disconnect`,
}

class DisconnectCommand extends Command {
	public async run(msg: Message): Promise<boolean> {
		const connection = getVoiceConnection(msg.guildId);

		if (!connection) {
			msg.channel.send("I am not currently connected to a voice channel!");
			return false;
		}

		connection.destroy();
		msg.channel.send("Successfully disconnected!");

		return true;
	}
}

export default new DisconnectCommand(cmdConfig);