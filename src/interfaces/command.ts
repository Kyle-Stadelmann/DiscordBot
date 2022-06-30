import { GuildMember, Message, Snowflake } from "discord.js";
import { CommandOptions } from "../types/types";
import path from "path";
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

    abstract run(msg: Message, args: string[]) : Promise<boolean>;

    constructor(options: CommandOptions) {
        this.name = options.name;
        this.description = options.description;
        this.usage = options.usage;
        this.examples = options.examples ?? [];
        this.allowInDM = options.allowInDM ?? false;
        this.aliases = options.aliases ?? [];
        this.disabled = options.disabled ?? false;
        this.cooldownTime = 0.5 * 1000;
        this.permissions = options.permissions ?? [];

        this.cooldowns = new Cooldowns(this.cooldownTime, this.name);
        this.category = this.getCategoryName();
    }

    public isOnCooldown(member: GuildMember): boolean {
        return this.cooldowns.isOnCooldown(member);
    }

    public async putOnCooldown(member: GuildMember) {
        return await this.cooldowns.putOnCooldown(member);
    }

    public async endCooldown(member: GuildMember) {
        return await this.cooldowns.endCooldown(member);
    }

    // Uses parent directory to return command category enum
    private getCategoryName(): CommandCategory {
        const parentDirName = path.basename(path.dirname(__filename));
        const firstLetterUppercase = parentDirName.charAt(0).toUpperCase();
        const categoryStr = firstLetterUppercase + parentDirName.substring(1);

        return CommandCategory[categoryStr];
    }
}
