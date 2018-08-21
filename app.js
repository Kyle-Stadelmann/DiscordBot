const Discord = require('discord.js');
const bot = new Discord.Client();

/* Bot settings - Global settings this file can use */
// Bot prefix
const prefix = ">";

function printSpace() {
  console.log();
  console.log("--------------------------------------------------------------");
  console.log();
}

// Listener event: runs whenever the bot sends a ready event (when it first starts for example)
bot.on("ready", () => {
	console.log("Bot starting up...");
    printSpace();
});

// Listener event: runs whenever a message is received
bot.on('message', message => {

    // Changes message to lowercase
    let msg = message.content.toLowerCase();
    // Author's name
    let sender = message.author;

    // First mention from author
    let mention = message.mentions.members.first();


    // Command handling

    // Handles Daniel's move carter command
    if (msg.startsWith(prefix + "move")) {
    	console.log("Daniel's move command detected on: " + mention.user.username + ", by: " + sender.username);

      	// If memeber id isn't Daniel's ID, ignore this event
      	if (sender.id != "250076166323568640") {
        	console.log("Command was unsuccessful. Member wasn't Daniel");
        	printSpace();
        	return;
      	}

      	// If memeber id isn't Carter's ID, ignore this event
      	if (mention.id != "186540977610031104") {
        	console.log("Command was unsuccessful. Daniel tried to move someone other than Carter");
        	printSpace();
        	return;
      	}

		// Test if carter is in a channel or not
		if (mention.voiceChannel == null) {
			console.log("Command was unsuccessful. Carter isn't in a channel")
			printSpace();
			return;
		}

      	// Put carter into AFK channel
      	mention.setVoiceChannel("201880000478183425");

      	console.log("Command was successful, Carter was moved to AFK");
      	printSpace();
		message.channel.send("Goodbye Carter");
    }

	if (msg == prefix + "tweed") {
    	message.channel.send("fite me tweed");
    }


	if (msg == prefix + "ping") {
      	message.channel.send("pong!");
    }

});

// Login to the correct bot token
bot.login(process.env.BOT_TOKEN);
