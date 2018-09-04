// Likelihood/possibilities chance to spawn a true return value
// Input: Likelihood of a "true" return value out of possibilities number of
// potential values
// Output: returns true/false
module.exports.random = function(likelihood, possibilities) {

	// Random num from 1 to possibilities
	randomVal = (Math.random() * possibilities) + 1;
	if (randomVal <= likelihood) {
		return true;
	} else {
		return false;
	}
}
