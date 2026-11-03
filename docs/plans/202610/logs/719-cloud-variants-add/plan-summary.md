Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Plan Summary

## Verdict

CONCERNS

- plan-review CONCERNS
- plan-apply-review CONCERNS
- 3 deferral(s) written this run

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| plan-start-workflow | - | - | 1 | - |
| plan-worktree-setup | - | - | 1 | `docs/plans/202610/logs/719-cloud-variants-add/plan-input-1.md` |
| plan-generate | - | - | 1 | `docs/plans/202610/logs/719-cloud-variants-add/plan-v1-draft.md`, `docs/plans/202610/logs/719-cloud-variants-add/plan-generate-check.md` |
| plan-fetch-context | - | - | 1 | `docs/plans/202610/logs/719-cloud-variants-add/related-deferrals.md`, `docs/plans/202610/logs/719-cloud-variants-add/related-failures.md`, `docs/plans/202610/logs/719-cloud-variants-add/related-issues.md` |
| plan-review | CONCERNS | 16 | 1 | `docs/plans/202610/logs/719-cloud-variants-add/plan-review-1.md`, `docs/plans/202610/logs/719-cloud-variants-add/plan-review-2.md`, `docs/plans/202610/logs/719-cloud-variants-add/plan-scope-check.md` |
| plan-apply-review | CONCERNS | - | 1 | `docs/plans/202610/logs/719-cloud-variants-add/plan-v2-reviewed.md`, `docs/plans/202610/logs/719-cloud-variants-add/plan-update-check.md` |

## Acceptance Scenario

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Testable feature contract — implementation, tests, verification derive from what you confirm here. Wrong here → wrong downstream.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). Agent handles rest.

### Narrative

A team picks whichever cloud agent they like (Claude, opencode, Codex or Cursor) and whichever tracker they already use (GitHub, Linear or Jira). `bkit install --auto=<agent>` works for that pairing, and from then on a passing or failing CI run on an opted-in feature hands the work to their agent exactly as Claude + GitHub does today. Removing `bkit:auto` from the issue stops the router on every tracker, and when the router cannot tell whether the label is there it starts nothing and says why.

### Success Criteria

1. Every `--auto={claude,opencode,codex,cursor}` x `--tracker={github,linear,jira}` install succeeds (codex also needs `--codex`); `--auto=<any>` with tracker `none` still refuses and names `--tracker=`.
2. Under Linear or Jira, a CI completion on an opted-in `feat/**` branch dispatches every router job whose credential is set (claude / opencode / codex); with the label removed, nothing dispatches. Jira keys with digits (`AB2-12`) dispatch like any other.
3. When the router cannot read the label (key missing, service down, issue not found, bkit not installable, output unparseable), it starts no agent, exits green, and the run log + job summary name the reason (the missing secret by name when that is the cause).
4. The session-start guard stops a Cursor background session or a Claude session that carries an issue id whose issue lost `bkit:auto` or is finished (by state category), on GitHub, Linear and Jira.
5. Setup advisories, `bkit check` findings and `.bkit/cloud.md` name only the configured tracker's keys; the support matrix lists each agent once with no tracker pairing; an adopted `bkit-cloud.yml` that predates this change is named by an advisory on `bkit upgrade` / `bkit check`, with a `docs/migrations.md` § Detect-only guards row.

> **Reading SC2 under owner decision `719-cloud-router-dispatches-recorded-agent-only` (newer than the design):** "every router job whose credential is set" builds and is tested as "the one router job named by `bkit.cloud.agent`, when its `BKIT_` credential is set". Text above is the design's, verbatim; see Open Questions & Assumptions.

### Process Sketch

