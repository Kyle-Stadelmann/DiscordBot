import { joinVoiceChannel } from "@discordjs/voice";
import { Message } from "discord.js";
import { CommandConfig, Command } from "../../types/command.js";
import { sendErrorMessage, sendMessage } from "../../util/message_channel.js";

const cmdConfig: CommandConfig = {
	name: "connect",
	description: "BD4 Bot connects to the user's voice channel.",
	usage: "connect",
};

class ConnectCommand extends Command {
	public async run(msg: Message): Promise<boolean> {
		// User's voice channel
		const voiceChannel = msg.member.voice.channel;
		const textChannel = msg.channel;

		if (!voiceChannel || voiceChannel === msg.guild.afkChannel) {
			await sendErrorMessage(textChannel, "You are not connected to a valid voice channel!");
			return false;
		}

		await sendMessage(textChannel, `Connecting to ${voiceChannel.name}`);

		joinVoiceChannel({
			channelId: voiceChannel.id,
			guildId: voiceChannel.guildId,
			adapterCreator: null,
		});

		return true;
	}
}

export default new ConnectCommand(cmdConfig);
