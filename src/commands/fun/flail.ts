// Awaits in loops are critical to the functionality of this command
/* eslint-disable no-await-in-loop */
import {
	ChannelType,
	Guild,
	GuildMember,
	Message,
	PermissionFlagsBits,
	StageChannel,
	TextBasedChannel,
	VoiceChannel,
} from "discord.js";
import { Command, CommandCategory, CommandConfig } from "../../types/command.js";
import { deleteVoiceChannel, sendErrorMessage, sleep } from "../../util/index.js";

const NUM_CHANNELS_FLAILED = 10;

const WAIT_TIME = 20 * 1000;

// Amount of time to put whole guild on cooldown while the flailing is occuring
// Note: We end the cooldown manually after cmd is done too
const GUILD_CD_TIME = 60 * 1000;

const cmdConfig: CommandConfig = {
	name: "flail",
	description: "Brigitte lends you her flail to hit your target a large amount of channels down",
	category: CommandCategory.Fun,
	usage: `flail @user`,
	cooldownTime: 60 * 60 * 1000,
	aliases: ["whip"],
};

class FlailCommand extends Command {
	public async run(msg: Message): Promise<boolean> {
		const victim = msg.mentions.members.first();
		const { guild } = msg;

		const error = await this.errorCheck(victim, msg.member, msg.channel);
		if (error) return false;

		await this.putOnGuildCooldown(msg.guild, GUILD_CD_TIME);

		const originalChannel = victim.voice.channel;
		// Voice channels iterator in order of position
		const voiceChannels = this.getValidVoiceChannels(guild, victim);

		// Perform flail, gather temp channels to be deleted
		const tempChannels = await this.flail(voiceChannels, victim, guild);

		// Wait some time for everyone to comprehend what happened to this poor soul
		await sleep(WAIT_TIME);

		await this.cleanup(victim, tempChannels, originalChannel);

		await this.endGuildCooldown(msg.guild);

		return true;
	}

	private async cleanup(
		victim: GuildMember,
		tempChannels: (VoiceChannel | StageChannel)[],
		originalChannel: VoiceChannel | StageChannel
	) {
		const victimChannel = victim.voice.channel;
		if (tempChannels.includes(victimChannel) && originalChannel.isVoiceBased()) {
			await victim.voice.setChannel(originalChannel);
		}
		tempChannels.forEach((channel) => deleteVoiceChannel(channel));
	}

	private async flail(
		voiceChannels: IterableIterator<VoiceChannel | StageChannel>,
		victim: GuildMember,
		guild: Guild
	): Promise<VoiceChannel[]> {
		const tempChannels: VoiceChannel[] = [];

		for (let i = 0; i < NUM_CHANNELS_FLAILED; i += 1) {
			// Next channel to move victim to is the next available channel below current one in guild
			const nextIterator = voiceChannels.next();
			let nextChannel = nextIterator.value;

			const victimChannel = victim.voice.channel;
			// Check to make sure victim hasn't left channel while moving was happening
			if (victimChannel === null) break;

			// If there are no available channels, create a new temp one
			if (nextIterator.done) {
				nextChannel = await guild.channels.create({
					name: "rekt",
					type: ChannelType.GuildVoice,
					position: victimChannel.position + 1,
					parent: victimChannel.parent,
				});
				tempChannels.push(nextChannel);
			}

			try {
				if (victim.voice.channel === null) break;
				await victim.voice.setChannel(nextChannel);
			} catch (err) {
				break;
			}
			// TODO: Test the best number to put here
			await sleep(100);
		}

		return tempChannels;
	}

	private getValidVoiceChannels(guild: Guild, victim: GuildMember): IterableIterator<VoiceChannel | StageChannel> {
		const currPos = victim.voice.channel.position;

		const validChannels = guild.channels.cache
			.filter((channel) => {
				if (!channel.isVoiceBased()) return false;
				if (guild.afkChannel === channel) return false;

				const everyonePermissions = guild.roles.everyone.permissionsIn(channel);
				const visibleToAll = everyonePermissions.has(PermissionFlagsBits.ViewChannel);

				// Only capture visible, higher position channels
				return channel.position > currPos && visibleToAll;
			})
			.sort(
				(ch1, ch2) =>
					(ch1 as VoiceChannel | StageChannel).position - (ch2 as VoiceChannel | StageChannel).position
			)
			.values();

		return validChannels as IterableIterator<VoiceChannel | StageChannel>;
	}

	private async errorCheck(victim: GuildMember, sender: GuildMember, channel: TextBasedChannel): Promise<boolean> {
		if (victim == null) {
			await sendErrorMessage(channel, "Command was NOT successful, you must specify an victim.");
			return true;
		}

		const permissions = sender.permissionsIn(sender.voice.channel);
		// If sender isn't an admin, ignore this event
		// TODO: Migrate to command permission check
		if (!permissions.has(PermissionFlagsBits.Administrator)) {
			await sendErrorMessage(channel, "Command was NOT successful, Brigitte only lends her flail to admins.");
			return true;
		}

		if (sender.voice.channel == null || sender.voice.channelId !== victim.voice.channelId) {
			await sendErrorMessage(
				channel,
				"Command was NOT successful, your target isn't close enough (not in the same voice channel as you)"
			);
			return true;
		}

		return false;
	}
}

export default new FlailCommand(cmdConfig);
