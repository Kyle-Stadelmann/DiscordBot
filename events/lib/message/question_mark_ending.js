const Discord = require("discord.js");

module.exports = async (bot, message) => {
    if (message.content.charAt(message.content.length - 1) !== '?') return;

    if (bot.util.random(bot.event_percentages.QUESTION_MARK_CHANCE)) {
        let embed = new Discord.MessageEmbed()
            .setImage(bot.constants.QUESTION_MARK_URL)

        message.channel.send(embed);
    }
}