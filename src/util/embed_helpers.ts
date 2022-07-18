import { HexColorString } from "discord.js";

// Ty stack overflow
export function getRandomHexStr(): HexColorString {
	// eslint-disable-next-line no-bitwise
	return `#${((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0")}`;
}
