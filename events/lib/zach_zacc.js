module.exports = async (bot, message) => {
    // Don't activate for bot messages
    if (message.author.bot) return;

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