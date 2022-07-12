// Await in a loop is critical to the functionality of this command
/* eslint-disable no-await-in-loop */
import { GuildChannel, Message, VoiceChannel } from "discord.js";
import { NUM_CHANNELS_WHIPPED } from "../../constants";
import { Command } from "../../interfaces/command";
import { CommandConfig } from "../../types/types";
import { sleep } from "../../util/sleep";

const cmdConfig: CommandConfig = {
	name: "flail",
	description: "Brigitte lends you her flail to hit your target a large amount of channels down",
	usage: `flail @user`,
}

class FlailCommand extends Command {
	public async run(msg: Message): Promise<boolean> {
		const sender = msg.member;
		const victim = msg.mentions.members.first();
		const originalChannel = victim.voice.channel;
		const permissions = sender.permissionsIn(sender.voice.channel);
		const textChannel = msg.channel;

		if (victim == null) {
			await this.sendErrorMessage(textChannel, "Command was NOT successful, you must specify an victim.");
			return false;
		}
	
		// If sender isn't an admin, ignore this event
		if (!permissions.has("ADMINISTRATOR")) {
			await this.sendErrorMessage(textChannel, "Command was NOT successful, Brigitte only lends her flail to admins.");
			return false;
		}
	
		if (sender.voice.channel == null || sender.voice.channelId !== victim.voice.channelId) {
			await this.sendErrorMessage(
				textChannel, "Command was NOT successful, your target isn't close enough (not in the same voice channel as you)"
			);
			return false;
		}
	
		const currPos = victim.voice.channel.position;
	
		// Voice channels iterator in order of position
		const voiceChannels = msg.guild.channels.cache
			.filter((channel) => {
				if (channel.type !== "GUILD_VOICE") return false;
				if (msg.guild.afkChannel === channel) return false;

				const everyonePermissions = msg.guild.roles.everyone.permissionsIn(channel);
				const visibleToAll = everyonePermissions.has("VIEW_CHANNEL");

				// Only capture visible, higher position channels
				return channel.position > currPos && visibleToAll;
			})
			.sort((ch1, ch2) => (ch1 as GuildChannel).position - (ch2 as GuildChannel).position)
			.values();
	
		const tempChannels: VoiceChannel[] = [];
	
		for (let i = 0; i < NUM_CHANNELS_WHIPPED; i+=1) {
			// Next channel to move victim to is the next available channel below current one in guild
			const nextIterator = voiceChannels.next();
			let nextChannel = nextIterator.value;
	
			const victimChannel = victim.voice.channel;
			// Check to make sure victim hasn't left channel while moving was happening
			if (victimChannel === null) break;

			// If there are no available channels, create a new temp one
			if (nextIterator.done) {
				nextChannel = await msg.guild.channels.create(
					"rekt", 
					{ type: "GUILD_VOICE", position: victimChannel.position + 1 }
				);
				tempChannels.push(nextChannel);
			}
	
			try {
				if (victim.voice.channel === null) break;
				await victim.voice.setChannel(nextChannel);
			} catch (err) {
				break;
			}
			await sleep(100);
		}
	
		// Wait for some time for everyone to comprehend what happened to this poor soul
		await sleep(20000);
	
		const victimChannel = victim.voice.channel;
		// Extra guild voice channel checks necessary for stage voice channels edgecase
		if (victimChannel.type === "GUILD_VOICE" && tempChannels.includes(victimChannel) && originalChannel.type === "GUILD_VOICE") {
			await victim.voice.setChannel(originalChannel);
		}
		tempChannels.forEach((channel) => channel.delete());
	
		return true;
	}
}

export default new FlailCommand(cmdConfig);