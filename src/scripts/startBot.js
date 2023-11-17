import { execSync } from "child_process";
// eslint-disable-next-line import/extensions
import { botMode, BotModeEnum } from "../settings.js";

switch (botMode) {
	case BotModeEnum.PROD:
		execSync("rm -rf dist", { stdio: [0, 1, 2] });
		execSync("npm run build", { stdio: [0, 1, 2] });
		execSync("npm run start-js", { stdio: [0, 1, 2] });
		break;
	case BotModeEnum.DEV:
	default:
		execSync("npm run start-ts", { stdio: [0, 1, 2] });
		break;
}
