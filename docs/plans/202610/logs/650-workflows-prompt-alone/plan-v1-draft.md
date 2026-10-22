<!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket). `{YYYYMM}` = creation month, set once by the first workflow run for `{FID}`. Logs sit at `docs/plans/{YYYYMM}/logs/{FID}/` and are delete-eligible. The canonical copy is stamped with a `bkit:anchor` block recording the base commit (`baseSha`), its ref (`baseRef`), and the design it targets (`designPath`, `designBaseSha`); never hand-author or edit it. `@bkit-plan-generate` fills this template. -->

<!-- bkit:start -->

<!-- bkit:managed v5.5.0 — do not edit; run `bkit upgrade` to refresh -->

# Run Workflows From the Prompt Alone Implementation Plan

> [!CAUTION]
> **Purpose:** Implementation plan — pre-flight, gates, runbook, verification, rollback.
>
> **Rules:**
>
> - Any tools mentioned below are examples only; swap for actual tools in final output; drop inapplicable.
> - Use dense token-efficient phrasing; no filler / hedging / restating; tables > prose, bullets > paragraphs.
> - Read `.agents/docs.md` → load docs for workflow / step / task; skip missing; cite docs inline where required.
> - Read this document once at session start; do not trust session memory; do not re-read on every loop iteration.
> - Source of truth: literal `[x]` vs `[ ]` checkboxes in this document; `[ ]` means not DONE regardless of context.

## Context & Goals

**Problem.** With a tracker wired (github / linear / jira), `/bkit-design`, `/bkit-plan`, `/bkit-build`, `/bkit-debug`, `/bkit-ship` STOP at Step 1 sub-step 2 when the prompt names no issue (`.bkit/wording.md` `workflow-issue-id-missing` → `No issue ID in the session prompt.` → STOP). `/bkit-debug` cannot be pointed at red CI on `dev` without filing an issue first. Missing design / plan is already a warning (#490); the issue is the last required input.

**Goal.**

- Issue becomes optional like design / plan: recover it from a named FID or `feat/{FID}` (Q2), else warn, mint an issue-less FID, continue, make no issue-tied tracker call.
- Issue-less FID can never parse as an issue id (Q3): all-digit words dropped at mint; engine backstop on `fids check` / `steps gate --issue=""`.
- `/bkit-debug` on `dev` stays IN PLACE in the main checkout, no worktree, no new branch (Q1): commits only its own paths, pushes only its own commits, waits for `dev` CI on the pushed commit, never probes for a PR on `dev` / `main`.
- `/bkit-ship` never targets `main`: refusal text on `dev` / `main`; engine guards on `bkit prs open --base=main` and `bkit prs merge` of any non-`dev` base (Q4).

**Inputs and precedence.** No design doc (issue decision 5: built straight from the issue plan comment). Issue #650 body + plan comment; the "Open questions: answered" comment (Q1–Q7) overrides the plan comment's "Decisions I'm proposing" and "Open points". Plan comment waves 1–4 kept as runbook waves.

**Premise corrections (survey of the code, not the input):**

1. Q1.3 "treats red the same way it treats a red PR run" — `/bkit-debug` never waits for a PR run's result; the CI-Dispatch Gate (`bkit runs dispatch`, `runs.ts` `ciDispatchGate` L1247) only proves a run started. No existing red-run handling to mirror → `Open Question 1`.
2. Plan comment ship L236: an empty `ISSUE_ID` makes "branch does not contain `{ISSUE_ID}`" always **false** (`""` is contained in every string), not always true; same conclusion — the naming warning never fires issue-less. Fix stands (T15).
3. Plan comment order-of-work 4 names `prs open --dry`; no `--dry` flag exists. Dogfood uses `prs open` with `gh` off `PATH` → exit 80 prints the PR payload (marker included) without opening.
4. Debug Step 11 already skips the PR probe on `dev`; the leaks are Step 1 sub-step 6 (PR lookup that can pick up and retitle an open `dev` → `main` release PR) and the empty `--pr` handed to `runs dispatch` at Step 11.
5. `git add -A` (plan comment problem (a)) lives in `steps.ts` `writeStepRow` L405, reached by every `steps finish` and by `context.ts:835`, `tests.ts:578`, `steps.ts:763` / `976`, `workflows.ts:872`, `runs.ts:1283`. `commitBookkeeping` (`ledgers.ts` L276–406) already commits by pathspec but `stageTrackedUpdates` runs `git add -u` (L314–317).

> Success criteria once in `Acceptance Scenario → Success Criteria`; each runbook task has own `Done when`. Do not restate success list here.

**Related Issues:**

- #650 — Run workflows from the prompt alone, without issue, design or plan (this issue; state not re-read — no tracker tool in this subagent)
- #486 — Stop auto-creating tracker issues (state not read; never-create rule stays)
- #490 — Run build and ship from the session prompt when there is no plan (state not read; design / plan already warn-only)

---

## 👤 ⚠️ Acceptance Scenario

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Testable feature contract — implementation, tests, verification derive from what you confirm here. Wrong here → wrong downstream.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). Agent handles rest.

### Spec

> [!IMPORTANT]
> What good looks like; canonical for the plan phase. Subagents (plan generate, plan review, plan summary) must follow this spec. No plan subagent restates rules; this section = single source of truth for the plan.

- **Narrative:** 1–2 sentences, user POV (not system POV). User action + what they get back. Source, first that carries it wins: design `## Acceptance Scenario` → verbatim; issue `Narrative` (change shape, `.bkit/trackers.md` § Issue shapes) → verbatim; audits only (`docs/audits/`) → user/operator impact from in-scope findings. None → both fields = `⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds`; never fabricate; Gate 1 blocked until human fills.
- **Success Criteria:** <=5 bullets, measurable / testable. Outcomes (e.g. "user sees their event in the list within 2s"), not steps (e.g. "call API, render component"). Design count ≠ 5 → smallest set proving feature. Design → verbatim. No design → issue `Success Criteria` verbatim. Audits only → one bullet per in-scope finding id from `Expected`; no 5-bullet cap.
- **Process Sketch:** Design → plan inherits/refines. same happy-path (`Concrete Example`) + branches (`Edge Cases`) as `WHEN X → THEN Y` (3–7 lines); reuse exact examples, do not invent. Outcomes, not steps.
- **Key Edge Cases:** Design → plan inherits. Concurrency, conflicts, failures, cross-feature — not trivial validation (plan adds that).
- **Edge Cases:** Plan phase — design Key Edge Cases verbatim (no design → issue `Edge Cases` rows verbatim) + validation / error / boundary cases.
- **Concrete Example:** Plan phase only. Role, starting state, numbered steps, observable outcome. One scenario, not a list.
- **Derived Test Matrix:** Plan phase only. One row per testable behaviour → exactly one `Agent Execution Runbook` task. No row without a target file. In-scope audit behaviour → one row. Issue `Derived Test Matrix` rows → kept verbatim; add missing rows.

### Narrative

> Inherited from design, else the issue; do not rewrite.

`⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds`

Issue #650 has no `Narrative` section (no design, no audit). Closest issue text, verbatim from `### Outcome`, for the human to adopt or replace:

> Every workflow runs on the prompt alone. A missing issue, design or plan prints a warning and the run continues. `/bkit-debug` runs on any branch except `main`, `dev` included. `/bkit-ship` keeps refusing `dev` and `main` and never opens or merges a PR from `dev` into `main`; releases stay manual.

### Success Criteria

> Inherited from design, else the issue; do not rewrite.

Issue #650 `### Success criteria`, verbatim (6 bullets; verbatim rule wins over the 5-bullet cap):

