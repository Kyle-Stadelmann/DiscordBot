import { GuildMember, Message, TextBasedChannel } from "discord.js";
import { BD4_BOT_ID, ZACH_ID } from "../../constants";
import { Command } from "../../interfaces/command";
import { CommandConfig } from "../../types/types";
import { sendErrorMessage, sendMessage } from "../../util";

const MIN_SHARPEN_TIME = 30 * 60 * 1000;

const cmdConfig: CommandConfig = {
	name: "sword",
	description:
		"Exclusive command to Zach. Once a week he can begin sharpening his sword. He can sharpen it for up to a week before attempting to annihilate someone. The longer the sharpening time, the higher the potency!",
	usage: `sword @victim`,
	examples: ["sword @Dualkim"],
	disabled: true,
	cooldownTime: 7 * 24 * 60 * 60 * 1000
};

class SwordCommand extends Command {
	// TODO: Store as snapshotted state somehow
	private sharpeningDate: Date = null;

	public async run(msg: Message): Promise<boolean> {
		const {channel} = msg;
		const sender = msg.member;
		const victim = msg.mentions.members.first();
	
		const date = new Date();
	
		if (sender.id !== ZACH_ID) {
			await sendErrorMessage(channel, "Alas, only zach can sharpen his sword.");
			return false;
		}
	
		if (victim === null) {
			return this.beginSharpening(channel, sender);
		}
	
		// Make sure he sharpened for enough time
		if (this.sharpeningDate == null || this.sharpeningDate.getTime() + MIN_SHARPEN_TIME > date.getTime()) {
			await sendErrorMessage(channel, "Remain patient soldier, your sword is too dull!");
			return false;
		}
	
		if (!victim.kickable || victim.id === BD4_BOT_ID) {
			await sendErrorMessage(channel, "You decided against it, you fear your victim's strength completely eclipses yours.");
			return false;
		}
	
		return true;
	}

	private async beginSharpening(channel: TextBasedChannel, sender: GuildMember): Promise<boolean> {
		if (this.sharpeningDate !== null) {
			await sendErrorMessage(channel, "Easy soldier, you are already sharpening your sword.");
			return false;
		}

		await sendMessage(channel, "You have begun sharpening your dull sword.");
		// Force end zach's cooldown so he can slay someone eventually
		await this.endCooldown(sender);

		this.sharpeningDate = new Date();

		return true;
	}
}

export default new SwordCommand(cmdConfig);

