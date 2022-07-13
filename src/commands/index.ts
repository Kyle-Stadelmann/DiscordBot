import { glob } from "glob";
import { parse } from "path";
import { Command } from "../interfaces/command";
import * as settings from "../settings";
import { printSpace } from "../util";

const baseFileName = parse(__filename).base;

export class CommandLoader {
    private commands: Map<string, Command> = new Map();

    private async loadCommandFile(file: string) {
        // Skip this file
        if (file === baseFileName) return;
    
        const cmd = ((await import(file)) as Command);
    
        // Only load command if its not disabled
        // But if DEV mode is activated, load disabled commands
        if (!cmd.disabled || settings.botMode === settings.BotModeEnum.DEV) {
            console.log(`${this.commands.size+1}: ${file} loaded!`);
            this.commands.set(file, cmd);
        }
    }
    
    private loadCommandFiles(err: Error, files: string[]) {
        if (err) {
            console.log("Failed to load commands");
            console.log(err);
            throw err;
        }
    
        printSpace();
    
        if (files.length === 0) {
            console.log("No commands to load!");
            return;
        }
    
        console.log(`Loading commands...`);
    
        files.forEach(this.loadCommandFile);
    }

    public loadCommandMap() {
        glob(`${__filename}/*`, this.loadCommandFiles);
    }
}