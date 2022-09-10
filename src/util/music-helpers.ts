import { PlayerSearchResult, Queue, Track } from "discord-player";
import { User } from "discord.js";
import { bdbot } from "../app.js";
import { PLAYER_SITES } from "../constants.js";

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
export function shuffleQueue(tracks: Array<Track>): Array<Track> {
	const newTracks = tracks;
	let currentIndex = newTracks.length - 1;
	let tempTrack: Track;
	let randomIndex = 0;

	while (currentIndex !== 0) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		tempTrack = tracks[currentIndex];
		newTracks[currentIndex] = newTracks[randomIndex];
		newTracks[randomIndex] = tempTrack;
	}

	return newTracks;
}

export function findTrack(search: string, queue: Queue): Track {
	return queue.tracks.find((track) => track.title.toLowerCase().includes(search));
}

// Returns Track[] containing search result (for both single song and playlist)
export async function getSearchResult(args: string[], user: User): Promise<PlayerSearchResult> {
	// Find track with args
	// if link, else search phrase containing all args
	let search = "";
	let se = 0;
	if (args[0].slice(0, 8) === "https://" && PLAYER_SITES.some((site) => args[0].includes(site))) {
		search = args[0];
		if (args[0].includes("playlist")) {
			// YOUTUBE_PLAYLIST = 2
			if (args[0].includes("youtube")) se = 2;
			// SPOTIFY_PLAYLIST = 8
			else if (args[0].includes("spotify")) se = 8;
		}
	} else {
		search = args.join(" ");
	}

	const result = await bdbot.player.search(search, {
		requestedBy: user,
		searchEngine: se,
	});

	// this is a bandaid idk if theres a better way
	if (se === 0 && result.tracks.length > 1) {
		const newTracks = [];
		newTracks.push(result.tracks[0]);
		result.tracks = newTracks;
	}

	return result;
}

export function unpause(queue: Queue): boolean {
	queue.setPaused(false);
	return true;
}
