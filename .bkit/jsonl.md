# JSONL Entry Format

> [!CAUTION]
> **Purpose:** How to format a new row for any bkit JSONL ledger (`docs/deferrals.jsonl`, `docs/failures.jsonl`, `docs/knowledge.jsonl`, `docs/decisions.jsonl`, `.bkit/friction.jsonl`, `.bkit/stats.jsonl`). Codec: `.bkit/src/bkit-telemetry.ts`. Which `kind` → which ledger + workflow write timing: `.bkit/workflows.md` § Telemetry Ledgers.
>
> **Rules:**
>
> - Use dense token-efficient phrasing; NO filler / hedging / restating; tables > prose, bullets > paragraphs.
> - Describe current state / rules, NOT reasons / history; state what to do, NOT why.
> - Ships to consumers: describe the CURRENT setup only. NEVER an internal identifier (tracker issue number, ledger key, review-finding id) and NEVER project history — decisions belong in `docs/decisions.jsonl`, incidents in `docs/knowledge.jsonl`.
> - One row per line. NEVER edit or reorder a prior LINE — row STATE changes via same-`key` append (§ Updating a Row).
> - Before append: read file. Skip ONLY if identity-matching row exists AND nothing changed — changed field = update, NOT duplicate.
> - `.bkit/friction.jsonl` rows removed ONLY by `bkit harvest` (§ Friction Is a Drained Queue).
> - Best-effort append — ALWAYS exit 0; NEVER gate workflows on telemetry success.

## Write Idiom

```bash
jq -c -n '{ ts: null, kind: "deferral", repo: $REPO, bkitVersion: $VER, step: $STEP, … } | .ts = (now*1000|floor)' \
  >> "$FILE" || echo "[bkit-telemetry] append failed: $FILE"
```

- **`ts`:** Unix ms, ALWAYS minted by `jq`'s `now` AT APPEND TIME — `jq '… | .ts = (now*1000|floor)'`. The `ts: null` placeholder holds field order only; the pipe overwrites it. Drop the pipe and the row fails the envelope gate instead of landing a fake value — NEVER seed the placeholder with a number.
- **`ts` is NEVER a literal.** Not hand-typed, not copied off an example row or the line above, not `date +%s%3N` (BSD/macOS incompatible). A fabricated past `ts` is indistinguishable from a real one and silently reorders the last-wins fold that every reader, `bkit harvest`, and every age report depend on. Whole-second values (`ts % 1000 == 0`) are rejected — a real mint is never round.
- **Log prefix:** every telemetry log line starts `[bkit-telemetry]` — load-bearing for log-drain grep.

## Ledgers & Writers

One file per `kind`; writers:

<!-- prettier-ignore -->
| Kind | File | Written by |
| --- | --- | --- |
| `compliance` | `.bkit/stats.jsonl` | `bkit comply` grader at each workflow close step |
| `outcome` | `.bkit/stats.jsonl` | every workflow at its close (one run row per workflow run; keyed by `repo`+`workflow`+`parentSha`) |
| `counter` | `.bkit/stats.jsonl` | every workflow at its close step (attempt counters) |
| `friction` | `.bkit/friction.jsonl` | orchestrator workflows (design/plan/build/debug/ship) on observed friction |
| `deferral` | `docs/deferrals.jsonl` | `@bkit-design-generate`, `@bkit-plan-generate`, `@bkit-plan-update`, `@bkit-build-challenge-remediate` (blocked), `@bkit-debug-abort-handover`, `@bkit-ship-deferred-sweep` (adjudication only) |
| `failure` | `docs/failures.jsonl` | any agent on a discovered bug; `@bkit-debug-abort-handover` |
| `knowledge` | `docs/knowledge.jsonl` | `@bkit-build-challenge-remediate`, `@bkit-build-plan-gaps-remediate`, `@bkit-debug-failure-remediate` (after verified fix) |
| `decision` | `docs/decisions.jsonl` | `@bkit-debug-failure-remediate` (forced arch), `@bkit-plan-generate` |

