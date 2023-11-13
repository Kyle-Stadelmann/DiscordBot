import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { Category } from "@discordx/utilities";
import { bdbot } from "../../app.js";
import { CommandCategory } from "../../types/command.js";
import { isQueueValid } from "../../util/index.js";

@Discord()
@Category(CommandCategory.Music)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class SeekCommand {
	@Slash({ name: "seek", description: "Go to a specified time in the current track", dmPermission: false })
	async run(
		@SlashOption({
			name: "time",
			description: "The time to seek to",
			required: true,
			type: ApplicationCommandOptionType.String,
		})
		timeStr: string,
		interaction: CommandInteraction
	): Promise<boolean> {
		const queue = bdbot.player.queues.resolve(interaction.guildId);
		if (!isQueueValid(queue) || !queue.currentTrack) {
			await interaction.reply("Music command failed. Please start a queue using the `play` command first!");
			return false;
		}

		const times = this.getSplitTimes(timeStr);

		if (!times) {
			await interaction.reply("Couldn't seek to specified time, check formatting");
			return false;
		}

		const time = this.getTime(times);

		await queue.node.seek(time);

		return true;
	}

	getSplitTimes(timeStr: string): number[] | null {
		const splitTimes: string[] = timeStr.split(":");
		let hadError = false;
		const times: number[] = [];

		splitTimes.forEach((time) => {
			const parsedTime = +time;
			if (Number.isNaN(parsedTime)) {
				hadError = true;
			} else {
				times.push(parsedTime);
			}
		});

		// Formats with more than 4 'time places' aren't supported
		if (hadError || times.length > 3) return null;
		return times;
	}

	getTime(times: number[]): number {
		let time = 0;
		const numc = times.length - 1;

		// seek(x) format
		if (numc === 0) {
			time += times[0] * 1000;
		}
		// seek(x:x) format
		else if (numc === 1) {
			time += times[0] * 60000;
			time += times[1] * 1000;
		}
		// seek(x:x:x) format
		else if (numc === 2) {
			time += times[0] * 3600000;
			time += times[1] * 60000;
			time += times[2] * 1000;
		}

		return time;
	}
}
