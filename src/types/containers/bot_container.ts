import { DANIEL_ID } from "../../constants.js";
import { CommandContainer } from "./command_container.js";

export class BDBot {
	// Global state
	public commandContainer = new CommandContainer();
	public typingTimestamps = new Map<string, number>().set(DANIEL_ID, null);

	public async loadCommands() {
		await this.commandContainer.loadCommandMap();
	}
}
