import axios, { AxiosResponse } from "axios";
import { APIEmbedField, EmbedBuilder } from "discord.js";
import { ArgsOf, Discord, On } from "discordx";
import * as cheerio from "cheerio";

const TARGET_SITE = "https://nyaa.si/view/";
const IMG_DESCRIPTION_REGEX = /!\[.*?]/g;
const FULL_IMG_REGEX = /!\[.*?]\(.*?\)/g;

const COMMENT_PANEL_DIV_REGEX = /<div class="panel panel-default comment-panel" id="com-.+">/g;
const COMMENT_REGEX = /class="comment-content" id="torrent-comment[0-9]*">/g;

const TARGET_SITE_ICON = "https://nyaa.si/static/img/avatar/default.png";

// Truncate title if it's longer than this
const MAX_TITLE_CHARS = 68;

const ROWAN_NAME = "Rowan";
const OTAKU_NAME = "ot4ku";

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class NyaaEmbed {
	@On({ event: "messageCreate" })
	private async tryNyaaEmbed([msg]: ArgsOf<"messageCreate">) {
		if (!msg.content.includes(TARGET_SITE)) return;

		// Clear/block normal embed
		await msg.suppressEmbeds(true);

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

		await msg.channel.send({ embeds: [embed] });
	}

	private createEmbed($: cheerio.CheerioAPI, url: string, data: string): EmbedBuilder | undefined {
		let title = $("title").text();
		if (title.length > MAX_TITLE_CHARS) {
			title = `${title.substring(0, MAX_TITLE_CHARS)}...`;
		}

		const mainPanel = this.getMainPanel($);

		const author = mainPanel[mainPanel.findIndex((str) => str === "Submitter:") + 1];
		const date = mainPanel[mainPanel.findIndex((str) => str === "Date:") + 1];
		const image = this.findImage($);
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

			const rowansComment = this.tryGetUsersComment(data, $, ROWAN_NAME);
			const otakusComment = this.tryGetUsersComment(data, $, OTAKU_NAME);
			if (rowansComment || otakusComment) {
				const userTakes: APIEmbedField[] = [];
				if (otakusComment) userTakes.push({ name: "ot4ku's Take", value: otakusComment, inline: true });
				if (rowansComment) userTakes.push({ name: "Rowan's Take", value: rowansComment, inline: true });
				embed.addFields(userTakes);
			} else {
				embed.setFooter({ text: "Rowan and ot4ku were not here :(" });
			}
		} catch (err) {
			console.error(`Couldn't build nyaa embed for url: ${url}`);
			console.error(err);
			throw err;
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

	private findImage($: cheerio.CheerioAPI): string | undefined {
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
		}
		return img;
	}

	private tryGetUsersComment(data: string, $: cheerio.CheerioAPI, userStr: string): string | undefined {
		const isRowanHere = data.includes(`/user/${userStr}`);
		let rowansComment: string;
		if (isRowanHere) {
			let comments = $("#collapse-comments").html().split(COMMENT_PANEL_DIV_REGEX);
			comments = comments.filter((html) => html.includes(`/user/${userStr}`));

			rowansComment = comments[0].split(COMMENT_REGEX)[1].split("</div>\n")[0];
		}
		return rowansComment;
	}
}
