/* eslint-disable no-await-in-loop */
import { Collection, Guild, GuildMember, Message, TextBasedChannels, TextChannel, VoiceChannel } from "discord.js";
import { Command } from "../interfaces/command";
import { CommandConfig } from "../types/types";
import { getRandomElement, random, sleep } from "../util";

const cmdConfig: CommandConfig = {
	name: "randommove",
	description:
		"Exclusive command for admins that moves another admin to a random channel every 5 minutes for a random amount of time.",
	usage: `randomMove @admin`,
	examples: ["randomMove @Dualkim"],
};

class RandomMoveCommand extends Command {
	public async run(msg: Message) {
		const victim = msg.mentions.members.first();
		const textChannel = msg.channel;
		const sender = msg.member;
	
		const error = await this.errorCheck(victim, textChannel, sender);
		if (error) return false;
	
		await this.sendMessage(textChannel, "Initiating start of randomMove...");
	
		const validChannels = this.getValidChannels(msg.guild, victim);
	
		let chanceToMove = 100;
		while (random(chanceToMove)) {
			// Sleep for 5 minutes
			await sleep(5 * 60 * 1000);
	
			const randomChannel = getRandomElement(validChannels);
	
			if (victim.voice.channel == null) {
				await victim.edit({ channel: randomChannel });
				await this.sendMessage(textChannel, `${victim} has been banished!`);
				chanceToMove /= 2;
			}
		}
	
		await this.sendMessage(textChannel, `Fear not ${victim}, your randomMove has completed.`);
	
		return true;
	}

	private async errorCheck(victim: GuildMember, textChannel: TextBasedChannels, sender: GuildMember) {
		if (victim == null) {
			await this.sendErrorMessage(textChannel, "Command was NOT successful, you must specify an admin on the server.");
			return true;
		}
	
		// If sender or victim isn't an admin, ignore this event
		if (!sender.permissions.has("ADMINISTRATOR") || !victim.permissions.has("ADMINISTRATOR")) {
			await this.sendErrorMessage(textChannel, "Command was NOT successful, you or your victim are not an admin.");
			return true;
		}
	
		// If sender isnt in a channel
		if (sender.voice.channel == null || sender.voice.channel === msg.guild.afkChannel) {
			await this.sendErrorMessage(textChannel, "Command was NOT successful, you must be in a non-AFK channel.");
			return true;
		}
	
		// Test if victim is in a channel or not
		if (victim.voice.channel == null) {
			await this.sendErrorMessage(textChannel, "Command was NOT successful, your victim isn't in a channel.");
			return true;
		}

		return false;
	}

	// Gets all valid channels
	// (that are voice, another channel than current)
	private getValidChannels(guild: Guild, victim: GuildMember) {
		const validChannels = 
			guild.channels.cache.filter((channel) => 
					(channel.isVoice() && channel.id !== victim.voice.channel.id));

		return validChannels.toJSON();
	}
}

export default new RandomMoveCommand(cmdConfig);