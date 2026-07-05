<!-- Child sub-plan 1 of 3. Source: plan-v3-checked.md. {YYYYMM} = 202605. -->

# bkit-cloud rebuild on the Claude GitHub App — Child 1: Block 1 (D1 + cloud-module split + enforcement + advisory flip)

**Parent Plan:** [`plan-v4-split.md`](./plan-v4-split.md)

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read this actual file natively via the `read_file` tool _before_ executing any steps.
> 2. NEVER trust system-generated session summaries or previous conversation history.
> 3. Your source of truth is EXCLUSIVELY the literal `[x]` vs `[ ]` checkboxes in this physical document. If a box is `[ ]`, it is NOT DONE.

## ⛔ Land-Together Constraint (READ FIRST)

> [!CAUTION]
> **This child is ONE of THREE execution units on a SINGLE feature branch / single squashed PR — NOT an independent merge.** Completing this child does NOT mean "ship Block 1." All three children ([`plan-v4-1.md`](./plan-v4-1.md), [`plan-v4-2.md`](./plan-v4-2.md), [`plan-v4-3.md`](./plan-v4-3.md)) **plus #184** land together in one squashed PR (`bkit-ship.md` → `gh pr merge --squash`). A builder MUST NOT merge a partial change. See the [parent index](./plan-v4-split.md) § Land-Together Constraint.

## Position in Sequence

