import { HexColorString } from "discord.js";

// Ty stack overflow
export function getRandomHexColorStr(): HexColorString {
	return `#${((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0")}`;
}
