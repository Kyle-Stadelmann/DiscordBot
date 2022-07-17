import * as settings from "../settings";

export function isDevMode(): boolean {
	return settings.botMode === settings.BotModeEnum.DEV;
}
