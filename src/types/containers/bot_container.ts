import { DANIEL_ID } from "../../constants";
import { CommandContainer } from "./command_container";

export class BDBot {
	// Global state
	public commandContainer = new CommandContainer();
	public typingTimestamps = new Map<string, number>().set(DANIEL_ID, null);
}
