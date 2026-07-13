# JSONL Entry Format

> [!CAUTION]
> **Purpose:** How to format a new row for any bkit JSONL ledger (`docs/deferrals.jsonl`, `docs/failures.jsonl`, `docs/knowledge.jsonl`, `docs/decisions.jsonl`, `.bkit/friction.jsonl`, `.bkit/stats.jsonl`). Codec: `.bkit/src/bkit-telemetry.ts`. Which ledger holds which `kind` + when workflows write: `.bkit/workflows.md` § Telemetry Ledgers.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - One row per line, append-only — NEVER mutate or reorder prior lines.
> - Before appending: Read the file, skip if an identity-matching row already exists.
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
| `step` | `string` | Emitting step, e.g. `build-close-workflow`. |
| `model` | `string?` | Model that wrote the row — the writing subagent's prompt frontmatter `model:` for subagent-written rows, or the orchestrator's session model for workflow-written rows (`compliance`/`outcome`/`counter`/`friction`). Blank if unknown. |

## Per-Kind Fields

<!-- prettier-ignore -->
| Kind | Fields (beyond envelope) |
| --- | --- |
| `counter` | `counterName`, `counterValue:number`, `counterSource:"model-self-report"\|"shell-bus"`, `parentSha`. |
| `outcome` | `prNumber:number`, `linesAdded:number`, `linesDeleted:number`, `linesChanged:number`, `filesChanged:number`, `taskCount:number`, `durationSeconds:number`, `ciTrySuccess:number?`, `deferrals:number`, `failures:number`, `coverage?:{unit?,integration?,e2e?}` (per-tier, each `{lines,branches,functions,statements}:number` %; best-effort — a tier is absent when its coverage report is not produced, opt-in per #312/#313). |
| `compliance` | `rule`, `result:"pass"\|"fail"\|"n/a"`, `evidence?`, `phase`, `parentSha`. |
| `friction` | `key`, `category:"human-confirm"\|"permission-prompt"\|"agent-rework"\|"manual-install"\|"tool-failure"\|"destructive-backout"\|"other"`, `scope:"bkit-repo"\|"consumer"\|"universal"`, `description`, `remediation?`, `recovery?`, `status:"OPEN"\|"CLOSED"\|string?`. |
| `deferral` | `key`, `type:"issue"\|"feature"`, `category`, `description`, `remediation?`, `source?`, `status:"OPEN"\|"CLOSED"?`. |
| `failure` | `key`, `summary?`, `description`, `rootCause?`, `remediation?`, `status:"OPEN"\|"CLOSED"\|string?`. |
| `knowledge` | `key`, `summary`, `description?`, `rootCause?`, `remediation?`. |
| `decision` | `key`, `summary`, `description?`, `rationale?`, `alternatives?`, `status:"ACTIVE"\|"SUPERSEDED"?`. |

`key` = a written-once stable slug; recurrence = a same-`key` append. For `knowledge`/`decision`, `key` mirrors the former `KN-N`/`DE-N` id.

## Identity / Dedup

Skip an append when a row with the same identity tuple already exists (NOT bare `ts`):

<!-- prettier-ignore -->
| Kind | Identity tuple |
| --- | --- |
| `compliance` | `(repo, workflow, parentSha, rule)` |
| `outcome` | `(repo, prNumber)` |
| `counter` | `(repo, workflow, parentSha, counterName)` |
| `friction` \| `deferral` \| `failure` \| `knowledge` \| `decision` | `(kind, repo, key)` |

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
  "model": "claude-opus-4-8",
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
  "model": "claude-opus-4-8",
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
  "model": "claude-opus-4-8",
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
  "model": "claude-opus-4-8",
  "key": "ship-dev-commit-blocked-by-pre-commit-hook",
  "category": "tool-failure",
  "scope": "bkit-repo",
  "description": "ship Steps 8-12 commit docs to dev, but the pre-commit hook refuses dev/main commits unless $PWD matches *.worktrees/*; git -C REPO_ROOT commit does not pass the guard and --no-verify is prohibited",
  "remediation": "commit via a temp branch (docs/ship-{FID}) from dev in a temp worktree, then FF-merge dev"
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
  "step": "design-generate",
  "model": "claude-opus-4-8",
  "key": "pnpm-tag-drop-readme-note",
  "type": "issue",
  "category": "infra",
  "description": "pnpm normaliser strips the #vX.Y.Z pin from github:cbartens/bkit git-dep entries in package.json; document the workaround in README or fix upstream",
  "remediation": "note the pin workaround in the README install snippet"
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
  "step": "debug-failure-diagnose",
  "model": "claude-opus-4-8",
  "key": "bkit-install-flips-core-bare",
  "summary": "bkit install flips core.bare=true",
  "description": "`pnpm bkit install` leaves git config core.bare=true, which breaks git checkout/status afterward",
  "remediation": "run `git config core.bare false` after install",
  "status": "OPEN"
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
  "step": "debug-failure-remediate",
  "model": "claude-sonnet-4-6",
  "key": "gh-mcp-401-after-token-rotation",
  "summary": "GitHub MCP / gh 401 immediately after a token rotation",
  "description": "401 from the GitHub MCP server or gh despite a freshly-rotated, valid, correctly-scoped PAT in .bkit/.env",
  "rootCause": "the MCP server captures GH_MCP_TOKEN at process launch, so a mid-session rotation leaves it holding the dead token",
  "remediation": "restart/reload the MCP server after rotating; for a one-off CLI, prefix `direnv exec . gh …`"
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
  "model": "claude-opus-4-8",
  "key": "bkit-distribution-via-github-packages",
  "summary": "distribute @cbartens/bkit via the GitHub Packages npm registry",
  "rationale": "eliminates four friction classes of the git-dep model: two-surface git auth, the CI auth shim, the prepare:tsc OOM trap, and pnpm dropping the version pin",
  "alternatives": "npmjs.org public (package is private), continue git-dep, Releases tarball, vendor per-consumer, dual-publish git+registry",
  "status": "ACTIVE"
}
```
