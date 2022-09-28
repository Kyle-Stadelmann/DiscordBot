import { ChannelType, Guild, GuildMember, Message, User } from "discord.js";
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
			category: options.category,
			usage: "", // Unused
			aliases: options.aliases,
			disabled: options.disabled,
			allowInDM: options.allowInDM,
		};
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
		const subCmd = this.subCommands.find((cmd) => cmd.name === args[0] || cmd.aliases.includes(args[0]));
		return subCmd ? args.slice(1) : args;
	}

	// Default sub command behavior (first arg string match)
	// [prefix][parentCommandName] [subCommandName] ex: '>afkpic add'
	// Override for more complex sub command resolving
	public resolveSubCommand(args: string[]): Command | undefined {
		if (!args || args.length === 0) return this.defaultCmd;
		const subCmdStr = args[0].toLowerCase();
		const subCmd = this.subCommands.find((cmd) => cmd.name === subCmdStr || cmd.aliases.includes(subCmdStr));
		// If no subcmd was found, try the default cmd
		return subCmd ?? this.defaultCmd;
	}

	// Note: returns undefined if can't resolve args to sub command
	// must check this first.
	public override isOnCooldown(person: GuildMember | User, args: string[]): Promise<boolean> {
		if (this.shareCooldownMap) {
			return this.cooldowns.isOnCooldown(person);
		}

		const cmd = this.resolveSubCommand(args);
		return cmd?.isOnCooldown(person, args);
	}

	public override putOnCooldown(person: GuildMember | User, args?: string[]) {
		if (this.shareCooldownMap) {
			return this.cooldowns.putOnCooldown(person);
		}

		const cmd = this.resolveSubCommand(args);
		return cmd?.putOnCooldown(person, args);
	}

	public override putOnGuildCooldown(guild: Guild, cooldownTime: number, args?: string[]): Promise<void> {
		if (this.shareCooldownMap) {
			return this.cooldowns.putOnGuildCooldown(guild, cooldownTime);
		}

		const cmd = this.resolveSubCommand(args);
		return cmd?.putOnGuildCooldown(guild, cooldownTime, args);
	}

	public override endCooldown(person: GuildMember | User, args?: string[]) {
		if (this.shareCooldownMap) {
			return this.cooldowns.endCooldown(person);
		}

		const cmd = this.resolveSubCommand(args);
		return cmd?.endCooldown(person, args);
	}

	public override endGuildCooldown(guild: Guild, args?: string[]) {
		if (this.shareCooldownMap) {
			return this.cooldowns.endGuildCooldown(guild);
		}

		const cmd = this.resolveSubCommand(args);
		return cmd?.endGuildCooldown(guild, args);
	}

	override get examples(): string[] {
		return this.subCommands.flatMap((cmd) => cmd.examples);
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
		if (channel.type === ChannelType.DM && !subcmd.allowInDM) return false;

		return this.validateCooldown(msg, args);
	}

	protected addSubCommand(CmdType: new (options: CommandConfig) => Command, subCmdConfig: CommandConfig) {
		// eslint-disable-next-line no-param-reassign
		subCmdConfig.cooldown_name = `${this.name}_${subCmdConfig.name}`;
		const cmd = new CmdType(subCmdConfig);
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
	allowInDM?: boolean;
}