- **WHEN** `bkit install --tracker=jira --codex --auto=codex` runs **→ THEN** `bkit.cloud.agent` = `codex` is recorded and the advisories name `BKIT_OPENAI_API_KEY`, `BKIT_JIRA_API_KEY` + `bkit.tracker.jira.site` and no other tracker's or agent's key.
- **WHEN** CI finishes on an opted-in `feat/**` branch under Jira **→ THEN** the context job checks out the PR head, installs the repo's bkit, recovers `AB2-12` with `bkit fids parse`, reads `bkit:auto` with `bkit issues fetch`, and starts only the `codex` job; the job summary row reads `pass`.
- **WHEN** the label is removed **→ THEN** the next CI completion starts no agent job; `gate: AB2-12 no longer carries bkit:auto` in log and summary.
- **WHEN** the label cannot be read (`BKIT_JIRA_API_KEY` unset, tracker down, `Install bkit` failed, unparseable output) **→ THEN** no agent starts, the run is green and a `::warning::` + summary row name the reason (the secret by name for `reason=auth`).
- **WHEN** `bkit install --auto=codex` runs without `.codex/` and without `--codex` **→ THEN** it exits 1 naming `bkit install --codex` and writes nothing.
- **WHEN** a Cursor background session starts on `feat/{FID}` under GitHub and the issue lacks `bkit:auto` or is closed **→ THEN** the guard stops it; with no issue id it records `bkit:auto not verified` and continues.
- **WHEN** `bkit upgrade` / `bkit check` meets a pre-change adopted `bkit-cloud.yml` under Linear / Jira, a `codex` agent with no codex job, or a legacy-named router secret **→ THEN** a detect-only advisory names the re-copy or the `gh secret set` / `gh secret delete` fix.

### Concrete Example

**Setup:** Maintainer of a Jira-tracked repo (`bkit.tracker.default` = `jira`, `bkit.tracker.jira.site` committed), Codex installed with bkit; issue `AB2-12` carries `bkit:auto`; its PR from `feat/ab2-12-login-retry` carries `<!-- bkit:issue=AB2-12 bkit:fid=ab2-12-login-retry -->`.

**Steps:**

1. Maintainer runs `bkit install --tracker=jira --codex --auto=codex` → System records `bkit.cloud.agent: "codex"`, prints `bkit-cloud-setup` naming the `bkit-cloud.yml` re-copy, `BKIT_OPENAI_API_KEY` and `BKIT_JIRA_API_KEY` + `bkit.tracker.jira.site`; no Anthropic, Linear or GitHub App line.
2. Maintainer copies `.bkit/templates/.github/workflows/bkit-cloud.yml`, sets `gh secret set BKIT_OPENAI_API_KEY` and `gh secret set BKIT_JIRA_API_KEY` → `bkit check` raises no router secret finding.
3. CI fails on the PR → `bkit-cloud.yml` context job checks out `feat/ab2-12-login-retry`, `Install bkit` succeeds, `bkit fids parse --marker … --branch …` gives `fid` `ab2-12-login-retry` + `issueId` `AB2-12`, `bkit issues fetch --issue AB2-12` returns `labels` with `bkit:auto` → `Select agent job` sets `codex=true` only → the `codex` job runs `openai/codex-action` with prompt `$bkit-auto debug <PR>`; summary row `jira | AB2-12 | pass | — | codex:BKIT_OPENAI_API_KEY`.
4. Maintainer removes `bkit:auto` from `AB2-12`; CI fails again → context job logs `::notice::[bkit-cloud] gate: AB2-12 no longer carries bkit:auto — no-op exit (kill switch)`, sets `skip=true`; no agent job starts; run green.

