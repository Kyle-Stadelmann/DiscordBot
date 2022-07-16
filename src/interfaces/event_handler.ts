export abstract class EventHandler {
    public name: string;
    public abstract run(): void;
}