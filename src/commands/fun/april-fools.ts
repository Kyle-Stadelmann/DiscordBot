/* eslint-disable max-classes-per-file */
import { Message, ChannelType, GuildMember } from "discord.js";
import randomWords from "random-words";
import { Discord, Guild, Slash, SlashGroup } from "discordx";
import { Category } from "@discordx/utilities";
import { client } from "../../app.js";
import {
	ALAN_ID,
	ANGELINA_ID,
	ANISH_ID,
	ANTHONY_ID,
	ASIAN_KYLE_ID,
	BD5_DEV_SERVER_IDS,
	BD5_ID,
	CHRISTINA_ID,
	DANIEL_ALT_ID,
	DANIEL_ID,
	DTITAN_ID,
	ELLEN_ID,
	ERIC_ID,
	ETHAN_ID,
	GARY_ID,
	JASON_ID,
	JCHEN_ID,
	JOHNNY_ID,
	JUSTIN_M_ALT_ID,
	JUSTIN_M_ID,
	KECHENG_ID,
	KEISI_ID,
	KHANG_ID,
	MEGU_ID,
	NATHAN_L_ID,
	NATHAN_P_ALT_ID,
	NATHAN_P_ID,
	NAT_ID,
	RONNIE_ID,
	SWISS_KYLE_ID,
	TWEED_ID,
	ZACH_ALT_ID,
	ZACH_ID,
} from "../../constants.js";
import { CommandCategory } from "../../types/command.js";
import { getNicknames, OldNickname, OldNicknameModel } from "../../types/data-access/curr-nickname.js";
import { isNullOrUndefined } from "../../util/index.js";

const nicknameMap = new Map([
	[ASIAN_KYLE_ID, "AsianKyle"],
	[ALAN_ID, "AmogusKyle"],
	[ETHAN_ID, "FreshmanKyle"],
	[NATHAN_P_ID, "HalfAsianKyle"],
	[DANIEL_ID, "KoreanKyle"],
	[KHANG_ID, "VietKyle"],
	[CHRISTINA_ID, "PollKyle"],
	[MEGU_ID, "MexicanKyle"],
	[GARY_ID, "GoogleKyle"],
	[JUSTIN_M_ID, "Fil-rishKyle"],
	[KEISI_ID, "JapaneseKyle"],
	[KECHENG_ID, "TaiwaneseKyle"],
	[SWISS_KYLE_ID, "SwissKyle"],
	[NAT_ID, "NootKyle"],
	[JUSTIN_M_ALT_ID, "Fil-rishKyle Alt"],
	[JASON_ID, "TwinKyle2"],
	[NATHAN_L_ID, "LamKyle"],
	[JOHNNY_ID, "MudkipKyle"],
	[ANISH_ID, "IndianKyle"],
	[DTITAN_ID, "TwinKyle1"],
	[ANTHONY_ID, "TattooKyle"],
	[ZACH_ID, "NorwegianKyle"],
	[RONNIE_ID, "SnuggieKyle"],
	[DANIEL_ALT_ID, "KoreanKyle Alt"],
	[TWEED_ID, "ItalianKyle"],
	[ERIC_ID, "ChineseKyle"],
	[ELLEN_ID, "BunnyKyle"],
	[NATHAN_P_ALT_ID, "HalfAsianKyle Alt"],
	[ZACH_ALT_ID, "NorwegianKyle Alt"],
	[ANGELINA_ID, "KleeKyle"],
	[JCHEN_ID, "ValoKyle"],
]);

function isKyleName(name: string): boolean {
	return name.match(/.*Kyle.*/g) !== null;
}

function getKyleName(id: string): string {
	if (nicknameMap.has(id)) return nicknameMap.get(id);
	let randomWord = randomWords(1)[0];
	randomWord = `${randomWord.charAt(0).toUpperCase()}${randomWord.substring(1)}`;
	return `${randomWord}Kyle`;
}

@Discord()
@SlashGroup({ name: "aprilfools", description: "!" })
@SlashGroup("aprilfools")
@Category(CommandCategory.Fun)
@Guild(BD5_DEV_SERVER_IDS)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class AprilFoolsStartCommand {
	// @Slash({name: "start", description: "!", dmPermission: false})
	async start(msg: Message): Promise<boolean> {
		const isDm = msg.channel.type === ChannelType.DM;
		const date = new Date();

		if (!isDm || msg.author.id !== CHRISTINA_ID || date.getDate() !== 1 || date.getMonth() !== 3) return false;

		const bd5 = client.guilds.resolve(BD5_ID);

		const nicknamePromises: Promise<any>[] = [];

		bd5.members.cache.forEach((m, id) => {
			const currName = m.nickname;
			let oldnick: OldNickname | undefined;

			if (isNullOrUndefined(currName)) {
				oldnick = new OldNicknameModel({ userId: id });
			} else if (!isKyleName(currName)) {
				oldnick = new OldNicknameModel({ userId: id, name: currName });
			}

			if (!isNullOrUndefined(oldnick)) oldnick.save().catch((e) => console.error(e));

			if (m.manageable) {
				const newName = getKyleName(id);
				// Wrap in promise that prevents errors from being thrown
				// Don't want to throw out all rename requests if one produces an error somehow
				const renamePromise = new Promise((resolve) => {
					m.setNickname(newName)
						.then((result) => resolve(result))
						.catch((e) => console.error(e));
				});
				nicknamePromises.push(renamePromise);
			}
		});
		await Promise.all(nicknamePromises);

		return true;
	}

	@Slash({ name: "undo", description: "!", dmPermission: false })
	async undo(msg: Message): Promise<boolean> {
		if (msg.author.id !== CHRISTINA_ID) return false;
		const bd5 = client.guilds.resolve(BD5_ID);

		const nicknamePromises: Promise<GuildMember>[] = [];

		const userIds = bd5.members.cache.map((m, id) => id);
		const nicknames = await getNicknames(userIds);

		nicknames.forEach((oldNickname) => {
			const { userId, name } = oldNickname;

			const member = bd5.members.resolve(userId);

			const currName = member?.nickname;

			const doChangeName = !isNullOrUndefined(currName) && isKyleName(currName);
			// If user already changed their name to something other than "*Kyle", don't touch their new name
			// otherwise set their name to their old nickname
			if (member !== null && doChangeName && member.manageable) {
				nicknamePromises.push(member.setNickname(name ?? null));
			}
		});

		await Promise.all(nicknamePromises);

		return true;
	}
}
