import { Message, Role } from "discord.js";
import { CommandConfig, Command, CommandCategory } from "../../types/command.js";
import { sendErrorMessage, sendMessage } from "../../util/index.js";

const cmdConfig: CommandConfig = {
	name: "role",
	description: "Assigns 1 'players role.' Use the listRoles command to display the avaliable player roles.",
	category: CommandCategory.Utility,
	usage: `role <player role without the Players part>`,
	examples: ["role CS:GO"],
	disabled: true,
};

class PlayersRoleCommand extends Command {
	public async run(msg: Message, args: string[]): Promise<boolean> {
		const { channel } = msg;

		if (args[0] == null) {
			await sendErrorMessage(channel, "No player role specified");
			return false;
		}

		const allRoles = msg.guild.roles;
		// role.name -> role
		const roleNameMap = new Map<string, Role>();
		for (const [, role] of allRoles.cache.entries()) {
			roleNameMap.set(role.name, role);
		}
		const targetRoleStr = `${args[0]} players`;

		if (!roleNameMap.has(targetRoleStr)) {
			await sendErrorMessage(channel, "Can't find the player role specified");
			return false;
		}

		const targetRole = roleNameMap.get(targetRoleStr);

		if (msg.member.roles.resolve(targetRole.id)) {
			await sendErrorMessage(channel, "You already have the player role specified");
			return false;
		}

		await msg.member.roles.add(targetRole);

		await sendMessage(channel, "You have been given the player role specified");
		return true;
	}
}

export default new PlayersRoleCommand(cmdConfig);
