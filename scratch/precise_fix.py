import os

replacements = {
    'src/commands/fun/random-move.ts': [
        ('if (hadError) {return false;}', 'if (hadError) return false;')
    ],
    'src/commands/fun/whip.ts': [
        ('if (victimChannel === null) {break;}', 'if (victimChannel === null) break;'),
        ('if (victim.voice.channel === null) {break;}', 'if (victim.voice.channel === null) break;'),
        ('if (!channel.isVoiceBased()) {return false;}', 'if (!channel.isVoiceBased()) return false;'),
        ('if (guild.afkChannel === channel) {return false;}', 'if (guild.afkChannel === channel) return false;')
    ],
    'src/commands/music/seek.ts': [
        ('if (hadError || times.length > 3) {return null;}', 'if (hadError || times.length > 3) return null;')
    ],
    'src/commands/utility/disconnect.ts': [
        ('if (connection) {connection.destroy();}', 'if (connection) connection.destroy();'),
        ('if (musicQueue) {musicQueue.delete();}', 'if (musicQueue) musicQueue.delete();')
    ],
    'src/commands/utility/rally.ts': [
        ('if (!role) {return vChannel.members.size > 0;}', 'if (!role) return vChannel.members.size > 0;'),
        ('if (chMember.id === callerId) {return;}', 'if (chMember.id === callerId) return;')
    ],
    'src/commands/utility/start.ts': [
        ('if (msg.channel.isDMBased()) {return false;}', 'if (msg.channel.isDMBased()) return false;')
    ],
    'src/events/interactionCreate/command-handler.ts': [
        ('{await interaction.reply("Sorry, an error has occurred!");}', 'await interaction.reply("Sorry, an error has occurred!");'),
        ('else {await interaction.editReply("Sorry, an error has occurred!");}', 'else await interaction.editReply("Sorry, an error has occurred!");')
    ],
    'src/events/messageCreate/daniel-ty.ts': [
        ('if (msg.author.id !== DANIEL_ID) {return;}', 'if (msg.author.id !== DANIEL_ID) return;')
    ],
    'src/events/messageCreate/khang-neko.ts': [
        ('if (msg.author.id !== KHANG_ID) {return;}', 'if (msg.author.id !== KHANG_ID) return;')
    ],
    'src/events/messageCreate/nyaa-embed.ts': [
        ('if (!msg.content.includes(TARGET_SITE)) {return;}', 'if (!msg.content.includes(TARGET_SITE)) return;'),
        ('if (!(response.statusText === "OK")) {return;}', 'if (!(response.statusText === "OK")) return;'),
        ('if (!embed) {return;}', 'if (!embed) return;'),
        ('if (otakusComment) {userTakes.push({ name: "ot4ku\'s Take", value: otakusComment, inline: true });}', 'if (otakusComment) userTakes.push({ name: "ot4ku\'s Take", value: otakusComment, inline: true });'),
        ('if (rowansComment) {userTakes.push({ name: "Rowan\'s Take", value: rowansComment, inline: true });}', 'if (rowansComment) userTakes.push({ name: "Rowan\'s Take", value: rowansComment, inline: true });')
    ],
    'src/events/messageCreate/question-mark-ending.ts': [
        ('if (!msg.content.endsWith("?")) {return;}', 'if (!msg.content.endsWith("?")) return;')
    ],
    'src/events/messageCreate/train.ts': [
        ('if (msgs.every((e) => e.content === "")) {return;}', 'if (msgs.every((e) => e.content === "")) return;'),
        ('if (msgs.some((e) => e.author.id === client.user.id)) {return;}', 'if (msgs.some((e) => e.author.id === client.user.id)) return;')
    ],
    'src/events/messageCreate/typing-speed-reporter.ts': [
        ('if (numWords < MIN_WORDS) {return 0;}', 'if (numWords < MIN_WORDS) return 0;'),
        ('if (!bdbot.typingTimestamps.has(userId) || !bdbot.typingTimestamps.get(userId)) {return;}', 'if (!bdbot.typingTimestamps.has(userId) || !bdbot.typingTimestamps.get(userId)) return;'),
        ('if (wordCount === 0) {return;}', 'if (wordCount === 0) return;')
    ],
    'src/events/messageCreate/zach-zacc.ts': [
        ('if (msg.author.bot || !content.match(ZACH_REGEX)) {return;}', 'if (msg.author.bot || !content.match(ZACH_REGEX)) return;')
    ],
    'src/events/presenceUpdate/holiday-colors.ts': [
        ('if (!oldPresence || !newPresence) {return;}', 'if (!oldPresence || !newPresence) return;'),
        ('if (oldPresence.status === "offline" && newPresence.status !== "offline") {return;}', 'if (oldPresence.status === "offline" && newPresence.status !== "offline") return;'),
        ('\t\t\t{return;}', '\t\t\treturn;')
    ],
    'src/events/typingStart/type-speed-watcher.ts': [
        ('if (!bdbot.typingTimestamps.has(userId)) {return;}', 'if (!bdbot.typingTimestamps.has(userId)) return;')
    ],
    'src/events/voiceStateUpdate/alone-disconnect.ts': [
        ('if (!connection) {return;}', 'if (!connection) return;'),
        ('if (connection) {connection.destroy();}', 'if (connection) connection.destroy();'),
        ('if (musicQueue) {musicQueue.delete();}', 'if (musicQueue) musicQueue.delete();')
    ],
    'src/events/voiceStateUpdate/good-night.ts': [
        ('if (newState.member.user.bot) {return;}', 'if (newState.member.user.bot) return;'),
        ('if (isProdMode()) {await sendErrorToDiscordChannel(error);}', 'if (isProdMode()) await sendErrorToDiscordChannel(error);'),
        ('else {console.error(error);}', 'else console.error(error);')
    ],
    'src/types/containers/afk-pic-container.ts': [
        ('if (shouldGetStagingPic) {return getRandomElements(this.stagingPics, count).map((p) => p.url);}', 'if (shouldGetStagingPic) return getRandomElements(this.stagingPics, count).map((p) => p.url);')
    ],
    'src/types/containers/cooldown-container.ts': [
        ('if (cd == null) {return false;}', 'if (cd == null) return false;'),
        ('if (!cd) {return;}', 'if (!cd) return;')
    ],
    'src/util/error-helper.ts': [
        ('if (isProdMode()) {await sendErrorToDiscordChannel(errStr);}', 'if (isProdMode()) await sendErrorToDiscordChannel(errStr);')
    ],
    'src/util/music-helpers.ts': [
        ('if (query.includes("youtube")) {searchEngine = QueryType.YOUTUBE_PLAYLIST;}', 'if (query.includes("youtube")) searchEngine = QueryType.YOUTUBE_PLAYLIST;'),
        ('else if (query.includes("spotify")) {searchEngine = QueryType.SPOTIFY_PLAYLIST;}', 'else if (query.includes("spotify")) searchEngine = QueryType.SPOTIFY_PLAYLIST;')
    ],
    'src/util/person-theme-helpers.ts': [
        ('if (queue?.size === 0) {queue.delete();}', 'if (queue?.size === 0) queue.delete();')
    ],
    'src/util/random.ts': [
        ('if (arr.length === 0) {return undefined;}', 'if (arr.length === 0) return undefined;'),
        ('if (count <= 0 || arr.length <= count) {return arr;}', 'if (count <= 0 || arr.length <= count) return arr;')
    ]
}

for file_path, pairs in replacements.items():
    if not os.path.exists(file_path):
        continue
        
    with open(file_path, 'r') as f:
        content = f.read()
        
    for old, new_val in pairs:
        content = content.replace(old, new_val)
        
    with open(file_path, 'w') as f:
        f.write(content)
    
print("Precise literal replacements complete.")
