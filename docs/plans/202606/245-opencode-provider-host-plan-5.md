<!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket). Logs sit at `docs/plans/{YYYYMM}/logs/{FID}/` and are delete-eligible. -->

# opencode Multi-Provider Execution Host (Approach B) — Sub-Plan E: unified `bkit-cloud.yml` cloud lane (claude + opencode, additive)

**Parent Plan:** [245-opencode-provider-host-plan.md](./245-opencode-provider-host-plan.md)

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read this actual sub-plan file natively via the `read_file` tool _before_ executing any steps.
> 2. NEVER trust system-generated session summaries or previous conversation history to determine what has been completed.
> 3. Your source of truth is EXCLUSIVELY the literal `[x]` vs `[ ]` checkboxes in this physical document. If a box is `[ ]`, it is NOT DONE, regardless of what the conversation context implies.

> [!IMPORTANT]
> **This is sub-plan 5 of 5 — the FINAL sub-plan.** It owns the unified cloud-agent lane: rename `bkit-auto.yml` → **a single `bkit-cloud.yml`** that carries BOTH a Claude dispatch job and an opencode dispatch job, each runtime-gated on which provider secret is present; the `bkit install --cloud=…` grammar for the additive github-host cloud lane; 🔒 Gate 5 (the non-interactive opencode-invocation confirm — a HARD precondition); and a live manual E2E.
>
> **Why this sub-plan exists (post-hoc):** the original #245 scope fenced out "a cloud lane for opencode — opencode is a local CLI with no managed cloud equivalent." That premise is now false: opencode shipped a managed GitHub Actions lane (`anomalyco/opencode/github` action, installed via `opencode github install`, triggered by `/oc` / `/opencode` comments). The master plan's Out-of-Scope note is superseded; this sub-plan delivers the lane.
>
> **Design decision (CONFIRMED 2026-06) — additive, one file, both hosts at runtime.** Hosts are NOT mutually exclusive — a consumer can install and run claude AND opencode together (local: `.claude/` + `.opencode/` coexist; cloud: one `bkit-cloud.yml` with both jobs). Whether the Claude job, the opencode job, or BOTH run on a given event is decided at RUNTIME by which secret is configured (`ANTHROPIC_API_KEY` → Claude job; `<PROVIDER>_API_KEY` → opencode job). The file is shipped byte-identical to every github-tracker consumer (tracker-sentinel substitution aside); it does NOT branch by install flag.
>
> **HARD PREREQUISITES:** plan-v4-1 … plan-v4-4 ALL complete. Specifically:
>
> - plan-v4-2: the `.opencode/` render target exists (the opencode cloud job installs + runs against it).
> - plan-v4-2: the 5 phase commands render to `.opencode/command/*.md` — the opencode job invokes `/bkit-auto <phase> <arg>` against that surface.
> - plan-v4-4: `bkit mode` removed + Approach-A removed, so the `--cloud=` token is unambiguously the cloud-lane axis.

## Context & Goals

bkit's Claude cloud lane has **two** GitHub surfaces today, and opencode mirrors them:

1. **`bkit-auto.yml`** — the bkit-managed phase **orchestrator**: CI pass/fail on `feat/**` → `ship`/`debug`; `workflow_dispatch` → any phase; opt-in gated (`bkit [auto route]` head-commit marker + live `bkit:auto` label kill-switch). This is what `bkit install --cloud=…` renders. **This is the surface this sub-plan unifies + extends to opencode.**
2. **`claude.yml`** — the reactive `@claude`-mention handler. Per DECISION-B, bkit ships **no template** for it; consumers self-install via `/install-github-app`. Its opencode analogue is the stock `opencode.yml` (the `/oc` / `/opencode` comment handler from `opencode github install`) — likewise **consumer-self-installed, not bkit-managed**.

So this sub-plan renames `bkit-auto.yml` → **`bkit-cloud.yml`** (filename now matches the `--cloud=` flag and the concept) and ADDS a second dispatch job to it for opencode. The two jobs share the identical trigger surfaces, opt-in gate, concurrency, and "resolve phase + brief context" step; they differ only in the dispatch step + auth:

