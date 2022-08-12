import { Message } from "discord.js";
import { bdbot } from "../../app.js";
import { PLAYER_SITES, X_MARK } from "../../constants.js";
import { CommandConfig, Command } from "../../types/command.js";
import { sendMessage } from "../../util/message_channel.js";

const cmdConfig: CommandConfig = {
	name: "play",
	description: "BD4 Bot plays a song",
	usage: "play",
};

// TODO: this breaks if connect was used prior
class PlayCommand extends Command {
	public async run(msg: Message, args: string[]): Promise<boolean> {
		if (msg.channel.type === "DM") return false;

		// User's voice channel
		const voiceChannel = msg.member.voice.channel;

		if (!voiceChannel || voiceChannel === msg.guild.afkChannel) {
			console.log(`${msg.author.username} is not connected to a valid voice channel`);
			await msg.react(X_MARK);
			return false;
		}

		// Create/check for Queue
		// https://discord-player.js.org/docs/main/master/general/welcome
		const queue = bdbot.player.createQueue(msg.channel.guild, {
			metadata: { channel: msg.channel },
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
		if (args.length === 0) {
			queue.setPaused(false);
			return true;
		}

		// Find track with args
		// if link, else search phrase containing all args
		let search = "";
		let se = 0;
		if (args[0].slice(0, 8) === "https://" && PLAYER_SITES.some((site) => args[0].includes(site))) {
			search = args[0];
			// may be a cleaner way to do this, brain no worky
			if (args[0].includes("playlist")) {
				if (args[0].includes("youtube")) {
					// YOUTUBE_PLAYLIST = 2
					se = 2;
				} else if (args[0].includes("spotify")) {
					// SPOTIFY_PLAYLIST = 8
					se = 8;
				}
			}
		} else {
			search = args.join(" ");
		}

		// get track or playlist
		const playlist = se === 2 || se === 8;
		const result = await bdbot.player.search(search, {
			requestedBy: msg.member,
			searchEngine: se,
		});
		const track = result.tracks[0];

		// if currently playing, else not playing
		if (!playlist) {
			if (queue.nowPlaying()) {
				queue.addTrack(track);
			} else {
				await queue.play(track);
			}
		} else {
			// TODO: there may be a way to make this a lot neater
			if (queue.previousTracks.length === 0) {
				await queue.play(track);
				queue.addTracks(result.tracks.slice(1, result.tracks.length));
			} else {
				queue.addTracks(result.tracks);
			}

			await sendMessage(msg.channel, `Added playlist ${result.playlist.title} to the queue`);
		}

		if (!playlist) {
			await sendMessage(msg.channel, `${track.title} by ${track.author} has been added to the queue`);
		}
		return true;
	}
}

export default new PlayCommand(cmdConfig);
