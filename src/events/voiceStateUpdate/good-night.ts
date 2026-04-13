import axios from "axios";
import { EmbedBuilder, GuildMember, TextChannel } from "discord.js";
import { ArgsOf, Discord, Guard, On } from "discordx";
import { client } from "../../app.js";
import { BD5_BOT_STUFF_CHANNEL_ID } from "../../constants.js";
import { getRandomElement, hasHumans, isProdMode, random, sendErrorToDiscordChannel } from "../../util/index.js";
import { BD5Only } from "../../util/guards.js";

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

interface TenorResult {
	media_formats: {
		gif: {
			url: string;
		};
	};
}

interface TenorResponse {
	results: TenorResult[];
}

async function randomGifUrl(lmt: number, searchString: string): Promise<string> {
	const searchUrl = `https://tenor.googleapis.com/v2/search?key=${process.env.TENOR_API_KEY}&q=${searchString}&limit=${lmt}&random=true`;
	const response = await axios.get<TenorResponse>(searchUrl);
	const { url } = response.data.results[0].media_formats.gif;

	return url;
}

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class GoodNight {
	@Guard(BD5Only)
	@On({ event: "voiceStateUpdate" })
	private async tryGoodNight([oldState, newState]: ArgsOf<"voiceStateUpdate">) {
		if (newState.member.user.bot) return;

		// TODO: We need a guild config that allows us to use bot_stuff channels more generally
		const botStuffChannel = client.channels.resolve(BD5_BOT_STUFF_CHANNEL_ID) as TextChannel;

		if (newState.channelId == null) {
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
					.setColor(0x0)
					.setDescription(goodNightMsg);

				try {
					const gifUrl = random(KISS_CHANCE)
						? await randomGifUrl(1, "good night anime kiss")
						: await randomGifUrl(1, "good night anime");

					embed.setImage(gifUrl);

					await botStuffChannel.send({ embeds: [embed] });
				} catch (error) {
					if (isProdMode()) await sendErrorToDiscordChannel(error);
					else console.error(error);
				}
			}
		}
	}
}