**Outcome:** one Codex debug run for the opted-in issue, none after the label is gone, each decision visible on the run summary page.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| **Several runner credentials set** | claude, opencode and codex jobs all start on one CI event and race on the same PR. The per-feature workflow lock does not prevent this (`logs/{FID}/.lock` lives in each runner's own checkout). Left as today, tracked by deferral `397-dual-agent-same-run-double-ship-when-both-secrets-set`, now three-way. — **Superseded by owner decision `719-cloud-router-dispatches-recorded-agent-only`:** only the job named by `bkit.cloud.agent` starts; other agents' secrets are ignored and named in the summary `jobs` field; deferral row now `TRIAGED` with that disposition. |
| **Adopted `bkit-cloud.yml` out of date** | under Linear / Jira it keeps no-oping with `serves the GitHub tracker only`; under `cloud.agent` = `codex` it has no codex job. Fails safe; the detect-only advisory is the only signal. |
| **Cursor session with no issue id** (`@cursor` on a GitHub issue, Cursor's CI trigger on a checkout not named `feat/{FID}`) | the guard cannot read a label; it records that in the session context and does not stop the session (open question). Linear sessions always carry `LINEAR_ISSUE_ID` and keep today's HARD STOP when it is missing. — Open question settled by `719-tracker-guard-no-issue-id-not-verified`: line `Guard pre-check: SKIPPED — no issue id; bkit:auto not verified`, exit 0. |
| **FID shape of another tracker** (Linear-shaped FID in a GitHub-tracker repo) | `bkit issues fetch --fid` resolves no issue under the configured tracker → no dispatch + notice; the router never guesses a tracker from the FID shape. — Built through `bkit fids parse` under the configured tracker (`719-cloud-router-issue-id-via-workflow-fids-parse`): no `issueId` → `fetch` prints `skipped: no-issue` → `no-issue` notice. |
| **Issue closed after ship, `dev` CI fails** | the router checks only `bkit:auto`, never the issue state, so the post-merge debug still dispatches; finished-state refusal belongs to the session guard only. |
| **`OPENAI_API_KEY` already stored for the app** | codex job starts on every opted-in CI event once the new template is merged. — **Superseded** by `719-cloud-router-secrets-bkit-prefixed` + `719-cloud-router-dispatches-recorded-agent-only`: the router reads `BKIT_OPENAI_API_KEY` only, and only when `bkit.cloud.agent` = `codex`; an app's `OPENAI_API_KEY` starts nothing. |
| Recorded agent's `BKIT_` secret unset, another agent's set | `enabled` true, `Select agent job` selects nothing; `::notice::` names the recorded agent's missing secret; summary `jobs` lists the ignored secret; no agent starts. |
| `bkit.cloud.agent` = `cursor` or `none` | no router agent job; notice names Cursor's native triggers / no variant. |
| `--auto=<any>` with tracker `none` | exit 1 naming `bkit install --tracker=<github\|linear\|jira> --auto=<v>`; no file written. |
| `--auto=codex` without `.codex/` and without `--codex` in the same run | exit 1 naming `bkit install --codex`; no file written; one-shot `bkit install --codex --auto=codex` passes. |
| `bkit issues fetch` exit 80 `reason=auth`, tracker secret empty in step env | `::warning::[bkit-cloud] gate: unreadable reason=auth` naming `BKIT_LINEAR_API_KEY` / `BKIT_JIRA_API_KEY`; no dispatch; run green. |
| `fetch` exits other than 0 / 80, prints nothing, or `labels` is not an array | `unreadable reason=output-unparseable`, never `label-absent`. |
| `Install bkit` failed (`node_modules/.bin/bkit` absent) | `::warning::[bkit-cloud] gate: bkit unavailable (step 'Install bkit' failed) — no dispatch; re-run or workflow_dispatch`. |
| Dev-arm commit subject names no FID or several issues (`fids parse --prompt-file` exit 8) | no FID → today's no-op notice; nothing dispatched. |
| Jira key with digits (`AB2-12`) in the PR-body marker | parsed by `fids parse`; dispatches like any other key. |
| Adopted router secret still under its legacy name (`ANTHROPIC_API_KEY`, `OPENCODE_PROVIDER_KEY`) | router reads the `BKIT_` name → credential unset → notice, no dispatch; `bkit check` raises `cloud-router-secret-renamed` with the `gh secret set` / `gh secret delete` fix. |
| Linear state renamed `Shipped` (type `completed`) or Jira status `Shipped` (category `done`) | `terminal` = `true`; guard stops the session. |
| Guard tracker read fails or times out (`curl --max-time 15`, Jira `timeout 20`) | HARD STOP naming tracker + reason. |
| GitHub guard with `BKIT_GH_TOKEN` unset | HARD STOP naming `BKIT_GH_TOKEN`. |
| Guard output on every branch | stdout is one JSON document (`kn-hooks-sessionstart-stdout-is-one-json-document`); the Jira `fetch` JSON never leaks to stdout. |
| Jira session where `node_modules/.bin/bkit` is absent | HARD STOP naming the missing bin (`719-cursor-jira-guard-hard-stop-without-bkit-bin`). |
| Tracker unset / `none` and no `LINEAR_ISSUE_ID` | advisory context only, exit 0 (today's behaviour). — Today this holds for Claude only; a Cursor background session HARD STOPs (`BKIT_LINEAR_API_KEY not set` / `LINEAR_ISSUE_ID not set`). Built as written (Cursor background relaxes to advisory, exit 0) and listed in Breaking Changes; Open Question 2 can keep the Cursor HARD STOP instead. |
| Tracker `linear` and no `LINEAR_ISSUE_ID` in a Cursor background session | HARD STOP naming `LINEAR_ISSUE_ID` (today's Linear behaviour, now keyed on the configured tracker). |
| Adopted router present, `bkit.cloud.agent` absent (router adopted by hand, never `bkit install --auto=`) | `Select agent job` reads `none` → no job, `::notice::` names `bkit install --auto=<claude\|opencode\|codex>`; `bkit check` raises `cloud-router-agent-unset`; `cloud-router` no longer says "active". |
| Dev-arm Jira FID with digits (`ab2-12-login-retry`) | passes `bkit_dev_dispatch_guard` and dispatches; a traversal value (`../x`) from the subject or the PR-body fallback is refused before any path use. |

## Open Questions

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Unknowns + assumptions this plan relies on. Unresolved question = risk; wrong assumption breaks downstream. If none, write "None".

Design questions 1-9 are settled by the owner rows in Context & Goals and are not reopened here.

- **Open Question:** Where do the two live checks run — TASK 15 (Cursor background `sessionStart` dump) and TASK 16 (three codex dispatches)? bkit's own router is disabled (`592-cloud-lane-disabled-in-bkit-repo`) and holds no secrets. Both checks sit in group 8, after the checks tasks, so TASKS 4-14 build without the repo; one owner hand-off covers both. → owner names the repo before the build reaches TASK 15.
  - **Options:** A) an owner sandbox repo (GitHub tracker) with this branch's packed bkit installed (`pnpm pack` → `pnpm add -D ./cbartens-bkit-*.tgz`), the new template adopted, `BKIT_OPENAI_API_KEY` set and a Cursor background environment — real signal; owner supplies repo, key and Cursor seat · B) bkit's own repo, router re-enabled for the run window — no new repo; overrides decision `592-cloud-lane-disabled-in-bkit-repo` and spends on bkit's Actions · C) one sandbox repo per tracker — also proves Linear / Jira live; contradicts `719-linear-jira-router-read-fixture-tests-only`
  - **Recommended:** A) — only option that keeps both recorded decisions and still gives the boundary signal.
  - **Default if unanswered:** A); the build pauses at TASK 15 until the repo, key and Cursor environment are named.
- **Open Question:** Cursor background session, tracker unset / `none`, no `LINEAR_ISSUE_ID` — the design's edge case says "advisory context only, exit 0 (today's behaviour)", but today Cursor HARD STOPs there (`preflight-sh.integration.test.ts:141-156`). Which outcome ships?
  - **Options:** A) advisory context, exit 0 (design outcome; matches `719-tracker-guard-no-issue-id-not-verified`: with no tracker there is no `bkit:auto` to verify, and `--auto=` refuses tracker `none`) — Cursor background agents become usable in tracker-less repos; relaxes a fail-closed path (Breaking Changes row) · B) keep today's Cursor HARD STOP under unset / `none` — fail closed, no behaviour change; every Cursor background session in a tracker-less repo stays blocked, and TASK 3's unset-tracker test becomes a regression pin with no red-first signal
  - **Recommended:** A) — the design states the outcome, the owner's no-issue-id rule applies the same reasoning, and no router dispatches into a tracker-`none` repo.
  - **Default if unanswered:** A); TASK 3 builds it.
