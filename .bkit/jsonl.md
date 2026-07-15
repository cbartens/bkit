# JSONL Entry Format

> [!CAUTION]
> **Purpose:** How to format a new row for any bkit JSONL ledger (`docs/deferrals.jsonl`, `docs/failures.jsonl`, `docs/knowledge.jsonl`, `docs/decisions.jsonl`, `.bkit/friction.jsonl`, `.bkit/stats.jsonl`). Codec: `.bkit/src/bkit-telemetry.ts`. Which ledger holds which `kind` + when workflows write: `.bkit/workflows.md` § Telemetry Ledgers.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - Describe current state / rules, NOT reasons / history; state what to do; NOT why.
> - One row per line. NEVER edit or reorder a prior LINE — but a row's STATE is not frozen: you change it by appending a new same-`key` row. See § Updating a Row.
> - Before appending: Read the file. Skip ONLY if an identity-matching row exists AND nothing has changed — a changed field is an update, NOT a duplicate.
> - Rows are removed from `.bkit/friction.jsonl` by `bkit harvest`, and by nothing else — see § Friction Is a Drained Queue.
> - Best-effort append — ALWAYS exit 0; NEVER gate workflows on telemetry success.

## Write Idiom

```bash
jq -c -n '{ ts: 0, kind: "deferral", repo: $REPO, bkitVersion: $VER, step: $STEP, … } | .ts = (now*1000|floor)' \
  >> "$FILE" || echo "[bkit-telemetry] append failed: $FILE"
```

- **`ts`:** portable Unix milliseconds via `jq '… | .ts = (now*1000|floor)'`. NEVER `date +%s%3N` (BSD/macOS incompatible).
- **Log prefix:** every telemetry log line starts `[bkit-telemetry]` — load-bearing for log-drain grep.

## Ledgers & Writers

Each `kind` lives in ONE file, written by specific processes:

<!-- prettier-ignore -->
| Kind | File | Written by |
| --- | --- | --- |
| `compliance` | `.bkit/stats.jsonl` | `bkit comply` grader at each workflow close step |
| `outcome` | `.bkit/stats.jsonl` | `/bkit-ship` close-gate (one row per PR) |
| `counter` | `.bkit/stats.jsonl` | every workflow at its close step (attempt counters) |
| `friction` | `.bkit/friction.jsonl` | orchestrator workflows (design/plan/build/debug/ship) on observed friction |
| `deferral` | `docs/deferrals.jsonl` | `@bkit-design-generate`, `@bkit-plan-generate`, `@bkit-plan-update`, `@bkit-build-challenge-remediate` (blocked), `@bkit-debug-abort-handover` |
| `failure` | `docs/failures.jsonl` | any agent on a discovered bug; `@bkit-debug-abort-handover` |
| `knowledge` | `docs/knowledge.jsonl` | `@bkit-build-challenge-remediate`, `@bkit-build-plan-gaps-remediate`, `@bkit-debug-failure-remediate` (after verified fix) |
| `decision` | `docs/decisions.jsonl` | `@bkit-debug-failure-remediate` (forced arch), `@bkit-plan-generate` |

## Generic Fields (all kinds)

<!-- prettier-ignore -->
| Field | Type | Meaning |
| --- | --- | --- |
| `ts` | `number` | Unix milliseconds — primary id. Written via `jq '… \| .ts = (now*1000\|floor)'`. |
| `kind` | `string` | Closed enum: `compliance`, `outcome`, `counter`, `friction`, `deferral`, `failure`, `knowledge`, `decision`. |
| `repo` | `string` | Origin repo slug, e.g. `cbartens/bkit`. |
| `bkitVersion` | `string` | bkit version that emitted the row — sole version stamp; readers tally rows per `bkitVersion` for triage. |
| `workflow` | `string` | Emitting workflow: `design`/`plan`/`build`/`debug`/`ship` (part of the dedup tuple for `compliance`/`counter`). |
| `step` | `string` | The workflow step the row was emitted at, e.g. `build-close-workflow`, `ship-close-gate`. Never an agent name. See § Who Wrote It. |
| `subagent` | `string?` | The subagent that wrote the row, e.g. `bkit-build-challenge-remediate`. Set on every subagent-written row; absent on orchestrator-written rows. See § Who Wrote It. |
| `model` | `string?` | The model that wrote the row, from the writing subagent's own frontmatter `model:`. Set only where `subagent` is set. See § Who Wrote It. |
| `references` | `string[]?` | Pointers that place the row: feature ids, tracker ids, PRs, commit SHAs, paths, sibling `ts`, legacy `KN-N`/`DE-N`. See § Key & References. |

## Per-Kind Fields

