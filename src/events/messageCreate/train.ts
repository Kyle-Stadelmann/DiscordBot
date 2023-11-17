import { ArgsOf, Discord, On } from "discordx";

var activeTrain = false;
var previousString = '';

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class Train {
	@On({ event: "messageCreate" })
	private async handleTrain([msg]: ArgsOf<"messageCreate">) {
    if(!activeTrain){
      msg.channel.messages.fetch({limit: 2}).then (async msgs => {
        for await (let element of msgs){
          console.log(previousString, element[1].content)
          if(previousString === element[1].content){
            // last 2 messages were the same, train time bby
            activeTrain = true
            await msg.channel.send(previousString)
            break;
          } else {
            // buisness as usual...
            previousString = element[1].content
          }
        }
      })
    } else {
      // wait to end activeTrain
      console.log(previousString, msg.content)
      if(previousString !== msg.content){
        activeTrain = false
      } else {
        previousString = msg.content
      }
    }

  }
}