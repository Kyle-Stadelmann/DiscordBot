import { HexColorString } from "discord.js";

// Ty stack overflow
export function getRandomHexStr(): HexColorString {
    // eslint-disable-next-line no-bitwise
    return `#${(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0')}`;
}