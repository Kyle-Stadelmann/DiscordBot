import axios, { AxiosResponse } from "axios";
import { EmbedBuilder } from "discord.js";
import { ArgsOf, Discord, On } from "discordx";
import * as cheerio from "cheerio";
import { sendEmbeds, sleep } from "../../util/index.js";

const TARGET_SITE = "https://nyaa.si/view/";
const IMG_DESCRIPTION_REGEX = /!\[.*?]/g;
const FULL_IMG_REGEX = /!\[.*?]\(.*?\)/g;

const COMMENT_PANEL_DIV_REGEX = /<div class="panel panel-default comment-panel" id="com-.+">/g;
const COMMENT_REGEX = /class="comment-content" id="torrent-comment[0-9]*">/g;

const TARGET_SITE_ICON = "https://nyaa.si/static/img/avatar/default.png";

// Truncate title if it's longer than this
const MAX_TITLE_CHARS = 68;

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class NyaaEmbed {
	@On({ event: "messageCreate" })
	private async tryNyaaEmbed([msg]: ArgsOf<"messageCreate">) {
		if (!msg.content.includes(TARGET_SITE)) return;

		// Wait for discord embed, if it doesn't happen, we'll do the embed ourselves
		await sleep(3000);
		if (msg.embeds?.length > 0) {
			return;
		}

		const url = TARGET_SITE + msg.content.split(TARGET_SITE)[1].split(" ")[0];

		let response: AxiosResponse<string>;
		try {
			response = await axios.get(url);
		} catch (err) {
			// Issue connecting, simply stop this event
			return;
		}
		const { data } = response;

		// Issue connecting, simply stop this event
		if (!(response.statusText === "OK")) return;

		const $ = await cheerio.load(data);

		const embed = this.createEmbed($, url, data);
		if (!embed) return;

		await sendEmbeds(msg.channel, [embed]);
	}

	private createEmbed($: cheerio.CheerioAPI, url: string, data: string): EmbedBuilder | undefined {
		let title = $("title").text();
		if (title.length > MAX_TITLE_CHARS) {
			title = `${title.substring(0, MAX_TITLE_CHARS)}...`;
		}

		const mainPanel = this.getMainPanel($);

		const author = mainPanel[mainPanel.findIndex((str) => str === "Submitter:") + 1];
		const date = mainPanel[mainPanel.findIndex((str) => str === "Date:") + 1];
		const image = this.getImage($);
		const seeders = mainPanel[mainPanel.findIndex((str) => str === "Seeders:") + 1];
		const leechers = mainPanel[mainPanel.findIndex((str) => str === "Leechers:") + 1];
		const completed = mainPanel[mainPanel.findIndex((str) => str === "Completed:") + 1];
		const fileSize = mainPanel[mainPanel.findIndex((str) => str === "File size:") + 1];

		let embed: EmbedBuilder;
		try {
			embed = new EmbedBuilder()
				.setTitle(title)
				.setURL(url)
				.setAuthor({ name: author, iconURL: TARGET_SITE_ICON })
				.setTimestamp(new Date(date))
				.setThumbnail(image)
				.addFields(
					{ name: "Seeders", value: `\`\`\`diff\n+${seeders}\n\`\`\``, inline: true },
					{ name: "Leechers", value: `\`\`\`diff\n-${leechers}\n\`\`\``, inline: true },
					{ name: "Completed", value: `\`\`\`diff\n${completed}\n\`\`\``, inline: true },
					{ name: "File Size", value: fileSize }
				);

			const rowansComment = this.tryGetRowanComment(data, $);
			if (rowansComment) {
				embed.addFields({ name: "Rowan's Take", value: rowansComment });
			} else {
				embed.setFooter({ text: "Rowan was not here :(" });
			}
		} catch (err) {
			// Possible errors from invalid image can crash bot
			// TODO: Catch errors from all events somehow
		}

		return embed;
	}

	private getMainPanel($: cheerio.CheerioAPI): string[] {
		return $(".panel-body")
			.first()
			.text()
			.split("\n")
			.map((str) => str.trim())
			.filter((str) => str !== "");
	}

	private getImage($: cheerio.CheerioAPI): string | undefined {
		const description = $("#torrent-description").text();

		// Img isolator
		const foundImgs = description.match(FULL_IMG_REGEX);
		let img: string;
		if (foundImgs != null && foundImgs.length > 0) {
			// Convert ['![Image Description](imgUrl)'] into ['', '(imgUrl)']
			img = foundImgs[0].split(IMG_DESCRIPTION_REGEX)[1];
			// Cut off the parentheses
			img = img.substring(1, img.length - 1);

			if (img.includes(" ")) {
				// Convert 'imgUrl "Image Hover Text"' into imgUrl
				img = img.substring(0, img.indexOf(" "));
			}

			let index: number;
			if (img.includes(".jpg")) index = img.indexOf(".jpg");
			if (img.includes(".JPG")) index = img.indexOf(".JPG");
			if (img.includes(".png")) index = img.indexOf(".png");
			if (img.includes(".PNG")) index = img.indexOf(".PNG");
			img = img.substring(0, index + 4);
		}
		return img;
	}

	private tryGetRowanComment(data: string, $: cheerio.CheerioAPI): string | undefined {
		const isRowanHere = data.includes("/user/Rowan");
		let rowansComment: string;
		if (isRowanHere) {
			let comments = $("#collapse-comments").html().split(COMMENT_PANEL_DIV_REGEX);
			comments = comments.filter((html) => html.includes("/user/Rowan"));

			rowansComment = comments[0].split(COMMENT_REGEX)[1].split("</div>\n")[0];
		}
		return rowansComment;
	}
}
