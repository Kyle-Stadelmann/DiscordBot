const Discord = require("discord.js");

module.exports = async (bot, message) => {
    if (bot.util.random(require("../event_percentages.js").QUESTION_MARK_CHANCE)) {
        let embed = new Discord.MessageEmbed()
            .setImage(bot.constants.QUESTION_MARK_URL)

        message.channel.send(embed);
    }
}