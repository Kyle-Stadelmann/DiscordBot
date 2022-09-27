/* eslint-disable @typescript-eslint/no-unused-vars */
import path from "path";
import { ChannelType, Guild, GuildMember, Message, User } from "discord.js";
import { fileURLToPath } from "url";
import { CooldownContainer } from "./containers/cooldown-container.js";
import { printSpace, sendErrorMessage } from "../util/index.js";

export enum CommandCategory {
	Fun,
	Utility,
	Music,
}

export abstract class Command {
	public readonly name: string;
	public readonly description: string;
	public readonly usage: string;
	private readonly _examples: string[];
	public readonly allowInDM: boolean;
	public readonly aliases: string[];
	public readonly disabled: boolean;
	public readonly cooldownTime: number;
	public readonly permissions: any[]; // TODO: Expand on this
	public readonly category: CommandCategory;
	protected readonly cooldowns: CooldownContainer;

	public abstract run(msg: Message, args: string[]): Promise<boolean>;

	constructor(options: CommandConfig) {
		this.name = options.name;
		this.description = options.description;
		this.usage = options.usage ?? "";
		this._examples = options.examples ?? [];
		this.allowInDM = options.allowInDM ?? false;
		this.aliases = options.aliases ?? [];
		this.disabled = options.disabled ?? false;
		this.cooldownTime = options.cooldownTime ?? 0.5 * 1000;
		this.permissions = options.permissions ?? [];
		this.cooldowns = new CooldownContainer(this.cooldownTime, options.cooldown_name ?? this.name);
		this.category = Command.getCategoryName();
	}

	public isOnCooldown(person: GuildMember | User, args?: string[]): Promise<boolean> {
		return this.cooldowns.isOnCooldown(person);
	}

	public putOnCooldown(person: GuildMember | User, args?: string[]): Promise<void> {
		return this.cooldowns.putOnCooldown(person);
	}

	public putOnGuildCooldown(guild: Guild, cooldownTime: number, args?: string[]): Promise<void> {
		return this.cooldowns.putOnGuildCooldown(guild, cooldownTime);
	}

	public endCooldown(person: GuildMember | User, args?: string[]): Promise<void> {
		return this.cooldowns.endCooldown(person);
	}

	public endGuildCooldown(guild: Guild, args?: string[]): Promise<void> {
		return this.cooldowns.endGuildCooldown(guild);
	}

	public async validateCommand(msg: Message, args: string[]): Promise<boolean> {
		const { channel } = msg;

		// If in DM and allowInDM false, fail quietly (this cmd shouldn't be visible at all to them)
		if (channel.type === ChannelType.DM && !this.allowInDM) return false;

		return this.validateCooldown(msg, args);
	}

	get examples(): string[] {
		return this._examples;
	}

	protected async validateCooldown(msg: Message, args: string[]): Promise<boolean> {
		const { member, channel, author } = msg;

		if (await this.isOnCooldown(member || author, args)) {
			console.log("Command was NOT successful, member is on cooldown.");
			await sendErrorMessage(channel, "Command was NOT successful, you are on cooldown for this command.");
			printSpace();
			return false;
		}

		return true;
	}

	// Uses parent directory to return command category enum
	protected static getCategoryName(): CommandCategory {
		const filename = fileURLToPath(import.meta.url);
		const parentDirName = path.basename(path.dirname(filename));
		const firstLetterUppercase = parentDirName.charAt(0).toUpperCase();
		const categoryStr = firstLetterUppercase + parentDirName.substring(1);

		return CommandCategory[categoryStr];
	}
}

export interface CommandConfig {
	name: string;
	description: string;
	usage?: string;
	cooldownTime?: number; // ms
	examples?: string[];
	allowInDM?: boolean;
	aliases?: string[];
	disabled?: boolean;
	permissions?: any[];
	cooldown_name?: string; // Do not manually set
}
