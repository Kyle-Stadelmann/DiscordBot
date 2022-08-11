import { Queue, Track } from "discord-player";

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

export function SearchTitle(search: string, queue: Queue): Track {
	return queue.tracks.find((track) => track.title.toLowerCase().includes(search));
}

// TODO: pretty sure i can take chunks out of play and put them here
