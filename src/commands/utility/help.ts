import { Message, EmbedBuilder, APIEmbedField, ChannelType } from "discord.js";
import { bdbot, client } from "../../app.js";
import { PREFIX } from "../../constants.js";
import { Command, CommandCategory, CommandConfig } from "../../types/command.js";
import { getEnumValues } from "../../util/enum-helper.js";
import { sendEmbeds } from "../../util/index.js";

const cmdConfig: CommandConfig = {
	name: "help",
	description: "Lists all commands that this bot currently has to offer.",
	category: CommandCategory.Utility,
	usage: `help`,
	allowInDM: true,
};

const cmdCatIconMap: Map<CommandCategory, string> = new Map([
	[CommandCategory.Fun, ":tada:"],
	[CommandCategory.Music, ":notes:"],
	[CommandCategory.Utility, ":tools:"],
]);

class HelpCommand extends Command {
	public async run(msg: Message): Promise<boolean> {
		const isDm = msg.channel.type === ChannelType.DM;
		const fields = getEnumValues(CommandCategory).flatMap((e) => this.getCmdCategoryEmbedField(e, isDm), this);

		const helpEmbed = new EmbedBuilder()
			.addFields(fields)
			.setThumbnail(msg.guild ? msg.guild.iconURL() : undefined)
			.setAuthor({ name: `${client.user.username}`, iconURL: `${client.user.avatarURL()}` })
			.setDescription(`Use \`${PREFIX}commandName help\` to recieve instructions on how to use any command.`)
			.setTitle("All Commands")
			.setColor(0x0);

		await sendEmbeds(msg.channel, [helpEmbed]);

		return true;
	}

	private getCmdCategoryEmbedField(cmdCat: CommandCategory, isDm: boolean): APIEmbedField[] {
		const cmdNames = bdbot
			.getCmdCategoryMap()
			.get(cmdCat)
			.filter((cmd) => !isDm || cmd.allowInDM)
			.map((cmd) => `\`${cmd.name}\``);

		if (cmdNames.length === 0) return [];

		const catName = `${cmdCatIconMap.get(cmdCat)} ${CommandCategory[cmdCat]}`;
		return [{ name: catName, value: this.formatCmdNames(cmdNames) }];
	}

	private formatCmdNames(cmdNames: string[]): string {
		return cmdNames.toString().replaceAll(",", ", ");
	}
}

export default new HelpCommand(cmdConfig);
