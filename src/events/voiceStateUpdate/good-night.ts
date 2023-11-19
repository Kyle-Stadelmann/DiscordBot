import { ArgsOf, Discord, On } from "discordx";

const leftOnLog = new Map();

/*
  on a voice status update{

    if (user disconnects){

      const leftOnLog = map of user to the time of disconnect

      if (between 22:00-06:00 && channel is now empty){

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
@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class PeopleThemes {
	@On({ event: "voiceStateUpdate" })
	private async tryGoodNight([oldState, newState]: ArgsOf<"voiceStateUpdate">) {
		if (newState.channelId === null || typeof newState.channelId === "undefined") {
			leftOnLog.set(newState.member, Date.now());
		}
	}
}
