import { getUsersToRemind } from "csgo-predict-api";
import { EmbedBuilder, Guild, GuildMember } from "discord.js";
import { client } from "../app.js";
import { BD5_ID, CSGO_PREDICTION_IMG_URL, CS_PREDICTION_URL } from "../constants.js";
import { isNullOrUndefined } from "../util/general.js";

interface Reminder {
	firstMatchDate: Date;
	userIds: string[];
}

export const REPEAT_CS_REMINDER_CHECK_TIME_MS = 30 * 60 * 1000;
const HARDCODED_LEAGUE_ID = 3;
const REMINDER_TIME_MS = 10 * 60 * 60 * 1000;
const REMINDER_TEXT_CHANNEL = "1098109387819729027";

let lastRemindedMatchTime = new Date(0);

function createMembersToRemindList(userIds: string[], bd5: Guild): GuildMember[] {
	return userIds.flatMap((userId) => {
		const discordUserId = process.env[userId];
		if (isNullOrUndefined(discordUserId)) {
			// This user probably does not wish to be reminded
			return [];
		}

		return bd5.members.resolve(discordUserId);
	});
}

async function remindCSPlayers(userIds: string[], matchDate: Date) {
	const bd5 = await client.guilds.resolve(BD5_ID);
	const membersToRemind = createMembersToRemindList(userIds, bd5);

	if (membersToRemind.length === 0) {
		console.error("Couldn't remind cs-prediction players. No guild members found...");
		return;
	}

	const reminderChannel = bd5.channels.resolve(REMINDER_TEXT_CHANNEL);
	if (!reminderChannel.isTextBased()) {
		console.error("Couldn't remind cs-prediction players. Reminder channel isn't a text channel...");
		return;
	}

	const embed = new EmbedBuilder()
		.setTitle("Reminder to submit predictions for upcoming CS matches")
		.setURL(CS_PREDICTION_URL)
		.setThumbnail(CSGO_PREDICTION_IMG_URL)
		.setTimestamp(matchDate)
		.setDescription(membersToRemind.map((m) => m.toString()).join(""));

	await reminderChannel.send({ embeds: [embed] });
}

async function tryRemindCSPlayersHelper() {
	let reminder: Reminder | undefined;
	try {
		reminder = await getUsersToRemind(HARDCODED_LEAGUE_ID, process.env.CS_PREDICT_PASSWORD);
	} catch (e) {
		console.error(e);
		return;
	}

	const currDate = new Date();
	if (
		new Date(currDate.getTime() + REMINDER_TIME_MS) < reminder.firstMatchDate ||
		// We only want to remind once per batches of matches
		reminder.firstMatchDate.getTime() === lastRemindedMatchTime.getTime() ||
		reminder.userIds.length === 0
	) {
		return;
	}

	await remindCSPlayers(reminder.userIds, reminder.firstMatchDate);

	lastRemindedMatchTime = reminder.firstMatchDate;
}

export async function tryRemindCSPlayers() {
	try {
		await tryRemindCSPlayersHelper();
	} catch (e) {
		console.error(e);
	}
}
