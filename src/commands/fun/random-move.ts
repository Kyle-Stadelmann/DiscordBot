/* eslint-disable no-await-in-loop */
import {
	ApplicationCommandOptionType,
	Collection,
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
import { getRandomElement, random, sleep } from "../../util/index.js";
import { CooldownTime } from "../../types/cooldown-time.js";

@Discord()
@Category(CommandCategory.Fun)
@CooldownTime(10 * 60 * 1000)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class RandomMoveCommand {
	@Slash({
		name: "randommove",
		description:
			"Exclusive command for admins that moves another admin to a random channel every 5 minutes for a random amount of time",
		defaultMemberPermissions: "Administrator",
	})
	async run(
		@SlashOption({
			name: "user",
			description: "Your victim",
			required: false,
			type: ApplicationCommandOptionType.User,
		})
		user: User,
		interaction: CommandInteraction
	): Promise<boolean> {
		const { member, guild } = interaction;
		const sender = await guild.members.fetch(member.user.id);
		const victim = await guild.members.fetch(user.id);

		const hadError = await this.validateArgs(victim, interaction, sender, guild);
		if (hadError) return false;

		await interaction.reply("Initiating start of randomMove...");

		const validChannels = this.getValidChannels(guild, victim);

		await this.performRandomMoves(validChannels, victim, interaction);

		await interaction.reply(`Fear not ${victim}, your randomMove has completed.`);

		return true;
	}

	private async validateArgs(
		victim: GuildMember | undefined,
		interaction: CommandInteraction,
		sender: GuildMember,
		guild: Guild
	) {
		if (!victim) {
			await interaction.reply({
				content: "Command was NOT successful, you must specify an admin on the server.",
				ephemeral: true,
			});
			return true;
		}

		// If sender or victim isn't an admin, ignore this event
		// TODO: Migrate to command permission check
		if (
			!sender.permissions.has(PermissionFlagsBits.Administrator) ||
			!victim.permissions.has(PermissionFlagsBits.Administrator)
		) {
			await interaction.reply({
				content: "Command was NOT successful, you or your victim are not an admin.",
				ephemeral: true,
			});
			return true;
		}

		// If sender isnt in a channel
		if (sender.voice.channel == null || sender.voice.channel === guild.afkChannel) {
			await interaction.reply({
				content: "Command was NOT successful, you must be in a non-AFK channel.",
				ephemeral: true,
			});
			return true;
		}

		// Test if victim is in a channel or not
		if (victim.voice.channel == null) {
			await interaction.reply({
				content: "Command was NOT successful, your victim isn't in a channel.",
				ephemeral: true,
			});
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
		interaction: CommandInteraction
	) {
		let chanceToMove = 100;
		while (random(chanceToMove)) {
			// Sleep for 5 minutes
			await sleep(5 * 60 * 1000);

			const randomChannel = getRandomElement(validChannels);

			if (victim.voice.channel !== null) {
				await victim.edit({ channel: randomChannel });
				await interaction.channel.send(`${victim} has been banished!`);
				chanceToMove /= 2;
			}
		}
	}
}
