import axios from "axios";
import { EmbedBuilder, GuildMember, TextBasedChannel } from "discord.js";
import { ArgsOf, Discord, On } from "discordx";
import { client } from "../../app.js";
import { BD5_BOT_STUFF_CHANNEL_ID, BD5_DEV_SERVER_IDS } from "../../constants.js";
import {
	getRandomElement,
	hasHumans,
	isNullOrUndefined,
	isProdMode,
	random,
	sendErrorToDiscordChannel,
} from "../../util/index.js";

const GOOD_NIGHT_VARIATIONS = [
	"goot!",
	"goote!",
	"gooten!",
	"gute!",
	"guten!",
	"guten nacht!",
	"goodnight!",
	"good night!",
];

const KISS_CHANCE = 10;

const leftOnLog = new Map<GuildMember, Date>();

async function randomGifUrl(lmt, searchString): Promise<string> {
	const searchUrl = `https://tenor.googleapis.com/v2/search?key=${process.env.TENOR_API_KEY}&q=${searchString}&limit=${lmt}&random=true`;
	const { url } = (await axios.get(searchUrl)).data.results[0].media_formats.gif;

	return url;
}

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class GoodNight {
	@On({ event: "voiceStateUpdate" })
	private async tryGoodNight([oldState, newState]: ArgsOf<"voiceStateUpdate">) {
		// TODO: We need a guild config that allows us to use bot_stuff channels more generally
		if (!BD5_DEV_SERVER_IDS.includes(newState.guild.id)) return;

		const botStuffChannel = client.channels.resolve(BD5_BOT_STUFF_CHANNEL_ID) as TextBasedChannel;

		if (isNullOrUndefined(newState.channelId)) {
			const currTime = new Date();
			leftOnLog.set(newState.member, currTime);
			if ((currTime.getHours() >= 22 || currTime.getHours() <= 5) && !hasHumans(oldState.channel)) {
				const membersInLast15Mins: GuildMember[] = [];
				leftOnLog.forEach((lastLeftTime, member) => {
					if (currTime.getTime() - lastLeftTime.getTime() <= 15 * 60 * 1000) {
						membersInLast15Mins.push(member);
					}
				});

				let goodNightMsg = "";
				membersInLast15Mins.forEach((member) => {
					goodNightMsg += `${member.toString()} `;
				});

				const embed = new EmbedBuilder()
					.setTitle(getRandomElement(GOOD_NIGHT_VARIATIONS))
					.setDescription(goodNightMsg)
					.setColor(0x0);

				try {
					const gifUrl = random(KISS_CHANCE)
						? await randomGifUrl(1, "good night anime kiss")
						: await randomGifUrl(1, "good night anime");

					embed.setImage(gifUrl);

					await botStuffChannel.send({ embeds: [embed] });
				} catch (error) {
					if (isProdMode()) await sendErrorToDiscordChannel(error);
				}
			}
		}
	}
}
