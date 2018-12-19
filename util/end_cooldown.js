// Check if we can take a command off cooldown
// Input: The discord client (contains cooldown collection), command name we
// are putting a cooldown on, and the member that we are determining if they
// are on cooldown.
// Output: Returns T/F, whether or not the command is on cooldown.
// (Also removes the command from the cooldown collection if returned true)
module.exports.endCooldown = (bot, cmdName, member) => {
	if (member == null) {
		// Member doesnt exist... no cooldown
		return true;
	}

	let memberCoolColl = bot.cooldowns.get(cmdName);
	if (memberCoolColl == null) {
		// There are no cooldowns for this command
		return true;
	}

	let cooldownTimer = memberCoolColl.get(member);
	if (cooldownTimer == null) {
		// Member is not on cooldown
		return true;
	}

	let coolTime = bot.constants.cooldownTimes.get(cmdName);
	if (coolTime == null) coolTime = 0;

	let date = new Date();
	if (cooldownTimer + coolTime <= date.getTime()) {
		memberCoolColl.delete(member);
		return true;
	}

	// cooldown is not complete yet
	return false;
}
