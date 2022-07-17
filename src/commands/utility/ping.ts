import { Message } from "discord.js";
import { Command, CommandConfig } from "../../types/command";

const cmdConfig: CommandConfig = {
	name: "ping",
	description: "Sends pong! for testing purposes.",
	usage: `ping`,
	allowInDM: true,
};

class PingCommand extends Command {
	public async run(msg: Message): Promise<boolean> {
		await msg.channel.send("pong!");
		return true;
	}
}

export default new PingCommand(cmdConfig);
