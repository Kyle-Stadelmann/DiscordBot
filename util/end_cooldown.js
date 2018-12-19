// Check if we can take a command off cooldown
// Input: The discord client (contains cooldown collection), command name we
// are putting a cooldown on, and the member that we are determining if they
// are on cooldown.
// Output: Returns T/F, whether or not the command is on cooldown.
// (Also removes the command from the cooldown collection)
module.exports.endCooldown = async (bot, cmdName, member) => {
	let cmdCollection = bot.cooldown.get(cmdName);
	let cooldownTimer = cmdCollection.get(member);

	if (cooldownTimer == null) {
		// Member is not on cooldown
		return true;
	}

	let coolTime = bot.constants.cooldownTimes.get(cmdName);
	if (coolTime == null) coolTime = 0;
	//if (cooldownTimer)
}
