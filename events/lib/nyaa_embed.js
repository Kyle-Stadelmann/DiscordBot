const axios = require("axios");
const cheerio = require("cheerio");
const discord = require('discord.js')
const fs = require('fs');

const TARGET_SITE = "https://nyaa.si/view/";
const IMG_DESCRIPTION_REGEX = /!\[.*]/g;
const FULL_IMG_REGEX =  /!\[.*](.*)/g;

const COMMENT_PANEL_DIV_REGEX = /<div class="panel panel-default comment-panel" id="com-.+">/g;
const COMMENT_REGEX = /class="comment-content" id="torrent-comment[0-9]*">/g;

module.exports = async (bot, message) => {
    if (!message.content.includes(TARGET_SITE)) return;

    let url = TARGET_SITE + message.content.split(TARGET_SITE)[1].split(" ")[0];

    let response;
    try {
        response = await axios.get(url);
    }
    catch(err)
    {
        // issue connecting, simply stop this event
        return;
    }

    // issue connecting, simply stop this event
    if (!(response.statusText === "OK")) return;

    const $ = await cheerio.load(response.data);
    let title = $('title').text();

    let mainPanel = $('.panel-body').first().text().split("\n").map(
        str => str.trim()
    ).filter(
        str => str !== ""
    )

    let author = mainPanel[mainPanel.findIndex(str=> str === 'Submitter:') + 1];
    let date = mainPanel[mainPanel.findIndex(str=> str === 'Date:') + 1];

    // Get description text
    let description = $('#torrent-description').text();

    // Img isolator
    let foundImgs = description.match(FULL_IMG_REGEX);
    let img;
    if (foundImgs != null && foundImgs.length > 0) {
        // turn ['![Image Description](imgUrl)'] into ['', '(imgUrl)']
        img = foundImgs[0].split(IMG_DESCRIPTION_REGEX)[1];
        // cut off the parentheses
        img = img.substring(1,img.length-1)
    }

    // Rowan comment isolator
    let isRowanHere = response.data.includes("/user/Rowan");
    let rowansComment;
    if (isRowanHere) {
        let comments = $('#collapse-comments').html().split(COMMENT_PANEL_DIV_REGEX);
        comments = comments.filter(html => html.includes("/user/Rowan"));

        rowansComment = comments[0].split(COMMENT_REGEX)[1].split("</div>\n")[0];
    }

    let embed = new discord.MessageEmbed()
        .setTitle(title)
        .setAuthor(author)
        .setTimestamp(date)
        .setThumbnail(img)

    if (isRowanHere)
        embed.addField("Rowan's Take", rowansComment);
    else
        embed.setFooter("Rowan was not here :(");

    message.channel.send(embed);
}