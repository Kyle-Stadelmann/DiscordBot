import { getVoiceConnection } from "@discordjs/voice";
import { Message } from "discord.js";
import { WHITE_CHECK_MARK, X } from "../../constants.js";
import { Command, CommandConfig } from "../../types/command.js";

const cmdConfig: CommandConfig = {
	name: "disconnect",
	description: "BD4 Bot disconnects from its current voice channel.",
	usage: `disconnect`,
};

class DisconnectCommand extends Command {
	public async run(msg: Message): Promise<boolean> {
		const connection = getVoiceConnection(msg.guildId);

		if (!connection) {
			console.log(`Bot is not in a voice channel`);
			await msg.react(X);
			return false;
		}

		connection.destroy();

		// get current channel
		const vc = msg.guild.channels.cache.get(connection.joinConfig.channelId)
		
		if (vc.permissionsFor(msg.guild.roles.everyone).has("VIEW_CHANNEL")) {
			await msg.react(WHITE_CHECK_MARK);
		}

		return true;
	}
}

export default new DisconnectCommand(cmdConfig);
