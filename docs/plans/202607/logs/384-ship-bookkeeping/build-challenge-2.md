Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Build Challenge — Security Lens

Lens: Security — auth, secrets, input validation, data exposure, OWASP, RLS / tenancy. Diff scope: `origin/dev..HEAD` for `384-ship-bookkeeping` (ship workflow restructure into Path A/B shape with merge gate). 84 files, +8291/-1273. Reviewed in full against the seven focus vectors.

## Findings Log

- **F1 — MEDIUM (mechanical):** `.bkit/scripts/bkit-ship-gate.sh:146-154` — `BKIT_SHIP_GATE_OVERRIDE` audit-trail integrity weakened. `local status="$STATUS_PATH"` under `set -euo pipefail` crashes when STATUS_PATH unset (verified — fails safe at exit 1 but breaks the documented escape hatch in production; the workflow's Step 6 gate call never exports STATUS_PATH). The audit-row write `>> "$status" 2>/dev/null || true` is silenced: if STATUS_PATH is set but unwritable, the override grants exit 0 with NO audit row, defeating the documented rollback audit (`docs/deployments.md` § Ship gate + bookkeeping step 3). Fix: `local status="${STATUS_PATH:-}"`; drop the silence / write to a fallback; export STATUS_PATH in Step 6 sub-step 4.
- **F2 — LOW (informational, mechanical):** `tests/fixtures/gh/bin/gh:90-94` — SHA extracted from URL flows unsanitized into `$RUNS_DIR/$SHA.json` (path-traversal risk if SHA contains `../`). Test-only, never shipped; flagged as a copy-paste hazard. Fix: assert `[[ "$SHA" =~ ^[A-Za-z0-9._-]+$ ]]` before path construction.

## Verdict Rationale

Diff scope: `origin/dev..HEAD` for `384-ship-bookkeeping` — 84 files, +8291/-1273. Reviewed in full against the seven focus vectors. No CRITICAL findings. One MEDIUM finding on the override audit-trail integrity; one LOW informational on the test stub. The merge gate, force-push scoping, gh stub harness, status.jsonl hygiene, sentinel design, and template markers are sound.

## Focus Vector Findings

### 1. `BKIT_SHIP_GATE_OVERRIDE` escape hatch — MEDIUM finding

**Finding F1 (MEDIUM, mechanical):** `.bkit/scripts/bkit-ship-gate.sh:146-154` — the override audit-trail integrity is weakened by two related defects.

The `maybe_override()` function references `$STATUS_PATH` unguarded under `set -euo pipefail`:

```sh
local status="$STATUS_PATH"   # line 146 — crashes if STATUS_PATH unset
```

Verified empirically: with `BKIT_SHIP_GATE_OVERRIDE=failed` and `STATUS_PATH` unset, the script crashes at line 146 with `STATUS_PATH: unbound variable` and exits 1 (NOT 0) — the override does NOT grant exit 0. This is **fail-safe** (no merge bypass) but **breaks the documented escape hatch in production**: the workflow's Step 6 sub-step 4 calls `bash "$GATE_SH" assert --head "$GATE_HEAD" --repo "{OWNER_REPO}"` and never exports `STATUS_PATH` (confirmed: only the bats tests at `tests/ship-gate.bats:175` export it). So the override is only usable from tests, never from the workflow.

The audit-row write itself is silenced:

```sh
jq -nc ... >> "$status" 2>/dev/null || true   # line 153
```

If `STATUS_PATH` is set but unwritable (e.g. an operator or compromised workflow sets `STATUS_PATH=/dev/null` or a permission-denied path), the override grants `exit 0` with **NO audit row**. `docs/deployments.md` § Ship gate + bookkeeping step 3 makes the audit row load-bearing: "Audit any `BKIT_SHIP_GATE_OVERRIDE` rows... treat every row as a PR whose capstone was NOT green at the merged head." A silenced write defeats that rollback audit.

- **Exploit scenario:** an operator (or a workflow compromised via prose edit) sets `BKIT_SHIP_GATE_OVERRIDE=<refused-head>` plus `STATUS_PATH` to an unwritable path → the gate returns exit 0 → Step 6 merges → the `type:"ship-gate-override"` audit row never lands → the documented rollback grep (`grep "ship-gate-override" status.jsonl`) misses it. The escape hatch is "trust the caller + audit row"; the silence breaks the audit half.
- **Suggested fix:** (a) `local status="${STATUS_PATH:-}"` to remove the `set -u` crash; (b) drop `2>/dev/null || true` on the audit write — write to a fallback (`stderr` or a sibling `.ship-gate-override.log`) when `$status` is unset/unwritable so the override is NEVER invisible; (c) in `bkit-ship.md` Step 6 sub-step 4, export `STATUS_PATH="$STATUS"` before invoking the gate so the override works as documented.
- **Class:** mechanical (surgical edit, no redesign — the override model is unchanged).

### 2. gh stub harness — PASS (no token leak, not shipped)

`tests/fixtures/gh/bin/gh` is a pure local-fixture dispatcher: it reads JSON files under `tests/fixtures/gh/{runs,jobs,ratelimit}/` based on the URL's SHA/ID. It never invokes any network call, never reads `GH_TOKEN`/`GH_ENTERPRISE_TOKEN`/`GH_BKIT_TOKEN*`/`.env*`, and its `gh auth status` branch is a deliberate exit-1 fallback. Confirmed not shipped to consumers: the install manifest in `.bkit/version` lists only `.bkit/scripts/`, `.claude/`, `.cursor/`, `.opencode/` paths — `tests/` is repo-local to bkit itself. The PATH-shim is applied only inside bats `setup()` blocks (`tests/fixtures/gh/smoke.bats:11`, `tests/ship-gate.bats:28`); no production path prepends `tests/fixtures/gh/bin`.

**Finding F2 (LOW, informational, mechanical):** `tests/fixtures/gh/bin/gh:90-94` — the SHA extracted from the URL (`SHA="${URL##*\?head_sha=}"; SHA="${SHA%%&*}"`) flows unsanitized into `F="$RUNS_DIR/$SHA.json"`. A SHA containing `../` would path-traverse out of `RUNS_DIR`. Test-only (the stub is never shipped and SHAs are controlled fixture names), but flagged in case the dispatch pattern is copy-pasted into production code. Suggested fix: assert `[[ "$SHA" =~ ^[A-Za-z0-9._-]+$ ]]` before path construction.

### 3. status.jsonl writes — PASS (no PII, no secrets, properly escaped)

Every status write uses `jq -nc --arg ... --argjson ...`, so all interpolation flows through jq's string-safe `--arg` (no JSON injection, no shell metacharacter risk). Confirmed by grepping the workflow for `>> "$STATUS"` — every match is `jq -nc`-shaped. Content is pure workflow telemetry: git SHAs (`parentSha`), ISO timestamps, verdict strings (`PASS|FAIL|CONCERNS`), integer attempt/failure counts, artifact paths under `docs/plans/{YYYYMM}/logs/{FID}/`. No user PII, no tokens, no consumer-repo content. The `assertedBy:"bkit-ship-gate.sh"` value is a literal. The `bkit-status-hole-detector.ts` parser uses `JSON.parse(line)` in try/catch (advisory, fail-open) — malformed rows are skipped, never crash. Paths derive from `BOOK_ROOT` + allowlisted `{FID}` (workflow asserts `^[0-9]+-[a-z0-9-]+$` at Step 1 sub-step 7), so path traversal via FID is blocked at the workflow layer.

### 4. Merge gate's CI assertion — PASS (sound, residual risk documented)

The gate is structurally strong: (a) workflow-scoped run query (`/actions/workflows/$WORKFLOW/runs`) — not repo-wide, so an unrelated workflow's green cannot satisfy it; (b) exact-head validation (`SELECTED_HEAD_SHA != HEAD_SHA → code 14`) — a stale-green at a superseded SHA is refused; (c) capstone job resolved by name with `conclusion=success` required; (d) vacuous-green detection (code 16) catches lanes that concluded `skipped` without a cache marker; (e) the cache-skip sentinel is step-name-keyed to the exact commit SHA (sound). The merge call carries `--match-head-commit "$GATE_HEAD"` so the server refuses if the head drifts between gate and merge (TOCTOU-safe). The `[skip ci]` PR-title assertion (Step 6 sub-step 3) blocks the KN-11 vacuous-empty-rollup vector. Residual risk (a `workflow_dispatch` run with custom inputs bypassing lanes, or a degraded-but-not-skipped lane) is explicitly named as uncovered in `docs/deployments.md` § Consumer CI contract — accepted, not a finding.

### 5. Force-push in Path B2 — PASS (scoped to personal branch)

Step 4 B2's push is hardcoded to the literal `feat/{FID}`: `git push --force-with-lease origin "feat/{FID}"` (line 466). `{FID}` is asserted to match `^[0-9]+-[a-z0-9-]+$` at Step 1 sub-step 7 (no `/`, `.`, `..`, or shell metacharacters). The workflow's Git directive (line 32) prohibits bare `git push --force` and ANY force-push to `dev`/`main`, and the Step 2 sub-step 3 branch-eligibility check refuses branches that don't contain `{FID}`/`{ISSUE_ID}`. The Tier-2 invariant at `.bkit/src/bkit-ship-invariants.test.ts:115-144` asserts no `git commit`/`git push` to `feat/{FID}` outside the B2 conflict-resolve block (GREEN). No path can reach `--force-with-lease` against `dev`/`main` from this workflow.

### 6. `.deferred-blocked` sentinel — PASS (low-impact routing only)

The sentinel is written only by Step 5 sub-step 7 (`touch "$BOOK_ROOT/.../.deferred-blocked"` on sweep FAIL) and read only by Failure Path step 4 to choose between `@bkit-debug-abort-handover` (step 5) and STOP (step 12). Manipulating it (touch or rm) changes only the handover-vs-stop routing inside the Failure Path — neither route bypasses the merge gate, the capstone check, or branch protection. The Tier-2 invariant at `.bkit/src/bkit-ship-invariants.test.ts:294-319` asserts the writer exists and resolves under `BOOK_ROOT` (GREEN), and `tests/ship-failure-path.bats:79-87` asserts the Failure Path does NOT `rm -f` it (reader preserved). No security impact.

### 7. Template/mirror rendering — PASS (no injection)

The `<!-- bkit:tracker {github|linear|true|false} {start|end} -->` markers are static literals rendered by `bkit install` — no user input flows through them. The `{OWNER}`, `{REPO}`, `{ISSUE_ID}`, `{FID}`, `{YYYYMM}` placeholders are filled by the agent at runtime from trusted sources: OWNER/REPO from `gh repo view --json nameWithOwner` (Step 1 sub-step 2), ISSUE_ID from the session prompt (numeric), FID allowlisted, YYYYMM from directory listing. MCP tool-call bodies are emitted as JSON object literals in the prose (the agent constructs the actual call), so even if a placeholder held a malicious value it would be JSON-escaped by the MCP transport — no shell surface. The mirror hash updates in `.bkit/version` for `.claude/commands/bkit-ship.md`, `.cursor/commands/bkit-ship.md`, `.opencode/commands/bkit-ship.md` confirm the rendered mirrors are byte-identical to the source `bkit-ship.md`.

## Additional Observations (no findings)

- **`execFileSync` discipline:** the new `bkit-config-keys.test.ts` uses `execFileSync("jq", [...args])` per `docs/security.md` § Shell Injection — no interpolated `execSync`. Clean.
- **No secrets in diff:** grepped for `gh[po]_`, `github_pat_`, `sk-`, `Bearer ` — no matches in the diff.
- **`.dev.lock` write:** uses `set -C` (no-clobber) with mtime-based stale reclaim; content is `{FID}` (allowlisted) + timestamp. No injection.
- **Step 13 telemetry:** computes linesAdded/linesDeleted/filesChanged from `git diff --shortstat` — no PII, no consumer-repo content (counts only).
- **`bkit-protect-main.sh` capstone resolution:** now reads `bkit.capstoneJob` from `package.json` via `jq -r '.bkit.capstoneJob // "bkit-tests-check"'` — shares one source of truth with the gate. The `jq` invocation is safe (constant filter, no interpolation). Falls back to the bkit default when package.json is absent/unreadable.
- **Pre-push husky hook:** adds `pnpm test:bats` to the gate. The template version guards on `command -v bats`; the root version doesn't (bkit-repo assumes bats present). Portability concern, not security.
