import type { ClassMethodDecorator } from "discordx";
import { DApplicationCommand, DDiscord, DSimpleCommand, MetadataStorage, Modifier } from "discordx";

export interface ICooldownTime<T = number> {
	cooldownTime?: T;
}
export function CooldownTime(data: number): ClassMethodDecorator {
	return function <D>(target: Record<string, D>, key?: string, descriptor?: PropertyDescriptor) {
		MetadataStorage.instance.addModifier(
			Modifier.create<DApplicationCommand | DSimpleCommand | DDiscord>(
				(original: ((DApplicationCommand | DSimpleCommand) & ICooldownTime) | DDiscord) => {
					if (original instanceof DDiscord) 
						{[...original.applicationCommands, ...original.simpleCommands].forEach(
							(ob: (DApplicationCommand | DSimpleCommand) & ICooldownTime) => {
								ob.cooldownTime = data;
							}
						);}
					 else 
						{original.cooldownTime = data;}
					
				},
				DApplicationCommand,
				DSimpleCommand,
				DDiscord
			).decorateUnknown(target, key, descriptor)
		);
	};
}
