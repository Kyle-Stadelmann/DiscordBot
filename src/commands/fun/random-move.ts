/* eslint-disable no-await-in-loop */
import { Collection, Guild, GuildMember, Message, PermissionFlagsBits, StageChannel, TextBasedChannel, VoiceChannel } from "discord.js";
import { CommandConfig, Command } from "../../types/command.js";
import { getRandomElement, random, sendErrorMessage, sendMessage, sleep } from "../../util/index.js";

const cmdConfig: CommandConfig = {
	name: "randommove",
	description:
		"Exclusive command for admins that moves another admin to a random channel every 5 minutes for a random amount of time.",
	usage: `randomMove @admin`,
	examples: ["randomMove @Dualkim"],
	cooldownTime: 10 * 60 * 1000,
};

class RandomMoveCommand extends Command {
	public async run(msg: Message) {
		const victim = msg.mentions.members.first();
		const textChannel = msg.channel;
		const sender = msg.member;

		const error = await this.errorCheck(victim, textChannel, sender, msg.guild);
		if (error) return false;

		await sendMessage(textChannel, "Initiating start of randomMove...");

		const validChannels = this.getValidChannels(msg.guild, victim);

		await this.performRandomMoves(validChannels, victim, textChannel);

		await sendMessage(textChannel, `Fear not ${victim}, your randomMove has completed.`);

		return true;
	}

	private async errorCheck(victim: GuildMember, textChannel: TextBasedChannel, sender: GuildMember, guild: Guild) {
		if (victim == null) {
			await sendErrorMessage(textChannel, "Command was NOT successful, you must specify an admin on the server.");
			return true;
		}

		// If sender or victim isn't an admin, ignore this event
		// TODO: Migrate to command permission check
		if (!sender.permissions.has(PermissionFlagsBits.Administrator) || !victim.permissions.has(PermissionFlagsBits.Administrator)) {
			await sendErrorMessage(textChannel, "Command was NOT successful, you or your victim are not an admin.");
			return true;
		}

		// If sender isnt in a channel
		if (sender.voice.channel == null || sender.voice.channel === guild.afkChannel) {
			await sendErrorMessage(textChannel, "Command was NOT successful, you must be in a non-AFK channel.");
			return true;
		}

		// Test if victim is in a channel or not
		if (victim.voice.channel == null) {
			await sendErrorMessage(textChannel, "Command was NOT successful, your victim isn't in a channel.");
			return true;
		}

		return false;
	}

	// Gets all valid channels
	// (that are voice, another channel than current)
	private getValidChannels(guild: Guild, victim: GuildMember): (VoiceChannel | StageChannel)[] {
		const validChannels = guild.channels.cache.filter(
			(channel) => channel.isVoiceBased() && channel.id !== victim.voice.channel.id
		) as Collection<string, VoiceChannel | StageChannel>;

		return validChannels.toJSON();
	}

	// This function will take many minutes to complete
	private async performRandomMoves(
		validChannels: (VoiceChannel | StageChannel)[],
		victim: GuildMember,
		textChannel: TextBasedChannel
	) {
		let chanceToMove = 100;
		while (random(chanceToMove)) {
			// Sleep for 5 minutes
			await sleep(5 * 60 * 1000);

			const randomChannel = getRandomElement(validChannels);

			if (victim.voice.channel == null) {
				await victim.edit({ channel: randomChannel });
				await sendMessage(textChannel, `${victim} has been banished!`);
				chanceToMove /= 2;
			}
		}
	}
}

export default new RandomMoveCommand(cmdConfig);
