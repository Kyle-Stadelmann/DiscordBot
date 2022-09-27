import { Collection, Message } from "discord.js";
import fg from "fast-glob";
import { COMMAND_FG_LOC, COMMAND_FG_LOC_PROD } from "../../constants.js";
import {
	createCmdErrorStr,
	handleHelpCmd,
	isDevMode,
	isHelpCmd,
	isProdMode,
	loadCommandFiles,
	printSpace,
	sendErrorToDiscordChannel,
} from "../../util/index.js";
import { Command } from "../command.js";

export class CommandContainer {
	public readonly commands = new Collection<string, Command>();

	public async initContainer() {
		// TODO: This is currently a little bit janky
		const cmdFgLoc = isProdMode() ? COMMAND_FG_LOC_PROD : COMMAND_FG_LOC;
		const cmdFiles = await fg(cmdFgLoc, { absolute: true });
		const cmds = await loadCommandFiles(cmdFiles);
		cmds.forEach((cmd) => {
			this.commands.set(cmd.name, cmd);
			cmd.aliases.forEach((alias) => this.commands.set(alias, cmd));
		});
		printSpace();
	}

	// Returns whether or not the command (or help command) was successful
	public async tryRunCommand(cmdStr: string, msg: Message, args: string[]): Promise<boolean> {
		if (!this.commands.has(cmdStr)) return false;

		const cmd = this.commands.get(cmdStr);

		const canRunCmd = await cmd.validateCommand(msg, args);
		if (!canRunCmd) return false;

		if (isHelpCmd(args)) {
			await handleHelpCmd(msg, cmd);
			return true;
		}

		let result = false;
		try {
			result = await cmd.run(msg, args);
		} catch (error) {
			result = false;
			const errStr = createCmdErrorStr(cmdStr, error, msg, args);
			console.error(errStr);
			printSpace();
			if (isProdMode()) {
				await sendErrorToDiscordChannel(errStr);
			}
		}

		// If cmd successful, put on cooldown
		if (result && !isDevMode()) {
			await cmd.putOnCooldown(msg.member || msg.author);
		}

		return result;
	}
}