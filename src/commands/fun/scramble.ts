import { Guild, Message, StageChannel, VoiceChannel } from "discord.js";
import { Command, CommandConfig } from "../../types/command";
import { getRandomElement, sendErrorMessage, sendMessage } from "../../util";

const cmdConfig: CommandConfig = {
	name: "scramble",
	description: "Sends everyone in your channel to a random channel.",
	usage: `scramble`,
	cooldownTime: 60 * 60 * 1000,
};

class ScrambleCommand extends Command {
	public async run(msg: Message): Promise<boolean> {
		const textChannel = msg.channel;
		const startChannel = msg.member.voice.channel;

		if (!startChannel || msg.guild.afkChannel === startChannel) {
			await sendErrorMessage(textChannel, "Scramble failed because you are not in a valid voice channel!");
			return false;
		}

		const validChannels = this.getValidChannels(msg.guild, startChannel);
		if (validChannels.length === 0) {
			await sendErrorMessage(textChannel, "Scramble failed because there are no valid, visible voice channels.");
			return false;
		}

		await sendMessage(textChannel, `Initiating channel scramble on *${startChannel.name}*.`);

		await this.moveChannelMembers(startChannel, validChannels);

		await sendMessage(textChannel, "Channel scramble completed!");

		return true;
	}

	private async moveChannelMembers(
		startChannel: VoiceChannel | StageChannel,
		destinationChannels: (VoiceChannel | StageChannel)[]
	) {
		const channelMembers = startChannel.members.toJSON();

		const promises = channelMembers.flatMap((victim) => {
			const randomChannel = getRandomElement(destinationChannels);
			if (victim.voice.channel) {
				return [victim.edit({ channel: randomChannel })];
			}
			return [];
		});
		await Promise.all(promises);
	}

	// Gets all valid channels
	// (channels that are voice, another channel than current, that everyone can see, and that aren't afk)
	private getValidChannels(guild: Guild, voiceChannel: VoiceChannel | StageChannel): (VoiceChannel | StageChannel)[] {
		const validChannels: (VoiceChannel | StageChannel)[] = [];

		guild.channels.cache.forEach((channel) => {
			const notAfkChannel = guild.afkChannel !== channel;
			const perm = channel.permissionsFor(guild.roles.everyone).has("VIEW_CHANNEL");
			if (channel.isVoice() && channel.id !== voiceChannel.id && perm && notAfkChannel) {
				validChannels.push(channel);
			}
		});

		return validChannels;
	}
}

export default new ScrambleCommand(cmdConfig);
