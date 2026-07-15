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
| `references` | `string[]?` | Related context — see § Key & References. ANY pointer that helps a later reader place the row: feature ids, tracker ids, PRs, commit SHAs, paths, sibling `ts`, legacy `KN-N`/`DE-N`. Omit when there is genuinely nothing to point at; do NOT invent links. |

## Per-Kind Fields

<!-- prettier-ignore -->
| Kind | Fields (beyond envelope) |
| --- | --- |
| `counter` | `counterName`, `counterValue:number`, `counterSource:"model-self-report"\|"shell-bus"`, `parentSha`. |
| `outcome` | `prNumber:number`, `linesAdded:number`, `linesDeleted:number`, `linesChanged:number`, `filesChanged:number`, `taskCount:number`, `durationSeconds:number`, `ciTrySuccess:number?`, `deferrals:number`, `failures:number`, `coverage?:{unit?,integration?,e2e?}` (per-tier, each `{lines,branches,functions,statements}:number` %; best-effort — a tier is absent when its coverage report is not produced, opt-in per #312/#313). |
| `compliance` | `rule`, `result:"pass"\|"fail"\|"n/a"`, `evidence?`, `phase`, `parentSha`. |
| `friction` | `key`, `category:"human-confirm"\|"permission-prompt"\|"agent-rework"\|"manual-install"\|"tool-failure"\|"destructive-backout"\|"other"`, `scope:"bkit-repo"\|"consumer"\|"universal"`, `severity`, `description`, `remediation?`, `recovery?`, `status:"OPEN"\|"CLOSED"\|string?`. |
| `deferral` | `key`, `type:"issue"\|"feature"`, `category`, `severity`, `description`, `remediation?`, `source?`, `status:"OPEN"\|"CLOSED"?`. |
| `failure` | `key`, `summary?`, `severity`, `description`, `rootCause?`, `remediation?`, `status:"OPEN"\|"CLOSED"\|string?`. |
| `knowledge` | `key`, `summary`, `description?`, `rootCause?`, `remediation?`. |
| `decision` | `key`, `summary`, `description?`, `rationale?`, `alternatives?`, `status:"ACTIVE"\|"SUPERSEDED"?`. |

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
  "severity": "HIGH",
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
  "severity": "LOW",
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
  "severity": "HIGH",
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
