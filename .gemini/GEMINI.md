# GEMINI.md — BDBot Architectural Reference

> Ground-truth document for AI agents. Maps every decorator, data flow, and operational constraint in this repository.

---

## 1. Stack & Architecture

### Core Technologies

| Layer | Technology | Version Constraint |
|---|---|---|
| Runtime | Node.js (ESM, `"type": "module"`) | `.nvmrc`-pinned |
| Language | TypeScript (ESNext target) | `^5.6` |
| Discord Library | discord.js | `^14.22` |
| Command Framework | discordx | `^11.12` (decorator-driven) |
| Music Player | discord-player + discord-player-youtubei | `^7.2` / `^1.5` |
| ORM / Persistence | Dynamoose → AWS DynamoDB | `^4.0` (region: `us-west-1`) |
| Dev Runner | tsx (dev), tsc → node (prod) | nodemon wraps `tsx` |

### Entrypoint & Boot Sequence (`src/app.ts`)

```
startup()
  ├─ initDb()                          // configures Dynamoose AWS credentials
  ├─ client.once("clientReady") →
  │    ├─ client.initApplicationCommands()  // syncs slash commands with Discord API
  │    └─ bdbot.initContainter(client)      // hydrates AfkPicContainer + CooldownContainer + Player
  ├─ importx(events/**)                // metadata-driven: discordx scans decorators
  ├─ importx(commands/**)
  ├─ importx(context-menus/**)
  └─ client.login(token)              // DEV_BOT_TOKEN or BOT_TOKEN depending on mode
```

**Key detail:** `importx` does not _execute_ the files — it imports them so that `discordx`'s `MetadataStorage` registers every `@Discord()`, `@Slash()`, `@On()`, `@ContextMenu()`, and `@ButtonComponent()` decorator it encounters via `reflect-metadata`. Command registration is therefore **declarative**: you decorate a class and method, and the framework handles wiring.

### The Singleton Pattern: `bdbot`

`export const bdbot = new BDBot()` — a single, module-scoped instance exported from `app.ts`. Every command and event imports `bdbot` directly. It owns:

- `AfkPicContainer` — in-memory cache of all AFK pics + staging pics (loaded from DynamoDB at boot)
- `Map<string, CooldownContainer>` — one container per registered slash command (built from `MetadataStorage` at boot)
- `Map<string, number>` — `typingTimestamps` (in-memory only, no persistence)
- `Player` — discord-player instance with DefaultExtractors + YoutubeiExtractor

### Global Guards

The `Client` is constructed with `guards: [ExceptionCatcher]`. `ExceptionCatcher` is a `GuardFunction` that wraps every `@On()` event handler in a try/catch. In production mode, caught errors are forwarded to a Discord error channel (`DEV_SERVER_ERROR_CHANNEL`). `ConnectTimeoutError` is silently swallowed.

---

## 2. The "Map" — Folder Logic

### `src/commands/` — Slash Commands (Categorized)

Commands return `Promise<boolean>` to signal success/failure to the `CommandHandler`. The return value determines whether the cooldown persists or is cleared.

#### `fun/`
| File | Command | Notes |
|---|---|---|
| `afk-pic.ts` | `/afkpic get`, `/afkpic add` | `@SlashGroup("afkpic")`. Guild-locked to `BD5_DEV_SERVER_IDS`. Add requires `Administrator`. Up to 10 attachments. |
| `april-fools.ts` | _Commented out_ | Mass-renames all guild members to `*Kyle` variants. Saves original nicknames to DynamoDB `old-nickname` table. Undo logic restores them. Gated to `CHRISTINA_ID` on April 1. |
| `bipen.ts` | `/bipen` | — |
| `random-move.ts` | `/randommove` | — |
| `scramble.ts` | `/scramble` | `@CooldownTime(60 * 60 * 1000)` — 1-hour cooldown. Moves all members in caller's VC to random channels. |
| `sword.ts` | `/sword` | — |
| `whip.ts` | `/whip` | — |

#### `music/`
| File | Command | Notes |
|---|---|---|
| `play.ts` | `/play [query]` | Argless = unpause. With query = queue via `discord-player`. `dmPermission: false`. |
| `skip.ts` | `/skip` | — |
| `stop.ts` | `/stop` | — |
| `pause.ts` | `/pause` | — |
| `queue.ts` | `/queue` | — |
| `np.ts` | `/np` | Now-playing with progress bar. |
| `back.ts` | `/back` | — |
| `jump.ts` | `/jump` | — |
| `seek.ts` | `/seek` | — |
| `shuffle.ts` | `/shuffle` | — |
| `raise.ts` | `/raise` | — |
| `top.ts` | `/top` | — |
| `query.ts` | `/query` | — |