- **`claude` job** — `anthropics/claude-code-action@v1` (OIDC App identity, `id-token: write`, `ANTHROPIC_API_KEY`); runs `/bkit-auto <phase> <arg>`. Runs only when `ANTHROPIC_API_KEY` is set.
- **`opencode` job** — the Gate-5-confirmed opencode invocation (likely `opencode run "/bkit-auto <phase> <arg>"` in a run step), provider key (`<PROVIDER>_API_KEY`), `mcp__github__*` surface, no OIDC. Runs only when the provider key is set.

Both can fire on the same event (a github-tracker repo running both hosts); a repo that sets only one secret runs only that job. The reactive `/oc` handler is documented as a consumer self-install, mirroring the `@claude`/`claude.yml` stance.

**Success Criteria (this sub-plan):**

- `bkit-auto.yml` is renamed to a single `bkit-cloud.yml` carrying both a `claude` and an `opencode` dispatch job; the Claude job behaves byte-for-byte as the old `bkit-auto.yml` did; consumer upgrade renames the old file (no orphan `bkit-auto.yml`).
- Each job is runtime-gated on its secret (`ANTHROPIC_API_KEY` → claude; `<PROVIDER>_API_KEY` → opencode); both can run on one event; neither runs without its secret (zero runner minutes).
- The opencode job drives `/bkit-auto <phase> <arg>` on an opencode runner against the committed `.opencode/` (cloud provider/model == the local pins; no model hard-coded in YAML), no Claude identity leak.
- `bkit install --cloud=…` renders `bkit-cloud.yml` for github-tracker consumers (claude + opencode are additive — both served by the one file); `--cloud=opencode` requires the local opencode host (`bkit install --opencode=<provider>`) first and takes no provider value (hard error if `.opencode/` absent); `--cloud=cursor` still renders `.cursor/Dockerfile` (linear, separate); install/upgrade byte-parity; manifest round-trips; uninstall zero footprint.
- `.bkit/cloud.md` support matrix documents the unified file + the runtime secret-gating + the provider-key secret.

**Related Issues:** `#245` (this plan), `#247` (Codex CLI host — separate cloud lane, out of scope here), `DE-26`.

> The full milestone-wide `👤 Acceptance Scenario` and `👤 Breaking Changes & Naming Review` live in [245-opencode-provider-host-plan-1.md](./245-opencode-provider-host-plan-1.md). Derived Test Matrix rows owned by THIS sub-plan: the `bkit-auto.yml` → `bkit-cloud.yml` rename (install/upgrade byte-parity + no-orphan), the opencode-job render + runtime secret-gating row, and the live `/bkit-auto`-on-opencode manual row.

## Merge Method

**Merge method: always squash.** Ships as its own squashed PR, AFTER plan-v4-4. The rename + the opencode job co-ship in one PR (same file).

## 🔒 Gate 5 (Precondition): Non-interactive `/bkit-auto` invocation confirmed

> [!CAUTION]
> **HARD GATE — confirm BEFORE authoring the opencode job.** The stock `anomalyco/opencode/github` action is **comment-event-driven** (`issue_comment` containing `/oc`). bkit's orchestrator fires from **CI completion + `workflow_dispatch`** with a **programmatic** prompt (`/bkit-auto <phase> <arg>`) — there is no triggering comment. claude-code-action exposes a `prompt:` input for exactly this; opencode's GitHub action may not.

- [ ] **Task 7.0 (confirm):** Determine the supported non-interactive invocation and record the verdict in the verification log. Check, in order:
  - (a) Does `anomalyco/opencode/github` accept a programmatic `prompt`-equivalent input (run a command with no triggering comment)? If yes → use the action, mirroring the claude job's `claude-code-action` step.
  - (b) **Likely path:** drive the opencode CLI directly in a run step — install opencode (pinned), then `opencode run "/bkit-auto $PHASE $ARG"` with the provider key + `mcp__github__*` surface. This mirrors the claude job's "resolve phase → dispatch" structure and is NOT tied to comment events. Confirm `opencode run` accepts a slash-command/command-file prompt and honours `.opencode/` config + permissions in CI.
  - **Done when:** the verification log states which mechanism (a) or (b) is used, pinned to a specific opencode version + action/CLI ref, with a captured CI-run snippet proving `/bkit-auto` reached the orchestrator non-interactively. If NEITHER works, the opencode job is parked and this sub-plan ships the rename + Claude job only (still a net improvement: the filename now matches the flag).

