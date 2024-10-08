import { Collection } from "discord.js";
import {
	ALAN_ID,
	ANISH_ID,
	ASIAN_KYLE_ID,
	DANIEL_ID,
	ERIC_ID,
	GARY_ID,
	JASON_ID,
	JOHNNY_ID,
	JUSTIN_M_ID,
	KEISI_ID,
	KHANG_ID,
	MEGU_ID,
	NATHAN_P_ID,
	NAT_ID,
	SWISS_KYLE_ID,
	TWEED_ID,
	TYLER_H_ID,
	ZACH_ID,
} from "../../constants.js";
import { UserAfkPic, getAllPicsForUser } from "../data-access/afk-pic.js";
import { getRandomElements } from "../../util/random.js";
import { getAllStagingPics, StagingAfkPic, StagingAfkPicTypedModel } from "../data-access/staging-afk-pic.js";

// User id to afk pic code
export const AfkPicCodeMap = new Collection<string, string>();
AfkPicCodeMap.set("AD", ALAN_ID);
AfkPicCodeMap.set("AS", ANISH_ID);
AfkPicCodeMap.set("DK", DANIEL_ID);
AfkPicCodeMap.set("EW", ERIC_ID);
AfkPicCodeMap.set("JAD", JASON_ID);
AfkPicCodeMap.set("GC", GARY_ID);
AfkPicCodeMap.set("JC", JOHNNY_ID);
AfkPicCodeMap.set("JM", JUSTIN_M_ID);
AfkPicCodeMap.set("KN", KHANG_ID);
AfkPicCodeMap.set("KS", ASIAN_KYLE_ID);
AfkPicCodeMap.set("ME", SWISS_KYLE_ID);
AfkPicCodeMap.set("KT", KEISI_ID);
AfkPicCodeMap.set("MGU", MEGU_ID);
AfkPicCodeMap.set("MM", TWEED_ID);
AfkPicCodeMap.set("NN", NAT_ID);
AfkPicCodeMap.set("NP", NATHAN_P_ID);
AfkPicCodeMap.set("TH", TYLER_H_ID);
AfkPicCodeMap.set("ZT", ZACH_ID);

export class AfkPicContainer {
	// TODO: Refactor into generic AfkPic type
	// All non-staging pics (no duplicates per user)
	private allPics: UserAfkPic[];
	private stagingPics: StagingAfkPic[];
	// User id -> afk pic
	// This is filled after parsing/db initalizing
	private readonly userPicsMap = new Collection<string, UserAfkPic[]>();

	public async initContainer() {
		await Promise.all([this.populateUserPicsMap(), this.populateStagingPics()]);

		this.populatePics();
	}

	public hasUser(userId: string): boolean {
		return this.userPicsMap.has(userId);
	}

	public hasPics(): boolean {
		return this.allPics.length > 0 || this.stagingPics.length > 0;
	}

	public getRandomUserPicUrls(userId: string, count?: number): string[] {
		const userPics = this.getUserPics(userId);
		return getRandomElements(userPics, count).map((p) => p.url);
	}

	public getRandomPicUrls(shouldGetStagingPic?: boolean, count?: number): string[] {
		if (shouldGetStagingPic) return getRandomElements(this.stagingPics, count).map((p) => p.url);
		const pics = [...this.allPics, ...this.stagingPics];
		return getRandomElements(pics, count).map((p) => p.url);
	}

	// Note: Each time a picture is uploaded to discords CDN, it has a different url
	// this means duplicate afk pics can be added to staging.
	public doesPicUrlAlreadyExist(url: string): boolean {
		return (
			this.allPics.some((afkpic) => afkpic.url === url) || this.stagingPics.some((afkpic) => afkpic.url === url)
		);
	}

	public getUserPics(userId: string): UserAfkPic[] {
		const userPics = this.userPicsMap.get(userId);
		return userPics || [];
	}

	public async tryAddAfkPics(picUrls: string[], submitterUserId: string): Promise<boolean> {
		if (picUrls.some((picUrl) => this.doesPicUrlAlreadyExist(picUrl))) {
			return false;
		}

		const createPromises = picUrls.map(async (url) => {
			const stagingPic = await StagingAfkPicTypedModel.create({ url, submitterUserId });
			this.stagingPics.push(stagingPic);
		});
		await Promise.all(createPromises);
		return true;
	}

	private async populateUserPicsMap() {
		for (const [, userId] of AfkPicCodeMap) {
			// eslint-disable-next-line no-await-in-loop
			const userPics = await getAllPicsForUser(userId);
			this.userPicsMap.set(userId, userPics);
		}
	}

	private populatePics() {
		const pics = new Set<UserAfkPic>();
		[...this.userPicsMap.values()].flatMap((userPics) => userPics).forEach((pic) => pics.add(pic));
		this.allPics = [...pics];
	}

	private async populateStagingPics() {
		this.stagingPics = (await getAllStagingPics()) || [];
	}
}
