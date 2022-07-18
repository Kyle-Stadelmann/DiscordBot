import { Message, MessageEmbed } from "discord.js";
import { CommandConfig, Command } from "../../types/command.js";
import { sendEmbeds } from "../../util/index.js";

const cmdConfig: CommandConfig = {
	name: "listroles",
	description: "Lists the 'main' and 'player' roles on the BD4 server.",
	usage: `listRoles`,
	disabled: true,
};

class ListRolesCommand extends Command {
	public async run(msg: Message): Promise<boolean> {
		const allRoles = msg.guild.roles.cache;

		// Grab the main roles
		let mainRoles = allRoles.filter(
			(role) => role.permissions.bitfield > 0 && !role.managed && role.name !== "@everyone"
		);

		// Sort the main roles
		mainRoles = mainRoles.sort((a, b) => b.comparePositionTo(a));

		// Grab the player roles
		let playerRoles = allRoles.filter(
			(role) => role.permissions.bitfield === 0n && !role.managed && role.mentionable
		);

		// Sort the player roles
		playerRoles = playerRoles.sort((a, b) => {
			if (a.name < b.name) return -1;
			if (a.name === b.name) return 0;
			return 1;
		});

		let mainRoleStr = "";
		mainRoles.forEach((value) => {
			mainRoleStr += value.name;
			mainRoleStr += "\n";
		});

		let playerRoleStr = "";
		playerRoles.forEach((value) => {
			playerRoleStr += value.name;
			playerRoleStr += "\n";
		});

		const roleInfo = new MessageEmbed()
			.addField("Main Roles", mainRoleStr)
			.addField("Player Roles", playerRoleStr)
			.setThumbnail(msg.guild.iconURL())
			.setColor(0x0);

		await sendEmbeds(msg.channel, [roleInfo]);

		return true;
	}
}

export default new ListRolesCommand(cmdConfig);
