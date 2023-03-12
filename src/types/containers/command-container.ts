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
import { Command, CommandCategory } from "../command.js";

export class CommandContainer {
	// Note: commands are not unique in this map; multiple strings map to the same command
	private readonly commands = new Collection<string, Command>();

	private readonly cmdCategoryMap = new Collection<CommandCategory, Command[]>();

	public async initContainer() {
		await this.setCmdMaps();
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

		// The point of this initial cd is to ensure the cmd isn't reissued while this instance
		// of the cmd is still executing
		await cmd.putOnCooldown(msg.member || msg.author, args);

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

		// Cmd was successful, reissue 'proper' cd
		if (result && !isDevMode()) {
			await cmd.putOnCooldown(msg.member || msg.author, args);
		} else {
			// Cmd wasn't successful (or we're in dev mode), end cd
			await cmd.endCooldown(msg.member || msg.author, args);
		}

		return result;
	}

	public getAllCommands(): Command[] {
		const cmds = this.commands.values();
		return [...new Set(cmds)];
	}

	public getCmdCategoryMap(): Collection<CommandCategory, Command[]> {
		return this.cmdCategoryMap;
	}

	private async setCmdMaps() {
		// TODO: This is currently a little bit janky
		const cmdFgLoc = isProdMode() ? COMMAND_FG_LOC_PROD : COMMAND_FG_LOC;
		const cmdFiles = await fg(cmdFgLoc, { absolute: true });
		const cmds = await loadCommandFiles(cmdFiles);
		cmds.forEach((cmd) => {
			if (this.checkCmdNameAlrdyExists(cmd)) {
				throw new Error(
					`Command name ${cmd.name} or one of it's aliases conflicts with that of an existing command's`
				);
			}
			this.commands.set(cmd.name, cmd);
			cmd.aliases.forEach((alias) => this.commands.set(alias, cmd));

			const cmdCatList = this.cmdCategoryMap.get(cmd.category) ?? [];
			cmdCatList.push(cmd);
			this.cmdCategoryMap.set(cmd.category, cmdCatList);
		});
	}

	private checkCmdNameAlrdyExists(incomingCmd: Command): boolean {
		return (
			this.commands.has(incomingCmd.name) ||
			this.commands.some((existingCmd, existingCmdName) => existingCmdName === incomingCmd.name)
		);
	}
}
