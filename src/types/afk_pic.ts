
export class AfkPic {
    constructor(public users: Set<string>, public url: string, public filePath: string) {}
}

export type AfkPicFile = AfkPic[];
