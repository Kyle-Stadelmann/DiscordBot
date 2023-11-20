import { GuildMember, VoiceBasedChannel } from "discord.js";
import { ArgsOf, Discord, On } from "discordx";

const goodNightVariations = [
	"goot!",
	"goote!",
	"gooten!",
	"gute!",
	"guten!",
	"guten nacht!",
	"goodnight!",
	"good night!",
];

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

async function hasHumans(channel: VoiceBasedChannel): Promise<boolean> {
	// trivial case
	if (channel.members.size === 0) {
		return false;
	}

	// eslint-disable-next-line consistent-return
	channel.members.forEach((member) => {
		if (!member.user.bot) return true;
	});
	return false;
}
@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class PeopleThemes {
	@On({ event: "voiceStateUpdate" })
	private async tryGoodNight([, newState]: ArgsOf<"voiceStateUpdate">) {
		if (newState.channelId === null || typeof newState.channelId === "undefined") {
			const currTime = new Date();
			leftOnLog.set(newState.member, currTime); // TODO member might need to key as newState.member.id if newState.member doesn't point to memory location
			if ((currTime.getHours() >= 22 || currTime.getHours() <= 5) && !hasHumans(newState.channel)) {
				const membersInLast15Mins: GuildMember[] = [];
				leftOnLog.forEach((lastLeftTime, member) => {
					if (currTime.getTime() - lastLeftTime.getTime() >= 15 * 60 * 1000) {
						membersInLast15Mins.push(member);
					}
				});

				let goodNightMsg = "";

				membersInLast15Mins.forEach((member) => {
					goodNightMsg += `${member.toString()} `;
				});

				goodNightMsg += `\n${goodNightVariations[Math.floor(Math.random() * goodNightVariations.length)]}`;
			}
		}
	}
}
