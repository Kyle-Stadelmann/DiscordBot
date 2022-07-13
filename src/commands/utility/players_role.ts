import { Message, Role } from "discord.js";
import { Command } from "../../interfaces/command";
import { CommandConfig } from "../../types/types";

const cmdConfig: CommandConfig = {
	name: "role",
	description: "Assigns 1 'players role.' Use the listRoles command to display the avaliable player roles.",
	usage: `role <player role without the Players part>`,
	examples: ["role CS:GO"],
	disabled: true
};

class PlayersRoleCommand extends Command {
	public async run(msg: Message, args: string[]): Promise<boolean> {
		const {channel} = msg;
		
		if (args[0] == null) {
			await this.sendErrorMessage(channel, "No player role specified");
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
			await this.sendErrorMessage(channel, "Can't find the player role specified");
			return false;
		}
	
		const targetRole = roleNameMap.get(targetRoleStr);

		if (msg.member.roles.resolve(targetRole.id)) {
			await this.sendErrorMessage(channel, "You already have the player role specified");
			return false;
		}
	
		msg.member.roles.add(targetRole).catch(console.error);
	
		await this.sendMessage(channel, "You have been given the player role specified");
		return true;
	}
}

export default new PlayersRoleCommand(cmdConfig);