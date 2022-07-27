import * as settings from "../settings.js";

export function isDevMode(): boolean {
	return settings.botMode === settings.BotModeEnum.DEV;
}

export function isProdMode(): boolean {
	return settings.botMode === settings.BotModeEnum.PROD;
}
