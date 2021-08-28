module.exports = async (bot, message) => {
    // Only continue if "zach" is found in a message
    if (!message.content.toLowerCase().includes("zach")) return;

    if (bot.util.random(bot.event_percentages.ZACC_CHANCE)){
        let newString = "";
        // loop through until message has no more "zach"'s
        let msg = message.content;
        while (msg.toLowerCase().includes("zach")) {
            let index = msg.toLowerCase().indexOf("zach");

            let firstHalf = msg.substring(0, index);
            firstHalf = firstHalf.concat("zacc");
            let lastHalf = msg.substring(index + 4, msg.length);

            newString = firstHalf + lastHalf;
            msg = newString;
        }

        newString = newString.concat("*");
        message.channel.send(newString);

    }

}