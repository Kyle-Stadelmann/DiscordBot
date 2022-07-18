import { Collection, Message, MessageEmbed } from "discord.js";
import fg from "fast-glob";
import { PREFIX } from "../../constants.js";
import { isDevMode } from "../../util/is_dev_mode.js";
import { sendErrorMessage, sendEmbeds } from "../../util/message_channel.js";
import { printSpace } from "../../util/print_space.js";
import { Command } from "../command.js";

export class CommandContainer {
	public commands = new Collection<string, Command>();

	private async loadCommandFile(file: string): Promise<Command> {
		const cmd = (await import(`file://${file}`)).default as Command;

		// Only load command if its not disabled
		// But if DEV mode is activated, load disabled commands
		if (!cmd.disabled || isDevMode()) {
			console.log(`${file} loaded!`);
			return cmd;
		}
		return null;
	}

	private async loadCommandFiles(files: string[]): Promise<Command[]> {
		if (files.length === 0) {
			console.log("No commands to load!");
			return;
		}

		console.log(`Loading commands...`);

		const loadCmdPromises = files.map((file) => this.loadCommandFile(file));

		const cmds = await Promise.all(loadCmdPromises);
		// loadCommandFile can return null, filter those out
		const validCmds = cmds.filter((cmd) => cmd);
		// eslint-disable-next-line consistent-return
		return validCmds;
	}

	public async loadCommandMap() {
		const cmdFiles = await fg(`src/commands/**/*`, { absolute: true });
		const cmds = await this.loadCommandFiles(cmdFiles);
		cmds.forEach((cmd) => this.commands.set(cmd.name, cmd));
	}

	private async checkCanRunCmd(cmd: Command, msg: Message): Promise<boolean> {
		const { member, channel } = msg;

		// Make sure if we're in a dm to check if this cmd is allowed in a dm
		// fail quietly (this cmd shouldn't be visible at all to them)
		if (channel.type === "DM" && !cmd.allowInDM) return false;

		// TODO: Cooldowns are disabled in DMs atm
		if (channel.type === "DM") return true;

		if (cmd.isOnCooldown(member)) {
			console.log("Command was NOT successful, member is on cooldown.");
			await sendErrorMessage(channel, "Command was NOT successful, you are on cooldown for this command.");
			printSpace();
			return false;
		}

		return true;
	}

	private isHelpCmd(args: string[]): boolean {
		return args.length > 0 && args[0].toLowerCase() === "help";
	}

	// Handles the help call for a specific command
	// called when for ex: '>rally help' is sent
	private async handleHelpCmd(msg: Message, cmd: Command) {
		console.log(`Help for the ${cmd.name} command detected by: ${msg.author.username}`);

		const helpStr = new MessageEmbed()
			.addField("Command", `\`${cmd.name}\``, true)
			.addField("Description", cmd.description)
			.addField("Usage", `\`${PREFIX}${cmd.usage}\``)
			.setColor(0x0);

		const { examples } = cmd;
		if (examples != null && examples.length > 0) {
			let examplesStr = "";
			for (let i = 0; i < examples.length; i += 1) {
				examplesStr += `\`${PREFIX}${examples[i]}\``;
				if (i !== examples.length - 1) examplesStr += "\n";
			}
			helpStr.addField("Examples", examplesStr);
		}

		await sendEmbeds(msg.channel, [helpStr]);
		console.log("Help was successful.");
		printSpace();
	}

	// Returns whether or not the command (or help command) was successful
	public async tryRunCommand(cmdStr: string, msg: Message, args: string[]): Promise<boolean> {
		if (!this.commands.has(cmdStr)) return false;

		const cmd = this.commands.get(cmdStr);

		const canRunCmd = await this.checkCanRunCmd(cmd, msg);
		if (!canRunCmd) return false;

		if (this.isHelpCmd(args)) {
			await this.handleHelpCmd(msg, cmd);
			return true;
		}

		let result = false;
		try {
			result = await cmd.run(msg, args);
		} catch (error) {
			result = false;
			console.error(`Error when executing command ${cmdStr}\nerror: ${JSON.stringify(error)}`);
			console.error(`msg: ${JSON.stringify(msg)}`);
			console.error(`args: ${JSON.stringify(args)}`);
			printSpace();
		}

		// If cmd successful, put on cooldown. No cooldowns in dev mode though
		if (result && isDevMode()) {
			// TODO: Cooldowns are disabled in DMs atm
			if (msg.channel.type !== "DM") 
				await cmd.putOnCooldown(msg.member);
		}

		return result;
	}

	public getCommand(cmdStr: string): Command | undefined {
		if (!this.commands.has(cmdStr)) return undefined;
		return this.commands.get(cmdStr);
	}
}
