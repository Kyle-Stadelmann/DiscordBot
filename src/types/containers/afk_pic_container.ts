import { Collection } from "discord.js";
import { ALAN_ID, ANISH_ID, ASIAN_KYLE_ID, DANIEL_ID, ERIC_ID, GARY_ID, JASON_ID, JOHNNY_ID, JUSTIN_M_ID, KEISI_ID, KHANG_ID, MEGU_ID, NATHAN_P_ID, NAT_ID, SWISS_KYLE_ID, TWEED_ID, ZACH_ID } from "../../constants.js";
import { AfkPic, getAllPicsForUser } from "../data_access/afk_pic.js";
import { getRandomElement } from "../../util/random.js";

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
AfkPicCodeMap.set("ZT", ZACH_ID);

export class AfkPicContainer {
    // All pics (no duplicates)
    private pics: AfkPic[];
    // User id -> afk pic 
    // This is filled after parsing/db initalizing 
    private readonly userPicsMap = new Collection<string, AfkPic[]>();

    public async initContainer() {
        await this.populateUserPicsMap();

        this.populatePics();
    }

    public hasUser(userId: string): boolean {
        return this.userPicsMap.has(userId);
    }

    public hasPics(): boolean {
        return this.pics.length > 0;
    }

    public getPic(userId?: string): AfkPic {
        return (userId) 
            ? getRandomElement(this.userPicsMap.get(userId))
            : getRandomElement(this.pics);
    }

    public doesPicAlreadyExist(picUrl: string) {
        return this.pics.some(afkpic => afkpic.url === picUrl);
    }

    public getAllPics(): AfkPic[] {
        return this.pics;
    }

    public getUserPics(userId: string): AfkPic[] {
        const userPics = this.userPicsMap.get(userId);
        return userPics || [];
    }

    private async populateUserPicsMap() {
        for (const [,userId] of AfkPicCodeMap) {
            // eslint-disable-next-line no-await-in-loop
            const userPics = await getAllPicsForUser(userId);
            this.userPicsMap.set(userId, userPics);
        }
    }

    private populatePics() {
        const pics = new Set<AfkPic>();
        Array.from(this.userPicsMap.values())
            .flatMap(userPics => userPics)
            .forEach(pics.add);
        this.pics = Array.from(pics);
    }
}