import { GuildMember, Snowflake } from "discord.js";
import { COOLDOWN_JSON_LOC } from "../constants"
import { Low, JSONFile } from 'lowdb'

export class Cooldowns {
    private cooldowns: Map<Snowflake, Date> = new Map();
    private db: Low;

    constructor(private cooldownTime: number, private cooldownName: string) {
        const adapter = new JSONFile(COOLDOWN_JSON_LOC);
        this.db = new Low(adapter);
    }

    public isOnCooldown(member: GuildMember): boolean {
        const memberId = member.id;

        if (!this.cooldowns.has(memberId)) return false;

        const endCooldownTime = this.cooldowns.get(memberId);
        if (endCooldownTime > new Date()) return true;
    }

    public async putOnCooldown(member: GuildMember) {
        const endCooldownEpoch = new Date().valueOf() + this.cooldownTime;
        const endCooldownDate = new Date(endCooldownEpoch);

        this.cooldowns.set(member.id, endCooldownDate);
        
        await this.updateDb();
    }

    public async endCooldown(member: GuildMember) {
        this.cooldowns.delete(member.id);

        await this.updateDb();
    }

    private async updateDb() {
        await this.db.read();

        const thisCooldownProperty = {};
        // Produces { commandName: cooldownMap }
        thisCooldownProperty[this.cooldownName] = this.cooldowns;
        this.db.data ||= thisCooldownProperty;

        await this.db.write();
    }
}
