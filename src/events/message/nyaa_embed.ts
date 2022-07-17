import axios, { AxiosResponse } from "axios";
import { Message, MessageEmbed } from "discord.js";
import { Discord, On } from "discordx";
import * as cheerio from "cheerio";
import { sendEmbeds } from "../../util";

const TARGET_SITE = "https://nyaa.si/view/";
const IMG_DESCRIPTION_REGEX = /!\[.*]/g;
const FULL_IMG_REGEX = /!\[.*](.*)/g;

const COMMENT_PANEL_DIV_REGEX = /<div class="panel panel-default comment-panel" id="com-.+">/g;
const COMMENT_REGEX = /class="comment-content" id="torrent-comment[0-9]*">/g;

const TARGET_SITE_ICON = "https://nyaa.si/static/img/avatar/default.png";

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class NyaaEmbed {
	@On("message")
	private async tryNyaaEmbed(msg: Message) {
		// TODO: only do embed if discord doens't do it after a certain amt of time?
		return;
		if (!msg.content.includes(TARGET_SITE)) return;

		const url = TARGET_SITE + msg.content.split(TARGET_SITE)[1].split(" ")[0];

		let response: AxiosResponse<any>;
		try {
			response = await axios.get(url);
		} catch (err) {
			// issue connecting, simply stop this event
			return;
		}

		// issue connecting, simply stop this event
		if (!(response.statusText === "OK")) return;

		const $ = await cheerio.load(response.data);
		const title = $("title").text();

		const mainPanel = $(".panel-body")
			.first()
			.text()
			.split("\n")
			.map((str) => str.trim())
			.filter((str) => str !== "");

		const author = mainPanel[mainPanel.findIndex((str) => str === "Submitter:") + 1];
		const date = mainPanel[mainPanel.findIndex((str) => str === "Date:") + 1];

		// Get description text
		const description = $("#torrent-description").text();

		// Img isolator
		const foundImgs = description.match(FULL_IMG_REGEX);
		let img;
		if (foundImgs != null && foundImgs.length > 0) {
			// turn ['![Image Description](imgUrl)'] into ['', '(imgUrl)']
			img = foundImgs[0].split(IMG_DESCRIPTION_REGEX)[1];
			// cut off the parentheses
			img = img.substring(1, img.length - 1);
		}

		// Rowan comment isolator
		const isRowanHere = response.data.includes("/user/Rowan");
		let rowansComment;
		if (isRowanHere) {
			let comments = $("#collapse-comments").html().split(COMMENT_PANEL_DIV_REGEX);
			comments = comments.filter((html) => html.includes("/user/Rowan"));

			rowansComment = comments[0].split(COMMENT_REGEX)[1].split("</div>\n")[0];
		}

		const seeders = mainPanel[mainPanel.findIndex((str) => str === "Seeders:") + 1];
		const leechers = mainPanel[mainPanel.findIndex((str) => str === "Leechers:") + 1];
		const completed = mainPanel[mainPanel.findIndex((str) => str === "Completed:") + 1];
		const fileSize = mainPanel[mainPanel.findIndex((str) => str === "File size:") + 1];

		const embed = new MessageEmbed()
			.setTitle(title)
			.setURL(url)
			.setAuthor(author, TARGET_SITE_ICON)
			.setTimestamp(new Date(date))
			.setThumbnail(img)
			.addFields(
				{ name: "Seeders", value: `\`\`\`diff\n+${seeders}\n\`\`\``, inline: true },
				{ name: "Leechers", value: `\`\`\`diff\n-${leechers}\n\`\`\``, inline: true },
				{ name: "Completed", value: `\`\`\`diff\n${completed}\n\`\`\``, inline: true },
				{ name: "File Size", value: fileSize }
			);

		if (isRowanHere) {
			embed.addField("Rowan's Take", rowansComment);
		} else {
			embed.setFooter("Rowan was not here :(");
		}

		await sendEmbeds(msg.channel, [embed]);
	}
}
