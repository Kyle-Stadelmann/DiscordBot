import { ArgsOf, Discord, On } from "discordx";

var activeTrain = false;
var previousString = '';
var previousUser = '';
@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class Train {
	@On({ event: "messageCreate" })
	private async handleTrain([msg]: ArgsOf<"messageCreate">) {
    if(!activeTrain){
      msg.channel.messages.fetch({limit: 2}).then (async msgs => {
        for await (let element of msgs){
          if(previousString === element[1].content && previousUser !== element[1].author.id){
            // last 2 messages were the same and written by different people, train time bby
            activeTrain = true
            await msg.channel.send(previousString)
            break;
          } else {
            // buisness as usual...
            previousString = element[1].content
            previousUser = element[1].author.id
          }
        }
      })
    } else {
      // wait to end activeTrain
      if(previousString !== msg.content){
        activeTrain = false
      } else {
        previousString = msg.content
      }
    }
  }
}