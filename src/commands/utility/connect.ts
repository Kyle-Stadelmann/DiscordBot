import { joinVoiceChannel } from "@discordjs/voice";
import { Message } from "discord.js";
import { CommandConfig, Command } from "../../types/command.js";
import { sendErrorMessage, sendMessage } from "../../util/index.js";

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
			await sendErrorMessage(textChannel, "Caller is not connected to a valid voice channel");
			return false;
		}

		joinVoiceChannel({
			channelId: voiceChannel.id,
			guildId: voiceChannel.guildId,
			selfDeaf: true,

			adapterCreator: msg.guild.voiceAdapterCreator,
		});

		if (voiceChannel.permissionsFor(msg.guild.roles.everyone).has("VIEW_CHANNEL")) {
			await sendMessage(textChannel, `Connected to ${voiceChannel.name}`);
		}

		return true;
	}
}

export default new ConnectCommand(cmdConfig);
