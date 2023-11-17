import { ArgsOf, Discord, On } from "discordx";

var activeTrain = false;
var activeTrainString = '';

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class Train {
	@On({ event: "messageCreate" })
	private async handleTrain([msg]: ArgsOf<"messageCreate">) {
    if(!activeTrain){
      console.log('no active train detected')
      msg.channel.messages.fetch({limit: 2}).then (msgs => {
        console.log('checking previous 2 messages')
        // msgs.reverse().forEach(async element=>{
        //   console.log(activeTrainString, element.content)
        //   if(activeTrainString === element.content){
        //     console.log('last 2 messages were the same, so active train')
        //     activeTrain = true
        //     await msg.channel.send(activeTrainString)
        //   } else {
        //     console.log('last 2 messages were different, so buisness as usual')
        //     activeTrainString = element.content
        //   }
        // })
        for(let element of msgs){
          
        }
      })
    }else {
      console.log('were in a train!')
      // wait to end activeTrain
      console.log(activeTrainString, msg.content)
      if(activeTrainString !== msg.content){
        console.log('the last message is different from the train string, so end the train')
        activeTrain = false
      } else {
        console.log('TRAINTRAINTRAINTRAINTRAIN')
        activeTrainString = msg.content
      }
    }
	}
}