**Writers are exhaustive:** ONLY agents listed as writers for a given kind are allowed to write that specific kind; NO exceptions.

## Generic Fields (all kinds)

<!-- prettier-ignore -->
| Field | Type | Meaning |
| --- | --- | --- |
| `ts` | `number` | Unix milliseconds — primary id. Minted via `jq '… \| .ts = (now*1000\|floor)'`, NEVER a literal (§ Write Idiom). |
| `kind` | `string` | Closed enum: `compliance`, `outcome`, `counter`, `friction`, `deferral`, `failure`, `knowledge`, `decision`. |
| `repo` | `string` | Origin repo slug, e.g. `cbartens/bkit`. |
| `bkitVersion` | `string` | bkit version that emitted the row — sole version stamp; readers tally rows per `bkitVersion` for triage. |
| `workflow` | `string` | Emitting workflow: `design`/`plan`/`build`/`debug`/`ship` (part of the dedup tuple for `compliance`/`counter`/`outcome`). |
| `step` | `string` | The workflow step the row was emitted at, e.g. `build-close-workflow`, `ship-close-gate`. Never an agent name. See § Who Wrote It. |
| `subagent` | `string?` | The subagent that wrote the row, e.g. `bkit-build-challenge-remediate`. Set on every subagent-written row; absent on orchestrator-written rows. See § Who Wrote It. |
| `model` | `string?` | The model that wrote the row, from the writing subagent's own frontmatter `model:`. Set only where `subagent` is set. See § Who Wrote It. |
| `references` | `string[]?` | Pointers that place the row: feature ids, tracker ids, PRs, commit SHAs, paths, a sibling `ts`. See § Key & References. |

## Per-Kind Fields