#### `utility/`
| File | Command | Notes |
|---|---|---|
| `help.ts` | `/help` | Dynamically reads `MetadataStorage` to build help embed, grouped by `CommandCategory`. |
| `idea.ts` | `/idea submit`, `/idea list` | `@SlashGroup("idea")`. Submit opens a `ModalBuilder`. Stores ideas in DynamoDB `idea` table with UUID PK. List uses `@discordx/pagination`. |
| `rally.ts` | `/rally [role] [where]` | Moves voice members to caller's channel. Optional role filter. `where: "to me"` enables hidden-channel pull. |
| `ping.ts` | `/ping` | — |
| `connect.ts` | `/connect` | — |
| `disconnect.ts` | `/disconnect` | — |
| `spam.ts` | `/spam` | — |
| `jar.ts` | _Disabled (commented out)_ | Planned: topic-based random-draw jar. |
| `schedule.ts` | _Disabled (commented out)_ | Stub. |
| `start.ts` | _Disabled (commented out)_ | Stub with `@ButtonComponent` example. |

### `src/context-menus/`

| File | Trigger | Notes |
|---|---|---|
| `add-afk-pic.ts` | Right-click message → "Add pic to AFK Pics!" | Extracts attachments from target message. Guild-locked. Uses shared `tryAddAfkPics` helper. |

### `src/events/` — Event-Driven Hooks

Each file exports an abstract class decorated with `@Discord()` and one or more `@On({ event: "..." })` methods.

#### `clientReady/`
| File | Event | Behavior |
|---|---|---|
| `status-message.ts` | `clientReady` | Infinite loop rotating bot status every 5 minutes from a hardcoded list of humorous strings. |

#### `interactionCreate/`
| File | Event | Behavior |
|---|---|---|
| `command-handler.ts` | `interactionCreate` | **Critical path.** See §4 below. |

#### `messageCreate/`
| File | Event | Behavior |
|---|---|---|
| `christina-polls.ts` | `messageCreate` | Auto-reacts with numbered emojis (1️⃣–9️⃣) when messages in `CHRISTINA_POLLS_CHANNEL_ID` contain `N:` patterns. |
| `daniel-ty.ts` | `messageCreate` | Responds to Daniel saying "thank bot" or "fuck bot". |
| `epic.ts` | `messageCreate` | Reacts 😎 to "epic" (100% chance) and spells E-P-I-C on 😎 messages (100% chance). |
| `heavy-dollar-sign.ts` | `messageCreate` | 0.5% chance to react 💲 to _any_ message. |
| `khang-neko.ts` | `messageCreate` | 0.5% chance to react with custom Neko emoji to Khang's messages in BD5. |
| `nyaa-embed.ts` | `messageCreate` | Detects `nyaa.si/view/` links, suppresses default embed, scrapes the page with Cheerio, and builds a rich embed with seeders/leechers/comments from specific users (Rowan, ot4ku). |
| `question-mark-ending.ts` | `messageCreate` | 0.3% chance to respond with a "Kyle dumb question" image when a message ends with `?`. |
| `train.ts` | `messageCreate` | Detects when 4 unique users send the same message in a row (`@Guard(GuildOnly)`), then the bot joins the "train". |
| `typing-speed-reporter.ts` | `messageCreate` | Calculates WPM for users in `typingTimestamps` map. Exponential chance function based on word count (min 8 words, max 5% chance). |
| `zach-zacc.ts` | `messageCreate` | 7.5% chance to correct "Zach" → "Zacc" in messages. |

#### `typingStart/`
| File | Event | Behavior |
|---|---|---|
| `type-speed-watcher.ts` | `typingStart` | Records initial typing timestamp for tracked users. Resets if >30s since last recorded timestamp. Works in tandem with `typing-speed-reporter.ts`. |

