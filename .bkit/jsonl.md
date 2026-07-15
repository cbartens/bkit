# JSONL Entry Format

> [!CAUTION]
> **Purpose:** How to format a new row for any bkit JSONL ledger (`docs/deferrals.jsonl`, `docs/failures.jsonl`, `docs/knowledge.jsonl`, `docs/decisions.jsonl`, `.bkit/friction.jsonl`, `.bkit/stats.jsonl`). Codec: `.bkit/src/bkit-telemetry.ts`. Which ledger holds which `kind` + when workflows write: `.bkit/workflows.md` § Telemetry Ledgers.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
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
| `step` | `string` | The WORKFLOW STEP the row was emitted at, e.g. `build-close-workflow`, `ship-close-gate`. A step of the orchestrator — NEVER an agent name. |
| `subagent` | `string?` | The SUBAGENT that wrote the row, e.g. `bkit-build-challenge-remediate`. Set on every subagent-written row; ABSENT on orchestrator-written rows. `step` is WHERE, `subagent` is WHO — do not put one in the other. |
| `model` | `string?` | The model that wrote the row, read from the writing subagent's OWN prompt frontmatter `model:` at call time. Set ONLY where `subagent` is set. NEVER set for orchestrator-written rows — the session model is the operator's runtime choice, not a property of the row. |
| `references` | `string[]?` | Related context — see § Key & References. ANY pointer that helps a later reader place the row: feature ids, tracker ids, PRs, commit SHAs, paths, sibling `ts`, legacy `KN-N`/`DE-N`. Omit when there is genuinely nothing to point at; do NOT invent links. |

## Per-Kind Fields

