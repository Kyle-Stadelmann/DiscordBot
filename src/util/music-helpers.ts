import { GuildQueue, PlayerSearchResult, QueryType, SearchQueryType, Track } from "discord-player";
import { TextBasedChannel, User, VoiceBasedChannel } from "discord.js";
import { bdbot } from "../app.js";
import { PLAYER_SITES } from "../constants.js";

export function findTrack(search: string, queue: GuildQueue): Track | undefined {
	return queue.tracks.find((track) => track.title.toLowerCase().includes(search));
}

export function isQueueValid(queue: GuildQueue<unknown> | undefined): boolean {
	return !!queue && !queue.deleted && !!queue.connection;
}

export function queueSong(
	voiceChannel: VoiceBasedChannel,
	query: string,
	textOutputChannel: TextBasedChannel,
	requester: User
) {
	return bdbot.player.play(voiceChannel, query, {
		nodeOptions: { metadata: { channel: textOutputChannel } },
		requestedBy: requester,
	});
}

// Returns Track[] containing search result (for both single song and playlist)
export async function getSearchResult(args: string[], user: User): Promise<PlayerSearchResult> {
	// Find track with args
	// if link, else search phrase containing all args
	let search = "";
	let searchEngine: SearchQueryType | undefined;

	// TODO: maybe change to regex
	if (args[0].startsWith("https://") && PLAYER_SITES.some((site) => args[0].includes(site))) {
		search = args[0];
		if (args[0].includes("playlist")) {
			if (args[0].includes("youtube")) searchEngine = QueryType.YOUTUBE_PLAYLIST;
			else if (args[0].includes("spotify")) searchEngine = QueryType.SPOTIFY_PLAYLIST;
		}
	} else {
		search = args.join(" ");
	}

	const result = await bdbot.player.search(search, {
		requestedBy: user,
		searchEngine,
	});

	/*
	// this is a bandaid idk if theres a better way
	if (se === 0 && result.tracks.length > 1) {
		const newTracks = [];
		newTracks.push(result.tracks[0]);
		result.tracks = newTracks;
	}
	*/

	return result;
}
