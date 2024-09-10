import { sanitizeUrl } from "@braintree/sanitize-url";
import { CommandInteraction } from "discord.js";
import { bdbot } from "../app.js";

const discordRegex =
	/^(https?:)?\/\/(cdn|media)\.discordapp\.(com|net)\/attachments\/(\d*)\/(\d*)(?!.*https?:)\/(\S*)(\.(png|jpeg|jpg))(\?width=\d*&height=\d*)?/m;
const allowedImageRegex = [discordRegex, /(https?:)?\/\/(\w+\.)?imgur\.com\/(\S*)(\.(png|jpeg|jpg))/m];

async function isAllowedSite(url: string): Promise<boolean> {
	const cleanUrl = sanitizeUrl(url);
	const isUrlAllowed = allowedImageRegex.some((regex) => regex.test(cleanUrl));
	if (!isUrlAllowed) {
		return false;
	}
	// Discord cdn files can't be fetched (error 403 Forbidden). So assume link has valid pic
	return discordRegex.test(cleanUrl) ? true : (await fetch(cleanUrl)).ok;
}

async function validateAfkPics(urls: string[]): Promise<string[]> {
	const allowedSites = urls.filter((url) => isAllowedSite(url));
	return allowedSites.map((url) => sanitizeUrl(url));
}

export async function tryAddAfkPics(urls: string[], interaction: CommandInteraction): Promise<boolean> {
	const { user } = interaction;
	const afkPicUrls: string[] = await validateAfkPics(urls.map((p) => p));

	if (afkPicUrls.length === 0) {
		await interaction.editReply("Failed to add any AFK Pics. No valid AFK Pics found.");
		return false;
	}

	const result = await bdbot.tryAddAfkPics(afkPicUrls, user.id);
	if (result && afkPicUrls.length > 0) {
		// TODO: Leaderboard for who submits most afk pics
		await interaction.editReply(
			`AFK Pic${afkPicUrls.length > 1 ? "s" : ""} added. Thank you for your *generous donation*!`
		);
		return true;
	}
	await interaction.editReply(
		"Failed to add any AFK Pics. This picture **may** exist already or is from an unsupported image source."
	);
	return false;
}