## Architecture & Component Changes

> bkit repo topology: engine in `.bkit/src/*.ts`, shipped templates in `.bkit/templates/`. `--cloud=` render is variant-dispatched (github-host → workflow; cursor → Dockerfile). This sub-plan renames the workflow to `bkit-cloud.yml` and adds the opencode job to it.

### Render-target template (`.bkit/templates/.github/workflows/`)

#### [RENAME + EXTEND] `bkit-auto.yml` → `bkit-cloud.yml`

- **Rename:** the existing tracker-conditional template (the `@@CLOUD_TRACKER_*@@` sentinels + the `bkit:start auto-route-gate` / `shared-deriv` markers) moves to `bkit-cloud.yml`. The Claude dispatch job is unchanged (byte-identical behaviour). Consumer-side upgrade DELETEs the old `bkit-auto.yml` and writes `bkit-cloud.yml` (rename-on-upgrade), not both.
- **Extend:** add a second job, `opencode`, sharing the same `on:` triggers + the `run` job's "resolve phase + brief context" step (factor the shared resolve step or duplicate it — GHA does not allow step reuse across jobs, so duplication is expected). The opencode job's dispatch step is the Gate-5 mechanism (`opencode run "/bkit-auto $PHASE $ARG"` against the **committed `.opencode/`**, so the cloud provider/model == the local one the consumer pinned via `bkit install --opencode=<provider>` — single source of truth, no model duplicated in YAML); auth = the provider key secret; `permissions:` per-job (the claude job keeps `id-token: write`; the opencode job omits it).
- **Runtime gating (CONFIRMED — secret-presence auto-detect):** GHA does not allow `secrets` in a job-level `if:`, so each job's FIRST step maps its secret to env and short-circuits (`[ -n "$KEY" ] || exit 0`) before the dispatch step. Setting `ANTHROPIC_API_KEY` enables the claude job; setting `<PROVIDER>_API_KEY` enables the opencode job; a job whose secret is absent is a near-instant no-op. No consumer-side `vars` toggle — the secret alone is the switch. (The opt-in gate `bkit [auto route]` + `bkit:auto` label still gates the whole workflow first.) Pin the opencode action/CLI by tag (no SHA — the bkit-shipped `renovate.json5` fences it; #124).

### Engine (`.bkit/src/`)

#### [MODIFY] `.bkit/src/bkit-cli.ts`

- `CloudVariant` (currently `claude | cursor`) gains `opencode`. **Additive semantics:** `--cloud=claude` and `--cloud=opencode` both render the SAME `bkit-cloud.yml` (the file serves both github hosts, with both jobs shipped regardless and gated at runtime by secrets); the value records consumer intent + drives the github-tracker pairing check. Any github-host value renders the one file — no multi-value `--cloud=claude,opencode` needed. `--cloud=cursor` renders the Dockerfile. `--cloud=opencode` takes **no provider value** — the cloud opencode job reads the committed `.opencode/` pins, so `--cloud=opencode` requires the local opencode host to be installed first (`bkit install --opencode=<provider>`); error clearly if `.opencode/` is absent. **Existence Check:** `CloudVariant` type at `bkit-cli.ts:19`, parser branch ~`bkit-cli.ts:245`.

#### [MODIFY] `.bkit/src/bkit-install.ts`

