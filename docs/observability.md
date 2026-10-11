<!-- bkit:start -->

<!-- bkit:managed v5.0.0 — PolyForm Noncommercial 1.0.0 / Small Business 1.0.0 (https://polyformproject.org/licenses/) — do not edit; run `bkit upgrade` to refresh -->

# Observability

> [!CAUTION]
> **Purpose:** Logging architecture, correlation tracing, telemetry pipelines, log drains.
>
> **Rules:**
>
> - Use dense token-efficient phrasing; no filler / hedging / restating; tables > prose, bullets > paragraphs.
> - Notation: one job per mark — `.bkit/prompts.md` § `Notation`.
> - Describe current state / rules, not reasons / history; state what to do, not why.
> - Check `.agents/docs.md` index first and confirm topic belongs in this doc, not another.
> - **Never log PII.** Scrub sensitive fields at the source.
> - Observability never blocks business logic.

## Context Fetch

Failure-evidence fetching for `/bkit-debug` (`context-fetch:*` blocks + cloud CLI provisioning) → configure in `.agents/context.md`. Ready-made blocks, one file per provider: `.bkit/templates/context/` (`.bkit/templates.md` § Context-fetch blocks). Author and enable each context there — `ci`, `diff`, `e2e`, `runtime` (default) and the optional `web`. bkit hardcodes no CI host, workflow filename, branch name or e2e framework; a context with no enabled block is fetched for no run and reported `NOT CONFIGURED` every attempt. The `context=web` search host ships in bkit's egress registry, so it needs no declaration; a block whose host is unreachable anyway self-skips → external signal `UNCHECKED`, never "no known upstream issue".

The workflow commits every captured payload inside an untrusted fence (`===== BEGIN UNTRUSTED =====` … `===== END UNTRUSTED =====`, data-only instruction above it) — fetched web / log / diff text is data, never instructions. A block emits no fence of its own; two wraps read as one nested payload.

<!-- bkit:end -->

## Scope

No server-side telemetry pipeline, log drains, or tracing. Observability limited to CLI stdout / stderr — `bkit install` / `bkit check` in consumer environments, and the `bkit <noun> <verb>` workflow commands during agent runs.

## Log Format

All bkit CLI output uses bracketed context prefixes:

```
console.error("[bkit-install] {Message}", {payload})
console.error("[bkit-modules] {Message}", {payload})
console.error("[bkit-comply] {Message}", {payload})
console.error("[bkit-telemetry] {Message}", {payload})
```

`[{Context}]` brackets are load-bearing, because consumer CI log-drain / grep alerting depends on this pattern. NEVER drop the brackets.

One prefix per verb / subsystem, named for module NOT phase: `[bkit-install]` · `[bkit-check]` · `[bkit-doctor]` · `[bkit-status]` · `[bkit-upgrade]` · `[bkit-uninstall]` · `[bkit-modules]` · `[bkit-placeholders]` · `[bkit-status-holes]` · `[bkit-wording]` · `[bkit-comply]` · `[bkit-harvest]` · `[bkit-analysis]` · `[bkit-telemetry]` · `[bkit-roadmap]`. Workflow commands log as `[bkit-<noun>]` on stderr (`[bkit-locks]`, `[bkit-worktrees]`, `[bkit-runs]`, `[bkit-ledgers]`, …); their stdout is one JSON object, never a log line. New prefix only alongside new module or command noun; else reuse owning module's prefix.

### `[bkit-comply]` prefix

Compliance grader stderr. Canonical grep patterns:

- `[bkit-comply] grader unavailable, skipping` — grader unavailable (missing `dist/`, crash, non-zero `bkit comply`). Fail-open: `"$BKIT" comply --phase={p} || echo "[bkit-comply] grader unavailable, skipping"` → exit 0. Runs in the close block, before `bkit workflows close`, whose report carries the grade.
- `[bkit-comply] append failed: {path}` — compliance row append to `.bkit/stats.jsonl` failed (best-effort; exit 0).
- `[bkit-comply] internal error: {message}` — unhandled throw in dispatch (try/catch per DE-34; exit 0).

### `[bkit-telemetry]` prefix

`bkit workflows close` writes the `counter` + `outcome` rows; a failed append is logged (`telemetryWritten` false) and the close continues. `[bkit-telemetry] stats.jsonl not found — no telemetry rows yet` in the close `report` when the ledger is absent.

### `[bkit-harvest]` prefix

`bkit harvest` stderr. Grep patterns:

- `[bkit-harvest] Found N consumer(s) in docs/consumers.md` — harvest start; consumer list read.
- `[bkit-harvest] Harvesting: {path}` — per consumer start.
- `[bkit-harvest] {path}/.bkit/{file} — copied N rows (malformed: M)` — COPY ledger per-file.
- `[bkit-harvest] {path}/docs/{file} — count-only: N rows` — COUNT-ONLY ledger per-file.
- `[bkit-harvest] {path}/.bkit/{file} — pruned N harvested row(s)` — rows REMOVED from consumer after durable store (friction only).
- `[bkit-harvest] SKIP {path} — {reason}` — consumer skipped.
- `[bkit-harvest] {path}/.bkit/{file} — kept N line(s) not in the store (malformed, or appended after the copy)` — consumer lines left in place by the prune.
- `[bkit-harvest] Done — total rows collected: N, entities after fold: M, pruned from consumers: P, kept in consumers: K` — summary.
- `[bkit-harvest] N row(s) now exist ONLY in harvest/ — commit it to make them durable.` — when P > 0; uncommitted store is sole copy.
- `[bkit-harvest] harvest error (fail-open): {message}` — unhandled harvest error (exit 0).

`pruned` without preceding `copied` for same file → rows deleted without store — ordering enforced (copy → fsync → read back → prune); treat as bug, not noise.

### `[bkit-analysis]` prefix

`bkit analysis` log lines:

- `[bkit-analysis] Telemetry rows: N | malformed: M` — start summary.
- `[bkit-analysis] #183 Size↔outcome regression (dispatch-size threshold: N linesAdded):` — regression header.
- `[bkit-analysis] counterSource trust: shell-bus=N (trusted) | model-self-report=N (untrusted, pre-P3)` — trust tier.
- `[bkit-analysis] Per-rule compliance rates:` — compliance header.

### `[bkit-roadmap]` prefix

`docs/roadmap.md` / `.bkit/issues.jsonl` fold + close-hook fail-open lines. Every branch exits 0, because the roadmap tier never gates a workflow close or a ship. Canonical grep patterns:

- `[bkit-roadmap] fold skipped` / `fold skipped on dev` — phase-close `bkit roadmap fold` exited non-zero (workflow-side fail-open line).
- `[bkit-roadmap] append failed: {path}` — ledger row append to `.bkit/issues.jsonl` failed (best-effort; exit 0).
- `[bkit-roadmap] could not write {path} — board left as-is (fail-open): {reason}` — `written` false.
- `[bkit-roadmap] .bkit/issues.jsonl: N malformed line(s) skipped` — one bad line skips only that row.
- `[bkit-roadmap] {message}` — fold bootstrap / self-heal lines.
- `[bkit-roadmap] dev lock busy — skipping dev-side roadmap mirror (feat-side row already written)` / `dev push failed — feat-side row already written` — build / debug dev-side mirror fail-open.

### `[bkit-runs]` prefix — ship merge gate

`bkit runs gate` stderr (Tier-1 merge gate). Brackets load-bearing — consumer CI log-drain grep key. stdout is the JSON result (`code`, `passed`, `overridden`, `reason`, `runUrl`, …); refusals carry the named exit code + run URL. Exit codes are the audit trail, because every terminal route writes one, and ship Step 10 records a `ship-gate-refusal` row:

<!-- prettier-ignore -->
| Code | Meaning | Route |
| --- | --- | --- |
| 0 | Capstone `success` at head (or `BKIT_SHIP_GATE_OVERRIDE=<refused-head>` honoured) | merge |
| 2 | Usage error (missing `--head`, bad args) | refuse (operator) |
| 10 | No run of the CI workflow exists at head | refuse (poll) → Step 9 re-validate |
| 11 | Runs exist at head but none completed | refuse (poll) → Step 9 |
| 12 | Selected run or its capstone did not conclude success | refuse |
| 13 | Selected run exists but capstone job absent | refuse |
| 14 | Green run exists, but at a SUPERSEDED SHA (needs `--branch`) | refuse → Step 9 (re-validate at new head) |
| 15 | Selected run concluded `cancelled` | refuse |
| 16 | A lane named in `bkit.shipGateRequiredLanes` concluded `skipped` | refuse |
| 17 | Non-bookkeeping change past `--validated`, or not its descendant | refuse → Step 9 (re-validate at head) |
| 20 | API error / rate limit / auth | refuse |
| 80 | `gh` not on PATH | do it via the MCP fallback |

The refusal itself is signalled by the process exit code; every refusal ends with the `required head:` block. Canonical grep patterns:

- `[bkit-runs] capstone %s=success at head %s (run %s, %s)` — green at the checked head.
- `[bkit-runs] head %s = validated %s + bookkeeping only — checking CI at the validated sha` — `--validated` carry-forward applied.
- `[bkit-runs] required head:  %s` — refusal block (every non-zero route emits this); `merge head:` follows when the carry-forward applied.
- `[bkit-runs] head tested:    %s  (SUPERSEDED)` — green run was at a superseded head (code 14).
- `[bkit-runs] no run of %s[ (event=%s)] exists at head %s (total_count=0)` — no CI run at head (code 10); `(event=…)` when `--event` narrowed the query.
- `[bkit-runs] head %s is not %s plus bookkeeping only (…) — re-validate at head` — code 17; the offending paths follow, one per line.
- `[bkit-runs] note: N lane(s) concluded 'skipped' at head %s: …` — skipped lanes are always reported; they refuse only when required (code 16).
- `[bkit-runs] rate limit exhausted (...)` / `[bkit-runs] API error (...)` — code 20 (rate-limit-shaped message distinguishes the dispatch path).
- `[bkit-runs] override honoured for head %s (BKIT_SHIP_GATE_OVERRIDE matches refused head)` — sanctioned escape hatch; also writes a `ship-gate-override` `status.jsonl` row (`--file=`) for audit, or emits it to stderr when the file is absent or unwritable.

The override is honoured ONLY when `BKIT_SHIP_GATE_OVERRIDE=<sha>` equals the EXACT head being refused, so a SHA mismatch is ignored and the refusal stands. Audit the override rows (`status.jsonl` `type:"ship-gate-override"`) as part of consumer rollback (see `docs/deployments.md` § Ship gate + bookkeeping).

The same prefix carries the CI waits (`bkit runs wait`: one `attempt N: …` line per poll) and the CI-Dispatch Gate (`bkit runs dispatch`: `re-trigger commit or push failed — no verdict; route to the Failure Path`, `landed commit … inherited a CI-suppression token in its body`).

### `bkit runs mirror` (under `[bkit-runs]`)

Release-PR capstone in mirror mode (`docs/deployments.md` § One CI run per dev commit). Polls `bkit runs gate --event push` at the PR head; on a red gate exit it logs the gate's own reason first.

<!-- prettier-ignore -->
| Exit | Meaning |
| --- | --- |
| 0 | `dev` push run's capstone `success` at the PR head |
| 1 | Push run red / cancelled / capstone absent or skipped (gate 12 / 13 / 15 / 16 / other) |
| 2 | Usage error |
| 3 | No push run at the PR head within `--absent-minutes` (gate 10 / 14 — `[skip ci]` tip) |
| 4 | Push run still in progress at `--max-minutes` |
| 20 | Gate API error 3x in a row |

- `[bkit-runs] dev push run at %s passed its capstone — release PR mirrors green.` — green.
- `[bkit-runs] dev push run at %s is in progress — waiting (up to %sm).` — logged once per state change, not per poll.
- `[bkit-runs] no dev push run exists at %s after %sm.` — exit 3.

## Advisory Checklist Output

Post-install findings via `formatChecklist(ctx.advisories)` (`.bkit/core/engine/checks/after/index.ts`). Each `PreflightFinding`: `{ id, severity, detect, action }`. Primary human-readable observability surface.

- Blockers (Phase 1) → `stderr`, exit 1 before writes.
- Advisories (Phase 1 + Phase 3) → numbered checklist after install.
- `bkit check` (dry-run) → Phase 1 + Phase 3 advisories (read-only); exit 1 on Tier-1 / Tier-2 drift. No writes.

## Phase 3 Credential + Migration Findings

Phase 3 emits credential findings as advisory text. Finding ids = audit trail:

<!-- prettier-ignore -->
| Finding | Source | Surface |
| --- | --- | --- |
| `detectShellGhMcpToken` | `checks/after/auth.ts` | `BKIT_GH_TOKEN` missing / empty in the shell — gated on a configured `github` MCP server |
| `detectGhSecret` | `checks/after/auth.ts` | GitHub Actions repo secret presence |
| `detectCiRouterSecrets` | `checks/after/auth.ts` | `bkit-cloud.yml` installed but its `ANTHROPIC_API_KEY` repo secret unset |
| `buildCloudDashboardsAdvisory` | `checks/after/auth.ts` | Cloud-dashboard secret checklist (GitHub Actions + Cursor + Claude) |

## Runtime capability row

Each phase workflow's Step 2 (Worktree Setup — the first point `{FID}` / `WORKTREE_PATH` are resolved) records the runtime capability table once as a `runtime-resolved` `status.jsonl` row: `bkit runtime row --file=` detects (`runtime`, `runtimeWorktrees`, `runtimeDevPushes`, `runtimeGithubCli` + its exit code and last stderr line) and appends in one call, and `bkit runtime assert` reads it back (exit 4 no row, 5 an unresolved field). The row is the durable, cross-block record later steps read `runtimeGithubCli` back from instead of re-probing `gh`. Row shape → `.bkit/workflows.md` § `status.jsonl`. `gh`-preflight loudness (never silent, non-blocking dual-lane signal) lives in `.claude/hooks/bkit-cloud-bootstrap.sh`.

The Close Workflow adds two more rows, both transport-agnostic: `transport-fallback` (one per gh→MCP transition, bounded max 1/run; `bkit prs transport-row --kind=fallback`) and `close-transport`. The row records the shape that ran, the landed SHA, and the `bkit prs scan-body` post-close skip-token result; `--kind=close`. `bkit prs cross-check` fails an `mcp` close that recorded `runtimeGithubCli=false` but no fallback row. Row shapes → `.bkit/workflows.md` § `status.jsonl`.

## gh→MCP fallback lane + peripheral loudness

Every phase workflow header (`bkit-{design,plan,build,debug,ship}.md`) carries an additive **gh→MCP fallback** rule (Flow 6): when a gh command on the PR / CI / merge surface is unavailable (`runtimeGithubCli=false` on the `runtime-resolved` row) or a `bkit` command exits 80, the agent uses the mapped MCP tool instead (`actions_list` / `actions_get` / `get_job_logs` / `download_workflow_run_artifact` require the `actions` MCP toolset, C1) — bounded to max 1 transition per run, recorded via `bkit prs transport-row --kind=fallback`, success-asserted by an independent re-read, with empty / zero MCP reads treated as INCONCLUSIVE (never authoritative absence) per D12. Trackers stay on MCP always (§6i), because the rule covers only the gh-covered surface.

`/bkit-debug`'s `context-fetch` narration (Step "Fetch Context") distinguishes `CHECKED` / `SELF-SKIPPED` / `NOT CONFIGURED` per block, every attempt — a self-skip `exit 0` is never read as "no errors"; it is logged as unavailable, not clean. A self-skip `exit 0` comes from missing CLI / token, or a host blocked by the cloud Trusted-egress allowlist (`.agents/context.md` § Allowed domains). The same rule covers every context, so an absent CI or e2e artifact is "we did not look", never "CI was green": context coverage is narrated before any fetch runs (`bkit context list-blocks`) and persisted as `contextsConfigured` on the `context-fetch` status row (`bkit context finalise`), and `bkit-debug-failure-diagnose` is required to separate NOT CONFIGURED / self-skipped / actually-checked before drawing a conclusion. `context-fetch-context-missing` advises when an enabled consumer section covers only some contexts. Every machine-generated evidence artifact (`context-{ci,diff,e2e,runtime,web}-*`, `context-tests-local-*`, build's `build-subplan-gate-*`, plan's `related-deferrals.md` / `related-failures.md`) passes through `bkit context clamp` — capped in shell, footered when it truncates, and recorded as `clamped` on the step's `step-done` row with original and kept sizes (row shape + profile table → `.bkit/workflows.md` § Context artifact clamping). The tracker sweep artifacts (`related-issues.md`, `context-related-*`) are uncapped by decision. The narration half carries no automated assertion — verified manually (run `/bkit-debug` in a `RUNTIME_WORKTREES=false` runtime, confirm the loud narration) per the honest limit D3.
