import { GuildMember, Message } from "discord.js";
import { PREFIX } from "../constants.js";
import { sendErrorMessage } from "../util/index.js";
import { Command, CommandConfig } from "./command.js";

export abstract class ParentCommand extends Command {
    public readonly shareCooldownMap: boolean;

	protected readonly subCommands: Command[];
    protected readonly defaultCmdStr?: string;
    protected defaultCmd?: Command;

    // Maybe questionable but it works
    constructor(options: ParentCommandConfig) {
        const config: CommandConfig = {
            name: options.name,
            description: options.description,
            usage: "", // Unused
            aliases: options.aliases,
            disabled: options.disabled,
        }
        super(config);
        this.subCommands = [];
        this.shareCooldownMap = options.shareCooldownMap;
        this.defaultCmdStr = options.defaultCmdStr;
    }

    // Default behavior, try to find sub command to run, slice first "sub command" arg, and run
    // Override for more complex run functionality
    public run(msg: Message, args: string[]): Promise<boolean> {
        const subCmd = this.resolveSubCommand(args);
        const newArgs = this.sliceSubCmdArgs(args);
        return subCmd.run(msg, newArgs);
    }

    protected sliceSubCmdArgs(args: string[]): string[] {
        if (args.length === 0) return args;
        const subCmd = this.subCommands.find((cmd => cmd.name === args[0]));
        return (subCmd) 
            ? args.slice(1)
            : args;
    }

    // Default sub command behavior (first arg string match)
    // [prefix][parentCommandName] [subCommandName] ex: '>afkpic add'
    // Override for more complex sub command resolving
    public resolveSubCommand(args: string[]): Command | undefined {
        if (!args || args.length === 0) return this.defaultCmd;
        const subCmd = this.subCommands.find((cmd => cmd.name === args[0]));
        // If no subcmd was found, try the default cmd
        return subCmd ?? this.defaultCmd;
    }

    // Note: returns undefined if can't resolve args to sub command
    // must check this first.
    public override isOnCooldown(member: GuildMember, args: string[]): boolean {
        if (this.shareCooldownMap) {
            return this.cooldowns.isOnCooldown(member);
        }

        const cmd = this.resolveSubCommand(args);
        return cmd?.isOnCooldown(member, args);
    }

    public override putOnCooldown(member: GuildMember, args?: string[]) {
        if (this.shareCooldownMap) {
            return this.cooldowns.putOnCooldown(member);
        }

        const cmd = this.resolveSubCommand(args);
        return cmd?.putOnCooldown(member, args);
    }

    public override endCooldown(member: GuildMember, args?: string[]) {
        if (this.shareCooldownMap) {
            return this.cooldowns.endCooldown(member);
        }

        const cmd = this.resolveSubCommand(args);
        return cmd?.endCooldown(member, args);
	}

    override get examples(): string[] {
        return this.subCommands.flatMap(cmd => cmd.examples);
    }

    public override async validateCommand(msg: Message, args: string[]): Promise<boolean> {
        const { channel } = msg;
    
        const subcmd = this.resolveSubCommand(args);
        if (!subcmd || subcmd.disabled) {		
            console.log(`Command was NOT successful, parent command did not resolve to a subcommand. args: [${args}]`);
            await sendErrorMessage(channel, `Could not find subcommand, check '${PREFIX}${this.name} help' for usage.`);
            return false;
        } 
    
        // Make sure if we're in a dm to check if this cmd is allowed in a dm
        // fail quietly (this cmd shouldn't be visible at all to them)
        if (channel.type === "DM" && !subcmd.allowInDM) return false;
    
        return this.validateCooldown(msg, args);
    }

    protected async addSubCommand(CmdType: new (options: CommandConfig) => Command, subCmdConfig: CommandConfig) {
        // eslint-disable-next-line no-param-reassign
        subCmdConfig.cooldown_name = `${this.name}_${subCmdConfig.name}`;
        const cmd = new CmdType(subCmdConfig);
        await cmd.initCmd();
        this.subCommands.push(cmd);

        if (this.defaultCmdStr && cmd.name === this.defaultCmdStr) {
            this.defaultCmd = cmd;
        }
    }
}


export interface ParentCommandConfig extends CommandConfig {
	name: string;
	description: string; // Description of overall command (all subcommands)
    shareCooldownMap: boolean; // Do all subcommands share the same cooldown?
	aliases?: string[];
	disabled?: boolean;
    defaultCmdStr?: string;
}
