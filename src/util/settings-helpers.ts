export function isDevMode(): boolean {
	return process.env.BDBOT_PROD_MODE !== "TRUE";
}

export function isProdMode(): boolean {
	return process.env.BDBOT_PROD_MODE === "TRUE";
}
