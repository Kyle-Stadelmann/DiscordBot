import { Message, MessageEmbed } from "discord.js";
import path from "path";
import fg from "fast-glob";
import { PREFIX, SRC_DIR } from "../constants";
import { Command } from "../interfaces/command";
import * as settings from "../settings";
import { printSpace } from "../util";

const commandsDir = path.join(`${SRC_DIR}`, "commands");

export class CommandContainer {
    private commands: Map<string, Command> = new Map();
    constructor() {
        this.loadCommandMap();
    }

    private async loadCommandFile(file: string) {
        const cmd = ((await import(file)) as Command);
    
        // Only load command if its not disabled
        // But if DEV mode is activated, load disabled commands
        if (!cmd.disabled || settings.botMode === settings.BotModeEnum.DEV) {
            console.log(`${this.commands.size+1}: ${file} loaded!`);
            this.commands.set(file, cmd);
        }
    }
    
    private async loadCommandFiles(files: string[]) {
        if (files.length === 0) {
            console.log("No commands to load!");
            return;
        }
    
        console.log(`Loading commands...`);
    
        const loadCmdPromises = files.map(this.loadCommandFile);
        await Promise.all(loadCmdPromises);
    }

    public async loadCommandMap() {
        const cmdFiles = await fg(`${commandsDir}/*`);
        await this.loadCommandFiles(cmdFiles);
    }

    private async checkCanRunCmd(cmd: Command, msg: Message): Promise<boolean> {
        const {member, channel} = msg;

        // Make sure if we're in a dm to check if this cmd is allowed in a dm
        // fail quietly (this cmd shouldn't be visible at all to them)
	    if (channel.type === "DM" && !cmd.allowInDM) return false;
        
        if (cmd.isOnCooldown(member)) {
		    console.log("Command was NOT successful, member is on cooldown.");
            await cmd.sendErrorMessage(channel, "Command was NOT successful, you are on cooldown for this command.");
            printSpace();
            return false;
        }

        return true;
    }

    private isHelpCmd(args: string[]): boolean {
        return (args.length > 0 && args[0].toLowerCase() === "help");
    }

    // Handles the help call for a specific command
    // called when for ex: '>rally help' is sent
    private async handleHelpCmd(msg: Message, cmd: Command) {
        console.log(`Help for the ${cmd.name} command detected by: ${msg.author.username}`);

        const helpStr = new MessageEmbed()
            .addField("Command", `\`${cmd.name}\``, true)
            .addField("Description", cmd.description)
            .addField("Usage", `\`${PREFIX}${cmd.usage}\``)
            .setColor(0x0);

        const {examples} = cmd;
        if (examples != null && examples.length > 0) {
            let examplesStr = "";
            for (let i = 0; i < examples.length; i+=1) {
                examplesStr += `\`${PREFIX}${examples[i]}\``;
                if (i !== examples.length - 1) examplesStr += "\n";
            }
            helpStr.addField("Examples", examplesStr);
        }

        await cmd.sendEmbeds(msg.channel, [helpStr ]);
        console.log("Help was successful.");
        printSpace();
    }

    // Returns whether or not the command (or help command) was successful
    public async tryRunCommand(cmdStr: string, msg: Message, args: string[]): Promise<boolean> {
        if (!this.commands.has(cmdStr)) return false;

        const cmd = this.commands.get(cmdStr);

        const canRunCmd = await this.checkCanRunCmd(cmd, msg);
        if (!canRunCmd) return false;

        if (this.isHelpCmd(args)) {
            await this.handleHelpCmd(msg, cmd);
            return true;
        }

        let result = false;
        try {
            result = await cmd.run(msg, args);
        } catch (error) {
            result = false;
            const errorOutput = {"error": error, "msg": msg, "args": args};
            console.error(`Error when executing command ${cmdStr}\n ${errorOutput}`);
    		printSpace();
        }

        // If cmd successful, put on cooldown. No cooldowns in dev mode though
        if (result && settings.botMode !== settings.BotModeEnum.DEV) {
            await cmd.putOnCooldown(msg.member);
        }

        return result;
    }

    public getCommand(cmdStr: string): Command | undefined {
        if (!this.commands.has(cmdStr)) return undefined;
        return this.commands.get(cmdStr);
    }
}