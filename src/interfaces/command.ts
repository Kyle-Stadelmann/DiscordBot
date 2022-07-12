import path from "path";
import { GuildMember, Message } from "discord.js";
import { CommandConfig } from "../types/types";
import { Cooldowns } from "./cooldown";

export enum CommandCategory {
	Fun,
	Utility,
}

export abstract class Command {
	public name: string;
	public description: string;
	public usage: string;
	public examples: string[];
	public allowInDM: boolean;
	public aliases: string[];
	public disabled: boolean;
	public cooldownTime: number;
	public permissions: any[]; // TODO: Expand on this
	public category: CommandCategory;

	private cooldowns: Cooldowns;

	public abstract run(msg: Message, args: string[]): Promise<boolean>;

	constructor(options: CommandConfig) {
		this.name = options.name;
		this.description = options.description;
		this.usage = options.usage;
		this.examples = options.examples ?? [];
		this.allowInDM = options.allowInDM ?? false;
		this.aliases = options.aliases ?? [];
		this.disabled = options.disabled ?? false;
		this.cooldownTime = options.cooldownTime ?? 0.5 * 1000;
		this.permissions = options.permissions ?? [];

		this.cooldowns = new Cooldowns(this.cooldownTime, this.name);
		this.category = Command.getCategoryName();
	}

	public isOnCooldown(member: GuildMember): boolean {
		return this.cooldowns.isOnCooldown(member);
	}

	public async putOnCooldown(member: GuildMember) {
		return this.cooldowns.putOnCooldown(member);
	}

	public async endCooldown(member: GuildMember) {
		return this.cooldowns.endCooldown(member);
	}

	// Uses parent directory to return command category enum
	private static getCategoryName(): CommandCategory {
		const parentDirName = path.basename(path.dirname(__filename));
		const firstLetterUppercase = parentDirName.charAt(0).toUpperCase();
		const categoryStr = firstLetterUppercase + parentDirName.substring(1);

		return CommandCategory[categoryStr];
	}
}
