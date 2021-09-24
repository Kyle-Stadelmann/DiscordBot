import { Client, Message } from "discord.js";
import { CommandOptions } from "../types/types";

export abstract class Command {
    name: string;
    description: string;
    usage: string;
    examples: string[];
    dmAllow: boolean;
    aliases: string[];
    category: string;
    disabled: boolean;
    cooldown: number;
    permissions: any;
    abstract run(bot: Client, msg: Message, args : string[]) : boolean;

    constructor(options : CommandOptions) {
        this.name = options.name;
        this.description = options.description;
        this.usage = options.usage;
        this.examples = options.examples ?? [];
        this.dmAllow = options.dmAllow ?? true;
        this.aliases = options.aliases ?? [];
        this.disabled = options.disabled ?? false;
        this.permissions = options.permissions ?? [];
    }
}

