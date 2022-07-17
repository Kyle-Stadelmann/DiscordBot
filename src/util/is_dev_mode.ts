import * as settings from "../settings.js";

export function isDevMode(): boolean {
	return settings.botMode === settings.BotModeEnum.DEV;
}
