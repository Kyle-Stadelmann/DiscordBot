import { Message } from "discord.js";
import { bdbot } from "../../app.js";
import { WHITE_CHECK_MARK, X_MARK } from "../../constants.js";
import { CommandConfig, Command } from "../../types/command.js";

const cmdConfig: CommandConfig = {
	name: "play",
	description: "BD4 Bot plays a song",
	usage: "play",
};

class PlayCommand extends Command {
	public async run(msg: Message, args: string[]): Promise<boolean> {
        if (msg.channel.type === "DM") return false;

		// User's voice channel
		const voiceChannel = msg.member.voice.channel;

		if (!voiceChannel || voiceChannel === msg.guild.afkChannel) {
			console.log(`${msg.author.username} is not connected to a valid voice channel`);
			await msg.react(X_MARK);
			return false;
		}

        // Create/check for Queue
        // https://discord-player.js.org/docs/main/master/general/welcome
        const queue = bdbot.player.createQueue(msg.channel.guild, {
            metadata: { channel: msg.channel },
            ytdlOptions: {
                filter: 'audioonly',
                // eslint-disable-next-line no-bitwise
                highWaterMark: 1 << 30,
                dlChunkSize: 0,
            }
        });

        // Join/verify voice connection
        try {
            if (!queue.connection) {
                await queue.connect(voiceChannel);
                console.log(`Connected to ${voiceChannel.name}`);
            }
        } catch {
            queue.destroy();
            console.log("the queue connection broke for some reason");
            return false;
        }
        
        const sites = ["spotify", "youtube", "youtu.be", "soundcloud"];
		// Find track with args
        // if link, else search phrase containing all args
        let search = "";
        if (args[0].slice(0,8) === "https://" && 
        sites.some(v => args[0].includes(v))) {
            search = args[0];
        } else {
            search = args.join(" ");
        }

        const track = await bdbot.player.search(search, {
            requestedBy: msg.member
        }).then(x => x.tracks[0]);

        // if currently playing, else not playing
        // not 100% how nowPlaying works, may need to check for paused track (once pause is implemented)
        if (queue.nowPlaying()) {
            queue.addTrack(track);
        } else { 
            queue.play(track);
        }

		if (voiceChannel.permissionsFor(msg.guild.roles.everyone).has("VIEW_CHANNEL")) {
			await msg.react(WHITE_CHECK_MARK);
		}
		return true;
	}
}

export default new PlayCommand(cmdConfig);
