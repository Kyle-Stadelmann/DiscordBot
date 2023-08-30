import { Discord } from "discordx";
import { Category } from "@discordx/utilities";
import { CommandCategory } from "../../types/command.js";

/*
const cmdConfig: CommandConfig = {
	name: "jar",
	description: "",
	category: CommandCategory.Utility,
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
*/

@Discord()
@Category(CommandCategory.Utility)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class JarCommand {
	// @Slash({name: "jar", description: "Create a jar based on a certain topic. Users can then add entires and pull a random entry."})
	public async run(): Promise<boolean> {
		return true;
	}
}
