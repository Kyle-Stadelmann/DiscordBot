module.exports.help = {
    commandName: "jar",
    description: "Create a jar based on a certain topic. Users can then add entires and eventually pull a random entry.",
    usage: `jar [Action] [Category]`,
    extras: {
                "Subcommands": [

                ]
    },
    examples: 
        [`jar create "BD4 movies"`,
         `jar add "BD4 movies" "Inception"`,
         `jar remove "BD4 movies" "Superman: Red Son"`,
         `jar pull "BD4 movies"`,
         `jar list "BD4 movies"`
    ]
}

module.exports.disabled = true;

module.exports.run = async (bot, msg, args) => {
    return true;
}
