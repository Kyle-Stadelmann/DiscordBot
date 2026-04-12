# BDBot Issue Workflow Skill

> Skill file for Antigravity agents. When the user says "work on GitHub issue #N", follow every step here in order. Do not skip steps or reorder them.

---

## Phase 0 — Orientation (Always First)

1. Read `/home/kyle/Repos/DiscordBot/main/GEMINI.md` in full. This is the ground-truth architectural reference for the project. Do not write any code until you have read it.
2. Confirm the repo root is `/home/kyle/Repos/DiscordBot/main`.
3. Check your current git status:
   ```bash
   git -C /home/kyle/Repos/DiscordBot/main status
   git -C /home/kyle/Repos/DiscordBot/main branch
   ```

---

## Phase 1 — Fetch the Issue

Run the following to get the full issue body, labels, and comments:

```bash
gh issue view <N> --repo Kyle-Stadelmann/DiscordBot --json number,title,body,labels,comments
```

> ⚠️ `gh` commands require user approval before running. Always present the exact command to the user and wait for approval.

Parse the output to understand:
- What problem is being solved?
- Is there acceptance criteria defined?
- Are there any design decisions implied or explicit in the comments?

---

## Phase 2 — Research & Planning

Before writing any code:

1. **Identify affected files.** Search the codebase for relevant commands, events, util, or types. Use grep / file exploration tools — do not assume file locations.
2. **Check for existing patterns.** If adding a new command, check `src/commands/` for similar commands to follow as a template. Same for events (`src/events/`) and utilities (`src/util/`).
3. **Identify ambiguities.** List any questions where the issue is unclear and you cannot make a confident default decision. **Prefer making decisions autonomously** — only escalate if both options are plausible and the wrong choice would require significant rework.
4. **Draft a concise implementation plan** (bullet points, not prose) and present it to the user. Include:
   - Files you will create, modify, or delete
   - Key decisions you made autonomously (and why)
   - Any questions that require user input before proceeding
5. **Wait for user approval** on the plan before writing code. If the user has no feedback, proceed.

---

## Phase 3 — Worktree Setup

Once the plan is approved, set up an isolated workspace:

```bash
# From inside /home/kyle/Repos/DiscordBot/main
git -C /home/kyle/Repos/DiscordBot/main worktree add ../issue-<N> -b issue-<N>-<short-kebab-slug>
```

- Replace `<N>` with the issue number.
- Replace `<short-kebab-slug>` with a 3–5 word kebab-case description of the issue (e.g., `add-seek-command`, `fix-nyaa-embed`).
- All subsequent file edits must target the worktree path: `/home/kyle/Repos/DiscordBot/issue-<N>/`

> ⚠️ Confirm this `git worktree add` command with the user before running.

After the worktree is created, immediately symlink the two shared resources from the main repo. These are safe to run without user approval:

```bash
# Run from within the worktree directory /home/kyle/Repos/DiscordBot/issue-<N>
# node_modules — worktrees don't get their own copy; share from main repo
ln -sf ../main/node_modules /home/kyle/Repos/DiscordBot/issue-<N>/node_modules

# .env — secrets live only in one place; worktree points at the same file
ln -sf ../main/.env /home/kyle/Repos/DiscordBot/issue-<N>/.env
```

Both symlinks are required:
- `node_modules` — needed for `npm run build` / `npm run lint` to resolve dependencies.
- `.env` — needed to run the bot for local testing (`npm run start`).

---

## Phase 4 — Implementation

Work inside the worktree. Follow all architectural patterns from `GEMINI.md`:

- **New slash commands:** See §4 and §5 "How to Add a New Slash Command". Return `Promise<boolean>`. Register via decorators — no manual wiring.
- **New event handlers:** See §5 "How to Add a New Event Handler". Use `@Discord()` + `@On()`.
- **New utility functions:** Add to `src/util/`, export from `src/util/index.ts` barrel.
- **Never touch `.env`**, `node_modules`, `dist/`, or any file with secrets.
- **One issue, one branch.** If you notice an unrelated bug, add a `// TODO(issue#N): <description>` comment and move on.

### Implementation Checklist

- [ ] All new/modified files have correct TypeScript types (no `any` unless pre-existing pattern)
- [ ] `Promise<boolean>` return on any new `@Slash` handler
- [ ] `interaction.deferReply()` called if operation may take >3 seconds
- [ ] New util functions exported from `src/util/index.ts` if they're intended to be shared
- [ ] No hardcoded secrets or tokens

---

## Phase 5 — Validation (Build & Lint)

Run these in order inside the worktree. Fix all errors before proceeding to the next step.

```bash
# TypeScript compile check
npm --prefix /home/kyle/Repos/DiscordBot/issue-<N> run build

# Lint
npm --prefix /home/kyle/Repos/DiscordBot/issue-<N> run lint

# Format
npm --prefix /home/kyle/Repos/DiscordBot/issue-<N> run format
```

> **Do NOT run `npm run start`, `npm run dev`, or any command that starts the bot.** The bot connects to live Discord and AWS DynamoDB. Validation is build + lint only.

If `npm run build` fails, fix TypeScript errors and loop until it passes. Do not open a PR with a failing build.

---

## Phase 6 — Commit

Stage and commit all changes with a conventional commit message:

```
<type>(<scope>): <short description>

<optional body — explain the why, not the what>

Closes #<N>
```

