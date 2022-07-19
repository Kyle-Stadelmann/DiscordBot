/* eslint-disable @typescript-eslint/no-unused-vars */
import path from "path";
import { GuildMember, Message } from "discord.js";
import { fileURLToPath } from "url";
import { CooldownContainer } from "./containers/cooldown_container.js";
import { printSpace, sendErrorMessage } from "../util/index.js";

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
	protected cooldowns: CooldownContainer;

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
		this.cooldowns = options.cooldowns ?? new CooldownContainer(this.cooldownTime, this.name);
		this.category = options.category ?? Command.getCategoryName();
	}

	public async initCmd() {
		await this.cooldowns.initContainer();
	}

	public isOnCooldown(member: GuildMember, args?: string[]): boolean {
		return this.cooldowns.isOnCooldown(member);
	}

	public async putOnCooldown(member: GuildMember, args?: string[]) {
		return this.cooldowns.putOnCooldown(member);
	}

	public async endCooldown(member: GuildMember, args?: string[]) {
		return this.cooldowns.endCooldown(member);
	}

	public async validateCommand(msg: Message, args: string[]): Promise<boolean> {
		const { channel } = msg;

		// Make sure if we're in a dm to check if this cmd is allowed in a dm
		// fail quietly (this cmd shouldn't be visible at all to them)
		if (channel.type === "DM" && !this.allowInDM) return false;
	
		return this.validateCooldown(msg, args);
	}

	protected async validateCooldown(msg: Message, args: string[]): Promise<boolean> {
		const { member, channel } = msg;
	
		// TODO: Cooldowns are disabled in DMs atm
		if (channel.type === "DM") return true;
	
		if (this.isOnCooldown(member, args)) {
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
	usage: string;
	cooldownTime?: number;
	examples?: string[];
	allowInDM?: boolean;
	aliases?: string[];
	disabled?: boolean;
	permissions?: any[];
	category?: CommandCategory; // This will be grabbed from filepath if not specified
	cooldowns?: CooldownContainer; // New cooldown container will be created if not specified
}
function validateCooldown(cmd: any, msg: Message<boolean>, args: string[]): boolean | PromiseLike<boolean> {
	throw new Error("Function not implemented.");
}

