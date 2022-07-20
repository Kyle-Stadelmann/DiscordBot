import { Collection, Message, StageChannel, VoiceChannel } from "discord.js";
import { CommandConfig, Command } from "../../types/command.js";
import { sendErrorMessage, sendMessage } from "../../util/index.js";

const cmdConfig: CommandConfig = {
	name: "rally",
	description: "Brings all users connected to voice to the voice channel that the user is in.",
	usage: `rally`,
};

class RallyCommand extends Command {
	public async run(msg: Message, args: string[]): Promise<boolean> {
		const textChannel = msg.channel;
		const voiceChannel = msg.member.voice.channel;

		// Confirm that user called from a voice channel
		if (!voiceChannel) {
			await sendErrorMessage(
				textChannel,
				"Rally failed, caller is not in a valid voice channel"
			);
			return false;
		}

		// List of channels that can be taken from
		const validChannels = new Collection<string, VoiceChannel | StageChannel>();
		// Pull to hidden channels or not
		let pullToHidden = false;
		// Whether or not user's channel is public
		const publicChannel = voiceChannel.permissionsFor(msg.guild.roles.everyone).has("VIEW_CHANNEL");
		// Role(s) getting pulled (empty collection if none specified)
		const rolesToCall = msg.mentions.roles;

		// Rally to me! (pull into a non-public channel)
		if (args[0] === "to" && args[1] === "me") {
			pullToHidden = true;
		}

		// Check if called from valid voice channel
		if (voiceChannel === msg.guild.afkChannel || (!publicChannel && !pullToHidden)) {
			await sendErrorMessage(
				textChannel,
				"Rally failed, caller is not in a valid voice channel"
			);
			return false;
		}

		// Go through each voice channel and establish whether or not it's valid
		msg.guild.channels.cache.forEach((userChannel) => {
			const perm = userChannel.permissionsFor(msg.guild.roles.everyone).has("VIEW_CHANNEL");
			if (
				!(msg.guild.afkChannel && userChannel.id === msg.guild.afkChannel.id) &&
				userChannel.id !== msg.member.voice.channel.id &&
				userChannel.isVoice() &&
				perm
			) {
				validChannels.set(userChannel.id, userChannel);
			}
		});

		// Check for a valid channel
		if (validChannels.size <= 0) {
			await sendErrorMessage(textChannel, "Rally failed, no valid voice channels");
			return false;
		}

		// Check for a valid member (rally is successful as long as there is one member in one valid channel)
		const areValidMembers = !validChannels.some((vChannel) =>
			vChannel.members.some((member) => {
				if (rolesToCall.size === 0) return true;

				return rolesToCall.some((membRole) => member.roles.cache.has(membRole.id));
			})
		);

		if (areValidMembers) {
			await sendErrorMessage(
				textChannel,
				"Rally failed, no users to Rally with"
			);
			return false;
		}

		// Don't broadcast if target channel is hidden
		if (!pullToHidden) {
			await sendMessage(textChannel, `Initiating rally on ${voiceChannel.name}.`);
		}

		// Move all valid users to caller's voice channel
		validChannels.forEach((userChannel) => {
			userChannel.members.forEach((member) => {
				// kyle made this logic and he is a GENIUS (actually mindblowing)
				// size of roles list && whether any entry in roles list overlaps with user's roles
				if (!(rolesToCall.size > 0 && !rolesToCall.some((userRole) => member.roles.cache.has(userRole.id)))) {
					console.log(`Moving user with ID: ${member.id}`);
					member.edit({ channel: msg.member.voice.channel }).catch((error) => {
						console.error(error);
					});
				}
			});
		});

		// yay
		await sendMessage(textChannel, "Rally completed!");

		return true;
	}
}

export default new RallyCommand(cmdConfig);
