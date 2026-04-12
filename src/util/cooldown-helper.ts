import { ChatInputCommandInteraction } from "discord.js";

export function getCmdCooldownStr(name: string, group: string | undefined, subgroup: string | undefined): string {
	if (group != null && subgroup != null) {
		return `${group}_${subgroup}_${name}`;
	}
	if (group != null) {
		return `${group}_${name}`;
	}
	return name;
}

export function getCmdCooldownStrInteraction(interaction: ChatInputCommandInteraction): string {
	const subcmdName = interaction.options.getSubcommand(false);
	const cmdName = interaction.commandName;
	const subgroup = interaction.options.getSubcommandGroup(false);

	if (subcmdName != null && subgroup != null) {
		return `${cmdName}_${subgroup}_${subcmdName}`;
	}
	if (subcmdName != null) {
		return `${cmdName}_${subcmdName}`;
	}
	return cmdName;
}
