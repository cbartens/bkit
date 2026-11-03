## #764 — Map each of the five harms to the hook or deny rule that blocks it (open)

### Problem

`.bkit/authoring.md` keeps capital letters (NEVER, ALWAYS, MUST, ONLY, PROHIBITED) for five harms: destroying data, leaking a secret, publishing or pushing, skipping the owner's approval, and breaking a field a program parses. Capitals only tell the model that a rule is a hard limit. The model still decides each time whether the line applies. Anthropic's Claude Code guide says a rule with no exceptions belongs in a hook or a deny rule for that reason. Nobody has checked which of these hard limits a hook or deny rule actually enforces, and which rely only on capitals in the rules.

Split out of #747 — Prompting practice: align authoring.md with tier-1 makers' guides (https://github.com/cbartens/bkit/issues/747), finding 7. #462 — Review and adopt Krohn patterns (https://github.com/cbartens/bkit/issues/462, closed) made the same point.

### Outcome

Every hard limit in `.bkit/core/.agents/rules.md` is either enforced on all five hosts, or is recorded as prose-only with the reason. The places where a missing hook is worth building are decided, and each becomes its own change issue.

### Current map (from the source, 2026-10-30)

Where it says Claude settings below, the same policy reaches Cursor, Codex and Antigravity through `.bkit/core/hooks/guardrails-tiers.js`, and OpenCode through its bash permission map. "Ask" means the host stops and asks the human before running the command. "Deny" means it never runs.

<!-- prettier-ignore -->
| Harm | Hard limit in `rules.md` | What enforces it today | Gap |
| --- | --- | --- | --- |
| Destroy data | **Destructive git**: never `git reset` (any flavour), `git checkout -- .`, `git restore .`, `git clean`, `git rebase -i`, `git stash drop` / `clear`, force push | Ask: `git reset --hard`, `git clean -f*`, `git checkout -- .`, `git restore .`, `git rebase -i`, `git stash drop` / `clear`, `git filter-branch`, `gh repo delete`, `gh release delete`, `gh pr close`. Deny: `rm -rf` on `/`, `~` or `$HOME` itself, `chmod -R 777 /` | The rule says never, but the hosts only ask, so a human click lets the command run. `git reset` without `--hard` is not covered. `rm -rf` on anything below the home folder, `git branch -D`, `git push --delete` and `git tag -d` are not covered |
| Leak a secret | **Secrets**: never stage `.env*`, credentials, tokens or keys. **Secrets in output**: never print secret values. **PII**: never log raw PII | Deny: reading `*.pem`, `*.p12`, `id_rsa`. Ask: reading `.env`, `.env.*`, `.bkit/.env`, including shell reads such as `cat .env`. `.gitignore` keeps `.env` and `.env.*` out of commits. Off-allowlist `curl` / `wget` gets a warning only | Nothing stops a secret value reaching a reply, a tracker comment, a commit message or a log once it has been read. PII logging has no check |
| Publish or push | **Pushes**: always ask before a push. **Force push**: never force-push `dev` / `main` | Deny: every form of force push. Ask: `npm` / `pnpm` / `bun publish` | A plain `git push` runs with no prompt, so this rests on the capitals alone. `gh pr create`, `gh pr merge`, `gh release create` and tracker writes (comments, issue edits) have no gate |
| Skip the owner's approval | **Tracker issue creation**: create only after confirmation. **Migrations**: build only after the owner confirms. GateGuard's gate-config note: always get sign-off for a quality-gate config change | Ask: `--no-verify` and `git commit -n`. GateGuard shows the gate-config note once per file, as advice only | Every approval rule apart from `--no-verify` is prose-only. GateGuard's config note does not block |
| Break a parsed field | Verdicts, field labels and headings that workflows parse | Tests run at pre-commit and in CI: `prompt-notation.test.ts`, `workflow-shape.test.ts`, the `instructions.ts` check, `bkit tests plan-check` | Enforced, but only after the edit, at commit time. That is enough, because the commit fails before the change lands |

### Success criteria

- Each row above has a decision: build a hook or deny rule, keep ask, or record it as prose-only with the reason.
- Any rule whose wording says "never" but whose host setting is "ask" either has its wording or its setting changed so the two agree.
- Each guard chosen for building has its own change issue, covering all five hosts.

### Constraints and non-goals

- Every new guard needs its nearest equivalent on Claude Code, Cursor, Codex, OpenCode and Antigravity, or a sourced note that a host has none.
- Shipped settings stay stack-agnostic.
- Blanket-denying every git command the workflows forbid is out of scope. A deny in settings applies everywhere, while some of those prohibitions only apply inside a workflow.
- Building the hooks is out of scope for this issue. It decides which hooks to build.

### Open questions

1. Should a plain `git push` outside a `/bkit-*` workflow become an ask on every host? Workflow pushes are pre-approved, so the hook would need to tell the two apart.
2. Should "never" rules that are only ask-tier be raised to deny, or reworded to "ask first"?
3. Is a hook that scans outgoing text (replies, comments, commit messages) for secret-shaped strings worth what it costs?

### References

- `.bkit/core/.bkit/authoring.md` § All Agent-Read Files (the capitals rule and its five harms)
- `.bkit/core/.agents/rules.md` § Git, CI & Merges, § Security & Data
- `.bkit/core/hooks/guardrails-tiers.js`, `.bkit/core/hooks/guardrails-read.js`, `.bkit/core/hooks/gateguard-engine.js`
- `.claude/settings.json` `permissions.deny` / `permissions.ask`
- #747 findings comment, row 7: https://github.com/cbartens/bkit/issues/747#issuecomment-6511413767

## #356 — GateGuard reuse/anti-duplicate advisory for new-file Writes (closed)

## Problem

Features get **bolted on** instead of existing code extended — new parallel implementations of the same capability in a slightly different shape → continuous drift. `.agents/rules.md` **Improve over duplicate** (*"ALWAYS search for existing solutions and extend/modify if feasible; NEVER add new parallel solutions where existing ones can be evolved"*) is the rule, but nothing enforces it at the moment drift is born — when a **new file** is written.

## Current GateGuard

`.bkit/templates/.claude/hooks/gateguard.cjs` (+ `.opencode/plugin/gateguard.js` mirror): PreToolUse advisory, first-touch-per-file, subagent-exempt, fail-open, advisory-default with opt-in `deny`. Two checklists — **investigation** (read/verify symbols, callers/importers, contracts, user intent) and **gate-config** ("fix code, don't weaken the gate"). It **fires on `Write` too**, but hands a brand-new file the *"confirm you read this file / its symbols / callers"* checklist, which barely fits. The new-file `Write` is exactly the bolt-on moment and currently gets **no reuse nudge**.

## Proposed — primary

Branch the advisory on **new file vs existing** (a `Write` to a path where `fs.existsSync(file_path) === false` is a clean, already-available signal). For a new file, inject a reuse/anti-duplicate checklist instead of the read-this-file one, e.g.:

- Confirm you grepped for an existing module/function that already provides this capability — extend it if feasible (rules.md *Improve over duplicate*).
- Confirm this is genuinely new, not a parallel reshape of an existing artifact; if it replaces one, the old must be deleted, not left as a duplicate.
- Confirm the location matches the project's architecture / topology.

## Proposed — secondary (optional, same surface)

Widen "fix, don't weaken" beyond gate-**config** basenames: scan the `Write`/`MultiEdit` `new_string` payload for banned suppressions landing in **source** — `as any`, `as unknown as`, `@ts-ignore`, empty `catch {}`, `.skip` — and nudge. These are exactly the classes that escaped in #263 / #331, and rules.md L96 bans them **in code**, not just in gate configs (today GateGuard only reacts when you edit a config file).

## Constraints — respect the CONTRACT, do not regress

- Advisory by default; `deny` stays opt-in; fail-open (single top-level catch); subagent-exempt (`agent_id`); dedup per (session, file); never writes into the consumer repo.
- Update **both** mirrors (`.claude/hooks/gateguard.cjs` + `.opencode/plugin/gateguard.js`) and the tests (`bkit-gateguard.test.ts`, `bkit-gateguard-opencode.test.ts`).
- Cursor has no pre-edit context-injection event — documented divergence (`.bkit/IDEs.md § GateGuard`); the reuse nudge is Claude/opencode-only, same as the existing behaviour.

## Relationship

