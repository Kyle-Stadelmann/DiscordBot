import { Collection, CommandInteraction } from "discord.js";
import {
	createCmdErrorStr,
	handleHelpCmd,
	isDevMode,
	isHelpCmd,
	isProdMode,
	printSpace,
	sendErrorToDiscordChannel,
} from "../../util/index.js";
import { Command } from "../command.js";

export class CommandContainer {
	// Note: commands are not unique in this map; multiple strings map to the same command
	private readonly commands = new Collection<string, Command>();

	// Returns whether or not the command (or help command) was successful
	public async tryRunCommand(interaction: CommandInteraction): Promise<boolean> {
		const {commandName} = interaction;
		if (!this.commands.has(commandName)) return false;

		const cmd = this.commands.get(commandName);

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
}