#### `presenceUpdate/`
| File | Event | Behavior |
|---|---|---|
| `holiday-colors.ts` | `presenceUpdate` | Assigns random holiday-themed color roles (St. Patrick's, Halloween, Christmas) based on month. Triggers on online↔offline transitions with a 6-hour per-member cooldown. Performs bulk role assignment/removal when entering/leaving a holiday month. |

#### `voiceStateUpdate/`
| File | Event | Behavior |
|---|---|---|
| `alone-disconnect.ts` | `voiceStateUpdate` | If the bot is alone in a voice channel (no human members), destroys the connection and deletes the music queue. |
| `asian-kyle-random-mute.ts` | `voiceStateUpdate` | Randomly server-mutes AsianKyle on VC state change. **Currently disabled** (`MUTE_ASIAN_KYLE_CHANCE = 0`). |
| `good-night.ts` | `voiceStateUpdate` | When the last person leaves VC between 10PM–5AM in BD5, sends a "goodnight" embed with an anime GIF (from Tenor API) mentioning everyone who left in the last 15 minutes. 10% chance of a "kiss" variant. |
| `people-themes.ts` | `voiceStateUpdate` | Plays entry theme songs (local `.mp3` files) when specific users join VC. Justin → "Ghost Train Robbery" (100% chance), Daniel → "Toxic" (100% chance). Auto-disconnects after 5 seconds if no other tracks queued. |

### `src/util/` — Helpers Index

All re-exported through `src/util/index.ts` barrel file.

| File | Purpose |
|---|---|
| `cooldown-helper.ts` | Builds cooldown key strings from command name/group/subgroup. Two variants: from metadata (`getCmdCooldownStr`) and from live interaction (`getCmdCooldownStrInteraction`). |
| `db-helper.ts` | `initDb()` — loads `.env`, configures Dynamoose with AWS credentials and `us-west-1` region. |
| `voice-channel.ts` | `hasHumans()` — checks if a voice channel has non-bot members. |
| `embed-helpers.ts` | `getRandomHexColorStr()` — random color for embeds. |
| `enum-helper.ts` | `getEnumValues()` — extracts values from TypeScript string enums. |
| `error-helper.ts` | `ExceptionCatcher` guard, `sendErrorToDiscordChannel()`, error string formatters. |
| `general.ts` | **Removed.** Replaced with idiomatic `== null` / `!= null` checks pervasively. |
| `idea-helpers.ts` | `buildIdeaEmbeds()` — paginated embed builder for `/idea list`. |
| `music-helpers.ts` | `queueSong()`, `getSearchResult()`, `findTrack()`, `isQueueValid()`, `createNpString()`. |
| `person-theme-helpers.ts` | `tryPlayPersonTheme()` — plays a local audio file in the user's VC with random seek, auto-disconnects after 5s. |
| `print-space.ts` | `printSpace()` — logs a blank line for console readability. |
| `random.ts` | `random(chance)` — percent-based boolean. `getRandomElement()`, `getRandomElements()`. |
| `settings-helpers.ts` | `isDevMode()`, `isProdMode()` — checks `BDBOT_PROD_MODE` env var. |
| `sleep.ts` | `sleep(ms)` — Promise-based delay. |
| `message-helper.ts` | `tryReactMessage()` — safe emoji reaction wrapper. |
| `afk-pic-helper.ts` | `tryAddAfkPics()` — validates URLs (Discord CDN or Imgur, `.png`/`.jpg`/`.jpeg` only), sanitizes, adds to staging via `bdbot`. |
| `guards.ts` | `GuildOnly` — guard for `@On()` events only; blocks non-guild events. `BD5Only` — guard for `@On()` events only; blocks execution outside BD5. Not re-exported from barrel (imported directly from `guards.js`). |

### `src/types/` — Type Definitions & Data Layer

| Subdirectory/File | Purpose |
|---|---|
| `command.ts` | `CommandCategory` enum: `Fun`, `Utility`, `Music`, `ContextMenu`. |
| `cooldown-time.ts` | Custom `@CooldownTime(ms)` decorator. Injects `cooldownTime` into `MetadataStorage` metadata via `Modifier`. |
| `containers/bot-container.ts` | `BDBot` class — the singleton. |
| `containers/afk-pic-container.ts` | `AfkPicContainer` — loads all user pics + staging pics from DynamoDB at init. Maintains `userPicsMap` and `allPics` in memory. |
| `containers/cooldown-container.ts` | `CooldownContainer` — write-through cache backed by DynamoDB `cooldown` table. |
| `data-access/*.ts` | Dynamoose models, schemas, and query functions. See §3. |

### `src/scripts/` — Standalone Scripts

| File | Purpose |
|---|---|
| `backupAfkPics.ts` | Downloads all AFK pic URLs (regular + staging) to local `afk-pics/` directory with SHA-256 hashed filenames. |
| `loadLocalAfkPics.ts` | Reads local `pics/AFK_PICS/*.{jpg,png}` files, uploads to Discord (via dev channel), extracts CDN URLs, writes `UserAfkPic` records to DynamoDB. Maps filenames to users via `AfkPicCodeMap`. |
| `cs-predict-reminder.ts` | Polls `csgo-predict-api` for upcoming matches, sends reminder embeds to BD5 members. Currently disabled in `app.ts` (commented-out `setInterval`). |

---

## 3. Data Schema & Persistence

All tables are DynamoDB in `us-west-1`. Dynamoose auto-creates tables if they don't exist.

### `user-afk-pic`

| Attribute | Type | Key | Index |
|---|---|---|---|
| `filename` | String | **Hash Key** | — |
| `userId` | String | **Range Key** | GSI: `userIdGlobalIndex` (global) |
| `url` | String | — | — |
| `submitterUserId` | String (optional) | — | — |
| `createdAt` / `updatedAt` | Timestamp | — | — (auto via `timestamps: true`) |

**Design note:** A single photo with multiple people produces one record _per user_ (same `filename`, different `userId`). This enables efficient per-user queries via the GSI but means "all pics" requires deduplication (handled by `populatePics()` using a `Set`).

### `staging-afk-pic`

| Attribute | Type | Key |
|---|---|---|
| `url` | String | **Hash Key** |
| `submitterUserId` | String | — |
| `createdAt` / `updatedAt` | Timestamp | — |

Staging pics are user-submitted photos awaiting manual categorization. They are served alongside regular pics but have no `userId` association.

### `cooldown`

| Attribute | Type | Key |
|---|---|---|
| `idToCooldown` | String | **Hash Key** |
| `name` | String | **Range Key** |
| `date` | Date (stored as epoch seconds) | — |

`idToCooldown` is polymorphic: it can be a bare `userId`, a composite `guildId-userId`, or a bare `guildId` (for guild-wide cooldowns). The cooldown name is the kebab-formatted command path (e.g., `afkpic_get`).

### `idea`

| Attribute | Type | Key | Index |
|---|---|---|---|
| `id` | String (UUID v4) | **Hash Key** | — |
| `userId` | String | — | GSI (with `type` as range key) |
| `type` | String (`utility` / `fun` / `music` / `general`) | — | GSI range |
| `description` | String | — | — |
| `completed` | Boolean | — | — |
| `createdAt` / `updatedAt` | Number | — | — |

### `old-nickname`

| Attribute | Type | Key |
|---|---|---|
| `userId` | String | **Hash Key** |
| `name` | String (optional) | — |

Used exclusively by the April Fools nickname system. Stores pre-prank nicknames for later restoration.

---

## 4. Command Architecture — The Full Lifecycle

### Decorator Stack (Required for a New Command)

```typescript
@Discord()                              // Registers class with discordx MetadataStorage
@Category(CommandCategory.Fun)          // Used by /help to categorize
@CooldownTime(60 * 1000)               // Optional: override default 500ms cooldown
@Guild(BD5_DEV_SERVER_IDS)              // Optional: restrict to specific guilds
class MyCommand {
  @Slash({ name: "mycommand", description: "...", dmPermission: false })
  async run(
    @SlashOption({ ... }) arg: string,
    interaction: CommandInteraction
  ): Promise<boolean> {                 // MUST return boolean
    // ... logic ...
    return true;                        // true = keep cooldown, false = clear cooldown
  }
}
```

### `CommandHandler` — The Central Dispatcher (`events/interactionCreate/command-handler.ts`)

This is the **single most important class** in the bot. It intercepts every `interactionCreate` event and orchestrates the full command lifecycle:

```
interactionCreate fires
  ├─ Non-ChatInputCommand? → client.executeInteraction() directly (context menus, buttons, modals)
  │     └─ Error? → log + sendErrorToDiscordChannel (prod only)
  └─ ChatInputCommand? → processCmd()
       ├─ Build cooldown key from interaction (name + subgroup + subcommand)
       ├─ Check bdbot.isOnCooldown() → if on cooldown AND isProdMode() → reject
       ├─ bdbot.putOnCooldown() ← INITIAL cooldown (prevents duplicate execution)
       ├─ client.executeInteraction() → calls the @Slash handler
       ├─ Result === true?
       │    └─ bdbot.putOnCooldown() ← REFRESH cooldown (extends with configured duration)
       └─ Result === false?
            └─ bdbot.endCooldown() ← CLEAR cooldown (failed commands don't penalize)
       └─ Exception?
            ├─ Log error + sendErrorToDiscordChannel (prod)
            ├─ Reply/editReply "Sorry, an error has occurred!"
            └─ bdbot.endCooldown() ← CLEAR cooldown on error
```

**Critical insight:** Cooldowns are enforced _before_ the command handler runs the actual command, but the command author does not need to manage cooldowns — they just return `true`/`false`. The default cooldown is `0.5 * 1000` ms (500ms) unless overridden with `@CooldownTime()`.

**Dev mode bypass:** Cooldown checks are skipped entirely in dev mode (`isDevMode()`).

### Cooldown Storage Architecture

`CooldownContainer` implements a **write-through cache**:
1. Check local `Collection<string, Cooldown>` first.
2. On miss, query DynamoDB `cooldown` table.
3. On write, update/create in DynamoDB, then cache locally.

This means cooldowns survive bot restarts (they're persisted). Guild-wide cooldowns use the bare `guildId` as the key, while per-user cooldowns use `guildId-userId`.

---

## 5. Operational Gotchas — The Knowledge Base

### How to Add a New Slash Command

1. Create `src/commands/<category>/my-command.ts`.
2. Decorate the class with `@Discord()`, `@Category(CommandCategory.X)`.
3. Decorate the method with `@Slash({ name, description })`.
4. Return `Promise<boolean>` — `true` if the command should remain on cooldown, `false` to clear.
5. Optionally add `@CooldownTime(ms)`, `@Guild(ids)`, `@SlashGroup()`, or `@SlashOption()`.
6. **No registration code needed.** `importx(commands/**)` auto-discovers and `MetadataStorage` handles the rest.
7. **File-extension handling:** `importx` globs `.ts` in dev mode and `.js` in prod mode (`isProdMode() ? "js" : "ts"`).

### How to Add a New Event Handler

1. Create `src/events/<eventName>/my-handler.ts`.
2. Decorate: `@Discord()` on class, `@On({ event: "<eventName>" })` on method.
3. Method signature: `private async handler([...args]: ArgsOf<"eventName">)`.
4. The `ExceptionCatcher` global guard wraps all `@On()` handlers automatically.
5. Use `@Guard(GuildOnly)` if the handler should ignore DM-originated events.

### Music Queue Behavior

- **`AloneDisconnect`:** When the last human leaves the bot's voice channel, the voice connection is destroyed and the music queue is deleted. This is a `voiceStateUpdate` event — it fires reactively, not on a timer.
- **Person Themes:** Playing a theme song creates a temporary queue. If no other songs are queued, the queue is deleted after a 5-second `sleep()`. This can race with `AloneDisconnect` but is benign.
- **Player initialization:** `DefaultExtractors` + `YoutubeiExtractor` are loaded. The `playerStart` event sends a "Now playing" message to the channel stored in `queue.metadata.channel`.

### "Kyle-Specific" Logic

This bot is built for a specific friend group. Hardcoded user IDs in `constants.ts` drive personalized behavior:

| Feature | User(s) | Mechanism |
|---|---|---|
| Typing speed reports | Daniel (and anyone added to `typingTimestamps`) | `typingStart` records timestamp → `messageCreate` calculates WPM. Exponential chance function. Daniel is the only user pre-seeded in the map. |
| `AsianKyleRandomMute` | AsianKyle | Server-mutes on VC join. **Currently chance = 0 (disabled).** |
| `DanielTy` | Daniel | Responds to "thank bot" / "fuck bot". |
| Entry themes | Justin M, Daniel | Plays local MP3 on VC join (100% chance for both). |
| `KhangNeko` | Khang | Custom emoji reaction (0.5% chance). |
| `ZachZacc` | Anyone mentioning "Zach" | Corrects to "Zacc" (7.5% chance). |
| April Fools | All BD5 members | Mass-rename to `*Kyle`. Gated to Christina on April 1. |
| Holiday Colors | All BD5 members | Auto-assigns seasonal color roles. |

### AfkPic Pipeline

```
User submits pic (slash command or context menu)
  → validateAfkPics() — checks URL domain (Discord CDN or Imgur), file extension, sanitizes
  → bdbot.tryAddAfkPics() — checks for duplicate URLs in memory
  → StagingAfkPicTypedModel.create() — persists to DynamoDB staging table
  → Added to in-memory stagingPics array

Pic retrieval:
  /afkpic get → random from allPics + stagingPics (combined)
  /afkpic get --new → random from stagingPics only
  /afkpic get --user → random from userPicsMap (regular pics only, no staging)
```

**Loading on boot:** `AfkPicContainer.initContainer()` queries DynamoDB for all `UserAfkPic` records (per user via `AfkPicCodeMap`) and all `StagingAfkPic` records. This data is held in memory for the bot's lifetime.

### The `AfkPicCodeMap` System

`AfkPicCodeMap` maps 2-3 letter codes (e.g., `"DK"`, `"EW"`) to Discord user IDs. These codes are embedded in filenames of locally-stored photos (`pics/AFK_PICS/`). The `loadLocalAfkPics` script parses filenames to determine which users appear in each photo, then creates corresponding `UserAfkPic` records in DynamoDB.

---

## 6. Development Workflow

### Mode Switching

| Mode | Trigger | Token | Error Reporting | Cooldowns |
|---|---|---|---|---|
| **Dev** | Default (no env var) | `DEV_BOT_TOKEN` | Console only | Bypassed |
| **Prod** | `BDBOT_PROD_MODE=TRUE` | `BOT_TOKEN` | Console + Discord channel | Enforced |

- `isDevMode()` / `isProdMode()` check `process.env.BDBOT_PROD_MODE !== "TRUE"`.
- Start commands: `npm run start` (dev via tsx) / `npm run start-prod` (prod via compiled JS with `cross-env`).
- `npm run dev` → nodemon watching `src/` → restarts on `.ts` changes.

### Environment Variables (`.env`)

| Variable | Purpose |
|---|---|
| `BOT_TOKEN` | Production Discord bot token |
| `DEV_BOT_TOKEN` | Development Discord bot token |
| `DYNAMO_ACCESS_KEY_ID` | AWS IAM access key for DynamoDB |
| `DYNAMO_SECRET_ACCESS_KEY` | AWS IAM secret key |
| `TENOR_API_KEY` | Tenor GIF API (used by good-night event) |
| `CS_PREDICT_PASSWORD` | Auth for csgo-predict-api reminders |
| `<cs-predict-user-id>` | Maps CS Predict user IDs to Discord user IDs (dynamic keys) |

### Build & Lint

```bash
npm run build       # tsc → dist/
npm run format      # prettier
npm run lint        # eslint (airbnb-typescript base)
```

### TypeScript Configuration Notes

- `emitDecoratorMetadata: true` and `experimentalDecorators: true` are **required** for discordx.
- `reflect-metadata` must be imported first (line 1 of `app.ts`).
- `moduleResolution: "node"` with ESM (`module: "ESNext"`) requires `.js` extensions in all import paths.

---

## 7. Dependency Graph (Simplified)

```
app.ts
  ├── BDBot (singleton)
  │     ├── AfkPicContainer
  │     │     ├── data-access/afk-pic.ts (Dynamoose model)
  │     │     └── data-access/staging-afk-pic.ts (Dynamoose model)
  │     ├── CooldownContainer (one per command)
  │     │     └── data-access/cooldown.ts (Dynamoose model)
  │     └── discord-player (Player)
  │           ├── DefaultExtractors
  │           └── YoutubeiExtractor
  ├── commands/**  →  import bdbot, use @Slash/@SlashGroup/@SlashOption
  ├── events/**    →  import bdbot/client, use @On
  └── context-menus/** → import bdbot, use @ContextMenu
```

---

## 8. Critical Patterns for Agents

### Return Values Matter
Every `@Slash` handler **must** return `Promise<boolean>`. Returning `true` keeps the cooldown active; returning `false` clears it (allowing immediate re-use). Forgetting to return or returning `void` will cause `CommandHandler` to treat the result as falsy and clear the cooldown.

### Interaction Reply Timing
- If a command takes >3 seconds, call `interaction.deferReply()` first, then `interaction.editReply()`.
- If a command replies but then errors, `CommandHandler` tries `editReply()` as fallback.
- If >15 minutes pass, the interaction token expires and neither reply nor editReply works.

### Guild Locking
Commands decorated with `@Guild(BD5_DEV_SERVER_IDS)` are registered as guild-specific commands (only visible in those servers). Commands without `@Guild()` are registered globally (visible in all servers + DMs unless `dmPermission: false`).

### Extending `MetadataStorage`
The `@CooldownTime(ms)` decorator is a custom extension that injects a `cooldownTime` property onto `DApplicationCommand` metadata via `Modifier.create()`. To add new per-command metadata:
1. Define an interface (e.g., `ICooldownTime`).
2. Create a decorator function that calls `MetadataStorage.instance.addModifier()`.
3. Cast command metadata to your interface where accessed (e.g., in `initCooldowns()`).

---

## 9. AI-First Development Workflow

This project uses an **AI-first, issue-driven development workflow**. Agents are spawned to tackle individual GitHub issues and produce pull requests for human review.

> **Agents:** The full step-by-step playbook for working on an issue lives at `.gemini/skills/issue-workflow.md`. Read that file (using `IsSkillFile: true`) before doing anything else. The sections below are a summary for human reference.

### Antigravity Workspace Configuration

For the best experience when working with multiple agents and worktrees simultaneously, it is recommended to set your Antigravity workspace root to the **container directory** (e.g., `/home/kyle/Repos/DiscordBot/`).

This enables:
- **Unified Sidebar:** View the main repository (`main/`) and all active `issue-N` worktrees in a single file tree.
- **Agent Interoperability:** Agents can more easily see the global state of the project and cross-reference other worktrees without needing to switch primary workspaces.
- **Fast context switching:** Switch between different agent tasks simply by clicking files in different root folders.

### The Pipeline

```
GitHub Issue (backlog)
  → Agent spawned with issue context
  → Agent creates feature branch: git checkout -b issue-<N>-<slug>
  → Agent implements changes, commits with conventional commits
  → Agent pushes branch and opens a GitHub PR referencing the issue
  → Human (Kyle) reviews and merges the PR
```

### Branch Naming

Feature branches must follow this convention:

```
issue-<github-issue-number>-<short-kebab-slug>
```

Examples:
- `issue-42-add-scramble-cooldown-reset`
- `issue-17-fix-nyaa-embed-parsing`

### Commit Message Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[optional body]

Closes #<issue-number>
```

Types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`  
Scope: the affected area, e.g., `music`, `afkpic`, `events`, `util`

Example:
```
feat(music): add /seek command with timestamp validation

Adds a new /seek slash command that accepts a time string (MM:SS or seconds).
Validates against track duration before seeking.

Closes #23
```

### PR Description Template

When opening a PR, the agent should include:

```markdown
## Summary
<!-- What does this change do and why? -->

## Changes
<!-- Bullet list of files changed and why -->

## Testing Notes
<!-- What should the reviewer manually test? Does it require dev bot? -->

Closes #<issue-number>
```

### Agent Constraints for This Repo

1. **Never push to `main` directly.** Always work on a feature branch.
2. **Always run `npm run build` before opening a PR** to confirm the TypeScript compiles. If it fails, fix the errors before creating the PR.
3. **Run `npm run lint` and `npm run format`** before committing. Fix any errors; warnings are acceptable.
4. **Do not modify `.env`** or any file containing secrets. The `.env` file is gitignored and must never be committed.
5. **Do not run the bot** (`npm run start` or `npm run dev`) as part of issue work — the bot connects to live Discord and DynamoDB. Code changes should be validated via `tsc` only.
6. **GEMINI.md is authoritative.** Read it fully before writing any code. Do not contradict patterns defined here.
7. **One issue per branch.** Do not bundle unrelated changes. If you notice an unrelated bug while working, note it in a comment but don't fix it in the current PR.
8. **Check existing patterns before creating anything new.** Similar commands, event handlers, and util functions may already exist. Re-use before creating.

### What an Agent Should Do When Spawned for an Issue

1. Read this entire `GEMINI.md` for context.
2. Fetch the GitHub issue body to understand the full requirements.
3. Explore relevant source files to understand the current implementation.
4. Create and check out the feature branch.
5. Implement the changes, following all patterns in §4, §5, and §8.
6. Run `npm run build` — fix all TypeScript errors.
7. Run `npm run lint` and `npm run format`.
8. Commit the changes with a conventional commit message.
9. Push the branch and open a GitHub PR with the template above.
10. Report back a summary of what was done and any open questions for review.
