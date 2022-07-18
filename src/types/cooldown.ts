export interface Cooldown {
	[id: string]: Date;
}

export interface CooldownFile {
	[name: string]: Cooldown;
}
