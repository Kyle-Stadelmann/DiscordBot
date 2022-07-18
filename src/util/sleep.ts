/* eslint-disable no-promise-executor-return */

// Sleep for ms amount of milliseconds
// Input: The # of ms you want to sleep for
// ex use: await sleep(1000); // sleep for 1 second
export async function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
