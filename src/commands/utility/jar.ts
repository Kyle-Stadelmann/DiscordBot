import { Command, CommandConfig } from "../../types/command";

const cmdConfig: CommandConfig = {
	name: "jar",
	description: "Create a jar based on a certain topic. Users can then add entires and pull a random entry.",
	usage: `jar [Action] [Category]`,
	// extras: {
	// 	Subcommands: [],
	// },
	examples: [
		`jar create "BD4 movies"`,
		`jar add "BD4 movies" "Inception"`,
		`jar remove "BD4 movies" "Superman: Red Son"`,
		`jar pull "BD4 movies"`,
		`jar list "BD4 movies"`,
	],
	allowInDM: true,
	disabled: true,
};

class JarCommand extends Command {
	public async run(): Promise<boolean> {
		return true;
	}
}

export default new JarCommand(cmdConfig);