- `CLOUD_WORKFLOW_RELPATH` (`bkit-install.ts:888`): `bkit-auto.yml` → `bkit-cloud.yml` (still a single path — one file serves both github hosts). `renderCloudWorkflow` (`bkit-install.ts:920`) keeps doing the tracker-sentinel substitution; the both-jobs content is static (no per-host content branching).
- Cloud↔tracker pairing (`bkit-install.ts:1093`): a github-host cloud value (`claude` OR `opencode`) requires `tracker=github`; `cursor` requires `linear`. Update the rule + error string.
- Upgrade rename-reach: the upgrade collector (`bkit-install.ts:887`-area) must treat the old `bkit-auto.yml` as an orphan to remove when `bkit-cloud.yml` is the dest (mirror the D1 orphan-clean pattern), so upgrading consumers don't keep a stale `bkit-auto.yml`.

#### [MODIFY] `.bkit/src/bkit-manifest.ts`

- Rename the `cloud` module workflow row `.github/workflows/bkit-auto.yml` → `.github/workflows/bkit-cloud.yml` (`bkit-manifest.ts:243`); the `.cursor/Dockerfile` row is unchanged. Update the doc comments (`bkit-manifest.ts:118`-`243`) that enumerate cloud-variant→artifact (github hosts → one `bkit-cloud.yml`; cursor → Dockerfile). The manifest is the authoritative uninstall/check ledger — the renamed path MUST be listed or uninstall leaves the old file behind.

#### [MODIFY] `.bkit/src/bkit-modules.ts` (cloud module render + post-install advisory)

- The `runCloudModule` cloud advisory (`bkit-modules.ts:2168`-area, `id: "bkit-auto-setup"` + `cloud-env-customize`) currently references `bkit-auto.yml` and is **claude/cursor-only**. Two changes: (1) update the claude-branch text `bkit-auto.yml` → `bkit-cloud.yml` (and the "two coexist" note — `claude.yml` mention + `bkit-cloud.yml` triggers); (2) add an **opencode advisory branch** for `--cloud=opencode`: name the provider key secret (`<PROVIDER>_API_KEY`, NOT `ANTHROPIC_API_KEY`), state the cloud opencode job runs against the committed `.opencode/` (so the local opencode host must be installed first), note the secret-presence gate (set the key → the job runs; both jobs coexist), the `bkit:auto` label opt-in (unchanged), and that the stock `/oc` reactive handler is a separate consumer self-install (`opencode github install`). No `/install-github-app` / OIDC for the opencode job.
- `setConsumerBkitField("cloudAgents", …)` (`bkit-modules.ts:2166`/`2242`) currently records `"claude"` | `"cursor"` — add `"opencode"` (and confirm `bkit check` + the post-install advisory selection stay consistent with the recorded value). **Existence Check:** `runCloudModule` + the `cloudAgents` field setter both exist in `bkit-modules.ts`.

### Docs (`.bkit/cloud.md`)

- Update the § "Cloud-agent support matrix": the github-tracker cloud lane is a single `bkit-cloud.yml` with a `claude` job (secret `ANTHROPIC_API_KEY`, App via `/install-github-app`) AND an `opencode` job (secret `<PROVIDER>_API_KEY`); both runtime-gated, both can run on one event (additive). Note the stock `/oc` reactive handler is consumer-self-installed (mirrors the `@claude`/`claude.yml` stance), and that any github-host `--cloud=` value renders the one file.

## Security & Privacy

- [ ] **No plaintext keys** — each job reads its key from `secrets.*`, never inlined; the template ships only `secrets.*` references. The opt-in gate (`bkit [auto route]` + `bkit:auto` label) is preserved so neither job runs unsolicited / burns runner minutes; the per-job secret gate ensures an unconfigured host's job is a no-op.

## Agent Execution Runbook

> [!IMPORTANT]
> **Continuous Execution:** Work through this runbook autonomously. Do not pause for user permission at any Gate. Continuously check off `[x]` tasks as you go.
> **Blockers:** If a task cannot be completed, **DO NOT fail silently**. Create a tracker issue (label `blocker`) with context before stopping.
> **Step Isolation:** Complete each task fully (including its verification + checking its box) before starting the next.

> Every task MUST include a `**Done when:**` line — terse, testable, codebase-verifiable. Tasks crossing an external boundary (opencode CLI / provider model / GitHub Actions runner) carry a paired non-mock test naming the boundary + ground-truth signal.

### Phase 7 — unified cloud lane (external boundary: GitHub Actions runner + provider)

