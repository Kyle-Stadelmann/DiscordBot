// eslint-disable-next-line max-classes-per-file
import { GuildMember, Interaction, Message, MessageActionRow, MessageButton } from "discord.js";
import type { ButtonInteraction } from "discord.js";
import { Command, CommandConfig } from "../../types/command.js";
import { OWHEN_ROLE_ID, SKOWHEN_ROLE_ID, VALHEN_ROLE_ID, WHITE_CHECK_MARK, X_MARK } from "../../constants.js";
import { sendErrorMessage } from "../../util/message_channel.js";
import { PlayersContainer } from "../../types/containers/players_container.js";
import { client } from "../../app.js";

const cmdConfig: CommandConfig = {
	name: "hen",
	description: "Starts a 'queue' for a specified game.",
	usage: `hen @game-role`,
	examples: ["hen @skowhen", "hen @owhen"],
	aliases: ["startQueue"],
};

const supportedRolesStr = "*skowhen*, *owhen*, *valhen*";
// Role id -> number of players
const playersPerGameMap = new Map<string, number>();
playersPerGameMap.set(SKOWHEN_ROLE_ID, 5);
playersPerGameMap.set(OWHEN_ROLE_ID, 6);
playersPerGameMap.set(VALHEN_ROLE_ID, 5);
playersPerGameMap.set("826313136259858472", 2);

const joinBtnId = "startBtnJ";
const leaveBtnId = "startBtnL";

// Keep players state in this file, since it's not needed elsewhere
// In memory container, not backed by db since its somewhat unnecessary and we
// have a limited number of tables unfortunately.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const playersContainer = new PlayersContainer();

class StartCommand extends Command {
	public async run(msg: Message): Promise<boolean> {
		if (!(await this.validateCmd(msg))) return false;

		const { displayName } = msg.member;
		const role = msg.mentions.roles.first();
		const joinCustomId = `${joinBtnId}-${msg.guildId}-${role.id}`;
		const leaveCustomId = `${leaveBtnId}-${msg.guildId}-${role.id}`;

		const joinBtn = new MessageButton()
			.setLabel("Join")
			.setEmoji(WHITE_CHECK_MARK)
			.setStyle("PRIMARY")
			.setCustomId(joinCustomId);

		const leaveBtn = new MessageButton()
			.setLabel("Leave")
			.setEmoji(X_MARK)
			.setStyle("PRIMARY")
			.setCustomId(leaveCustomId);

		const msgActionRow = new MessageActionRow().addComponents([joinBtn, leaveBtn]);

		playersContainer.clearQueue(msg.guildId, role.id);
		playersContainer.addPlayer(msg.guildId, msg.author.id, role.id);

		const maxPlayers = playersPerGameMap.get(role.id);
		await msg.reply({
			components: [msgActionRow],
			content: `${displayName} has initiated a ${role.name}. Number of players ${1}/${maxPlayers}`,
		});

		return true;
	}

	private async validateCmd(msg: Message): Promise<boolean> {
		const roleId = msg.mentions?.roles?.firstKey();
		if (!roleId) {
			await sendErrorMessage(msg.channel, "No game role specified.");
			return false;
		}

		if (!playersPerGameMap.has(roleId)) {
			await sendErrorMessage(
				msg.channel,
				`Invalid game role specified. Currently supported roles: ${supportedRolesStr}`
			);
			return false;
		}

		return true;
	}
}

// CustomId for start-btn will be of the form:
// "${btnId}-guildId-roleId"
// Returns [guildId, roleId]
function parseBtnId(customId: string): [string, string] {
	const parts = customId.split("-");
	return [parts[1], parts[2]];
}

async function joinQueue(interaction: ButtonInteraction, guildId: string, userId: string, roleId: string) {
	let players = playersContainer.getPlayers(guildId, roleId);
	const maxPlayers = playersPerGameMap.get(roleId);

	// TODO: Hopefully this cast won't be needed in v14 of discord js???
	const { displayName } = interaction.member as GuildMember;
	const roleName = client.guilds.resolve(guildId).roles.resolve(roleId).name;

	if (players.length === maxPlayers) {
		await interaction.reply({
			content:
				"Sorry, the max number of players for this queue has been reached. Please wait or ask to switch with another player.",
			ephemeral: true,
		});
	} else {
		playersContainer.addPlayer(guildId, userId, roleId);

		players = playersContainer.getPlayers(guildId, roleId);
		await interaction.reply(
			`${displayName} has joined the ${roleName} queue. Number of players ${players.length}/${maxPlayers}`
		);
		if (players.length === maxPlayers) {
			const tagPlayers = players.map((player) => player.toString()).join("\n");
			await interaction.followUp(
				`Max players for ${roleName} has been reached\n\n${[tagPlayers]}\n\nGet ready for ${roleName}.`
			);
			playersContainer.clearQueue(guildId, roleId);
		}
	}
}

client.on("interactionCreate", async (interaction: Interaction) => {
	try {
		if (!interaction.isButton()) return;
		const { customId } = interaction;

		if (customId.startsWith(joinBtnId)) {
			const [guildId, roleId] = parseBtnId(customId);
			const userId = interaction.user.id;

			if (playersContainer.hasPlayer(guildId, userId, roleId)) {
				await interaction.reply({ content: "You've already joined the queue!", ephemeral: true });
			} else {
				await joinQueue(interaction, guildId, userId, roleId);
			}
		} else if (customId.startsWith(leaveBtnId)) {
			const [guildId, roleId] = parseBtnId(customId);
			const userId = interaction.user.id;

			// TODO: Hopefully this cast won't be needed in v14 of discord js???
			const { displayName } = interaction.member as GuildMember;
			const roleName = client.guilds.resolve(guildId).roles.resolve(roleId).name;

			if (playersContainer.hasPlayer(guildId, userId, roleId)) {
				playersContainer.removePlayer(guildId, userId, roleId);

				const numPlayers = playersContainer.getPlayers(guildId, roleId).length;
				const maxPlayers = playersPerGameMap.get(roleId);

				await interaction.reply(
					`${displayName} left the ${roleName} queue. Number of players ${numPlayers}/${maxPlayers}`
				);
			} else {
				await interaction.reply({ content: "You haven't joined this queue!", ephemeral: true });
			}
		}
	} catch (e) {
		console.error(e);
	}
});

export default new StartCommand(cmdConfig);
