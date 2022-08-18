import { ButtonInteraction } from "discord.js";

export abstract class Button {
    constructor(public customIdPrefix: string) {}
    public abstract handle(interaction: ButtonInteraction);
}