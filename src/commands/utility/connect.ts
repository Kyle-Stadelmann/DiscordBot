import { joinVoiceChannel } from "@discordjs/voice";
import { Message } from "discord.js";
import { Command, CommandConfig } from "../../types/command";
import { sendErrorMessage, sendMessage } from "../../util";

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
