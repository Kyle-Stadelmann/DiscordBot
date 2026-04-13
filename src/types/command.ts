export enum CommandCategory {
	Fun = "Fun",
	Utility = "Utility",
	Music = "Music",
	ContextMenu = "ContextMenu",
}

export interface ICategory {
	category?: CommandCategory;
}
