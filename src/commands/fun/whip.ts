// Awaits in loops are critical to the functionality of this command
/* eslint-disable no-await-in-loop */
import {
	ApplicationCommandOptionType,
	ChannelType,
	CommandInteraction,
	Guild,
	GuildMember,
	PermissionFlagsBits,
	StageChannel,
	User,
	VoiceChannel,
} from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { Category } from "@discordx/utilities";
import { CommandCategory } from "../../types/command.js";
import { deleteVoiceChannel, sleep } from "../../util/index.js";
import { CooldownTime } from "../../types/cooldown-time.js";
import { bdbot } from "../../app.js";

const NUM_CHANNELS_FLAILED = 10;

const WAIT_TIME = 20 * 1000;

// Amount of time to put whole guild on cooldown while the flailing is occuring
// Note: We end the cooldown manually after cmd is done too
const GUILD_CD_TIME = 60 * 1000;

@Discord()
@Category(CommandCategory.Fun)
@CooldownTime(60 * 60 * 1000)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class WhipCommand {
	@Slash({name: "whip", description: "Smacks your target a large amount of channels down", dmPermission: false, defaultMemberPermissions: "Administrator"})
	async whip(
		@SlashOption({
			name: "target",
			description: "The target of your flail",
			required: true,
			type: ApplicationCommandOptionType.User
		})
		victimUser: User,
		interaction: CommandInteraction
	): Promise<boolean> {
		const { guild } = interaction;
		const victimMember = await guild.members.fetch(victimUser.id);
		const senderMember = await guild.members.fetch(interaction.user.id);

		const error = await this.hadError(victimMember, senderMember, interaction);
		if (error) return false;
		
		await bdbot.putOnGuildCooldown(guild.id, "whip", GUILD_CD_TIME);

		const originalChannel = victimMember.voice.channel;
		// Voice channels iterator in order of position
		const voiceChannels = this.getValidVoiceChannels(guild, victimMember);

		// Perform whip, gather temp channels to be deleted
		const tempChannels = await this.flail(voiceChannels, victimMember, guild);

		// Wait some time for everyone to comprehend what happened to this poor soul
		await sleep(WAIT_TIME);

		await this.cleanup(victimMember, tempChannels, originalChannel);

		await bdbot.endGuildCooldown(guild.id, "whip");

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

	private async hadError(victim: GuildMember, sender: GuildMember, interaction: CommandInteraction): Promise<boolean> {
		if (sender.voice.channel == null || sender.voice.channelId !== victim.voice.channelId) {
			await interaction.reply("Command was NOT successful, your target isn't close enough (not in the same voice channel as you)");
			return true;
		}

		return false;
	}
}
