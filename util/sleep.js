// Sleep for ms amount of milliseconds
// Input: The # of ms you want to sleep for
// ex use: await sleep(1000); // sleep for 1 second
module.exports.sleep = async (ms) => {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
