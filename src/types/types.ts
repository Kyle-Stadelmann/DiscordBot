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
}