- **Open Question:** Fold the `opencode` job's dependency install (`docs/failures.jsonl` `bkit-cloud-opencode-job-never-installs-repo-deps`, HIGH) into TASK 12?
  - **Options:** A) fold in — the same three-step install block as the codex job; one install shape across agent jobs; closes a known HIGH failure on a job this plan already edits; one more `workflow-templates.integration.test.ts` case · B) keep out — separate change; the opencode job keeps failing on a fresh runner (`/bkit-auto` Step 2 exit 127) until then
  - **Recommended:** A) — same file, same block, closes a HIGH failure.
  - **Default if unanswered:** B); stays a Suggested Scope Expansion candidate (no runbook task without owner approval).
- **Open Question:** Fold the `bkit install --opencode --auto=opencode` one-shot fix (the `.opencode/` check ignores `modules.has("opencode")`) into TASK 6?
  - **Options:** A) fold in — one condition beside the codex one in the same prerequisite branch, one `install.integration.test.ts` case; one-shot install works for every variant · B) keep out — opencode needs `--opencode` in an earlier run; Manual Verification Step 3 installs it that way
  - **Recommended:** A) — symmetric with the codex rule this plan adds.
  - **Default if unanswered:** B); stays a Suggested Scope Expansion candidate.
- **Assumption:** SC2 "every router job whose credential is set" is built and tested as "the one job named by `bkit.cloud.agent`, when its `BKIT_` secret is set" (`719-cloud-router-dispatches-recorded-agent-only`, newer than the design) → if the owner wants SC2 literal, TASK 7's `Select agent job` and its tests (plus TASK 9's `jobs` field tests) invert and deferral `397-dual-agent-…` reopens.
- **Assumption:** an adopted router with no `bkit.cloud.agent` dispatches nothing (absent reads `none`, no credential-presence fallback), per `719-cloud-router-dispatches-recorded-agent-only` → if wrong, `Select agent job` gains a fallback to today's credential-presence rule and TASK 7's absent-field test inverts; `cloud-router-agent-unset` (TASK 13) is the signal either way.
- **Assumption:** `docs/plans/{YYYYMM}/logs/{FID}/` exists on `dev` for every shipped FID (its `status.jsonl` is what today's dev-dispatch cap already reads on `origin/dev`), so `fids parse --prompt-file` resolves the squash subject's bare FID through `namedFid` → if wrong, the dev arm finds no FID and post-merge debug never auto-dispatches (fails safe: no-op notice, no false dispatch).
- **Assumption:** bkit-built feature branches carry their `.bkit/issues.jsonl` feature row, so `fids parse --branch` on the checked-out PR head yields `issueId` when the PR-body marker is missing → if wrong, the branch fallback resolves issue-less → `no-issue` notice; the marker path is unaffected.
- **Assumption:** Claude workload-identity federation stays on repo **variables** `ANTHROPIC_FEDERATION_RULE_ID` / `ANTHROPIC_ORGANIZATION_ID`, unrenamed (`719-cloud-router-secrets-bkit-prefixed` renames secrets only) → if wrong, TASK 7 / TASK 14 / docs rename them too and `cloud-router-secret-renamed` covers variables.
- **Assumption:** `openai/codex-action` v1 input names read from its `action.yml` on 2026-10-29 (`prompt`, `openai-api-key`, `sandbox`, `allow-bots`, `codex-home`, `codex-version`, `safety-strategy`) hold at the SHA pinned in TASK 12 → if renamed, the job fails at run time while actionlint passes; TASK 16 catches it before the template ships.
- **Assumption:** Cursor's `environment.json` `install` finishes before `sessionStart` fires (`719-cursor-jira-guard-hard-stop-without-bkit-bin`, option A) → if TASK 15's dump shows the bin absent, the build stops at TASK 15 and the plan gains the 30 s poll task through a plan update (the owner row's fallback; it reworks TASK 3's Jira branch), never built speculatively; unnoticed, every Jira background session HARD STOPs.
- **Assumption:** consumers run pnpm (the template's context job assumes it, as `bkit-ci.yml` already does) → a non-pnpm consumer adapts the copied install step, else every run reports `bkit-unavailable`.
- **Assumption:** cloud sessions that the guard reads GitHub for carry `BKIT_GH_TOKEN` (`.bkit/cloud.md` env blocks) → if absent, the GitHub branch is unreadable and HARD STOPs naming `BKIT_GH_TOKEN` (fail closed, not open; pinned by TASK 2's read-failure test).

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-build #719
```

Or, to address the reasons first: `/bkit-plan #719`
