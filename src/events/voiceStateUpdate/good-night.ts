import axios from "axios";
import { EmbedBuilder, GuildMember, TextBasedChannel } from "discord.js";
import { ArgsOf, Discord, On } from "discordx";
import { client } from "../../app.js";
import { BD5_BOT_STUFF_CHANNEL_ID, BD5_DEV_SERVER_IDS, DEV_SERVER_TESTING_CHANNEL_1_ID } from "../../constants.js";
import { getRandomElement, hasHumans, isNullOrUndefined, random } from "../../util/index.js";

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

/*
  on a voice status update{

    if (user disconnects){

      const leftOnLog = map of user to the time of disconnect

      if (between 22:00-06:00 && channel has no humans){

        const last15Mins = users who have disconnected within the last 15 minutes (calculated from leftOnLog)
        let goodNightMsg = ''

        last15Mins.forEach(user => {
          goodNightMsg += `${user.toString()} `
        })

        goodNightMsg += '\n'
        goodNightMsg += randomArrayElement(goodNightVariations)

        if(kissChance){
          goodNightMsg += 'good night anime kiss' tenor query
        } else {
          goodNightMsg += 'good night anime
        }
        await #bot-stuff.send(goodNightMsg)
      }
    }
  }
*/

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

		// const botStuffChannel = client.channels.resolve(BD5_BOT_STUFF_CHANNEL_ID) as TextBasedChannel;
		const test1Channel = client.channels.resolve(DEV_SERVER_TESTING_CHANNEL_1_ID) as TextBasedChannel;

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

					// await botStuffChannel.send({ embeds: [embed] });
					await test1Channel.send({ embeds: [embed] });
				} catch (error) {
					console.error(error);
				}
			}
		}
	}
}
