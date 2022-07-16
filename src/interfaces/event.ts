import { EventHandler } from "./event_handler";

export abstract class Event {
    public name: string;
    private eventHandlers: EventHandler[];
}