const Discord = require("discord.js");

module.exports = async (bot, message) => {
    let newString = "";
    // loop through until message has no more "zach"'s
    let msg = message.content;
    while(msg.toLowerCase().includes("zach")){
        let index = msg.toLowerCase().indexOf("zach");

        let firstHalf = msg.substring(0,index);
        firstHalf = firstHalf.concat("zacc");
        let lastHalf = msg.substring(index+4,msg.length);
        
        newString = firstHalf+lastHalf;
        msg = newString;
    }

    newString = newString.concat("*");
    message.channel.send(newString);
}