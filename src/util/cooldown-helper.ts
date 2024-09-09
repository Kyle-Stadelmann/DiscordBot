import { ChatInputCommandInteraction } from "discord.js";
import { isNullOrUndefined } from "./general.js";

export function getCmdCooldownStr(name: string, group: string | undefined, subgroup: string | undefined): string {
	if (!isNullOrUndefined(group) && !isNullOrUndefined(subgroup)) {
		return `${group}_${subgroup}_${name}`;
	}
	if (!isNullOrUndefined(group)) {
		return `${group}_${name}`;
	}
	return name;
}

export function getCmdCooldownStrInteraction(interaction: ChatInputCommandInteraction): string {
	const subcmdName = interaction.options.getSubcommand(false);
	const cmdName = interaction.commandName;
	const subgroup = interaction.options.getSubcommandGroup(false);

	if (!isNullOrUndefined(subcmdName) && !isNullOrUndefined(subgroup)) {
		return `${cmdName}_${subgroup}_${subcmdName}`;
	}
	if (!isNullOrUndefined(subcmdName)) {
		return `${cmdName}_${subcmdName}`;
	}
	return cmdName;
}