<!-- prettier-ignore -->
| Kind | Fields (beyond envelope) |
| --- | --- |
| `counter` | `counterName`, `counterValue:number`, `counterSource:"model-self-report"\|"shell-bus"`, `parentSha`. |
| `outcome` | `prNumber:number`, `linesAdded:number`, `linesDeleted:number`, `linesChanged:number`, `filesChanged:number`, `taskCount:number`, `durationSeconds:number`, `ciTrySuccess:number?`, `deferrals:number`, `failures:number` (both = the repo's CUMULATIVE UNIQUE entity count at ship time, folded — NOT lines, NOT this cycle; per-cycle is the delta against the previous `outcome` row), `coverage?:{unit?,integration?,e2e?}` (per-tier, each `{lines,branches,functions,statements}:number` %; best-effort — a tier is absent when its coverage report is not produced, opt-in per #312/#313). |
| `compliance` | `rule`, `result:"pass"\|"fail"\|"n/a"`, `evidence?`, `phase`, `parentSha`. |
| `friction` | `key`, `category:"human-confirm"\|"permission-prompt"\|"agent-rework"\|"manual-install"\|"tool-failure"\|"destructive-backout"\|"other"`, `scope:"bkit-repo"\|"consumer"\|"universal"`, `severity`, `summary?`, `description`, `remediation?`, `recovery?`, `status:"OPEN"\|"TRIAGED"\|"CLOSED"\|string?` (see § Updating a Row). |
| `deferral` | `key`, `type:"issue"\|"feature"`, `category`, `severity`, `summary?`, `description`, `remediation?`, `source?`, `status:"OPEN"\|"TRIAGED"\|"CLOSED"?`. |
| `failure` | `key`, `summary?`, `severity`, `description`, `rootCause?`, `remediation?`, `status:"OPEN"\|"TRIAGED"\|"CLOSED"\|string?`. |
| `knowledge` | `key`, `summary`, `description?`, `rootCause?`, `remediation?`. |
| `decision` | `key`, `summary`, `description?`, `rationale?`, `alternatives?`, `status:"ACTIVE"\|"SUPERSEDED"?`. |

## Who Wrote It — `step` vs `subagent` vs `model`

Three fields, three different questions. They were collapsed into one, so the harvest lost two of the five dimensions it slices by (`repo`/`workflow`/`step`/`subagent`/`severity`).

<!-- prettier-ignore -->
| Row written by | `workflow` | `step` | `subagent` | `model` |
| --- | --- | --- | --- | --- |
| **The orchestrator** (a workflow itself) | `ship` | `ship-close-gate` | *(absent)* | *(absent)* |
| **A subagent** it invoked | `build` | the step that invoked it, e.g. `build-challenge` | `bkit-build-challenge-remediate` | that prompt's own `model:` |

**If you are a subagent, fill these from YOUR OWN prompt file — do not wait to be told:**

- **`subagent`** = your frontmatter `name:`. Read it; never a name written into a step instruction, which is a copy that goes stale the day the prompt is renamed.
- **`model`** = your frontmatter `model:`. The deterministic value bkit already owns, and the only one that stays true when a prompt is re-pinned. Never the model you believe you are — self-report is the nondeterminism the compliance grader exists to measure away.
- **`step`** = the workflow step that invoked you (your Context names it). NEVER your own name: `step: "bkit-telemetry-migrate"` is wrong, that is a `subagent`.

**If you are an orchestrator, omit `subagent` and `model` entirely.** Blank `subagent` means "the workflow wrote this", not "unknown". The session model is whatever the operator happened to run — a property of the run, not of the row.

Set these on EVERY row you append, to any ledger. This rule lives here, once: a prompt that says "append a row in `.bkit/jsonl.md` format" has already told you to follow it.

## Key & References

`key` = a written-once stable slug; recurrence = a same-`key` append.

- **Mint it from the CONTENT, never from a counter.** A descriptive slug (`gh-mcp-401-after-token-rotation`), optionally prefixed with the driving issue (`681-e2e-parallelism-via-runner-matrix`).
- **NEVER mint a sequential `DE-{N}`/`KN-{N}` number.** `ts` is the id; the old `next = max(grep 'DE-\d+') + 1` rule is RETIRED and MUST NOT be revived. Two workflows running concurrently both read the same max from their own base commit and mint the SAME number, so a sequential id silently collides — a content slug cannot. This is not hypothetical: nine ids collided in a live consumer ledger before the rule was retired.

`references` = the JSONL form of the retired `**Related:**` field. Free-form, no schema — whatever a later reader needs to place this row:

<!-- prettier-ignore -->
```jsonl
"references": ["681", "BAR-217", "PR-412", "a1b2c3d", "docs/plans/202607/681-e2e-parallelism-design.md", "DE-7", "1718900000600"]
```

- Feature ids / `{FID}`, tracker ids (`BAR-217`), PRs, commit SHAs, file paths, a sibling row's `ts`, and — on rows migrated off the `.md` ledgers — that row's own legacy `KN-N`/`DE-N` id.
- Keep each item as the source wrote it; trailing qualifiers (`BAR-142 §A2`) are meaning, not noise.
- **There is no separate identity field.** The design's `aliases[]` ("I AM `KN-14`") folded into `references` once sequential ids proved un-mintable — an id that two runs can both claim was never a reliable identity. `ts` is the id; everything in `references` is a pointer, including a legacy id.
- Omit when there is genuinely nothing to point at. NEVER invent a link to fill the field.

## Friction Is a Drained Queue — the one non-append-only ledger

Every other ledger is a permanent record. `.bkit/friction.jsonl` is a **work queue that drains**, so it is the ONE file rows are removed from:

<!-- prettier-ignore -->
| Actor | May do |
| --- | --- |
| **A consumer repo** (you, in normal work) | APPEND only. NEVER delete, edit, or reorder a friction row — not even your own, not even to tidy. |
| **`bkit harvest`, run from the bkit repo** | MOVES rows out: copies each into bkit's central `harvest/` store, then PRUNES that row from the consumer. Consumers start each cycle clean. |

A friction row vanishing from your `.bkit/friction.jsonl` is therefore `bkit harvest` having banked it centrally — NOT data loss, and NOT licence to prune by hand.

The prune is gated, in this order, and each gate exists because the alternative loses data:

- **Durability first:** a row is pruned ONLY after that exact row is fsync'd into the central store AND read back. Crash anywhere and the copy simply re-runs.
- **Content, never identity:** the gate is byte-for-byte row content. `fold` collapses rows sharing an identity, so an identity-gated prune would delete rows the store never actually kept — real, since `key`s are truncated and two distinct entries can collide. A row that loses the fold STAYS in the consumer and is reported.
- **Malformed lines are never pruned** — not ours to delete.
- **The central store accumulates** and is never cleared; until the caller commits it, it is the only record of the pruned rows. `harvest` NEVER commits, in either repo.

`stats.jsonl` is COPY-only (consumer content untouched); `deferrals`/`failures` are COUNT-only (dimensional counts from envelope metadata — prose never leaves the consumer). Contract lives in `.bkit/src/bkit-harvest.ts`.

## Summary vs Description

Where a kind has BOTH (`friction`/`deferral`/`failure`/`knowledge`/`decision`): `summary` = the short title, `description` = the actual prose. Putting the title in `description` and dropping the prose is a real data-loss bug that shipped once — the legacy `.md` migration retained ~40% of its source content that way. If you only have one sentence, it goes in `description`.

## Severity

`severity` is REQUIRED on `friction` / `deferral` / `failure`, and MUST NOT appear on any other kind (`knowledge`/`decision` have no triage severity; `compliance`/`outcome`/`counter` are machine-generated). Closed enum — exactly these four, uppercase:

<!-- prettier-ignore -->
| Value | Means |
| --- | --- |
| `CRITICAL` | Data loss, security hole, or a broken workflow with no workaround. Triage before the next release. |
| `HIGH` | Real damage or a blocked path, but a workaround exists. |
| `MEDIUM` | Degraded behaviour or a repeated cost; safe to schedule. |
| `LOW` | Cosmetic, nit, or a speculative future idea. |

- **Same enum the challenge + audit prompts already assign** to findings — when a finding becomes a row (e.g. `@bkit-build-challenge-remediate` writing a BLOCKED finding to `docs/deferrals.jsonl`), carry ITS severity through UNCHANGED; do NOT re-derive.
- NOT the `bkit install` preflight `blocker`/`advisory` scale — different axis, do not mix.
- Pick the level the ROW earns, not the level that feels safe. A ledger where every row is `LOW` is exactly as useless as no severity at all — which is why the pre-JSONL `critical|normal|low` scale was retired (19 `low` / 2 `normal` / 0 `critical` across 21 rows).

## Updating a Row

A row is a fact at a point in time, not a final answer. These fields are EXPECTED to change after first write:

<!-- prettier-ignore -->
| Field | Changes when |
| --- | --- |
| `status` | work closes (`OPEN` -> `CLOSED`), or a decision is `SUPERSEDED`. |
| `recovery` / `remediation` | the workaround is found — usually AFTER the row was logged mid-workflow. |
| `severity` | re-triage says it was worse or milder than first thought. |
| `confidence` | the same thing recurs (raise) or is contradicted (lower). |
| `lastConfirmed` | re-observed. |
| `recurrenceCount` | it happens again. |

**Update by APPENDING a new row with the SAME `key` — never by editing the old line.** `fold()` sorts by `ts` and takes last-wins per identity, so the newest same-`key` row IS the current state, and the older rows stay as the history that makes `confidence` / `recurrenceCount` / interval-between-recurrences computable. A recurrence and an update are the same operation.

Copy the prior row, change what changed, append. Carry `key` across verbatim — a reworded `key` forks the entry into two.

One deferral, three rows, in append order — raised, analysed, closed (envelope fields trimmed for readability; on disk each is a full single-line row):

<!-- prettier-ignore -->
```jsonl
{ "ts": 1718900000000, "kind": "deferral", "key": "pnpm-tag-drop-readme-note", "type": "issue", "category": "infra", "severity": "LOW", "summary": "pnpm tag-drop README note", "description": "pnpm strips the #vX.Y.Z pin from git-dep entries", "status": "OPEN", "references": ["BAR-131"] }
{ "ts": 1721578400000, "kind": "deferral", "key": "pnpm-tag-drop-readme-note", "type": "issue", "category": "infra", "severity": "MEDIUM", "summary": "pnpm tag-drop README note", "description": "pnpm strips the #vX.Y.Z pin from git-dep entries", "remediation": "note the pin workaround in the README install snippet", "status": "TRIAGED", "references": ["BAR-131", "#268", "README.md"] }
{ "ts": 1724256800000, "kind": "deferral", "key": "pnpm-tag-drop-readme-note", "type": "issue", "category": "infra", "severity": "MEDIUM", "summary": "pnpm tag-drop README note", "description": "pnpm strips the #vX.Y.Z pin from git-dep entries", "remediation": "note the pin workaround in the README install snippet", "status": "CLOSED", "references": ["BAR-131", "#268", "PR-412", "e93da12"] }
```

Same `key` throughout is what makes them one entry; `fold` returns only the third, the first two are the history. Each append bought something real: `severity` rose on re-triage, `remediation` appeared once someone worked it out, `references` accumulated (`#268` at triage, the PR and SHA at close) — and the three `ts` values give "37 days sitting unanalysed, then 31 more to fix," which editing one line in place would lose entirely. This is also what makes a close DATABLE: entry `ts` = raised, closing row's `ts` = resolved, so "how long open" / "time to fix" fall out of the ledger — the reason `ts` is the id at all.

**Triage** (a consumer sweeping `docs/deferrals.jsonl` / `docs/failures.jsonl` for work that is now done) is exactly this operation: for each entry that has moved on, append a same-`key` row with `status: "CLOSED"`, the `references` you now have (the PR, the commit, the issue that closed it), and a re-triaged `severity` if it turned out to matter more or less. The old row stays put.

**`TRIAGED` is the state between**, shared by all three triaged kinds — `friction`, `deferral`, `failure` — the trio that carries `severity` because these describe OPEN WORK someone has to look at. Analysing something and fixing it are different events, often months apart: recording an analysed-but-unfixed entry as `CLOSED` is a lie; leaving it `OPEN` throws away the analysis and invites the next sweep to redo it. Hence the ladder: `OPEN` (raised, cause unknown) -> `TRIAGED` (analysed, disposition known, not yet fixed) -> `CLOSED` (fixed, refuted, or established as not ours to fix). Append `TRIAGED` exactly like a close, carrying the disposition in `references`: the issue, the `Fix N` it maps to, or why it is not ours. A diagnosed bug is not a fixed bug — and this extends the datability above: raised -> triaged -> closed distinguishes "sat unanalysed" from "known but unfixed," which a single `OPEN`/`CLOSED` pair cannot.

**`TRIAGED` IS STILL OPEN WORK.** Any reader counting open entries — a CI gate on open `CRITICAL` failures, an audit debt lens, an age report — MUST count it. Only `CLOSED` is done; test `status != "CLOSED"`, never `status == "OPEN"` (`isOpenWork()` in the codec). Getting this backwards silently retires work the moment someone looks at it — the exact failure `TRIAGED` exists to prevent.

Not on `knowledge` (no status — a lesson is not work) or `decision` (`ACTIVE`/`SUPERSEDED` is a lifecycle, a different axis).

Readers count ENTITIES, never lines — `fold` first; two rows sharing a `key` are one deferral with a history, not two. This is also why appending beats editing under version control: every ledger resolves `merge=union` (`git check-attr merge …`), so two branches editing the same row would both survive the union — and since they share a `ts`, fold cannot tell which won. Appending is conflict-free under union by construction.

## These Ledgers Are Inputs, Not a Diary

Writing a row is half the job. `docs/deferrals.jsonl` and `docs/failures.jsonl` are a **backlog of real work** — deferred scope and known bugs, in the repo, machine-readable, with `severity` to rank by and `ts` to age by. A ledger only ever appended to is a place work goes to be forgotten, which is the failure mode it exists to prevent.

READ them:

- **Before designing or planning** — an entry may already describe the thing being designed, or the reason a past attempt was deferred. Grep the ledger before re-deriving.
- **On a triage sweep** — walk the OPEN entries against the tracker and the codebase: some are already fixed, some now have an owning issue, some are stale. Close, `TRIAGED`, or re-`severity` each by appending (see § Updating a Row). An entry closed by work nobody linked back is the common case.
- **When a bug looks familiar** — a same-`key` `failure` row means it recurred, not that it is new.

Ranking is already in the data: `severity: CRITICAL` first, then oldest `ts` among `OPEN`. Nothing needs computing.

## Identity / Dedup

Identity is this tuple, NOT bare `ts`:

<!-- prettier-ignore -->
| Kind | Identity tuple |
| --- | --- |
| `compliance` | `(repo, workflow, parentSha, rule)` |
| `outcome` | `(repo, prNumber)` |
| `counter` | `(repo, workflow, parentSha, counterName)` |
| `friction` \| `deferral` \| `failure` \| `knowledge` \| `decision` | `(kind, repo, key)` |

An identity match means the two rows describe the SAME thing — it does NOT by itself mean skip:

- **Nothing changed** -> skip. A byte-identical re-log is noise.
- **Something changed** -> **APPEND** (mechanics: § Updating a Row).

Treating every identity match as a duplicate silently freezes each entry at its first write — no closure, no recurrence, and `confidence` / `lastConfirmed` / `recurrenceCount` stay forever unpopulated.

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
