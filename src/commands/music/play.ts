import { Message } from "discord.js";
import { bdbot } from "../../app.js";
import { X_MARK } from "../../constants.js";
import { CommandConfig, Command, CommandCategory } from "../../types/command.js";
import { sendMessage } from "../../util/message-channel.js";
import { getSearchResult, unpause } from "../../util/music-helpers.js";

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
		// User's voice channel
		const voiceChannel = msg.member.voice.channel;

		if (!voiceChannel || voiceChannel === msg.guild.afkChannel) {
			console.log(`${msg.author.username} is not connected to a valid voice channel`);
			await msg.react(X_MARK);
			return false;
		}

		// Create/check for Queue
		// https://discord-player.js.org/docs/main/master/general/welcome
		const queue = bdbot.player.createQueue(msg.guild, {
			metadata: { channel: msg.channel },
			bufferingTimeout: 0.1,
			ytdlOptions: {
				filter: "audioonly",
				// eslint-disable-next-line no-bitwise
				highWaterMark: 1 << 30,
				dlChunkSize: 0,
			},
		});

		// Join/verify voice connection
		try {
			if (!queue.connection) {
				await queue.connect(voiceChannel);
				console.log(`Connected to ${voiceChannel.name}`);
			}
		} catch {
			queue.destroy();
			console.log("the queue connection broke for some reason");
			return false;
		}

		// argless play (functionally unpause)
		if (args.length === 0) return unpause(queue);

		const result = await getSearchResult(args, msg.author);
		const { tracks } = result;

		// Add track(s) to queue
		if (tracks.length === 1) {
			if (queue.nowPlaying()) queue.addTrack(tracks[0]);
			else await queue.play(tracks[0]);

			await sendMessage(msg.channel, `${tracks[0].title} by ${tracks[0].author} has been added to the queue`);
		} else {
			if (!queue.nowPlaying()) {
				await queue.play(tracks[0]);
				queue.addTracks(tracks.slice(1, tracks.length));
			} else queue.addTracks(tracks);

			await sendMessage(msg.channel, `Added playlist ${result?.playlist?.title} to the queue`);
		}

		return true;
	}
}

export default new PlayCommand(cmdConfig);
