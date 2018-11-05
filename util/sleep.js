// Sleep for ms amount of milliseconds
module.exports.sleep = async (ms) => {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