- **Types:** `feat`, `fix`, `refactor`, `chore`, `docs`, `test`
- **Scope:** the affected subsystem, e.g., `music`, `afkpic`, `events`, `util`

Example:
```
feat(music): add /seek command with timestamp validation

Users can now seek to a specific position in the current track using MM:SS 
or raw seconds. Input is validated against track duration before seeking.

Closes #23
```

Run:
```bash
git -C /home/kyle/Repos/DiscordBot-issue-<N> add -A
git -C /home/kyle/Repos/DiscordBot-issue-<N> commit -m "<message>"
```

---

## Phase 7 — Push & Open PR

Push the branch:
```bash
git -C /home/kyle/Repos/DiscordBot/issue-<N> push -u origin issue-<N>-<slug>
```

> ⚠️ Requires user approval before running.

Open a PR using the `gh` CLI:
```bash
gh pr create \
  --repo Kyle-Stadelmann/DiscordBot \
  --base main \
  --head issue-<N>-<slug> \
  --title "<type>(<scope>): <short description>" \
  --body "$(cat <<'EOF'
## Summary
<What this change does and why>

## Changes
- `src/...`: <reason>
- `src/...`: <reason>

## Testing Notes
<What Kyle should manually test when connected to the dev bot. Be specific — which command, what input, what to expect.>

Closes #<N>
EOF
)"
```

> ⚠️ Requires user approval before running. Review the full PR body before submitting.

---

## Phase 8 — Handoff & Waiting State

After the PR is open, report back:

```
✅ PR opened: <GitHub PR URL>

Branch: issue-<N>-<slug>
Worktree: /home/kyle/Repos/DiscordBot-issue-<N>
PR number: #<PR-number>

Review the PR on GitHub. Leave review comments, inline comments, or
a general review directly on the PR — no need to copy-paste anything.

When ready:
- To address your feedback: come back and say "check PR #<PR-number> feedback"
- To clean up after merging: tell me "PR #<PR-number> was merged"
```

Stay available in this conversation for follow-up feedback. Do not close the worktree until the user confirms the PR is merged.

---

## Phase 9 — Feedback Iteration (If Requested)

Triggered when the user says something like **"check PR #<PR-number> feedback"**.

### Step 1 — Fetch All Review Comments

Run this to pull the full review state from GitHub:

```bash
gh pr view <PR-number> --repo Kyle-Stadelmann/DiscordBot \
  --json number,title,state,reviews,comments,reviewComments
```

> ⚠️ Requires user approval before running.

The three relevant fields:
- **`reviews`** — Formal review submissions (Approve / Request Changes + summary body)
- **`comments`** — Conversation-tab comments on the PR (general discussion)
- **`reviewComments`** — Inline diff comments tied to specific file + line

Parse all three. Deduplicate if the same point is made in both a `review` body and a `reviewComment`. Summarize what changes are being requested before implementing anything.

### Step 2 — Confirm Understanding

Present a bullet list of the changes you plan to make based on the feedback. If any comment is ambiguous, ask for clarification before proceeding. If you can make a reasonable autonomous decision, state it and proceed.

### Step 3 — Implement

Make all requested changes inside the worktree (`/home/kyle/Repos/DiscordBot-issue-<N>/`).

### Step 4 — Validate

Re-run Phase 5 (build + lint + format). Fix all errors.

### Step 5 — Commit & Push

Amend or add a commit:
- Prefer `git commit --amend` for small fixes on a single-commit branch.
- Use a new commit for substantial changes (> ~10 lines or new files).

Push:
```bash
git -C /home/kyle/Repos/DiscordBot-issue-<N> push --force-with-lease origin issue-<N>-<slug>
```

> ⚠️ Requires user approval.

### Step 6 — Report Back

Summarize what was changed in response to each piece of feedback. Tell the user the PR has been updated and is ready for re-review.

---

## Phase 10 — Cleanup (After Merge Confirmed)

When the user says the PR is merged:

1. Verify via:
   ```bash
   gh pr view <PR-number> --repo Kyle-Stadelmann/DiscordBot --json state,mergedAt
   ```
   > ⚠️ Requires user approval.

2. Remove the worktree:
   ```bash
   git -C /home/kyle/Repos/DiscordBot/main worktree remove ../issue-<N>
   ```
   > ⚠️ Requires user approval.

3. Optionally delete the remote branch (GitHub usually handles this if "delete branch on merge" is enabled in the repo settings). If not:
   ```bash
   git -C /home/kyle/Repos/DiscordBot push origin --delete issue-<N>-<slug>
   ```
   > ⚠️ Requires user approval.

4. Confirm cleanup is complete and the conversation can be closed.

---

## Quick Reference — Approval Gates

The following always require explicit user approval before executing:

| Action | Command prefix |
|---|---|
| Fetch issue | `gh issue view` |
| Create worktree + branch | `git worktree add` |
| Push branch | `git push` |
| Open PR | `gh pr create` |
| **Fetch PR review comments** | `gh pr view --json reviews,comments,reviewComments` |
| Force-push | `git push --force-with-lease` |
| Verify PR merge | `gh pr view --json state,mergedAt` |
| Remove worktree | `git worktree remove` |
| Delete remote branch | `git push origin --delete` |

All other commands (file edits, `npm run build`, `npm run lint`, `grep`, directory exploration) are safe to run without approval.
