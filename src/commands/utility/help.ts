import { EmbedBuilder, APIEmbedField, CommandInteraction } from "discord.js";
import { DApplicationCommand, Discord, Slash } from "discordx";
import { Category, ICategory } from "@discordx/utilities";
import { client } from "../../app.js";
import { getEnumValues } from "../../util/enum-helper.js";
import { CommandCategory } from "../../types/command.js";
import { ICooldownTime } from "../../types/cooldown-time.js";

const cmdCatIconMap: Map<CommandCategory, string> = new Map([
	[CommandCategory.Fun, ":tada:"],
	[CommandCategory.Music, ":notes:"],
	[CommandCategory.Utility, ":tools:"],
]);

@Discord()
@Category(CommandCategory.Utility)
export class HelpCommand {
	@Slash({name: "help", description: "Lists all commands that this bot currently has to offer."})
	async run(interaction: CommandInteraction): Promise<boolean> {
		const isDm = !interaction.inGuild();

		const cmds = client.applicationCommands.filter(ac => {
			const cmd = ac as DApplicationCommand & ICategory & ICooldownTime;
			return (isDm) 
				? cmd.dmPermission
				: cmd.guilds.includes(interaction.guild.id);
		});

		const fields = getEnumValues(CommandCategory).flatMap((e) => this.getCmdCategoryEmbedField(cmds, e), this);

		const helpEmbed = new EmbedBuilder()
			.addFields(fields)
			.setThumbnail(interaction.guild ? interaction.guild.iconURL() : undefined)
			.setAuthor({ name: `${client.user.username}`, iconURL: `${client.user.avatarURL()}` })
			.setTitle("All Commands")
			.setColor(0x0);

		await interaction.reply({embeds: [helpEmbed]});

		return true;
	}

	private getCmdCategoryEmbedField(cmds: DApplicationCommand[], cmdCat: CommandCategory): APIEmbedField[] {
		const cmdNames = cmds
			.filter(ac => {
				const cmd = ac as DApplicationCommand & ICategory & ICooldownTime;
				return (cmd.category ?? CommandCategory.Utility) === cmdCat
			})
			.map((cmd) => `\`${cmd.name}\``);

		if (cmdNames.length === 0) return [];

		const catName = `${cmdCatIconMap.get(cmdCat)} ${CommandCategory[cmdCat]}`;
		return [{ name: catName, value: this.formatCmdNames(cmdNames) }];
	}

	private formatCmdNames(cmdNames: string[]): string {
		return cmdNames.toString().replaceAll(",", ", ");
	}
}
