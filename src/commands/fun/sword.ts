import { ApplicationCommandOptionType, CommandInteraction, User } from "discord.js";
import { Discord, Guild, SlashOption } from "discordx";
import { Category } from "@discordx/utilities";
import { ZACH_ID, BD4_BOT_ID, BD5_DEV_SERVER_IDS } from "../../constants.js";
import { CommandCategory } from "../../types/command.js";
import { CooldownTime } from "../../types/cooldown-time.js";

const MIN_SHARPEN_TIME = 30 * 60 * 1000;

@Discord()
@Category(CommandCategory.Fun)
@CooldownTime(7 * 24 * 60 * 60 * 1000)
@Guild(BD5_DEV_SERVER_IDS)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class SwordCommand {
	// TODO: Store as snapshotted state somehow
	private sharpeningDate: Date = null;

	// @Slash({name: "sword", description: "Exclusive command to Zach. Once a week he can begin sharpening his sword. He can sharpen it for up to a week before attempting to annihilate someone. The longer the sharpening time, the higher the potency!", dmPermission: false})
	async run(
		@SlashOption({
			name: "target",
			description: "The target of Zach's annihilation",
			required: false,
			type: ApplicationCommandOptionType.User
		})
		victimUser: User | undefined,
		interaction: CommandInteraction
	): Promise<boolean> {
		const date = new Date();

		if (interaction.user.id !== ZACH_ID) {
			await interaction.reply("Alas, only zach can sharpen his sword.");
			return false;
		}

		if (!victimUser) {
			return this.beginSharpening(interaction);
		}

		// Make sure he sharpened for enough time
		if (this.sharpeningDate == null || this.sharpeningDate.getTime() + MIN_SHARPEN_TIME > date.getTime()) {
			await interaction.reply("Remain patient soldier, your sword is too dull!");
			return false;
		}

		const victimMember = await interaction.guild.members.fetch(victimUser.id);

		if (!victimMember.kickable || victimMember.id === BD4_BOT_ID) {
			await interaction.reply("You decided against it, you fear your victim's strength completely eclipses yours.");
			return false;
		}

		return true;
	}

	private async beginSharpening(interaction: CommandInteraction): Promise<boolean> {
		if (this.sharpeningDate !== null) {
			await interaction.reply("Easy soldier, you are already sharpening your sword.");
			return false;
		}

		await interaction.reply("You have begun sharpening your dull sword.");

		// Force end zach's cooldown so he can slay someone eventually
		// await this.endCooldown(interaction.member);

		this.sharpeningDate = new Date();

		return true;
	}
}
