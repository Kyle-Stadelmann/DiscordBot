import { Message, MessageEmbed } from "discord.js";
import { TYPESCRIPT_URL } from "../../constants";
import { Command, CommandConfig } from "../../types/command";
import { sendEmbeds } from "../../util";

const { version } = require('../../../package.json');

const cmdConfig: CommandConfig = {
	name: "ping",
	description: "Sends pong! for testing purposes.",
	usage: `ping`,
	allowInDM: true,
};

class PingCommand extends Command {
	public async run(msg: Message): Promise<boolean> {
		const embed = new MessageEmbed()
		    // .setImage(client.user.avatarURL())
			.setThumbnail(TYPESCRIPT_URL)
			.setFooter(`version ${version}`)
		await sendEmbeds(msg.channel, [embed], "pong!");
		return true;
	}
}

export default new PingCommand(cmdConfig);
