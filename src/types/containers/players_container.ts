import { User } from "discord.js";
import { client } from "../../app.js";

// Game role id -> [user ids]
type GameRolePlayers = Map<string, string[]>;

export class PlayersContainer {
    // Guild id -> GameRolePlayers
    private serverPlayerMap = new Map<string, GameRolePlayers>(); 

    public addPlayer(guildId: string, userId: string, roleId: string) {
        const gameRolePlayers = this.serverPlayerMap.get(guildId) ?? new Map<string, string[]>();
        const players = gameRolePlayers.get(roleId) ?? [];
        if (players.includes(userId)) return;

        players.push(userId);
        gameRolePlayers.set(roleId, players);
        this.serverPlayerMap.set(guildId, gameRolePlayers);
    }

    public removePlayer(guildId: string, userId: string, roleId: string) {
        const gameRolePlayers = this.serverPlayerMap.get(guildId) ?? new Map<string, string[]>();
        let players = gameRolePlayers.get(roleId) ?? [];
        if (!players.includes(userId)) return;

        players = players.filter(player => player !== userId);
        gameRolePlayers.set(roleId, players);
        this.serverPlayerMap.set(guildId, gameRolePlayers);
    }

    public getPlayers(guildId: string, roleId: string): User[] {
        const playerIds = this.serverPlayerMap.get(guildId)?.get(roleId) ?? [];
        return playerIds.flatMap(userId => [this.resolveUser(guildId, userId)] ?? []);
    }

    public hasPlayer(guildId: string, userId: string, roleId: string): boolean {
        return !!(this.serverPlayerMap
            .get(guildId)
            ?.get(roleId)
            ?.includes(userId));
    }

    public clearQueue(guildId: string, roleId: string) {
        this.serverPlayerMap.get(guildId)?.set(roleId, []);
    }

    private resolveUser(guildId: string, userId: string): User | undefined {
        return client.users.resolve(userId);
    }
}