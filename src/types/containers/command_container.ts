import { Collection, Message } from "discord.js";
import fg from "fast-glob";
import { checkCanRunCmd, createCmdErrorStr, handleHelpCmd, isDevMode, isHelpCmd, loadCommandFiles, printSpace, sendErrorDebug } from "../../util/index.js";
import { Command } from "../command.js";

export class CommandContainer {
	public commands = new Collection<string, Command>();

	public async initContainer() {
		const cmdFiles = await fg(`src/commands/**/*`, { absolute: true });
		const cmds = await loadCommandFiles(cmdFiles);
		cmds.forEach((cmd) => this.commands.set(cmd.name, cmd));
	}

	// Returns whether or not the command (or help command) was successful
	public async tryRunCommand(cmdStr: string, msg: Message, args: string[]): Promise<boolean> {
		if (!this.commands.has(cmdStr)) return false;

		const cmd = this.commands.get(cmdStr);

		const canRunCmd = await checkCanRunCmd(cmd, msg);
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
			await sendErrorDebug(errStr);
		}

		// If cmd successful, put on cooldown. No cooldowns in dev mode though
		if (result && isDevMode()) {
			// TODO: Cooldowns are disabled in DMs atm
			if (msg.channel.type !== "DM") await cmd.putOnCooldown(msg.member);
		}

		return result;
	}

	public getCommand(cmdStr: string): Command | undefined {
		if (!this.commands.has(cmdStr)) return undefined;
		return this.commands.get(cmdStr);
	}
}
