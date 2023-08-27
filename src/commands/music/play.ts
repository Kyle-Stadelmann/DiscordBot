import { Message } from "discord.js";
import { PlayerNodeInitializationResult } from "discord-player";
import { bdbot } from "../../app.js";
import { X_MARK } from "../../constants.js";
import { CommandConfig, Command, CommandCategory } from "../../types/command.js";
import { sendMessage } from "../../util/message-channel.js";
import { queueSong } from "../../util/music-helpers.js";

const cmdConfig: CommandConfig = {
	name: "play",
	description: "Add a track to the queue or resume the current track",
	category: CommandCategory.Music,
	usage: "play",
	examples: ["play", "play L's theme", "play https://www.youtube.com/watch?v=VKIEzhzV28s"],
	allowInDM: false,
};

// TODO: this breaks if connect was used prior
class PlayCommand extends Command {
	public async run(msg: Message, args: string[]): Promise<boolean> {
		const queue = bdbot.player.queues.resolve(msg.guildId);
		// User's voice channel
		const voiceChannel = msg.member.voice.channel;

		if (!voiceChannel || voiceChannel === msg.guild.afkChannel) {
			console.log(`${msg.author.username} is not connected to a valid voice channel`);
			await msg.react(X_MARK);
			return false;
		}

		// argless play (functionally unpause)
		if (args.length === 0) { 
			queue.node.setPaused(false);
			return true;
		}

		const query = args.join(" ");

		let result: PlayerNodeInitializationResult;
		try {
			result = await queueSong(voiceChannel, query, msg.channel, msg.author);
		} catch (e) {
			await msg.react(X_MARK);
			console.error(e);
			return false;
		}

		const { tracks } = result.searchResult;
		
		if (result.track.playlist) {
			await sendMessage(msg.channel, `Added playlist ${result.searchResult.playlist?.title} to the queue`);
		} else {
			await sendMessage(msg.channel, `${tracks[0].title} by ${tracks[0].author} has been added to the queue`);
		}
		return true;
	}
}

export default new PlayCommand(cmdConfig);
