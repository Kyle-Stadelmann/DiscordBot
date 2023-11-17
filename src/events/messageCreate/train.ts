import { ArgsOf, Discord, On } from "discordx";

var activeTrain = false;
var activeTrainString = '';

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class Train {
	@On({ event: "messageCreate" })
	private async handleTrain([msg]: ArgsOf<"messageCreate">) {
    if(!activeTrain){
      msg.channel.messages.fetch({limit: 2}).then (msgs => {
        msgs.reverse().forEach(async element=>{
          if(activeTrainString === element.content){
            activeTrain = true
            await msg.channel.send(activeTrainString)
          } else {
            activeTrainString = element.content
          }
        })
      })
    }else {
      // wait to end activeTrain
      if(activeTrainString !== msg.content){
        activeTrain = false
      } else {
        activeTrainString = msg.content
      }
    }
	}
}