<!-- prettier-ignore -->
| Kind | Fields (beyond envelope) |
| --- | --- |
| `counter` | `counterName`, `counterValue:number`, `counterSource:"model-self-report"\|"shell-bus"`, `parentSha`. |
| `outcome` | `parentSha?` (run anchor), `prNumber:number?` (ship-only), `linesAdded:number`, `linesDeleted:number`, `linesChanged:number`, `filesChanged:number`, `taskCount:number`, `durationSeconds:number`, `ciTrySuccess:number?`, `correctiveCommits:number?`, `reviewIterations:number?`, `deferrals:number`, `failures:number` (the repo's cumulative UNIQUE entity count at close, folded — not lines; per-cycle is the delta against the previous `outcome` row), `frictionAdded:number?`, `deferralsAdded:number?`, `failuresAdded:number?` (per-run deltas — rows THIS run added to each ledger, counted from `workflow`+`ts>=`workflow-started), `coverage?:{unit?,integration?,e2e?}` (per-tier, each `{lines,branches,functions,statements}:number` %; best-effort — a tier is absent when its coverage report is not produced, opt-in). |
| `compliance` | `rule`, `result:"pass"\|"fail"\|"n/a"`, `evidence?`, `phase`, `parentSha`. |
| `friction` | `key`, `category` (§ Categories), `scope:"bkit-repo"\|"consumer"\|"universal"`, `severity`, `summary?`, `description`, `remediation?`, `source?`, `status:"OPEN"\|"TRIAGED"\|"CLOSED"\|string?` (see § Updating a Row), `confidence?:number`, `lastConfirmed?:number`, `recurrenceCount?:number`. |
| `deferral` | `key`, `type:"issue"\|"feature"`, `category` (§ Categories), `severity`, `reason` (§ Deferral Reason), `summary?`, `description`, `remediation?`, `source?`, `status:"OPEN"\|"TRIAGED"\|"CLOSED"?`. |
| `failure` | `key`, `category?` (§ Categories; `"testing"` = flaky/intermittent test), `summary?`, `severity`, `description`, `rootCause?`, `remediation?`, `status:"OPEN"\|"TRIAGED"\|"CLOSED"\|string?`. |
| `knowledge` | `key`, `summary`, `description?`, `rootCause?`, `remediation?`. |
| `decision` | `key`, `summary`, `description?`, `rationale?`, `alternatives?`, `status:"ACTIVE"\|"SUPERSEDED"?`. |

## Who Wrote It — `step` vs `subagent` vs `model`

<!-- prettier-ignore -->
| Row written by | `workflow` | `step` | `subagent` | `model` |
| --- | --- | --- | --- | --- |
| **The orchestrator** (a workflow itself) | `ship` | `ship-close-gate` | *(absent)* | *(absent)* |
| **A subagent** it invoked | `build` | the step that invoked it, e.g. `build-challenge` | `bkit-build-challenge-remediate` | that prompt's own `model:` |

Subagent: on every appended row, from your prompt file:

- **`subagent`** = your frontmatter `name:`.
- **`model`** = your frontmatter `model:`.
- **`step`** = invoking workflow step (named in your Context).

Orchestrator: omit `subagent` and `model`.

## Key & References

`key` = written-once stable slug; recurrence = same-`key` append.

- **Mint it from the CONTENT, never from a counter.** Descriptive slug (`gh-mcp-401-after-token-rotation`), optionally issue-prefixed (`681-e2e-parallelism-via-runner-matrix`). Counter-derived ids collide under concurrency — two workflows read same max off their base commit, mint same id, silent collision.
- **Cite the `key`.** Identity for other rows, docs, memory; `ts` = tiebreaker. Content slugs avoid counter collisions.

`references` = pointers placing this row:

<!-- prettier-ignore -->
```jsonl
"references": ["681", "ISSUE-217", "PR-412", "a1b2c3d", "docs/plans/202607/681-e2e-parallelism-design.md", "1718900000600"]
```

- Feature ids / `{FID}`, tracker ids (`ISSUE-217`), PRs, commit SHAs, file paths, sibling row `ts`.
- Keep items as source wrote; trailing qualifiers (`ISSUE-142 §A2`) = meaning, not noise.
- No separate identity field: `ts` = id; `references` = pointers only.
- Omit when nothing to point at.

## Friction Is a Drained Queue — the one non-append-only ledger

`.bkit/friction.jsonl` = drained work queue — ONLY file rows are removed from:

<!-- prettier-ignore -->
| Actor | May do |
| --- | --- |
| **A consumer repo** | APPEND only. |
| **`bkit harvest`** (from the bkit repo) | MOVES rows out: copies each into bkit's `harvest/` store, then prunes it from the consumer. |

Row vanishing from `.bkit/friction.jsonl` = `bkit harvest` banked it centrally.

Prune gates (in order):

- **Durability first** — prune ONLY after exact row fsync'd to store AND read back.
- **Content, never identity** — gate byte-for-byte; `fold` collapses same-identity rows — identity gate deletes rows store never kept; fold loser STAYS in consumer, reported.
- **Malformed lines** — NEVER pruned.
- **Store accumulates**, never cleared. `harvest` NEVER commits, either repo.

`stats.jsonl` = COPY-only; `deferrals`/`failures` = COUNT-only (envelope metadata; prose never leaves consumer). Contract: `.bkit/src/bkit-harvest.ts`.

## Summary vs Description

Kinds with BOTH (`friction`/`deferral`/`failure`/`knowledge`/`decision`): `summary` = short title; `description` = prose. One sentence → `description` only.

## Severity

`severity` is REQUIRED on `friction` / `deferral` / `failure`, and MUST NOT appear on any other kind (`knowledge`/`decision` have no triage severity; `compliance`/`outcome`/`counter` are machine-generated). Closed enum — exactly these four, uppercase:

<!-- prettier-ignore -->
| Value | Means |
| --- | --- |
| `CRITICAL` | Data loss, security hole, or a broken workflow with no workaround. Triage before the next release. |
| `HIGH` | Real damage or a blocked path, but a workaround exists. |
| `MEDIUM` | Degraded behaviour or a repeated cost; safe to schedule. |
| `LOW` | Cosmetic, nit, or a speculative future idea. |

- Same enum challenge + audit prompts assign. Finding → row (e.g. `@bkit-build-challenge-remediate` BLOCKED → `docs/deferrals.jsonl`): carry ITS severity unchanged.
- NOT `bkit install` preflight `blocker`/`advisory` — different axis.
- Pick level the ROW earns. All-`LOW` ledger = useless as no severity.

## Deferral Reason

`reason` REQUIRED on `deferral`, absent elsewhere. Why the work is deferred — distinct from `status` (how far) and `severity` (how much). Closed enum, lowercase:

<!-- prettier-ignore -->
| Value | Means | Also required |
| --- | --- | --- |
| `scope-declared` | design/plan called it out of scope BEFORE work started. | `references` to that doc §. |
| `hard-blocked` | external blocker (credential, upstream fix, feature) blocks it now. | Name blocker in `description`. |
| `needs-decision` | human decision missing; guessing worse than waiting. | State decision + options. |
| `own-cycle` | plan-sized — new architecture, not a mechanical fix. | Say what makes it plan-sized. |
| `unjustified` | ADJUDICATOR-ONLY — in-scope work that should have been finished. | Which test it failed. |

- First four → deferral. None fit → unfinished work, DO IT (`.agents/rules.md` § "Finish over deferrals").
- `unjustified` never self-assigned — writer picks first four; reviewer adjudicating another's deferral sets it via same-`key` append.
- Set once, carried verbatim by every later row — the rate it feeds counts the deferral that should not have been written.
- No free prose — an unadjudicable reason reads as justification while being none; the enum closes that.

**The four tests.** Reviewer marks `unjustified` when ALL hold:

1. `remediation` names specific files + a bounded edit, not a new architecture.
2. Surface inside files the cycle already touched.
3. No external blocker — no missing decision, credential, upstream fix, confirmation.
4. `scope-declared` with no pre-existing declaration — the row is the ONLY place it was called out of scope.

Test 4 carries the weight: genuine deferral declared out of scope BEFORE work started; unjustified declared at moment of avoidance. Both timestamps in ledger.

## Categories

Free-form; closest term, `other` if none. `deferral` + `failure` → domain set; `friction` → friction set — do NOT mix.

**Domain — `deferral` + `failure`:**

<!-- prettier-ignore -->
| Term | Covers |
| --- | --- |
| `agentic` | agent / workflow / prompt / orchestration behaviour |
| `correctness` | logic / behaviour bugs in shipped code |
| `testing` | tests, coverage, flaky / intermittent tests (see note below) |
| `infra` | CI, build, packaging, distribution, deploy, environment |
| `tooling` | CLI, dev scripts, local tooling |
| `observability` | logging, telemetry, tracing, metrics |
| `security` | auth, secrets, input validation, data exposure |
| `architecture` | structural / design |
| `docs` | documentation |
| `other` | none of the above |

**Flaky / intermittent tests** = `failure` with `category:"testing"`: `key` = spec path + test title, minted once; re-observation = same-`key` append (§ Updating a Row) → flake-count = same-`key` row count; first/last `ts` = first-/last-seen. Do NOT add pass-rate or counter field.

**Friction — `friction`:**

<!-- prettier-ignore -->
| Term | Covers |
| --- | --- |
| `human-confirm` | human confirmation prompt |
| `permission-prompt` | tool / permission approval prompt |
| `agent-rework` | agent redo / self-correction |
| `manual-install` | manual dependency / tool install |
| `tool-failure` | tool / command error |
| `destructive-backout` | reverted a destructive action |
| `other` | none of the above |

## Updating a Row

Fields that change after first write:

<!-- prettier-ignore -->
| Field | Changes when |
| --- | --- |
| `status` | work closes (`OPEN` -> `CLOSED`), or a decision is `SUPERSEDED`. |
| `reason` | (`deferral` only) reviewer adjudicates -> `unjustified`, naming the failed test in `description` and setting `status` -> `TRIAGED`. One-way: never rewritten, carried verbatim by every later row — fold is last-wins, so omitting it erases the verdict and its rate. Gated on the live ledger. |
| `remediation` | the fix is known — usually AFTER the row was logged mid-workflow. |
| `severity` | re-triage says it was worse or milder than first thought. |
| `confidence` | (`friction` only) the same thing recurs (raise) or is contradicted (lower). |
| `lastConfirmed` | (`friction` only) re-observed. |
| `recurrenceCount` | (`friction` only) it happens again. |

**Update by APPENDING a new row with the SAME `key`, never by editing the old line.** `fold()` last-wins by `ts`; older rows = history. Recurrence = update.

**Hard, not stylistic:** `.gitattributes` sets `merge=union` on every append-only ledger — merges concatenate, never conflict. Union keeps BOTH sides of a conflicting hunk: edit a line and the stale copy survives beside its replacement; `fold` last-wins by `ts` -> stale wins whenever its `ts` is later.

- **NEVER edit or delete a line.** Correct via same-`key` append.
- **NEVER hand-write `ts`, in EITHER direction** — mint at write time (§ Write Idiom). Future: outranks every later correction, permanently; row can never be superseded. Backdated: loses to rows it actually followed, so the correction it was meant to be silently never applies.

`.bkit/friction.jsonl` excluded — rows ARE removed from it (§ Friction Is a Drained Queue); union would resurrect a drain.

Copy prior row, change deltas, append. Carry `key` verbatim — reworded `key` forks entry. Same `key` = one entry; `fold` returns last → "how long open" / "time to fix" from dated `ts`. § Examples: deferral raised → analysed → closed.

**Triage** = sweep `docs/deferrals.jsonl` / `docs/failures.jsonl` for moved-on work → append same-`key` row with `status: "CLOSED"`, current `references` (PR, commit, closing issue), re-triaged `severity` if earned.

**`TRIAGED`** = middle state on triaged trio (`friction`/`deferral`/`failure` — kinds with `severity`). Ladder: `OPEN` (raised, cause unknown) -> `TRIAGED` (analysed, disposition known, not fixed) -> `CLOSED` (fixed, refuted, not ours). Append like close; disposition in `references`: issue, mapped `Fix N`, or why not ours.

**`TRIAGED` IS STILL OPEN WORK.** Open-entry counts — CI gate on open `CRITICAL` failures, audit debt lens, age report — test `status != "CLOSED"`. Only `CLOSED` is done.

Not on `knowledge` (no status) or `decision` (`ACTIVE`/`SUPERSEDED` lifecycle).

Readers count ENTITIES, never lines — `fold` first.

## These Ledgers Are Inputs, Not a Diary

`docs/deferrals.jsonl` + `docs/failures.jsonl` = backlog — deferred scope + known bugs; `severity` ranks, `ts` ages. READ:

- **Before designing or planning** — grep for existing entry or past deferral reason.
- **On a triage sweep** — walk open entries vs tracker + codebase; close, `TRIAGED`, or re-`severity` via append (§ Updating a Row).
- **When a bug looks familiar** — same-`key` `failure` = recurrence.

Rank existing: `severity: CRITICAL` first, then oldest `ts`.

## Identity / Dedup

Identity tuple, NOT bare `ts`:

<!-- prettier-ignore -->
| Kind | Identity tuple |
| --- | --- |
| `compliance` | `(repo, workflow, parentSha, rule)` |
| `outcome` | `(repo, workflow, parentSha)` — `prNumber`/`ts` fallback on legacy rows |
| `counter` | `(repo, workflow, parentSha, counterName)` |
| `friction` \| `deferral` \| `failure` \| `knowledge` \| `decision` | `(kind, repo, key)` |

Identity match = SAME thing — not automatically skip:

- **Nothing changed** -> skip.
- **Something changed** -> **APPEND** (§ Updating a Row).

## Versioning

No schema version — `bkitVersion` only stamp. Readers ingest ALL well-formed rows (no version gating), report counts per `bkitVersion`; unexpected version surfaces for triage.

## Examples

Indented for readability — **on disk each row = single physical line** (§ Write Idiom). One example per ledger + row-update lifecycle. Each shows all kind fields including `?`-optional ones (§ Per-Kind Fields) real rows omit when N/A:

`.bkit/stats.jsonl` (`compliance` / `outcome` / `counter`):

<!-- prettier-ignore -->
```jsonl
{
  "ts": 1718900000000,
  "kind": "compliance",
  "repo": "cbartens/bkit",
  "bkitVersion": "4.2.0",
  "workflow": "ship",
  "step": "ship-close-workflow",
  "rule": "no-mirror-edit",
  "result": "pass",
  "evidence": "no mirror files present in the diff",
  "phase": "ship",
  "parentSha": "a1b2c3d"
}
{
  "ts": 1718900000100,
  "kind": "outcome",
  "repo": "cbartens/bkit",
  "bkitVersion": "4.2.0",
  "workflow": "ship",
  "step": "ship-close-gate",
  "parentSha": "a1b2c3d",
  "prNumber": 412,
  "linesAdded": 120,
  "linesDeleted": 34,
  "linesChanged": 154,
  "filesChanged": 7,
  "taskCount": 5,
  "durationSeconds": 2400,
  "ciTrySuccess": 1,
  "correctiveCommits": 0,
  "reviewIterations": 1,
  "deferrals": 1,
  "failures": 0,
  "frictionAdded": 1,
  "deferralsAdded": 1,
  "failuresAdded": 0,
  "sweepVerdict": "clean",
  "coverage": { "unit": { "lines": 87.4, "branches": 79.1, "functions": 90.2, "statements": 87.0 }, "integration": { "lines": 68.3 }, "e2e": { "lines": 41.5 } }
}
{
  "ts": 1718900000200,
  "kind": "counter",
  "repo": "cbartens/bkit",
  "bkitVersion": "4.2.0",
  "workflow": "build",
  "step": "build-close-workflow",
  "counterName": "BUILD_ATTEMPT",
  "counterValue": 2,
  "counterSource": "shell-bus",
  "parentSha": "a1b2c3d"
}
```

`.bkit/friction.jsonl`:

<!-- prettier-ignore -->
```jsonl
{
  "ts": 1718900000300,
  "kind": "friction",
  "repo": "cbartens/bkit",
  "bkitVersion": "4.2.0",
  "workflow": "ship",
  "step": "ship-update-docs",
  "key": "ship-dev-commit-blocked-by-pre-commit-hook",
  "category": "tool-failure",
  "scope": "bkit-repo",
  "severity": "HIGH",
  "summary": "ship Step 9 dev commit blocked by the pre-commit hook",
  "description": "ship Steps 8-12 commit docs to dev, but the pre-commit hook refuses dev/main commits unless $PWD matches *.worktrees/*; git -C REPO_ROOT commit does not pass the guard and --no-verify is prohibited",
  "remediation": "commit via a temp branch (docs/ship-{FID}) from dev in a temp worktree, then FF-merge dev",
  "source": "orchestrator",
  "status": "OPEN",
  "confidence": 0.9,
  "lastConfirmed": 1721578400000,
  "recurrenceCount": 2,
  "references": ["342", "docs/plans/202607/342-injection-hardening-plan.md"]
}
```

`docs/deferrals.jsonl`:

<!-- prettier-ignore -->
```jsonl
{
  "ts": 1718900000400,
  "kind": "deferral",
  "repo": "cbartens/bkit",
  "bkitVersion": "4.2.0",
  "workflow": "design",
  "step": "design-brainstorm",
  "subagent": "bkit-design-generate",
  "model": "claude-opus-4-8",
  "key": "pnpm-tag-drop-readme-note",
  "type": "issue",
  "category": "infra",
  "severity": "LOW",
  "reason": "scope-declared",
  "summary": "pnpm tag-drop README note for the install snippet",
  "description": "pnpm normaliser strips the #vX.Y.Z pin from github:cbartens/bkit git-dep entries in package.json; document the workaround in README or fix upstream",
  "remediation": "note the pin workaround in the README install snippet",
  "source": "phase",
  "status": "OPEN",
  "references": ["ISSUE-131", "ISSUE-130", "README.md", "docs/plans/202607/131-install-snippet-design.md § Non-goals"]
}
```

`docs/failures.jsonl`:

<!-- prettier-ignore -->
```jsonl
{
  "ts": 1718900000500,
  "kind": "failure",
  "repo": "cbartens/bkit",
  "bkitVersion": "4.2.0",
  "workflow": "debug",
  "step": "debug-diagnose",
  "subagent": "bkit-debug-failure-diagnose",
  "model": "claude-opus-4-8",
  "key": "bkit-install-flips-core-bare",
  "category": "tooling",
  "summary": "bkit install flips core.bare=true",
  "severity": "HIGH",
  "description": "`pnpm bkit install` leaves git config core.bare=true, which breaks git checkout/status afterward",
  "rootCause": "the install engine writes core.bare while staging and does not restore it on the success path",
  "remediation": "run `git config core.bare false` after install",
  "status": "OPEN",
  "references": ["176", "a1b2c3d", ".bkit/src/bkit-install.ts"]
}
```

`docs/knowledge.jsonl`:

<!-- prettier-ignore -->
```jsonl
{
  "ts": 1718900000600,
  "kind": "knowledge",
  "repo": "cbartens/bkit",
  "bkitVersion": "4.2.0",
  "workflow": "debug",
  "step": "debug-remediate",
  "subagent": "bkit-debug-failure-remediate",
  "model": "claude-sonnet-4-6",
  "key": "gh-mcp-401-after-token-rotation",
  "summary": "GitHub MCP / gh 401 immediately after a token rotation",
  "description": "401 from the GitHub MCP server or gh despite a freshly-rotated, valid, correctly-scoped PAT in .bkit/.env",
  "rootCause": "the MCP server captures GH_MCP_TOKEN at process launch, so a mid-session rotation leaves it holding the dead token",
  "remediation": "restart/reload the MCP server after rotating; for a one-off CLI, prefix `direnv exec . gh …`",
  "references": ["ISSUE-137", ".bkit/.env"]
}
```

`docs/decisions.jsonl`:

<!-- prettier-ignore -->
```jsonl
{
  "ts": 1718900000700,
  "kind": "decision",
  "repo": "cbartens/bkit",
  "bkitVersion": "4.2.0",
  "workflow": "plan",
  "step": "plan-generate",
  "subagent": "bkit-plan-generate",
  "model": "claude-opus-4-8",
  "key": "bkit-distribution-via-github-packages",
  "summary": "distribute @cbartens/bkit via the GitHub Packages npm registry",
  "description": "move @cbartens/bkit off the github: git-dep install onto the GitHub Packages npm registry",
  "rationale": "eliminates four friction classes of the git-dep model: two-surface git auth, the CI auth shim, the prepare:tsc OOM trap, and pnpm dropping the version pin",
  "alternatives": "npmjs.org public (package is private), continue git-dep, Releases tarball, vendor per-consumer, dual-publish git+registry",
  "status": "ACTIVE",
  "references": ["ISSUE-138", "ISSUE-130", "package.json", ".github/workflows/release.yml"]
}
```

Row-update lifecycle — `pnpm-tag-drop-readme-note` deferral, raised then closed by same-`key` append (§ Updating a Row). Envelope trimmed for delta; on disk = full single-line row:

<!-- prettier-ignore -->
```jsonl
{ "ts": 1718900000000, "kind": "deferral", "key": "pnpm-tag-drop-readme-note", "type": "issue", "category": "infra", "severity": "LOW", "reason": "scope-declared", "summary": "pnpm tag-drop README note", "description": "pnpm strips the #vX.Y.Z pin from git-dep entries", "status": "OPEN", "references": ["ISSUE-131"] }
{ "ts": 1724256800000, "kind": "deferral", "key": "pnpm-tag-drop-readme-note", "type": "issue", "category": "infra", "severity": "MEDIUM", "reason": "scope-declared", "summary": "pnpm tag-drop README note", "description": "pnpm strips the #vX.Y.Z pin from git-dep entries", "remediation": "note the pin workaround in the README install snippet", "status": "CLOSED", "references": ["ISSUE-131", "PR-412", "e93da12"] }
```
