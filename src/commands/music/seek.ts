import { Message } from "discord.js";
import { bdbot } from "../../app.js";
import { Command, CommandCategory, CommandConfig } from "../../types/command.js";
import { sendErrorMessage, sendMessage } from "../../util/message-channel.js";
import { isQueueValid } from "../../util/music-helpers.js";

const cmdConfig: CommandConfig = {
	name: "seek",
	description: "Go to a specified time in the current track",
	category: CommandCategory.Music,
	usage: `seek [Time]`,
	examples: [`seek 5`, `seek 93`, `seek 2:39`, `seek 1:11:11`],
};

// queue.seek takes in time as millseconds
class SeekCommand extends Command {
	public async run(msg: Message, args: string[]): Promise<boolean> {
		const queue = bdbot.player.queues.resolve(msg.guildId);
		if (!isQueueValid(queue)) {
			await sendErrorMessage(
				msg.channel,
				"Music command failed. Please start a queue using the `play` command first!"
			);
			return false;
		}

		const np = queue.currentTrack;

		let times: string[];
		if (args[0]) {
			times = args[0].split(":");
		} else return false;

		const numc = times.length - 1;
		let time = 0;

		if (np) {
			// seek(x) format
			if (numc === 0) {
				await queue.node.seek(parseInt(args[0], 10) * 1000);
			}
			// seek(x:x) format
			else if (numc === 1) {
				try {
					time += parseInt(times[0], 10) * 60000;
					time += parseInt(times[1], 10) * 1000;
					await queue.node.seek(time);
				} catch (error) {
					await sendMessage(msg.channel, "Can't seek to specified time, check formatting");
					return false;
				}
			}
			// seek(x:x:x) format
			else if (numc === 2) {
				try {
					time += parseInt(times[0], 10) * 3600000;
					time += parseInt(times[1], 10) * 60000;
					time += parseInt(times[2], 10) * 1000;
					await queue.node.seek(time);
				} catch (error) {
					await sendMessage(msg.channel, "Can't seek to specified time, check formatting");
					return false;
				}
			}
			// bad input
			else {
				await sendMessage(msg.channel, "Can't seek to specified time, check formatting");
				return false;
			}
		}

		return true;
	}
}

export default new SeekCommand(cmdConfig);