<!-- prettier-ignore -->
| Kind | Fields (beyond envelope) |
| --- | --- |
| `counter` | `counterName`, `counterValue:number`, `counterSource:"model-self-report"\|"shell-bus"`, `parentSha`. |
| `outcome` | `prNumber:number`, `linesAdded:number`, `linesDeleted:number`, `linesChanged:number`, `filesChanged:number`, `taskCount:number`, `durationSeconds:number`, `ciTrySuccess:number?`, `deferrals:number`, `failures:number` (the repo's cumulative UNIQUE entity count at ship time, folded — not lines; per-cycle is the delta against the previous `outcome` row), `coverage?:{unit?,integration?,e2e?}` (per-tier, each `{lines,branches,functions,statements}:number` %; best-effort — a tier is absent when its coverage report is not produced, opt-in per #312/#313). |
| `compliance` | `rule`, `result:"pass"\|"fail"\|"n/a"`, `evidence?`, `phase`, `parentSha`. |
| `friction` | `key`, `category:"human-confirm"\|"permission-prompt"\|"agent-rework"\|"manual-install"\|"tool-failure"\|"destructive-backout"\|"other"`, `scope:"bkit-repo"\|"consumer"\|"universal"`, `severity`, `summary?`, `description`, `remediation?`, `status:"OPEN"\|"TRIAGED"\|"CLOSED"\|string?` (see § Updating a Row). |
| `deferral` | `key`, `type:"issue"\|"feature"`, `category`, `severity`, `summary?`, `description`, `remediation?`, `source?`, `status:"OPEN"\|"TRIAGED"\|"CLOSED"?`. |
| `failure` | `key`, `summary?`, `severity`, `description`, `rootCause?`, `remediation?`, `status:"OPEN"\|"TRIAGED"\|"CLOSED"\|string?`. |
| `knowledge` | `key`, `summary`, `description?`, `rootCause?`, `remediation?`. |
| `decision` | `key`, `summary`, `description?`, `rationale?`, `alternatives?`, `status:"ACTIVE"\|"SUPERSEDED"?`. |

## Who Wrote It — `step` vs `subagent` vs `model`

<!-- prettier-ignore -->
| Row written by | `workflow` | `step` | `subagent` | `model` |
| --- | --- | --- | --- | --- |
| **The orchestrator** (a workflow itself) | `ship` | `ship-close-gate` | *(absent)* | *(absent)* |
| **A subagent** it invoked | `build` | the step that invoked it, e.g. `build-challenge` | `bkit-build-challenge-remediate` | that prompt's own `model:` |

As a subagent, set these on every row you append, read off your own prompt file:

- **`subagent`** = your frontmatter `name:`.
- **`model`** = your frontmatter `model:`.
- **`step`** = the workflow step that invoked you (named in your Context).

As an orchestrator, omit `subagent` and `model`.

## Key & References

`key` = a written-once stable slug; recurrence = a same-`key` append.

- **Mint it from the CONTENT, never from a counter.** A descriptive slug (`gh-mcp-401-after-token-rotation`), optionally prefixed with the driving issue (`681-e2e-parallelism-via-runner-matrix`).
- **NEVER a sequential `DE-{N}`/`KN-{N}`.** `ts` is the id. Concurrent workflows read the same max from their own base commit and mint the same number.

`references` = free-form pointers to whatever places this row:

<!-- prettier-ignore -->
```jsonl
"references": ["681", "BAR-217", "PR-412", "a1b2c3d", "docs/plans/202607/681-e2e-parallelism-design.md", "DE-7", "1718900000600"]
```

- Feature ids / `{FID}`, tracker ids (`BAR-217`), PRs, commit SHAs, file paths, a sibling row's `ts`, and — on rows migrated off the `.md` ledgers — that row's own legacy `KN-N`/`DE-N` id.
- Keep each item as the source wrote it; trailing qualifiers (`BAR-142 §A2`) are meaning, not noise.
- No separate identity field: `ts` is the id, everything in `references` is a pointer — including a legacy id.
- Omit when there is nothing to point at.

## Friction Is a Drained Queue — the one non-append-only ledger

`.bkit/friction.jsonl` is a work queue that drains — the ONE file rows are removed from:

<!-- prettier-ignore -->
| Actor | May do |
| --- | --- |
| **A consumer repo** | APPEND only. |
| **`bkit harvest`** (from the bkit repo) | MOVES rows out: copies each into bkit's `harvest/` store, then prunes it from the consumer. |

A friction row vanishing from your `.bkit/friction.jsonl` is `bkit harvest` having banked it centrally.

Prune gates, in order:

- **Durability first** — prune ONLY after that exact row is fsync'd to the store AND read back.
- **Content, never identity** — gate on byte-for-byte content; `fold` collapses same-identity rows, so an identity gate deletes rows the store never kept. A row losing the fold STAYS in the consumer, reported.
- **Malformed lines** — NEVER pruned.
- **Store accumulates**, never cleared. `harvest` NEVER commits, either repo.

`stats.jsonl` is COPY-only; `deferrals`/`failures` are COUNT-only (envelope metadata; prose never leaves the consumer). Contract: `.bkit/src/bkit-harvest.ts`.

## Summary vs Description

Where a kind has BOTH (`friction`/`deferral`/`failure`/`knowledge`/`decision`): `summary` = the short title, `description` = the prose. With only one sentence, it goes in `description`.

## Severity

`severity` is REQUIRED on `friction` / `deferral` / `failure`, and MUST NOT appear on any other kind (`knowledge`/`decision` have no triage severity; `compliance`/`outcome`/`counter` are machine-generated). Closed enum — exactly these four, uppercase:

<!-- prettier-ignore -->
| Value | Means |
| --- | --- |
| `CRITICAL` | Data loss, security hole, or a broken workflow with no workaround. Triage before the next release. |
| `HIGH` | Real damage or a blocked path, but a workaround exists. |
| `MEDIUM` | Degraded behaviour or a repeated cost; safe to schedule. |
| `LOW` | Cosmetic, nit, or a speculative future idea. |

- Same enum the challenge + audit prompts assign to findings. When a finding becomes a row (e.g. `@bkit-build-challenge-remediate` writing a BLOCKED finding to `docs/deferrals.jsonl`), carry ITS severity through unchanged.
- NOT the `bkit install` preflight `blocker`/`advisory` scale — a different axis.
- Pick the level the ROW earns. A ledger where every row is `LOW` is as useless as no severity at all.

## Updating a Row

These fields change after first write:

<!-- prettier-ignore -->
| Field | Changes when |
| --- | --- |
| `status` | work closes (`OPEN` -> `CLOSED`), or a decision is `SUPERSEDED`. |
| `remediation` | the fix is known — usually AFTER the row was logged mid-workflow. |
| `severity` | re-triage says it was worse or milder than first thought. |
| `confidence` | the same thing recurs (raise) or is contradicted (lower). |
| `lastConfirmed` | re-observed. |
| `recurrenceCount` | it happens again. |

**Update by APPENDING a new row with the SAME `key`, never by editing the old line.** `fold()` takes last-wins by `ts`; the older rows remain as history. A recurrence and an update are the same operation.

Copy the prior row, change what changed, append. Carry `key` across verbatim — a reworded `key` forks the entry.

One deferral, three rows, in append order — raised, analysed, closed (envelope fields trimmed for readability; on disk each is a full single-line row):

<!-- prettier-ignore -->
```jsonl
{ "ts": 1718900000000, "kind": "deferral", "key": "pnpm-tag-drop-readme-note", "type": "issue", "category": "infra", "severity": "LOW", "summary": "pnpm tag-drop README note", "description": "pnpm strips the #vX.Y.Z pin from git-dep entries", "status": "OPEN", "references": ["BAR-131"] }
{ "ts": 1721578400000, "kind": "deferral", "key": "pnpm-tag-drop-readme-note", "type": "issue", "category": "infra", "severity": "MEDIUM", "summary": "pnpm tag-drop README note", "description": "pnpm strips the #vX.Y.Z pin from git-dep entries", "remediation": "note the pin workaround in the README install snippet", "status": "TRIAGED", "references": ["BAR-131", "#268", "README.md"] }
{ "ts": 1724256800000, "kind": "deferral", "key": "pnpm-tag-drop-readme-note", "type": "issue", "category": "infra", "severity": "MEDIUM", "summary": "pnpm tag-drop README note", "description": "pnpm strips the #vX.Y.Z pin from git-dep entries", "remediation": "note the pin workaround in the README install snippet", "status": "CLOSED", "references": ["BAR-131", "#268", "PR-412", "e93da12"] }
```

Same `key` throughout makes them one entry; `fold` returns only the third. Each `ts` is dated, so "how long open" and "time to fix" fall out of the ledger.

**Triage** — sweeping `docs/deferrals.jsonl` / `docs/failures.jsonl` for work that has moved on — is this operation: append a same-`key` row with `status: "CLOSED"`, the `references` you now have (PR, commit, closing issue), and a re-triaged `severity` if it earned one.

**`TRIAGED`** is the state between, on all three triaged kinds (`friction`/`deferral`/`failure` — the trio carrying `severity`). The ladder: `OPEN` (raised, cause unknown) -> `TRIAGED` (analysed, disposition known, not yet fixed) -> `CLOSED` (fixed, refuted, or established as not ours). Append it exactly like a close, carrying the disposition in `references`: the issue, the `Fix N` it maps to, or why it is not ours.

**`TRIAGED` IS STILL OPEN WORK.** Counting open entries — CI gate on open `CRITICAL` failures, audit debt lens, age report — test `status != "CLOSED"`. Only `CLOSED` is done.

Not on `knowledge` (no status) or `decision` (`ACTIVE`/`SUPERSEDED` is a lifecycle).

Readers count ENTITIES, never lines — `fold` first.

## Migrated Rows Are Not Evidence On Every Axis

Rows imported by `bkit telemetry migrate` from the legacy `friction.md` carry transport values on some
axes. Measured on `harvest/friction.jsonl` (2026-07-15, 257 rows / 156 entities) — read these before
ranking anything by them:

- **`ts` is now the real incident date on migrated rows** — backfilled 2026-07-15 from the legacy heading
  (`## Title (YYYY-MM-DD)`), which `parseTitleDate` reads and the row builder prefers over the synthetic
  `baseTs + idx`. 183 of 257 rows were corrected; span is now 2026-05-24..2026-07-15. The 74 untouched are
  live rows whose `ts` was already correct, plus 2 legacy entries whose heading carried no date.
- **`severity` is `MEDIUM` on every migrated friction row.** `friction.md` never had the field, so
  `mapLegacySeverity` maps unknown -> neutral by design. It is a placeholder, NOT a triage judgement —
  do not read P0/P1 out of it. Re-triage on next touch.
- **`step` is the transport on 76 rows** (`step:"bkit-telemetry-migrate"`), so step-based clustering
  under-counts. Only ~25 of those carry a recoverable step hint in `summary`.
- **Recurrence is not counted.** No occurrence field exists: a recurrence is titled differently
  (`"... (recurrence of the 527 entry)"`), so `stableKey` gives it a NEW key and it folds to a SEPARATE
  entity. Frequency is therefore unrepresentable — a cluster's entity count is a count of _reports_, not
  of _occurrences_. The only recurrence signal is prose.

Same-key append is an UPDATE, not a second occurrence: of the 101 two-row entities, every pair differs
only in `references`, `ts`, `status` — a create plus a triage stamp.

## These Ledgers Are Inputs, Not a Diary

`docs/deferrals.jsonl` and `docs/failures.jsonl` are a backlog of real work — deferred scope and known bugs, machine-readable, `severity` to rank by, `ts` to age by. READ them:

- **Before designing or planning** — grep for an entry already describing the thing, or the reason a past attempt was deferred.
- **On a triage sweep** — walk the open entries against the tracker and the codebase; close, `TRIAGED`, or re-`severity` each by appending (§ Updating a Row).
- **When a bug looks familiar** — a same-`key` `failure` row means it recurred.

Rank on what is already there: `severity: CRITICAL` first, then oldest `ts`.

## Identity / Dedup

Identity is this tuple, NOT bare `ts`:

<!-- prettier-ignore -->
| Kind | Identity tuple |
| --- | --- |
| `compliance` | `(repo, workflow, parentSha, rule)` |
| `outcome` | `(repo, prNumber)` |
| `counter` | `(repo, workflow, parentSha, counterName)` |
| `friction` \| `deferral` \| `failure` \| `knowledge` \| `decision` | `(kind, repo, key)` |

An identity match means the two rows describe the SAME thing. It does not by itself mean skip:

- **Nothing changed** -> skip.
- **Something changed** -> **APPEND** (mechanics: § Updating a Row).

## Versioning

No separate schema version — `bkitVersion` is the only version stamp. Readers ingest ALL well-formed rows (no version gating) and report row counts per `bkitVersion`, so an unexpected version surfaces for triage.

## Examples

Indented here for readability — **on disk each row is a single physical line** (see § Write Idiom). One example per ledger:

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
  "prNumber": 412,
  "linesAdded": 120,
  "linesDeleted": 34,
  "linesChanged": 154,
  "filesChanged": 7,
  "taskCount": 5,
  "durationSeconds": 2400,
  "deferrals": 1,
  "failures": 0
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
  "summary": "pnpm tag-drop README note for the install snippet",
  "description": "pnpm normaliser strips the #vX.Y.Z pin from github:cbartens/bkit git-dep entries in package.json; document the workaround in README or fix upstream",
  "remediation": "note the pin workaround in the README install snippet",
  "source": "phase",
  "status": "OPEN",
  "references": ["BAR-131", "BAR-130", "README.md"]
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
  "references": ["KN-CORE-1", ".bkit/.env", "DE-35"]
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
  "rationale": "eliminates four friction classes of the git-dep model: two-surface git auth, the CI auth shim, the prepare:tsc OOM trap, and pnpm dropping the version pin",
  "alternatives": "npmjs.org public (package is private), continue git-dep, Releases tarball, vendor per-consumer, dual-publish git+registry",
  "status": "ACTIVE",
  "references": ["DE-3", "BAR-138", "BAR-130", "package.json", ".github/workflows/release.yml", "KN-1"]
}
```