> Gate 5 (Task 7.0) MUST be green before Task 7.2.

- [x] **Task 7.1 (rename):** Rename the template `bkit-auto.yml` → `bkit-cloud.yml`; update `CLOUD_WORKFLOW_RELPATH`, `renderCloudWorkflow` call sites, the `bkit-manifest.ts` `cloud` workflow row + doc comments, and add the upgrade orphan-removal for the old path. **Update `renovate.json5` (+ `.bkit/templates/.github/renovate.json5`)** — `.github/workflows/bkit-auto.yml` is named in TWO rules (the tag-pin-fence `ignorePaths`/comment block ~L69-81 AND the `matchFileNames` rule ~L111-112); both must become `bkit-cloud.yml` or the renamed file loses its tag-pin fence (#124) and consumer Renovate starts bumping its action SHAs. **Do NOT change the Claude job's behaviour.**
  - **Done when:** `bkit install --cloud=claude --tracker=github` renders `.github/workflows/bkit-cloud.yml` whose Claude job is byte-identical to the pre-rename `bkit-auto.yml` output (a fixture diff proves only the filename + the added opencode job differ); `bkit-manifest.test.ts` round-trips the renamed path; an upgrade integration test confirms a consumer with the old `bkit-auto.yml` ends with `bkit-cloud.yml` and NO orphan `bkit-auto.yml`; `grep -rn 'bkit-auto.yml' .bkit/ .github/` returns nothing (catches both renovate references); the renamed file is still fenced in `renovate.json5`.
- [x] **Task 7.2 (opencode job + advisory):** Add the `opencode` dispatch job to `bkit-cloud.yml` per the Gate-5 mechanism (runs against the committed `.opencode/`), with the confirmed per-job secret-presence gate (FIRST step env-checks its secret, `exit 0` if absent — no `vars` toggle); register `opencode` in `CloudVariant` (`bkit-cli.ts`); update the cloud↔tracker pairing so any github-host value requires `tracker=github`; add the `--cloud=opencode` precondition that `.opencode/` exists (hard error pointing at `bkit install --opencode=<provider>` if absent). **Also update the `bkit-modules.ts` cloud advisory + `cloudAgents` field** (per the [MODIFY] `bkit-modules.ts` section): rename the claude-branch `bkit-auto.yml` refs → `bkit-cloud.yml`, add the opencode advisory branch (provider key secret, requires local `.opencode/`, secret-gate, `/oc` self-install note), and add `"opencode"` to `setConsumerBkitField("cloudAgents", …)`. **Requires:** Task 7.0, Task 7.1.
  - **Done when:** `bkit install --cloud=opencode --tracker=github` (and `--cloud=claude`) both render the same `bkit-cloud.yml` containing BOTH jobs; `--cloud=opencode` without a local `.opencode/` host hard-errors BEFORE any write (points at `bkit install --opencode=<provider>`); a non-github tracker hard-errors BEFORE any write (no partial state); `bkit-dry-run-parity.integration.test.ts` shows identical dry-run vs install writesets; `bkit-manifest.test.ts` round-trips; `bkit uninstall --cloud` removes the workflow (zero footprint); the YAML lints (actionlint); the claude job references no provider key and the opencode job references no `ANTHROPIC_API_KEY`; the per-job secret gate is asserted (claude job no-ops without `ANTHROPIC_API_KEY`; opencode job no-ops without the provider key); the opencode job references the committed `.opencode/` (no hard-coded model in the YAML); a unit assertion confirms the `--cloud=opencode` install advisory names the provider key + the local-host requirement and carries NO `bkit-auto.yml` / `ANTHROPIC_API_KEY` text, and `cloudAgents` records `"opencode"`.
- [x] **Task 7.3 (docs):** Update `.bkit/cloud.md` § support matrix for the unified `bkit-cloud.yml` (both jobs, runtime secret-gating, additive coexistence) + the `/oc` self-install note + the github-host pairing; add a decision-log entry recording the superseded Out-of-Scope premise + the additive/unified-file design.
  - **Done when:** `.bkit/cloud.md` documents the unified file, both jobs' secrets, the additive coexistence, and names the stock `opencode.yml` as consumer-self-installed; a Vale pass is clean; no internal tracker refs (BAR-/KN-) leak into consumer-facing text.
- [x] **Task 7.4 (tests):** Extend `bkit-cli.test.ts` (`--cloud=opencode` parses), `bkit-install.test.ts` / `bkit-install.integration.test.ts` (pairing-validation hard error; `.opencode/`-missing hard error; one-file-both-jobs render; per-job secret-gate assertion), `bkit-manifest.test.ts` (renamed row), `bkit-modules.test.ts` (the `--cloud=opencode` advisory text + `cloudAgents="opencode"`), and the upgrade integration suite (rename-on-upgrade no-orphan).
  - **Done when:** `pnpm test` green; `pnpm typecheck` + ESLint clean; `actionlint` clean on `bkit-cloud.yml`; `pnpm bkit check` clean on a dogfood install with `--cloud=opencode`.

### 🔒 Gate 6: Code + Automated Verification Confirmed

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Manual Verification`.

- [x] **Gate 6 - Verified:** Tasks 7.1–7.4 independently verified against their `Done when:` lines with explicit proof (test output, fixture diffs, `bkit check` exit codes, actionlint output).

## Verification Plan

### Automated Tests

- [ ] **Type Check & Lint:** `pnpm typecheck` + ESLint clean; `actionlint` clean on `bkit-cloud.yml`.
- [ ] **Dogfood (tarball, clean dir):** `pnpm pack` → fresh consumer dir → `bkit install --cloud=opencode --tracker=github` → confirm `bkit-cloud.yml` renders with both jobs + `bkit check` clean + `bkit uninstall --cloud` leaves zero footprint (per MEMORY: dogfood via packed tarball; verify install AND upgrade live).
- [ ] **Upgrade rename live:** upgrade a fixture consumer that has the old `bkit-auto.yml` → confirm it becomes `bkit-cloud.yml` with no orphan.
- [ ] **Run all tests:** `pnpm test` green.

> [!IMPORTANT]
> **No Architectural Downgrades:** On build/test errors, follow `docs/architecture.md` + `docs/knowledge.md`; never weaken a gate to pass. Halt if stuck.

### Manual Verification

> [!WARNING]
> **Dashboard Ban:** Use local CLIs (gh, opencode, curl provider `/models`) + the GitHub Actions run logs to verify — do not ask the user to check a dashboard beyond adding the one-time repo secrets.

- [ ] **Step 1:** In a dogfood github repo that has the local opencode host installed (`bkit install --opencode=<provider>`) + `bkit install --cloud=opencode --tracker=github` and ONLY the provider secret set, trigger the orchestrator (manual `workflow_dispatch` → `phase=plan`, `issue=<n>`). Confirm the opencode job runs `/bkit-auto plan <n>` on the opencode runner (Gate-5 mechanism) against the committed `.opencode/` pins, the provider — not Claude — serves it (ground-truth = provider logs / no Claude identity leak), and the claude job no-ops (no `ANTHROPIC_API_KEY`).
- [ ] **Step 2:** Set BOTH secrets; trigger again; confirm BOTH jobs run on the one event (additive coexistence). Then remove the `bkit:auto` label (kill-switch) and confirm neither job runs (zero runner minutes).
- [ ] **Step 3:** Confirm the rename reached the Claude lane: `bkit install --cloud=claude` produces `bkit-cloud.yml` and the Claude job behaves exactly as the pre-rename `bkit-auto.yml`; no orphan `bkit-auto.yml` after an upgrade.

## Milestone Complete

This is the final sub-plan of the #245 milestone. On a green Gate 6 + Manual Verification, opencode is bkit's third execution host end-to-end and **additive** alongside claude/cursor: the local render target (plan-v4-2/3), the GateGuard plugin (plan-v4-3), additive install-flag host configuration with `bkit mode` removed (plan-v4-3/4), Approach A removed (plan-v4-4), and the unified `bkit-cloud.yml` cloud lane running claude + opencode jobs side-by-side (this sub-plan).
