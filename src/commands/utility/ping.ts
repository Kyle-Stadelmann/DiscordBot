import { Message, EmbedBuilder } from "discord.js";
import { client } from "../../app.js";
import { TYPESCRIPT_URL } from "../../constants.js";
import { CommandConfig, Command } from "../../types/command.js";
import { getRandomHexColorStr, sendEmbeds } from "../../util/index.js";

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
		const embed = new EmbedBuilder()
			.setImage(client.user.avatarURL())
			.setTitle("pong!")
			.setFooter({ text: `version ${version}`, iconURL: TYPESCRIPT_URL })
			// TODO: set this to avg pixel color of avatar?
			.setColor(getRandomHexColorStr());

		await sendEmbeds(msg.channel, [embed]);
		return true;
	}
}

export default new PingCommand(cmdConfig);
