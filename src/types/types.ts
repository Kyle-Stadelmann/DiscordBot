export interface CommandOptions {
    name: string;
    description: string;
    usage: string;
    category: string;
    cooldown: number;
    examples?: string[];
    allowInDM?: boolean;
    aliases?: string[];
    disabled?: boolean;
    permissions?: any;
}