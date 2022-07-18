import { Message, MessageEmbed } from "discord.js";
import { client } from "../../app.js";
import { TYPESCRIPT_URL } from "../../constants.js";
import { CommandConfig, Command } from "../../types/command.js";
import { sendEmbeds } from "../../util/message_channel.js";

// Probably won't work in pm2
const version = process.env.npm_package_version;

const cmdConfig: CommandConfig = {
	name: "ping",
	description: "Sends pong! for testing purposes.",
	usage: `ping`,
	allowInDM: true,
};

class PingCommand extends Command {
	public async run(msg: Message): Promise<boolean> {
		const embed = new MessageEmbed()
			.setImage(client.user.avatarURL())
			.setTitle("pong!")
			.setFooter({ text: `version ${version}`, iconURL: TYPESCRIPT_URL })
			// TODO: set this to avg pixel color of image?
			.setColor(0x0);

		await sendEmbeds(msg.channel, [embed]);
		return true;
	}
}

export default new PingCommand(cmdConfig);