Edit-time layer of the anti-drift shift-left: **plan-time** (#355 reuse-discovery gate) + **edit-time** (this) + **CI-time** (a `slop:delta` dedup rule). Same multi-layer model as #324 — reuse enforced at every layer where drift is born.

**Refs:** #355, #331, #263, #324, #294.

## Primary implemented (edits applied, uncommitted)

The reuse/anti-duplicate advisory for new-file writes is wired in both mirrors:

- **`.bkit/templates/.claude/hooks/gateguard.cjs`** and **`.bkit/templates/.opencode/plugin/gateguard.js`**: added `reuseChecklist()`; branch on **new-file** = `tool is Write/write AND !fs.existsSync(path)`. Precedence: **gate-config advisory → new-file reuse → investigation checklist**. Scoped to `Write`/`write` (Edit/MultiEdit target existing files by contract, so they stay on the investigation checklist).
- Checklist nudges: grep for an existing module/function to extend; confirm it's genuinely new, not a parallel reshape (delete the old if replacing); confirm location fits architecture/topology.
- **Contract preserved:** advisory-by-default, `deny` opt-in, fail-open, subagent-exempt, dedup per (session, file). Header contract comments updated.

### Tests
- `bkit-gateguard.test.ts` + `bkit-gateguard-opencode.test.ts` updated: the opencode "write to nonexistent" case flipped from investigation→reuse; added new tests for **new-file → reuse**, **write-to-existing → investigation**, and **Edit-nonexistent → investigation** (reuse is Write-only). **102/102 green** across both GateGuard suites + templates.

### Not done (left for this issue)
- **Secondary** (scan `new_string` for `as any`/`as unknown as`/empty `catch`/`.skip` in source) — deferred; primary only.

Status: **template sources + tests edited, not committed.** Live mirrors (`.claude/hooks/gateguard.cjs`, `.opencode/plugin/gateguard.js`) regen via `bkit install` — same batch as the template doc mirror.

## #628 — Add empty-read, shared-checkout and host-shell rules to audit prompt (closed)

### Narrative

Audit runs keep tripping on the same three things, and every one of them gets fixed only in the `Project Instructions` of the template that tripped, so the next audit trips again:

- **An empty search gets read as "clean" when the search itself was broken.** In this repo plain `rg` skips the hidden `.bkit/` directory, which holds all the source, so a search from the repo root returns nothing and looks like absence (`docs/templates/bkit-audit-duplication.md:268`). `git grep -E 'Code\sreads'` on `.bkit/core/prompts/bkit-audit-generate.md` returns 0 hits (exit 1), while `git grep -E 'Code[[:space:]]reads'` returns 1: `git grep -E`, BSD `sed -E` and `awk` have no `\s` (checked on this machine; BSD `/usr/bin/grep -E` does accept it). Three runs in two checkouts asked for a known-hit check first (bkit duplication + security, consumer A logs). `.agents/rules.md:63` already says empty is inconclusive, but its remedy is "independent MCP calls", not "run the same query on something you know is there".
- **Other agents write the same checkout while the audit runs.** `bkit-audit-duplication.md:149` gates on "`git status` clean", which a shared checkout can never pass honestly, and which contradicts `.agents/rules.md:92` (unexpected changes belong to other agents). Runs either fail the gate or tick it and explain it away. The bkit friction run had to invent "read sources at `HEAD`" (`git show HEAD:` / `git grep … HEAD --`) because the tree was dirty.
- **The Bash tool runs the user's login shell, here zsh, and the session wraps `grep` / `rg` as shell functions.** Seen while drafting this issue: `grep -rln … --include=*.test.ts` aborted with `no matches found` (unmatched glob), and `echo =====` failed with `==== not found` (`=word` expansion). `type grep` → "shell function", so `xargs grep` does not reach it. Six templates in two checkouts carry their own copy of this workaround (bkit `docs/templates/bkit-audit-dead-code.md:264`, `bkit-audit-duplication.md:272`, `bkit-audit-security.md:289`, `bkit-audit-testing.md:292`; consumer A `bkit-audit-logs.md:300`, `bkit-audit-security.md:293`).

All three hold for every audit, so the fix is three bullets in the one prompt every audit run reads, `.bkit/core/prompts/bkit-audit-generate.md` EXECUTION PROTOCOL (`:23-32`), not 35 template copies. Checked at `HEAD`: `positive control`, `known hit`, `false empt`, `dot-dir`, `git show HEAD`, `other writers`, `zsh`, `shell function`, `word-split`, `PIPESTATUS`, `/usr/bin/grep`, `command grep` → 0 hits each in the generate prompt, `.bkit/wording.md` and `.bkit/core/.agents/rules.md` (`/usr/bin/grep -c -i -F`).

These are single-prompt sentences, so they stay local to the prompt: `.bkit/wording.md` takes a clause only for a sentence shared by 5+ prompts or 5+ audit templates (`.bkit/wording.md:9`).

**Text to add** (EXECUTION PROTOCOL, local header lines):

> - **Empty reads:** before reading an empty search or reader as clean, run it once on a known hit (a string known present; an event known inside the window). No hit → tool or query broken → `Not Checked`. Known false empties: ripgrep skips dot-dirs and ignored files (e.g. `rg --hidden`, or `git grep`); `git grep -E`, BSD `sed -E` and `awk` have no `\s` (use `[[:space:]]`).
> - **Shared checkout:** other agents may write this checkout. Tree clean = no change by this run; name other writers' paths. Dirty tree → read sources at `HEAD` (e.g. `git show HEAD:<path>`, `git grep <pattern> HEAD -- <paths>`).
> - **Host shell:** Bash runs the user's login shell. zsh: unquoted `$VAR` does not word-split; an unmatched glob aborts the command; unquoted `=word` expands. `grep` / `rg` may be shell functions → `xargs grep` fails; use `command grep`, `/usr/bin/grep`, or `git grep`. Loops and file lists → `bash -c '…'` or a scratch script.

**Audit reports:** docs/audits/202610/audit-improvements.md (findings audit-improvements-2, audit-improvements-3, audit-improvements-44)

### Success Criteria

- An audit run treats an empty search or reader as clean only after the same query found a known hit; otherwise the surface goes to `Not Checked`.
- An audit run in a checkout other agents are writing passes its tree-clean gate by naming the other writers' paths, and reads sources at `HEAD` instead of the dirty copy.
- An audit run on a zsh host quotes globs and `=word`, and reaches `grep` through `command grep`, `/usr/bin/grep` or `git grep`, without a per-template note telling it to.
- `bkit-audit-duplication.md` no longer demands a clean `git status` for its `Tree clean` gate.
- `docs/templates/` and the host mirrors of the generate prompt match the canonical files; `pnpm bkit check` exits 0.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Search returns 0 and the known-hit control also returns 0 | Tool or query broken → `Not Checked`, never clean |
| Log reader ran and returned nothing for the window | Re-run on a window holding a known event; no hit → reader broken, `Not Checked` (closes the gap left by "Skipped reader … never clean", `bkit-audit-logs.md:148`) |
| Known-hit control needs a string the run cannot name (brand-new surface) | Use any literal known present in the same files (e.g. a heading); none exists → `Not Checked` |
| Another agent has an uncommitted edit to a file the audit reads | Read `git show HEAD:<path>`; the report names the dirty path as another writer's |
| `Tree clean` gate with other writers' paths in `git status` | Passes when none of those paths was written by this run; report lists them |
| Template already builds in a detached worktree (`bkit-audit-dead-code.md:85`, `bkit-audit-duplication.md:100`, `bkit-audit-slop.md:109`) | Unchanged; the shared-checkout bullet is the rule for the main checkout |
| Host shell is bash (cloud session, CI) | zsh notes are inert; `command grep` / `git grep` still work |
| `xargs grep` with `grep` a shell function | Use `git grep` or `xargs /usr/bin/grep` |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| New prompt header lines keep the positioned header clauses in wording-file order and are not near-copies of a clause | Unit | `.bkit/core/engine/tools/wording.test.ts` |
| New prompt prose backticks closed-vocabulary tokens (e.g. `Not Checked`) | Unit | `.bkit/core/engine/audits/workflows/prompt-notation.test.ts` |
| New prompt prose carries no issue number, ledger key, finding ID or `(Step N)` cross-ref | Unit | `.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts` |
| Reworded duplication gate line is not a near-copy of a shared audit clause | Unit | `.bkit/core/engine/tools/wording.test.ts` (`audit` surface) |
| `docs/templates/bkit-audit-duplication.md` managed block equals the canonical one bar the version stamp | Unit | `.bkit/core/engine/audits/templates/templates.test.ts` (`dogfood managed block differs only by the managed-version stamp`) |

No new test: each change is prose, and a test asserting the new sentence exists would only restate it.

### Tasks

- [ ] **Task 1:** In `.bkit/core/prompts/bkit-audit-generate.md` EXECUTION PROTOCOL, add the three lines under Narrative § Text to add after `Code reads` (`:27`) and before `External input` (`:32`). **Done when:** `pnpm exec vitest run .bkit/core/engine/tools/wording.test.ts .bkit/core/engine/audits/workflows/prompt-notation.test.ts .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts` exits 0. **Test first:** n/a — prompt prose; the three named tests guard header order, notation and internal identifiers and must stay green.
- [ ] **Task 2:** In `.bkit/core/docs/templates/bkit-audit-duplication.md:149`, reword `Tree clean` to defer to the prompt: "no tracked file changed by this run (other writers' paths named); tracked registers / graphs unchanged." **Done when:** `/usr/bin/grep -n 'Tree clean' .bkit/core/docs/templates/bkit-audit-duplication.md` shows no "`git status` clean" and `pnpm exec vitest run .bkit/core/engine/tools/wording.test.ts` exits 0. **Test first:** n/a — template prose; `wording.test.ts` guards near-copies.
- [ ] **Task 3:** Refresh the installed copies: `pnpm bkit upgrade` (re-renders `docs/templates/bkit-audit-*.md` and the generate-prompt mirrors under `.claude/agents/`, `.cursor/agents/`, `.codex/agents/`, `.opencode/agents/`, `.agents/plugins/bkit/agents/`), then `git config core.bare false`. **Done when:** `pnpm bkit check` exits 0 and `pnpm exec vitest run .bkit/core/engine/audits/templates/templates.test.ts` exits 0. **Test first:** n/a — regenerated copies; `templates.test.ts` dogfood parity is the check.

### Open Questions & Assumptions

- Assumption: the generate prompt is the right home, as the audit's ADOPT ALL verdict says. "Empty reads" and "Host shell" hold for every agent with Bash, not only audits; `.agents/rules.md` (`:63` already holds `Empty is inconclusive`) would reach build and debug agents too, but changes a Tier-2 file every consumer gets. Kept to audits here; widening it is a separate decision.
- Assumption: three more header lines are fine there. `wording.test.ts` allows local lines between positioned header clauses (`header order` describe block, "local lines in between allowed").
- Open: once this lands, the six per-template host-shell notes and the `rg --hidden` note under `Project Instructions` are redundant. Those sections are consumer-owned; the next run of each audit drops them under generate step 12 ("Correct lines this run proved wrong"). No task here edits them.

### Breaking Changes & Naming

None. New bold labels `Empty reads`, `Shared checkout`, `Host shell` are local to one prompt.

### Out of Scope

- Worktree gitignored inputs, shallow history, re-reading previous values, fetch-tool limits: audit Suggested Issues row 5 (`audit-improvements-25`, `-45`, `-46`, `-47`).
- Editing any template's `Project Instructions` below `bkit:end`.
- Issue-body audits (#99 — Friction triage, #343 — Consumer harvesting, #627 — Audit improvements): they mirror the generate prompt and pick this up when they read it; their own fixes are separate rows.

### References

- docs/audits/202610/audit-improvements.md § Clusters (C1, C2, C6)
- `.bkit/core/prompts/bkit-audit-generate.md:23-32` (EXECUTION PROTOCOL)
- `.agents/rules.md:63` (`Empty is inconclusive`), `.agents/rules.md:92` (`Other parallel agents`)
- `.bkit/wording.md` § Clauses `code-reads`, `external-input` (header positions)
- `.bkit/core/docs/templates/bkit-audit-duplication.md:149`, `bkit-audit-security.md:91`, `bkit-audit-logs.md:148`
- docs/setup.md § Bootstrap (`bkit upgrade` re-renders every installed module)

Landed on `dev` in 5a05f1b9 (not pushed yet).

**Two of the three rules went into `.agents/rules.md` instead of the audit prompt**, because every agent hits these problems, not just auditors. Both sit under Universal Rules § Agent Management, which the audit prompt already tells its agent to follow.

- **`Empty is inconclusive`** (tightened): before an agent treats an empty search or log read as "nothing there", it re-runs the read once on something known to be there. If that also comes back empty, the read itself is broken, so the agent reports it as unavailable, never as clean. The rule names the searches that return nothing when they shouldn't: `rg` skips dot-folders (all of `.bkit/`) and ignored files, and `git grep -E`, BSD `sed -E` and `awk` don't understand `\s`.
- **`Host shell`** (new): the shell tool runs the user's login shell. It lists the zsh traps (unquoted `$VAR` isn't split into words, a glob that matches nothing stops the command, `=word` gets expanded) and covers `grep` / `rg` being shell functions, which breaks `xargs grep`.

**`Shared checkout` stays in `bkit-audit-generate`**, because only audits need it. When the tree is clean, that means this run changed nothing, and any paths other agents wrote are named. When the tree is dirty, sources are read at `HEAD`. To match, the `Tree clean` gate in `bkit-audit-duplication` no longer requires a clean `git status`.

The workarounds individual audit templates added under `Project Instructions` for these problems are now redundant. Each audit drops its own on its next run.

## #700 — Session-start nudge: read .agents/rules.md on every platform (closed)

### Narrative

`AGENTS.md` (and `CLAUDE.md` / `GEMINI.md`) only **point** at `.agents/rules.md` ("Read `.agents/rules.md` → follow all rules"). Nothing loads it, and nothing checks the agent read it. Hooks are the only enforcement layer today, and the only `SessionStart` hook (`bkit-preflight.sh`) self-skips on IDE sessions (it bails unless `LINEAR_ISSUE_ID` is set). A recent miss (an issue filed with a >70-char title and other rule violations) happened because `.agents/rules.md` was never read.

**Ideas explored**

1. **Session-start advisory nudge.** Inject a directive at session start to read `.agents/rules.md` before acting. Soft; no blocking; works wherever a session-start event exists.
2. **First-action deny gate.** Deny `Edit` / `Write` / `Bash` until a read is observed (GateGuard before-hook + ReadGuard's per-session read log). Hard guarantee, but Claude Code `SessionStart` cannot block, and it needs a shared gate across every host.
3. **Content-hash acknowledgement.** Stamp the `rules.md` hash at read time; force a re-read when it changes. Correct but more machinery; pairs with #2.
4. **Provider auto-load.** opencode `instructions` config / Claude `CLAUDE.md` `@` imports auto-include the rules as context. Most reliable "read", but spends context budget every session.

**Decision:** ship **idea 1 only** — a soft, advisory session-start prompt that asks the agent to read **`.agents/rules.md`**, on **all platforms**. It asks for `.agents/rules.md` **only, never `AGENTS.md`** — all rules live in `rules.md`, and `AGENTS.md` is a pointer/router. Ideas 2–4 are recorded here as future work, out of scope for this change.

### Success Criteria

- On session start, every supported platform delivers an advisory naming `.agents/rules.md` as required reading before any other action.
- The wording asks only for `.agents/rules.md`; it never asks for `AGENTS.md`.
- The advisory never blocks a session and never errors the host (fail-open).
- Present across all providers: Claude Code, Cursor, opencode, Codex, Google Antigravity.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Platform exposes no session-start event | Advisory emitted at the first available pre-action point, or the gap documented with rationale |
| Cloud / background session (`LINEAR_ISSUE_ID` set) | Existing preflight still runs; rules advisory is also emitted |
| Malformed or empty hook payload | Fail-open — no error, no block |
| `.agents/rules.md` missing | Advisory still names the file; no crash |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| Session-start hook emits an advisory naming `.agents/rules.md` | unit | `.bkit/core/engine/audits/hooks/` (per-host hook test) |
| Advisory text never names `AGENTS.md` as required reading | unit | same |
| Malformed / empty payload exits clean (fail-open) | unit | same |

### Tasks

```text
<!-- bkit:group 1 start -->
### GROUP 1: Rules-read session-start advisory

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Add the shared rules-read advisory to the session-start preflight source
  - **UPDATE:** the shared preflight part in `.bkit/core/hooks/`: emit `additionalContext` asking to read `.agents/rules.md` before any action
  - **READ:** `.bkit/core/.claude/hooks/bkit-preflight.sh`, `.bkit/core/.cursor/hooks/bkit-preflight.sh`: current `emit_context` shape
  - **DONE WHEN:** both rendered hooks carry the advisory and never name `AGENTS.md`
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` the advisory names `.agents/rules.md` and not `AGENTS.md`
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** Wire the advisory for the remaining hosts (opencode, Codex, Antigravity)
  - **UPDATE:** `.bkit/core/.opencode/plugin/`, Codex / Antigravity hook sources: emit the same advisory at their session-start (or first pre-action) point
  - **DONE WHEN:** each host's dogfood shows the advisory on a fresh session; hosts without a session-start event are documented
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts` (or a sibling) the plugin emits the rules advisory without throwing
<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->
- [ ] **TASK 3:** Document the guard in the provider + authoring references
  - **UPDATE:** `.bkit/providers.md` (hook ownership / behaviour): the rules-read advisory and its per-host delivery
  - **DONE WHEN:** `bkit check` drift stays clean after `bkit install`; `.bkit/providers.md` describes the advisory
  - **TEST FIRST:** `n/a — docs`
<!-- bkit:task 3 end -->
<!-- bkit:group 1 end -->
```

### Open Questions & Assumptions

- Exact advisory wording (short, imperative) — settle in plan.
- Which hosts lack a session-start event and where the advisory lands instead — settle in plan.
- Assumes the advisory is purely additive to `bkit-preflight.sh`; no change to existing Linear/cloud guards.

### Breaking Changes & Naming

- None. Additive advisory only; no config keys, no new flags, no removed behaviour.

### Out of Scope

- Ideas 2–4 (deny gate, content-hash acknowledgement, provider auto-load).
- Any change to `.agents/rules.md` content.
- Blocking behaviour of any kind — this ships advisory-only.

### References

- `.agents/rules.md` § Repo Authoring (edit source then mirror), § Tracker rules
- `.bkit/core/.claude/hooks/bkit-preflight.sh`, `.bkit/core/.cursor/hooks/bkit-preflight.sh` — the current `SessionStart` hook (`emit_context`, IDE self-skip via `LINEAR_ISSUE_ID`)
- `.claude/settings.json`, `.cursor/hooks.json`, `.opencode/opencode.json` — installed hook wiring
- `.bkit/core/hooks/gateguard-engine.js`, `readguard-engine.js` — the block primitive and per-session read log (context for the deferred ideas)
- `.bkit/providers.md` — hook ownership model
- Related: [#699 — Engine run completeness check + auto friction/failure on errors](https://github.com/cbartens/bkit/issues/699) (adjacent observability work, not a duplicate)

Work done: filed this issue to document the session-start guard ideas and the decision from the prior discussion.

**Outcome**
- Documented ideas 1–4 (session-start nudge; first-action deny gate; content-hash acknowledgement; provider auto-load) and recorded the **decision: idea 1 only — soft, advisory, all platforms**.
- Scoped the read target to **`.agents/rules.md`** only — never `AGENTS.md` (it is a pointer/router; all rules live in `rules.md`).
- Body in the `change` shape; labels `enhancement` + `next:plan`; milestone **Workflow Optimisation**; project fields set (Status `Backlog`, Priority `Low`, Size `M`). No parent, no blockers.

**Links**: [cbartens/bkit#700 — Session-start nudge: read .agents/rules.md on every platform](https://github.com/cbartens/bkit/issues/700)
No files changed this turn (tracker-only).

Unblocked. The Step 2 `bkit steps finish` commit failure that aborted build run 1 is fixed on local `dev` (commit `412fe612f`), and its failure row is closed (`fd110763e`).

`addAllButCopied` no longer names a gitignored `bkit.workflows.worktree.copy` entry in its `:(exclude)` pathspec, so the copied `.bkit/.env` no longer fails every commit in the worktree. Full list of changes and verification evidence is on #662 — Debug can't start after failed ship: leftover files block rebase (https://github.com/cbartens/bkit/issues/662).

The build can be re-run once the commits are pushed. Not yet pushed to origin.

## Review of the landed work (28 Oct 2026)

Code review of #700 on `dev`: the squash commit `2790b4181` (PR #708) and the follow-ups `b8745db7a`, `d30a2faf6`, `b470e1420`, `f6ec5884d`, `93ad96e51`, `b9fbf9310` and `a9bd2a3c0`. I checked them against `dev` at `8e73232bf`, together with #705 and #707.

**Note:** `2790b4181` also carries #707's main fixes: the rollback of a step record when its commit is refused, and the `Engine builds` rule. So the commit hashes in #707's comments (`ed91caceb`, `ee0687d3d`) are no longer on any branch. The findings about that rollback are on #707.

### Finding for #700 itself (not fixed yet)

1. **LOW: the session-start reminder can show on every tool call** (`.bkit/core/hooks/session-rules-advisory.js:49`).
   - `rulesReadAdviceOnce` remembers that it has already shown the reminder by writing to a shared temp folder, `bkit-rules-advisory`. If it can't write there, it shows the reminder every time.
   - On Linux, `/tmp` is shared between users. Whoever runs a hook first owns that folder, and it's read-only for everyone else.
   - The reviewer reproduced it with the folder set to mode 0555: five calls in one session showed the reminder five times.
   - The effect differs by tool. On opencode and Codex, it shows on every tool call. On Antigravity, it either blocks each new call once or never shows at all.

### Checked and fine
- The JSON escaping in the Claude and Cursor preflight hooks produces valid JSON under bash 3.2.57 and 5.3, including quotes, backslashes and control characters.

The summary for this whole review round is on #551.

---
_Generated by [Claude Code](https://claude.ai/code)_

### Review fixes: done

All six #700 findings are fixed in `74ce6a48d`; the `workflows.md` and CHANGELOG updates are in `8e18df45f`. Both are on the local branch `review-fixes-deepseek`, which is **not yet pushed**. It fast-forwards into `dev` once another session's uncommitted doc edits are committed.

**A failed `bkit steps done` / `finish` commit now leaves things exactly as it found them** (`steps.ts`):
- **Staging is restored exactly.** The index is copied before staging and written back through git's own lock. An already-staged `status.jsonl` no longer keeps the refused row, and a partly staged file keeps its partial staging.
- **Similar file names are safe.** A new path like `src/[id].tsx` can no longer unstage your `src/i.tsx`.
- **Only this attempt's row is removed.** A row another writer added during the commit is kept, even when the attempt created the file.
- **A row that can't come off is reported honestly.** If another row follows it, the command says the row stays and exits **82** (needs a human) instead of claiming "nothing written" with exit 8, so a re-run can't write it twice.
- **A hook that deletes `status.jsonl` no longer crashes it** with `ENOENT`.

**The rules-read reminder fires once per session** (`session-rules-advisory.js`):
- Its state folder is per user (`bkit-rules-advisory-<uid>`).
- When it still can't write state, the opencode plugin remembers in memory instead of nudging on every call.

**Separate bug, not fixed here:** gateguard, readguard and the Antigravity retry hook still use shared temp folder names. It's recorded in `docs/failures.jsonl` as `hook-state-dirs-shared-across-users-in-os-tmp`.

**Checks:** seven new tests, each seen failing before its fix; the full gate on the branch is green (7988 tests, lint, typecheck, format, code map).

---
_Generated by [Claude Code](https://claude.ai/code)_

Follow-up to the review fixes: the other three hooks had the same shared-temp-folder fault as the rules advisory. Fixed in `35decc367` on branch `review-fixes-deepseek` (not pushed yet).

**What was wrong.** GateGuard, ReadGuard and the Antigravity retry store kept their memory in fixed folders (`bkit-gateguard`, `bkit-readguard`, `bkit-antigravity-retry`) in the system temp dir. On a Linux machine where several users share `/tmp`, the first user to create a folder owns it. Every other user's hook then failed to save, the error was swallowed, and the checklist, repeat-read note or Antigravity advisory silently never appeared.

**What changed.**
- Each folder now ends in the user id (`bkit-gateguard-<uid>` etc.), as `bkit-rules-advisory-<uid>` already does.
- If saving still fails, nothing throws:
  - GateGuard still shows its checklist, as advice only. A block it can't remember giving would refuse every retry of the same edit.
  - ReadGuard keeps its log in memory.
  - Antigravity lets the call through.
- Tests pre-create read-only folders to prove each path: `gateguard-parity.integration.test.ts`, `readguard-parity.integration.test.ts`, `session-rules-advisory.integration.test.ts`.
- The `docs/failures.jsonl` row `hook-state-dirs-shared-across-users-in-os-tmp` is closed.

**One small gap left on purpose.** On opencode with `BKIT_GATEGUARD=deny`, if even the per-user folder can't be written, the checklist is dropped rather than shown as advice. Before this change it was also dropped, so this is no worse; fixing it would mean reworking the opencode plugin's deny path.

---
_Generated by [Claude Code](https://claude.ai/code)_

## #587 — Guardrails fetch and edit checks: use commandLines, drop segmentHead (closed)

From the October 2026 duplication audit (#473), finding `duplication-1` (HIGH). Report: `docs/audits/202610/duplication.md`, audited at `5f5a097c`.

## The problem

The guardrails hook (the script that checks an agent's shell commands before they run) works out "which program does this command actually run" in two different ways:

- **`commandLines` / `commandWords`** (`.bkit/core/hooks/guardrails-tiers.js:49`, `:66`) understands quotes, looks inside `sh -c '…'`, and looks inside `$(…)` and backticks. The deny, ask and secret checks use it (`guardrails-tiers.js:216`, `:248`, `:303`).
- **`segmentHead`** (`.bkit/core/hooks/guardrails-shell.js:22`) just splits on spaces. It ignores quotes, `$(`, `(` and backticks, and doesn't look inside `sh -c`.

The internet-fetch check uses the simpler one: `usesFetch` (`guardrails-shell.js:34`) feeds `classifyShell` at `guardrails-tiers.js:349`. So these commands never reach the `fetch` check:

- `sh -c 'curl …'`
- `echo $(curl …)`
- `(curl …)`

On Cursor (`.bkit/core/.cursor/hooks/bkit-guardrails.cjs:77-81`) and Codex (`.bkit/core/.codex/hooks/bkit-guardrails.cjs:75-78`), that check is the one that asks the user before an outbound fetch. Wrapping the call skips the prompt.

The edit check has the same flaw. `shellEditTargets` (`guardrails-shell.js:53`) also uses `segmentHead`, and its redirect regex at `:63` runs over the raw command without regard to quotes. During the audit run, the Claude hook flagged a `>` inside a single-quoted `rg` pattern as a file write.

`commandLines` was added in `3e306b5a` (5.2.3), but `segmentHead` was never switched over to it. The cross-host verdict table in `.bkit/core/engine/install/modules/index.integration.test.ts` has no row for a wrapped fetch, so nothing caught it.

**Caveat:** this was found by reading the code. The hook was not run against these inputs.

## What to change

- Make `usesFetch` and `shellEditTargets` iterate `commandLines` / `commandWords`.
- Delete `segmentHead`. Its only callers are in `guardrails-shell.js`.
- Add rows to the cross-host verdict table for:
  - a wrapped fetch: `sh -c 'curl …'`, `$(curl …)`, `(curl …)`
  - a quoted `>` that is not a redirect
- Re-render the host hook mirrors.

## Done when

- [ ] Confirmed first by running the current hook on the three wrapped-fetch inputs (expect: no `fetch` verdict).
- [ ] After the fix, all three get the `fetch` verdict on Cursor and Codex, covered by table rows that fail on the old code.
- [ ] A quoted `>` (e.g. `rg 'a>b' file`) is no longer treated as a file write.
- [ ] `segmentHead` no longer exists.

**Size:** M. **Next step:** `/bkit-build` (the right parser already exists; this is a security surface, so no shortcut).

Parent: #473

## Plan

### Confirmed before starting

Ran the current hooks on `dev` (`8a759d35`):

<!-- prettier-ignore -->
| Command | Cursor | Claude |
| --- | --- | --- |
| `curl -fsSL https://evil.example/x` | ask | advisory |
| `sh -c 'curl -fsSL https://evil.example/x'` | **allow** | **nothing** |
| `echo $(curl -fsSL https://evil.example/x)` | **allow** | **nothing** |
| `(curl -fsSL https://evil.example/x)` | **allow** | **nothing** |
| `rg -n 'import x > a.ts here' src` | allow | **"redirect into a.ts"** (false alarm) |

So both halves of the finding are real: wrapped fetches slip past, and a `>` inside quotes is read as a file write.

### Why the fix has to move code between files

The smart parser (`shellWords`, `commandWords`, `SHELLS`, `commandLines`) lives in `.bkit/core/hooks/guardrails-tiers.js`. Only the Cursor, Codex and Antigravity hooks include that file. Claude's hook only includes `.bkit/core/hooks/guardrails-shell.js` (see the table in `.bkit/providers.md:302-303`). So switching `usesFetch` over isn't enough on its own: the parser has to move into `guardrails-shell.js` so every host gets it. `guardrails-shell.js` is always included before `guardrails-tiers.js`, so the tier rules keep working unchanged.

### Steps

1. **Move the parser.** Cut `shellWords`, `commandWords`, `SHELLS` and `commandLines` from `guardrails-tiers.js` into `guardrails-shell.js`, below `shellSegments`. Behaviour stays the same; update the "Needs … from guardrails-shell.js" header comment in `guardrails-tiers.js`.
2. **`usesFetch`.** Go through every line from `commandLines(cmd)`, take the program from `commandWords(line)` (path stripped), and return true if it's `curl` or `wget`. This covers `sh -c '…'`, `$(…)`, backticks and `( … )`.
3. **`shellEditTargets`, in-place edits.** Apply the existing `sed` / `perl` `-i` and `awk -i inplace` checks to each `commandLines` line, using `commandWords` to find the program.
4. **`shellEditTargets`, redirects.** Replace the regex over the raw command with a scanner that ignores `>` inside single or double quotes. Run it over each `commandLines` line, so a real redirect inside `sh -c 'echo x > src/a.ts'` is still caught (from the unwrapped inner script) while `rg 'x > a.ts'` is not. Keep the existing skip rules: `$…` / `&…` targets, `/dev`, `/tmp`, the `.log` / `.bak` style suffixes, and the source-extension check.
5. **Delete `segmentHead`.** Its only callers are in `guardrails-shell.js`.
6. **Docs.** `.bkit/providers.md:302-303` (and its `.bkit/core/.bkit/providers.md` source) now say where the shell parsing lives. Add a short follow-up row to `docs/decisions.jsonl` on `guardrails-shell-advisory-scope-and-detection`: detection now covers nested commands on every host.
7. **Re-render the host hooks.** Run `pnpm build`, then `node dist/cli.js upgrade` once, then `git config core.bare false`. Commit only the guardrails mirrors this change touches (`.claude/`, `.cursor/`, `.codex/`, `.agents/plugins/bkit/hooks/bkit-guardrails.cjs`, and any `.bkit/core` copies the renderer refreshes).

### Tests

These go in the cross-host block "curl / wget in a shell" in `.bkit/core/engine/install/modules/index.integration.test.ts`. Each must fail on the old code.

- **Wrapped fetch to an undeclared host.** `sh -c 'curl …'`, `bash -lc "wget …"`, `echo $(curl …)`, `` echo `curl …` ``, `(curl …)`. Expected: Cursor ask, Codex ask, Claude advisory.
- **Wrapped fetch to an allowlisted host.** Expected: no prompt anywhere.
- **Quoted `>`.** `rg -n 'import x > a.ts here' src` gets no edit advisory, while `echo x > src/a.ts` and `sh -c 'echo x > src/a.ts'` still do.
- **Existing rows still pass.** In particular the "bare mention of curl" row (`grep -n 'curl' README.md`).

### Done when

- [ ] The table above flips: wrapped fetches are asked about or advised on every host, and the `rg` false alarm is gone.
- [ ] Full suite passes (`pnpm vitest run`), `bkit check` is clean, and `pnpm bkit:gate:static` passes.
- [ ] Ledger row `audit-duplication-guardrails-two-shell-parsers` in `docs/failures.jsonl` is closed.

**Not in scope:** `shellSegments` still splits on `|` and `;` inside quotes. That's a separate, older limit.

Work is going to a Sonnet subagent, committing straight to `dev`.

## Done — landed on `dev` (not pushed)

- `a76ba8ff` fix(587): guardrails fetch and edit checks read nested commands on every host
- `e3157a9b` closes ledger row `audit-duplication-guardrails-two-shell-parsers` and updates decision `guardrails-shell-advisory-scope-and-detection`

**Checked after the change**, on the re-rendered hooks:

<!-- prettier-ignore -->
| Command | Cursor | Claude |
| --- | --- | --- |
| `sh -c 'curl … evil.example'` | ask | advisory |
| `echo $(curl … evil.example)` | ask | advisory |
| `(curl … evil.example)` | ask | advisory |
| `bash -lc "wget … evil.example"` | ask | advisory |
| `rg -n 'import x > a.ts here' src` | allow | nothing (no more false alarm) |
| `grep -n 'curl' README.md` | allow | nothing |
| `echo hi > src/a.ts` | allow, with an edit message | edit advisory |
| `echo 'a; b' > x.ts` | allow, with an edit message | edit advisory |

Codex gives the same answers; they come from the new cross-host test rows.

**Tests:** the cross-host test file passes 120 of 120, and 5 of its new rows failed on the old code. Full suite: 5697 passed, 4 failed, all 4 in other in-progress work (the #593 template edits and one load flake). `node dist/cli.js check` lists no drift in guardrails files.

**Beyond the plan:** redirects are scanned on the whole command as well as on each command line. Without that, `echo 'a; b' > x.ts` would no longer be caught, because `shellSegments` still splits on `;` inside quotes.

**Known limit (not new):** a `$(…)` written inside single quotes, which never runs, is still read as a command. The deny and ask rules already worked this way. It can only cause an extra advisory or prompt, never a missed one.

## #518 — GateGuard: widen config-file matching to cover non-JS toolchains (closed)

## Goal

Expand GateGuard's configuration-file detection to alert on modifications to non-JavaScript static check and linter configs.

## Problem

The shipped GateGuard hook (`.bkit/templates/.claude/hooks/gateguard.cjs:60-64`, referenced in `.bkit/providers.md:257`) detects edits that might weaken gates by matching file paths against JavaScript tools:
```
(tsconfig|eslint|prettier|vitest|vale|slop|lint-staged)
```
On Python, Go, Rust, or multi-language projects, edits to gate configurations like `pyproject.toml`, `ruff.toml`, `.flake8`, `.golangci.yml`, or `Cargo.toml` are not monitored. Agents can weaken linting or compiler settings without GateGuard alerting the user.

## Proposed changes

1. Widen the regex in `.bkit/templates/.claude/hooks/gateguard.cjs` to include standard configuration files for supported ecosystems:
   - Python: `pyproject.toml`, `ruff.toml`, `.ruff.toml`, `.flake8`, `mypy.ini`
   - Go: `.golangci.yml`, `.golangci.yaml`, `golangci-lint`
   - Rust: `clippy.toml`, `rustfmt.toml`
2. Update `.bkit/providers.md:257` to reflect the broadened coverage.

Related: #498
Parent: #498

## Analysis and work done

Commit `0b619998` (`fix(518): GateGuard guards the other ecosystems' gate configs too`).

GateGuard is now a shared engine spliced into every host's hook (`.bkit/core/hooks/gateguard-engine.js`, rendered via `render/parts.ts`), so the fix is one pattern list, not four hook files:

- **Patterns added** beside the JS/TS set: `jest`; Python — `pyproject.toml`, `ruff.toml`, `.ruff.toml`, `.flake8`, `mypy.ini`; Go — `.golangci.yml` / `.toml` / `.json`; Rust — `clippy.toml`, `rustfmt.toml`. An edit to any of them now gets the same "fix code, don't weaken gate" advisory as `tsconfig.json`.
- **Tests**: `gateguard-parity.integration.test.ts` gains an `it.each` over the nine new configs, run against all four hosts — 36 new assertions.
- **Docs**: the GateGuard row in `.bkit/providers.md` (and its `.bkit/core/.bkit/` mirror) now names the wider config set, split by ecosystem.
- The four installed hooks (`.claude`, `.cursor`, `.codex`, `.opencode`) were re-merged by `bkit upgrade`; `.bkit/version` re-stamped.

## Verification

- `.bkit/core/engine/audits/hooks/` → 7 files, 311 tests passed (includes the parity, dogfood, claude, opencode and cursor integration suites).
- `pnpm bkit check` → exit 0.
- Grep check: all four installed hooks contain the new patterns.

Closing as completed.

## #441 — Enforce shell-as-edit rule; settle the curl/wget divergence (closed)

Follow-up from #422. The rule text landed there; the enforcement did not.

## What already landed in #422

`.agents/rules.md` § Output & Editing (and its template) gained:

> **Edit tools only:** ALWAYS change file contents with edit / write tools; NEVER use shell commands to hand-edit source files or to bypass pre-edit gates. Exceptions: generating files from scripts, bulk mechanical file rewrites.

A rule in `rules.md` is advisory. An agent that ignores it is not stopped by anything.

## Why it matters

Found while spiking GateGuard on Cursor. Asked to append a line to two files, the agent used shell redirection — the hook log recorded `Read`, `Shell` and `Grep` preToolUse events and **no** `Write` at all. GateGuard fires on edit tools only, so an agent that prefers the terminal routes around every pre-edit gate on every host. This is not Cursor-specific; the Claude hook has always had the same hole.

## The work

Gate the in-place editors at the shell layer on all three hosts. `beforeShellExecution` (Cursor) and the permission tables (Claude, opencode) all see the command string.

Measured before proposing: the only in-place shell edit in bkit's own corpus is `.bkit/workflows/bkit-plan.md:874`, a `sed -i.bak -E` bulk rewrite of cross-references across generated plan files. That is the second exception in the rule above, so it must keep working — a blanket `sed -i` deny breaks bkit's own plan workflow. Any gate needs that shape of use to survive, which probably means `ask` rather than `deny` for the in-place editors, or a target-path test.

Redirection (`>` / `>>`) is the harder half and should probably stay ungated: it is overwhelmingly used for `/dev/null`, `$GITHUB_ENV`, `mktemp` handoff files and log capture. Denying or asking on all of it would fire constantly and get switched off. A useful gate would have to distinguish "redirect into a tracked source file" from "redirect into scratch", which needs the target path parsed — expressible in a guardrails **script**, not in a permission table.

## The blocked decision, shared with the curl/wget divergence

Both this and the curl gap need the same architectural answer: **can Claude and opencode gate shell through a script, or only through their declarative permission tables?**

The cross-host parity suite (`.bkit/src/bkit-gate-parity.test.ts`, added in #422) shows the three hosts already agree on 31 gates — every `rm -rf`, force-push, publish, destructive-git and secret-read case, including that `git push --force-with-lease` must stay allowed. Exactly one row is missing, recorded there as a `todo`:

<!-- prettier-ignore -->
| Host | curl / wget in a shell |
| --- | --- |
| Cursor | asks **unless** every URL host is on the network allowlist — `guardrails.cjs` parses the command and matches host labels |
| opencode | asks on **every** curl / wget (`"curl *": "ask"`) |
| Claude | **not gated at all** — the WebFetch domain allowlist governs the WebFetch *tool*, not `curl` typed into Bash, so `curl https://anywhere` runs unprompted |

Cursor's is the strongest behaviour, and it cannot be expressed in `settings.json` or `opencode.json` — neither can match a URL host. So:

- **Option A — guardrails scripts on Claude and opencode.** Claude gets a `PreToolUse` Bash hook, opencode a plugin path, both sharing Cursor's managed block. Every host then runs one engine, host-allowlisted curl works everywhere, and the shell-edit gate above becomes expressible. This also completes the six-cell hook matrix from #422 (Claude and opencode currently have no guardrails *file* — their gates are permission tables). Cost: a hook process on every Bash call, and overlap with the existing tables that needs a stated precedence.
- **Option B — level down to the tables.** Claude adds `Bash(curl:*)` / `Bash(wget:*)` to `ask`; Cursor loses its host-allowlist smartness. Cheap, expressible everywhere, regresses the best host and prompts on ordinary allowlisted fetches.

Recommend A, but it is a real scope decision, not a mechanical fix.

## Done when

- The canonical curl/wget behaviour is chosen and the `it.todo` in `bkit-gate-parity.test.ts` becomes real rows in `SHELL_GATES`, passing on all three hosts.
- In-place shell editors are gated on all three hosts, with `.bkit/workflows/bkit-plan.md:874` still working.
- Whatever is chosen is expressed once and asserted by the parity suite, so the three dialects cannot drift again.

## Correction: the curl/wget divergence table above is stale, and the decision is now the only thing left

Recorded here because #458 closed on the drift half and this issue owns the rest.

### The table in the issue body is wrong for Claude

It says Claude is **"not gated at all"** for shell `curl` / `wget`. That stopped being true on 2026-08-25: `862ccd2` (pre-release audit) added `Bash(curl:*)` and `Bash(wget:*)` to `ask` in both `.claude/settings.json` and the shipped template — effectively this issue's **Option B**, landed for Claude without this issue, `.bkit/workflows.md`, or the parity test being updated. This issue was last touched 2026-08-22, three days before.

Current state, verified against the live docs:

<!-- prettier-ignore -->
| Host | curl / wget in a shell |
| --- | --- |
| Cursor | asks **unless** every URL host is on the network allowlist (`guardrails.cjs` parses the command, matches host labels) |
| opencode | asks on **every** curl / wget (`"curl *": "ask"`) |
| Claude | asks on **every** curl / wget — `Bash(curl:*)` / `Bash(wget:*)` in `ask` |

Claude is now the **strictest** of the three, not the weakest, and the only one with no allowlisted-host escape. A content-scoped `ask` rule is evaluated before the auto-mode classifier and always forces a prompt, beating even a matching `allow` — confirmed empirically in #458's spike S4 (same command, `allow` + `ask` together, auto mode: blocked). So a `context=web` context-fetch block prompts once per run on Claude, in every permission mode.

### Fixed in `22cd8169`, so the docs no longer lie

- `.bkit/workflows.md` — the "**not** on the Claude `ask` list" sentence is gone, replaced with the behaviour above plus a non-auto-vs-auto surface table.
- `.bkit/src/bkit-permissions-parity.integration.test.ts:161-170` — the `KNOWN DIVERGENCE` comment corrected.
- The `ask` row in the § Permissions table now lists `curl:*` / `wget:*`.

### What is still open here, unchanged

The `it.todo` at `bkit-permissions-parity.integration.test.ts:170` is untouched, and the two `ask` rows are untouched. Option A vs B vs revert is still this issue's call. Two things worth folding into it that were not visible when it was written:

1. **Removal needs a migration, not just a template edit.** `.claude/settings.json` is Tier 2 JSON deep-containment and the merge is additive — it never prunes (`bkit-modules.ts`). A consumer who upgrades keeps `Bash(curl:*)` forever. Dropping the rows means a one-shot prune module modelled on `bkit-context-migrate.ts`, wired into **both** the install and upgrade engines (separate engines).
2. **`autoMode.classifyAllShell`.** Setting it to `true` suspends every Bash allow rule while auto mode is active, narrow ones included. It is user-scope only so bkit cannot set it, but it means "narrow rules survive auto mode" is a default, not a guarantee — relevant to Option A's cost model.

Whichever option wins, the doc and test now describe today's behaviour rather than 2026-08-22's, so the next reader is not misled again.

## Correction to my comment above — opencode is not "ask on every curl"

I wrote that opencode "asks on **every** curl / wget (`"curl *": "ask"`)". That is wrong, and I took it from the stale test comment rather than reading the config.

`.opencode/opencode.json` has `curl *: ask` **plus 24 per-domain allows layered after it** (`curl *github.com*: allow`, `curl *tavily.com*: allow`, …), and opencode's permission map is last-match-wins. So opencode already runs an allowlisted-host fetch unprompted. Same for Cursor, which does it properly by parsing the URL host in `guardrails.cjs`.

That changes the shape of this issue's central question. The three hosts were never "Cursor smart, opencode blunt, Claude absent" — they were **two hosts with a working per-domain escape and one that cannot express one at all**.

### Resolved on the Claude side in `81f6c910`

`Bash(curl:*)` / `Bash(wget:*)` are **removed** from `.claude/settings.json` and the template. Reason: a content-scoped `ask` is evaluated before the auto-mode classifier and always forces a prompt, beating even a matching `allow`, in every permission mode — and a cloud session has nobody to answer it, so every `context=web` context-fetch block stalled. Claude rules match a command prefix, not a URL host, so blanket-ask and blanket-allow were the only two expressible options. Shell curl now runs under `Bash(*)` with `deny` and the auto-mode classifier as backstops.

Removal shipped with the migration this issue's constraints imply: `pruneRetiredClaudeAskRules` in `bkit-modules.ts`, exact-string match on the two rows bkit itself shipped, idempotent, dry-run aware, wired into **both** install and upgrade (deep-containment merge is additive and never prunes, so a template edit alone would leave the row in every installed repo forever). A consumer's own curl rule written any other way is untouched — asserted.

### Where that leaves this issue

<!-- prettier-ignore -->
|  | Allowlisted host | Undeclared host |
| --- | --- | --- |
| Cursor | runs | asks |
| opencode | runs | asks |
| Claude | runs | **runs** |

The common path — what context-fetch blocks actually do — is now identical on all three. The remaining divergence is the undeclared-host column, and closing it needs Cursor's host-parsing engine ported to the other two (a `PreToolUse` hook on Claude, a plugin on opencode). That is this issue's **Option A**, unchanged, and still the right end state. It is also what makes the shell-as-edit-channel gate expressible, so both halves of this issue still resolve together.

The `it.todo` in `bkit-permissions-parity.integration.test.ts` is reworded to name that as the remaining work rather than "pick the canonical behaviour", since the behaviour is now picked and only the edge case is open.

The reverse-direction parity assertion in `bkit-modules.integration.test.ts` — the one added in `862ccd2` — correctly failed when the rows came out. It was not deleted: curl/wget are now an explicit exemption carrying the reasoning, and the check was widened to the ten destructive-git classes it had not been covering, so it guards more than before.

## Codex brought into the gate table — `cc49dfa2`

Found while auditing whether the hosts are actually at parity after the curl change. They were not, and the gap was bigger than curl.

### Codex had no shell gating at all

All bkit shipped for Codex was the GateGuard edit hook on `apply_patch`. `rm -rf /`, force-push to a shared branch and `chmod -R 777 /` all ran unguarded — none of the `deny` tier, none of the `ask` tier.

Nothing caught it, for the reason this issue exists: the parity suite's own header read *"The three hosts express gates in three different languages"*. A fourth host was added in #435 and the suite was never taught about it, so it asserted green while a host sat entirely outside the canonical gate set.

### Fixed

`.codex/hooks/guardrails.cjs` — the Cursor decision engine verbatim behind the Claude-family hook envelope, registered on matcher `Bash` (Codex's shell tool name, confirmed against the Codex hooks docs rather than guessed). **All 31 canonical gate rows now pass on four hosts.**

Wired the same way as its peers: manifest entry, module writer in `runCodexModule`, `.codex/hooks.json` gains the `Bash` matcher alongside `apply_patch`, and a Codex-specific `noMarkerMigration` wiring message.

The network allowlist is **read from `.cursor/allowlist.json`**, not duplicated. One install-written artifact means a second copy cannot drift from it; absent (cursor module not installed) it falls back to the shipped tooling bases.

Verified in a clean temp consumer, not only in unit tests: `bkit install --codex` writes the hook, `bkit check` reports no codex drift, and a live `rm -rf /` payload returns a real `permissionDecision: "deny"`.

### One structural divergence, asserted rather than hidden

Per the Codex hooks docs, `permissionDecision: "ask"` is **"parsed but not supported yet"** — an ask is recorded as an error and the tool call proceeds anyway. Codex can deny; it cannot prompt.

So on Codex the deny tier blocks for real and the ask tier is emitted as advisory `additionalContext`: the gate fires and tells the model, it cannot stop the command. `codexVerdict()` in the parity suite maps that advisory back to `"ask"`, so the suite fails if either tier stops firing — the divergence is encoded as a fact, not papered over with a skipped row.

This is safe in practice because every ask-tier command is already on the PROHIBITED list in all five workflow headers, so no bkit workflow reaches one. It covers a human driving Codex by hand.

### Deliberately not done

**Read gates on Codex.** The `.pem` deny and `.env` ask tier needs Codex's file-read tool name, which this repo has not verified. Registering a guessed matcher installs a hook that silently never fires — a gate proving only that it was asked for, which is the exact failure mode this issue is about. The read describe block is relabelled `claude/opencode/cursor` and carries the reason inline.

### Where this leaves the issue

<!-- prettier-ignore -->
|  | Allowlisted host | Undeclared host | Deny tier | Ask tier |
| --- | --- | --- | --- | --- |
| Cursor | runs | asks | ✅ | ✅ |
| opencode | runs | asks | ✅ | ✅ |
| Codex | runs | advisory | ✅ | advisory (cannot prompt) |
| Claude | runs | **runs** | ✅ | ✅ |

Three of four hosts now parse the URL host. **Claude is the only one that cannot** — its rules match a command prefix, not a URL host, which is why its shell fetches are ungated by decision rather than by omission.

That makes Option A smaller than when this issue was written: the engine now exists on three hosts and has been ported once (Cursor → Codex), so the remaining work is one `PreToolUse` Bash hook on Claude reusing it. That closes the last cell of the table and, per this issue's original framing, is also what makes the shell-as-edit-channel gate expressible.

The `it.todo` in `bkit-permissions-parity.integration.test.ts` now names that as the remaining work.

## Both halves done — `f9edd43f`

### 1. Shell-as-edit-channel — the half this issue was named for

`guardrails.cjs` on Claude, Cursor and Codex now detects a shell command being used as an edit channel: in-place `sed` / `perl` / `awk -i inplace`, and redirects into a file that looks like tracked source.

**Advisory, never blocking — that is the design, not a shortcut.** This issue measured the constraint itself: the only in-place shell edit in bkit's corpus is `bkit-plan.md:898`, a `sed -i.bak -E` bulk rewrite of cross-references, and it is the second sanctioned exception in the rule. A gate that blocks a documented exception is a gate that gets switched off. So the gate informs and gets out of the way.

A test pins that exact command — **read out of `bkit-plan.md` at runtime rather than copied into the test** — and asserts every host advises and none blocks. If someone deletes or rewrites that `sed` line, the test says so instead of silently passing.

**Silence is load-bearing too.** This issue predicted the failure mode: *"Denying or asking on all of it would fire constantly and get switched off."* Six negative cases assert the gate stays quiet on `> /dev/null`, `>> "$GITHUB_ENV"`, `/tmp` scratch, `2> err.log`, numbered fds, and commands with no redirect at all.

**Detection is command-position, not substring.** An earlier revision of this matched `/\bcurl\b/` anywhere and fired on `grep -n 'curl' README.md` — caught because it tripped on my own command mid-session. It now resolves each pipeline segment's actual head, skipping `VAR=val` assignments and wrappers (`sudo`, `env`, `xargs`, …) and stripping paths, so `/usr/bin/curl` counts and a quoted mention does not. Pinned by a regression test.

### 2. The Claude curl cell

New `.claude/hooks/guardrails.cjs`, `PreToolUse` matcher `Bash`.

It exists because a permission table covers command *prefixes*, and the two things left open here are not prefixes: **URL hosts** and **shell-edit detection**. Claude could never express either.

**Advisory only, deliberately.** `deny` already lives in `settings.json` and is evaluated before any hook, so duplicating it would be dead code with a second place to drift. And an `ask` here would re-add the blanket prompt that was removed earlier in this issue's thread — the one that stalled every `context=web` block in cloud. The header and the wiring instructions both say this explicitly so a future consumer does not "fix" it into a `permissionDecision`.

### The `it.todo` is gone

Replaced with real assertions covering all four hosts, including both structural splits rather than papering over them:

<!-- prettier-ignore -->
|  | Allowlisted host | Undeclared host | Why |
| --- | --- | --- | --- |
| Cursor | runs | **asks** | parses the URL host — strongest form |
| opencode | runs (install-injected allows) | **asks** | substring-keyed, not host-parsed |
| Claude | runs | **advises** | a table cannot match a URL host; an ask would restore the prompt |
| Codex | runs | **advises** | parses `permissionDecision: "ask"` but does not implement it |

Also asserts host-matching rather than substring-matching, so `https://evil.example/?src=github.com` and `https://github.com.attacker.io/` do **not** read as allowlisted on any host that parses them.

**47 parity assertions, zero todos.**

### opencode stays uncovered for both, on purpose

Its permission table cannot parse a redirect target, and a blanket `sed -i` ask would prompt constantly *and* break the same plan workflow the gate is built to preserve. Recorded in the suite rather than left implicit — closing it needs a plugin, which is a separate piece of work.

### Against this issue's own "Done when"

- ✅ Canonical curl/wget behaviour chosen, and the `it.todo` replaced with passing assertions on all four hosts
- ✅ In-place shell editors gated on all script hosts, with `bkit-plan.md:898` still working — asserted, not assumed
- ✅ Expressed once and asserted by the parity suite, so the dialects cannot drift again

Verified in a clean temp consumer as well as in tests: `bkit install --claude --codex --cursor` writes all the hooks and `bkit check` reports no drift from any of them.

I'd say this closes. Flagging one thing first so it is a decision and not an accident: `.gitignore` currently drifts on a clean install (first install → `check` reports drift, second install → clean), which fails 8 install/check tests on `dev`. It is unrelated to this issue — `git log` puts it on `a9d6f4a4` — but it means CI is red right now.

## #428 — Doc rule headers invisible to agents grepping doc files (closed)

## The problem

Every doc in `docs/` and `.agents/` opens with a `> [!CAUTION]` block holding its `Purpose` and `Rules`, at roughly lines 5-15. Agents rarely reach it. They grep for a section, or Read with an offset, land in the middle of a large file — `docs/testing.md` is 71,800 bytes — edit in place, and never see the header.

Three places tell agents to follow those headers. All three are "remember to go look" instructions, and all three depend on the agent recalling that a header exists and choosing to scroll back:

<!-- prettier-ignore -->
| Where | Text |
| --- | --- |
| `.agents/rules.md:50` | **Authoring:** ALWAYS follow docs `Rules` headers. |
| `.bkit/prompts/bkit-ship-update-docs.md:41` | Per doc, ALWAYS follow its `Rules` headers when making edits. |
| `.bkit/prompts/bkit-utility-update-documentation.md:37` | Per doc, ALWAYS follow its `Rules` headers when making edits. |

Adding a fourth instruction of the same kind will not change the outcome. What is needed is machinery that puts the rules in front of the model at the moment of the edit, regardless of how the agent navigated there.

`#422` already proposes exactly that — a path-scoped density advisory in GateGuard, matched on path prefix, gated on `.md`, with `docs/plans/` excluded. This issue does not restate that design. It records three findings that `#422` either leaves open or gets wrong, and which have to be settled before that design can work.

## Finding 1 — the advisory would never fire for the agents that write docs

GateGuard skips subagents on both hosts:

- `.claude/hooks/gateguard.cjs:166` — `if (payload.agent_id) return;`
- `.opencode/plugin/gateguard.js:197` — returns when `client.session.get()` reports a non-empty `parentID`

The stated reason, in both header contracts, is that bkit's workflow subagents are "already scope-bounded by their own prompts". `#422`'s verification section lists subagent-exemption as a no-regress property that must survive the restructure.

But the agents that exist specifically to edit docs are subagents: `bkit-ship-update-docs` and `bkit-utility-update-documentation`. `bkit-design-generate` and `bkit-plan-generate` write into `docs/plans/` too. Ship the advisory with the exemption intact and it fires for ad-hoc main-loop edits only — never for the doc-writing path it was built for.

The scope-bounded-by-prompt argument holds for the first-touch investigation checklist. It does not hold here: no prompt reproduces what is in `docs/design.md`'s header, and the two doc-writing prompts contain only the same "go look" pointer that is already failing.

**Decision needed:** carve the doc-rules class out of the subagent exemption, or accept that the advisory covers only main-loop edits.

## Finding 2 — Cursor does have a pre-edit hook; the code comment is wrong

`.claude/hooks/gateguard.cjs:34-35` says:

> Host note: Claude-only. Cursor's hook model has no pre-edit context-injection event; see `.bkit/IDEs.md` § GateGuard for the documented divergence.

`#422`'s closing open question repeats that claim. It is not accurate, and `.bkit/IDEs.md` does not exist — that reference dangles. The real documentation is `.bkit/providers.md:227` § GateGuard.

What Cursor's current hook API actually provides:

<!-- prettier-ignore -->
| Hook | Fires | Response fields | Use for this |
| --- | --- | --- | --- |
| `preToolUse` | Before any tool call. Supports `matcher`; documented tool names include `Shell`, `Read`, `Write`, `Grep`, `Delete`, `Task`, `MCP:<tool_name>` | `permission` (`allow`/`deny`), `user_message`, `agent_message`, `updated_input` | **Yes** — fires before the edit |
| `postToolUse` | After the tool call | `additional_context`, `updated_mcp_tool_output` | Too late; edit already written |
| `sessionStart` | Conversation created | `env`, `additional_context` | Front-loads the whole corpus, not per-file |
| `subagentStart` | Before a `Task` subagent spawns | `permission`, `user_message` | Relevant to Finding 1 |

So a pre-edit event exists, and bkit already uses it — `.cursor/hooks.json:21` wires `preToolUse` with matcher `Read|TabRead`. A `Write` matcher is available on the same hook.

The accurate limitation is narrower than "no pre-edit event": Cursor has no way to inject context at pre-edit **without blocking**. `agent_message` is documented as "Message fed back to the agent when the action is denied." There is no `additional_context` on `preToolUse`. `.bkit/providers.md:236` states this correctly — "no pre-edit advisory injection" — so the shipped doc is close to right and the code comment is the one that is wrong.

That distinction matters, because bkit already implements the shape that works within the limitation. `BKIT_GATEGUARD=deny` denies the first touch per file with the checklist as the reason, then allows the retry. That is precisely a deny-once-then-allow flow, and it is what Cursor's `preToolUse` supports natively. Porting GateGuard to Cursor is an adapter plus config, not a new design — but Cursor would run in deny-once mode only, with no advisory mode available.

**Known risks before committing to this**, all from Cursor's own bug tracker:

- `additional_context` accepted and logged by `postToolUse` but not surfaced to the model ([forum](https://forum.cursor.com/t/native-posttooluse-hooks-accept-and-log-additional-context-successfully-but-the-injected-context-is-not-surfaced-to-the-model/155689))
- `user_message` / `agent_message` ignored on Windows v2.0.77 ([forum](https://forum.cursor.com/t/regression-hook-response-fields-user-message-agent-message-still-ignored-in-windows-v2-0-77/142589))
- `updated_input` silently ignored for the `Task` tool ([forum](https://forum.cursor.com/t/pretooluse-hook-updated-input-is-silently-ignored-for-the-task-tool/151985))

The second one is load-bearing for the deny-once route and needs a live spike before design lock, not a docs read.

**Decision needed:** port GateGuard to Cursor in deny-only mode, or keep the divergence and correct the wrong claim in `gateguard.cjs:34` plus the dangling `.bkit/IDEs.md` reference.

## Finding 3 — the reader-side half cannot be fixed by any hook

Some header bullets are not authoring rules at all. They are rules a *reader* needs, and a reader triggers no edit, so no pre-edit hook ever fires:

<!-- prettier-ignore -->
| Doc | Rule in the header | In `.agents/rules.md`? |
| --- | --- | --- |
| `docs/observability.md` | **Never log PII.** Scrub sensitive fields at the source. | Yes — `rules.md:116` |
| `docs/testing.md` | Pre-push gate list; NEVER `--no-verify` | Yes — `rules.md:77` |
| `docs/design.md` | No ad-hoc hex — theme tokens only; all colours MUST support Dark Mode | **No** |
| `docs/design.md` | Touch targets >=44x44px; WCAG 2.1 AA contrast | **No** |
| `docs/warnings.md` | Downgrade only when trigger is known and expected; never silence | **No** |
| `docs/setup.md` | Local seed/test fixtures must never run against remote projects | **No** |

An agent that greps into `docs/design.md` to answer a styling question misses the a11y rules entirely, and no hook helps.

The pattern for fixing this already exists — PII and `--no-verify` were promoted into `rules.md`, which is genuinely always loaded via `CLAUDE.md`. It just was never applied systematically. The work is a sweep: split every `[!CAUTION]` header into authoring rules (stay in the header, delivered by the hook) and behavioural rules (promoted to `.agents/rules.md`, and mirrored to `.bkit/templates/.agents/rules.md`).

Worth doing that sweep first — it sizes both halves and may shrink what the hook has to carry.

## Secondary findings

- `.claude/hooks/gateguard.cjs:35` references `.bkit/IDEs.md`, which does not exist. Correct target is `.bkit/providers.md:227`.
- `.cursor/hooks.json:21` and `.bkit/templates/.cursor/hooks.json:14` use matcher `Read|TabRead`. `TabRead` is not in Cursor's documented `preToolUse` tool-name list — Tab has its own separate hooks, `beforeTabFileRead` and `afterTabFileEdit`. The `Read` half works; the `TabRead` half looks dead. Needs confirming against a live session, then either dropping or rewiring to `beforeTabFileRead`.

## Relation to other issues

`#422` — GateGuard becomes consumer-owned with a bkit-managed block. That issue owns the marker/Tier-2 restructure and the advisory design. Findings 1 and 2 here resolve its closing open question and correct a premise inside it; Finding 3 is outside its scope. Sequence this before or alongside `#422`, not after.

## Sources

- [Hooks | Cursor Docs](https://cursor.com/docs/hooks)
- [Hooks (markdown) | Cursor Docs](https://cursor.com/docs/hooks.md)
- [Cursor 2.4 changelog](https://cursor.com/changelog/2-4) — improved `preToolUse` / `postToolUse` coverage

We fixed the gateguards in #422 so best we can do

## #422 — GateGuard becomes consumer-owned with a bkit-managed block (closed)

## Two problems, one shared blocker

**1. Consumers cannot own their own GateGuard.** `.claude/hooks/gateguard.cjs` and `.opencode/plugin/gateguard.js` are both `byte-equal-text` (`.bkit/src/bkit-manifest.ts:244`, `:337`), force-overwritten by `writeTier1` on every install and upgrade (`.bkit/src/bkit-modules.ts:1065`, `:1942-1949`). A consumer who already has a PreToolUse hook at that path loses it. A consumer who wants their own advisories has nowhere to put them.

**2. Two rule sets are ignored by agents editing this repo, and only caught after the fact** — by tests, or by human review:

<!-- prettier-ignore -->
| Rule set | Where the rule lives | What keeps landing |
| --- | --- | --- |
| `.bkit/workflows/*.md` + `.bkit/prompts/*.md` authoring | `.bkit/workflows.md:46` § Workflow Authoring Rules, `.bkit/prompts.md:18` § Prompt Authoring Rules | rationale, tracker issue numbers, step cross-references by number, non-reused phrasing |
| Dense prose in `docs/*.md` | `.agents/rules.md:34` | new prose runs 2-3x the length of the paragraphs beside it |

A pre-edit reminder fires at the moment the rule applies, unlike a test. But the second problem cannot be solved without the first: with the file force-overwritten, there is no region to put repo-only rules in.

## Change 1 — both hooks become `markered-text`

bkit manages what is between `bkit:start` and `bkit:end`. Everything else is the consumer's, permanently.

`writeTier2` already gives the fresh-install behaviour we want: with no destination file it writes the **whole template**, not just the block (`.bkit/src/bkit-tiers.ts:476-486`). A first install seeds a complete working hook; every upgrade after that touches only the block.

## Change 2 — a `slash-comment` marker style

`<!-- bkit:start -->` parses in `gateguard.cjs`, because CommonJS permits HTML-like comments. In `gateguard.js` it is a hard failure — verified:

```
$ node --input-type=module -e '<!-- bkit:start -->
export default function () {}'
SyntaxError: HTML comments are not allowed in modules
```

`.bkit/src/bkit-tiers.ts:380` supports exactly two styles, `<!-- bkit:start -->` and `# bkit:start`. Neither works in an ES module, so this needs a third: `// bkit:start` / `// bkit:end`. `gateguard.js:55` and `:244` already carry those exact tokens and nothing recognises them today — this is machinery to add, not text.

Seven sites:

<!-- prettier-ignore -->
| File | Site |
| --- | --- |
| `.bkit/src/bkit-install.ts:867` | `MarkerStyle` type |
| `.bkit/src/bkit-install.ts:887` | `selectMarkers` |
| `.bkit/src/bkit-install.ts:909` | style-vs-raw-string discriminator |
| `.bkit/src/bkit-tiers.ts:380-381` | marker ternary |
| `.bkit/src/bkit-tiers.ts:504-505` | marker ternary |
| `.bkit/src/bkit-preflight.ts:81` | `stripManagedBlock` chain |
| `.bkit/src/bkit-uninstall.ts:107-113` | `detectMarkerStyle` |

Trap at `bkit-install.ts:909`: it decides whether its argument is a style name or a literal marker string by comparing against the two known style names. Add a third without updating that discriminator and `"slash-comment"` gets read as a raw marker string.

## Change 3 — the managed block must be pure

`main()` at `gateguard.cjs:157` currently reads stdin, selects an advisory, and calls `emit()` at `:153`. Claude Code parses stdout as a **single** JSON document. If bkit's block emits and consumer code also emits, the output is `{...}{...}`, which does not parse, and the whole hook's output is discarded — bkit's part included.

So the managed block ships predicates, advisory-text builders, dedup/state helpers and one entry point taking the parsed payload and returning advisory text or `null`. No stdin read, no `emit()`, no top-level invocation.

The driver — shebang, stdin read, the call into bkit's entry point, the consumer's own logic, a single `emit()`, the top-level try/catch — lives outside the markers, seeded on first install and consumer-owned thereafter.

This inverts today's structure, but it is the only shape where "consumers own the rest" is true and the stdout contract survives. It is also what makes the migration case below harmless instead of corrupting.

## Change 4 — migration, and it must not be skipped

`.bkit/src/bkit-tiers.ts:519-529`: when the destination exists but has no markers, `writeTier2` **appends the block at EOF**. Every consumer on 4.10.0 has a marker-less `gateguard.cjs`. Left unhandled, upgrade staples the new block onto the end of the existing complete hook — two `main()` calls, two `emit()` calls, two JSON documents, hook output silently discarded on every edit.

<!-- prettier-ignore -->
| Case | Detection | Action |
| --- | --- | --- |
| No file | `!fs.existsSync` | Seed whole template. Works today. |
| File exists, no markers, content hashes to a known shipped bkit gateguard | hash vs `.bkit/version` `canonicalHashes` (+ prior releases' hashes, or accept that only 4.10.0 upgrades cleanly) | It is ours and unmodified — replace wholesale with the new template |
| File exists, no markers, hash unknown | fallthrough | Consumer's own hook. Append the block (pure functions, inert) and print wiring instructions |

Case 3 is the reason the block has to be pure. bkit cannot auto-wire itself into a consumer's driver without generating code inside their region, so it appends and tells them the line to add. Precedent for the printed advisory: `CURSOR_SETTINGS_MERGE_INSTRUCTIONS` at `.bkit/src/bkit-modules.ts:2272`.

Without the case-2 hash check, case 3's append fires on every existing consumer.

## Change 5 — the two path-scoped advisories

Appended to the existing base advisory rather than replacing it: a file's authoring contract is orthogonal to first-touch / new-file / gate-config. Match on **path prefix, not basename** — every one of these directories is full of same-named `bkit-*.md` files.

**Density guard — ships, inside the managed block.** Backed by `.agents/rules.md:34`, which is shipped doctrine, and `docs/*.md` exists in every consumer repo. Quote the rule verbatim: *"Token-efficient dense phrasing. No filler / hedging / restating. Tables > prose, bullets > paragraphs."*

**Authoring guard — dogfood only, outside the markers, in this repo's `.claude/hooks/gateguard.cjs` alone.** `.bkit/templates/.bkit/` holds only `.env.example` and `scripts/`, so `.bkit/workflows/` and `.bkit/prompts/` never exist in a consumer repo. These are bkit-internal rules and ship zero bytes. Under Tier-2 that file stops being force-overwritten, so the repo-only region survives upgrades — the same pattern as bkit-repo-only logic in any other Tier-2 file.

Matching rules:

- **cwd-independent segment match**, `p.startsWith(prefix) || p.includes("/" + prefix)`. The host chooses the hook's working directory; an absolute path that escapes `path.relative` silently matches nothing and the advisory never fires. Note `/docs/` does not match a `Documents/` ancestor — the segment is exact. Normalise separators before matching, in both twins, so the parity test stays honest.
- **One `docs/` prefix covers both trees.** `.bkit/templates/docs/architecture.md` contains the segment `/docs/`, so a second root is unnecessary, and one `docs/plans/` exclusion covers both `docs/plans/` and `.bkit/templates/docs/plans/`. Plans follow the plan template, not the docs register.
- **Gate on `.md`.** `docs/` also holds `knowledge.jsonl`, `decisions.jsonl`, `deferrals.jsonl` and `failures.jsonl`, which agents append to constantly.
- **Quote, don't paraphrase**, or the advisory undercuts the rule it teaches. The two authoring sections run 14 and 12 bullets; quoting all of it is a self-defeating token dump. Quote the ones that keep landing — `.bkit/workflows.md:50`, `:52`, `:57` and the `.bkit/prompts.md:22`, `:27`, `:28` equivalents — and point at the section for the rest. The hook is not a workflow file, so the self-contained no-cross-refs rule does not bind it.

## Change 6 — the tamper gate gets sharper

`.bkit/src/bkit-check-opencode.integration.test.ts:121` asserts that appending one comment line to `gateguard.js` fails `check`. Under Tier-2 that premise is wrong: appending outside the block is now legitimate. It becomes two tests — tampering **inside** the block fails `check`, tampering **outside** passes. That is the property we actually want: bkit guarantees its own code, consumers own theirs.

Uninstall improves too. Today it removes a bkit-owned file; under markers it strips bkit's block and leaves the consumer with a working hook.

## Files this touches

- `.bkit/templates/.claude/hooks/gateguard.cjs`, `.bkit/templates/.opencode/plugin/gateguard.js` — restructure into pure block + seeded driver, add markers, add the density advisory
- `.claude/hooks/gateguard.cjs` — the authoring advisory, outside the markers, this repo only
- `.bkit/src/bkit-manifest.ts:244`, `:337` — `byte-equal-text` → `markered-text`; the rationale comments at `:327-328` need rewriting, not just the format value
- `.bkit/src/bkit-modules.ts:1065`, `:1942-1949` — `writeTier1` → `writeTier2`; comment at `:1057-1059` states the byte-equal rationale
- `.bkit/src/bkit-install.ts`, `bkit-tiers.ts`, `bkit-preflight.ts`, `bkit-uninstall.ts` — the seven `MarkerStyle` sites
- `.bkit/src/bkit-manifest.test.ts:461` — asserts `byte-equal-text` for gateguard.js
- `.bkit/src/bkit-gateguard.integration.test.ts`, `bkit-gateguard-opencode.test.ts` — new advisory cases
- `.bkit/providers.md:238` — documents the env modes; docs and code in the same change
- `.bkit/version` — hashes change for both hooks; `pnpm bkit upgrade` re-stamps

## Verification

- Prove each advisory fires on the intended path and **not** on the others. Negatives: a `.ts` file, a `docs/plans/**` path, and `.bkit/workflows.md` itself (the rule file, which the trailing slash in the `.bkit/workflows/` prefix must exclude) get neither.
- Existing integration tests all pass **relative** paths like `"src/foo.ts"`; Claude Code sends absolute ones. Add absolute-path cases — this gap is already load-bearing for `isNewFile` at `gateguard.cjs:181`.
- Migration, all three cases, as integration tests. Case 2 needs a fixture at the real 4.10.0 hash.
- The three no-regress properties in the header contract — advisory by default, fail open, subagent-exempt via `payload.agent_id` — must still hold after the restructure.
- `pnpm bkit upgrade`, then `pnpm bkit check` reports 0 writes. Run `git config core.bare false` afterwards; install flips it in this repo.
- Dogfood via packed tarball in a clean dir, not the repo, and verify install **and** upgrade live — they are separate engines.

## Not folded in

`.claude/hooks/gate-paths.generated.cjs` is currently consumed by nothing but its own drift test at `.bkit/src/bkit-paths-policy.test.ts:26`. `gateguard.cjs` inlines its own copy of `GATE_CONFIG_PATTERNS` at `:48` rather than requiring it — and cannot require it, because that file is absent from `.bkit/templates/.claude/hooks/` and from `bkit-manifest.ts`, so it never ships. A `require()` would throw in every consumer repo, get swallowed by the fail-open boundary, and leave the hook permanently silent.

So the new predicates stay inline in both hook files, matching the `GATE_CONFIG_PATTERNS` precedent, and are **not** added to `bkit-paths-policy.ts` — nothing would import them and a third copy makes the eventual cleanup worse. Fixing that duplication is its own change.

## Open question

`.cursor/hooks/guardrails.cjs` is also `byte-equal-text` (`.bkit/src/bkit-manifest.ts:308`). It is a different hook — Cursor has no pre-edit context-injection event, per the host note at `gateguard.cjs:34`. Same treatment, or leave it Tier-1 for now?

## Verification against the working tree

Checked every file:line claim in this issue. **Accurate on nearly every code claim — all seven cited sites are exact.** Four problems, one load-bearing.

### What checks out

<!-- prettier-ignore -->
| Claim | Verdict |
| --- | --- |
| Both hooks `byte-equal-text` at `.bkit/src/bkit-manifest.ts:244`, `:337` | exact |
| `writeTier1` force-overwrite at `.bkit/src/bkit-modules.ts:1065`, `~:1942` | correct; the call itself is `:1952`, `:1942-1949` is the comment header |
| All 7 marker sites (`bkit-install.ts:867/887/909`, `bkit-tiers.ts:380-381/504-505`, `bkit-preflight.ts:81`, `bkit-uninstall.ts:107-113`) | every line exact |
| The `:909` trap (style-name vs raw-string discriminator) | real — a third style falls to `else` and is read as a literal marker |
| `writeTier2` seeds whole template when dest missing (`:476-486`) | exact |
| Append-at-EOF when dest exists marker-less (`:519-529`) | exact |
| HTML comments are a hard error in ES modules | reproduced live, same `SyntaxError` |
| ...and legal in CommonJS | reproduced live |
| `gateguard.js:55` / `:244` already carry `// bkit:start` / `// bkit:end`, unrecognised | exact, present in both template and mirror |
| Tamper test at `bkit-check-opencode.integration.test.ts:121` appends one comment line | exact; no `.cjs` equivalent exists, so it really is one test to split |
| `.bkit/templates/.bkit/` holds only `.env.example` + `scripts/` | confirmed |
| `docs/` holds the four `.jsonl` files | confirmed |
| `.agents/rules.md:34` quote | verbatim |

### Problem 1 — there is an eighth site, and missing it breaks upgrade silently

`.bkit/src/bkit-upgrade.ts` has its **own** marker-style detection, separate from the install engine:

```
bkit-upgrade.ts:111  function detectMarkerStyle(templateContent) {
:112    if (templateContent.includes("<!-- bkit:start -->")) return "html-comment";
:113    if (templateContent.includes("# bkit:start")) return "hash-comment";
:114    return null;
:343    writeTier2(templatePath, absolutePath, tokens, markerStyle ?? "html-comment", ...)
```

A `// bkit:start` template matches neither branch, returns `null`, and `:343` falls back to `"html-comment"`. `writeTier2` then calls `extractFullManagedBlock(srcRaw, "html-comment")`, finds no HTML markers in the template, hits the `fullBlock === null` guard at `bkit-tiers.ts:492` and **returns early**.

So it is not the append-corruption Change 4 guards against — it is worse in a quieter way: `bkit upgrade` stops managing `gateguard.js` entirely. No error, no write, no drift signal. This belongs in the site table as an eighth row.

`.bkit/src/bkit-uninstall.ts:568` carries the same `detectMarkerStyle(content) ?? "html-comment"` fallback shape; the cited `:107-113` covers the function but the fallback deserves naming.

### Problem 2 — Change 5's `prompts.md` line numbers point at the wrong rules

Change 5 says quote `.bkit/workflows.md:50, :52, :57` and "the `.bkit/prompts.md:22, :27, :28` equivalents". Only the first pairs up:

<!-- prettier-ignore -->
| workflows.md | prompts.md (cited) | actual equivalent |
| --- | --- | --- |
| `:50` Instructions only | `:22` Instructions only — correct | — |
| `:52` No internal labels / tracker numbers | `:27` **Generic Role, specific Process** — wrong | prompts has no tracker-label rule at all |
| `:57` Reuse wording and formatting | `:28` **Rationale lives here** — wrong | `:29` |

The problem table at the top of this issue lists "step cross-references by number" as a thing that keeps landing. That rule is `prompts.md:24` **No step numbers**, which is not in the quote list. The set that matches the stated failure modes is `:22, :24, :29`.

Both files are staged-modified in the working tree right now, but HEAD and working tree agree on every one of these numbers, so this is not line drift.

### Problem 3 — the bullet counts are understated

"The two authoring sections run 14 and 12 bullets" — they run **17 and 17**. Does not change the conclusion (quote a subset, point at the section for the rest); it strengthens it.

### Problem 4 — Change 3 fixes the `.cjs` shape and leaves the `.js` twin wrapping everything

In `gateguard.js`, `// bkit:start` is at line 55 and `// bkit:end` is line 244 — the last line of the file. `export default function plugin(input)` sits at `:175`, **inside** the block. The only thing outside the markers is the 54-line header comment.

Flip that file to `markered-text` as it stands and opencode consumers own nothing. Change 3's argument — driver outside, pure functions inside — has no counterpart written for the plugin twin. The stdout-contract reasoning does not transfer (opencode throws rather than emitting JSON), but "consumers own the rest" does, so the `.js` block needs re-cutting around `:175` as well.

### One simplification worth taking

Change 4 case 2 hedges: "hash vs `.bkit/version` `canonicalHashes` (+ prior releases' hashes, or accept that only 4.10.0 upgrades cleanly)". Neither is needed. The consumer's own `.bkit/version` already carries `canonicalHashes[".claude/hooks/gateguard.cjs"]` and `[".opencode/plugin/gateguard.js"]` — verified present, and `.bkit/src/bkit-install.ts:2635` refreshes them from on-disk content on every install and upgrade. Compare the file against the consumer's recorded hash and case 2 works for **any** prior version, with no shipped hash table and no 4.10.0-only caveat.

### Minor

`gateguard.cjs:153` is where `emit()` is *defined*; the calls are at `:189` and `:191`. The top-level `try { main() } catch` at the file's tail is real, as described.

# Implementation plan

Written for an executing agent. Line numbers are as of `70e1e031` and **will shift as you work** — re-grep before every edit, never trust a number in this comment as still current. Read `.agents/rules.md` in full before starting.

## Briefing on authoring rules

**The `.bkit/workflows.md` § Workflow Authoring Rules and `.bkit/prompts.md` § Prompt Authoring Rules do NOT bind this work.** This change touches no `.bkit/workflows/*.md` and no `.bkit/prompts/*.md` file. Those rules appear here only as the *content* the new advisory quotes. If the work does end up touching either surface, stop and follow the rules in full at that point.

What does bind you:

- **`.agents/rules.md` § Output & Editing** — any prose you add to `docs/*.md` must be as dense as the paragraphs beside it. Same rule the density advisory teaches; the plan is self-defeating if the docs it produces violate it.
- **Advisory text is paid on every hook invocation.** Treat every byte as costly. Quote the rules **verbatim** — never paraphrase. A paraphrased rule in an advisory undercuts the rule it teaches.
- **ASCII operators only** in anything under `.bkit/` — `!=`, `>=`, `<=`. Never Unicode `≠ ≥ ≤`.
- **Docs change in the same commit as the code**, never as a follow-up.
- **No tracker issue numbers in consumer-facing shipped text** (advisory strings, template comments). Describe the reason instead. Source comments in `.bkit/src/*.ts` may cite issue numbers.

## Ordering

T1 → T2/T3 (parallel) → T4 → T5 → T6 → T7 → T8. T4 depends on the marker style existing and on both hooks having final block boundaries.

---

## T1 — add the `slash-comment` marker style

Eight sites, not seven. The issue body lists seven; verification found an eighth in the upgrade engine.

<!-- prettier-ignore -->
| # | File | Site | Change |
| --- | --- | --- | --- |
| 1 | `.bkit/src/bkit-install.ts` | `MarkerStyle` type (`:867`) | add `\| "slash-comment"` |
| 2 | `.bkit/src/bkit-install.ts` | `SLASH_*_MARKER` consts (near `:862-865`) | add `// bkit:start` / `// bkit:end` |
| 3 | `.bkit/src/bkit-install.ts` | `selectMarkers` (`:887`) | ternary becomes a switch or lookup |
| 4 | `.bkit/src/bkit-install.ts` | style-vs-raw-string discriminator (`:909`) | **the trap** — add `\|\| markerOrStyle === "slash-comment"` or the literal is read as a raw marker string |
| 5 | `.bkit/src/bkit-tiers.ts` | marker ternary (`:380-381`) | third branch |
| 6 | `.bkit/src/bkit-tiers.ts` | marker ternary (`:504-505`) | third branch |
| 7 | `.bkit/src/bkit-preflight.ts` | `stripBkitBlock` chain (`:81`) | third nested `stripManagedBlock` call |
| 8 | `.bkit/src/bkit-uninstall.ts` | `detectMarkerStyle` (`:107-113`) | add `/^\/\/ bkit:start$/m` → `"slash-comment"`, **after** the existing two checks |
| **9** | **`.bkit/src/bkit-upgrade.ts`** | **`detectMarkerStyle` (`:111-115`) + fallback (`:343`)** | **see below — missing from the issue body** |

### Site 9 is load-bearing

`bkit-upgrade.ts` has its own `detectMarkerStyle`, sniffing **template** content:

```js
function detectMarkerStyle(templateContent) {
  if (templateContent.includes("<!-- bkit:start -->")) return "html-comment";
  if (templateContent.includes("# bkit:start")) return "hash-comment";
  return null;
}
```

A `// bkit:start` template matches neither, returns `null`, and `:343` falls back to `markerStyle ?? "html-comment"`. `writeTier2` then calls `extractFullManagedBlock(srcRaw, "html-comment")`, finds nothing, hits the `fullBlock === null` guard at `bkit-tiers.ts:492` and **returns early**.

The result is not corruption — it is a silent no-op. `bkit upgrade` stops managing `gateguard.js` with no error and no drift signal. Add the third branch here.

Two ordering constraints in both `detectMarkerStyle` twins:

- The html-comment check stays **first**. An html marker may itself be `// `-prefixed (`// <!-- bkit:start -->`), so a slash-comment check running first would mis-classify it.
- The slash check must be anchored (`/^\/\/ bkit:start$/m`), not `.includes("// bkit:start")`, or a `// <!-- bkit:start -->` line matches both.

**Also check:** `ALLOWED_PREFIXES` at `bkit-install.ts:894` is `["", "# ", "// "]`. A bare `// bkit:start` marker is prefix `""`, so line-anchoring already works — confirm with a test, do not change the array.

**Acceptance:** unit tests covering `selectMarkers`, `findLineAnchoredMarkers`, `stripManagedBlock`, `extractManagedBlock`, both `detectMarkerStyle` twins, and `stripBkitBlock` for `slash-comment`, including the `// <!-- bkit:start -->` mis-classification case.

---

## T2 — restructure `.bkit/templates/.claude/hooks/gateguard.cjs`

Current shape: shebang `:1`, requires `:39-41`, predicates and builders `:43-151`, `emit()` `:153`, `main()` `:157-196`, top-level `try { main() } catch` `:198-202`.

Target shape:

```
#!/usr/bin/env node
<header comment>

// bkit:start
  requires, EDIT_TOOLS, GATE_CONFIG_PATTERNS
  isGateConfig, investigationChecklist, reuseChecklist, configAdvisory
  stateDir, stateFile, readState, alreadyWarned, markWarned, gcOldState
  bkitGateguard(payload) -> { mode, context } | null
// bkit:end

function emit(payload) { ... }

try {
  const payload = JSON.parse(<stdin>);
  const result = bkitGateguard(payload);
  if (result) {
    emit(result.mode === "deny"
      ? { hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: result.context }
      : { hookEventName: "PreToolUse", additionalContext: result.context });
  }
} catch {
  process.exitCode = 0; // fail open
}
```

Hard requirements on the block:

- **No stdin read, no `emit()`, no top-level invocation inside the markers.** Claude Code parses stdout as a single JSON document; two emitters produce `{...}{...}`, which fails to parse and discards the whole hook's output including bkit's.
- `bkitGateguard` takes the **already-parsed** payload and returns `{ mode, context }` or `null`. It must not touch `process.stdin` or `process.stdout`.
- Side effects that are not stdout (`markWarned`, `gcOldState`) stay inside the block — they are bkit's dedup state, not the consumer's.

**Watch the `slop:delta` gate.** The restructure moves a `try/catch`. A new catch-with-default-return bumps `defensive.error-obscuring` and fails `pnpm slop:delta` on net score even at net-zero count. Keep exactly one fail-open catch, in the driver, where one already exists.

**Acceptance:** `.bkit/src/bkit-gateguard.integration.test.ts` passes unchanged — it spawns the real hook end to end, so it proves the driver still wires up.

---

## T3 — restructure `.bkit/templates/.opencode/plugin/gateguard.js`

The issue notes this file already carries `// bkit:start` / `// bkit:end`. **It does not note that those markers wrap the entire implementation.** `// bkit:start` is line 55, `// bkit:end` is line 244 — the last line — and `export default function plugin(input)` sits at `:175`, inside the block. Only the 54-line header comment is outside.

Flip to `markered-text` as-is and opencode consumers own nothing. Re-cut the block:

- `// bkit:end` moves to just before the `export default function plugin` declaration.
- The block ends with a pure `bkitGateguard(toolName, filePath, sessionId)` returning `{ mode, context }` or `null`.
- The exported plugin becomes the consumer-owned driver: it calls `bkitGateguard`, throws with `result.context` on deny, and adds context otherwise.

The stdout-contract argument does not transfer here (opencode throws rather than emitting JSON), but "consumers own the rest" does, and the two twins should have the same block boundary so the parity test stays meaningful.

**Acceptance:** `.bkit/src/bkit-gateguard-opencode.test.ts` passes; the block contains no `export`.

---

## T4 — manifest flip and migration

### Manifest

`.bkit/src/bkit-manifest.ts:244` and `:337` — `byte-equal-text` → `markered-text`. Update the comments above each; they currently state the file is fully bkit-owned with no consumer edits expected, which stops being true.

Uninstall needs no separate change. `buildDecisionTable` sources entries from `getInstallManifest(...)`, so the format flip flows through to the `markered-text` case at `bkit-uninstall.ts:305` automatically. That is what delivers the issue's "uninstall strips the block and leaves a working hook" — verify it with a test rather than assuming.

### Migration

Every consumer on 4.10.0 has a marker-less `gateguard.cjs`. Three cases:

<!-- prettier-ignore -->
| Case | Detection | Action |
| --- | --- | --- |
| No file | `!fs.existsSync` | `writeTier2` already writes the whole template. No new code. |
| File exists, no markers, hash matches | on-disk sha256 == consumer's own `.bkit/version` `canonicalHashes[<path>]` | ours and unmodified — replace wholesale with the new template |
| File exists, no markers, hash differs | fallthrough | consumer's own hook — append the block (pure, inert) and print wiring instructions |

**Do not ship a table of prior-release hashes.** The consumer's `.bkit/version` already carries `canonicalHashes[".claude/hooks/gateguard.cjs"]` and `[".opencode/plugin/gateguard.js"]`, refreshed from on-disk content on every install and upgrade (`bkit-install.ts:2635`). Comparing against that entry makes case 2 work for **any** prior version, with no 4.10.0-only caveat. This removes the hedge in the issue body.

**Placement.** Both the install/check path (`runClaudeModule`, `runOpencodeModule`) and the upgrade path (`bkit-upgrade.ts:343`) funnel through `writeTier2`, so put the logic in `writeTier2`'s existing `blockContent === null` branch (`bkit-tiers.ts:500-531`), gated behind a new optional parameter — default off, so no other Tier-2 file changes behaviour. Add a `ManifestEntry` field to carry the policy declaratively and have both engines pass it.

**Do not disturb** the existing ambiguous-marker guard at `bkit-tiers.ts:508-513` (markers present but unparseable → warn and skip). The hash check goes after it.

Wiring instructions follow the precedent of `CURSOR_SETTINGS_MERGE_INSTRUCTIONS` at `.bkit/src/bkit-modules.ts:2272`: a printed advisory with the exact line to add. No tracker refs in that string.

**Acceptance:** integration tests for all three cases, run through **both** `bkit install` and `bkit upgrade` — they are separate engines and diverge. Case 2 must produce a byte-identical result to a fresh install.

---

## T5 — the two path-scoped advisories

Both **append to** the existing base advisory, never replace it. A file's authoring contract is orthogonal to first-touch / new-file / gate-config.

### Matching rules

- **cwd-independent segment match:** `p.startsWith(prefix) || p.includes("/" + prefix)`. The host chooses the hook's working directory; an absolute path that escapes `path.relative` silently matches nothing and the advisory never fires.
- **Normalise separators before matching**, in both twins, so the parity test stays honest.
- **Gate on `.md`.** `docs/` also holds `knowledge.jsonl`, `decisions.jsonl`, `deferrals.jsonl` and `failures.jsonl` — all four confirmed present — and agents append to them constantly.
- **Exclude `docs/plans/`.** Plans follow the plan template, not the docs register. One exclusion covers both `docs/plans/` and `.bkit/templates/docs/plans/`.
- **One `docs/` prefix covers both trees** — `.bkit/templates/docs/architecture.md` contains the segment `/docs/`. A second root is unnecessary.
- Match on **path prefix, not basename** — every one of these directories is full of same-named `bkit-*.md` files.

### Density guard — ships, inside the managed block

Backed by `.agents/rules.md:34`, which is shipped doctrine, and `docs/*.md` exists in every consumer repo (`.bkit/templates/docs/` confirmed). Quote verbatim:

> Token-efficient dense phrasing. No filler / hedging / restating. Tables > prose, bullets > paragraphs.

### Authoring guard — dogfood only, outside the markers

Goes in **this repo's `.claude/hooks/gateguard.cjs` only** — not the template, not the opencode twin. `.bkit/templates/.bkit/` holds only `.env.example` and `scripts/` (confirmed), so `.bkit/workflows/` and `.bkit/prompts/` never exist in a consumer repo. These are bkit-internal rules and must ship zero bytes.

Under Tier-2 that file stops being force-overwritten, so a region outside the markers survives upgrades.

**Which rules to quote — the issue body gets this wrong.** It cites `prompts.md:22, :27, :28` as the equivalents of `workflows.md:50, :52, :57`. Only the first pairs up. `:27` is *Generic Role, specific Process* and `:28` is *Rationale lives here* — neither is an equivalent, and the reuse rule is `:29`. Meanwhile the failure mode the issue itself lists, "step cross-references by number", maps to `prompts.md:24` *No step numbers*, which is absent from the list.

Quote these, verbatim, by rule name rather than line number (numbers drift):

<!-- prettier-ignore -->
| Surface | Rules to quote |
| --- | --- |
| `.bkit/workflows/` | **Instructions only**, **No internal labels, no coined guard names**, **Reuse wording and formatting** |
| `.bkit/prompts/` | **Instructions only**, **No step numbers**, **Reuse wording and formatting** |

Then point at `.bkit/workflows.md` § Workflow Authoring Rules / `.bkit/prompts.md` § Prompt Authoring Rules for the rest. Each section runs **17 bullets** (the issue body says 14 and 12 — both wrong); quoting all of it would be a self-defeating token dump.

The hook is not a workflow file, so the self-contained no-cross-refs rule does not bind these strings.

**Acceptance:** a test proving `/docs/` does not match a `Documents/` ancestor — the segment is exact; a test proving `docs/plans/foo.md` is excluded and `docs/architecture.md` is not; a test proving `docs/knowledge.jsonl` is not matched; a parity test asserting the two twins' matching behaviour is identical.

---

## T6 — tests

1. **Split the tamper gate.** `.bkit/src/bkit-check-opencode.integration.test.ts:121` currently appends `\n// consumer tampered\n` to `gateguard.js` and asserts `check` exits 1. Under Tier-2 that premise is wrong — appending outside the block is legitimate. Becomes two tests: tampering **inside** the block fails `check`; tampering **outside** passes. That is the property actually wanted.
   There is no `.cjs` equivalent of this test today, so this is the only one to split. Consider adding the `.cjs` pair.
2. Marker-style unit tests (T1 acceptance).
3. Migration integration tests, all three cases, both engines (T4 acceptance).
4. Path-matching and twin-parity tests (T5 acceptance).
5. **Upgrade round-trip:** install at the new version, tamper outside the block, `bkit upgrade`, assert the outside-block content survived and the block was refreshed. This is the regression test for site 9 — it fails today if site 9 is missed, and nothing else catches it.

---

## T7 — docs, same commit

- `docs/architecture.md:140` — `.opencode/plugin/gateguard.js` is listed in the opencode tree; note the ownership change. Add the Tier-2 ownership split for both hooks wherever tiers are described.
- `docs/testing.md:444` and `:488` — test inventory rows for any new test file.
- `.bkit/advisories.md` — check whether the entry referencing `.opencode/plugin/gateguard.js` (`:1253`) needs updating.
- Optional but recommended: a `docs/knowledge.jsonl` entry for the site-9 trap (upgrade carries a second `detectMarkerStyle`; adding a marker style to the install engine alone makes upgrade silently stop managing the file). It is exactly the recurrence-prone class that ledger exists for.

Keep new prose dense per `.agents/rules.md:34`. Reference docs are current-state, not history — no `DE-N`/`KN-N` tokens, no recurrence narrative outside the ledger.

---

## T8 — regenerate mirrors, once, at the end

`.claude/hooks/gateguard.cjs` and `.opencode/plugin/gateguard.js` are both tracked and rendered from the templates. **Do not run `bkit install` after each edit** — batch it at the end.

```
pnpm build
pnpm bkit install       # refreshes mirrors + .bkit/version hashes
git config core.bare false   # bkit install flips this to true in this repo; it breaks git checkout/status
```

Then re-apply the T5 repo-only region outside the markers in `.claude/hooks/gateguard.cjs` if the install pass stripped it, and confirm `pnpm bkit check` still exits 0 with that region present. **If check flags it, the Tier-2 flip is not working as intended — that is a real failure, not a nuisance to suppress.**

## Gates before handing back

```
pnpm typecheck
pnpm test
pnpm lint:slop && pnpm slop:delta
pnpm lint:workflows
pnpm lint:prose
pnpm format:check
pnpm bkit check
```

Report any gate you could not get green, with its actual output. Do not report the work complete with a gate skipped.

# Implementation done — everything in the working tree, nothing committed or pushed

Followed the T1–T8 plan from the implementation-plan comment. All eight tasks are done and all gates are green. Below: what changed, one real bug the plan didn't anticipate that I found and fixed while dogfooding it in this repo, and the current gate status.

## What changed (T1–T7, as planned)

- **T1** — added `slash-comment` as a real marker style (`// bkit:start` / `// bkit:end`) across all 9 sites the plan named, including the load-bearing 9th one in `bkit-upgrade.ts` (its own `detectMarkerStyle`, separate from `bkit-install.ts`'s).
- **T2 / T3** — restructured both `gateguard.cjs` (Claude) and `gateguard.js` (opencode) into a pure `bkitGateguard(...)` engine inside the markers, with the stdin/stdout driver (Claude) or exported plugin (opencode) living outside — so a consumer's own driver code now survives every `bkit install` / `bkit upgrade`.
- **T4** — flipped both manifest entries from `byte-equal-text` to `markered-text`, and added the migration handling for consumers upgrading from before this change (see the bug below — the design here changed from what the plan described).
- **T5** — the two path-scoped advisories: a shipped `docs/*.md` density-authoring reminder (in both twins), and a dogfood-only advisory in *this repo's* `.claude/hooks/gateguard.cjs` that fires on edits to `.bkit/workflows/*.md` or `.bkit/prompts/*.md`, quoting the relevant authoring rules verbatim.
- **T6** — full test coverage: marker-style unit tests, the tamper-gate split (inside-block tampering fails `check`, outside-block tampering passes), migration integration tests through both the install and upgrade engines, twin-parity tests, and an upgrade round-trip regression test for the site-9 trap.
- **T7** — `docs/architecture.md` and `docs/testing.md` updated in the same change; added a `docs/knowledge.jsonl` entry recording the site-9 lesson (bkit-upgrade.ts's own `detectMarkerStyle` needs updating in lockstep with bkit-install.ts's).

## The bug the plan didn't cover — found by actually running the migration on this repo

Plain description of what went wrong: the plan's migration logic only handled "no markers on disk yet." But `.opencode/plugin/gateguard.js` in every existing install (including this repo's own copy) **already** had `// bkit:start` / `// bkit:end` text wrapping the *entire file*, left over from before those markers meant anything to the tooling. Once T1 made the tooling recognize that text as real markers, `bkit upgrade` treated the file as "already migrated" and did an ordinary block-only merge — which discarded everything between the markers that wasn't part of the new, smaller block. In practice: the exported plugin function (the actual opencode integration point) got silently deleted from this repo's own `.opencode/plugin/gateguard.js` the first time I ran `bkit upgrade` on it. Every real consumer would have hit the identical breakage on their next upgrade.

My first fix attempt (check the file's hash against a previously-recorded "canonical" hash, and if it matches, safely replace the whole file) turned out to be unsound for a different reason: once a file has been migrated correctly and has real consumer content after the block, running upgrade *again* re-records that combined content's hash as canonical — so a second, completely uneventful upgrade run would "match its own hash" and wipe the consumer's content right back out. I caught this only because I deliberately ran the migration twice in a row and diffed the result.

The fix that actually holds up: instead of comparing hashes, check whether there is any real content *after* the end marker. A file whose markers used to wrap the whole file has nothing there. Once genuinely migrated, real driver code lives after the end marker, so the check can never fire again — it's structurally self-limiting rather than relying on a hash that gets overwritten every run. I verified this by running the migration three times in a row against a tampered fixture and confirming the outside content survives every time, `bkit check` is clean afterward, and reverting the fix reproduces the original data loss.

## Gate status

```
pnpm typecheck    green
pnpm test         green (3190 passed, 2 skipped, 1 todo)
pnpm lint:slop    report-only, no gate
pnpm slop:delta   green against the correct base (see note)
pnpm lint:workflows  green (actionlint)
pnpm lint:prose   0 errors, 2 pre-existing warnings unrelated to this change
pnpm format:check green
pnpm bkit check   green, 0 writes would occur
```

One caveat worth flagging on `slop:delta`: run plain, it reported a false failure (net +2 score) because its default base-ref resolution landed on a stale commit — this repo's local `dev` and `origin/dev` have diverged, so `merge-base(HEAD, origin/dev)` resolves to an older commit than what's actually checked out. Running it explicitly against `origin/main` (`SLOP_BASE_REF=origin/main`) — which is what the script itself falls back to — comes back clean (net score -3.00). I did not touch the two files the stale base was blaming (`bkit-analysis.ts`, `bkit-ledger-integrity.test.ts`); that's pre-existing repo state, not something from this change.

## Not done in this pass

Nothing — all eight tasks from the plan are complete, plus the migration-safety fix above, which the original plan didn't anticipate.

## State

Everything is in the working tree only. No commits, no pushes, as instructed.

## Where the hook files actually stand

The end state asked for is "managed blocks in gateguards and guardrails for Claude, opencode and Cursor". That is six cells, and only three of them were ever files:

<!-- prettier-ignore -->
|  | GateGuard (pre-edit advisory) | Guardrails (destructive-op / secret gates) |
| --- | --- | --- |
| Claude | `.claude/hooks/gateguard.cjs` — now markered | `.claude/settings.json` `permissions` (deny 11 / ask 21) — declarative JSON |
| opencode | `.opencode/plugin/gateguard.js` — now markered | `.opencode/opencode.json` `permission` map — declarative JSON |
| Cursor | **did not exist — now built** | `.cursor/hooks/guardrails.cjs` — now markered |

The two guardrails cells for Claude and opencode are not scripts and never have been. They are permission tables inside JSON config, both already `json` format in the manifest, both already merged by deep-containment so bkit's keys reconverge and consumer keys survive untouched. JSON has no comment syntax, so there is nowhere to put a marker, and nothing to protect that containment-merge is not already protecting. Those two cells are done by a different mechanism, not undone.

That leaves one genuine gap, Cursor GateGuard, which is now built.

## Spike: GateGuard on Cursor

Run against **Cursor 3.17.8** — two live agent sessions plus a static read of the shipped app bundle.

The starting belief was that Cursor could not host GateGuard because it had no way to inject context before an edit without blocking. That belief was wrong, and the public docs are what made it wrong.

**What the bundle showed.** `preToolUse` is in the set of hooks allowed to return `additional_context`:

```js
uNi = new Set([sessionStart, beforeSubmitPrompt, preToolUse, postToolUse, postToolUseFailure])
```

Claude-Code hook compatibility is not a setting — it is hardcoded on:

```js
validateParsedHookResponse(e,t){ return Xqu(e,t,{enableClaudeNestedHookSpecificOutputCompatibility:!0}) }
```

Cursor also ships a Claude `settings.json` hook importer (`claude-code-types.ts`) mapping `PreToolUse → preToolUse` and tools `Bash→Shell`, `Read→Read`, `Write→Write`, `Edit→Write`.

**What the live runs showed.** Two nonsense canaries, one returned via Cursor's native `additional_context`, one via Claude's nested `hookSpecificOutput.additionalContext`, both on `permission: "allow"`. The agent echoed **both** back, and reported them arriving as a `system_reminder` on the tool result. Non-blocking pre-edit context injection works, in both shapes.

**Payload facts** (these decided the implementation):

<!-- prettier-ignore -->
|  | Value |
| --- | --- |
| Session key | `session_id`, equal to `conversation_id` — bkit's existing field works unchanged |
| Path key | `tool_input.file_path` — same as Claude |
| Tool name for edit **and** create | both `Write`, both `{file_path, content}` |
| Path form | **relative** to the workspace root on writes, absolute on reads |
| Subagent marker | none — no `agent_id`, nothing equivalent |

## What was built

`.bkit/templates/.cursor/hooks/gateguard.cjs`. The managed block is **byte-identical** to the Claude twin's, asserted by a parity test, because the engine was already host-neutral. Only the driver outside the markers is Cursor-specific, and it does two things the spike proved necessary:

1. **Resolves `file_path` against `workspace_roots[0]`.** The new-file advisory turns on `fs.existsSync`. A relative path that misses makes every edit look like a new file.
2. **Routes deny to `agent_message`.** Cursor maps the Claude nested `permissionDecisionReason` onto `user_message`, which goes to the human. A checklist the model never reads is not a gate.

Wired in `.cursor/hooks.json` as `preToolUse` with matcher `Write`, deliberately **without** `failClosed` — an advisory hook that fails closed would block the edit it only meant to comment on.

## Decisions

**Subagents are no longer exempt.** Removed from both existing hooks: Claude's `if (payload.agent_id) return null`, and opencode's `client.session.get()` / `parentID` lookup. A subagent edit is still an edit, and the investigation it skips is the same investigation. Dedup is per (session, file) and a subagent runs in its own session, so it gets its own checklist. The three tests that asserted the exemption now assert the opposite. Cursor never had a marker to exempt on, so it was born correct.

Removing the opencode lookup also drops an async client call from the hot path.

**New rule — shell is not an edit channel.** Added to `.agents/rules.md` § Output & Editing and its template:

> **Edit tools only:** ALWAYS change file contents with the edit / write tools. NEVER through the shell — no `sed -i`, `perl -pi`, `awk -i`, `>` / `>>` redirection, `tee`, or heredoc into a tracked file. Shell edits bypass the pre-edit gates entirely, so nothing checks callers, contracts or duplication. Generating a file from a script is the one exception: say so, and read the result back.

This came out of the spike by accident. In the first run the agent was asked to append a line to two files and did it with shell commands — the hook log shows `Read`, `Shell` and `Grep` and no `Write` at all. GateGuard fires on edit tools only, so an agent that prefers the terminal routes around it completely. That was equally true of the Claude hook before this issue; the spike just made it visible. Note the rule is about the *channel*, not about shell generally — banning shell outright would be wrong.

## Also fixed along the way

- **A real test flake.** `newSession()` in `bkit-gateguard.integration.test.ts` returned `gg-test-${pid}-${counter}`. Dedup state is keyed by session id and lives in the OS temp dir for 24h, so whenever the OS recycles a pid the advisory is suppressed and the assertion fails for no reason. Now carries a random component.
- **Stale doc pointer.** Both `gateguard.cjs` copies pointed at `.bkit/IDEs.md § GateGuard`; that file was renamed to `.bkit/providers.md` some time ago.
- **Wrong tier listing.** `.bkit/README.md` listed `.claude/hooks/preflight.sh` and `.cursor/hooks/preflight.sh` under Tier 1. Both have been `markered-text` in the manifest for a while.

## Still open

- Whether Cursor's `guardrails.cjs` should also gate shell-as-edit-channel (`beforeShellExecution` already sees every command, and the Claude / opencode permission tables could carry the same patterns). That would make the new rule enforced rather than advisory.
- `.claude/hooks/gate-paths.generated.cjs` duplication, unchanged and still out of scope per the issue body.

Verification: 3333 tests pass across 91 files, typecheck / Prettier / Vale clean, `dist/` rebuilt.

## Cross-host gate alignment — audit result

Added `.bkit/src/bkit-gate-parity.test.ts`: one canonical gate table, asserted against all three hosts through an adapter per dialect (Claude's `Bash(prefix)` patterns, opencode's last-match-wins globs, Cursor's `guardrails.cjs` spawned as a real process). 31 gates × the hosts that can express them.

**The hosts already agree on everything in the table** — every `rm -rf` root/home case, `chmod -R 777 /`, force-push, all five publish commands, the seven destructive-git operations, the three `gh` destructive commands, private-key reads, `.env` / `.bkit/.env` asks, `.env.example` allow, and the network allowlist naming the same hosts in Cursor's `SHIPPED_NETWORK_BASES` and Claude's `WebFetch(domain:…)` set.

Two things worth recording from the audit:

**A correction to my own earlier reading.** I thought opencode wrongly denied `git push --force-with-lease`, because `"git push --force*": "deny"` globs over it. It does not — a later `"git push --force-with-lease*": "allow"` key wins under last-match-wins. All three hosts allow it, as `rules.md` requires. The parity suite now pins that explicitly, since it is the one force-push variant that must **not** be denied and it survives only by key ordering in a JSON object.

**One genuine divergence: curl / wget in a shell.** Cursor asks unless every URL host is allowlisted; opencode asks on all; Claude does not gate it at all (its WebFetch allowlist governs the WebFetch tool, not `curl` in Bash). Recorded in the suite as an `it.todo` rather than a passing assertion — asserting today's behaviour would freeze the divergence in place. Split out to #441 together with the shell-enforcement work, because both need the same decision: whether Claude and opencode gate shell through a script or only through their permission tables.

## Also in this pass

- **Rule refined after measuring.** The first draft of the edit-tools-only rule banned shell edits outright. bkit's own `.bkit/workflows/bkit-plan.md:874` uses `sed -i.bak -E` for a bulk cross-reference rewrite across generated plan files, which is legitimate — a rule the shipped workflows violate is a dead rule. The rule now carries two named exceptions (script-generated files, bulk mechanical rewrites of generated artifacts), both requiring the agent to say so and read the result back.

Verification: 3364 tests pass across 92 files, 2 todo, typecheck / Prettier / Vale clean.

## Test alignment across hosts

Audited what each per-host suite actually asserted. The coverage was uneven, and the gaps were all on the newest host:

<!-- prettier-ignore -->
| Behaviour | Claude | opencode | Cursor (before) |
| --- | --- | --- | --- |
| investigation checklist on first edit | yes | yes | yes |
| new-file reuse checklist | yes | yes | yes |
| dedup, same file | yes | yes | yes |
| different file in same session warns again | yes | yes | **no** |
| gate-config advisory | yes | yes | **no** |
| `BKIT_ALLOW_CONFIG_EDIT=1` downgrade | yes | yes | **no** |
| ordinary file is not a gate config | yes | yes | **no** |
| docs density advisory (5 cases) | yes | yes | **no** |
| deny mode blocks first touch | yes | yes | yes |
| deny mode allows the retry | yes | yes | **no** |
| off mode no-op | yes | yes | yes |
| no file path → ignored | yes | yes | **no** |
| subagents not exempt | yes | yes | yes |
| managed-block boundary | **no** | yes | yes |

Rather than hand-copy ten tests into the Cursor suite and leave the same drift free to reappear, added `.bkit/src/bkit-gateguard-parity.test.ts`: one behaviour table, three adapters, every row asserted on every host. The adapters normalise away the delivery mechanism — Claude's `hookSpecificOutput.additionalContext`, Cursor's `additional_context` + `permission`, opencode's stderr capture and throw path — so each row reads as one behaviour rather than three. 65 tests.

All 65 passed on the first run, which is the expected result and worth stating plainly: the behaviours were already correct everywhere because the managed block is shared. What was missing was the assertion, not the behaviour. Confirmed the adapters are really exercising the hosts rather than passing vacuously by driving the Cursor hook by hand for the two cases it had never been tested on — gate-config and docs-density both fire.

### Deviations, each with its reason

Three behaviours genuinely cannot hold identically on every host. Each is now stated as an explicit test with the reason attached, instead of being a silently missing row:

- **Edit vs Write distinction.** Claude ships `Edit` / `Write` / `MultiEdit` and reserves the reuse checklist for `Write`. Cursor normalises every edit and create to `Write`; opencode uses `write` / `edit` / `patch`. Neither can make Claude's distinction, so the create/edit rows use each host's own vocabulary and the distinction itself is asserted on Claude alone.
- **How blocking is expressed.** Claude sets `permissionDecision: "deny"`, Cursor `permission: "deny"` plus `agent_message`, opencode throws — its hook has no non-throwing block primitive. The adapters normalise all three to one `blocked` flag, which is what lets the deny rows be asserted uniformly.
- **Malformed stdin.** Only a concern for the two CJS hooks that parse stdin. opencode receives an already-parsed object from its host, so it has no stdin to malform; its equivalent (null / missing args) stays in its own suite.

The opencode managed block is also **not** byte-identical to the other two — it is an ES module with a different tool vocabulary and no `require`. The parity suite compares the advisory texts instead of the bytes, since what must not differ is what the model is told. Claude and Cursor blocks are asserted byte-identical.

The per-host suites are kept and still carry host-specific mechanics: output shape, single-JSON-document emission, Cursor's `workspace_roots` path resolution, opencode's plugin export boundary.

### Also

`.agents/rules.md`'s edit-tools-only bullet compressed to the density of its neighbours — same rule, roughly a third the length.

Verification: 3429 tests pass across 93 files, 2 todo, typecheck / Prettier / Vale clean.

## GateGuard on every host, advisories compressed, tests aligned

### Cursor GateGuard exists now

`.bkit/templates/.cursor/hooks/gateguard.cjs`, wired as `preToolUse` matcher `Write`, deliberately without `failClosed` — an advisory hook that fails closed would block the edit it only meant to comment on. Its managed block is byte-identical to the Claude twin's, asserted by a test; only the driver differs, carrying the two fixes the spike proved necessary (resolve the workspace-relative `file_path` against `workspace_roots[0]`, route deny to `agent_message`).

### Subagents are no longer exempt

Removed Claude's `agent_id` short-circuit and opencode's `client.session.get()` / `parentID` lookup — which also drops an async call from the hot path. A subagent edit is an edit, and dedup is per (session, file) with a subagent carrying its own session id. Cursor never had a marker to exempt on. The three tests asserting the exemption now assert the opposite.

### Authoring advisories: 17 and 18 rules → 5 and 5

The `.bkit/workflows/` and `.bkit/prompts/` advisories were the reason this thread started — the rules kept getting ignored. Root cause: they quoted three rules and said "see the section for the rest", and the pointer is a second fetch the agent never makes. First fix was to carry every rule. That produced a wall nobody would read, so it got compressed in three passes:

1. **Cut what a test already enforces** (6 rules). A test is a harder gate than a nudge and costs no tokens per edit.
2. **Promote one master rule** — *these files ARE their own template: grep for the closest existing case and copy its shape verbatim*. Every shape rule became an example of it.
3. **Cut what the master rule subsumes** (9 more). The discriminator: the corpus teaches presence, not absence. Naming a dimension ("operators", "conditionals") turns an absence you cannot see into a lookup you can make.

What survives standalone is what copying cannot produce: prohibitions (no rationale, removal = delete, self-contained, cross-file alignment) and two anti-corrections where following the rule *diligently* makes things worse — `→` is the sole intentional non-ASCII glyph (an agent applying "ASCII operators" would convert it) and the 2+ branch threshold (you copy whichever example you landed on).

<!-- prettier-ignore -->
| Advisory | Before | After |
| --- | --- | --- |
| `.bkit/workflows/*.md` | 17 bullets, 2838 chars | 5 bullets, 1183 |
| `.bkit/prompts/*.md` | 18 bullets, 3122 chars | 5 bullets, 1063 |

`.bkit/workflows.md` and `.bkit/prompts.md` were then restructured to the same five leads, verbatim, with every original rule and example preserved as a nested sub-rule. The hook and the doc now read identically; the doc is allowed to be longer, not to disagree.

### Dogfood advisories reach every host

They existed only in `.claude/hooks/gateguard.cjs` — every edit made from Cursor or opencode got nothing, in a repo with all three installed. Now in all three, byte-identical, behind a shared `dogfoodAuthoringAdvisory(filePath)` dispatcher. A third advisory covers bkit's own `.md` docs under `.bkit/` and `.agents/` (including `.bkit/templates/**`), which `isDocsPath` never reached.

The region is strictly separate from the managed block — its own predicates, its own advisory text, no calls inward — so it keeps working whatever changes inside the markers. A test enforces that boundary and a second catches drift between the copied text and the shipped one.

### Cross-host parity, by test rather than by luck

- **`bkit-permissions-parity.integration.test.ts`** — one canonical gate table asserted across Claude `settings.json`, opencode `opencode.json` and Cursor `guardrails.cjs` through an adapter per dialect. 31 gates: every `rm -rf`, force-push, publish, destructive-git and secret-read case. All three already agreed.
- **`bkit-gateguard-parity.integration.test.ts`** — one GateGuard behaviour table on all three hosts, normalising away the delivery mechanism. It found real gaps: Cursor was missing the gate-config, `BKIT_ALLOW_CONFIG_EDIT`, deny-retry and all five docs-density cases the other two had.

### Corrections to my own earlier claims

- I said opencode wrongly denied `git push --force-with-lease`. It does not — a later `"git push --force-with-lease*": "allow"` wins under last-match-wins. Now pinned by test, since it survives only by key ordering inside a JSON object.
- I said Cursor could not host advisory mode. Wrong, and the public docs are what made it wrong — see the spike comment above.

### Bugs found and fixed on the way

- **A NUL byte in `.bkit/src/bkit-analysis.ts:400`**, used as a composite-key separator but written as a literal byte instead of `^@`. `file` reported the source as `data` and **grep treated it as binary and silently skipped it** — in a repo whose own audits are grep-based. Escaped; behaviour identical.
- **Three unnecessary type casts** in the same function, including an `as unknown as` double cast. `TelemetryEvent` is a discriminated union on `kind`, so narrowing already gives an assignable type — all three removed, no suppression needed. `slop:delta` is now net 0 for the first time.
- **A real test flake.** `newSession()` returned `gg-test-${pid}-${counter}`; dedup state is keyed by session id and lives in the OS temp dir for 24h, so a recycled pid suppresses the advisory and the assertion fails for no reason.
- **`.prettierignore` asymmetry.** `.claude/` and `.cursor/` were ignored, `.opencode/plugin/` was not, so Prettier rewrapped one mirror and left its two ignored twins alone — silently diverging three copies a test asserts are byte-identical. Added, with the stale "byte-equal-seeded" rationale rewritten.

### Test naming and lanes

`.integration` in a filename is load-bearing — `test:coverage:unit` excludes it and `package.json` keeps it out of the tarball. Three suites I added spawn subprocesses but were named as unit tests. Renamed to a consistent `bkit-<subject>-<host>.<lane>.test.ts`, including `bkit-gateguard.integration` → `-claude`, `bkit-cursor-guardrails` → `bkit-guardrails-cursor`, and `bkit-gate-parity` → `bkit-permissions-parity` (it tests permission tables, not GateGuard, and sat one letter from `bkit-gateguard-parity`). **Unit lane: 3465 tests / 33s → 2707 / 2.4s**, no subprocesses.

`bkit-gateguard-opencode.test.ts` keeps no `.integration` deliberately — it imports the plugin in-process, so the unit lane is correct. The suffix encodes execution mode, not host.

### Doc corrections

`.bkit/providers.md` claimed Claude's `permissions.deny` / `ask` covered shell `curl` / `wget`. It does not — `permissions` cannot match a URL host, so only the `WebFetch` *tool* is allowlisted. Anyone reading that table would have believed a protection that is not there; it is the exact gap in #441. Also fixed: the hook inventory in `docs/architecture.md` and `.bkit/README.md` named two of four hook files, and a "subagent-exempt" coverage row in `docs/testing.md` survived the exemption removal.

Also aligned every `> [!CAUTION]` doc header across `docs/`, `.agents/`, `.bkit/` and the templates onto the same two opening rules, with the record-by-purpose exception for the append-only ledgers.

### Still open

- #441 — enforcement for the shell-as-edit-channel rule, and the curl/wget canonical behaviour.
- `.agents/*.md` now routes to the dogfood advisory, so it loses the `.agents/docs.md` index reminder even though `.agents/` is in that index. Narrow `isBkitDocPath` to `.bkit/` only if that matters.
- The prompt-side `I/O` bare-slash rule is in neither the advisory nor a test.

Verification: 3465 tests across 94 files, typecheck, Prettier, Vale and `slop:delta` all clean.