- `/bkit-debug ci failures on dev`, run on `dev` with the GitHub tracker wired and no issue named: prints a warning that names the missing issue, then diagnoses, fixes and lands the fix on `dev`. It does not stop.
- The same holds for design, plan, build and ship: no issue → warning → run continues from the prompt.
- An issue-less run makes no tracker calls tied to an issue (labels, comments, board, issue reads), and none of them fail the run.
- An issue-less run gets a valid FID (the run's log-folder name) in a tracker-wired repo. It can never be misread as an issue id.
- The no-issue warning is the first line of every final message the workflow returns.
- `/bkit-ship` on `dev` or `main` refuses with a message saying releases stay manual. No ship path can merge into `main`.

### Process Sketch

> Inherited from design; plan may refine. `Concrete Example` (happy path) + `Edge Cases` (branches) as `WHEN X → THEN Y`, not prose — same examples. Do not invent new examples. Sense-check top-level process HERE without prose below. Outcomes, not implementation steps.

- **WHEN** `/bkit-debug ci failures on dev` runs on `dev`, GitHub tracker wired, no issue named **→ THEN** Step 1 prints the no-issue warning naming FID `dev-ci-failures` and the run continues with no issue-tied tracker call.
- **WHEN** the fix is committed and pushed **→ THEN** only the run's own paths and commits reach `origin/dev`, and the run waits for `dev` CI on the pushed commit before closing.
- **WHEN** the run returns **→ THEN** line 1 of the final message is the no-issue warning.
- **IF** the prompt names no issue but the branch is `feat/650-foo` or the prompt names a FID carrying one **→ THEN** that issue is read, labelled and commented on as if named (Q2).
- **IF** a minted slug carries an all-digit word (`dev-123-ci-failures`) **→ THEN** it is dropped (`dev-ci-failures`); a tracker-shaped FID with `--issue=""` (`123-fix`, `fix-2-retry`) is rejected (Q3).
- **IF** debug must change a file already dirty before the run, or local `dev` was ahead of `origin/dev` **→ THEN** it stops and asks / replays only its own commits onto `origin/dev` (Q1).
- **IF** `/bkit-ship` runs on `dev` / `main`, or a PR's base is `main` at open or merge **→ THEN** refused; releases stay manual (Q4).

### Concrete Example

> Plan expands from design.

**Setup:** Maintainer in a consumer repo with the GitHub tracker wired, main checkout on `dev`. `notes.md` edited and uncommitted (unrelated). One unpushed local commit `abc1234` on `dev`. Latest `dev` CI run is red.

**Steps:**

1. Maintainer types `/bkit-debug ci failures on dev` → Step 1: no issue in prompt, branch is `dev` (no `feat/{FID}`) → prints `WARNING: no issue named — running issue-less as dev-ci-failures; no tracker reads, labels or comments. Name dev-ci-failures in the next prompt to continue this run.`; `bkit fids check --fid=dev-ci-failures --issue=""` exits 0; no `prs probe` (`PUSH_MODE=LOCAL`).
2. Step 2 `bkit worktrees setup` stays in place and records local `dev` HEAD (`abc1234`, 1 ahead of `origin/dev`) and the dirty set `{notes.md}`.
3. Steps 3–10 diagnose and fix `src/build.ts`; every `bkit steps finish` commit holds run-log paths + `src/build.ts`, never `notes.md`.
4. Step 11 `bkit branches push --mode=dev`: local `dev` was ahead → replays the run's commits onto `origin/dev` in `.worktrees/_land-dev-ci-failures` and pushes; `abc1234` stays local; prints how to resync local `dev`.
5. `bkit runs dispatch` on the pushed SHA → run started; `bkit runs wait --until=completed` → `conclusion: success`; `bkit runs gate --capstone-only` passes.
6. Close → final message; line 1 = the warning from step 1.

**Outcome:** `origin/dev` gained exactly the fix commit(s) + run record; `notes.md` still modified and uncommitted; `abc1234` still unpushed; transcript shows no `bkit issues *` call and no tracker MCP call; final message starts with the warning.

### Edge Cases

> Plan expands from design's Key Edge Cases.

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| No issue in prompt; branch `feat/650-foo` (github) | Issue `650` recovered; run reads, labels, comments as if named (Q2) |
| No issue in prompt; prompt names FID `651-bar` / design path | Issue recovered from the FID via `fids parse`; plan still finds the design via `fids design` |
| Prompt names an issue-less FID `dev-ci-failures` | FID reused; attempt counter continues (Q7) |
| Issue-less re-run with reworded prompt | New FID minted, attempt counter restarts; documented in § Best-effort runs (Q7) |
| Mint from branch `dev`, prompt `fix 123 retry` | FID `dev-fix-retry` (all-digit word dropped) |
| `fids check` / `steps gate` with `--issue=""` and FID `123-fix`, `fix-2-retry`, `dev-123-x` | Exit 1 / gate check `ok:false`, message names the issue-less rule |
| `--issue` absent | Behaviour byte-identical to today |
| PR marker `<!-- bkit:fid=../x -->` or branch `feat/a;b` | Rejected by `SLUG`; fallback never reached |
| `none` tracker | Renders and behaves as today; `bkit:tracker true` blocks dropped |
| Named issue | Behaves as today |
| GitHub board configured, no issue | `issues labels --board=…` fences skipped (would exit 2) |
| Jira related-issues search, no issue | `key != {ISSUE_ID}` clause dropped; query valid; search still runs (Q5) |
| `steps gate` with `--placeholder ISSUE_ID=` empty | Workflows omit the `ISSUE_ID` placeholder when empty; gate never fails on it |
| build Step 18.9 / debug Step 11.9 kill-switch, no issue | Skipped; run reaches its final message |
| design Step 11 workstream suggestions, no issue | Skipped (it comments on the issue) |
| ship Step 14.3 labels, no issue | Skipped; an already-merged run never goes to Failure Path |
| ship naming warning (L236), no issue | Warns when branch is not `feat/{FID}` |
| Final message `Append issue link […]`, no issue | Skipped; never renders `[ ]()` |
| `/bkit-debug` on `main` | Refused (`main` refused for every workflow) |
| design / plan / build in place on `main` | Refused by `worktrees setup` |
| `/bkit-ship` on `dev` / `main` | Refused: `refusing to ship dev: /bkit-ship ships a feature branch into dev only; …` |
| `/bkit-ship` target `feat/{FID}` missing | Message names the missing branch (no "commit or stash"); never created |
| PR retargeted to `main` after ship Step 2 | `bkit prs merge` refuses (base is not `dev`); MCP fallback asserts base first |
| `bkit prs open --base=main` | Refused before any `gh` call |
| Debug needs to edit a file dirty before the run | `steps finish` refuses with a command-specific exit naming the paths → workflow stops and asks |
| User's foreign changes already staged in the index | Run commits by pathspec / temp index; foreign staged entries stay staged, never committed |
| Second in-place run on the same checkout while another FID's record + live lock exist | `worktrees setup` refuses (concurrency) |
| Local `dev` level with `origin/dev` at start | Plain `git push origin dev` of own commits |
| Local `dev` ahead at start, or `origin/dev` moved during the run | Own commits replayed onto fresh `origin/dev` via `pushToDev` (retry on moved `dev`) |
| `dev` CI red on the pushed commit | Failure Path (Open Question 1 default) |
| `dev` CI never starts | Existing CI-Dispatch Gate failure handling |
| HEAD message carries a skip-CI token on the `dev` push | Existing `EXIT_SKIP_CI` refusal (`branches.ts` L593–601) |
| `/bkit-auto` or `bkit-cloud.yml` with an issue-less marker / FID | Fails closed; `/bkit-auto` stays issue-only |
| Linear cloud agent with no `LINEAR_ISSUE_ID` | `preflight-linear.sh` unchanged; still stops (Q6) |

### Derived Test Matrix

> Each row → one Agent Execution Runbook task. Assign tier(s) via **tier-selection rubric** in `docs/testing.md` (behaviour may need more than one). Boundary rows use that doc's rigor — reach real boundary, assert ground-truth signal, `@live` for external / deployed boundaries; do not restate those rules here.
>
> **Discrimination (no false-green):** assertion MUST hit the **affected** surface and FAIL if behaviour broken — not transport status (200/201), not proxy surfaces, never mock away the boundary under test.

**Tier Key** — use these exact tier names in the `Type` column (they must match `docs/testing.md`); pick the **lowest tier that actually exercises** the behaviour (a behaviour may need several):

<!-- prettier-ignore -->
| Tier | Use for | Example behaviour |
| --- | --- | --- |
| **Static** | every change — type / lint / format / prose / drift (global gate, not a per-feature row) | `tsc`, lint, and `bkit check` pass on the changed files |
| **Unit** | pure function / single module, no I/O | service parses a payload correctly |
| **Integration** | crosses a LOCAL stateful boundary (own DB / API), no mocks at the boundary, fresh instance | API endpoint enforces tenant isolation against a fresh local instance |
| **@live (golden)** | crosses an EXTERNAL / DEPLOYED boundary (3rd-party API, model, payment, deployed schema, RLS) — reach it, assert a ground-truth signal | a real 3rd-party API returns content and a boundary-only identity |
| **E2E** | user-visible UI flow / DOM state | user creates an event and sees it in the list |
| **fresh-DB replay** | new / changed migration or seed (`bkit-tests-migration`) | migration replays from empty and the seed loads |
| **Smoke** | post-deploy health of a deployed surface (global observability gate) | deployed health route returns 200 |

One row per behaviour (copy the tier name from the key above verbatim into `Type`):

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| `fids check --issue=""` accepts an issue-less FID and rejects any FID with an all-digit word under github, linear, jira; `--issue=<id>` requires tracker shape; flag absent unchanged; `none` unchanged (T1) | Unit | `.bkit/core/engine/commands/workflow/fids.test.ts` |
| `fromMarker` / `fromBranch` return `issueId: null` for an issue-less FID under every wired tracker; "embeds no … issue id" rows flip; tracker-shaped parse unchanged (T2) | Unit | `.bkit/core/engine/commands/workflow/fids.test.ts` |
| Malicious FIDs through the new fallbacks rejected; `/bkit-auto` fails closed with no issue (T2) | Unit | `.bkit/core/engine/audits/workflows/auto-fid-guard.test.ts` |
| Cloud context step with an issue-less marker resolves no issue and refuses (issue-only `/bkit-auto`) (T2) | Integration | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` |
| `steps gate --fid=… --issue=""` FID check uses the issue-less rule; absent flag unchanged (T3) | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` |
| `prMarker` writes `<!-- bkit:fid={FID} -->` with a tracker wired and no issue; `prs open --base=main` refused; `prs merge` refuses a non-`dev` base (T4) | Unit | `.bkit/core/engine/commands/workflow/prs.test.ts` |
| `branches land` of an issue-less run squashes and writes a FID-only marker (T4) | Integration | `.bkit/core/engine/audits/workflows/close-squash.integration.test.ts` |
| `worktrees setup`: ship on `dev` / `main` refusal text with `refusing to ship ${target}` prefix; missing `feat/{FID}` message; `main` refused in place for design / plan / build / debug (T5) | Unit | `.bkit/core/engine/commands/workflow/worktrees.test.ts` |
| Wording clauses: no STOP on missing issue, warning / first-line clauses, retired blocks hold old text (T7) | Unit | `.bkit/core/engine/tools/wording.test.ts` |
| Five workflows: no wired-tracker block STOPs on a missing issue; `fids check` / `steps gate` carry `--issue`; `**No issue:**` bullet in a `true` block; `**Skip if**` before every `issues labels --board` fence and Failure Path tracker write; warning first in final messages (T8) | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` |
| `none` render byte-identical; `true` block dropped under `none` (T8) | Unit | `.bkit/core/engine/render/trackers.test.ts` |
| Per-workflow skips: design Step 11, build 1.4 / 18.9, debug 11.9, debug Step 1 no PR probe on `dev` / `main` (T9) | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` |
| In-place shared-checkout record; `steps finish` and bookkeeping commits never include foreign paths; changed pre-dirty path refused; concurrent record refused (T11) | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts`, `.bkit/core/engine/commands/workflow/ledgers.test.ts`, `.bkit/core/engine/commands/workflow/worktrees.test.ts` |
| Real git: foreign dirty + staged files untouched across a run's commits (T11) | Integration | `.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts` |
| `branches push --mode=dev` pushes only `startSha..HEAD`: plain push when level, replay via `pushToDev` when ahead or `origin/dev` moved; foreign local commits never reach the remote (T12) | Integration | `.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts` |
| `branches push` / `pushToDev` replay contract (T12) | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts`, `.bkit/core/engine/commands/land.test.ts` |
| `runs dispatch` on `dev` with the pushed SHA and no PR proves a run started (T13) | Unit | `.bkit/core/engine/commands/workflow/runs.test.ts` |
| Debug Step 11 on `dev`: `{DIFF_BASE}` = recorded start SHA; dispatch → wait → gate; Gate 11 item true on `dev` (T14) | Unit | `.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts` |
| Ship: L236 naming warning issue-less; refusal flow; Step 14.3 skip; Step 10 MCP base assert; label re-read before `prs merge` kept (T15) | Unit | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` |
| Static gates on every changed file + `dist/` + mirrors (T18) | Static | global (`pnpm bkit:gate:static-unit-integration`, `pnpm bkit check`, `pnpm bkit:check:dist`) |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

> [!CAUTION]
> **Agent:** Do not pass Gate 1 until this checkbox is `[x]`.

---

## 👤 ⚠️ Breaking Changes & Naming Review

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Review proposed names and breaking changes below.

> [!WARNING]
> **Behaviour change for every wired-tracker consumer:** a missing issue no longer STOPs any of the five workflows. Teams relying on the STOP to force issue linking lose that enforcement; the warning (console + final-message line 1) replaces it.

> [!WARNING]
> **`bkit prs merge` refuses any PR whose base is not `dev`; `bkit prs open --base=main` is refused.** Any consumer script using `bkit prs merge` for another base (release branch, `main`) breaks with a new command-specific exit.

> [!WARNING]
> **`bkit worktrees setup` refuses `main` in place for design / plan / build** (today only `dev` is refused there).

> [!IMPORTANT]
> **Engine contract changes (callers listed in Architecture):**
>
> - `fids check` / `steps gate` gain `--issue=<id or "">`; absent = today.
> - `fromMarker` / `fromBranch` / `fids parse` under a wired tracker now return `{ fid, issueId: null }` for an issue-less FID that today returns no result. `runs context` keeps its current refusal for a context with no issue.
> - PR marker under a wired tracker with no issue: `<!-- bkit:fid={FID} -->` (the `none` shape).
> - `steps finish` (via `writeStepRow`) and `commitBookkeeping` exclude paths recorded as dirty before an in-place shared-branch run; a recorded path changed during the run → new command-specific exit.
> - `branches push --mode=dev` pushes only the run's commits; may replay through `pushToDev` (output gains `replayed: boolean`).
> - `runs dispatch` accepts a shared branch + pushed SHA with no PR.

**Proposed names:**

<!-- prettier-ignore -->
| Kind | Name | Where |
| --- | --- | --- |
| FID rule | issue-less FID = `SLUG` with no all-digit `-`-separated word; constant `ISSUE_LESS_FID` | `fids.ts` |
| Issue-id shapes | `ISSUE_ID_PATTERNS` (per tracker) | `fids.ts` |
| Validator | `fidProblem(fid, tracker, issue?)` → `string \| undefined` | `fids.ts` (used by `fids check`, `steps gate`, `prMarker`) |
| Flag | `--issue=<id or "">` | `bkit fids check`, `bkit steps gate` |
| Exit constants | `EXIT_BASE_MAIN` (`prs open`), `EXIT_BASE_NOT_DEV` (`prs merge`), `EXIT_FOREIGN_PATH` (`steps finish` / `ledgers commit`), `EXIT_SHARED_BUSY` (`worktrees setup`) — next free codes in 3–79 per command | engine |
| Run record | `$(git rev-parse --git-path bkit/shared-checkout/{FID}.json)` — per clone, never committed | `worktrees.ts` |
| Wording clauses (new) | `workflow-no-issue-warning`, `workflow-final-first-line` | `.bkit/wording.md` |
| Wording clauses (changed, old text → `retired`) | `workflow-issue-id-missing`, `workflow-issue-id-missing-none`, `workflow-issue-read-none`, `workflow-fid-mint`, `workflow-fid-unset`, `workflow-gate-issue-id`, `workflow-issue-link`, `workflow-large-diff` (new `{{base}}` slot) | `.bkit/wording.md` |
| Header bullet | `**No issue:**` inside `<!-- bkit:tracker true start/end -->` | five workflows |
| Ship refusal | `refusing to ship ${target}: /bkit-ship ships a feature branch into dev only; it never opens a PR from dev into main or merges into main, releases stay manual. Name the feature branch to ship.` | `worktrees.ts` |

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.

> [!CAUTION]
> **Agent:** Do not pass Gate 1 until this checkbox is `[x]`.

---

## 👤 ⚠️ Open Questions & Assumptions

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Unknowns + assumptions this plan relies on. Unresolved question = risk; wrong assumption breaks downstream. If none, write "None".
> **Never a bare question.** Each carries 2-3 options, a recommendation, and default if unanswered — human must decide from the page alone. Canonical plan shape.
> Design → carry its options / recommendation forward where already answered.

Answered on #650 (carried, not reopened): Q1 in place on `dev`; Q2 recover issue from FID; Q3 drop all-digit words + engine backstop; Q4 guard merge and open; Q5 keep related-issues search, drop Jira `key !=`; Q6 leave `preflight-linear.sh`; Q7 no continuity change, document it.

- **Open Question 1:** `dev` CI red on the pushed commit — what does debug do? (Q1.3 says "same as a red PR run", but debug never waits for a PR run's result today — premise correction 1.) → owner.
  - **Options:** A — Failure Path naming the red run URL; run closes FAILED; the `dev` CI router's `MAX_DEV_DISPATCH_ATTEMPTS` loop (`docs/deployments.md` L265) or a human re-run continues · B — new attempt inside the same run (back to diagnosis under `MAX_DEBUG_ATTEMPT`); fully autonomous but a long session holding the checkout · C — close DONE with a warning; green-looking close on red CI.
  - **Recommended:** A — a red result is never reported as done, and retry already has a bounded owner.
  - **Default if unanswered:** A.
- **Open Question 2:** The replay onto `origin/dev` runs in `pushToDev`'s throwaway checkout with hooks off. → owner.
  - **Options:** A — accept: the run's own gates already ran on the same commits in the main checkout · B — run the static / unit gate inside the throwaway checkout before pushing; slower, needs `node_modules` there · C — refuse when local `dev` was ahead and tell the human to push or park their commits first.
  - **Recommended:** A — same commits, already gated; `dev` CI is waited on afterwards (T14).
  - **Default if unanswered:** A.
- **Open Question 3:** After a replay, local `dev` (foreign commits + run commits) diverges from `origin/dev` (run commits replayed). → owner.
  - **Options:** A — leave local `dev` untouched; print the exact resync command (`git pull --rebase origin dev`) in the push output and the final message · B — auto-rebase local `dev` onto `origin/dev` at close; touches the human's commits.
  - **Recommended:** A — the run never rewrites commits it does not own.
  - **Default if unanswered:** A.
- **Open Question 4:** A path dirty before the run changed during the run — the engine cannot tell whether debug or the human edited it. → owner.
  - **Options:** A — treat as debug's edit: refuse the commit (`EXIT_FOREIGN_PATH`) naming the paths; workflow stops and asks (Q1.1) · B — commit it anyway with a warning; mixes change sets.
  - **Recommended:** A — Q1.1 says stop and ask; never mix the two sets.
  - **Default if unanswered:** A.
- **Assumption:** No-all-digit-word rule is stricter than "not the tracker shape" and is tracker-independent → if a consumer wants digit words in issue-less slugs (`node-22-upgrade` → `node-upgrade`), the slug loses information; FID still valid.
- **Assumption:** The `none` tracker renders and behaves byte-identically (all new prose sits in `bkit:tracker true` blocks or `--issue` is absent) → if wrong, `render/trackers.test.ts` reds and `none` consumers see changed workflows.
- **Assumption:** No bkit path merges or opens into `main` except via `bkit prs merge` / `prs open` or the ship Step 10 MCP fallback → if another path exists (e.g. `branches land` MCP fallback), it stays unguarded (see `Suggested Scope Expansion`).
- **Assumption:** Every debug-on-`dev` commit goes through `writeStepRow` or `commitBookkeeping`, and every push through `pushBranch` / `pushToDev` → a prose-level `git add -A` / `git push` in `bkit-debug.md` would bypass the record; T14 greps and removes any.
- **Assumption:** Commits in `startSha..HEAD` on `dev` during the run are the run's own (the run holds the checkout) → a human committing on `dev` mid-run gets their commit pushed with the run's.
- **Assumption:** The consumer CI template declares a `push` trigger on `dev` (and `workflow_dispatch`) so `runs dispatch` finds a run for the pushed SHA → if not, the CI-Dispatch Gate fails as it does today.
- **Assumption:** `/bkit-plan` naming a design FID or path without an issue already works (`fids design`) → unchanged; no task.

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

> [!CAUTION]
> **Agent:** Do not pass Gate 1 until this checkbox is `[x]`.

---

## Alternative Approaches & Recommendations

<!-- prettier-ignore -->
| Approach | Verdict | Why |
| --- | --- | --- |
| Debug on `dev` in its own worktree on `feat/{FID}` + `branches land` (plan comment proposal) | Rejected | Overridden by owner (Q1): stays in place, no new branch |
| `git stash` foreign changes around the run | Rejected | Stash stack is shared across worktrees and sessions; pop can take another session's entry |
| Temporary index for every run commit | Fallback only | Pathspec commits already leave foreign index entries alone; temp index used only when the run's own path set is empty (an `--allow-empty` commit would otherwise take the whole index) |
| Record start SHA + dirty set; own-path commits; own-commit push via `pushToDev` | **Chosen** | Fixes problems (a)–(d) with existing engines; debug still creates no branch |
| Issue-less FID rule = "does not match the active tracker shape" | Rejected | Depends on the tracker in force; a tracker switch could make an old FID parse as an issue. "No all-digit word" excludes all three tracker shapes at once |
| Issue-less FID rule = no all-digit word + `SLUG` | **Chosen** | Q3; tracker-independent; mint and check agree |
| CI-Dispatch Gate only on `dev` (prove a run started) | Rejected | Q1.3: debug must wait for `dev` CI on the pushed commit |
| Dispatch → `runs wait --until=completed` → `runs gate --capstone-only` on `dev` | **Chosen** | Existing commands; Gate 11 claim becomes true |
| `prs open` refuses every non-`dev` base | Rejected | Q4 scopes the open guard to `--base=main`; merge guard covers the rest |
| Separate dispatch prose block for `dev` in debug Step 11 | Rejected | One block with `{DIFF_BASE}` / SHA placeholders keeps `ci-dispatch-gate-alignment.test.ts` pinning one shape |
| Relax `/bkit-auto` to run issue-less | Rejected | Non-goal: CI always dispatches it with an issue or PR |
| Auto-create an issue when none is named | Rejected | #486 never-create rule |

**Future-phase recommendations:** guard the `branches land` MCP fallback merge base (see `Suggested Scope Expansion`); consider a `bkit fids resume` lookup that maps a reworded issue-less prompt to a recent FID (deferred, Q7).

**Selection Rule:** pick the approach with the best quality-of-end-state, not the smallest diff / lowest cost-of-change. In-scope work = complete or explicitly moved to `Out of Scope` — no 90% solutions or silent shortcuts.

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Relax `.bkit/core/hooks/preflight-linear.sh` L13–18 for Linear cloud agents with no `LINEAR_ISSUE_ID` | Not required by any Success Criterion; Linear cloud launches always come from an issue | #650 "Open questions: answered" Q6 (scope-declared) — deferral `650-preflight-linear-issue-less` |
| Issue-less `/bkit-auto` and `bkit-cloud.yml` dispatch | Non-goal: "`/bkit-auto` stays issue-only" (#650 Constraints); T2 only pins fail-closed | #650 § Constraints and non-goals (scope-declared) — deferral `650-bkit-auto-issue-less` |
| Automatic FID continuity across reworded issue-less re-runs | Q7 "No change"; doc line in § Best-effort runs is in scope (T16) | #650 "Open questions: answered" Q7 (scope-declared) — deferral `650-issue-less-fid-continuity` |

**Deferral rows (mirror of the table).** `.bkit/jsonl.md` § Write Idiom forbids a literal `ts`; this subagent has no shell to mint one. The plan orchestrator (or human) runs these from the worktree root on behalf of `@bkit-plan-generate` before Gate 1; T17 verifies them. Existing rows checked: no `650-*` key in `docs/deferrals.jsonl`.

```sh
jq -nc '{ts:(now*1000|floor),kind:"deferral",repo:"cbartens/bkit",bkitVersion:"5.5.0",workflow:"plan",step:"plan-generate",subagent:"bkit-plan-generate",model:"claude-opus-5-5",key:"650-preflight-linear-issue-less",type:"feature",category:"agentic",severity:"LOW",reason:"scope-declared",summary:"preflight-linear.sh still stops a Linear cloud agent that has no LINEAR_ISSUE_ID",description:"`.bkit/core/hooks/preflight-linear.sh` L13-18 hard-stops a background Linear agent without LINEAR_ISSUE_ID. Issue-less runs (#650) are a session-prompt path; Linear cloud agents are always launched from an issue, so the hook is left as is.",remediation:"Relax the hook only if Linear cloud agents can be launched without an issue",source:"phase",status:"OPEN",references:["650","https://github.com/cbartens/bkit/issues/650 (Open questions: answered, Q6)",".bkit/core/hooks/preflight-linear.sh"]}' >> docs/deferrals.jsonl
jq -nc '{ts:(now*1000|floor),kind:"deferral",repo:"cbartens/bkit",bkitVersion:"5.5.0",workflow:"plan",step:"plan-generate",subagent:"bkit-plan-generate",model:"claude-opus-5-5",key:"650-bkit-auto-issue-less",type:"feature",category:"agentic",severity:"LOW",reason:"scope-declared",summary:"/bkit-auto and bkit-cloud.yml stay issue-only",description:"CI always dispatches /bkit-auto with an issue or PR. #650 makes the five phase workflows issue-optional and only pins that /bkit-auto fails closed on an issue-less marker or FID.",remediation:"Design issue-less cloud dispatch (kill-switch without a bkit:auto label, FID guard in bkit-cloud.yml) if CI ever dispatches without an issue",source:"phase",status:"OPEN",references:["650","https://github.com/cbartens/bkit/issues/650 (Constraints and non-goals)",".bkit/core/workflows/bkit-auto.md"]}' >> docs/deferrals.jsonl
jq -nc '{ts:(now*1000|floor),kind:"deferral",repo:"cbartens/bkit",bkitVersion:"5.5.0",workflow:"plan",step:"plan-generate",subagent:"bkit-plan-generate",model:"claude-opus-5-5",key:"650-issue-less-fid-continuity",type:"feature",category:"agentic",severity:"LOW",reason:"scope-declared",summary:"An issue-less re-run with different wording mints a new FID, so the attempt counter restarts",description:"Naming the FID in the prompt keeps continuity, as with the none tracker; the no-issue warning names the FID for reuse and workflows.md Best-effort runs documents it. No automatic lookup of a prior FID.",remediation:"Add a lookup that offers recent issue-less FIDs on the same branch when a prompt names none",source:"phase",status:"OPEN",references:["650","https://github.com/cbartens/bkit/issues/650 (Open questions: answered, Q7)",".bkit/core/.bkit/workflows.md"]}' >> docs/deferrals.jsonl
```

> [!CAUTION]
> **Default = in-scope.** `Exempt` only if genuinely-additive — not required by `Success Criteria`, `Acceptance Scenario` / `Derived Test Matrix` row, or design (non-goals excepted). Required items → runbook task, never deferral; parking here = `Blocking` deferral → plan review / scope-check pulls back. Mirror each `Exempt` row in `docs/deferrals.jsonl`. Audit `LOW` → `Exempt` rows here.

## Suggested Scope Expansion

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| `branches land` MCP fallback (exit 80 → agent merges via MCP) does not assert the PR base is `dev` | Survey of this plan (no ledger row) | T4 / T15 base guards | Fold in — one prose assert mirroring T15's Step 10 assert |
| `639-refused-ship-failed-record-lost-in-cloud-container` | `docs/deferrals.jsonl` | `pushToDev` / handover used by T12 replay | Keep deferred |
| `384-required-status-checks-on-dev-via-bkit-protect-main` | `docs/deferrals.jsonl` | Debug pushing straight to `dev` (T12 / T14) | Keep deferred |
| `363-main-branch-trigger-excluded-reversal` | `docs/deferrals.jsonl` | `main` guards (T4 / T5 / T15) | Keep deferred |
| `per-workflow-rollback-path-for-shipped-bkit-workflow-changes` | `docs/deferrals.jsonl` | Rollback of five-workflow prose change | Keep deferred |
| `steps-placeholder-gate-false-positive-on-derived-issue-dump` | `docs/failures.jsonl` | `steps gate --placeholder` with an empty `ISSUE_ID` (T3 / T8) | Needs design decision — T8 only omits the empty `ISSUE_ID` placeholder; the dump false positive is separate |

> [!CAUTION]
> **Candidates, not scope.** Human review only — not runbook tasks, must not expand scope. Fold in only on design scope or explicit human decision → becomes task, leaves list.

## Security & Privacy

> Reference: `docs/security.md`. Check all that apply; skip inapplicable rows.

- [ ] **User Input** — FIDs from the prompt, PR-body marker and branch name reach filesystem paths (`docs/plans/{YYYYMM}/logs/{FID}/`, `.worktrees/_land-{FID}`, `git-path bkit/shared-checkout/{FID}.json`): every new fallback (`fromMarker` / `fromBranch` issue-less, `prMarker`, `--issue=""`) passes `SLUG` + `ISSUE_LESS_FID` before any path use; `auto-fid-guard.test.ts` pins traversal / injection values (T2).
- [ ] **Role-Gated Mutation (privileged merge)** — merge into `main` enforced in the engine, not prose: `prs merge` base check reads the live PR base at merge time; `prs open --base=main` refused (T4); MCP fallback asserts base first (T15).
- [ ] **Data exposure** — own-path commits keep unrelated working-tree files out of pushed commits (T11); the dirty-path record lives under `.git` (`git rev-parse --git-path`), never committed, so unrelated file names never leave the clone.
- [ ] **Trust boundary (`/bkit-auto`)** — issue-less markers never enable cloud dispatch: `runs context` keeps refusing a context with no issue (T2).

_Not applicable: New API Route, New DB Table/Column, PII, Redirect URL, Webhook, New Secret/Env Var — no routes, DB, secrets or env vars._

## Pre-Flight / Dependencies

**CRITICAL:** Check off all core items. Check conditional items only when applicable. Abort if anything required is missing.

### Core

Always verify.

- [ ] **Package Management:** No new packages; `package.json` + `pnpm-lock.yaml` unchanged.
- [ ] **Dependency Versions:** Run `pnpm bkit:deps:outdated`; spot-check `npx tsc --version`, `pnpm --version`, `git --version` (`commitBookkeeping` `requireGitVersion` needs `--pathspec-from-file`), `gh --version`.
- [ ] **Existing-Solution Search (reuse over duplicate):** Done at plan time → `Reuse Inventory`; build re-runs the in-repo sweep if a candidate appears mid-build.
- [ ] **User Context:** Write access to `.bkit/core/**`, `.bkit/wording.md`, `docs/**`, `CHANGELOG.md`, `dist/`; mirrors regenerated only via `pnpm bkit upgrade` (never edit `.claude/`, `.cursor/`, `.opencode/`).
- [ ] **Project Context:** Fold `docs/knowledge.jsonl` and `docs/decisions.jsonl` by `key` (highest `ts`, `ACTIVE` / absent only). Relevant: #486 never-create decision rows; CI-Dispatch Gate rows; `pushToDev` / dev-lock rows; `381-*` egress rows (no new egress); knowledge `KN-11` (skip-ci HEAD on `dev` push).
- [ ] **Testing & Quality:** `docs/testing.md` tiers — `*.test.ts` = Unit, `*.integration.test.ts` = Integration; test-first red then green; full `pnpm vitest run`, never scoped.
- [ ] **Prerequisite Plans:** None.

### Conditional

Verify only when applicable.

- [ ] **Secrets & Env Vars:** N/A — none added.
- [ ] **Schema State:** N/A — no database.
- [ ] **Architecture & UI:** One new test file next to its sources (`.bkit/core/engine/commands/workflow/`); no new source files, routes or UI.
- [ ] **Observability:** N/A — CLI JSON on stdout + `log()` lines on stderr per command conventions; no new log names, spans or audit tables.
- [ ] **Notifications:** N/A.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT — `[x]` all applicable boxes above. **do not stop for user permission.** Proceed to `Data Schema Integration`.

- [ ] **Acceptance Scenario confirmed:** Human confirmed `👤 Acceptance Scenario` section (checkbox is `[x]`).
- [ ] **Breaking Changes confirmed:** Human confirmed `⚠️ Breaking Changes & Naming Review` section (checkbox is `[x]`).
- [ ] **Open Questions confirmed:** Human confirmed `👤 Open Questions & Assumptions` section (checkbox is `[x]`).
- [ ] **Security & Privacy checked:** All applicable `Security & Privacy` rows verified (or "None" justified).
- [ ] **Reuse Inventory complete:** every capability has a row with non-empty `Search performed` + `Decision`; every `NEW` cites an allowed reason.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

## Data Schema Integration

None — bkit has no database. File stores touched (run logs, ledgers, git-path run record) are covered in `Architecture & Component Changes`.

**Invariant Conformance:** Multi-store or privileged writes → every mutation path maintains every store a read surface depends on, under a compatible privilege, with the returned error actually checked (never swallowed). If a write can fail on privilege/constraint, the plan says how that failure surfaces — not a silent 200.

Applied to file / git stores: run-record write, own-path commit and own-commit push each return a command-specific non-zero exit with the failing `git` stderr (`EXIT_FOREIGN_PATH`, existing `EXIT_COMMIT` / `EXIT_PUSH_FAILED`, `EXIT_SHARED_BUSY`); the workflow routes non-zero to its existing Failure Path. A refused `dev` push never reports `pushed: true`.

### Data Schema Usage

None.

### Data Schema Changes

None.

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- |
| Issue-less FID rule + issue-id shapes | `grep -rn "FID_PATTERNS\|SLUG\|ISSUE_FORMAT\|FID_FORMAT" .bkit/core/engine`; read `fids.ts` | `fids.ts` `FID_PATTERNS` (github / linear / jira / none / any), `SLUG`; duplicate `FID_FORMAT` / `ISSUE_FORMAT` in `prs.ts` | EXTEND | Add `ISSUE_LESS_FID`, `ISSUE_ID_PATTERNS`, `fidProblem` to `fids.ts`; delete the `prs.ts` duplicates |
| `fids check --issue` | `grep -n "check" fids.ts`; `fids.test.ts` L206–251 | `fids.ts` `check` verb | EXTEND | Route through `fidProblem` when `--issue` present |
| Issue-less marker / branch recovery | references to `fromMarker`, `fromBranch` (`runs.ts`, `prs.ts`, `cloud-ctx-step`) | `fids.ts` `fromMarker` / `fromBranch` | EXTEND | Fallback to `ISSUE_LESS_FID` → `issueId: null` |
| Gate FID check | `steps.ts` `gateChecks` L442–483 | `gateChecks` FID branch L457–466 | EXTEND | `--issue` → `fidProblem` |
| PR marker | `grep -rn "prMarker" .bkit/core/engine` | `prs.ts` `prMarker` (used by `prs open`, `branches land`) | EXTEND | FID-only marker when wired + no issue |
| Base guards on open / merge | `grep -n "base\|mergePr" prs.ts`; ship Step 2 L258 assert, Step 10 L518 | `prs.ts` `prs open`, `mergePr`; prose-only asserts in `bkit-ship.md` | EXTEND | Engine refusals; prose keeps MCP-path assert |
| Ship refusal / missing branch / `main` in place | `worktrees.ts` L115–120, L421–534; `worktrees.test.ts` L126–205 | `worktrees.ts` `setup` | EXTEND | Text + `main` refusal + missing-branch message |
| Dirty-path snapshot | `grep -rn "dirtyTracked\|status --porcelain" .bkit/core/engine` | `ledgers.ts` `dirtyTracked` (tracked only, no untracked, no hash) | EXTEND | Reuse in `worktrees.ts` setup; add untracked + content hash (`git hash-object`) |
| Own-path commits | read `steps.ts` `writeStepRow` L372–412 (`git add -A` L405); `ledgers.ts` `commitBookkeeping` L276–406 (`git add -u` L314–317, pathspec commit L383–390) | `writeStepRow`, `commitBookkeeping` | EXTEND | Pathspec staging / commit excluding recorded paths; temp index only for an empty own set |
| Own-commit push / replay onto `origin/dev` | `branches.ts` `pushBranch` L555–641 (mode `dev` plain push L617–629); `commands/land.ts` `pushToDev` L112–156; callers `branches.ts:648` / `1067`, `workflows.ts:604` | `pushBranch`; `pushToDev` (throwaway `.worktrees/_land-{FID}`, retry when `dev` moved) | EXTEND | `pushBranch` mode `dev` + record → plain push or `pushToDev` replay of `startSha..HEAD`; `pushToDev` gains a commit-range input if it takes only paths today |
| `dev` CI wait after push | `runs.ts` `ciDispatchGate` L1247; `runs wait --until=completed`; `runs gate --capstone-only`; `bkit-build.md` CI wait turn loop L54 | `runs dispatch` / `wait` / `gate` | EXTEND | `runs dispatch` on a shared branch by pushed SHA, no PR; prose reuses build's wait loop shape |
| Shared wording | `.bkit/wording.md` clause list; `pnpm wording:sync` | `workflow-issue-id-missing` et al. | EXTEND | Change text, old → `retired`; two new clauses in the same file |
| `{ISSUE_ID}` may be empty qualifier | `grep -n "may be empty" .bkit/core/workflows` | `bkit-auto.md` placeholder line | EXTEND | Copy the qualifier into the five workflows |
| Real-git integration harness | `Glob **/*.integration.test.ts` under `.bkit/core/engine` | `close-squash.integration.test.ts` fixture (bare remote + clone) | new (test file) | (a) no integration test covers in-place shared-branch commits / push; reuses the existing fixture helpers, no new helper module |

> [!CAUTION]
> **Default = `EXTEND`.** `NEW` only allowed for:
> (a) no candidate — `Search performed` shows the commands establishing absence;
> (b) extending breaks the candidate's contract or callers — name both;
> (c) candidate is a `Supersession Inventory` `DELETE` — replacement, not duplicate.
>
> never accept cleaner-fresh / messy-existing / close-but-different as a `NEW` reason — messy candidate → extend and clean it, in scope. Empty `Search performed` = UNSEARCHED, not `NEW`-eligible.
>
> Each `EXTEND` row must land as `[MODIFY] path/to/existing` in `Architecture & Component Changes` and a task in `Agent Execution Runbook`; each `NEW` row as `[NEW]` carrying the same reason. `[NEW]` with no row = unjustified.

## Architecture & Component Changes

**CRITICAL:** Justify new file locations per `docs/architecture.md` topology.
**CRITICAL:** Prefer `[MODIFY]` over `[NEW]`. Every `[NEW]` must trace to a `Reuse Inventory` `NEW` row and carry its reason — no parallel reimplementation. Superseded → `Supersession Inventory` as `DELETE`.
**CRITICAL:** Frontend/Mobile → adhere to `docs/design.md`.
**CRITICAL:** Verify `[MODIFY]` files exist (else `[NEW]`). Before changing exported symbol/signature/contract: find callers/importers/schemas/consumers (language-server references when configured + text search), list blast radius.
**CRITICAL:** Include backend actions for new schema validations (e.g. Zod `schema.parse`).
**CRITICAL:** NEVER weaken gate to pass: no type-system escapes (e.g. TS `as any` / `as unknown as` / `@ts-ignore`, Python `# type: ignore`), linter disables (e.g. `eslint-disable`, `//nolint`), test skips (e.g. `.skip`, `xfail`), deleted assertions, empty `catch` / error-swallowing, mocking-away unit under test. Fix root causes; per-file opt-out needs explicit human sign-off.
**CRITICAL:** Auto-capture (e.g. log drains / CDC) does not replace explicit logging — log edge cases escaping auto-capture with the project's structured logger (e.g. `console.error("[Context] Message", payload)`). See `docs/observability.md` for naming, severity, correlation IDs, label taxonomy.

### Database Migrations

None — no database.

### Engine — FIDs and markers (Wave 1)

#### [MODIFY] `.bkit/core/engine/commands/workflow/fids.ts`

- **Existence Check:** exists.
- Add `ISSUE_LESS_FID` (`SLUG` and no `-`-separated all-digit word), `ISSUE_ID_PATTERNS` (github `^[0-9]+$`; linear / jira `^[A-Za-z][A-Za-z0-9]*-[0-9]+$`), `fidProblem(fid, tracker, issue?)`: `issue` undefined → today's `FID_PATTERNS[tracker]` check; non-empty → `issue` matches `ISSUE_ID_PATTERNS[tracker]` and FID matches `FID_PATTERNS[tracker]`; empty with a wired tracker → `ISSUE_LESS_FID`; `none` → today.
- `fids check --issue=<v>` → `fidProblem`; exit 1 + message on problem.
- `fromMarker` / `fromBranch`: wired tracker, value fails the tracker shape but passes `SLUG` + `ISSUE_LESS_FID` → `{ fid, issueId: null }`; `fids parse` output follows.
- **Blast radius:** `fromMarker` / `fromBranch` callers — `runs.ts` (`runs context`: keep its refusal when `issueId` is null), `prs.ts`, `cloud-ctx-step` template; `fids check` callers — five workflows Step 1.

#### [MODIFY] `.bkit/core/engine/commands/workflow/steps.ts`

- **Existence Check:** exists.
- `gateChecks` L457–466: new `issue?: string` on `GateOptions`; `--issue` → `fidProblem(fid, tracker, issue)`.
- `writeStepRow` L404–411: see Wave 3.

#### [MODIFY] `.bkit/core/engine/commands/workflow/prs.ts`

- **Existence Check:** exists.
- `prMarker`: wired tracker + empty / absent issue → `<!-- bkit:fid={FID} -->` after `fidProblem(fid, tracker, "")`; delete `FID_FORMAT` / `ISSUE_FORMAT`, import from `fids.ts`.
- `prs open`: `--base=main` → `EXIT_BASE_MAIN` before any `gh` call.
- `mergePr`: read the PR's current base (`gh pr view --json baseRefName`) at merge time; not `dev` → `EXIT_BASE_NOT_DEV`, no merge. Exit-80 MCP path unchanged (prose assert, T15).
- **Blast radius:** `prs open` (ship Step 2, debug Step 11 PR mode, `branches land` PR-to-dev fallback), `prs merge` (ship Step 10 L518), `workflows.ts` `closePr` L1045 (close, not merge — unaffected).

#### [MODIFY] `.bkit/core/engine/commands/workflow/branches.ts` (land)

- **Existence Check:** exists.
- `branches land` L1067–1100: `--issue` optional; empty → FID-only marker via `prMarker`.

#### [MODIFY] `.bkit/core/engine/commands/workflow/worktrees.ts`

- **Existence Check:** exists.
- Ship on `dev` / `main`: refusal text from `Breaking Changes` (prefix `refusing to ship ${target}` kept — pinned by `worktrees.test.ts`); exit unchanged.
- L115–120: `feat/{FID}` absent → `feat/{FID} does not exist — name the feature branch to ship`; ship never creates it.
- L421–534: `main` refused in place for design / plan / build / debug.

#### [MODIFY] `dist/`

- Rebuilt by `pnpm build`; `pnpm bkit:check:dist` gates it.

### Engine — debug on `dev` in place (Wave 3)

#### [MODIFY] `.bkit/core/engine/commands/workflow/worktrees.ts` (shared-checkout record)

- `setup` for an in-place run on a shared branch (`isSharedBranch`, i.e. `dev`): after the existing checks, write `{ fid, branch, startSha, originSha, aheadAtStart, paths: [{ path, hash | null }] }` to `$(git rev-parse --git-path bkit/shared-checkout/{FID}.json)` — paths = `git status --porcelain -z` (tracked + untracked) via extended `dirtyTracked`; `hash` = `git hash-object` of the working file, `null` when deleted.
- Another FID's record present with a live workflow lock → `EXIT_SHARED_BUSY`; stale record (no lock) replaced. Same-FID re-run keeps the original record.
- Record removed at `workflows close` / abort (`workflows.ts` L982–996 / L600–604).

#### [MODIFY] `.bkit/core/engine/commands/workflow/ledgers.ts`

- `dirtyTracked` → optionally include untracked paths (`--others --exclude-standard`) for the record.
- `commitBookkeeping` L314–317: record present → `git add -u -- . ':(exclude)<p>'…` via `--pathspec-from-file`; any recorded path whose current hash differs → `EXIT_FOREIGN_PATH` naming paths. Pathspec commit (L383–390) unchanged.
- **Blast radius:** `branches.ts:948` / `1048`, `workflows.ts:528` / `1084`, `ledgers.ts:411`.

#### [MODIFY] `.bkit/core/engine/commands/workflow/steps.ts` (`writeStepRow`)

- L404–411: record present → own set = current `git status --porcelain -z` paths minus recorded paths; recorded path hash changed → `EXIT_FOREIGN_PATH` (row already appended; message says commit refused, names paths); non-empty own set → `git add` + `git commit --pathspec-from-file` of the own set (foreign index entries stay staged); empty own set → commit through a temp `GIT_INDEX_FILE` read from `HEAD` (`--allow-empty`). No record → `git add -A` path unchanged.
- **Blast radius:** `context.ts:835`, `tests.ts:578`, `steps.ts:763` / `976`, `workflows.ts:872`, `runs.ts:1283` — all inherit; none change.

#### [MODIFY] `.bkit/core/engine/commands/workflow/branches.ts` (`pushBranch`)

- Mode `dev` with a record (L589–629): `git fetch origin dev`; own commits = `startSha..HEAD`; `aheadAtStart == 0` and `origin/dev` is an ancestor of `HEAD` → `git push origin dev`; else → `pushToDev` replay of `startSha..HEAD`; output gains `replayed: boolean`, `sha` = pushed `origin/dev` SHA (the CI SHA); log line with the resync command (Open Question 3). Skip-CI check (L593–601) runs on the replayed HEAD message too. No record → unchanged.
- **Blast radius:** `branches.ts:648` (verb), `branches.ts:1067` (land), `workflows.ts:604` (abort).

#### [MODIFY] `.bkit/core/engine/commands/land.ts`

- **Existence Check:** exists (`pushToDev` L112–156).
- Accept a commit range to cherry-pick onto fresh `origin/dev` in `.worktrees/_land-{FID}` (if today's input is a path set only); retry-on-moved-`dev` loop reused; conflict → non-zero exit with the conflicting paths, throwaway checkout removed.

#### [MODIFY] `.bkit/core/engine/commands/workflow/runs.ts`

- `ciDispatchGate` L1247: shared branch + pushed SHA, no `--pr` → resolve the push-event run for that SHA; exits unchanged.

### Shared wording and workflows (Wave 2, Wave 3 prose)

#### [MODIFY] `.bkit/wording.md`

- Changed clauses per `Breaking Changes` (old text → `retired`); new `workflow-no-issue-warning` (names the missing issue, the FID, "no tracker reads, labels or comments", reuse hint) and `workflow-final-first-line`; `workflow-large-diff` gains `{{base}}`. `pnpm wording:sync` propagates.

#### [MODIFY] `.bkit/core/workflows/bkit-design.md`, `bkit-plan.md`, `bkit-build.md`, `bkit-debug.md`, `bkit-ship.md`

- All five: `**No issue:**` bullet in a `bkit:tracker true` block; `{PLACEHOLDERS}` qualifier; Step 1 recovery → warning → continue; mint clause; `--issue="{ISSUE_ID}"` on `fids check` + Gate 1 `steps gate`; `--placeholder ISSUE_ID=` omitted when empty; `**Skip if** ISSUE_ID empty` before every `issues labels --board` fence (two per workflow), `issues comment` / `issues text`, Failure Path tracker writes; `prs open` / `branches land` drop `--issue` when empty; warning first in close return, summary-FAIL display (design 10, plan 11, build 17, debug 10, ship 6), Failure Path STOP; `Append issue link` skipped when empty; gate items "skipped when `ISSUE_ID` empty"; Jira related-issues `key != {ISSUE_ID}` dropped when empty (design / plan / debug). ASCII operators only.
- design Step 11 guarded; build Step 1.4 + Step 18.9 kill-switch guarded; Failure Path L59–89 tracker writes guarded.
- debug: Step 1 sub-step 6 — no `prs probe` on `dev` / `main`, `PUSH_MODE=LOCAL`; Step 11.9 kill-switch guarded; Step 11 (L593–738) on `dev`: `{DIFF_BASE}` = record `startSha`, `branches push --mode=dev`, dispatch on pushed SHA, `runs wait --until=completed`, `runs gate --capstone-only`, red → Failure Path; Gate 11 item true on `dev`; any prose `git add -A` / `git push origin dev` removed.
- ship: L236 issue-less → warn when branch is not `feat/{FID}`; refusal flow prints the engine text and STOPs; Step 14.3 labels guarded; Step 10 (L505–542) MCP fallback asserts PR base `dev` before merge; Step 2 L258 assert kept.

#### [MODIFY] `.bkit/core/AGENTS.md`

- Router (L27–49, L33): drop `STOP with No issue ID provided.`; no issue → warning, continue.

### Docs (Wave 4)

#### [MODIFY] `.bkit/core/.bkit/workflows.md`, `.bkit/core/.bkit/trackers.md`, `.bkit/core/.bkit/lite.md`, `docs/testing.md`, `CHANGELOG.md`

- Per `Documentation Updates`.

### Tests

#### [NEW] `.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts`

- **Reuse Check:** `Reuse Inventory` row "Real-git integration harness" — reason (a): no integration test covers in-place shared-branch commits / push; reuses `close-squash.integration.test.ts` fixture helpers. Location: next to the sources it exercises, `*.integration.test.ts` per `docs/testing.md`.
- Fresh bare remote + clone on `dev`; foreign modified + untracked + staged files; one unpushed foreign commit; run `worktrees setup` (debug, in place), `steps finish`, `ledgers commit`, `branches push --mode=dev`; assert remote log = run commits only, foreign files byte-identical and still uncommitted / staged, `replayed: true`; changed pre-dirty file → `EXIT_FOREIGN_PATH`.

#### [MODIFY] existing tests

- `fids.test.ts`, `steps.test.ts`, `prs.test.ts`, `worktrees.test.ts`, `ledgers.test.ts`, `branches.test.ts`, `runs.test.ts`, `land.test.ts`, `auto-fid-guard.test.ts`, `cloud-ctx-step.integration.test.ts`, `close-squash.integration.test.ts`, `workflow-shape.test.ts`, `ci-dispatch-gate-alignment.test.ts`, `ship-invariants.test.ts`, `render/trackers.test.ts`, `wording.test.ts` — per runbook task.

### Ledger Rows (decisions)

Existing rows checked: no `650-*` key in `docs/decisions.jsonl`. Same constraint as the deferral rows: the plan orchestrator (or human) runs these from the worktree root on behalf of `@bkit-plan-generate`; T17 verifies.

```sh
jq -nc '{ts:(now*1000|floor),kind:"decision",repo:"cbartens/bkit",bkitVersion:"5.5.0",workflow:"plan",step:"plan-generate",subagent:"bkit-plan-generate",model:"claude-opus-5-5",key:"650-issue-less-runs-warn-and-continue",references:["650","486","490",".bkit/core/engine/commands/workflow/fids.ts",".bkit/wording.md",".bkit/core/.bkit/workflows.md"],summary:"A wired-tracker run with no issue in the prompt warns and continues issue-less instead of stopping; workflows still never create tracker issues",description:"Step 1 of /bkit-design, /bkit-plan, /bkit-build, /bkit-debug and /bkit-ship recovers the issue from a FID named in the prompt or a feat/{FID} branch. With none it sets ISSUE_ID empty, prints the no-issue warning (also the first line of every final message) and skips every issue-tied tracker read, label, comment and board call. The issue-less FID is {branch-suffix}-{slug} with all-digit words dropped; fids check and steps gate take --issue and reject a FID with an all-digit word when --issue is empty. PR markers carry only bkit:fid; fromMarker and fromBranch return issueId null for it. /bkit-auto stays issue-only.",rationale:"After #490 made design and plan optional the issue was the last required input, and requiring it blocked /bkit-debug on red dev CI. This reverses the stop half of #486; the never-create half stays. Dropping all-digit words makes an issue-less FID unparseable as an issue id under github, linear and jira regardless of the tracker in force.",alternatives:["Keep the STOP: rejected, blocks dev CI repair","Auto-create an issue: rejected, #486 never-create rule","Reject only FIDs matching the active tracker shape: rejected, a tracker switch could make an old FID parse as an issue"],status:"ACTIVE"}' >> docs/decisions.jsonl
jq -nc '{ts:(now*1000|floor),kind:"decision",repo:"cbartens/bkit",bkitVersion:"5.5.0",workflow:"plan",step:"plan-generate",subagent:"bkit-plan-generate",model:"claude-opus-5-5",key:"650-ship-never-targets-main",references:["650",".bkit/core/engine/commands/workflow/prs.ts",".bkit/core/engine/commands/workflow/worktrees.ts",".bkit/core/workflows/bkit-ship.md"],summary:"/bkit-ship never opens or merges a PR into main; bkit prs open refuses --base=main and bkit prs merge refuses any PR whose base is not dev",description:"worktrees setup refuses ship on dev or main with text saying releases stay manual, keeping the refusing to ship prefix. prs merge reads the live PR base at merge time, so a PR retargeted to main after ship Step 2 is never merged; the ship Step 10 MCP fallback asserts the base first. Releasing dev into main stays manual and utility-new-release stays separate and bkit-internal.",rationale:"Nothing re-checked a PR base after ship Step 2, so a PR retargeted to main mid-run would have been merged into main; prose asserts are not enforcement.",alternatives:["Prose-only refusal in bkit-ship.md: rejected, not enforced","prs open refusing every non-dev base: rejected, the owner scoped the open guard to main (Q4)","Fold the release into /bkit-ship: rejected, releases stay manual"],status:"ACTIVE"}' >> docs/decisions.jsonl
jq -nc '{ts:(now*1000|floor),kind:"decision",repo:"cbartens/bkit",bkitVersion:"5.5.0",workflow:"plan",step:"plan-generate",subagent:"bkit-plan-generate",model:"claude-opus-5-5",key:"650-debug-on-dev-in-place-own-files-own-commits",references:["650",".bkit/core/engine/commands/workflow/worktrees.ts",".bkit/core/engine/commands/workflow/steps.ts",".bkit/core/engine/commands/workflow/ledgers.ts",".bkit/core/engine/commands/workflow/branches.ts",".bkit/core/engine/commands/land.ts",".bkit/core/workflows/bkit-debug.md"],summary:"/bkit-debug on dev works in place in the main checkout, commits only its own paths, pushes only its own commits and waits for dev CI on the pushed commit",description:"worktrees setup records local dev HEAD and the modified and untracked paths with content hashes under the git dir when debug runs in place on a shared branch. steps finish and bookkeeping commits stage and commit only paths outside that set and refuse when a recorded path changed. branches push --mode=dev pushes plainly when local dev was level with origin/dev at the start, else replays the run commits onto origin/dev through pushToDev in a throwaway checkout. Step 1 never probes for a PR on dev, so PUSH_MODE is LOCAL. Step 11 dispatches, waits for and gates the dev CI run on the pushed SHA. Debug still creates no branch.",rationale:"git add -A swept unrelated files into debug commits, git push origin dev pushed unrelated local commits, Gate 11 claimed a CI check that never happened on dev, and the Step 1 PR lookup could pick up and retitle an open dev-to-main release PR.",alternatives:["Worktree on feat/{FID} plus branches land: rejected by the owner (#650 Q1)","git stash around the run: rejected, the stash stack is shared across worktrees and sessions","Temporary index for every commit: kept for the empty-own-set case only, pathspec commits already isolate the index"],status:"ACTIVE"}' >> docs/decisions.jsonl
```

### Cron Jobs & Scheduled Tasks

None.

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `prs.ts` `FID_FORMAT` / `ISSUE_FORMAT` | `fids.ts` `FID_PATTERNS` / `ISSUE_ID_PATTERNS` / `fidProblem` | DELETE | Duplicate shape rules drift; one source |
| `.bkit/core/AGENTS.md` L33 `STOP with No issue ID provided.` | Warning-and-continue router line | DELETE | Contradicts the new contract |
| `worktrees.ts` ship refusal text (`refusing to ship ${target}…` body) and "commit or stash local changes" message for a missing `feat/{FID}` | New refusal text; missing-branch message | DELETE | Misleading / incomplete; prefix kept |
| Debug Step 11 prose `git add -A` / `git push origin dev` (if any survive) | `steps finish` / `branches push --mode=dev` | DELETE | Bypasses the shared-checkout record |
| `.bkit/wording.md` STOP texts of changed clauses | Same clauses' new `text`; old text in `retired` | RETAIN-WITH-REASON | (a) external contract — `retired` blocks are how `wording:sync` / `wording.test.ts` detect stale copies in consumer files; not exported code |

> [!CAUTION]
> **Default = `DELETE`.** `RETAIN-WITH-REASON` only allowed for:
> (a) external contract — atomic migration impossible (third-party callers, public API);
> (b) staged rollout with kill-date and follow-up issue link.
>
> never accept `@deprecated` and still exported as a resolution. Each `DELETE` row must be mirrored as `[DELETE] path/to/file` in `Architecture & Component Changes` and as a removal task in `Agent Execution Runbook`.

No file-level `[DELETE]`: every row removes a symbol or text inside a `[MODIFY]` file; removal tasks: T4 (`FID_FORMAT` / `ISSUE_FORMAT`), T5 (worktrees texts), T10 (`AGENTS.md`), T14 (debug prose), T7 (wording → `retired`).

## Documentation Updates

> Docs this change touches only; delete rest. Core below; others via `.agents/docs.md`. Code-change treatment — rewrite prose, no lazy bullet appends.

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `docs/decisions.jsonl` | 3 rows (`650-issue-less-runs-warn-and-continue`, `650-ship-never-targets-main`, `650-debug-on-dev-in-place-own-files-own-commits`) via the jq block in Architecture |
| `docs/deferrals.jsonl` | 3 rows (`650-preflight-linear-issue-less`, `650-bkit-auto-issue-less`, `650-issue-less-fid-continuity`) via the jq block in Out of Scope |
| `docs/testing.md` | Rewrite rows L587 / L606 (FID / workflow-shape coverage) for `--issue` and issue-less markers; add a row for `shared-checkout.integration.test.ts` |
| `.bkit/core/.bkit/workflows.md` (→ `.bkit/workflows.md`) | L148 / 151 / 152 / 174; § FID generation ("No issue →" issue-less shape, all-digit words dropped); § Best-effort runs (no issue → warning first line, continue; naming the FID keeps continuity, Q7); § Branch eligibility (ship never `dev` → `main`; debug on `dev` in place: own paths, own commits, waits for `dev` CI); Step 1 rows L843 / 867 / 893 / 931 / 984; ship naming-warning rows; L1364–1388 |
| `.bkit/core/.bkit/trackers.md` (→ `.bkit/trackers.md`) | L74 `issue-id-extraction` (recovery from FID / branch), L75 `fid-format` (issue-less rule), L86–87 PR marker (FID-only under a wired tracker), L157 / L163 |
| `.bkit/core/.bkit/lite.md` (→ `.bkit/lite.md`) | L25: no issue named → skip the tracker lines |
| `.bkit/core/AGENTS.md` (→ `AGENTS.md`) | Router L33 (T10) |
| `CHANGELOG.md` | `[Unreleased]` — Added: issue-less runs, `--issue` flag, engine main-base guards, debug-on-`dev` own-path / own-commit push + CI wait; Changed: ship refusal text, `main` refused in place for design / plan / build; Fixed: ship naming warning issue-less, build 18.9 / debug 11.9 kill-switch, ship 14.3 on merged runs |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | N/A | No database |
| **Code** | `git revert {COMMIT}` of the wave commits (or the squash); rebuild `dist/`; `pnpm bkit upgrade` regenerates mirrors; consumers pin the previous `@cbartens/bkit` version | Engine + workflows ship together in the package; reverting one without the other leaves workflows passing `--issue` to an engine that rejects unknown flags |
| **Risk window** | Issue-less PRs opened before a revert carry `<!-- bkit:fid=X -->` under a wired tracker; the reverted `fromMarker` no longer resolves them | Recovery: name the FID in the prompt; `/bkit-auto` already refuses them, so no cloud run fires |

_Code-only — `git revert` sufficient._

## Agent Execution Runbook

> [!IMPORTANT]
> **Continuous Execution:** Run runbook autonomously; no user permission at Gates; `[x]` as you go.
> **Step Isolation:** Finish task (verify + checkbox) before next.
> **Integration Shape:** may suggest PR / commit / sequencing — advisory, never a gate; one PR for all tasks always OK. Do not specify merge method.

**Integration shape (advisory):** four waves per the issue's order of work; each wave reviewed before commit. Contract changes (`fromMarker`, `prMarker`, `writeStepRow`, `commitBookkeeping`, `pushBranch`, `ciDispatchGate`) → grep every caller and read each hit in full before editing. Workflow edits update `.bkit/core/.bkit/workflows.md` in the same change (T16 lands in the same PR).

**Implementation Tasks:**

> Every task MUST include `**Done when:**` — terse, testable, codebase-verifiable (file exists / signature matches / test passes / behaviour observable). Plan-verify asserts before `[x]`. No task without `Done when:`. One task per in-scope audit finding id; group only on one shared root cause in report — every id still named.
>
> **Tests ship with their task.** Task adding / changing logic → names its own unit tests in `Done when`, matrix row or not; tests it breaks → fixed in same task. never defer task tests to later tasks to avoid splits that leave untested code and drop coverage gates.
>
> **Build order and test source.** Order tasks by build dependency (schema → API → UI). Behaviour tests only from `Derived Test Matrix` rows — do not invent. Boundary-crossing tasks (DB / API / model / network / migration) carry paired non-mock `Done when` tests; pure-function tasks exempt from pairing, not from unit tests.
>
> **Test first.** Every task MUST include `**Test first:**` after `Done when`. Behaviour change at unit / integration tier → one or more tests, `;`-separated, each `` `{test file}` `` `` `{test name}` `` fails on {assertion} — repo-relative test files, test names as the runner reports them or their last segments, no `;` in assertion text; build sees each fail against stubs before writing the task's code. No behaviour change (docs, config, pure refactor) or E2E / `@live` tier only → `n/a — {reason naming which}`.
>
> **Issue tasks.** Change-shape issue (`.bkit/trackers.md` § Issue shapes) → its `Tasks` lines are the starting runbook; keep each `Done when` / `Test first` (tighten, never weaken); renumber in build order.

**Wave 1 — Engine, tests, `dist/`**

- [ ] **Task 1:** Issue-less FID rule and `fids check --issue` in `fids.ts`. **Done when:** `.bkit/core/engine/commands/workflow/fids.ts` exports `ISSUE_LESS_FID`, `ISSUE_ID_PATTERNS`, `fidProblem`; `bkit fids check --fid=dev-ci-failures --issue=""` exits 0 under github / linear / jira; `123-fix`, `fix-2-retry`, `dev-123-x` with `--issue=""` exit 1 naming the rule; `--issue=650` (github) requires the github shape; flag absent and `none` tracker unchanged; `fids.test.ts` covers each row. **Test first:** `.bkit/core/engine/commands/workflow/fids.test.ts` `check --issue="" accepts dev-ci-failures under github` fails on exit code 0 — flag unknown, FID not github-shaped; `.bkit/core/engine/commands/workflow/fids.test.ts` `check --issue="" rejects a FID with an all-digit word under every wired tracker` fails on exit code 1 — `123-fix` passes the github shape today; `.bkit/core/engine/commands/workflow/fids.test.ts` `fidProblem with --issue absent matches today` fails on the missing export.
- [ ] **Task 2:** Issue-less fallback in `fromMarker` / `fromBranch` / `fids parse`; `/bkit-auto` fail-closed pins. **Done when:** under github / linear / jira, `fromMarker("<!-- bkit:fid=dev-ci-failures -->")` and `fromBranch("feat/dev-ci-failures")` return `{ fid: "dev-ci-failures", issueId: null }`; `fids.test.ts` L206–251 "embeds no … issue id" rows flipped to `issueId: null`; tracker-shaped values parse as today; `SLUG` failures still return no result; `runs context` keeps its refusal exit for `issueId: null`; `auto-fid-guard.test.ts` (L78–82 and new rows) rejects traversal / injection values through both fallbacks; `cloud-ctx-step.integration.test.ts` asserts an issue-less marker resolves no issue and the step refuses. **Test first:** `.bkit/core/engine/commands/workflow/fids.test.ts` `fromMarker returns issueId null for a FID-only marker under github` fails on the returned issueId — no result today; `.bkit/core/engine/commands/workflow/fids.test.ts` `fromBranch returns issueId null for feat/dev-ci-failures under linear` fails on the returned issueId — no result today. (`auto-fid-guard` and `cloud-ctx-step` rows are fail-closed pins, green before and after.)
- [ ] **Task 3:** `steps gate --issue`. **Done when:** `.bkit/core/engine/commands/workflow/steps.ts` `GateOptions.issue` set from `--issue`; FID check uses `fidProblem`; absent flag unchanged; `steps.test.ts` covers issue-less pass and digit-word fail. **Test first:** `.bkit/core/engine/commands/workflow/steps.test.ts` `gate --issue="" fails the fid check for 123-fix under github` fails on ok true — flag ignored, github shape matches; `.bkit/core/engine/commands/workflow/steps.test.ts` `gate --issue="" passes the fid check for dev-ci-failures under github` fails on ok false — github shape required today.
- [ ] **Task 4:** `prs.ts` marker + base guards; `branches land` issue-less. **Done when:** `prMarker` emits `<!-- bkit:fid={FID} -->` with a wired tracker and empty issue; `FID_FORMAT` / `ISSUE_FORMAT` removed (`grep -n "FID_FORMAT\|ISSUE_FORMAT" .bkit/core/engine` empty); `bkit prs open --base=main` exits `EXIT_BASE_MAIN` with no `gh` call; `bkit prs merge` on a PR whose live base is not `dev` exits `EXIT_BASE_NOT_DEV` with no merge call; `branches land` without `--issue` writes the FID-only marker; tests in `prs.test.ts`, `close-squash.integration.test.ts`. **Test first:** `.bkit/core/engine/commands/workflow/prs.test.ts` `prMarker writes a FID-only marker with github wired and no issue` fails on the marker text — throws for a missing issue today; `.bkit/core/engine/commands/workflow/prs.test.ts` `prs open refuses --base=main` fails on exit code — opens today; `.bkit/core/engine/commands/workflow/prs.test.ts` `prs merge refuses a PR whose base is main` fails on the merge call count — merges today; `.bkit/core/engine/audits/workflows/close-squash.integration.test.ts` `lands an issue-less run with a FID-only marker` fails on the PR body marker.
- [ ] **Task 5:** `worktrees setup` refusals. **Done when:** ship on `dev` / `main` prints the `Breaking Changes` refusal text (prefix `refusing to ship ${target}` kept), exit unchanged; missing `feat/{FID}` for ship → message names the missing branch, no "commit or stash"; design / plan / build / debug in place on `main` refused; `worktrees.test.ts` L126–205 updated + new rows. **Test first:** `.bkit/core/engine/commands/workflow/worktrees.test.ts` `ship on dev refuses with the releases-stay-manual text` fails on the message text; `.bkit/core/engine/commands/workflow/worktrees.test.ts` `ship names a missing feat branch` fails on the message text — says commit or stash today; `.bkit/core/engine/commands/workflow/worktrees.test.ts` `build in place on main is refused` fails on exit code 0.
- [ ] **Task 6:** Rebuild `dist/` for Wave 1. **Done when:** `pnpm build` exits 0; `pnpm bkit:check:dist` exits 0. **Test first:** n/a — build artefact, no behaviour change of its own.

**Wave 2 — Wording and the five workflows**

- [ ] **Task 7:** `.bkit/wording.md` clauses. **Done when:** `workflow-issue-id-missing` / `-none` text = recover from FID / branch, else `ISSUE_ID=""`, emit `workflow-no-issue-warning`, continue, never create a tracker issue; `workflow-issue-read-none` is a template with a reason slot (no tracker wired / no issue named); `workflow-fid-mint` / `workflow-fid-unset` apply under every tracker (issue-less shape, slug from the prompt, all-digit words dropped); `workflow-gate-issue-id` = "issue resolved, or the no-issue warning emitted"; `workflow-issue-link` skipped when empty; `workflow-large-diff` has `{{base}}`; new `workflow-no-issue-warning`, `workflow-final-first-line`; every old text in its clause's `retired` block; `pnpm wording:sync` exits 0; `.bkit/core/engine/tools/wording.test.ts` green. **Test first:** n/a — prose clauses; behaviour pinned by Task 8 / Task 9 `workflow-shape.test.ts` rows.
- [ ] **Task 8:** Shared changes in all five workflows. **Done when:** each of `.bkit/core/workflows/bkit-{design,plan,build,debug,ship}.md` has: `**No issue:**` header bullet inside `<!-- bkit:tracker true start -->…end`; `{PLACEHOLDERS}` line qualifier "`{ISSUE_ID}` may be empty"; Step 1 sub-step 2 recovery → warning → continue and sub-step 3 empty inputs (no STOP on a missing issue in any wired-tracker block); `--issue="{ISSUE_ID}"` on `fids check` and Gate 1 `steps gate`; no `--placeholder ISSUE_ID=` when empty; `**Skip if** ISSUE_ID empty` before every `issues labels --board` fence, `issues comment` / `issues text` block and Failure Path tracker write (`bkit-build.md` L59–89 and peers); `prs open` / `branches land` without `--issue` when empty; warning first in close return, summary-FAIL display (design 10, plan 11, build 17, debug 10, ship 6) and Failure Path STOP; `Append issue link` skipped when empty; gate items read "skipped when `ISSUE_ID` empty"; Jira related-issues `key != {ISSUE_ID}` dropped when empty; `workflow-shape.test.ts` new rows green; `render/trackers.test.ts` `none` output byte-identical. **Test first:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `no wired-tracker block STOPs on a missing issue` fails on the STOP match in Step 1; `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `fids check and steps gate carry --issue in every workflow` fails on the missing flag; `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `No issue bullet sits in a tracker true block` fails on the missing bullet; `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `every issues labels --board fence has a Skip if ISSUE_ID empty line` fails on the first unguarded fence; `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `final messages start with the no-issue warning clause` fails on the missing clause.
- [ ] **Task 9:** Per-workflow skips. **Done when:** design Step 11 runs only with an issue; build Step 1.4 blocker check and Step 18.9 kill-switch skipped when `ISSUE_ID` empty; debug Step 11.9 kill-switch skipped when empty; debug Step 1 sub-step 6 runs no `prs probe` on `dev` / `main` (`PUSH_MODE=LOCAL`); plan `fids design` unchanged; `workflow-shape.test.ts` rows green. **Test first:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `build 18.9 and debug 11.9 kill-switch checks skip when ISSUE_ID is empty` fails on the missing Skip if line; `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `debug Step 1 never probes for a PR on dev or main` fails on the unguarded prs probe; `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `design Step 11 requires an issue` fails on the missing Skip if line.
- [ ] **Task 10:** Router. **Done when:** `.bkit/core/AGENTS.md` has no `No issue ID provided`; router line says no issue → warning, continue. **Test first:** n/a — router prose, no engine behaviour.

**Wave 3 — Debug on `dev` in place, ship hardening**

- [ ] **Task 11:** Shared-checkout record + own-path commits. **Done when:** `worktrees setup` (debug, in place, `dev`) writes the record at `git rev-parse --git-path bkit/shared-checkout/{FID}.json` (start SHA, `aheadAtStart`, dirty + untracked paths with hashes) and refuses with `EXIT_SHARED_BUSY` when another FID's record has a live lock; `writeStepRow` with a record commits only non-recorded paths (pathspec; temp index when the own set is empty) and exits `EXIT_FOREIGN_PATH` naming paths when a recorded hash changed; `commitBookkeeping` `stageTrackedUpdates` excludes recorded paths and applies the same refusal; record removed at close / abort; without a record, behaviour unchanged; tests in `steps.test.ts`, `ledgers.test.ts`, `worktrees.test.ts`, `shared-checkout.integration.test.ts` (foreign modified / untracked / staged files untouched and uncommitted after `steps finish` + bookkeeping commit). **Test first:** `.bkit/core/engine/commands/workflow/steps.test.ts` `writeStepRow with a shared-checkout record never commits a recorded path` fails on the committed path list — `git add -A` takes it today; `.bkit/core/engine/commands/workflow/steps.test.ts` `writeStepRow refuses when a recorded path changed` fails on exit code; `.bkit/core/engine/commands/workflow/ledgers.test.ts` `stageTrackedUpdates skips recorded paths` fails on the staged path list; `.bkit/core/engine/commands/workflow/worktrees.test.ts` `in-place debug on dev writes the shared-checkout record` fails on the missing record file; `.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts` `foreign staged and untracked files survive a run commit` fails on the HEAD tree containing notes.md.
- [ ] **Task 12:** Own-commit push. **Done when:** `pushBranch` mode `dev` with a record pushes `startSha..HEAD` only — plain `git push origin dev` when `aheadAtStart` is 0 and `origin/dev` is an ancestor of `HEAD`, else `pushToDev` replay in `.worktrees/_land-{FID}` (retry on moved `dev`, conflict → non-zero with paths, throwaway checkout removed); output `replayed`, `sha` = pushed remote SHA; resync command logged; skip-CI check applies to the replayed HEAD; no record → unchanged; tests in `branches.test.ts`, `land.test.ts`, `shared-checkout.integration.test.ts` (remote log = run commits only; foreign local commit absent). **Test first:** `.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts` `push from an ahead local dev lands only the run commits` fails on the remote log containing the foreign commit; `.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts` `push from a level local dev is a plain push` fails on replayed true; `.bkit/core/engine/commands/land.test.ts` `pushToDev replays a commit range onto origin/dev` fails on the missing range input.
- [ ] **Task 13:** `runs dispatch` on `dev`. **Done when:** `ciDispatchGate` (`runs.ts` L1247) on a shared branch with the pushed SHA and no `--pr` resolves the push-event run and exits 0 when it started; non-shared branches unchanged; `runs.test.ts` row. **Test first:** `.bkit/core/engine/commands/workflow/runs.test.ts` `dispatch on dev with a pushed sha and no pr proves the run started` fails on exit code — empty `--pr` rejected today.
- [ ] **Task 14:** Debug Step 11 on `dev` prose. **Done when:** `.bkit/core/workflows/bkit-debug.md` Step 11 on `dev`: Large Diff Guard uses `{DIFF_BASE}` = record start SHA (`workflow-large-diff` `{{base}}`; `workflow-shape.test.ts` L248 updated); `bkit branches push --mode=dev`; `bkit runs dispatch` on the pushed SHA; `bkit runs wait --until=completed`; `bkit runs gate --capstone-only`; red → Failure Path naming the run (Open Question 1 default A); `EXIT_FOREIGN_PATH` → STOP asking the human (no Failure Path); Gate 11 "CI-Dispatch gate ran" true on `dev`; no prose `git add -A` / `git push origin dev` left (`grep -n "git add -A\|git push origin" .bkit/core/workflows/bkit-debug.md` empty); `ci-dispatch-gate-alignment.test.ts` (L46–90, L207–236) updated + new rows. **Test first:** `.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts` `debug Step 11 on dev waits for and gates the dev CI run` fails on the missing runs wait call; `.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts` `debug Step 11 on dev dispatches by pushed sha` fails on the empty --pr match.
- [ ] **Task 15:** Ship prose hardening. **Done when:** `.bkit/core/workflows/bkit-ship.md` L236 issue-less → warn when branch is not `feat/{FID}`; `dev` / `main` refusal prints the engine text and STOPs; Step 14.3 labels guarded by `**Skip if** ISSUE_ID empty`; Step 10 (L505–542) MCP fallback asserts PR base `dev` before merging; Step 2 L258 assert and Step 10 label re-read before `prs merge` kept; `ship-invariants.test.ts` new rows green, existing rows unchanged. **Test first:** `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `naming warning fires issue-less when the branch is not feat/{FID}` fails on the ISSUE_ID-only condition; `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `Step 10 MCP merge asserts base dev` fails on the missing assert; `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `Step 14.3 labels skip when ISSUE_ID is empty` fails on the missing Skip if line.

**Wave 4 — Docs, ledgers, mirrors, verification**

- [ ] **Task 16:** Docs. **Done when:** every `Documentation Updates` row except the two ledgers is done — `.bkit/core/.bkit/workflows.md`, `.bkit/core/.bkit/trackers.md`, `.bkit/core/.bkit/lite.md`, `docs/testing.md` (L587 / L606 rewritten; `shared-checkout.integration.test.ts` row), `CHANGELOG.md` `[Unreleased]`; `grep -rn "No issue ID provided\|No issue ID in the session prompt" .bkit/core` hits only `retired` blocks; prose is current-state only. **Test first:** n/a — docs.
- [ ] **Task 17:** Ledger rows present. **Done when:** `jq -c 'select(.key|startswith("650-"))' docs/decisions.jsonl docs/deferrals.jsonl` prints the 3 decision + 3 deferral rows from this plan with numeric `ts` (appended by the plan phase); `pnpm bkit check` ledger lint passes. If absent, STOP and report — the build orchestrator is not a listed writer for either kind (`.bkit/jsonl.md` L40 / L43). **Test first:** n/a — ledger data.
- [ ] **Task 18:** Mirrors and `dist/`. **Done when:** `pnpm build` → `pnpm bkit upgrade` → `git config core.bare false` run; `.bkit/workflows.md`, `.bkit/trackers.md`, `.bkit/lite.md`, `AGENTS.md`, `.claude/`, `.cursor/`, `.opencode/` mirrors regenerated (no hand edits); `pnpm bkit check` and `pnpm bkit:check:dist` exit 0. **Test first:** n/a — generated mirrors.
- [ ] **Task 19:** Full verification + dogfood. **Done when:** `pnpm bkit:gate:static-unit-integration` exits 0 (full `pnpm vitest run`, not scoped; `tsc`); `pnpm bkit check` exits 0; `pnpm bkit:check:dist` exits 0; packed-tarball dogfood in a fresh scratch consumer under `/private/tmp` with the github tracker (`Manual Verification` steps 1–5) shows: rendered workflows with no Step 1 STOP on a missing issue; `fids check` / `steps gate` issue-less pass and digit-word fail; `prs open` with `gh` off `PATH` exits 80 with `<!-- bkit:fid=dev-ci-failures -->` in the printed body; `prs open --base=main` refused; `bkit install` and `bkit upgrade` both exercised. **Test first:** n/a — verification of earlier tasks.

### 🔒 Gate 2: Code Implementation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT — `[x]` all boxes below. **do not stop for user permission.** Proceed to `Testing & Documentation`.

- [ ] **No bolt-on / no gate-weakening:** every `[NEW]` traces to a `Reuse Inventory` `NEW` row and its search still holds — reusable artifact found mid-build → add a row, fold code into it; every `EXTEND` landed as a modification of the named artifact, not a parallel file. No type-system escapes (e.g. TS `as any` / `as unknown as` / `@ts-ignore`, Python `# type: ignore`), linter disables (e.g. `eslint-disable`, `//nolint`), test skips (e.g. `.skip`, `xfail`), empty `catch` / error-swallowing introduced to make a gate pass.
- [ ] **Test first:** every task naming `Test first` tests recorded a red per test before its code; tests unchanged since except added tests / formatting.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off against the plan.

> [!IMPORTANT]
> **Testing Strategy** (see `docs/testing.md`):
>
> - **Backend / pipeline logic** — test at the unit/integration tier (e.g. Vitest), not through a browser. Mock HTTP and assert against the real datastore natively.
> - **End-to-end integration** — core data paths need at least 1 integration test firing the real API against a local DB _without_ ORM/DB mocking.
> - **UI E2E (browser or device) for UI only** (e.g. Playwright) — don't drive a UI for non-visual logic.
>
> **UI E2E Conventions** — test-auth + data-factory per `docs/testing.md`: shared `setup` logs in once, reuses auth state (sign-in / sign-up / account-deletion tests opt out); typed factories with per-test overrides, not inline strings.

Applied here: engine logic at Unit (Vitest, `gh` mocked at the process boundary); real `git` against a fresh bare remote at Integration (`shared-checkout.integration.test.ts`, `close-squash.integration.test.ts`); no UI.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** Each `Acceptance Scenario → Derived Test Matrix` row → one runbook task whose `Done when` carries its test; gaps → add to that task, not here.
- [ ] **Sweep existing tests:** Each task fixed the tests it broke; full suite green per `docs/testing.md`. Fix only what tasks missed.
- [ ] **Sweep new tests:** Each task's `Done when` tests exist and pass per Testing Strategy; add only what tasks missed — not where tests are first written. Reuse data factories + auth conventions (above) for UI E2E tests.
- [ ] **Verify observability:** N/A for logs / spans — new refusals surface as command-specific exits with a `log()` line naming the cause (paths, base, FID rule); confirm each new exit prints one.
- [ ] **Update documentation:** Integrate logic into affected docs per `Documentation Updates` (Task 16); `docs/decisions.jsonl` rows present (Task 17). Rewrite ground-truth prose; do not append lazy bullet points.

### 🔒 Gate 3: Testing & Documentation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT — `[x]` all boxes below. **do not stop for user permission.** Proceed to `Verification Plan`.

- [ ] **Docs updated:** Every row in `Documentation Updates` completed. `.agents/docs.md` still accurate.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

## Verification Plan

> [!IMPORTANT]
> **Advisory build-phase checks, not merge gates.** Only `Agent Execution Runbook` `Done when` lines gate merge; nothing here does. Do not write "before merge" on untickable boxes — CI/human-only preconditions (lane RUN, deployed state, operator step) unenforceable. Work that MUST block merge → runbook task + codebase-verifiable `Done when`; lane that must run → CI config, not plan prose.

### Automated Tests

- [ ] **Full Local Gate Suite:** `pnpm bkit:gate:static-unit-integration` (typecheck, lint, `format:check`, prose, `slop:delta`, unit, integration) + `pnpm bkit check` + `pnpm bkit:check:dist`. Do not weaken gates (anti-suppression CRITICAL under Architecture & Component Changes). New `spawnSync` / `child_process` use in engine code → add to the `vi.hoisted` mock in `.bkit/core/engine/checks/after/index.test.ts` if `slop:delta` flags it.
- [ ] **Test Synchronization:** Existing tests updated in their task — `fids.test.ts` L206–251 (T2), `worktrees.test.ts` L126–205 (T5), `workflow-shape.test.ts` L248 Large Diff Guard (T14), `ci-dispatch-gate-alignment.test.ts` L46–90 / L207–236 (T14), `auto-fid-guard.test.ts` L78–82 (T2); unchanged-expectation suites kept green: `ship-invariants.test.ts` existing rows, `wording.test.ts`, `render/trackers.test.ts` `none` output.
- [ ] **Build Configuration:** New test file matches the existing `*.integration.test.ts` glob and stays out of `dist/` (`pnpm bkit:check:dist` clean).
- [ ] **Unit (`fids.test.ts`, `steps.test.ts`, `prs.test.ts`, `worktrees.test.ts`, `ledgers.test.ts`, `branches.test.ts`, `runs.test.ts`, `land.test.ts`, `auto-fid-guard.test.ts`, `workflow-shape.test.ts`, `ci-dispatch-gate-alignment.test.ts`, `ship-invariants.test.ts`, `render/trackers.test.ts`, `wording.test.ts`):** rows per Derived Test Matrix.
- [ ] **Integration (`shared-checkout.integration.test.ts`, `close-squash.integration.test.ts`, `cloud-ctx-step.integration.test.ts`):** fresh temp repos + bare remotes per test; removed in `afterEach`.
- [ ] **Apply local migrations:** N/A — no migrations.
- [ ] **Run all tests:** `pnpm vitest run` (full suite, not scoped); fix failures before Gate 4.

> [!IMPORTANT]
> **No Architectural Downgrades:** Build / compiler / test errors during verification → never hot-fix or anti-pattern; follow `docs/architecture.md` + named reference repos. Halt if stuck.

### 🔒 Gate 4: Automated Verification Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT — `[x]` all boxes below. **do not stop for user permission.** Proceed to `Manual Verification`.

- [ ] **Gate 4 - Verified:** Every checkbox in Automated Tests independently verified and checked off. Explicit proof (test outputs, CLI results, API responses) gathered.

### 👤 Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks — advisory only.** Run during build wherever a CLI can (Dashboard Ban below). An unticked box blocks nothing: not the merge, not plan approval. This is not a Gate 1 human-confirmation section.

> [!WARNING]
> **Dashboard Ban:** Proactively use local CLIs (e.g. `gh`, `vercel`, `npx supabase`) to verify CI/CD pipelines instead of asking users to check dashboards.

- [ ] **Step 1:** `pnpm build` → `pnpm pack` → fresh dir under `/private/tmp` → `git init`, set the github tracker → install the tarball → `npx bkit install`; render the five workflows and confirm no wired-tracker Step 1 block STOPs on a missing issue and each carries the `**No issue:**` bullet. Repeat via `npx bkit upgrade` from the previous published version in a second scratch dir.
- [ ] **Step 2:** In the scratch consumer: `npx bkit fids check --fid=dev-ci-failures --issue=""` → exit 0; `--fid=123-fix --issue=""` → exit 1; `npx bkit fids parse` on `feat/dev-ci-failures` → `issueId: null`; `npx bkit steps gate … --fid=dev-ci-failures --issue=""` → FID check `ok: true`.
- [ ] **Step 3:** With `gh` off `PATH`, `npx bkit prs open … --fid=dev-ci-failures` (no `--issue`) → exit 80, printed body contains `<!-- bkit:fid=dev-ci-failures -->`; `npx bkit prs open … --base=main` → refused before any `gh` call.
- [ ] **Step 4:** Scratch repo + local bare remote on `dev`: modified `notes.md`, one unpushed commit; run `worktrees setup` (debug, in place) → `steps finish` → `branches push --mode=dev`; `git log origin/dev` shows only the run commits, `git status` still shows `notes.md` modified, the unpushed commit remains local, output has `replayed: true`.
- [ ] **Step 5:** `npx bkit worktrees setup` for ship on `dev` → the releases-stay-manual refusal text.
- [ ] **Step 6:** Live session in a tracker-wired consumer on `dev` with red CI: `/bkit-debug ci failures on dev` → warning printed at Step 1 and as line 1 of the final message; no `bkit issues *` call in the transcript; fix lands on `origin/dev`; `gh run list --branch dev --commit {SHA}` shows the waited-on run.

<!-- bkit:end -->