- **This is child 1 of 3 — execute FIRST.**
- **Downstream:** [`plan-v4-2.md`](./plan-v4-2.md) (Block 2 + 3) depends on this child's `bkit-cloud.yml` template/render edits (the two-tier gate + concurrency key in child 2 edit the same template that T1.1–T1.3 establish here). The cloud-module split (T1.5) MUST precede tracker/cloud enforcement and the YAML gate.
- **Blocking prerequisite:** Gate 1 below (two human confirmations + #184 coordination + preflight) MUST be cleared before T1.1.

## Context & Goals

bkit's cloud-agent capability on GitHub-tracker repos has never run end-to-end: a live dispatch proved `claude-code-action@v1` cannot boot because `bkit-cloud.yml` lacks `id-token: write` and was designed to lean on `github.token` instead of the Claude GitHub App (D1). The same live trace surfaced two more defects — bookkeeping commits without `[skip ci]` fire the CI auto-router mid-build (D2), and an incoherent concurrency key lets a dispatched build race the auto-ship it triggers (D3). The authoritative FINAL SCOPE comment (#141 `issuecomment-4542046671`) rebuilds the whole capability **on** the Claude GitHub App (OIDC identity) rather than around it, splits the opt-in `cloud` module into `cloud=claude` / `cloud=cursor` variants constrained by tracker, moves the CI auto-route gate into a two-tier YAML guard (`bkit [auto route]` marker + in-job `bkit:auto` re-check), and migrates Linear's bare `Auto` label to `bkit:auto`. This change MUST land together with #184's single shared HEAD-subject assertion.

**This child (Block 1) delivers:** D1 fix (`id-token: write` + App-auth framing) on the `bkit-cloud.yml` template + rendered copy, the `renderCloudWorkflow` Linear-branch deletion (GitHub-only render), the `--cloud=claude|cursor` value-bearing flag + `--force`, the `runCloudModule` variant split + `bkit.cloud` field + manifest split, the symmetric tracker/cloud constraint + tracker-switch hard-block, the `bkit-cloud-setup` advisory flip (App optional→required) + `Auto`→`bkit:auto` advisory text, the `bkit check` consistency assertion, the `bkit-postinstall.ts` Linear-coupling reconciliation, dry-run parity for both variants, and the `advisories.md` regen.

**Success Criteria (this child):**

- `cloud=claude` requires `tracker=github` and `cloud=cursor` requires `tracker=linear` (symmetric hard-error on mismatch); switching an established tracker hard-blocks without `--force`; all driven off `package.json` recorded state.
- `bkit-cloud.yml` renders GitHub-only with `id-token: write` and no `github.token`-handles-everything framing; `renderCloudWorkflow` has no Linear branch.
- The `bkit-cloud-setup` advisory states the App + `/install-github-app` are required; no bare `Auto` survives in advisory text; `bkit check` flags `cloud=claude` config inconsistency.

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> This is the testable contract for the feature. Everything below — implementation, tests, verification — is derived from what you confirm here. If this is wrong, everything downstream is wrong.
>
> **You do NOT need to read the rest of this plan.** Focus here. The agent handles the rest.

### Spec — what good looks like

> [!IMPORTANT]
> Standalone plan (no `{FID}-design.md`). The FINAL SCOPE comment is the authoritative source. Narrative + Success Criteria are derived directly from it (not from a design doc), then expanded with plan-level edge cases, a concrete example, and a derived test matrix.

> [!NOTE]
> The Acceptance Scenario, Breaking Changes, Concrete Example, Edge Cases, and the FULL Derived Test Matrix below cover the ENTIRE feature (all three children), because they are the single testable contract for the whole coherent change. They are carried in this first child because Gate 1 (the human-confirmation gate) gates the first build block. Children 2 and 3 reference this section.

### Narrative

A bkit consumer on a GitHub-tracker repo runs `bkit install --cloud=claude`, installs the Claude GitHub App once (`/install-github-app`, which generates their own App-owned `claude.yml`), and labels an issue `bkit:auto`. From then on, `@claude /bkit-<phase>` comments launch design/plan/build (and manual ship/debug) as the App — via the consumer's App-generated `claude.yml`, not a bkit-shipped one (DECISION-B) — while a green/red CI run auto-routes to ship/debug through bkit's `bkit-cloud.yml` — but only for commits carrying `bkit [auto route]` and only while the linked issue still carries `bkit:auto`, with no runner minutes burned otherwise.

### Success Criteria

- `claude-code-action@v1` authenticates as the Claude App (`id-token: write` granted + App installed); a live dispatch reaches a Claude turn (standing runtime-verification item, human-gated post-merge).
- `cloud=claude` requires `tracker=github`; `cloud=cursor` requires `tracker=linear`; mismatch hard-errors symmetrically; first tracker-set is free, switching an established tracker hard-blocks without `--force` — all from `package.json` recorded state.
- CI auto-route fires only for commits carrying `bkit [auto route]` (zero runner minutes otherwise) and only while the linked issue still carries `bkit:auto` (live kill switch).
- `worktree-setup` / `create-pr` commits carry `bkit [skip ci]`; only the close-workflow commit (and the debug re-trigger commit) are loud and carry `bkit [auto route]`; #184's shared HEAD-subject assertion owns the contract and treats `bkit [auto route]` as legitimate.
- Linear bare `Auto` is migrated to `bkit:auto` across preflight hooks + tracker snippets; `bkit-cloud.yml` is GitHub-only (vestigial Linear render branch removed); all tests green.

### Concrete Example

**Setup:** A consumer repo with `bkit.issueTracker = "github"`. Maintainer runs `bkit install --cloud=claude`, sets the `ANTHROPIC_API_KEY` repo secret, and runs `/install-github-app` once. Issue #50 carries `bkit:auto`.

**Steps:**

1. Maintainer comments `@claude /bkit-build 50` on issue #50 → the consumer's App-generated `claude.yml` fires (NOT bkit-shipped — DECISION-B), `claude-code-action@v1` authenticates as the App (via `claude_code_oauth_token` on that path — DECISION-A), runs `/bkit-build 50` → bkit-build runs, pushing `chore(50-…): worktree-setup bkit [skip ci]` and `chore(50-…): create-pr bkit [skip ci]` (no CI fired by these), then a loud `chore(50-…): close-workflow … bkit [auto route]` as the trailing HEAD.
2. CI runs on the close-workflow push (HEAD has no `[skip ci]`) → `bkit-cloud.yml` `workflow_run` fires → free-tier `if:` sees `bkit [auto route]` in the head commit → job runs → in-job `gh issue view 50 --json labels` confirms `bkit:auto` still present → dispatches `/bkit-cloud ship 102` as the App.
3. Maintainer removes `bkit:auto` from issue #50 mid-flight → next CI completion: free-tier `if:` still matches the marker, but the in-job re-check finds no `bkit:auto` → no-op exit (live kill switch).

**Outcome:** Auto-routing fires exactly once per intended trigger, never on `[skip ci]` bookkeeping commits, never when the issue is un-opted-in, and the dispatched build and the ship it triggers share one concurrency group so they cannot race.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| `worktree-setup` / `create-pr` commit on a re-build with an open PR | Commit carries `bkit [skip ci]` → no `pull_request` synchronize CI → router does NOT fire mid-build (D2 fixed) |
| Commit without `bkit [auto route]` triggers CI | Free-tier `if:` evaluates false → job skipped → zero runner minutes |
| Commit has `bkit [auto route]` but issue lost `bkit:auto` | Job runs (cheap tier), in-job `gh issue view` finds no `bkit:auto` → no-op exit 0 |
| Dispatched build still running when its CI completes | Both surfaces resolve to one FID-derived concurrency token → `cancel-in-progress` serialises them (D3 fixed) |
| `bkit install --cloud=claude` on a `tracker=linear` repo | Hard error (symmetric tracker/cloud constraint), no files written |
| `bkit install --cloud=cursor` on a `tracker=github` repo | Hard error (symmetric tracker/cloud constraint), no files written |
| `bkit install --tracker=linear` when `bkit.issueTracker` is already `github` | Hard-block with explicit message; requires `--force` to override; first-set (no recorded tracker) is free |
| `cloud=claude` recorded but workflow lacks `id-token` / advisory missing | `bkit check` flags config inconsistency (exit 1) |
| `@claude` bare issue assignment (no typed command) | NOT a phase carrier — no phase dispatched (assignment out of scope as a trigger) |
| Consumer wants `@claude /bkit-<phase>` on their own repo | They run `/install-github-app` once → the App generates their own `claude.yml` (fires on any `@claude` comment, passes the typed command through). bkit ships NO `claude.yml` template (DECISION-B); the `bkit-cloud-setup` advisory directs them to `/install-github-app`. |
| Debug re-trigger commit | Stays loud (no `[skip ci]`) AND carries `bkit [auto route]` so the marked commit is HEAD at CI time |
| `bkit [auto route]` token on HEAD when #184 assertion runs | Treated as a legitimate HEAD token, NOT a skip tag — assertion passes |

### Derived Test Matrix (FULL — all children)

> Each row → one Agent Execution Runbook task across the three children. Rows owned by this child (Block 1) are marked **[C1]**; rows owned by child 2 (Block 2/3) are marked **[C2]**; rows owned by child 3 (Block 4) are marked **[C3]**.

<!-- prettier-ignore -->
| Test description | Type | Target file | Owner |
| --- | --- | --- | --- |
| `cloud=claude` renders `bkit-cloud.yml` with `id-token: write` + no Linear branch + no `github.token`-handles-everything framing | Unit (Vitest) | `.agents/scripts/bkit-modules.integration.test.ts` | **[C1]** T1.2/T1.3 |
| `renderCloudWorkflow` accepts only `cloud=claude`/`github` shape; Linear render branch removed | Unit (Vitest) | `.agents/scripts/bkit-modules.integration.test.ts` | **[C1]** T1.2 |
| `--cloud=claude` requires `tracker=github`; `--cloud=cursor` requires `tracker=linear`; mismatch hard-errors symmetrically | Unit (Vitest) | `.agents/scripts/bkit-cli.test.ts` (+ install enforcement test) | **[C1]** T1.4/T1.6 |
| Switching an established tracker hard-blocks without `--force`; first-set is free | Integration (Vitest) | `.agents/scripts/bkit-modules.integration.test.ts` (or install-level test) | **[C1]** T1.6 |
| `cloud=cursor` ships `.cursor/Dockerfile` + `environment.json`; `cloud=claude` does not orphan Cursor config | Unit (Vitest) | `.agents/scripts/bkit-modules.integration.test.ts` | **[C1]** T1.5 |
| `bkit-cloud-setup` advisory states App + `/install-github-app` required (optional→required); `github.token`-only framing deleted; no bare `Auto` in advisory text | Unit (Vitest) | `.agents/scripts/bkit-modules.integration.test.ts` | **[C1]** T1.7 |
| `bkit-postinstall.ts` cloud advisories no longer couple `LINEAR_API_KEY` to `bkit-cloud.yml`; GitHub-only secret set for `cloud=claude` | Unit (Vitest) | `.agents/scripts/bkit-postinstall.ts` test / `bkit-modules.integration.test.ts` | **[C1]** T1.9 |
| `bkit check` asserts `cloud=claude` config consistency (workflow has `id-token`, `ANTHROPIC_API_KEY` note, App advisory surfaced) | Integration (Vitest) | `.agents/scripts/bkit-modules.integration.test.ts` / doctor test | **[C1]** T1.8 |
| Two-tier CI gate: job skipped without `bkit [auto route]` (negative) AND fires-to-dispatch when marked-commit-is-HEAD + `bkit:auto` present (positive); in-job `bkit:auto` re-check kill switch; `{ISSUE}` via SHARED-DERIV | Manual/YAML review + render/grep assertion (no unit harness for GHA `if:`) | `.github/workflows/bkit-cloud.yml` + template | **[C2]** T2.7 |
| Concurrency key reconciled to one FID-derived token across dispatch + CI surfaces | Unit (Vitest, render assertion) | `.agents/scripts/bkit-modules.integration.test.ts` | **[C2]** T3.1 |
| `worktree-setup` / `create-pr` carry `bkit [skip ci]`; close-workflow + debug re-trigger are loud + marked | Doc/workflow review (no executable test) | `.agents/workflows/bkit-build.md`, `.agents/workflows/bkit-debug.md` | **[C2]** T2.2/T2.3/T2.4 |
| `Auto` → `bkit:auto` migrated in preflight hooks | Integration (Vitest, rendered-file assertion via real tool path) | preflight render / `bkit-modules.integration.test.ts` | **[C3]** T4.2 |
| Dry-run parity for `cloud=claude` and `cloud=cursor` | Integration (Vitest) | `.agents/scripts/bkit-dry-run-parity.integration.test.ts` | **[C1]** T1.10 |
| Manifest entries for `cloud=claude` vs `cloud=cursor` variants | Unit (Vitest) | `.agents/scripts/bkit-manifest.test.ts` (existing suite) | **[C1]** T1.5 |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> Review proposed names and breaking changes below.

> [!WARNING]
> **Consumer-facing breaking changes (bkit consumers on GitHub-tracker repos):**
>
> 1. **The Claude GitHub App becomes a base requirement** for `cloud=claude` (was optional "path E"). Consumers who installed `--cloud` and relied on `github.token` must now run `/install-github-app` once. Without it, `claude-code-action@v1` fails at boot with the OIDC error. This is surfaced in the `bkit-cloud-setup` advisory and `bkit check`.
> 2. **`--cloud` flag value is now mandatory and explicit:** `--cloud=claude` or `--cloud=cursor` (no bare `--cloud`, not auto-derived from tracker). Any script/CI invoking `bkit install --cloud` must update.
> 3. **Switching an established issue tracker now hard-blocks** without `--force`. First-set remains free. Reversing a previously silent `linear↔github` flip now errors loudly.
> 4. **`bkit-cloud.yml` no longer renders a Linear branch.** A `tracker=linear` repo that opted into the old `--cloud` workflow no longer gets a Linear-flavoured `bkit-cloud.yml`; Linear cloud routing is Cursor-native (`cloud=cursor` → `.cursor/` scaffolding).
> 5. **Linear bare `Auto` label renamed to `bkit:auto`** in shipped preflight hooks. Consumers on Linear must relabel issues (or the migration advisory must direct them).

> [!IMPORTANT]
> **New names / fields:**
>
> - New CLI value: `--cloud=claude|cursor` (replaces bare `--cloud`).
> - New `package.json` field: **`bkit.cloud` (`"claude" | "cursor"`)** recording the cloud variant — distinct from the existing `bkit.cloudAgents` ("enabled"/"none") presence signal. **LOCKED (DECISION-C):** field name is `bkit.cloud`; `bkit.cloudAgents` keeps its presence-signal meaning so `runPostInstallCheck` (reads `cloudAgents`) is unaffected. FINAL SCOPE decision 4 calls it the "new cloud-variant field"; this resolves it. Human may override at Gate 1, but the runbook assumes `bkit.cloud` and does not branch.
> - New commit marker: `bkit [auto route]` (literal, `bkit` outside the brackets, direction-neutral; mirrors `bkit [skip ci]`).
> - New workflow grant: `id-token: write` in `bkit-cloud.yml`.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## Decisions (A–E, all LOCKED — full text in [parent index](./plan-v4-split.md))

This child acts on **DECISION-A** (T1.1/T1.7 — keep `bkit-cloud.yml` on `ANTHROPIC_API_KEY`+OIDC; do NOT migrate to/from `claude_code_oauth_token`), **DECISION-B** (T1.7 advisory directs consumers to `/install-github-app`; no shipped `claude.yml` template), **DECISION-C** (T1.5/T1.8 — `bkit.cloud` field, distinct from `bkit.cloudAgents`), and **DECISION-D** (T1.5 — manifest split so uninstall removes only the recorded variant's files). DECISION-E acts in child 2. Human may override A–E only at Gate 1; the runbook assumes the locked defaults and does NOT branch.

## Supersession Inventory (FULL — carried in this child; rows acted on by all children)

> [!CAUTION]
> Each `DELETE` row is mirrored in `Architecture & Component Changes` and as a removal task in the relevant child's `Agent Execution Runbook`. Rows owned by this child marked **[C1]**; child 3 marked **[C3]**.

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification | Owner |
| --- | --- | --- | --- | --- |
| `renderCloudWorkflow` Linear render branch (`isLinear` mcp/secret substitution) `.agents/scripts/bkit-modules.ts:1910-1921` | GitHub-only render (drop `@@CLOUD_TRACKER_*@@` Linear paths; add `id-token`) | DELETE | `bkit-cloud.yml` is GitHub-tracker-only; the Linear branch is vestigial (FINAL SCOPE "Vestigial Linear branch removed"). | **[C1]** T1.2 |
| `bkit-cloud.yml:23-25` "`github.token` handles all repo git/gh; no App" rationale (canonical + template; line 22 is the tracker-conditional sentence, framing is 23-25 per R3) | App-auth framing (`id-token: write` + App required) | DELETE | FINAL SCOPE decision 1: delete the framing; commits/PRs/comments appear as the App. | **[C1]** T1.1 |
| `bkit-modules.ts:2075` "Do NOT add `GH_BKIT_TOKEN_INSTALL` … github.token" advisory line | App-required advisory text | DELETE | Same as above; advisory must state App + `/install-github-app` required (decision 2). | **[C1]** T1.7 |
| Bare `Auto` label in `.agents/templates/.claude/hooks/preflight.sh:8,109-111` + `.agents/templates/.cursor/hooks/preflight.sh:8,96-98` | `bkit:auto` | DELETE | Label convention: `bkit:` prefix on every tracker (FINAL SCOPE Labels row; migrate bare `Auto`). | **[C3]** T4.2 |
| Bare `Auto` in `bkit-modules.ts` advisory text — `bkit-cloud-setup` strings at `:2051` ("reads the `Auto` opt-in label"), `:2054` ("labelled `Auto` in Linear"), `:2055` ("carries the `Auto` label") | `bkit:auto` (fix-in-place) OR removed-with-branch | DELETE | R3-2: consumer-facing advisory shipped by bkit must say `bkit:auto` for consistency with the migrated hooks that check `bkit:auto`. These live in the `isLinearCloud` branch — reconcile with the cloud-split (cursor=linear): if the split removes the branch wholesale, the strings go with it; otherwise fix them in place. Either way they MUST NOT survive saying bare `Auto`. | **[C1]** T1.7 |
| Bare `--cloud` flag (value-less) `.agents/scripts/bkit-cli.ts` | `--cloud=claude\|cursor` value-bearing flag | DELETE | FINAL SCOPE decision 3: explicit variant, tracker-constrained. | **[C1]** T1.4 |
| `bkit-postinstall.ts` `tracker==="linear"` → `LINEAR_API_KEY`-in-`bkit-cloud.yml` coupling in `buildCloudSetupAdvisory` (`:803`), `buildCloudDashboardsAdvisory` (`:849`), `buildCloudSecretsAdvisory` (`:895`) | GitHub-only secret set for `cloud=claude`/`tracker=github`; `LINEAR_API_KEY`/`.cursor` guidance moves to the `cloud=cursor`/`tracker=linear` path | DELETE | Decision 1 / "Vestigial Linear branch removed; `bkit-cloud.yml` is GitHub-only" — a Linear `bkit-cloud.yml` can no longer exist, so these three branches describe an impossible state and `buildCloudSecretsAdvisory` would tell a mis-recorded consumer to set a `LINEAR_API_KEY` the GitHub-only workflow never reads (downstream-reader regression). Removed by T1.9. | **[C1]** T1.9 |

## Security & Privacy

> bkit is a tooling repo, not the app-gether-life app — the template's API-route/RLS/Zod rows do not apply. Relevant rows:

- [x] **Webhook / event trigger** — `bkit-cloud.yml` `workflow_run` and `claude.yml` `issue_comment` are GitHub-native events; the two-tier gate (`bkit [auto route]` marker + in-job `bkit:auto` re-check) is the trust boundary. No raw webhook secret to verify (GitHub signs events).
- [x] **New secret/env var** — `ANTHROPIC_API_KEY` (existing) is the only required secret; `id-token: write` is an OIDC grant, not a stored secret. No new stored secret. `GH_BKIT_TOKEN_INSTALL` must NOT be added to `bkit-cloud.yml` (package-install scoped, no consumer-repo access).
- [x] **Auth model** — On the CI auto-route path (`bkit-cloud.yml`), `claude-code-action@v1` authenticates as the Claude App via OIDC (federated, `id-token: write`) + `ANTHROPIC_API_KEY` (LLM). On the `@claude` mention path (`claude.yml`), it authenticates via `claude_code_oauth_token` + `id-token: write`. **Two distinct token surfaces, same App identity — intentional, not to be reconciled (DECISION-A).** Confirm each `permissions:` block grants `id-token: write` and no broader scope than needed.

_No new API routes, DB writes, or user-input schemas — bkit ships workflow + CLI + docs only._

## 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Abort if anything required is missing.

### Core (always verify)

- [ ] **Package Management:** No new npm deps expected (CLI + YAML + docs only). Verify `pnpm-lock.yaml` syncs cleanly after edits to `.agents/scripts/*.ts`.
- [ ] **Dependency Versions:** Spot-check `claude-code-action@v1` tag pin in both `bkit-cloud.yml` and `claude.yml`; `actions/checkout@v4`. Confirm `vale 3.9.1` / `pnpm 10.33.0` references in `cloud.md` unchanged.
- [ ] **User Context:** Verify read/write to `.agents/scripts/`, `.agents/workflows/`, `.agents/templates/`, `.github/workflows/`, `.agents/cloud.md`, `.agents/trackers.md`, `docs/`.
- [ ] **Pending Blockers:** Confirm **#184** state and land it on the same branch (shared HEAD-subject assertion is a hard dependency — see Prerequisite Plans). Check `docs/pending.md` for related deferrals.
- [ ] **Project Context:** Read `docs/knowledge.md` KN-11 (`[skip ci]` HEAD → empty rollup) + KN-23 (CI is the only quality gate); `docs/deployments.md` § "CI trigger on final workflow push" (the existing commit-tag contract that #184 formalises and D2 implements); `docs/decisions.md`.
- [ ] **Testing & Quality:** Align with bkit's Vitest suites (`bkit-modules.integration.test.ts`, `bkit-dry-run-parity.integration.test.ts`, `bkit-doctor.integration.test.ts`, `bkit-cli.test.ts`). Validate shipped config with the real tool/resolver, never string-presence-only (per repo memory).
- [ ] **Prerequisite Plans:** **#184** (shared HEAD-subject assertion) — MUST land together on this branch. No separate prior plan to execute; coordinate the two in one PR. **Resolve #184's exact assertion shape from its tracker issue (GitHub issue #184) before child 2's T2.1** so the builder does not re-discover it; if #184 has its own plan artifact under `docs/plans/`, consult it for the snippet home + token-allowlist contract. **This resolution is a Gate-1 prerequisite carried here even though T2.1 lives in child 2.**

### Conditional (verify only when applicable)

- [ ] **Architecture & UI** _(workflow/CLI topology)_: Validate against `.agents/docs.md` Full Catalog roles (`cloud.md` = cloud env SoT; `trackers.md` = per-tracker installer snippets; `deployments.md` = CI/commit-tag rules). Keep `cloud.md`/`deployments.md`/`knowledge.md` role separation (deployments = rules, knowledge = incidents) per repo memory.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to the Agent Execution Runbook.

- [ ] **Acceptance Scenario confirmed:** Human confirmed `👤 Acceptance Scenario` section (checkbox is `[x]`).
- [ ] **Breaking Changes confirmed:** Human confirmed `⚠️ Breaking Changes & Naming Review` section (checkbox is `[x]`).
- [ ] **#184 coordination:** #184's exact shared HEAD-subject assertion shape resolved from its tracker issue (and plan artifact if present) — recorded for child 2's T2.1.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

## Data Schema Integration

None — bkit is a tooling repo with no application database. The only persisted state is `package.json` `bkit.*` fields (config, not a DB schema). Config-field changes (`bkit.cloud`) are tracked under `Architecture & Component Changes` and `Documentation Updates`.

## Architecture & Component Changes — Block 1

Grouped by FINAL-SCOPE internal-ordering block. **CRITICAL:** All `[MODIFY]` files below were verified to exist; cited line numbers were re-checked against current `dev` and differ from the FINAL-SCOPE comment's earlier-commit numbers (noted inline).

### Block 1 — D1 + App auth + cloud-module split + tracker/cloud enforcement + docs/advisory flip

#### [MODIFY] `.agents/templates/.github/workflows/bkit-cloud.yml`

- **Existence Check:** Exists (151 lines).
- Add `id-token: write` to the `permissions:` block (currently lines 67-73: contents/pull-requests/issues/actions — no id-token).
- Delete the "`github.token` handles all repo git/gh access … no App" framing (lines 23-25 of the comment header; line 22 is the tracker-conditional sentence — R3 line fix).
- Reconcile the `concurrency:` key (line 64) to a single FID-derived token across dispatch + CI surfaces (D3 — see child 2 Block 3).
- Add the two-tier CI auto-route gate (child 2 Block 2): free-tier job `if: contains(github.event.workflow_run.head_commit.message, 'bkit [auto route]')` + in-job `gh issue view {ISSUE} --json labels` re-check of `bkit:auto` (`{ISSUE}` derived per SHARED-DERIV — see child 2 two-tier-gate task). Wrap the YAML gate logic inside `bkit:start`/`bkit:end` markers (Comment 7 gate-placement rule).
- Remove the `@@CLOUD_TRACKER_*@@` Linear sentinels (workflow becomes GitHub-only).

> [!NOTE]
> In this child (Block 1), T1.1 covers ONLY the `id-token: write` add + framing delete + sentinel removal on the template. The two-tier gate and concurrency-key edits to this same file are owned by child 2 (T2.7 / T3.1) and edit the file child 1 establishes.

#### [MODIFY] `.github/workflows/bkit-cloud.yml` (this repo's rendered copy)

- **Existence Check:** Exists (150 lines — the rendered, Linear-free github variant).
- Mirror every template change above (the Block-1 portion in T1.3). This is the canonical Tier-1 file regenerated by `bkit install`; keep it byte-identical to the rendered template for `tracker=github`.

#### [MODIFY] `.agents/scripts/bkit-modules.ts`

- **Existence Check:** Exists.
- `renderCloudWorkflow` (lines 1910-1921): **DELETE** the `isLinear` branch (mcp/secret/secretEnv substitution). Render GitHub-only; ensure `id-token: write` is present in output. Decide whether `@@CLOUD_TRACKER_*@@` sentinels are removed from the template entirely (preferred) or rendered to empty.
- `runCloudModule` (lines 1923-2084): **SPLIT** into `cloud=claude` vs `cloud=cursor` behaviour:
  - `cloud=claude` → ship `bkit-cloud.yml` + `cloud-bootstrap.sh`; require `tracker=github` + App.
  - `cloud=cursor` → ship `.cursor/Dockerfile` + `environment.json`; require `tracker=linear`.
  - Record the variant via a new `bkit.cloud` field (set alongside the existing `setConsumerBkitField("cloudAgents", "enabled", …)` at line 2013).
- `bkit-cloud-setup` advisory (id at line 2064; action ~2068-2083 — FINAL SCOPE cited ~2056-2062/~2075 from an earlier commit): flip App optional→required; **DELETE** the `github.token`-only line (line 2075); state `/install-github-app` + App required. Update `mentionTipLine` (lines 2060-2062) accordingly.
- **Bare `Auto` in advisory text (R3-2):** migrate the bare `Auto` strings at `:2051` ("reads the `Auto` opt-in label"), `:2054` ("labelled `Auto` in Linear"), `:2055` ("carries the `Auto` label") → `bkit:auto`. These sit in the `isLinearCloud` branch; reconcile with the cloud-split (T1.5): if the split deletes that branch, the strings are removed with it; otherwise fix them in place. Verify no bare `Auto` remains in `bkit-modules.ts` advisory output after this task + T1.5.
- `MODULE_REGISTRY` (line 2090) + `MODULE_DISPATCH_ORDER` (line 2104): wire the `cloud` module to dispatch the correct variant based on the parsed `--cloud=` value.

#### [MODIFY] `.agents/scripts/bkit-cli.ts`

- **Existence Check:** Exists.
- Parse `--cloud=claude|cursor` as a value-bearing flag (currently bare `--cloud` is a plain `ModuleFlag` at lines 60/240; `--tracker=` value parsing pattern at lines 180-192 is the template). Reject bare `--cloud` and invalid values.
- Add `--force` parsing for tracker switching (today `--force` only sets `uninstallFlags.force`, line 200; add an install-context force path).
- Update `printUsage` (`--cloud` description at line 300, `bkit.cloudAgents` note at line 305) + help examples (line 333) to show `--cloud=claude|cursor`.
- `OPTIN_MODULES` (line 78) still contains `cloud`; ensure resolution carries the variant.

#### [MODIFY] `.agents/scripts/bkit-install.ts`

- **Existence Check:** Exists.
- Tracker-switch enforcement (around the tracker-resolution block lines 919-962): when `tracker !== null` AND a _different_ `bkit.issueTracker` is already recorded → **hard-block** unless `--force`. First-set (no recorded tracker) is free. Symmetric (linear↔github both directions).
- Cloud/tracker constraint: `--cloud=claude` requires resolved `issueTracker === "github"`; `--cloud=cursor` requires `=== "linear"`; mismatch → hard error before any module dispatch.

#### [MODIFY] `.agents/scripts/bkit-manifest.ts`

- **Existence Check:** Exists.
- `CLOUD_MANIFEST` (lines 211-221) currently lists all four files under one module. Split the manifest so `cloud=claude` owns `bkit-cloud.yml` + `cloud-bootstrap.sh` and `cloud=cursor` owns `.cursor/Dockerfile` + `environment.json` (or keep one manifest but gate file emission by variant in `runCloudModule` — choose the approach that keeps uninstall correct).
- Add a `bkit.cloud` field convention note (mirror `CloudAgents` block lines 113-138).

#### [MODIFY] `bkit check` / consistency assertion (in `bkit-install.ts` Phase-3 post-install / advisory replay, or doctor path)

- **Existence Check:** Post-install checks run for both install AND check (`bkit-install.ts` ~line 988). Add a `cloud=claude` config-consistency assertion: when `bkit.cloud === "claude"` (or `bkit-cloud.yml` present) → assert workflow has `id-token: write`, the `ANTHROPIC_API_KEY` note, and the App advisory is surfaced. Fail `bkit check` (exit 1) on inconsistency.

#### [MODIFY] `.agents/cloud.md`

- **Existence Check:** Exists.
- Matrix (line 23) + path E (line 30): flip the App from "optional / experimental" to **base requirement** for `cloud=claude`.
- § Post-CI auto-routing (lines 329-389): replace the `github.token` framing (lines 367, 369) with App-auth; document the two-tier `bkit [auto route]` gate; document `--cloud=claude|cursor`.
- § Required GitHub repo secrets (lines 360-369): keep `ANTHROPIC_API_KEY`; remove the "No App / github.token" claims; add `id-token: write` + App requirement.
- Alignment-guarantees note (line 47) already references the `Auto`→`bkit:auto` migration — finalise the wording once migrated.

#### [MODIFY] `.agents/scripts/bkit-postinstall.ts` (R3-3 — downstream readers of the deleted Linear render branch)

- **Existence Check:** Exists. `buildCloudSetupAdvisory` (line 803), `buildCloudDashboardsAdvisory` (line 849), `buildCloudSecretsAdvisory` (line 895) all branch on `tracker === "linear"` to add `LINEAR_API_KEY` to the `bkit-cloud.yml` secret set and to phrase post-CI auto-routing around a Linear-flavoured `bkit-cloud.yml`.
- These are direct downstream readers of the surface being deleted (Decision 1 / "Vestigial Linear branch removed; `bkit-cloud.yml` is GitHub-only"): a Linear `bkit-cloud.yml` can no longer exist, so the `tracker==="linear"` branches describe an impossible state and `buildCloudSecretsAdvisory` would tell a (mis-recorded) consumer to set `LINEAR_API_KEY` that the GitHub-only workflow never reads (classic "schema column dropped, downstream reader not updated" regression).
- **DELETE (Supersession Inventory):** the `tracker==="linear"` → `LINEAR_API_KEY`-in-`bkit-cloud.yml` coupling in all three builders is a superseded artifact (see Supersession Inventory row for `bkit-postinstall.ts`); reconciled by T1.9.
- **Reconcile all three with the GitHub-only model + the `cloud=claude`/`cloud=cursor` split:** `bkit-cloud.yml`-related advisory text is `cloud=claude`/`tracker=github` only; `LINEAR_API_KEY`/`.cursor`-related guidance belongs to the `cloud=cursor`/`tracker=linear` path (which ships `.cursor/`, not `bkit-cloud.yml`). Drop the `tracker==="linear"` → `bkit-cloud.yml` secret coupling.

#### [MODIFY] generated `.agents/advisories.md`

- **Existence Check:** Regenerated from advisory definitions. Regenerate after the `bkit-cloud-setup` advisory edits (do NOT hand-edit; defer regen to end-of-session per repo memory — no per-edit `bkit install`). Owned by T1.11.

#### [MODIFY] `.agents/scripts/bkit-modules.integration.test.ts` + `bkit-cli.test.ts` + `bkit-dry-run-parity.integration.test.ts`

- **Existing tests this change MUST update (named explicitly — R3-opt/R2-opt):**
  - Advisory asserts **lines 679-701**: `bkit-cloud-setup` action now asserts App-required + `/install-github-app`; remove `github.token` expectation; assert `bkit:auto` (not bare `Auto`) in advisory text.
  - `bkit.cloudAgents === "enabled"` assertion at **~703-710**: extend to also assert the new `bkit.cloud` variant field is recorded (`"claude"`/`"cursor"`).
  - `renderCloudWorkflow` Linear-keep regression tests at **754-762** and **787-793** (the "linear tracker keeps `LINEAR_API_KEY`" cases): **DELETE/replace** — Linear branch is removed. The 765-794 block is the broader render set; assert `id-token: write` + GitHub-only there.
  - `linear: omits install-github-app` advisory test at **~695-700**: restructure under the cloud-split (linear→cursor ships NO `bkit-cloud.yml`).
- Add cloud=claude/cursor variant + tracker-constraint + tracker-switch tests. Add `cloud=claude`/`cloud=cursor` dry-run parity (T1.10). Add the `bkit-postinstall.ts` advisory reconciliation test (T1.9) and the `bkit check` consistency test (T1.8).

### Cron Jobs & Scheduled Tasks

None.

## Documentation Updates — Block 1 scope

> Index: `.agents/docs.md`. Treat as code changes — rewrite prose, no lazy bullet appends.

<!-- prettier-ignore -->
| File | Change required |
| --- | --- |
| `.agents/cloud.md` | App = base requirement (matrix line 23, path E line 30); rewrite § Post-CI auto-routing for App-auth + two-tier `bkit [auto route]` gate; `--cloud=claude\|cursor`; remove `github.token`-only framing (lines 367, 369). |
| `.agents/advisories.md` | Regenerate after `bkit-cloud-setup` advisory edits (T1.11). |

> [!NOTE]
> `deployments.md`, `decisions.md`, `knowledge.md`, `trackers.md` documentation rows belong to children 2/3 (commit-tag contract, ADR, incident log, label migration). This child completes only the `cloud.md` rewrite + `advisories.md` regen.

## Rollback Strategy

See [parent index](./plan-v4-split.md) § Rollback Strategy — single `git revert` of the combined #141+#184 squash PR. Code-only; bkit has no database.

## Agent Execution Runbook — Block 1

> [!IMPORTANT]
> **Continuous Execution:** Work autonomously. Do not pause at Gates. Check off `[x]` as you go.
> **Blockers:** Do not fail silently — create a tracker issue (label `blocker`) with context before stopping.
> **Step Isolation:** Complete each task fully (including its verification + checkbox) before the next.
> **Ordering:** This is Block 1 (FINAL-SCOPE block 1). The cloud-module split (T1.5) gates tracker/cloud enforcement (T1.6). T1.11 (advisories regen) is last. Children 2 and 3 follow on the same branch.

> Every task includes a `**Done when:**` line — terse, testable, codebase-verifiable.

### Block 1 — D1 + App auth + cloud-module split + tracker/cloud enforcement + docs/advisory flip

- [ ] **T1.1:** Add `id-token: write` to `permissions:` and delete the `github.token`-handles-everything header framing in `.agents/templates/.github/workflows/bkit-cloud.yml`.
  - **Done when:** template `permissions:` block contains `id-token: write`; lines 23-25 framing removed (line 22 = tracker-conditional sentence); `grep -n "github.token handles" .agents/templates/.github/workflows/bkit-cloud.yml` returns nothing.
- [ ] **T1.2:** Remove the `renderCloudWorkflow` Linear branch in `.agents/scripts/bkit-modules.ts` (GitHub-only render; `id-token: write` present in output).
  - **Done when:** `renderCloudWorkflow` has no `isLinear` substitution; the Linear-keep regression tests at `bkit-modules.integration.test.ts:754-762` and `:787-793` are deleted/replaced (not just the 765-794 block); rendered output for `tracker=github` contains `id-token: write` and no `@@CLOUD_TRACKER`.
- [ ] **T1.3:** Regenerate `.github/workflows/bkit-cloud.yml` (this repo's rendered copy) to match the new template for `tracker=github`.
  - **Done when:** `.github/workflows/bkit-cloud.yml` has `id-token: write`, no Linear/`github.token` framing; byte-identical to `renderCloudWorkflow(template, "github")`.
- [ ] **T1.4:** Add value-bearing `--cloud=claude|cursor` parsing (reject bare `--cloud` + invalid values) and `--force` install-context parsing in `.agents/scripts/bkit-cli.ts`; update `printUsage`.
  - **Done when:** `bkit install --cloud` (bare) errors; `--cloud=claude`/`--cloud=cursor` parse to the variant; `bkit-cli.test.ts` covers both + invalid value; help shows `--cloud=claude|cursor`.
- [ ] **T1.5:** Split `runCloudModule` by variant + add `bkit.cloud` field; update `MODULE_REGISTRY`/`MODULE_DISPATCH_ORDER` + `bkit-manifest.ts` so `cloud=claude` ships `bkit-cloud.yml`+`cloud-bootstrap.sh` and `cloud=cursor` ships `.cursor/Dockerfile`+`environment.json`.
  - **Done when:** integration test shows `--cloud=claude` writes `bkit-cloud.yml` (not `.cursor/Dockerfile`) and `--cloud=cursor` writes `.cursor/Dockerfile`+`environment.json` (not `bkit-cloud.yml`); `package.json` `bkit.cloud` recorded (DECISION-C) AND the existing `bkit.cloudAgents === "enabled"` assertion at `bkit-modules.integration.test.ts:~703-710` is extended to assert `bkit.cloud` too; manifest is split per DECISION-D so uninstall removes ONLY the recorded variant's files (test asserts `uninstall` of a `cloud=claude` install does not orphan `.cursor/*` and vice-versa); the manifest variant split (Derived Test Matrix row 14) is asserted in the manifest suite `.agents/scripts/bkit-manifest.test.ts` (each `CLOUD_MANIFEST` entry tagged with / gated by its owning variant — `cloud=claude` owns `bkit-cloud.yml`+`cloud-bootstrap.sh`, `cloud=cursor` owns `.cursor/Dockerfile`+`environment.json`).
- [ ] **T1.6:** Add symmetric tracker/cloud constraint + tracker-switch hard-block (`--force`) in `.agents/scripts/bkit-install.ts`.
  - **Done when:** `.agents/scripts/bkit-install.ts` exists and is the edited file (`test -f .agents/scripts/bkit-install.ts`); `--cloud=claude` on `tracker=linear` hard-errors (and vice versa); switching a recorded tracker without `--force` hard-errors; first-set is free; `--force` overrides; tests assert each.
- [ ] **T1.7:** Flip the `bkit-cloud-setup` advisory App optional→required; delete the `github.token`-only line; update `mentionTipLine`; migrate the bare `Auto` advisory strings (`bkit-modules.ts:2051/2054/2055`) → `bkit:auto` (or remove with the `isLinearCloud` branch if T1.5's split deletes it); flip `cloud.md` matrix (line 23) + path E (line 30) + Post-CI section.
  - **Done when:** advisory action contains `/install-github-app` + "required" and no `github.token`-handles-everything text; `grep -n '\bAuto\b' .agents/scripts/bkit-modules.ts` returns no advisory-label references (only `bkit:auto`); `cloud.md` describes the App as base requirement; `bkit-modules.integration.test.ts` advisory asserts updated (including the `bkit:auto` advisory text) and green.
- [ ] **T1.8:** Add `bkit check` `cloud=claude` config-consistency assertion (workflow `id-token`, `ANTHROPIC_API_KEY` note, App advisory surfaced) in the install/check post-install path.
  - **Done when:** `bkit check` exits 1 when `bkit.cloud=claude` but `bkit-cloud.yml` lacks `id-token`; integration/doctor test covers it.
- [ ] **T1.9:** Reconcile `bkit-postinstall.ts` cloud advisories with the GitHub-only `bkit-cloud.yml` + cloud-split (R3-3): drop the `tracker==="linear"` → `LINEAR_API_KEY`-in-`bkit-cloud.yml` coupling in `buildCloudSetupAdvisory` (:803), `buildCloudDashboardsAdvisory` (:849), `buildCloudSecretsAdvisory` (:895); `bkit-cloud.yml`-related advisory text becomes `cloud=claude`/`github`-only.
  - **Done when:** none of the three builders associate `LINEAR_API_KEY` with `bkit-cloud.yml`; `grep -n 'LINEAR_API_KEY' .agents/scripts/bkit-postinstall.ts` shows it only on the `cloud=cursor`/`tracker=linear` (`.cursor`) path, never the `bkit-cloud.yml` secret set; a `bkit-modules.integration.test.ts` (or postinstall-advisory) test asserts the GitHub-only secret set for `cloud=claude` and no `bkit-cloud.yml`+`LINEAR_API_KEY` advisory for `tracker=linear`.
- [ ] **T1.10:** Extend `bkit-dry-run-parity.integration.test.ts` to cover BOTH cloud variants (`--cloud=claude` AND `--cloud=cursor`) — dry-run output matches the real-install file set for each variant (owns Derived Test Matrix row 13).
  - **Done when:** `bkit-dry-run-parity.integration.test.ts` has assertions for `--cloud=claude` (dry-run lists `bkit-cloud.yml`+`cloud-bootstrap.sh`, no `.cursor/*`) AND `--cloud=cursor` (dry-run lists `.cursor/Dockerfile`+`environment.json`, no `bkit-cloud.yml`); `pnpm test` green on that suite.
- [ ] **T1.11:** Regenerate `.agents/advisories.md` (end of session, single regen). **Placed last in Block 1 by design — execute after all other Block 1 tasks, including T1.10 (no per-edit regen; batch at session end).**
  - **Done when:** `.agents/advisories.md` reflects the updated `bkit-cloud-setup` advisory; `bkit check` reports no advisories drift.

### 🔒 Gate 2 (Block 1 scope): Code Implementation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.**

- [ ] **Gate 2 (Block 1) - Verified:** Every Block-1 task (T1.1–T1.11) independently verified and checked off against this plan.

> [!IMPORTANT]
> **Testing Strategy:** bkit uses Vitest (`.agents/scripts/*.test.ts` + `*.integration.test.ts`). Validate shipped config with the real tool/resolver, never string-presence-only (repo memory: #179/#195 class). Verify install AND upgrade live, not just `bkit check`. Dogfood via packed tarball in a clean dir if dependency classification could shift. No per-edit `bkit install` — batch mirror regen at session end.

> [!NOTE]
> The consolidated Gate 2 / Gate 3 / Gate 4 across all three children, and the full 13-item Manual Verification, are completed in [`plan-v4-3.md`](./plan-v4-3.md) before the single combined #141+#184 squash PR. Do NOT ship after this child.

## Next Child

Proceed to [`plan-v4-2.md`](./plan-v4-2.md) (Block 2 + 3) on the SAME branch once T1.1–T1.11 are checked off. Carry forward: #184 assertion shape (resolved at Gate 1), and the `bkit-cloud.yml` template/render baseline that T2.7/T3.1 will extend.
