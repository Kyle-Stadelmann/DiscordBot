import { MessageEmbed } from 'discord.js';
import Constants from '../../../constants';

module.exports = async (bot, message) => {
    if (message.content.charAt(message.content.length - 1) !== '?') return;

    if (bot.util.random(bot.event_percentages.QUESTION_MARK_CHANCE)) {
        let embed = new MessageEmbed()
            .setImage(Constants.QUESTION_MARK_URL)

        message.channel.send({embeds: [embed]});
    }
}