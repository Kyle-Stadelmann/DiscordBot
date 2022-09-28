import { getVoiceConnection, joinVoiceChannel } from "@discordjs/voice";
import { Message, PermissionFlagsBits } from "discord.js";
import { WHITE_CHECK_MARK, X_MARK } from "../../constants.js";
import { CommandConfig, Command, CommandCategory } from "../../types/command.js";

const cmdConfig: CommandConfig = {
	name: "connect",
	description: "BD4 Bot connects to the user's voice channel.",
	category: CommandCategory.Utility,
	usage: "connect",
};

// TODO: make it so that this doesn't break music functions
class ConnectCommand extends Command {
	public async run(msg: Message): Promise<boolean> {
		if (getVoiceConnection(msg.guildId)) {
			console.log("Bot already connected");
			return false;
		}

		// User's voice channel
		const voiceChannel = msg.member.voice.channel;

		if (!voiceChannel || voiceChannel === msg.guild.afkChannel) {
			console.log(`${msg.author.username} is not connected to a valid voice channel`);
			await msg.react(X_MARK);
			return false;
		}

		joinVoiceChannel({
			channelId: voiceChannel.id,
			guildId: voiceChannel.guildId,
			selfDeaf: true,

			adapterCreator: msg.guild.voiceAdapterCreator,
		});
		console.log(`Connected to ${voiceChannel.name}`);

		if (voiceChannel.permissionsFor(msg.guild.roles.everyone).has(PermissionFlagsBits.ViewChannel)) {
			await msg.react(WHITE_CHECK_MARK);
		}

		return true;
	}
}

export default new ConnectCommand(cmdConfig);
