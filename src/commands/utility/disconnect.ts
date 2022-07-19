import { getVoiceConnection } from "@discordjs/voice";
import { Message } from "discord.js";
import { Command, CommandConfig } from "../../types/command.js";
import { sendErrorMessage, sendMessage } from "../../util/index.js";

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
			await sendErrorMessage(textChannel, "Not currently connected");
			return false;
		}

		connection.destroy();

		// get current channel
		const vc = msg.guild.channels.cache.get(connection.joinConfig.channelId)
		
		if (vc.permissionsFor(msg.guild.roles.everyone).has("VIEW_CHANNEL")) {
			await sendMessage(textChannel, "Disconnect successful");
		}

		return true;
	}
}

export default new DisconnectCommand(cmdConfig);
