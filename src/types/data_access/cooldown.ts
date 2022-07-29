import * as dynamoose from "dynamoose";
import { Document } from "dynamoose/dist/Document";

const cooldownSchema = new dynamoose.Schema({
	personId: {
		type: String,
		required: true,
		hashKey: true,
	},
	name: {
		type: String,
		required: true,
		rangeKey: true,
	},
	date: Date, // Note: required defaulted to false
});

export interface Cooldown extends Document {
	personId: string;
	name: string;
	date: Date;
}
export const CooldownTypedModel = dynamoose.model<Cooldown>("cooldown", cooldownSchema);

export function getCooldown(personId: string, name: string): Promise<Cooldown> {
	return CooldownTypedModel.get({ personId, name });
}

export function createCooldown(personId: string, name: string, cooldownEndDate: Date): Promise<Cooldown> {
	return CooldownTypedModel.create({ personId, name, date: cooldownEndDate });
}
