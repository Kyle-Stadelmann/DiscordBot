import { botMode, BotModeEnum } from "../settings.js"
import { execSync } from 'child_process';

switch (botMode) {
    case BotModeEnum.DEV:
        execSync('npm run start-ts', {stdio:[0,1,2]});
        break;
    case BotModeEnum.PROD:
        execSync('npm run build', {stdio:[0,1,2]})
        execSync('npm run start-js', {stdio:[0,1,2]});
        break;
}