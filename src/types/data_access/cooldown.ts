import * as dynamoose from "dynamoose";
import { Document } from "dynamoose/dist/Document";

const cooldownSchema = new dynamoose.Schema({
	idToCooldown: {
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
	idToCooldown: string; // Can be a user id, member id, or guild id
	name: string;
	date: Date;
}
export const CooldownTypedModel = dynamoose.model<Cooldown>("cooldown", cooldownSchema);

export function getCooldown(idToCooldown: string, name: string): Promise<Cooldown> {
	return CooldownTypedModel.get({ personId: idToCooldown, name });
}

export function createCooldown(idToCooldown: string, name: string, cooldownEndDate: Date): Promise<Cooldown> {
	return CooldownTypedModel.create({ idToCooldown, name, date: cooldownEndDate });
}
