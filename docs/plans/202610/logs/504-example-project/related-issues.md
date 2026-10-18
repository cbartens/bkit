## #43 — Test diff-aware LLM-judge evals (OPEN)

<!-- linear-import: BAR-115 -->

**Linear:** [BAR-115](https://linear.app/bartens/issue/BAR-115) · **Created:** 2026-04-27 · **Linear assignee:** christian@bartens.biz

---

## Goal

Add a `bflow test` CLI verb that runs diff-aware LLM-judge evals on changed agents. Borrowed pattern from gstack analysis ([BAR-108](https://linear.app/bartens/issue/BAR-108/agent-optimisation-and-gstack-patterns) § What gstack does differently — Tiered testing).

Blocked by #41 (eval directory placeholder reserved at `bflow/eval/`).

## Background

[BAR-108](https://linear.app/bartens/issue/BAR-108/agent-optimisation-and-gstack-patterns) § High-payoff identified gstack's three-tier testing:

- **Tier 1 — free static validation** (`bun test`, <2s) — lints the agent file, checks frontmatter shape, validates references. No model call.
- **Tier 2 — diff-based LLM-judge evals** (\~$0.15/run) — for each changed agent, run a representative prompt, judge the output against rubric.
- **Tier 3 — E2E** (`claude -p`, \~$3.85/run) — full workflow against a real Linear issue. Already exists informally as the [BAR-110](https://linear.app/bartens/issue/BAR-110/agent-workflows-prompts-install-script) e2e validation step.

Tests declare which files they care about; auto-select based on `git diff`. Touch `build-challenge.md` → only build-challenge tests run.

## Scope

- `bflow/eval/` directory structure: per-agent test files declaring dependencies.
- `bflow test` CLI verb. Reads `git diff` against pinned bflow version (or against `main`); selects relevant test files; runs them.
- Tier 1 (free) — implement first. Validates frontmatter, name-filename match, tool-set patterns from `subagents.md`, no broken `Read:`/`Write:` references.
- Tier 2 (LLM-judge) — implement second. Per-agent rubric in `bflow/eval/<agent>.eval.md`. Runs against a small prompt. Judge model TBD (likely a separate Claude or Cursor call).
- CI integration: on PRs to bflow, run tier 1 always; tier 2 only on changed agents.
- Cost cap: max $5 per CI run (configurable).

## DoD

- `bflow test` runs all three tiers via flags (`--tier=1`, `--tier=2`, `--tier=all`).
- Diff-based selection works (touch a single agent → only its tests run).
- Tier 1 covers all 44 subagents.
- Tier 2 covers at least the 5 phase commands' critical subagents (build-challenge, build-verify-plan, plan-review-model-1, design-synthesize, debug-diagnose-failure).
- CI runs in <2 minutes for tier 1; <10 minutes for tier 2 with default selection.

## Implementation notes

### Tier 1 — static validation reference points

Validates against canonical specs already documented in `.agents/subagents.md`:

- **Frontmatter shape** — § Frontmatter Conventions. Required fields: `name`, `description`, `effort`, `tools`, `permissionMode`, `maxTurns`.
- **Effort tier** — § Effort tiers. Value must be one of `low | medium | high`.
- **Tool-set pattern** — § Tool set patterns. Each agent's `tools:` must match one of the 6 named patterns.
- `maxTurns` — § `maxTurns` calibration. Value within recommended range for declared workload class.
- `name`-filename match — `name:` field equals filename (less `.md`).
- `Read:` / `Write:` paths — every path mentioned in body resolves at install time.
- **Subagents are leaves** — agent body does not contain `@<other-agent>` or `/<other-agent>` invocation patterns.

## Out of scope

- Tier 3 e2e — runs manually today; automating is a separate concern.
- Slop-scan automation ([BAR-108](https://linear.app/bartens/issue/BAR-108/agent-optimisation-and-gstack-patterns) § High-impact) — adjacent but distinct; could fold into tier 1 or split later.

<!-- linear-links-start -->

**Links:**

- **Blocked by:** #41 ([BAR-111](https://linear.app/bartens/issue/BAR-111))
- **Related:** [BAR-108](https://linear.app/bartens/issue/BAR-108) _(not imported)_, [BAR-110](https://linear.app/bartens/issue/BAR-110) _(not imported)_

<!-- linear-links-end -->

## Benchmark findings from #445 (Ponytail) belong here — plus this issue needs a refresh

Analysing `DietrichGebert/ponytail` for #445 surfaced "bkit has no way to tell whether a prompt edit made an agent better or worse" as its biggest transferable gap. Searched before opening a new issue: **this is that issue**, so folding the findings in here instead.

### Where the eval layer actually stands now

| Tier                                      | Home           | Status                                                                                                                                                                                                                                                                                                 |
| ----------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Online / monitoring (real runs, advisory) | #232           | **Shipped.** `.bkit/src/bkit-comply.ts`, emits `kind:"compliance"` rows into `.bkit/stats.jsonl` (not the proposed `.bkit/compliance.jsonl` — it landed on the unified telemetry ledger from #234). Live: 28 rows so far, 2 rules — `no-mirror-edit` 12 pass / **2 fail**, `skip-ci-not-head` 14 pass. |
| Offline / diff-gated (prompt-edit PRs)    | **this issue** | **Open. Still the gap.**                                                                                                                                                                                                                                                                               |

#232 was explicit that it could not cover this half: _"the close-step grader cannot gate a prompt-edit PR (no run exists yet at edit time)"_, and reserved the offline tier under its "Relationship to the fixture tier" section. That reservation points here.

### What Ponytail adds that this issue doesn't have

**1. Split the metrics into "measurement" and "gate". This is the important one.**

Their harness (`benchmarks/README.md`) runs two scorers per task:

- `loc.js` — **measurement.** Always passes. Records the number, never fails the run.
- `correctness.js` — **gate.** Fails if the generated code doesn't actually execute.

That split is what stops the obvious failure mode: an agent that scores brilliantly on "less code" by emitting a broken one-liner. Tier 2 as scoped here has rubrics but no equivalent distinction — everything is judged. bkit needs both shapes: _measure_ whether a prompt edit made plans shorter / tasks fewer / scope creep rarer, and separately _gate_ on whether the workflow still produces a valid artifact.

**2. Don't let the LLM judge grade correctness. Run the thing.**

Tier 2 here is judge-plus-rubric. Ponytail's `correctness.js` actually spawns Python/Node and executes the generated code; only the React and FastAPI tasks fall back to structural regex, and their README flags those two as weaker for exactly that reason.

This matters because #232 already set the doctrine: _"flaky graders must never gate CI"_, and _"if the grader is itself a flaky LLM, the compliance number is noise."_ Tier 2 as currently written would gate a prompt-edit PR on a model call. Either it gates on deterministic assertions (artifact renders, required sections present, `Done when:` on every task — reusing `bkit-comply.ts`'s pure functions), or the judge stays advisory. Not both.

**3. n=1 won't work. Their number is 10 runs, median.**

This issue says "run a representative prompt" — a single run. Ponytail runs 10 per cell and reports the median, because one run of a nondeterministic system is noise, not signal. That's #232's own argument 4 restated: _"a rule right 19/20 reads identically to one right 20/20 until the 20th run ships a broken commit."_

Consequence for the scope here: the **$5-per-CI-run cost cap is incompatible with meaningful repeats.** Either the cap rises, or the number of agents under Tier 2 drops sharply, or repeats only run on a nightly rather than per-PR. Worth deciding explicitly rather than discovering it.

**4. Single-shot benchmarks flatter you. Say so up front.**

Ponytail's headline (80-94% less code) came from single-shot completions against a bare model, so it counted prose as code. When they re-ran it as a real agent session on a real repo, the win shrank to 60-94% on tasks with an over-build trap, and was a wash elsewhere. An independent third-party run found their skill _raised_ tool calls and cost on large completion-forced agentic tasks.

Tier 2 here is single-shot by construction. That's fine as a cheap gate — but its numbers measure the prompt, not the workflow, and shouldn't be quoted as workflow improvements. Worth writing that caveat into the DoD now rather than after someone quotes a number.

**5. The honesty norm.** Their README carries a "Read this number honestly" block conceding a critic's bug report was right and replacing the headline with a weaker defensible one, and links two independent benchmarks including one that partly contradicts them. Worth adopting for whatever numbers this produces.

Related: #183 (closed) was the outcome-signal half of the same question — change size vs. error rate. Ponytail's LOC-plus-correctness join is the same idea at prompt scale.

### This issue is stale and needs a rewrite before it's actionable

Written against the pre-rename codebase. Verified against `dev` today:

- `bflow` is the old project name; the CLI is `bkit`, source lives in `.bkit/src/`.
- `bun test` — the suite is vitest.
- `.agents/subagents.md` **no longer exists**. Tier 1's entire spec references sections of it (Frontmatter Conventions, Effort tiers, Tool set patterns, `maxTurns` calibration).
- "44 subagents" — there are **49** prompts in `.bkit/prompts/`.
- "Effort tier must be one of `low | medium | high`" — in use today: `low` (5), `medium` (20), `high` (17), **`xhigh` (7)**.
- "Blocked by #41" — #41 is **closed**.
- `bflow/eval/` — the reserved directory doesn't exist.

**Tier 1 is also largely superseded.** The current suite already does the static validation this issue scoped: frontmatter/render checks, catalog parity, gateguard parity across the three hosts, generated-marker checks, block-locality audit. Tier 1 should be re-scoped to "what do the existing tests _not_ already cover" rather than built from scratch.

### Suggested reshape

1. Re-scope Tier 1 against the existing vitest suite — probably a short gap list, not a build.
2. Tier 2 splits in two: deterministic artifact assertions (can gate; reuse `bkit-comply.ts` functions) and LLM-judge quality scoring (advisory only, per #232's flaky-grader rule).
3. Add the measurement-vs-gate distinction explicitly, with at least one always-passes metric recorded per run.
4. Settle the repeats-vs-cost-cap conflict.
5. Write the single-shot caveat into the DoD.

Refs: #445 (source of these findings), #232 (online tier, shipped), #234 (the ledger it writes to), #183 (outcome-signal half).

## Tier 3 now has its own issue: #504

The tier this issue leaves out ("runs manually today; automating is a separate concern") is proposed in #504. It's a small example browser app that runs from design to ship, used both as a demo for new users and as a benchmark for prompt and workflow changes.

It follows the Ponytail findings above:

- **Pass/fail is checked by running code, not by an AI grader.** The example's tests pass, the PR merged, and a deliberately planted edge case is handled.
- **Measurements are recorded but never fail a run:** wall time, agent count, retries and loops, and cost.
- **One run is noise.** The benchmark takes the middle result of several runs, before a release or nightly, not on every PR.

One correction to the figures here: the "~$3.85/run" for Tier 3 is gstack's number, not bkit's. What a full bkit run costs hasn't been measured yet, and #504 lists it as the first open question.

## #232 — bkit-comply: ongoing empirical rule/prompt compliance eval (CLOSED)

## Summary

Build the **online / monitoring tier** of the empirical eval layer — item **B** in #230's adoption ranking ("`skill-comply` + `eval-harness` — measure rule/prompt obedience"). This is the half that has been deferred twice: #65 (Gulli) downgraded it to "periodic friction scan" and never shipped it; #46 / #65 / #230 (three independent reviews) all land on evaluation/verification as bkit's #1 gap. #65 shipped the _lighter_ half — `Done when:` per task (declaring success criteria) — but never the harness that **verifies they hold**.

This issue scopes the cheap, high-leverage 80%: a deterministic grader at each workflow's **close step** that scores the real run against a set of rule specs, accumulates results to a **central `.bkit/compliance.jsonl`**, and a consumer-harvest utility that collects + **analyses + cross-references compliance against releases/changelog**.

> **Not** in scope here: the offline `pass^k` fixture suite + CI-gating tier (see [Relationship to the fixture tier](#relationship-to-the-fixture-tier)). That stays a separate vitest suite for the 3-4 must-always rules. Keep them distinct — the close-step grader **cannot** do `pass^k` (every real run is a different scenario) and **cannot** gate a prompt-edit PR (no run exists yet at edit time).

---

## Why a compliance number is worth having

The model is a black box — you can't _make_ it comply, only re-ask. The value is that the number is an **input to decisions currently made blind**:

1. **Route the rule: prompt-fixable vs. needs-a-hook.** A rule at 95% under pressure -> reword the prompt. A must-always rule stuck at 40% no matter the phrasing -> prompting will never make it reliable; promote it to a deterministic hook (#230 item A GateGuard) or CI grep. You can't make that call without the measurement. **A is the fix; B is the test that tells you which rules need the fix.**
2. **Regression detection on your own edits.** 48 prompts + a 126K `workflows.md` — editing one prompt silently breaks another rule's compliance. Today you discover it via a KN entry _after a live run breaks a build_. (Textbook recurring fixtures: sentinel cleanup, EOF-append ordering, `[skip ci]`-as-HEAD.)
3. **Gate model upgrades.** Opus 4.8 -> 4.9 or a `model:` pin flip shifts the whole corpus's behaviour; re-run and see what regressed.
4. **Tell "mostly works" from "silently corrupts 1-in-20."** A rule right 19/20 reads identically to one right 20/20 until the 20th run ships a broken commit.

---

## Architecture

### Grader = deterministic script, NOT a subagent

A subagent is a model invocation — it reintroduces the exact nondeterminism we're trying to _measure_. The grader must be the fixed reference; if the grader is itself a flaky LLM, the compliance number is noise. bkit's instinct is deterministic-where-possible.

Crucially, **most high-value rules are gradeable from git + files alone, no live tool-trace needed.** Gate 13 of `bkit-ship` already records `parentSha`. That is the diff base:

```bash
git diff --name-only $parentSha..HEAD     # every file this run touched
```

- _"never edited `.claude/*`"_ + config-protection family (#230 item D) -> filter that file list (one table-driven check, parameterised by a path list — sublinear in rule count)
- _"commit must be HEAD / not `[skip ci]`"_ -> `git log -1`
- _"`Done when:` on every task"_ -> grep the plan artifact

Implementation: `.bkit/src/bkit-comply.ts` (sibling to `bkit-status.ts`), pure functions `(parentSha, phase, planPath) -> Violation[]`, unit-tested like everything in `src/`. Each workflow's close gate invokes `pnpm bkit comply --phase <design|plan|build|debug|ship>`.

Reserve a _subagent_ only for the rare rule that genuinely can't be expressed as an assertion (LLM-judge) — and per #230's own caveat, that one stays **advisory, never gates; flaky graders must never gate CI.**

### Record location — DECISION: central `.bkit/compliance.jsonl`

Compliance data must **persist across runs**, so it cannot live in per-plan logs. `status.jsonl` lives at `docs/plans/<...>/status.jsonl` and is **archived/cleaned once the plan is built** (`bkit-ship` Gate 13: "All documents archived and logs retained for manual cleanup"). A trend/dashboard needs accumulation, so the record goes to a single central append-only file at the repo root of `.bkit/`.

Options considered:

| Option                                           | Persists across plans?       | Concerns                                                                    | Verdict    |
| ------------------------------------------------ | ---------------------------- | --------------------------------------------------------------------------- | ---------- |
| Fold into per-plan `status.jsonl`                | No — deleted on plan archive | reuses resume infra but data dies                                           | rejected   |
| `.bkit/performance.md` (Markdown)                | Yes                          | MD EOF-append ordering is a recurring KN regression; canonical-source churn | rejected   |
| **`.bkit/compliance.jsonl` (append-only JSONL)** | **Yes**                      | runtime data in a canonical-source dir -> needs gate exemption              | **CHOSEN** |

Implementation requirements for `.bkit/compliance.jsonl`:

- **Append-only JSONL**, one record per (run x phase) — never an MD file (sidesteps EOF-ordering footgun; one record per line is dedup-friendly).
- **Exempt from the install/mirror engine** (it is runtime data, not a canonical source that mirrors to `.claude/`/`.cursor/`) and from **slop-scan / Vale** gates.
- **`merge=union`** in `.gitattributes` (mirror the existing `docs/plans/**/status.jsonl merge=union` rule) for conflict-free accumulation.
- **Git-tracked + committed** (like `.bkit/friction.md`) so it survives and is harvestable; written at close with the existing `bkit [skip ci]` push.
- Single-clone serialisation already enforced (no concurrent bkit workflows on one clone), so append races are out of scope.

### Advisory, never gates

Grading runs at close (run complete, end-state final). Surface any violations in `ship-summary.md` (already displayed verbatim) — advisory only. Matches #230's advisory -> deny ramp philosophy and the flaky-grader caveat.

### Proposed record schema (`.bkit/compliance.jsonl`)

```jsonc
{
  "ts": "2026-06-06T12:00:00Z",
  "runId": "<plan-id-or-workflow-run-id>", // dedup key
  "repo": "bkit", // set/overwritten at harvest time
  "bkitVersion": "3.3.1", // .bkit/version pinnedVersion at run time -> changelog cross-ref
  "phase": "ship",
  "workflow": "bkit-ship",
  "rule": "no-mirror-edit",
  "result": "pass", // pass | fail | n/a
  "evidence": "git diff parentSha..HEAD touched 0 files under .claude/",
  "graderVersion": "1", // bump when a grader's logic changes (avoid comparing across logic)
}
```

---

## Consumer harvest + analysis utility

Model the collector on the existing **`utility-harvest-friction`** agent (reads `docs/bkit-consumers.md` -> iterates each consumer's worktrees -> moves content into the bkit repo; caller commits; no commits inside the agent). New agent: **`utility-harvest-compliance`**.

Two responsibilities (one prompt, or split — see open questions):

**1. Collect** (like friction, but JSONL not marker-prose):

- Read `docs/bkit-consumers.md` -> absolute consumer paths -> `git worktree list`.
- For each worktree, read `<worktree>/.bkit/compliance.jsonl`.
- **Append into bkit's central `.bkit/compliance.jsonl`, deduping by `runId`** (vs. friction's truncate-source model — JSONL dedup lets consumers keep their own local history; decision in open questions). Stamp `repo` per source.

**2. Analyse + cross-reference to releases/changelog** (the part beyond friction harvest):

- Aggregate per-rule compliance **rate** over time and **per `bkitVersion`**.
- **Join `bkitVersion` against `CHANGELOG.md` / releases** to attribute regressions to releases: e.g. _"`no-mirror-edit` fell 98% -> 61% at v3.3.0 — that release shipped prompt change Z."_ This is the unique value: it turns the accumulated log into release-attributed regression signal, closing the loop with the prompt/rule changes each release shipped.
- Emit a human-readable report (location TBD — `docs/` analysis doc, or a comment on this issue, or a generated rollup). Recommend/inform only — never auto-edit prompts (rules.md:22 "Recommend, do NOT decide").

This makes the harvester the bkit-repo-side analytics that #46/#65/#230 were really asking for: an empirical, release-correlated view of whether the rules and prompts bkit ships actually fire in the wild.

---

## Smallest first version

1. `.bkit/src/bkit-comply.ts` — pure, deterministic, table-driven path checks; unit-tested. Start with **2 rules gradeable from git alone**: `no-mirror-edit` (`.claude/*` untouched) and `skip-ci-not-head`.
2. `.bkit/compliance.jsonl` plumbing — `.gitattributes merge=union`, gate/mirror exemptions, schema above.
3. One line in each workflow close gate: `pnpm bkit comply --phase <x>` -> append record.
4. Surface violations in `ship-summary.md` (advisory).
5. (Later) `utility-harvest-compliance` collect-only.
6. (Later) the analysis + changelog cross-reference.

## Open questions / decisions to confirm

- [ ] Harvest model: **dedup-by-`runId`** (keep consumer history) vs. friction's **truncate-source** (avoid re-harvest)? — leaning dedup.
- [ ] Where does the analysis report live — `docs/` doc, issue comment, or generated rollup?
- [ ] Split `utility-harvest-compliance` into collect vs. analyse, or one prompt?
- [ ] Does `compliance.jsonl` ever get pruned/rolled-up, or grow unbounded? (graderVersion + age-based GC?)
- [ ] Per-phase grader invocation in all 5 workflow close steps, or ship-only first?

## Relationship to the fixture tier

This issue = **online tier** (real traffic, monitoring, advisory). The **offline tier** (`pass^k` synthetic fixtures, CI-gating on prompt/rule edits) shares the _same grader functions_ but runs them against hand-authored adversarial scenarios in a vitest suite — reserved for the 3-4 must-always rules, authored only after the dashboard shows a rule is both flaky _and_ must-always. Track separately; do not conflate.

## Refs

- Parent: #230 item B (eval layer); related items A (GateGuard hook — the enforcement counterpart), D (config-protection — rides the same path-check table).
- #65 (Gulli) — shipped the lighter half (`Done when:` per task), never the harness.
- #46 — earliest of the three convergent reviews to flag measurable success criteria.
- Models on existing: `utility-harvest-friction`, `.bkit/friction.md`, `.bkit/src/bkit-status.ts`, `docs/plans/**/status.jsonl merge=union`.

Suggested milestone: **Workflow Agent Optimisation** (same as #230).

## Paired with #183 — done together (shared substrate)

#183 (change-size vs. outcome quality) and this issue are **one telemetry machine, two analyses** — build/ship together. This issue owns the substrate; #183 consumes it for the PR-level size-vs-quality regression + dispatch-size threshold.

That means `.bkit/compliance.jsonl` carries **two record-types**, both written by the close-step writer:

1. **Rule-compliance** (this issue's core) — one record per (run x rule): `rule`, `result`, `evidence`.
2. **Run/PR outcome signals** (for #183) — one record per run/PR: `ci_first_try`, `corrective_commits`, `reverted`, and the **deferral counts from `bkit-ship` Step 5** (`@bkit-ship-deferred-sweep`):
   - `blocking_deferrals` (count) and `exempt_deferrals` (count) — parsed from the machine-parseable header of `docs/plans/{YYYYMM}/logs/{FID}/ship-deferred-sweep.md` (above `<!-- verdict:end -->`)
   - `sweep_verdict` (`PASS`/`FAIL`) — already in `status.jsonl`

This is a natural fit for the close-step writer: it already runs at ship-close where the sweep artifact lands, so capturing the counts adds a header-parse, no new collection path.

The shared `utility-harvest-compliance` collector and the `bkitVersion` -> `CHANGELOG.md`/release cross-reference serve **both** analyses; #183's open storage/export question ("Sheet or .md? optional install") is answered here. See #183 for the scope split.

Closing as duplicate of #234, which consolidates this with #183, #233, and #58 into one master telemetry feature (`.bkit/stats.jsonl` + friction/deferrals/failures JSONL + harvest & analysis). This issue's full body and comment are preserved verbatim as an archive comment on #234.

## #45 — Per-host learnings mode (OPEN)

<!-- linear-import: BAR-126 -->

**Linear:** [BAR-126](https://linear.app/bartens/issue/BAR-126) · **Created:** 2026-04-28 · **Linear assignee:** christian@bartens.biz

---

## Goal

Decide whether to adopt gstack's `learningsMode` concept (per-host verbosity/autonomy levels) for the bflow agent stack, and if yes, implement it as a host-level config knob.

Surfaced from [BAR-108](https://linear.app/bartens/issue/BAR-108/agent-optimisation-and-gstack-patterns) § Longer term / architectural — last bullet:

> Add a `learningsMode` concept. gstack distinguishes "full" vs "basic" learnings per host. Our Cursor and Claude agents have identical expectations, but they might benefit from different verbosity/autonomy levels depending on IDE capabilities.

This was the only gstack-pattern item from [BAR-108](https://linear.app/bartens/issue/BAR-108/agent-optimisation-and-gstack-patterns) without a Linear tracking ticket.

## Context

Today every host (Cursor + Claude) gets byte-identical agent bodies (transforms only touch frontmatter and invocation syntax — T1/T2/T3 in [BAR-110](https://linear.app/bartens/issue/BAR-110/agent-workflows-prompts-install-script)). gstack's `learningsMode` lets each host configure how verbose/autonomous its agent prompts should be — e.g. a less-capable IDE might need more explicit step-by-step instructions while a fully-agentic IDE can run on a tighter prompt.

After [BAR-125](https://linear.app/bartens/issue/BAR-125/decommission-cloud-agent-automation)'s decommission of the cloud-agent automation, **Cursor is now the only end-to-end runtime** for bflow workflows. Claude Code is local-IDE-only for ad-hoc dev sessions. The lever this concept gives may have shrunk — but it could become valuable again when:

- A third host is added (Codex / Windsurf / Kiro per `.agents/IDEs.md` § How to add a new host).
- Cursor and Claude diverge meaningfully in capability (e.g. Cursor 2.4+ tool surface vs Claude Code feature drift).
- [BAR-114](https://linear.app/bartens/issue/BAR-114/reconcile-cursor-claude-readonly-write-patterns) (`readonly` reconciliation) lands and we want different default safety levels per host without changing canonical agent bodies.

## Decision required first

**Is this still worth doing?** Three options:

1. **File and defer** — keep as low-priority backlog; revisit when filing the third host or when divergence pressure shows up.
2. **Skip and document** — close as won't-fix; record the rejection alongside [BAR-114](https://linear.app/bartens/issue/BAR-114/reconcile-cursor-claude-readonly-write-patterns)'s outcome in DE-87 or a new DE entry. Rationale: with Cursor-only end-to-end and Claude-only local, identical bodies are simpler.
3. **Implement now** — tackle alongside [BAR-114](https://linear.app/bartens/issue/BAR-114/reconcile-cursor-claude-readonly-write-patterns) since both touch host-level prompt differentiation.

## Scope (if option 1 or 3)

- Define what differs per `learningsMode` level (verbosity, autonomy gate count, step-by-step granularity).
- Add `learningsMode: "full" | "basic"` field to `bflow/hosts/<name>.ts` HostConfig (Phase B layout per #41).
- Add a T4 transform: agent body sections tagged with `M1...M2` get stripped/swapped per host's mode.
- Document the tagging convention in `.agents/IDEs.md` § Body transforms (new section).
- Update `bflow/hosts/cursor.ts` and `bflow/hosts/claude.ts` to declare modes.

## DoD

- Decision recorded in `.agents/IDEs.md` § Body transforms (or rejection logged in `docs/decisions.md`).
- If implemented: at least one canonical agent uses the tagging pattern; install regenerates correct per-host body; CI drift gate green.

## Dependencies

- #41 (bflow extraction) — host configs live there.
- [BAR-114](https://linear.app/bartens/issue/BAR-114/reconcile-cursor-claude-readonly-write-patterns) (readonly reconciliation) — adjacent decision; couple if pursuing option 3.

## Out of scope

- Defining new agent prompts.
- Per-agent (vs per-host) verbosity controls — that's a different lever.

## References

- [BAR-108](https://linear.app/bartens/issue/BAR-108/agent-optimisation-and-gstack-patterns) § Longer term / architectural (gstack analysis).
- [BAR-110](https://linear.app/bartens/issue/BAR-110/agent-workflows-prompts-install-script) § Out of scope (this is a Phase B/C concern).
- gstack repo `hosts/*.ts` HostConfig pattern.

<!-- linear-links-start -->

**Links:**

- **Related:** [BAR-108](https://linear.app/bartens/issue/BAR-108) _(not imported)_, [BAR-110](https://linear.app/bartens/issue/BAR-110) _(not imported)_, #41 ([BAR-111](https://linear.app/bartens/issue/BAR-111)), [BAR-114](https://linear.app/bartens/issue/BAR-114) _(not imported)_, [BAR-125](https://linear.app/bartens/issue/BAR-125) _(not imported)_

<!-- linear-links-end -->

Decide this using the example-project runs from #504. Run the same example on each host and compare success rate and cost. If they come out the same, close this as not needed; if one host does noticeably worse, that's the case for doing it.

This issue's host details are also out of date: it says Cursor is the only end-to-end runtime, points at `bflow/hosts/<name>.ts`, and only knows two hosts, while bkit now renders for more than that.

## #526 — Telemetry: record per-workflow OpenCode thread cost in stats.jsonl outcome rows (OPEN)

## Problem

`.bkit/stats.jsonl` `outcome` rows carry duration, lines, files, tasks, coverage, and the friction/deferral/failure deltas — but **not what the run cost**. So bkit cannot answer "which workflow, step, or model pin is expensive", "did this pin swap get cheaper", or "is a longer run also a more expensive one". #504 wants a benchmark that tells whether a change made bkit "faster, **cheaper** or more reliable" — today there is no cost signal for it to read.

OpenCode already computes the number: it is the per-thread total the TUI footer shows, and it is reachable from the workflow's own shell.

## Provenance (motivating work)

The agent's `shell` environment carries the session id:

```
$ env | grep -i opencode
OPENCODE_SESSION_ID=ses_ed492b160ffeeOYPiErbwSO18L
OPENCODE=1
```

The local API returns that thread's cost and token split (`opencode api get` handles service discovery + auth):

```
$ opencode api get /api/session/$OPENCODE_SESSION_ID
{ "id": "ses_ed492b160ffeeOYPiErbwSO18L",
  "cost": 0.061022044,
  "tokens": { "input": 119877, "output": 5804, "reasoning": 7108,
              "cache": { "read": 1620224, "write": 0 } },
  "parentID": null }
```

Subagents run in **child sessions** — `GET /api/session` shows `parentID` on each, so a workflow's cost is the orchestrator session plus every descendant. An aggregate also exists (`GET /api/experimental/session/stats`), but it spans all sessions in a time window, not one workflow run.

Schema is in the OpenCode V2 OpenAPI (`/v2/openapi.json`): `Session.Info` carries `cost` (`Money.USD`) and `tokens` (`TokenUsage.Info`).

## Proposal

Record the workflow run's OpenCode cost on the `outcome` row it already writes.

- In `closeWorkflow` (`.bkit/core/engine/commands/workflow/workflows.ts`, where `outcomeRow` is built), read `$OPENCODE_SESSION_ID`. When set, query the local API for that session's `cost`/`tokens`.
- Sum **descendants** too: walk `GET /api/session`, select sessions whose `parentID` chain reaches the orchestrator, and add their cost/tokens. Capture both orchestrator-only and total (`costUsd` / `costUsdTotal`, or a `tokens` sub-object).
- Keep the fields **additive-optional**, exactly like `coverage`: absent when the env var is missing or the API is unreachable, so non-OpenCode hosts and pre-change rows stay valid with no version bump.
- Surface it in `workflowTelemetry` (`.bkit/core/engine/ledgers/telemetry.ts`) as a table row with the same median-of-prior-runs baseline the other metrics use.
- **Fail-open:** telemetry never gates a workflow. An unreachable API omits the field and logs; the close proceeds.
- No change to the outcome dedup tuple `(repo, workflow, parentSha)`.

## Design considerations / open questions

- **Host scope.** Only OpenCode exposes `OPENCODE_SESSION_ID` and a local cost API. Claude Code / Cursor / Codex runs would omit the field — acceptable for an additive-optional metric, but it means cross-host cost comparison is OpenCode-only.
- **Subagent attribution.** Cost is per session; the workflow is a session tree. Sum descendants into the run, or also emit per-subagent cost? A single run total is the smallest useful unit; per-agent is a follow-up.
- **Timing / lower bound.** The value is read at close and so excludes the close step's own final turn. Document it as "cost to close", not the run's final bill.
- **Imputed vs billed.** OpenCode derives cost from catalog pricing × tokens. On a subscription/plan provider (e.g. `opencode-go`, Cursor) that is an imputed figure, not the invoice. The field/README should say which it is.
- **Discovery path.** Prefer `opencode api get …` over reading `~/.local/share/opencode` DB or raw HTTP — it owns service discovery, pairing, and the server password.
- **Identity.** The cost is anchored to the run row by the existing `(repo, workflow, parentSha)` tuple; the session id need not be a new key.

## Rejected alternatives

- **Model self-report** (the agent states its own cost) — the `counterSource: "model-self-report"` lesson: unreliable, and a trust-tier downgrade for a number a machine can read exactly.
- **Read the OpenCode SQLite DB directly** — undocumented schema, active locks, and it bypasses the supported API.
- **A separate cost ledger** — the value describes one run row; it belongs on that row, not in a ledger of its own.

## Acceptance criteria

- [ ] `bkit workflows close` reads `OPENCODE_SESSION_ID` and, when the local API answers, adds cost/token fields to the `outcome` row in `.bkit/stats.jsonl`.
- [ ] Descendant (subagent) session cost is attributed to the workflow run.
- [ ] Fields are additive-optional; runs on hosts without the env var/API are unchanged and still validate.
- [ ] `bkit telemetry summary` shows a cost row with the median baseline like the other metrics.
- [ ] Fail-open: an unreachable API omits the field and logs; it never fails the close.
- [ ] Docs: `.bkit/jsonl.md` § Per-Kind Fields (`outcome`) and `.bkit/workflows.md` § Telemetry Ledgers updated.

## References

- #234 — the telemetry machine this extends
- #504 — example run / benchmark that needs a cost signal
- #377 — self-hosted vs API cost analysis (adjacent, different layer)

## #445 — Review and adopt Ponytail patterns (OPEN)

What if anything can we learn from https://github.com/DietrichGebert/ponytail
Should we integrate it or just pick and choose the best parts?
Seems like something we have already but we could adopt
i.e. prompt improvements, hooks, guardrails, etc?

## Analysis: what to take from Ponytail

Read the repo at `DietrichGebert/ponytail` (cloned, read in full) and compared it against bkit as it stands on `dev`.

### Short answer

Don't integrate it. Ponytail isn't a competitor or a component — it's a single behavioural instruction ("write the least code that works") packaged for ~20 different AI coding tools. bkit is a workflow engine with phases, gates and ledgers. Almost no overlap in what they do.

But the repo has engineering _around_ the prompt that bkit doesn't have. The valuable part isn't the prompt — it's the machinery they built to prove the prompt works and to stop its copies drifting apart.

One caveat on reading the repo: 111,953 stars measures how much people like the idea, not code quality. The parts recommended below are the unglamorous scripts, not the headline.

---

## Worth taking, ranked

**1. A measured way to tell whether a prompt edit helped. This is the real gap.**

bkit has 49 generated agent prompts plus the workflow files, edited constantly. There is currently no way to answer "did that edit make the agent better or worse?" — the test suite checks structure (does the file render, do the mirrors match, does the gate fire), never behaviour.

Ponytail runs an A/B: three arms (no skill, competitor, theirs), three models, five tasks, 10 runs each, median reported. The design detail worth copying is how they split the two metrics (`benchmarks/README.md`):

- `loc.js` — **measurement**, always passes, just records the number.
- `correctness.js` — **gate**, fails if the generated code doesn't actually run.

That split is what stops the obvious failure: an agent gaming the metric by writing a broken one-liner. They also built a second, harder benchmark (`benchmarks/agentic/`) that runs a real Claude Code session against a real public repo, because the single-shot numbers flattered them.

For bkit this is expensive (real API spend, a harness to build) but even a small version — two arms, five tasks, against the build agents — beats the zero we have now. Should be scoped as its own design issue, not a patch.

**2. Their honesty norm about their own numbers.**

Their README carries a block headed "Read this number honestly", conceding a critic's bug report was right, that the headline 80-94% figure overstated the win because it counted prose as code, and replacing it with a weaker defensible number. They also link two independent benchmarks run by other people, one of which partly contradicts them (leaner code, but _higher_ cost on big agentic tasks). That's a documentation norm; bkit makes claims about its own gates that could be held to it.

**3. The `ponytail:` marker convention and its harvest skill.**

Every deliberate shortcut gets an inline comment in a mandated shape: `ponytail: <the ceiling this hits>, <what should trigger revisiting it>`. A skill (`skills/ponytail-debt/SKILL.md`) greps them into a ledger — and tags any marker naming no trigger as `no-trigger`, because those are the ones that rot into permanent.

bkit already has `bkit-ship-deferred-sweep` and the JSONL ledgers, so the concept is covered. The transferable bit is narrower: **requiring a revisit trigger, and flagging the ones that lack it.**

**4. The "invariant canary" trick in `scripts/check-rule-copies.js`.**

Same problem bkit has: one set of rules, many copies, copies not byte-identical so you can't diff them. Their answer is a list of ~9 load-bearing phrases ("input validation at trust boundaries", "prevents data loss", "ONE runnable check") that must appear verbatim in both the skill file and `AGENTS.md`. Reword a safety rule in one place and CI fails.

bkit's chain is `.agents/rules.md` -> `AGENTS.md` -> 49 generated prompts, longer than theirs. Worth checking whether anything currently catches a reworded safety rule that fails to propagate — the parity tests cover catalogs and gates, not rule wording.

**5. `scripts/check-versions.js` — the stale-but-agreeing failure.**

Their existing test checked all manifests agree with each other. In v4.8.0 every manifest stayed at 4.7.0 _together_, so they agreed, the test passed, wrong version shipped. Fix compares the shared version against the git tag on release CI runs. bkit re-stamps via `bkit upgrade` so this may not apply, but "they all agree and they're all wrong" is worth ruling out in bkit's release path.

**6. A `SubagentStart` hook to inject shared doctrine — investigate, don't just do it.**

bkit duplicates doctrine text into 49 prompt files and regenerates with `bkit install`. Ponytail injects shared rules into subagents at runtime from one file (`hooks/claude-codex-hooks.json`). bkit currently registers only `SessionStart` and `PreToolUse`. Catch: `SubagentStart` is Claude Code only, and bkit keeps Claude / Cursor / opencode at parity — this would create exactly the asymmetry the parity tests exist to prevent.

**7. Labelling host support by tier.**

Their portability table marks each host "plugin-tier" (full features) or "instruction-tier" (rules text only, no commands or hooks), so a user sees what degrades where. bkit could label its three hosts the same way.

---

## Where the YAGNI stance belongs in bkit

Not in build. bkit's build agents execute a reviewed plan faithfully; an always-on instruction to question whether each task should exist fights that directly. But there is a real structural gap earlier in the process, and it's worth naming precisely.

### The bias, mapped

Current lenses across design and plan:

| Agent                                                 | Lens                                         | Pushes scope                                                     |
| ----------------------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------- |
| `bkit-design-brainstorm-ideate-1`                     | Pragmatic — existing code, minimal new infra | **down** (already says "Reuse > extend > new; YAGNI ruthlessly") |
| `bkit-design-brainstorm-ideate-2`                     | Optimal-tradeoff — best long-term shape      | **up** (told to "Ignore 'we already have X'")                    |
| `bkit-design-brainstorm-ideate-3`                     | Risk premortem — failure modes               | **up** (generates defensive machinery)                           |
| `bkit-design-review-1`                                | Buildability                                 | neutral                                                          |
| `bkit-design-review-2`                                | Operability                                  | **up** (more instrumentation, more handling)                     |
| `bkit-plan-review-1/2/3`, `bkit-plan-scope-check-1/2` | fidelity to source                           | neutral                                                          |

One of three ideators pushes down, two push up. And **none of the five design/plan reviewers has "is this over-built?" as its lens.** That's the gap.

### Insertion point 1 — `bkit-design-generate.md` step 7 (highest leverage)

The merge is additive by construction: step 5 says risk-premortem mitigations "are additive — layer onto selected approach", step 6 picks the "stronger" side of each conflict, step 7 says "Preserve strongest approaches". Strongest, never smallest. This is where ideate-2's unconstrained shape and ideate-3's defensive layers get folded in with nothing pushing back.

Add a ladder pass over the merged design before it's written out. Key phrases worth using close to verbatim, because the ordering is the whole point:

> Stop at the first rung that holds.
>
> 1. Does this need to exist at all? Speculative need = skip it, say so in one line.
> 2. Already in this codebase? A helper, util, type, or pattern that already lives here -> reuse it.
> 3. Stdlib does it? Use it.
> 4. Native platform feature covers it? Use it.
> 5. Already-installed dependency solves it? Use it. Never add a new one for what a few lines can do.
> 6. Can it be one line? One line.
> 7. Only then: the minimum code that works.

Plus the tie-breaker, which stops the ladder becoming a research project: **"Two rungs work -> take the higher one and move on."**

### Insertion point 2 — `bkit-design-review-1.md` step 5

Step 5 already runs an ecosystem search per capability and records `USE-AS-IS | ADAPT | BUILD-CUSTOM`, with "existing solution covers >80% of requirement -> recommend it over custom code". That is ladder rungs 3-5 (stdlib, native, installed dep) — but only against the _external_ ecosystem. It never searches _this repo_.

Cheapest real fix: add a rung-2 sub-bullet to step 5, e.g. `Grep repo for existing helper / util / type / pattern covering {capability} -> reuse over BOTH custom code and new dep.`

Ponytail's justification for why this rung specifically matters:

> re-implementing what's a few files over is the most common slop

The fuller fix is a third design reviewer with lens `Necessity`, but that means a new agent, new mirrors and parity-test cost. Do the step-5 edit first and see whether it's enough.

### Insertion point 3 — `.agents/rules.md:26`, the rule that already exists

Line 26 already says: _"No speculative scope: ONLY build for requirements at hand (YAGNI); NEVER add config, flags, abstraction layers, or items 'for the future' nobody requested."_

Right rule, but it's a prohibition naming artefacts, with no procedure. Ponytail's actual contribution is that the ladder is _executable_ — ordered steps you can follow — where a prohibition is something an agent can agree with and still violate. Expanding line 26 with the rung order reaches every agent including build, without importing a lazy persona.

Also worth adding there, as the concrete form of the prohibition:

> No interface with one implementation, no factory for one product, no config for a value that never changes.

### Insertion point 4 — the safety carve-out ships with it, or none of it ships

YAGNI language without this will cut the wrong things. Ponytail pins these exact phrases as CI invariants in `check-rule-copies.js` precisely because a reword could silently drop one:

- `input validation at trust boundaries`
- `error handling that prevents data loss`
- `security measures`
- `accessibility basics`
- `anything explicitly requested`

And the two lines that matter most for bkit specifically, because they protect plan-execution fidelity rather than threatening it:

> Never lazy about understanding the problem. The ladder shortens the solution, never the reading.

> User insists on the full version -> build it, no re-arguing.

The second maps directly onto a bkit build agent executing an approved plan: the plan _is_ the user insisting.

### Why the plan stage is the wrong place

`bkit-plan-review-1` step 7 flags "Plan tasks with no source justification -> CRITICAL"; step 10 flags required work parked out of scope. Its scope discipline is fidelity to source in both directions. By plan time the design **is** the source — so questioning whether a design item should exist registers as drift. Adding YAGNI there puts two rules in direct conflict.

One partial exception: `bkit-plan-complexity-check` already estimates whether a plan fits a single session, and "too big" is evidence the design over-built. But its remit is splitting, not cutting, so it would surface the symptom in a form nobody acts on. Design-time only.

### Still must not go in build

`bkit-build-plan-execute` and the challenge agents. The plan is approved by then; the job is faithful execution.

---

## Not worth taking

- **The lazy-mode prompt as a persona.** See above — the stance belongs at design time as a review lens, not as an always-on instruction.
- **The 20-host adapter sprawl.** bkit deliberately targets three hosts and already pays parity-test cost for those.
- **Their MCP server, marketplace manifests, statusline.** bkit has its own distribution; the statusline badge is cosmetic.

---

## Suggested split

| Item                                                                                                                         | Size                   |
| ---------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| Ladder into `bkit-design-generate` step 7 + `bkit-design-review-1` step 5 + `.agents/rules.md:26`, with the safety carve-out | one change, this issue |
| Revisit-trigger requirement on deferrals (item 3)                                                                            | small, this issue      |
| Rule-wording invariant canary (item 4)                                                                                       | small, separate        |
| Behaviour benchmark (item 1)                                                                                                 | own design issue       |

**Item 1 (behaviour benchmark) — no new issue needed, it already exists as #43.**

Searched before opening one. The eval layer was already split in two:

- **Online tier (#232)** — real runs, advisory, graded at workflow close. **Shipped.** `.bkit/src/bkit-comply.ts` writes `kind:"compliance"` rows to `.bkit/stats.jsonl`; 28 rows live so far across two rules, with 2 genuine `no-mirror-edit` failures caught.
- **Offline tier (#43)** — "Test diff-aware LLM-judge evals", gates prompt-edit PRs. **Still open, still the gap.** #232 explicitly ruled this out of its own scope: _"the close-step grader cannot gate a prompt-edit PR (no run exists yet at edit time)."_

So the Ponytail benchmark findings went to #43 rather than a duplicate: https://github.com/cbartens/bkit/issues/43#issuecomment-5426424334

The transferable points were the measurement-vs-gate split (`loc.js` records, `correctness.js` fails), executing generated code rather than having a model judge it, 10 runs and a median instead of n=1, and the honesty caveat that single-shot numbers overstate agentic gains.

Also flagged there that #43 is stale — written pre-rename, references `bflow`, `bun test`, and `.agents/subagents.md` which no longer exists, cites 44 subagents (now 49) and three effort tiers (now four, `xhigh` added), and is marked blocked by #41 which is closed. Its Tier 1 is largely superseded by the existing vitest parity suite.

Revised split for this issue:

| Item                                                                                         | Home               |
| -------------------------------------------------------------------------------------------- | ------------------ |
| YAGNI ladder into design-generate / design-review-1 / rules.md:26, with the safety carve-out | this issue         |
| Revisit-trigger requirement on deferrals                                                     | this issue         |
| Rule-wording invariant canary                                                                | separate, small    |
| Behaviour benchmark                                                                          | **#43** (existing) |

## Correction: the ladder was the wrong shape. The gap is a missing review lens.

My earlier comment proposed bolting the Ponytail ladder into `bkit-design-generate` step 7 and `bkit-design-review-1` step 5. **Withdraw both.** Re-reading the prompts to verify the scope-direction table showed the imbalance is structural and enforced, which makes a counterweight at the merge step the wrong fix.

### The table, now verified against the prompt text

| Agent                                                 | Lens               | Direction | Evidence                                                                                                                                             |
| ----------------------------------------------------- | ------------------ | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bkit-design-brainstorm-ideate-1`                     | Pragmatic          | **down**  | "Reuse > extend > new; YAGNI ruthlessly"                                                                                                             |
| `bkit-design-brainstorm-ideate-2`                     | Optimal-tradeoff   | **up**    | "Ignore 'we already have X' as default"; scoring axes include **`Extensibility`: Future-change handling**                                            |
| `bkit-design-brainstorm-ideate-3`                     | Risk premortem     | **up**    | "additive risk-mitigation guidance to layer onto whichever approach is picked"; axes are 10x scale / 6 months later / on-call at 3am / author leaves |
| `bkit-design-review-1`                                | Buildability       | neutral   | —                                                                                                                                                    |
| `bkit-design-review-2`                                | Operability        | **up**    | step 6: "Missing observability for `CRITICAL` failure mode -> `CRITICAL` finding". Step 9 acknowledges new on-call burden but says "not blocker"     |
| `bkit-plan-review-1/2/3`, `bkit-plan-scope-check-1/2` | fidelity to source | neutral   | scope discipline is drift-vs-source in both directions, never necessity                                                                              |

`ideate-2` rating **Extensibility as a scoring axis** is worth calling out on its own: it rewards building for changes nobody has requested, which is the exact behaviour `.agents/rules.md:26` ("No speculative scope … YAGNI") forbids. Those two are in direct contradiction today.

### Two mechanisms make this worse than a 2-up-1-down tally

**1. Only one direction has gate power.** A reviewer can raise `CRITICAL` for _missing_ instrumentation. No agent anywhere in design or plan can raise anything for _excess_. The asymmetry isn't in the count — it's that up can block and down cannot even be recorded.

**2. Lens discipline actively suppresses the finding.** Every reviewer prompt carries:

> **Lens discipline:** Stay within Process-defined lens; out-of-lens findings NOT in remit.

So an agent that _does_ notice a design is over-built is instructed to drop it. The imbalance is enforced, not merely unattended.

### The refinement that matters

Balance at the **ideation** tier is not the goal — divergence is what ideators are for, and wide option generation is correct. The failure is that **nothing converges on necessity**. The review tier is the convergence stage and none of its five agents has a cut mandate.

So the fix is not "rebalance the ideators". It is "the review tier is missing a lens".

### Why the ladder-at-the-merge idea was wrong

`bkit-design-generate` step 7 says "Preserve strongest approaches". Adding "now cut what isn't needed" to the same agent gives one agent two conflicting mandates, and puts a single downward pass against three upstream inputs at the weakest point in the pipeline. bkit already solves competing concerns the other way — separate lens-disciplined agents, reconciled afterwards. The ladder should be a lens charter, not a step in the synthesiser.

(Step 8 of `design-generate` does append out-of-scope ideas to `docs/deferrals.jsonl`, which is a genuine down-force. But it parks things _already judged_ out of scope; it never judges whether an in-scope item is necessary.)

### The same gap repeats in the audit lens portfolio (#403)

WS-B charters 13 always-on lenses: architecture, hotpath, config, reliability, observability, debt, dead-code, deps, security, supply-chain, tests, docs-drift, logic-dupe.

Six of them demand _more_. `dead-code` finds only what is already dead. `logic-dupe` finds duplication. `debt` finds suppressions and un-exited workarounds. **None asks whether a thing should have been built at all.** Second portfolio, same blind spot.

### Revised proposal — a Necessity lens, two placements, one charter

- **`bkit-design-review-3`**, lens `Necessity`, sibling-blind, with gate power: can raise `CRITICAL` on speculative scope, single-implementation abstractions, config nobody sets, layers with one caller.
- **A `necessity` / `over-build` lens in #403's always-on list.** #403 is pre-plan and explicitly built to absorb charter amendments, so this is the cheapest moment it will ever be to add one.

Charter content is where Ponytail's material lands, as lens probe text rather than as a rule:

> 1. Does this need to exist at all? Speculative need = skip it.
> 2. Already in this codebase? A helper, util, type, or pattern that already lives here -> reuse it.
> 3. Stdlib does it? Use it.
> 4. Native platform feature covers it? Use it.
> 5. Already-installed dependency solves it? Use it.
> 6. Can it be one line?
> 7. Only then: the minimum that works.

Stop at the first rung that holds; two rungs work -> take the higher one. Plus their finding tags, which map cleanly onto bkit's finding schema: `delete:` / `stdlib:` / `native:` / `yagni:` / `shrink:`.

**The safety carve-out is not optional** — without it a necessity lens fires on everything:

- never flag input validation at trust boundaries
- never flag error handling that prevents data loss
- never flag security measures
- never flag accessibility basics
- never flag anything explicitly requested

And the line that keeps the lens from fighting bkit's execution fidelity: _"The ladder shortens the solution, never the reading."_

### Known conflicts to settle at design time, not in the lens text

1. `.agents/rules.md:19` "Completeness over shortcuts: NEVER … apply 90% solutions / silent shortcuts. In-scope = complete or skip" and `.agents/rules.md:20` "End-state over diff-size" are deliberate bkit doctrine that **contradicts** Ponytail's "shortest working diff wins" and its `ponytail:` deliberate-shortcut marker. bkit forbids the thing that marker exists to track. The lens must be scoped to _unnecessary work_, not _unfinished work_, or it will license the shortcuts rules.md bans.
2. `ideate-2`'s `Extensibility` axis vs `rules.md:26`. Whichever way that resolves, both should say the same thing afterwards.
3. Cost: one more parallel reviewer on every design run.

### Consequences for this issue's split

| Item                                                      | Home            | Change                                                                 |
| --------------------------------------------------------- | --------------- | ---------------------------------------------------------------------- |
| Necessity lens (design-review-3 + #403 charter amendment) | `/bkit-design`  | **replaces** the ladder-into-design-generate and design-review-1 edits |
| Deferral revisit-trigger                                  | same design     | schema + 6 writer agents; see conflict 1                               |
| Rule-wording invariant canary                             | separate, small | unchanged                                                              |
| Behaviour benchmark                                       | #43             | unchanged                                                              |

Nothing here is a session-sized edit any more. The two prompt edits I proposed earlier are withdrawn.

## #466 — Issue prioritisation (OPEN)

Run `.bkit/prompts/bkit-audit-generate.md` with `docs/templates/bkit-audit-issues.md` to generate the latest audit report.

Copy-paste prompt:

```
Run .bkit/prompts/bkit-audit-generate.md.

Read: docs/templates/bkit-audit-issues.md
```

The agent writes `docs/audits/{YYYYMM}/issues.md`. If that month already has this slug, it writes `issues-{TIMESTAMP}.md` and does not overwrite.

# Pass 1 — Ready lane, 2026-09-16

14 issues. **None had a Size. Every Priority was set and none of them followed any stated rule** — #320 (a coverage gate that has never existed) sat at High next to #397 (concurrent ships with no global lock). All 28 fields rewritten.

Both rules were applied in one pass. consumer-a's Ready pass ran on Rule 1 alone because Rule 2 arrived afterwards; that does not apply here.

## Result

| Priority | Count | Sizes               |
| -------- | ----: | ------------------- |
| Urgent   |     0 | —                   |
| High     |     4 | S ×1 · M ×3         |
| Medium   |     4 | M ×1 · L ×2 · XL ×1 |
| Low      |     6 | S ×3 · M ×3         |

## Urgent — empty, by rule

Nothing in this lane is a security issue. That is a result, not an oversight: `Urgent` stays reserved so a reader can trust what it means. The only security-shaped issue on the whole board is #317 in Backlog, and it is already fixed — see the Backlog comment.

## High — error fixing

| Issue                                                 | Size | Why it is a defect and not a wish                                                                                                                                                                                                                                                                |
| ----------------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| #397 bkit-cloud concurrency, ship-global lock         | M    | Ship is not global at the GitHub Actions level. `bkit-cloud.yml:73`'s `concurrency` group enforces part of the intended model and contradicts the rest, so two ships can run at once                                                                                                             |
| #322 Workflow close failure paths leave no CI surface | M    | The close step that opens the PR exists (`.bkit/workflows/bkit-debug.md:1014-1022`) and the Failure Path (`bkit-debug.md:88`) skips it. CI only fires on `push`/`pull_request` for `main` and `dev`, so a `feat/*` branch with no PR matches nothing and the run ends having proved nothing      |
| #337 Pre-release dogfood misses real consumer shapes  | M    | The dogfood ran green and both 4.3.1 bugs still reached consumers, because bkit's own repo is single-package and both live consumers are pnpm workspace roots. A check that exists and returns the wrong answer                                                                                  |
| #463 Recalibrate subagent `maxTurns`                  | S    | `.bkit/prompts.md:96` and `:127` say the cap is a runaway-loop guard, not a workload budget. `bkit-utility-update-documentation` died at **62** tool-uses with its edits on disk and its report lost; `utility-pre-release-check` died at **60** on the 4.6.0 audit after finding a real finding |

Each of these is the same class: a mechanism that exists and reports success while doing nothing, or dies mid-work and loses its output.

## Medium — one design issue, three Rule 2 moves

| Issue                                            | Size | Band          | Why                                                                                                                                                                                                 |
| ------------------------------------------------ | ---- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #436 Grep-friendly documentation                 | L    | Rule 1 design | The only pure design issue in either lane. Nothing is broken; the material is shaped wrong for the reader it actually has, which is an agent that greps and stops                                   |
| #442 Run only workflow steps tasks actually need | L    | Low **+1**    | Four sub-plans on disk — `docs/plans/202608/442-workflow-steps-needed-plan-{1,2,3,4}.md` — and the `bkit:plan` label. The chain is already running on it. Size is measured, not estimated: it split |
| #80 Plan milestone: Recurring audits             | XL   | Low **+1**    | `bkit:design`, and the only FID in the Design section of `docs/roadmap.md`                                                                                                                          |
| #408 Publish `@cbartens/bkit` publicly on npmjs  | M    | Low **+1**    | Live consumer friction, reported verbatim: remote builds on Vercel and EAS "always include bkit and hence need special auth etc but it's not needed there". Decided, not open                       |

#408 is where the launch adjustment does visible work. Under consumer-a's Rule 2 this would have been discounted as protecting nobody yet. bkit has consumers now, and they are paying this cost on every remote build.

## Low — everything else

| Issue                                                                 | Size | Why                                                                                                                                              |
| --------------------------------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| #320 CI unit coverage gate in the build workflow                      | M    | **Was High.** The gate does not exist on the build side yet. A gate that exists and lies is a defect; a gate that has never existed is a feature |
| #346 CI gate on open CRITICAL failures, stale deferrals by age        | M    | Same — two checks that do not exist yet                                                                                                          |
| #323 Promote logging/error anti-pattern guards into the slop advisory | M    | A new advisory rule                                                                                                                              |
| #396 Allow `bkit-auto` to start from an approved design               | S    | A routing feature. See the judgement calls — half of this issue is not a feature                                                                 |
| #445 Review adopt Ponytail patterns                                   | S    | Research and adoption review                                                                                                                     |
| #410 Review adopt AgentMemory patterns                                | S    | Same family                                                                                                                                      |

## Rule 1 overrides — where the label said nothing useful

**The Ready lane has no `bug` labels at all, and four of its fourteen issues are defects.** So in this lane the label carries zero signal in either direction, which is worth knowing before the next pass reaches for it.

| Issue                     | Label         | Ranked             | Why                                                                                                                        |
| ------------------------- | ------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| #397 · #322 · #337 · #463 | `enhancement` | **High**           | All four are things that are broken or silently failing. "Enhancement" describes how they were filed, not what the work is |
| #436                      | `enhancement` | Medium             | Documentation ergonomics is the `design` band in a repo with no screens                                                    |
| #320                      | `enhancement` | **Low** (was High) | The gate rule. This is the call most likely to be argued — see below                                                       |

## Rule 2 — three moves up, none down

Nothing in Ready carries a downward signal. Every issue in this lane is either on a surface consumers already run, or on a surface the chain has already started. That is roughly what one would want Ready to mean.

## Judgement calls the owner should overturn if they disagree

1. **#320 at Low.** A build workflow that reports PASS while the PR's coverage lane goes red is arguably giving a wrong answer, which would make it `High`. It is ranked `Low` because the build-side gate has never existed — the PR lane still catches the regression, just later. This single line decides several rankings on this board, so it is worth settling deliberately rather than per issue.
2. **#442 and #80 at Medium.** These are the two things actually next: #442 has PASSed sub-plans on disk and #80 is the only live design. Rule 2's ±1 cap keeps them out of High. That is deliberate — `docs/roadmap.md` already carries sequence and Priority should not try to carry it twice — but if you want the board to read as the queue, Rule 2 needs a bigger move for "artifacts on disk".
3. **#396 ranked on its dominant half.** The headline is a feature (start `bkit-auto` from an approved design). The note underneath is a defect: plan verdicts return CONCERN "not just for missing human approval gates (still happens)". A verdict that is wrong is `High` work sitting inside a `Low` issue. Recommend splitting it rather than re-ranking it.
4. **`Urgent` is empty here.** Deliberate. An empty top band is information.

## Open — Priority versus sequence

consumer-a's Ready pass left this open: is entering Ready itself the "in flight" signal, in which case the lane should not be re-ranked at all?

bkit has a sharper answer available. `docs/roadmap.md` already generates Design / Plan / Build / Debug / Shipped sections from `docs/roadmap.jsonl`, so phase state is recorded — and `/bkit-roadmap` reads the `Priority` field back out of the same board (`.bkit/workflows/bkit-roadmap.md:52-62` → `docs/tracker.jsonl` → `.bkit/prompts/bkit-roadmap-refresh.md:45`). If Priority is also made to encode sequence, the analysis reads its own ordering back as if it were independent evidence.

Recommendation: **Priority answers "how much does this matter", never "what runs next".** The roadmap owns the second question. If that holds, this lane is ranked correctly and the ±1 cap should stay.

# Pass 1 — Backlog lane, 2026-09-16

43 issues. **None had a Size; 12 had no Priority at all and the rest followed no stated rule.** Renovate's auto-generated Dependency Dashboard sat at `Urgent`. All 86 fields written, then 10 priorities raised under Rule 2. Both rules applied in one pass.

This issue (#466) was added to the lane during the pass and ranked `Low` / `S`, so the lane holds 44 items now.

**Two issues left the lane while the pass was running.** #214 was closed as completed at 06:25Z and is now `Done`; #465 moved to `In progress`. Both kept the fields written here. They are ranked below as they were found.

## Result

| Priority | Rule 1 only | After Rule 2 |
| -------- | ----------: | -----------: |
| Urgent   |           0 |        **0** |
| High     |           4 |        **4** |
| Medium   |           0 |       **10** |
| Low      |          39 |       **29** |

Every Medium in this lane got there by Rule 2. Under Rule 1 alone the Backlog is a wall of `Low` with four defects on top — which is roughly honest for a backlog, and completely unusable as a ranking. Rule 2 is what makes the lane readable.

## Urgent — empty, and the reason is a closure

**#317 (SHA-pin third-party actions in the shipped template stubs) is the only issue in either lane that Rule 1 puts at `Urgent`.** Unpinned third-party actions in CI that bkit ships into consumer repos is supply-chain exposure, and bkit has launched, so guard 2 offers no discount.

It is already fixed. Every `uses:` in the shipped template is SHA-pinned today — `.bkit/templates/.github/workflows/ci.yml:66`, `:76`, `:82`, `:308`, `:314`, `:318`, plus the commented coverage stubs at `:507`, `:517`, `:607`, `:623`. The floating `@v2` the issue cites no longer exists. Ranked `Low` / `XS` and flagged for closure rather than ranked as live security work.

So the band is empty because the work is done, not because nobody looked.

## High — error fixing

| Issue                                                         | Size | Why                                                                                                                                                                                                                                               |
| ------------------------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #277 Workflow artifacts overwrite on re-run                   | M    | Still live: `.bkit/workflows/bkit-plan.md:266` writes a flat, unkeyed `plan-input.md`, so a second run on the same FID destroys the first run's input. Already observed twice in `docs/plans/202606/logs/245-opencode-provider-host/status.jsonl` |
| #345 Failures triage                                          | M    | `docs/failures.jsonl` is the bug ledger — `.bkit/jsonl.md:35` routes _"any agent on a discovered bug"_ there. Rows are appended and never re-validated, so `OPEN` means nothing. Triaging an error ledger is error fixing                         |
| #461 `list_issues` calls off-spec in all five phase workflows | M    | Verified against the live tool schema: `labels` must be an array and the workflows send a comma-joined string, so the filter is silently not applied. Three separate defects in one call, repeated five times                                     |
| #465 Tracker markers do not survive the MCP read              | M    | `mcp__github__issue_read` strips every HTML comment, so `bkit:generated`, `bkit:ignore-earlier` and `bkit:blocked-by` all reach the workflow as nothing. Three shipped mechanisms that silently no-op. Recorded in `docs/knowledge.jsonl`         |

#461 and #465 both carry a Rule 2 up-signal — they sit on the exact surface #464 is rewriting — but guard 1 caps non-security work at `High`, so neither moved.

## What Rule 2 moved up — 10 issues

### The Recurring Audits milestone — 7 issues, Low → Medium

#80 carries `bkit:design` and is the only FID in the Design section of `docs/roadmap.md`, with its design doc on disk at `docs/plans/202605/80-audit-workflow-design.md`. Every workstream under it inherits the signal:

`#402` WS-A audit engine (XL, also carries `bkit:design`, design doc at `docs/plans/202607/402-audit-engine-orchestrator-design.md`) · `#403` WS-B universal lens layer (XL) · `#405` WS-C conditional lens prompts (L) · `#207` WS-D web-product lens family (XL) · `#83` WS-E runtime rendered evidence (XL) · `#309` WS-F red-team workflow (XL) · `#324` WS-G triggers and cadence (L)

#402 is the keystone — B, C, D and G all state `Requires: WS-A` — so these seven are not seven independent Mediums. They are one Medium with six things queued behind it.

### The roadmap surface — 1 issue

`#214` bkit roadmap — Low → **Medium**, because #464 (In progress) is rewriting exactly what #214 holds as prose. It was closed as completed during this pass, which is the right outcome: `docs/roadmap.md` from #380 supersedes its "Active sequence" section.

### Live consumer friction — 2 issues

| Issue                                                          | Size | Signal                                                                                                                                                                                                                                 |
| -------------------------------------------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `#99` Friction triage                                          | M    | Low under Rule 1 (it is a triage pass, not a fix), raised because the rows come from real consumer repos via `pnpm bkit harvest` and describe cost being paid now                                                                      |
| `#360` Post-install JSON-safe per-package advisory suppression | M    | Two live false-positive advisory reports against `dist/bkit-postinstall.js` in bkit 4.7.0, and `package.json` being comment-free JSON means the documented workaround is impossible to follow. A consumer cannot fix this from outside |

This is the half of Rule 2 that consumer-a's version cannot have. There, protective work protects nobody yet. Here, #99 and #360 are both somebody's Tuesday.

## What Rule 2 moved down — nothing moved, but five are held down

Five issues carry the "reach bkit does not have" signal. All five were already at Rule 1's floor, so mechanically nothing changed — but the signal is recorded, because it is why substantial, well-written issues stay at `Low`:

| Issue                                               | Size | Reach it needs                                 |
| --------------------------------------------------- | ---- | ---------------------------------------------- |
| `#228` Git-host adapter (GitLab, Bitbucket)         | XL   | Consumers on a git host nobody uses            |
| `#60` Support Jira / GitHub / none alongside Linear | L    | A tracker nobody uses — see Partly stale below |
| `#254` Add pi.dev as a native install target        | L    | A fourth host nobody has asked for             |
| `#388` Cline support                                | L    | Same                                           |
| `#133` Multi-dev artifact storage                   | S    | A team of developers                           |

None of these is wrong or badly scoped. They are all addressable-market work, and bkit's addressable market today is three repos.

## Already fixed — Step 4 finds

Three of 43, about 7% of the lane. Each was headed for `High` before the file was actually read.

| Issue                                              | Evidence it is done                                                                                                                                                                                                                                                                                           | Ranked                        |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| #317 SHA-pin shipped action stubs                  | Template is fully SHA-pinned — `.bkit/templates/.github/workflows/ci.yml:66,76,82,308,314,318` and the commented stubs at `:507,517,607,623`                                                                                                                                                                  | Low / XS — **close**          |
| #225 Harden `bkit-tests-check` with a test counter | `assert_ran()` exists at `.github/workflows/ci.yml:665-680`, fed by `numPassedTests + numFailedTests` per lane (`:502`, `:597`). The shipped template documents it as REQUIRED (`.bkit/templates/.github/workflows/ci.yml:796-802`). The `@live` tier the issue names does not exist in bkit by design (#374) | Low / XS — **close**          |
| #67 PR-base verification + rollback playbook       | The PR-base half landed: `.bkit/workflows/bkit-ship.md:409` extracts `PR_BASE` and takes the Failure Path when it is not `dev`. The production-rollback playbook half is still unwritten                                                                                                                      | Low / S on the remaining half |

Two more are partly stale and were sized for what actually remains:

- **#60** — GitHub and `none` both ship today (`<!-- bkit:tracker github -->` marker regions across the workflows; `tracker: none` no-ops at `.bkit/workflows/bkit-roadmap.md:48`). Only Jira is left of the three. Sized `L` for that remainder, not for the original scope.
- **#377** — the issue answers its own question in its body: _"No — dominated on every axis."_ `XS`, and a closure candidate.

## Rule 1 overrides worth reviewing

| Issue                                      | Label         | Ranked | Why                                                                                                                                      |
| ------------------------------------------ | ------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| #328 Dependency Dashboard                  | `enhancement` | Low    | **Was Urgent.** It is Renovate's auto-generated checklist, not work. Same trap consumer-a hit with its #584                              |
| #214 bkit roadmap                          | `milestone`   | Medium | **Was Urgent.** A standing sequencing doc, and largely superseded by `docs/roadmap.md`                                                   |
| #343 Consumer harvesting                   | none          | Low    | **Was High.** A standing tracker for `pnpm bkit harvest`, which already works. The harvest is not the work; the triage it feeds is (#99) |
| #374 Test coverage                         | `enhancement` | Low    | **Was High.** 81.5% statement / 74.0% branch coverage is a gap, not a defect. Nothing is broken — some things are untested               |
| #344 Deferrals triage                      | `bug`         | Low    | **Was High.** Works `docs/deferrals.jsonl`, a scope ledger. Same shape as #345 and a different subject                                   |
| #99 Friction triage                        | `bug`         | Medium | **Was High.** Low under Rule 1, +1 for live consumer reports                                                                             |
| #294 Slop tech debt                        | `bug`         | Low    | An audit of the suppression list, not a defect. The procedure in the body is already written                                             |
| #100 Agentic preflight + runtime hardening | none          | Low    | **Was Medium.** Neither the branch-protection check nor the stall detector exists yet, so the gate rule puts it in "everything else"     |
| #309 Red-team workflow                     | `enhancement` | Medium | It is _about_ security; the work is building a testing tool. `Urgent` is for holes, not for the things that look for them                |
| #249 Claude / Cursor / OpenCode YOLO mode  | `enhancement` | Low    | A guardrail-removal switch. Security-adjacent, but shipping it is a feature decision                                                     |
| #277 · #461 · #465                         | `bug`         | High   | The three `bug` labels in this lane that are actually bugs. Each verified against the file it names                                      |

## Judgement calls the owner should overturn if they disagree

1. **`Urgent` is empty across both lanes.** #317 was the single candidate and it is done. If that reads as wrong, the next-nearest candidates are #249 (ships a permission-bypass switch) and #100 (verifies branch protection before ship merges autonomously) — both currently `Low`.
2. **Seven of the ten Mediums are one signal.** Every Recurring Audits workstream moved on #80 being the live design. If #80 is not genuinely next, that whole block is one band too high — and if it is, #402 should arguably outrank its six dependants rather than sitting level with them.
3. **#345 at High, #344 at Low.** Two umbrella triage issues with identical structure, split purely on what their ledger contains. Defensible, and a reasonable person would rank them together.
4. **#374 Test coverage at Low.** Rule 1 has no band for "thin coverage on a tool whose whole job is gating other people's tests". If coverage should sit above features, Rule 1 needs a fifth category — the same gap consumer-a found with performance.
5. **Three already-fixed issues in 43.** Worth a closure sweep before the next pass, otherwise the next run re-derives the same three Step 4 finds.

You have 14 items in Ready. Only three need doing before launch: #408 itself, the fixes from the #498 audit, and probably #508. #504 is optional. The bigger blockers aren't in Ready at all: they're in In review and In progress.
Ready items to do before launch
Issue Why it matters for the launch
#408 Publish on npmjs This is the launch itself. Right now nobody can install bkit without a GitHub token. Two things moved onto it from #506 are still open. A contributor agreement (CONTRIBUTING.md) needs to exist before you merge the first outside pull request, and once the repo is public that could be day one. The lawyer review is only needed before you sell a commercial licence, so it can wait. Its three open questions also need answers: is the cbartens npm scope free, will the repo be public, and do you republish old versions?
#498 Stack-agnostic audit The audit is finished, but I couldn't find any of its 11 proposed follow-up issues, and its three "bugs found along the way" aren't filed either. Two of them are launch problems, because anyone can read what's published on npm. Follow-up 5: shipped files name your consumer projects ("consumer-a/consumer-b" in deployments.md:187 and the shipped ci.yml:502,808) and include a copy-paste DROP SCHEMA … stripe CASCADE. Follow-up 4: README.md:179 says --ci "runs green on any repo", but /bkit-build actually stops at Step 14 on a --ci-only install. The gate-runner part of that fix was sent to #467.
#508 launchd template New macOS users who open opencode or Cursor from the Dock get Missing Authentication header, because those apps don't see the BKIT_* tokens. That's a bad first run. The design is agreed and the change is small. If you skip it, at least make "launch with bkit opencode" prominent in the quick start.
#504 Example project Optional. #505's checklist wants a "See it in action" section linking a real issue → design → plan → pull request, plus a screen recording. Nothing under docs/plans/ is tracked yet, so there's nothing to link to. You could launch without that section, but this issue is what would fill it.
Ready items that can wait until after launch

- #322 (a debug or build run can finish with no CI run on the branch), #360 (no way to switch off a false-alarm advisory) and #346 (CI gate on open CRITICAL failures): these are about reliability, not first impressions. Also, #408 deletes seven of the advisory detectors anyway, which changes how much #360 is needed.
- #397 (cloud ship concurrency): two ships at once waste runner minutes but don't corrupt anything, because the .dev.lock (bkit's lock on the dev branch) makes them take turns.
- #323: comes from one consumer's Sentry setup. It leans against the stack-agnostic goal, so it's not something to rush in.
- #410, #445, #471 (reviewing other projects' patterns) and #500, #501 (punctuation and capitals style): polish.
  Blockers outside Ready
- #507 (In review) is a hard release hold. #506 says not to publish until the folder split lands. Until then, .bkit/templates/LICENSE.md puts core files, including the plan and audit templates, under MIT-0 (a licence that lets anyone do anything with them). Once a version is public under that licence, it stays that way for those files forever.
- #489 (In review): the new README describes templates the way #489 leaves them, so the README is wrong until #489 ships.
- #467 (In progress): carries the #498 fix for --ci-only installs failing at Step 14.
- #505 (In review), what's left:
- The repo description and topics are already set.
- The "Website" field still points to christianbartens.com. #505 says to switch it to the npm page after #408.
- The social preview image has to be uploaded by hand under Settings.
  Before you make the repo public
  I checked that .bkit/.env is gitignored and has never been committed. Making the repo public also exposes its whole git history, so run a secret scanner (for example gitleaks) over all of it first.
  Side note: your editor selection attached the OpenRouter key from .bkit/.env to this chat. It isn't in the repo, but rotate it if this chat log gets shared anywhere.
  Suggested order:

1. Land #507, #489 and #467.
2. File the #498 follow-ups and fix 4 and 5.
3. Add CONTRIBUTING.md with the contributor agreement.
4. Do #508.
5. Do #408's publish, in the order its Sequencing section sets out.
6. Optionally, do #504 for the demo section.

Other Ready items (Size M — not quick fixes)

# Title Priority Milestone

#322 Harden workflow close: failures stay CI-verifiable High Workflow Optimisation
#360 Post-install: JSON-safe per-package advisory suppression Medium Provider Support
#397 bkit-cloud concurrency: global ship lock, FID arbitration Medium Workflow Optimisation
#323 Promote logging/error anti-pattern guards into slop snippet Low Workflow Optimisation
#346 CI gate: block on open CRITICAL failures, age old deferrals Low Workflow Optimisation

#504 Example project run from design to ship: explainer, demo, workflow benchmark Medium Workflow Optimisation

## #410 — Review and adopt AgentMemory patterns (OPEN)

See https://github.com/rohitg00/agentmemory

## AgentMemory (rohitg00/agentmemory) — adoption review

Read the repo (Apache-2.0, TS, ~175 src files, self-hosted **iii-engine** server on :3111 + MCP shim + 12 Claude Code hooks + 15 skills + hybrid BM25/vector/graph search + 4-tier consolidation).

**Framing.** bkit already _has_ a memory system — six append-only JSONL ledgers with a fold-by-`key` update model (`.bkit/jsonl.md`). AgentMemory's _architecture_ is the wrong shape for us (see § Rejected), but it is strong on the two things bkit is weak on: **deterministic capture** and **retrieval**. bkit's capture is model-self-report prose; bkit's read side does not exist (no verb, no index — `bkit --help` has no `recall`, and the only "read the ledger" mechanism is a prose instruction in `.bkit/jsonl.md` § These Ledgers Are Inputs, Not a Diary).

Caveat on their numbers: repo is 5 months old, benchmark table (R@5 95.2% on LongMemEval-S) is vendor-published and self-graded. Treat as marketing; the code patterns below stand on their own.

### Ranked

| #   | Adopt                                                                   | Impact   | Complexity | Verdict                |
| --- | ----------------------------------------------------------------------- | -------- | ---------- | ---------------------- |
| 1   | Secret redaction before persist (`src/functions/privacy.ts`)            | **High** | **Low**    | Do now                 |
| 2   | Deterministic hook capture — `PostToolUseFailure` → friction row        | **High** | Medium     | Do next                |
| 3   | `bkit recall` — a read side over the ledgers                            | **High** | Medium     | Design it              |
| 4   | `/bkit-recap` handoff skill + WRONG/RIGHT anti-pattern block in prompts | Med-High | **Low**    | Cheap win              |
| 5   | Repo-scoped lease (second level above the per-FID `.lock`)              | Medium   | Medium     | Worth it               |
| 6   | Transcript miner (`import-jsonl`) to replace hand-read friction harvest | Medium   | Medium     | Pairs with 2           |
| 7   | Automated promotion/decay across the ledger tiers                       | Medium   | **High**   | Needs a design         |
| 8   | Eval harness — does the memory actually help?                           | Low-Med  | **High**   | Park                   |
| 9   | Branch/worktree-scoped keying (`branch-aware.ts`)                       | Low      | Low        | Mostly already have it |

---

### 1. Secret redaction before persist — High / Low

`src/functions/privacy.ts` is 15 regexes + a `<private>…</private>` tag strip, applied to every observation **before** storage: `sk-ant-`, `ghp_`/`gh[pus]_`, `github_pat_`, `AKIA…`, `AIza…`, `npm_`, `glpat-`, `xoxb-`, bare JWTs, and a generic `(api[_-]?key|secret|token|password|credential|auth)\s*[=:]\s*…{20,}`.

Why this matters here specifically: friction/failure/knowledge `description` fields are agent-written prose that routinely quotes command output and error text, and `bkit harvest` **MOVES** consumer `.bkit/friction.jsonl` rows into this repo's `harvest/` store. That is a cross-repo path for a consumer's token to land in bkit's git history. Our only current guard is a _comment_ in `bkit-harvest.ts:9` ("Touches ONLY the named .jsonl ledgers — never any .env/secret files") — which is true and irrelevant, since the leak vector is a token pasted into prose, not a file read. `gh[pus]_`/`github_pat_` are directly live for us given `.bkit/.env` holds GH PATs.

Landing spot: `bkit-telemetry-normalise.ts` (already the write-path normaliser) + the harvest copy path, with a test per pattern. ~40 lines. Apache-2.0 → attribution/NOTICE if we lift the regex list verbatim.

### 2. Deterministic hook capture — High / Medium

They ship 12 lifecycle hooks (`plugin/hooks/hooks.json`): SessionStart, UserPromptSubmit, PreToolUse, **PostToolUse**, **PostToolUseFailure**, **PreCompact**, SubagentStart/Stop, Stop, SessionEnd.

We ship **two**: `SessionStart` (preflight + cloud-bootstrap) and `PreToolUse` on `Edit|Write|MultiEdit` (gateguard). So every friction row exists only because an orchestrator noticed friction and chose to write it — and `bkit-analysis.ts` already labels this honestly: `counterSource` trust labelling, `"model-self-report"` vs `"shell-bus"`.

`PostToolUseFailure` → append `kind:"friction"`, `category:"tool-failure"` is a near-exact fit for our existing friction category enum (`tool-failure`, `permission-prompt`, `human-confirm`, `agent-rework`). No new infra — it is one appended line. Turns friction from _remembered_ into _measured_.

Two details to steal with it: their **SHA-256 content dedup on a 5-minute window** (a command retried 5× must not become 5 rows — our identity tuple dedups by `(kind, repo, key)` but hook-minted keys would collide differently), and hooks must be fail-open/cheap. Mirroring across `.claude`/`.cursor`/`.opencode` is already solved by the managed-block install.

### 3. `bkit recall` — High / Medium

Their entire thesis. We write six ledgers religiously and have built a linter, a normaliser, a migrator, an integrity scan, and a rollup sharder for them — and **zero** read verbs. "Read before designing or planning" is doctrine, not a step.

We don't need their stack for this: ~200 folded rows total across all ledgers means BM25 is already overkill and embeddings are absurd. `bkit recall <query> [--kind=] [--open]` that folds by `key`, ranks `CRITICAL` → oldest `ts`, and prints a **token-budgeted** digest (their `TOKEN_BUDGET=2000` is the right instinct) makes the ledgers worth writing. Fold logic already exists (`bkit-status.ts` `fold`, `bkit-analysis.ts` `foldFrom`) — the work is ranking + output shaping, not retrieval.

### 4. `/bkit-recap` + anti-pattern blocks — Med-High / Low

`plugin/skills/handoff/SKILL.md` resumes the last session for a cwd and **leads with the unanswered question**. We have `bkit-debug-abort-handover` — but only for aborts; there is no "where were we" for a session that merely ran out of turns (a documented recurring pain). status.jsonl fold already gives us the state, so this is packaging, not plumbing.

Independent of that, every one of their skills uses the same five-part shape: Quick start → Why → Workflow → **Anti-patterns (explicit WRONG: / RIGHT: pair)** → Checklist. Our prompts have the checklist; the WRONG/RIGHT block is a cheap quality lift. Their own example is a good one — `session.cwd.startsWith(projectPath)` matches `/repo-a-staging` when the project is `/repo-a`; the RIGHT form is a directory-boundary check.

### 5. Repo-scoped lease — Medium / Medium

`src/functions/leases.ts`: owner id + TTL (10 min default, 60 min cap) + explicit renew + `withKeyedLock`.

We are closer than I expected — the per-FID `.lock` already has an owner cross-check against the owning workflow's folded status.jsonl and a 1800s staleness cut-off. The gap is _scope_: our lock is per-FID, but the documented collision (two workflows on one clone, 2026-05-26: `core.bare` flip + push block) is two **different** FIDs contending for shared resources — `dev`, the working tree, `.git/config`. Their model argues for a second, repo-scoped lease level above the per-FID one.

### 6. Transcript miner — Medium / Medium

`agentmemory import-jsonl` ingests Claude Code transcripts from `~/.claude/projects/**/*.jsonl`. Our equivalent is `utility-harvest-friction` — an _agent_ reading logs and deciding what was frictional. A deterministic miner beats an agent for this, and it back-fills history that hooks (#2) can only capture going forward.

### 7. Promotion / decay — Medium / High

Their 4-tier working → episodic → semantic → procedural, plus Ebbinghaus decay, contradiction detection, and auto-evict (`auto-forget.ts`, `retention.ts`, `crystallize.ts`, `lessons.ts`).

We have the _tiers_ already, unnamed: friction (raw) → deferral/failure (triaged) → knowledge (fact) → `rules.md`/`docs/` (procedural). And friction's `confidence` / `lastConfirmed` / `recurrenceCount` is decay-lite by hand. What is missing is **movement**: nothing ages out a knowledge row that stopped being true, and nothing promotes a friction row that has recurred 5× into a rule. `bkit harvest` is the only mover, it is manual, and it is bkit-repo-only. Real design work — flagging, not scheduling.

### 8–9. Park

**Eval harness** (`eval/`, LongMemEval): they can answer "does the memory help"; we cannot. But a credible bkit version means correlating `outcome` rows against whether a run read the ledger, and I don't see a cheap honest way to instrument that. **`branch-aware.ts`** uses `--git-dir` vs `--git-common-dir` to key memory per worktree — we already anchor the lock path with `--path-format=absolute --git-common-dir`, so there's little left to take.

---

### Rejected — and why

- **The iii-engine server / ports 3111-3113 / 49134.** A localhost daemon per consumer repo contradicts bkit's zero-infra, file-based, commit-it-to-git model. Memory that lives outside the repo cannot be reviewed in a PR, cannot be harvested, and does not survive a fresh clone.
- **Vector embeddings + LLM compression.** Cost and a provider dependency to search ~200 rows. Also stack-coupling — bkit's shipped surface stays stack-independent.
- **53 MCP tools / 6 resources / 3 prompts.** Our tracker-write surface is deliberately narrow (MCP for issue writes only).
- **Knowledge graph, real-time viewer, multi-instance mesh/pubsub, session replay.** Solving problems we don't have at our data volume.

**Suggested sequencing:** 1 → 2 (+dedup window) → 3, then re-assess. 1 is a security fix and should not wait on the rest.

## #205 — Model registry (OPEN)

Run `.bkit/prompts/bkit-audit-generate.md` with `docs/templates/bkit-audit-models.md` to generate the latest audit report.

Copy-paste prompt:

```
Run .bkit/prompts/bkit-audit-generate.md.

Read: docs/templates/bkit-audit-models.md
```

The agent writes `docs/audits/{YYYYMM}/models.md`. If that month already has this slug, it writes `models-{TIMESTAMP}.md` and does not overwrite.

Shipped in **v3.1.0** (PR #220, tag `v3.1.0`, npm `@cbartens/bkit@3.1.0`).

**Claude side:** all 25 Opus-pinned agents `claude-opus-4-7` → `claude-opus-4-8`. Sonnet 4.6 / Haiku 4.5 were already the latest in their families, so they were left untouched (deliberate cross-tier/cross-family diversity preserved).

**Cursor side:** corrected to the live `/v0/models` API format rather than a naive digit-bump. The repo had been pinning `claude-4.7-opus-high-thinking`, a word-order the API never listed (only the legacy 4.6 model used it) — the likely root of the long-standing "may not be subagent-valid" caveat in `IDEs.md`. Now pins **`claude-opus-4-8-thinking-high`**, verified present in the live API on 2026-06-02. Cross-family slots moved `gpt-5.4-high` → `gpt-5.5-high`. `/design` `/plan` `/debug` orchestrator pins → Opus 4.8.

`IDEs.md` Cursor catalog rewritten to match the live API; dashboard label-routing UUID table flagged as lagging (re-pull before use). `.claude/agents` + `.cursor/agents` mirrors regenerated.

**One open follow-up (not blocking):** the IDE subagent-runner surface is technically distinct from the Cloud Agents API. The corrected IDs are confirmed in `/v0/models`, but per-subagent dispatch hasn't been smoke-tested via the Cursor `Task` tool — worth one dispatch-per-ID confirmation before treating the Cursor side as fully validated.

https://www.anthropic.com/news/claude-fable-5-mythos-5

https://openrouter.ai/nvidia/nemotron-3-ultra-550b-a55b:free
https://build.nvidia.com/nvidia/nemotron-3-ultra-550b-a55b

current in prompts.md

| Prompt                              | Claude                      | Cursor                          | Nvidia                                       | Ollama (Local)                  | Effort   | Max Turns | Role                                                                                                                                    |
| ----------------------------------- | --------------------------- | ------------------------------- | -------------------------------------------- | ------------------------------- | -------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `bkit-design-brainstorm-ideate-1`   | `claude-opus-4-8`           | `claude-opus-4-8-thinking-high` | `nvidia/moonshotai/kimi-k2.6`                | `ollama-local/qwen2.5-coder:7b` | `high`   | 50        | parallel slot 1 (pragmatic lens)                                                                                                        |
| `bkit-design-brainstorm-ideate-2`   | `claude-sonnet-4-6`         | `gpt-5.5-high`                  | `nvidia/qwen/qwen3-coder-480b-a35b-instruct` | `ollama-local/qwen2.5-coder:7b` | `medium` | 50        | parallel slot 2 (optimal-tradeoff lens; cross-family on Cursor; cross-tier on Claude)                                                   |
| `bkit-design-brainstorm-ideate-3`   | `claude-opus-4-8`           | `claude-opus-4-8-thinking-high` | `nvidia/deepseek-ai/deepseek-v4-pro`         | `ollama-local/qwen2.5-coder:7b` | `high`   | 50        | parallel slot 3 (risk-premortem lens)                                                                                                   |
| `bkit-design-review-1`              | `claude-opus-4-8`           | `claude-opus-4-8-thinking-high` | `nvidia/moonshotai/kimi-k2.6`                | `ollama-local/qwen2.5-coder:7b` | `high`   | 50        | design review slot 1 (web search + feasibility analysis)                                                                                |
| `bkit-design-review-2`              | `claude-sonnet-4-6`         | `gpt-5.5-high`                  | `nvidia/qwen/qwen3-coder-480b-a35b-instruct` | `ollama-local/qwen2.5-coder:7b` | `medium` | 50        | design review slot 2 (cross-family on Cursor; cross-tier on Claude)                                                                     |
| `bkit-design-update`                | `claude-opus-4-8`           | `claude-opus-4-8-thinking-high` | `nvidia/moonshotai/kimi-k2.6`                | `ollama-local/qwen2.5-coder:7b` | `xhigh`  | 50        | merge review critiques into design (whole-doc rewrite — needs depth)                                                                    |
| `bkit-design-organise`              | `claude-opus-4-8`           | `claude-opus-4-8-thinking-high` | `nvidia/moonshotai/kimi-k2.6`                | `ollama-local/qwen2.5-coder:7b` | `high`   | 50        | decompose reviewed design into dependency-annotated workstreams; coverage self-verify + DAG cycle detection                             |
| `bkit-design-summary`               | `claude-haiku-4-5-20251001` | `composer-2.5`                  | `nvidia/openai/gpt-oss-20b`                  | `ollama-local/qwen2.5-coder:7b` | `low`    | 25        | summary writer                                                                                                                          |
| `bkit-design-generate`              | `claude-opus-4-8`           | `claude-opus-4-8-thinking-high` | `nvidia/moonshotai/kimi-k2.6`                | `ollama-local/qwen2.5-coder:7b` | `xhigh`  | 50        | generate design from brainstorms (top-of-pipeline synthesizer; whole-doc rewrite)                                                       |
| `bkit-plan-complexity-check`        | `claude-sonnet-4-6`         | `composer-2.5`                  | `nvidia/qwen/qwen3-coder-480b-a35b-instruct` | `ollama-local/qwen2.5-coder:7b` | `medium` | 25        | complexity check                                                                                                                        |
| `bkit-plan-generate`                | `claude-opus-4-8`           | `gpt-5.5-high`                  | `nvidia/moonshotai/kimi-k2.6`                | `ollama-local/qwen2.5-coder:7b` | `xhigh`  | 50        | plan draft generator (top-of-pipeline synthesizer)                                                                                      |
| `bkit-plan-review-1`                | `claude-opus-4-8`           | `claude-opus-4-8-thinking-high` | `nvidia/moonshotai/kimi-k2.6`                | `ollama-local/qwen2.5-coder:7b` | `high`   | 50        | review slot 1 (tightness + design-coverage)                                                                                             |
| `bkit-plan-review-2`                | `claude-opus-4-8`           | `claude-opus-4-8-thinking-high` | `nvidia/moonshotai/kimi-k2.6`                | `ollama-local/qwen2.5-coder:7b` | `medium` | 50        | review slot 2 (dependency-correctness + design-coverage; depth-sensitive lens — both opus)                                              |
| `bkit-plan-review-3`                | `claude-opus-4-8`           | `claude-opus-4-8-thinking-high` | `nvidia/deepseek-ai/deepseek-v4-pro`         | `ollama-local/qwen2.5-coder:7b` | `high`   | 50        | review slot 3 (regression-risk + design-coverage)                                                                                       |
| `bkit-plan-scope-check-1`           | `claude-opus-4-8`           | `claude-opus-4-8-thinking-high` | `nvidia/moonshotai/kimi-k2.6`                | `ollama-local/qwen2.5-coder:7b` | `medium` | 25        | scope audit slot 1 (mechanical audit — medium effort)                                                                                   |
| `bkit-plan-scope-check-2`           | `claude-sonnet-4-6`         | `gpt-5.5-high`                  | `nvidia/qwen/qwen3-coder-480b-a35b-instruct` | `ollama-local/qwen2.5-coder:7b` | `medium` | 25        | scope audit slot 2                                                                                                                      |
| `bkit-plan-complexity-split`        | `claude-opus-4-8`           | `gpt-5.5-high`                  | `nvidia/moonshotai/kimi-k2.6`                | `ollama-local/qwen2.5-coder:7b` | `high`   | 50        | split large plan                                                                                                                        |
| `bkit-plan-summary`                 | `claude-haiku-4-5-20251001` | `composer-2.5`                  | `nvidia/openai/gpt-oss-20b`                  | `ollama-local/qwen2.5-coder:7b` | `low`    | 25        | summary writer                                                                                                                          |
| `bkit-plan-update`                  | `claude-opus-4-8`           | `claude-opus-4-8-thinking-high` | `nvidia/moonshotai/kimi-k2.6`                | `ollama-local/qwen2.5-coder:7b` | `xhigh`  | 50        | merge review + scope critiques into plan (whole-doc rewrite — needs depth)                                                              |
| `bkit-build-install-skills`         | `claude-sonnet-4-6`         | `composer-2.5`                  | `nvidia/qwen/qwen3-coder-480b-a35b-instruct` | `ollama-local/qwen2.5-coder:7b` | `medium` | 25        | skill identifier                                                                                                                        |
| `bkit-build-challenge-1`            | `claude-opus-4-8`           | `claude-opus-4-8-thinking-high` | `nvidia/moonshotai/kimi-k2.6`                | `ollama-local/qwen2.5-coder:7b` | `high`   | 50        | parallel slot 1 (bug-hunting lens)                                                                                                      |
| `bkit-build-challenge-2`            | `claude-opus-4-8`           | `claude-opus-4-8-thinking-high` | `nvidia/deepseek-ai/deepseek-v4-pro`         | `ollama-local/qwen2.5-coder:7b` | `high`   | 50        | parallel slot 2 (security lens; depth-sensitive — both opus)                                                                            |
| `bkit-build-challenge-reconcile`    | `claude-opus-4-8`           | `claude-opus-4-8-thinking-high` | `nvidia/moonshotai/kimi-k2.6`                | `ollama-local/qwen2.5-coder:7b` | `xhigh`  | 30        | merge parallel challenge findings (whole-doc rewrite)                                                                                   |
| `bkit-build-challenge-tests`        | `claude-sonnet-4-6`         | `composer-2.5`                  | `nvidia/qwen/qwen3-coder-480b-a35b-instruct` | `ollama-local/qwen2.5-coder:7b` | `medium` | 50        | test generator (source modifier, no test loop)                                                                                          |
| `bkit-build-plan-execute`           | `claude-sonnet-4-6`         | `composer-2.5`                  | `nvidia/qwen/qwen3-coder-480b-a35b-instruct` | `ollama-local/qwen2.5-coder:7b` | `medium` | 100       | task executor (source modifier with test loop; ceiling — split if exceeded)                                                             |
| `bkit-build-challenge-remediate`    | `claude-sonnet-4-6`         | `composer-2.5`                  | `nvidia/qwen/qwen3-coder-480b-a35b-instruct` | `ollama-local/qwen2.5-coder:7b` | `medium` | 100       | fix challenge findings (source modifier with test loop)                                                                                 |
| `bkit-build-plan-gaps-remediate`    | `claude-sonnet-4-6`         | `composer-2.5`                  | `nvidia/qwen/qwen3-coder-480b-a35b-instruct` | `ollama-local/qwen2.5-coder:7b` | `medium` | 100       | fix verification gaps (source modifier with test loop)                                                                                  |
| `bkit-build-summary`                | `claude-haiku-4-5-20251001` | `composer-2.5`                  | `nvidia/openai/gpt-oss-20b`                  | `ollama-local/qwen2.5-coder:7b` | `low`    | 25        | summary writer                                                                                                                          |
| `bkit-build-plan-verify`            | `claude-opus-4-8`           | `claude-opus-4-8-thinking-high` | `nvidia/moonshotai/kimi-k2.6`                | `ollama-local/qwen2.5-coder:7b` | `high`   | 50        | verify impl vs plan                                                                                                                     |
| `bkit-debug-abort-handover`         | `claude-sonnet-4-6`         | `composer-2.5`                  | `nvidia/qwen/qwen3-coder-480b-a35b-instruct` | `ollama-local/qwen2.5-coder:7b` | `medium` | 25        | handover writer                                                                                                                         |
| `bkit-debug-failure-diagnose`       | `claude-opus-4-8`           | `claude-opus-4-8-thinking-high` | `nvidia/deepseek-ai/deepseek-v4-pro`         | `ollama-local/qwen2.5-coder:7b` | `xhigh`  | 50        | failure diagnosis (Final-strategy attempts especially benefit from depth before human handover)                                         |
| `bkit-debug-failure-remediate`      | `claude-sonnet-4-6`         | `composer-2.5`                  | `nvidia/qwen/qwen3-coder-480b-a35b-instruct` | `ollama-local/qwen2.5-coder:7b` | `medium` | 100       | implement diagnosis fixes (source modifier with test loop)                                                                              |
| `bkit-debug-failure-soak`           | `claude-opus-4-8`           | `claude-opus-4-8-thinking-high` | `nvidia/deepseek-ai/deepseek-v4-pro`         | `ollama-local/qwen2.5-coder:7b` | `xhigh`  | 100       | soak fix — one accumulating-context instrument-or-fix step per iteration against the live boundary (orchestrator re-runs tests + loops) |
| `bkit-debug-summary`                | `claude-haiku-4-5-20251001` | `composer-2.5`                  | `nvidia/openai/gpt-oss-20b`                  | `ollama-local/qwen2.5-coder:7b` | `low`    | 25        | summary writer                                                                                                                          |
| `bkit-ship-summary`                 | `claude-haiku-4-5-20251001` | `composer-2.5`                  | `nvidia/openai/gpt-oss-20b`                  | `ollama-local/qwen2.5-coder:7b` | `low`    | 25        | summary writer                                                                                                                          |
| `bkit-ship-update-docs`             | `claude-opus-4-8`           | `claude-opus-4-8-thinking-high` | `nvidia/moonshotai/kimi-k2.6`                | `ollama-local/qwen2.5-coder:7b` | `high`   | 50        | update completed.md (multi-doc writer)                                                                                                  |
| `bkit-ship-conflict-resolve`        | `claude-sonnet-4-6`         | `composer-2.5`                  | `nvidia/qwen/qwen3-coder-480b-a35b-instruct` | `ollama-local/qwen2.5-coder:7b` | `medium` | 100       | mechanical rebase-conflict resolver (source modifier with test loop)                                                                    |
| `bkit-ship-deferred-sweep`          | `claude-opus-4-8`           | `claude-opus-4-8-thinking-high` | `nvidia/moonshotai/kimi-k2.6`                | `ollama-local/qwen2.5-coder:7b` | `high`   | 50        | pre-merge completeness gate — intended-vs-actual + declared-deferral resurface                                                          |
| `bkit-utility-audit-codebase`       | `claude-opus-4-8`           | `claude-opus-4-8-thinking-high` | `nvidia/moonshotai/kimi-k2.6`                | `ollama-local/qwen2.5-coder:7b` | `high`   | 50        | codebase audit                                                                                                                          |
| `bkit-utility-audit-security`       | `claude-opus-4-8`           | `claude-opus-4-8-thinking-high` | `nvidia/moonshotai/kimi-k2.6`                | `ollama-local/qwen2.5-coder:7b` | `high`   | 50        | security audit                                                                                                                          |
| `bkit-utility-audit-tests`          | `claude-opus-4-8`           | `claude-opus-4-8-thinking-high` | `nvidia/moonshotai/kimi-k2.6`                | `ollama-local/qwen2.5-coder:7b` | `high`   | 50        | test coverage audit                                                                                                                     |
| `bkit-utility-compress-markdown`    | `claude-sonnet-4-6`         | `composer-2.5`                  | `nvidia/qwen/qwen3-coder-480b-a35b-instruct` | `ollama-local/qwen2.5-coder:7b` | `medium` | 25        | token-optimize markdown                                                                                                                 |
| `bkit-utility-audit-logs`           | `claude-sonnet-4-6`         | `composer-2.5`                  | `nvidia/qwen/qwen3-coder-480b-a35b-instruct` | `ollama-local/qwen2.5-coder:7b` | `medium` | 25        | scan production logs                                                                                                                    |
| `bkit-utility-update-documentation` | `claude-sonnet-4-6`         | `composer-2.5`                  | `nvidia/qwen/qwen3-coder-480b-a35b-instruct` | `ollama-local/qwen2.5-coder:7b` | `medium` | 50        | doc sync (multi-doc writer)                                                                                                             |
| `bkit-utility-update-references`    | `claude-sonnet-4-6`         | `composer-2.5`                  | `nvidia/qwen/qwen3-coder-480b-a35b-instruct` | `ollama-local/qwen2.5-coder:7b` | `medium` | 50        | fix broken refs                                                                                                                         |
| `bkit-utility-audit-logs-ship`      | `claude-sonnet-4-6`         | `composer-2.5`                  | `nvidia/qwen/qwen3-coder-480b-a35b-instruct` | `ollama-local/qwen2.5-coder:7b` | `medium` | 25        | post-deploy verify                                                                                                                      |

## Model-selection review — 2026-06-10 (no code changed; review only)

Reviewed the current `prompts.md` table (comment above) against the issue's sources: [Artificial Analysis leaderboard](https://artificialanalysis.ai/leaderboards/models), the [Claude models overview](https://platform.claude.com/docs/en/about-claude/models/overview), Cursor models, [build.nvidia.com](https://build.nvidia.com/models), and Ollama. Also adjudicated the two candidate models dropped into this thread since v3.1.0 — **Fable 5** and **Nemotron 3 Ultra 550B**.

**Verdict:** three of four columns are current and well-reasoned; the Claude column is provably optimal right now. The **only genuinely dated pin is the local Ollama model**. Both candidate models evaluate to **don't-adopt-now** for bkit's coding/agentic workload, with reasons below.

---

### Claude column — optimal, externally confirmed

`low → haiku-4-5`, `medium → sonnet-4-6`, `high/xhigh/max → opus-4-8`. All three are the current head of their tier (Sonnet 4.5 / Haiku 3.5 are legacy/retired). AA's June 2026 **Intelligence Index puts Opus 4.8 at #1 (61), winning coding, agentic, and reasoning outright** — exactly the axes the high/xhigh slots live on. AA top-5 for reference: Opus 4.8 (61) › GPT-5.5 xhigh (60) › GPT-5.5 high (59) › Opus 4.7 max (57) › Gemini 3.1 Pro (57). **No change.**

### Cursor column — current

`composer-2.5` shipped **2026-05-18** (current; built on Kimi K2.5, benchmarked on par with Opus 4.7 / GPT-5.5 at ~1/10 cost). `gpt-5.5-high` current (AA #2). `claude-opus-4-8-thinking-high` matches the Claude pin and was format-corrected in v3.1.0. **No change.** Still-open validation item from the v3.1.0 comment: per-subagent dispatch of the corrected Cursor IDs via the Cursor `Task` tool hasn't been smoke-tested — that remains the one unverified Cursor surface.

### Nvidia column — current; DeepSeek placement validated

`kimi-k2.6` (top reasoning slot), `qwen3-coder-480b` (sonnet-tier), `gpt-oss-20b` (haiku-tier), `deepseek-v4-pro` (convergent-reasoning slots). **DeepSeek V4-Pro wins AA "value-for-money" outright** — and it's placed precisely on the risk/diagnosis lenses (`challenge-2`, `plan-review-3`, `debug-failure-diagnose`/`soak`). Kimi K2.6 is the strongest open model here (**AA Index 54**). All current; no change required. (Did not exhaustively re-verify every NIM ID against build.nvidia.com.)

### Ollama (local) column — **the one dated pin**

`ollama-local/qwen2.5-coder:7b` (uniform across all agents) is the selection 2026 has moved past. Community consensus now favors the **Qwen3 family** for local coding; Qwen2.5-Coder is superseded. Same-footprint upgrade candidates, respecting the "uniform, one-model, memory-safe single box" design constraint:

- **`qwen3` (8B)** — low-risk drop-in, ~same RAM, 256K context (vs 2.5-Coder's 128K), newer reasoning. Recommended default.
- **Qwen3-Coder-Next (80B-A3B MoE)** — biggest quality jump ("best free local coding model 2026", performs like models 10–20× larger) but the 80B weights break the small-footprint assumption — only if the local box has the RAM.

Exact Ollama tag to be confirmed against https://ollama.com/search before pinning (issue checklist item).

---

### Candidate adjudication (the two models dropped into this thread)

**Fable 5** ([news](https://www.anthropic.com/news/claude-fable-5-mythos-5)) — Anthropic's new tier above Opus ($10/$50 vs Opus 4.8's $5/$25). **Don't adopt for bkit.** As of the June 2026 AA snapshot it is not shown beating Opus 4.8 on the Intelligence Index / coding / agentic axes (Opus 4.8 holds #1 and wins those categories outright), and it's 2× the output cost. The "Fable/Mythos" framing + $50 output price reads as a creative/long-form tier, not coding-agentic. Natural home would be the currently-empty `max` reserved tier, but AA gives no case for it there over Opus 4.8. **Recommendation:** document as a deliberate non-adoption in the `max` row; revisit only if AA ranks it and it leads coding/agentic.

**Nemotron 3 Ultra 550B-A55B** ([model card](https://build.nvidia.com/nvidia/nemotron-3-ultra-550b-a55b/modelcard), [OpenRouter free](https://openrouter.ai/nvidia/nemotron-3-ultra-550b-a55b:free)) — hybrid Mamba-Transformer MoE, **AA Index 48** (highest US open-weight). **Not a quality upgrade for the Nvidia top slot:** the incumbent `kimi-k2.6` scores **54** (and leads several reasoning benchmarks incl. GPQA Diamond), so swapping it onto the opus-tier slot would trade intelligence for speed. **But it's a strong throughput/cost play** — 5.9×/4.8×/1.6× higher inference throughput vs GLM-5.1 / Kimi-K2.6 / Qwen-3.5, up to **30% lower agentic cost**, fewer tokens/turn on SWE-bench + Terminal-Bench, explicitly built for _long-running agents_, and free on OpenRouter. **Recommendation:** keep Kimi K2.6 on the top reasoning slots; evaluate Nemotron 3 Ultra for the **high-volume agentic-loop slots** (the sonnet-tier source modifiers with test loops — `build-plan-execute`, `*-remediate`, `debug-failure-soak`, currently on `qwen3-coder-480b`) and/or as the documented fallback for providers without a column. Its "long-running agent" profile maps cleanly onto bkit's L-tier source-modifier loops.

---

### Recommended actions (ranked)

1. **Change:** local Ollama pin `qwen2.5-coder:7b` → `qwen3` (8B) family — single uniform-cell edit; confirm exact tag on ollama.com/search.
2. **Document (non-adoption):** add a one-line note in the `max` row that Fable 5 exists above Opus but isn't better for coding/agentic per AA → not adopted.
3. **Evaluate (optional):** Nemotron 3 Ultra on the Nvidia sonnet-tier agentic-loop slots as a throughput/cost swap — A/B before committing; not a top-slot replacement.
4. **Carry forward (open):** Cursor per-subagent dispatch smoke-test of the corrected IDs (from the v3.1.0 comment).

### Sources

- [Artificial Analysis — LLM Leaderboard](https://artificialanalysis.ai/leaderboards/models) · [June 2026 category winners (BuildFastWithAI)](https://www.buildfastwithai.com/blogs/best-ai-models-june-2026-leaderboard)
- [Cursor Composer 2.5 launch (The Decoder)](https://the-decoder.com/cursors-composer-2-5-matches-opus-4-7-and-gpt-5-5-benchmarks-at-a-fraction-of-the-cost/) · [Composer 2.5 / Kimi K2.5 (The New Stack)](https://thenewstack.io/cursor-composer-benchmarks/)
- [Nemotron 3 Ultra review (BuildFastWithAI)](https://www.buildfastwithai.com/blogs/nvidia-nemotron-3-ultra-review-2026) · [NVIDIA dev blog](https://developer.nvidia.com/blog/nvidia-nemotron-3-ultra-powers-faster-more-efficient-reasoning-for-long-running-agents/) · [model card](https://build.nvidia.com/nvidia/nemotron-3-ultra-550b-a55b/modelcard)
- [Qwen3-Coder-Next (Qwen blog)](https://qwen.ai/blog?id=qwen3-coder-next) · [Best Local Coding LLMs 2026 (PromptQuorum)](https://www.promptquorum.com/local-llms/best-local-llms-for-coding)

### Hardware constraint for `ollama-local` — MacBook Air M5, 32 GB (fanless)

Target box: **M5 MacBook Air, 32 GB unified, no fan.** "Runs easily" means two limits, not one:

- **Memory ceiling:** 32 GB unified, leave ~8–10 GB for macOS + apps → **~20–24 GB usable for weights.** Stay under ~24 GB resident.
- **Sustained-compute (fanless):** the Air throttles under long load, so prefer **MoE** models — they keep _active_ params (and therefore heat) low even at a larger total size.

This **corrects the Ollama recommendation in my review above** — the 80 B option I floated does **not** fit:

| Candidate                                                 | Q4 footprint             | M5 Air 32 GB?                                                       |
| --------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------- |
| `qwen2.5-coder:7b` (current)                              | ~4.7 GB                  | ✅ trivial                                                          |
| **`qwen3:8b`**                                            | ~5 GB                    | ✅ trivial — conservative same-footprint swap                       |
| **Qwen3-30B-A3B / Qwen3-Coder-30B-A3B** (MoE, 3 B active) | ~16–18 GB                | ✅ comfortable + headroom; **3 B active = fast & fanless-friendly** |
| ~~Qwen3-Coder-Next 80B-A3B~~                              | **~46 GB** unified at Q4 | ❌ **does not fit 32 GB** — ruled out                               |

**Revised pick under this constraint:**

1. **Best quality that still "runs easily": `qwen3-coder:30b-a3b`** (≈18 GB, MoE → low active compute, fits 32 GB with margin). The MoE shape is ideal for a fanless Air — big memory model, small compute footprint.
2. **Most conservative: `qwen3:8b`** (≈5 GB) — closest to the current 7 B footprint, zero risk.
3. **Hard ceiling:** keep any uniform `ollama-local` pin at **≤ ~24 GB Q4 weights**; anything dense >32B or MoE >~30B-class (incl. Qwen3-Coder-Next 80B) is off the table for this hardware.

Confirm exact Ollama tags + quant on https://ollama.com/search before pinning. Supersedes the "Qwen3-Coder-Next (if RAM allows)" line in the previous comment — RAM does not allow on a 32 GB box.

Sources: [Qwen3-Coder-Next local hardware (~46 GB unified, Q4)](https://www.hardware-corner.net/qwen3-coder-next-hardware-requirements/) · [Ollama RAM/VRAM table — 30B-A3B ~16–18 GB Q4](https://localaimaster.com/blog/ollama-model-ram-vram-table) · [Run Qwen3-8B on Mac](https://codersera.com/blog/run-qwen-3-8b-on-mac-an-installation-guide/)

### Tag correction — `qwen3-coder:30b-a3b` is not a pullable Ollama tag

`ollama pull qwen3-coder:30b-a3b` → `Error: pull model manifest: file does not exist`. Ollama folds the A3B/MoE detail into the bare `30b` tag. Verified tags on [ollama.com/library/qwen3-coder](https://ollama.com/library/qwen3-coder/tags) (2026-06-10):

- **Best pick:** **`qwen3-coder:30b`** (= `latest` = `30b-a3b-q4_K_M`, **19 GB** Q4_K_M, MoE A3B, 256K ctx) — fits 32 GB with ~13 GB headroom.
- **Conservative:** **`qwen3:8b`** (5.2 GB).
- **Avoid on a 32 GB box:** `qwen3-coder:30b-a3b-q8_0` (**32 GB** — no headroom) and `…-fp16` (61 GB). Stay on Q4.

Fully-qualified equivalent of the best pick is `qwen3-coder:30b-a3b-q4_K_M`. Supersedes the `qwen3-coder:30b-a3b` string in the previous comment.

## Recommended changes — decision-ready summary

Consolidates the review + corrections above into an actionable list. **One real model swap; everything else is a doc note or a non-edit.**

### 1. Change now — Ollama column (only model change)

`.bkit/prompts.md` § Models, uniform across all ~45 agents:

```
ollama-local/qwen2.5-coder:7b  →  ollama-local/qwen3-coder:30b
```

- **Why:** Qwen2.5-Coder is superseded for local coding; `qwen3-coder:30b` (= `latest` = `30b-a3b-q4_K_M`, 19 GB Q4, MoE 3B-active, 256K ctx) fits the M5 Air 32 GB target with headroom and is fanless-friendly.
- **Conservative fallback:** `qwen3:8b` (5.2 GB) if minimal footprint is preferred over quality.
- **Ripple:** opencode/agent mirror regen picks it up — batch at session end, not per-edit.

### 2. Document only — Fable 5 non-adoption

Add a one-line note in the `max` effort-tier row: Fable 5 exists above Opus 4.8 but is **not adopted** — not better for coding/agentic per AA, 2× output cost. No model values change.

### 3. Optional / evaluate — Nemotron 3 Ultra (Nvidia column)

Not a blind swap. A/B candidate for the Nvidia sonnet-tier agentic-loop slots (currently `qwen3-coder-480b`) — throughput/cost play (free, ~30% lower agentic cost), not a quality upgrade. Leave as-is unless tested.

### No change

- **Claude** — optimal (Opus 4.8 = AA #1 for coding/agentic/reasoning).
- **Cursor** — current (`composer-2.5`, `gpt-5.5-high`).
- **Nvidia** — current (Kimi K2.6 / DeepSeek V4-Pro well-placed).
- **Carry forward (open, no edit):** Cursor per-subagent dispatch smoke-test from v3.1.0.

---

**Net:** apply the uniform `qwen2.5-coder:7b → qwen3-coder:30b` swap + the Fable-5 doc line; defer mirror regen to end of session.

### Decision — local Ollama pin: `qwen3-coder:30b` (MoE), 2026-06-10

Considered **`qwen3.6:27b`** ([Ollama](https://ollama.com/library/qwen3.6/tags): dense 27B, `27b-q4_K_M` = 17 GB, **77.2% SWE-bench Verified**, released 2026-04-22) as the higher-quality coding alternative. It fits the 32 GB Air on memory and is the stronger coder on benchmarks.

**Rejected for the fanless-Air constraint.** Dense 27B fires all 27B params per token vs the MoE's 3B-active → materially slower decode and more sustained heat on a fanless M5 Air. The local column runs the **same** model across bkit's long-running L-tier loops (`build-plan-execute`, `*-remediate`, `debug-failure-soak`), so responsiveness + thermal headroom outweigh peak coding score here.

**Decision:** prioritize **speed + thermals** →

```
ollama-local/qwen2.5-coder:7b  →  ollama-local/qwen3-coder:30b
```

(`qwen3-coder:30b` = `latest` = `30b-a3b-q4_K_M`, 19 GB Q4, MoE 3B-active, 256K ctx.)

Revisit `qwen3.6:27b` (or its `-mtp-q4_K_M` speculative-decode build, 18 GB) only if a future local box has active cooling, or if measured tok/s on the dense build proves acceptable for the long agentic loops. This finalizes change #1 in the recommendation summary above; the Fable-5 doc note (#2) and Nemotron eval (#3) are unchanged.

Latest prommpts.md table

And also added override #246 ability

| Prompt                              | Claude                      | Cursor                          | Nvidia                                       | Ollama (Local)                 | Effort   | Max Turns | Role                                                                                                                                    |
| ----------------------------------- | --------------------------- | ------------------------------- | -------------------------------------------- | ------------------------------ | -------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `bkit-design-brainstorm-ideate-1`   | `claude-opus-4-8`           | `claude-opus-4-8-thinking-high` | `nvidia/moonshotai/kimi-k2.6`                | `ollama-local/qwen3-coder:30b` | `high`   | 50        | parallel slot 1 (pragmatic lens)                                                                                                        |
| `bkit-design-brainstorm-ideate-2`   | `claude-sonnet-4-6`         | `gpt-5.5-high`                  | `nvidia/qwen/qwen3-coder-480b-a35b-instruct` | `ollama-local/qwen3-coder:30b` | `medium` | 50        | parallel slot 2 (optimal-tradeoff lens; cross-family on Cursor; cross-tier on Claude)                                                   |
| `bkit-design-brainstorm-ideate-3`   | `claude-opus-4-8`           | `claude-opus-4-8-thinking-high` | `nvidia/deepseek-ai/deepseek-v4-pro`         | `ollama-local/qwen3-coder:30b` | `high`   | 50        | parallel slot 3 (risk-premortem lens)                                                                                                   |
| `bkit-design-review-1`              | `claude-opus-4-8`           | `claude-opus-4-8-thinking-high` | `nvidia/moonshotai/kimi-k2.6`                | `ollama-local/qwen3-coder:30b` | `high`   | 50        | design review slot 1 (web search + feasibility analysis)                                                                                |
| `bkit-design-review-2`              | `claude-sonnet-4-6`         | `gpt-5.5-high`                  | `nvidia/qwen/qwen3-coder-480b-a35b-instruct` | `ollama-local/qwen3-coder:30b` | `medium` | 50        | design review slot 2 (cross-family on Cursor; cross-tier on Claude)                                                                     |
| `bkit-design-update`                | `claude-opus-4-8`           | `claude-opus-4-8-thinking-high` | `nvidia/moonshotai/kimi-k2.6`                | `ollama-local/qwen3-coder:30b` | `xhigh`  | 50        | merge review critiques into design (whole-doc rewrite — needs depth)                                                                    |
| `bkit-design-organise`              | `claude-opus-4-8`           | `claude-opus-4-8-thinking-high` | `nvidia/moonshotai/kimi-k2.6`                | `ollama-local/qwen3-coder:30b` | `high`   | 50        | decompose reviewed design into dependency-annotated workstreams; coverage self-verify + DAG cycle detection                             |
| `bkit-design-summary`               | `claude-haiku-4-5-20251001` | `composer-2.5`                  | `nvidia/openai/gpt-oss-20b`                  | `ollama-local/qwen3-coder:30b` | `low`    | 25        | summary writer                                                                                                                          |
| `bkit-design-generate`              | `claude-opus-4-8`           | `claude-opus-4-8-thinking-high` | `nvidia/moonshotai/kimi-k2.6`                | `ollama-local/qwen3-coder:30b` | `xhigh`  | 50        | generate design from brainstorms (top-of-pipeline synthesizer; whole-doc rewrite)                                                       |
| `bkit-plan-complexity-check`        | `claude-sonnet-4-6`         | `composer-2.5`                  | `nvidia/qwen/qwen3-coder-480b-a35b-instruct` | `ollama-local/qwen3-coder:30b` | `medium` | 25        | complexity check                                                                                                                        |
| `bkit-plan-generate`                | `claude-opus-4-8`           | `gpt-5.5-high`                  | `nvidia/moonshotai/kimi-k2.6`                | `ollama-local/qwen3-coder:30b` | `xhigh`  | 50        | plan draft generator (top-of-pipeline synthesizer)                                                                                      |
| `bkit-plan-review-1`                | `claude-opus-4-8`           | `claude-opus-4-8-thinking-high` | `nvidia/moonshotai/kimi-k2.6`                | `ollama-local/qwen3-coder:30b` | `high`   | 50        | review slot 1 (tightness + design-coverage)                                                                                             |
| `bkit-plan-review-2`                | `claude-opus-4-8`           | `claude-opus-4-8-thinking-high` | `nvidia/moonshotai/kimi-k2.6`                | `ollama-local/qwen3-coder:30b` | `medium` | 50        | review slot 2 (dependency-correctness + design-coverage; depth-sensitive lens — both opus)                                              |
| `bkit-plan-review-3`                | `claude-opus-4-8`           | `claude-opus-4-8-thinking-high` | `nvidia/deepseek-ai/deepseek-v4-pro`         | `ollama-local/qwen3-coder:30b` | `high`   | 50        | review slot 3 (regression-risk + design-coverage)                                                                                       |
| `bkit-plan-scope-check-1`           | `claude-opus-4-8`           | `claude-opus-4-8-thinking-high` | `nvidia/moonshotai/kimi-k2.6`                | `ollama-local/qwen3-coder:30b` | `medium` | 25        | scope audit slot 1 (mechanical audit — medium effort)                                                                                   |
| `bkit-plan-scope-check-2`           | `claude-sonnet-4-6`         | `gpt-5.5-high`                  | `nvidia/qwen/qwen3-coder-480b-a35b-instruct` | `ollama-local/qwen3-coder:30b` | `medium` | 25        | scope audit slot 2                                                                                                                      |
| `bkit-plan-complexity-split`        | `claude-opus-4-8`           | `gpt-5.5-high`                  | `nvidia/moonshotai/kimi-k2.6`                | `ollama-local/qwen3-coder:30b` | `high`   | 50        | split large plan                                                                                                                        |
| `bkit-plan-summary`                 | `claude-haiku-4-5-20251001` | `composer-2.5`                  | `nvidia/openai/gpt-oss-20b`                  | `ollama-local/qwen3-coder:30b` | `low`    | 25        | summary writer                                                                                                                          |
| `bkit-plan-update`                  | `claude-opus-4-8`           | `claude-opus-4-8-thinking-high` | `nvidia/moonshotai/kimi-k2.6`                | `ollama-local/qwen3-coder:30b` | `xhigh`  | 50        | merge review + scope critiques into plan (whole-doc rewrite — needs depth)                                                              |
| `bkit-build-install-skills`         | `claude-sonnet-4-6`         | `composer-2.5`                  | `nvidia/qwen/qwen3-coder-480b-a35b-instruct` | `ollama-local/qwen3-coder:30b` | `medium` | 25        | skill identifier                                                                                                                        |
| `bkit-build-challenge-1`            | `claude-opus-4-8`           | `claude-opus-4-8-thinking-high` | `nvidia/moonshotai/kimi-k2.6`                | `ollama-local/qwen3-coder:30b` | `high`   | 50        | parallel slot 1 (bug-hunting lens)                                                                                                      |
| `bkit-build-challenge-2`            | `claude-opus-4-8`           | `claude-opus-4-8-thinking-high` | `nvidia/deepseek-ai/deepseek-v4-pro`         | `ollama-local/qwen3-coder:30b` | `high`   | 50        | parallel slot 2 (security lens; depth-sensitive — both opus)                                                                            |
| `bkit-build-challenge-reconcile`    | `claude-opus-4-8`           | `claude-opus-4-8-thinking-high` | `nvidia/moonshotai/kimi-k2.6`                | `ollama-local/qwen3-coder:30b` | `xhigh`  | 30        | merge parallel challenge findings (whole-doc rewrite)                                                                                   |
| `bkit-build-challenge-tests`        | `claude-sonnet-4-6`         | `composer-2.5`                  | `nvidia/qwen/qwen3-coder-480b-a35b-instruct` | `ollama-local/qwen3-coder:30b` | `medium` | 50        | test generator (source modifier, no test loop)                                                                                          |
| `bkit-build-plan-execute`           | `claude-sonnet-4-6`         | `composer-2.5`                  | `nvidia/qwen/qwen3-coder-480b-a35b-instruct` | `ollama-local/qwen3-coder:30b` | `medium` | 100       | task executor (source modifier with test loop; ceiling — split if exceeded)                                                             |
| `bkit-build-challenge-remediate`    | `claude-sonnet-4-6`         | `composer-2.5`                  | `nvidia/qwen/qwen3-coder-480b-a35b-instruct` | `ollama-local/qwen3-coder:30b` | `medium` | 100       | fix challenge findings (source modifier with test loop)                                                                                 |
| `bkit-build-plan-gaps-remediate`    | `claude-sonnet-4-6`         | `composer-2.5`                  | `nvidia/qwen/qwen3-coder-480b-a35b-instruct` | `ollama-local/qwen3-coder:30b` | `medium` | 100       | fix verification gaps (source modifier with test loop)                                                                                  |
| `bkit-build-summary`                | `claude-haiku-4-5-20251001` | `composer-2.5`                  | `nvidia/openai/gpt-oss-20b`                  | `ollama-local/qwen3-coder:30b` | `low`    | 25        | summary writer                                                                                                                          |
| `bkit-build-plan-verify`            | `claude-opus-4-8`           | `claude-opus-4-8-thinking-high` | `nvidia/moonshotai/kimi-k2.6`                | `ollama-local/qwen3-coder:30b` | `high`   | 50        | verify impl vs plan                                                                                                                     |
| `bkit-debug-abort-handover`         | `claude-sonnet-4-6`         | `composer-2.5`                  | `nvidia/qwen/qwen3-coder-480b-a35b-instruct` | `ollama-local/qwen3-coder:30b` | `medium` | 25        | handover writer                                                                                                                         |
| `bkit-debug-failure-diagnose`       | `claude-opus-4-8`           | `claude-opus-4-8-thinking-high` | `nvidia/deepseek-ai/deepseek-v4-pro`         | `ollama-local/qwen3-coder:30b` | `xhigh`  | 50        | failure diagnosis (Final-strategy attempts especially benefit from depth before human handover)                                         |
| `bkit-debug-failure-remediate`      | `claude-sonnet-4-6`         | `composer-2.5`                  | `nvidia/qwen/qwen3-coder-480b-a35b-instruct` | `ollama-local/qwen3-coder:30b` | `medium` | 100       | implement diagnosis fixes (source modifier with test loop)                                                                              |
| `bkit-debug-failure-soak`           | `claude-opus-4-8`           | `claude-opus-4-8-thinking-high` | `nvidia/deepseek-ai/deepseek-v4-pro`         | `ollama-local/qwen3-coder:30b` | `xhigh`  | 100       | soak fix — one accumulating-context instrument-or-fix step per iteration against the live boundary (orchestrator re-runs tests + loops) |
| `bkit-debug-summary`                | `claude-haiku-4-5-20251001` | `composer-2.5`                  | `nvidia/openai/gpt-oss-20b`                  | `ollama-local/qwen3-coder:30b` | `low`    | 25        | summary writer                                                                                                                          |
| `bkit-ship-summary`                 | `claude-haiku-4-5-20251001` | `composer-2.5`                  | `nvidia/openai/gpt-oss-20b`                  | `ollama-local/qwen3-coder:30b` | `low`    | 25        | summary writer                                                                                                                          |
| `bkit-ship-update-docs`             | `claude-opus-4-8`           | `claude-opus-4-8-thinking-high` | `nvidia/moonshotai/kimi-k2.6`                | `ollama-local/qwen3-coder:30b` | `high`   | 50        | update completed.md (multi-doc writer)                                                                                                  |
| `bkit-ship-conflict-resolve`        | `claude-sonnet-4-6`         | `composer-2.5`                  | `nvidia/qwen/qwen3-coder-480b-a35b-instruct` | `ollama-local/qwen3-coder:30b` | `medium` | 100       | mechanical rebase-conflict resolver (source modifier with test loop)                                                                    |
| `bkit-ship-deferred-sweep`          | `claude-opus-4-8`           | `claude-opus-4-8-thinking-high` | `nvidia/moonshotai/kimi-k2.6`                | `ollama-local/qwen3-coder:30b` | `high`   | 50        | pre-merge completeness gate — intended-vs-actual + declared-deferral resurface                                                          |
| `bkit-utility-audit-codebase`       | `claude-opus-4-8`           | `claude-opus-4-8-thinking-high` | `nvidia/moonshotai/kimi-k2.6`                | `ollama-local/qwen3-coder:30b` | `high`   | 50        | codebase audit                                                                                                                          |
| `bkit-utility-audit-security`       | `claude-opus-4-8`           | `claude-opus-4-8-thinking-high` | `nvidia/moonshotai/kimi-k2.6`                | `ollama-local/qwen3-coder:30b` | `high`   | 50        | security audit                                                                                                                          |
| `bkit-utility-audit-tests`          | `claude-opus-4-8`           | `claude-opus-4-8-thinking-high` | `nvidia/moonshotai/kimi-k2.6`                | `ollama-local/qwen3-coder:30b` | `high`   | 50        | test coverage audit                                                                                                                     |
| `bkit-utility-compress-markdown`    | `claude-sonnet-4-6`         | `composer-2.5`                  | `nvidia/qwen/qwen3-coder-480b-a35b-instruct` | `ollama-local/qwen3-coder:30b` | `medium` | 25        | token-optimize markdown                                                                                                                 |
| `bkit-utility-audit-logs`           | `claude-sonnet-4-6`         | `composer-2.5`                  | `nvidia/qwen/qwen3-coder-480b-a35b-instruct` | `ollama-local/qwen3-coder:30b` | `medium` | 25        | scan production logs                                                                                                                    |
| `bkit-utility-update-documentation` | `claude-sonnet-4-6`         | `composer-2.5`                  | `nvidia/qwen/qwen3-coder-480b-a35b-instruct` | `ollama-local/qwen3-coder:30b` | `medium` | 50        | doc sync (multi-doc writer)                                                                                                             |
| `bkit-utility-update-references`    | `claude-sonnet-4-6`         | `composer-2.5`                  | `nvidia/qwen/qwen3-coder-480b-a35b-instruct` | `ollama-local/qwen3-coder:30b` | `medium` | 50        | fix broken refs                                                                                                                         |
| `bkit-utility-audit-logs-ship`      | `claude-sonnet-4-6`         | `composer-2.5`                  | `nvidia/qwen/qwen3-coder-480b-a35b-instruct` | `ollama-local/qwen3-coder:30b` | `medium` | 25        | post-deploy verify                                                                                                                      |

## Applied + pushed to `dev` (2026-06-10)

Live-verified every model ID against the provider APIs, then applied the changes. Two commits, pushed to `dev`:

- **`3151e39`** — `fix(prompts): live-verify model IDs across providers; ollama-local → qwen3-coder:30b`
- **`845d923`** — `refactor(install): make 3 best-effort catches non-empty (slop gate)` (unblocked the push; the empty-catch slop came from #251's `c0a83d1`, not the model work — 3 comment-only catches given an explicit statement, no behavior change)

### Live API verification (the actual pulls)

| Provider       | Source                                 | Result                                                                                                                                                                                                           |
| -------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cursor**     | `GET /v0/models`                       | `claude-opus-4-8-thinking-high`, `gpt-5.5-high`, `composer-2.5` present. **No Sonnet exists** → phantom `claude-4.6-sonnet-thinking` removed. **Fable 5 now offered** (`claude-fable-5-thinking-high`/`-xhigh`). |
| **NVIDIA NIM** | `GET /v1/models`                       | All four column IDs present: `moonshotai/kimi-k2.6`, `qwen/qwen3-coder-480b-a35b-instruct`, `deepseek-ai/deepseek-v4-pro`, `openai/gpt-oss-20b`.                                                                 |
| **OpenRouter** | `GET /api/v1/models` (public)          | Mirrors all the above incl. `anthropic/claude-opus-4.8`, `nvidia/nemotron-3-ultra-550b-a55b`. Used to cross-check Claude (no `ANTHROPIC_API_KEY` in shell).                                                      |
| **Claude**     | Anthropic overview + OpenRouter mirror | `claude-opus-4-8` / `claude-sonnet-4-6` / `claude-haiku-4-5` current.                                                                                                                                            |
| **Ollama**     | local install                          | `qwen3-coder:30b` pulled + installed.                                                                                                                                                                            |

### Changes made

1. **`ollama-local` → `qwen3-coder:30b`** across all agents (per-agent + orchestrator tables) + the post-install advisory, test fixtures/assertions, `docs/testing.md`, and the `providers.md` example.
2. **Phantom Cursor ID fixed:** `claude-4.6-sonnet-thinking` → `composer-2.5` for `/build` + `/ship` orchestrators (Cursor offers no Sonnet).
3. **Orchestrator Claude column** → proper IDs (`claude-opus-4-8` / `claude-sonnet-4-6`).
4. **Fable 5 — documented non-adoption** in `prompts.md` § Effort→model mapping + `providers.md` Cursor catalog (available on Cursor/OpenRouter, but not ahead of Opus 4.8 on coding/agentic per AA, 2× cost).
5. **Pull recipes** for Claude + Cursor added to `providers.md` § Per-provider live model lookup (OpenRouter/NVIDIA/Gemini already there).
6. **Dated live-verification block** added to `prompts.md` § Models.

### Still open (your call — not a validity bug)

**`/plan` orchestrator Cursor model is inconsistent across the two tables:** `prompts.md` § Orchestrators says `claude-opus-4-8-thinking-high`; `providers.md` § Per-workflow says `gpt-5.5-high`. Both are valid live IDs — pick one to reconcile.

Verification: 1399 tests pass, prettier clean, `check:dist` clean, slop gate green.

### Follow-up — drift root-caused + consolidated (`1d42156`)

The `/plan` Cursor inconsistency I flagged above wasn't a one-off — `providers.md` carried a **parallel model-selection surface** that had drifted from `prompts.md` § Models (the SSOT it declares itself to be): the per-workflow orchestrator table disagreed on `/design`, `/plan`, `/build` Claude models, and the Cursor catalog was where the phantom `claude-4.6-sonnet-thinking` lived.

Consolidated so selection has one home:

- **Removed** the duplicate per-workflow orchestrator table from `providers.md` → pointer to `prompts.md` § Orchestrators (resolves the `/plan` drift — no longer two sources).
- **Trimmed** the Cursor catalog from a hardcoded ID list → tier guidance + the live `/v0/models` pull recipe (the static list is what drifted).
- **Moved** orchestrator reasoning-depth + inlining-drift guidance into `prompts.md` § Orchestrators.

`prompts.md` now owns model **selection**; `providers.md` carries only provider **mechanics** (pull recipes, frontmatter transforms, Ollama server config). The `/plan` open item is closed.

## Model allocation per provider — full inventory (#245 Phase 2 complete)

Cross-ref: **#245** (multi-provider opencode host) · **#244** (NVIDIA-via-OpenAI lane that seeded the cloud-provider tier model). This issue owns _which model each agent runs on each host/provider_; the canonical, install-driving source is **`.bkit/prompts.md` § Models** (per-agent table + Orchestrators table). This comment is the human-readable snapshot.

### Tier model — one identity per tier, reused across providers where the catalog carries it

Agents map to a tier by their **Nvidia** cell. Tiers: **opus** (top coder) · **sonnet** (mid coder) · **haiku** (small/fast) · **convergent** (CoT reasoner — swapped in for the risk/diagnosis lens: `bkit-design-brainstorm-ideate-3`, `bkit-plan-review-3`, `bkit-build-challenge-2`, `bkit-debug-failure-diagnose`, `bkit-debug-failure-soak`).

| Provider               | opus                                                           | sonnet                                | haiku                       | convergent                         |
| ---------------------- | -------------------------------------------------------------- | ------------------------------------- | --------------------------- | ---------------------------------- |
| **Claude** (canonical) | `claude-opus-4-8`                                              | `claude-sonnet-4-6`                   | `claude-haiku-4-5-20251001` | `claude-opus-4-8` (effort = xhigh) |
| **Cursor**             | `claude-opus-4-8-thinking-high`                                | `gpt-5.5-high`                        | `composer-2.5`              | `claude-opus-4-8-thinking-high`    |
| **nvidia**             | `moonshotai/kimi-k2.6`                                         | `qwen/qwen3-coder-480b-a35b-instruct` | `openai/gpt-oss-20b`        | `deepseek-ai/deepseek-v4-pro`      |
| **openrouter**         | `moonshotai/kimi-k2.6`                                         | `qwen/qwen3-coder`                    | `openai/gpt-oss-20b`        | `deepseek/deepseek-v3.2`           |
| **ollama** (cloud)     | `kimi-k2.6` 🔒                                                 | `qwen3-coder:480b`                    | `gpt-oss:20b`               | `deepseek-v4-pro` 🔒               |
| **groq**               | `openai/gpt-oss-120b`                                          | `qwen/qwen3-32b`                      | `openai/gpt-oss-20b`        | `openai/gpt-oss-120b`              |
| **cerebras**           | `zai-glm-4.7`                                                  | `gpt-oss-120b`                        | `gpt-oss-120b`              | `zai-glm-4.7`                      |
| **ollama-local**       | `qwen3-coder:30b` (uniform — all tiers; effort differentiates) |                                       |                             |                                    |

🔒 = real catalog entry, needs a paid Ollama subscription (free key returns `requires a subscription`); the sonnet/haiku pins validated on the free tier.

### Cross-platform consistency (the explicit goal)

Same model identity for the same prompt **wherever the provider's catalog lists it**:

- **Kimi-K2.6** (opus): nvidia · openrouter · ollama-cloud ✅
- **Qwen3-Coder-480B-A35B** (sonnet): nvidia · openrouter (`qwen/qwen3-coder`) · ollama-cloud (`qwen3-coder:480b`) ✅
- **gpt-oss-20b** (haiku): nvidia · openrouter · ollama-cloud · groq ✅
- **DeepSeek reasoner** (convergent): nvidia + ollama-cloud `deepseek-v4-pro`; openrouter `deepseek-v3.2` (no v4 on OpenRouter)

Two providers can't match — their catalogs simply don't carry those models:

- **groq** — no Kimi / Qwen3-Coder-480B → opus+convergent collapse onto `gpt-oss-120b`.
- **cerebras** — only `zai-glm-4.7` + `gpt-oss-120b` exist → opus+convergent `glm-4.7`, sonnet+haiku `gpt-oss-120b`.

### Validation (2026-06-11)

Every cell was live-probed against the provider's `/v1/models` **and** tool-call-smoked — a real `tools:` chat/completions round-trip confirming `tool_calls` emission (`/models` existence is not proof a model tool-calls in the agent loop). Both live installs (`--opencode=openrouter`, `--opencode=ollama`) seed all 46 agents with real IDs, zero `set-model-id` placeholders. Lookup recipe + per-provider rationale documented in `.bkit/providers.md` § Models.

Shipped via `prompts.md` columns + `OPENCODE_PROVIDER_COLUMN` wiring (`bkit-install.ts`) — supersedes the Phase-1 placeholder state (`82036ad`).

Kimi K2.7 Code, Moonshot AI's coding-focused agentic model, is now available to run on Ollama's cloud.

It's hosted in the US on the latest NVIDIA B300 datacenter GPUs, and your data stays private and is never trained on.

K2.7 Code improves end-to-end task completion on real-world, long-horizon coding tasks while using approximately 30% fewer thinking tokens. It supports a 256K token context window with vision input.

## Medium-tier Claude pin → Claude Sonnet 5

**Claude Sonnet 5 shipped 2026-06-30 (GA).** Exact Anthropic model ID: `claude-sonnet-5` (dateless pinned snapshot; alias == ID). Verified live against the Anthropic models overview and OpenRouter (`anthropic/claude-sonnet-5`, canonical `claude-sonnet-5-20260630`) — the claude-api skill catalog (cached 2026-06-04) predates the launch, so it was checked against live sources. Sonnet 4.6 is now Legacy. Introductory pricing $2 / $10 per MTok through 2026-08-31, then $3 / $15 — same as 4.6, so a like-for-like `medium`-tier swap.

### Changed (`claude-sonnet-4-6` → `claude-sonnet-5`)

- `.bkit/prompts.md`: effort→model mapping table, § Models Claude column (17 subagent rows), `/build` + `/ship` orchestrator rows, and the Live model-ID verification note (with Sonnet 5 provenance).
- `.bkit/prompts/*.md`: 17 subagent `model:` frontmatter pins.
- `.claude/` mirrors regenerated via `bkit install --claude --cursor --opencode=opencode` (per-file diff = model line only; `.cursor`/`.opencode` produced no diff, as expected — those columns carry no Sonnet).
- Repo-local, hand-authored dev agents (not installer-managed): `utility-new-release`, `utility-harvest-friction`. `utility-pre-release-check` stays on `claude-opus-4-8`.

### Deliberately NOT changed

- **Cursor column** — kept `composer-2.5` / `gpt-5.5-high` (intentional cross-family diversity; no Sonnet was offered on `/v0/models` at last probe). If Sonnet 5 adoption on Cursor is wanted, re-probe `/v0/models` for a `claude-sonnet-5-thinking-*` id first — do not naive-bump.
- **opencode provider columns** — non-Anthropic tier models (Qwen, etc.); unaffected.
- Historical `docs/plans/**` references and `.bkit/src/*.test.ts` synthetic fixtures (arbitrary model strings, not real pins).

Not committed. Note: `bkit check` currently reports unrelated CI/renovate drift from separate in-progress work in the tree — not from this change.

## OpenCode column review — vs live `/zen/v1/models` + Go usage-limits (2026-07-12)

Scoped review of the **OpenCode** provider column in `.bkit/prompts.md` § Models against the [OpenCode Go usage-limits page](https://opencode.ai/docs/go/#usage-limits) and the live gateway catalog. Per repo doctrine, pins are validated against the **live `https://opencode.ai/zen/v1/models` endpoint**, not the docs page (docs run ahead — see below). No code changed; recommendation only.

### Current OpenCode pins vs live catalog

| Tier           | Current pin                  | Top live open-weight id (2026-07-12)        | Verdict        |
| -------------- | ---------------------------- | ------------------------------------------- | -------------- |
| **opus**       | `opencode/kimi-k2.6`         | **`kimi-k2.7-code`**                        | ⬆️ **upgrade** |
| **sonnet**     | `opencode/qwen3.6-plus`      | `qwen3.6-plus` (no `qwen3.7-plus` live yet) | ✅ keep        |
| **haiku**      | `opencode/deepseek-v4-flash` | `deepseek-v4-flash`                         | ✅ keep        |
| **convergent** | `opencode/deepseek-v4-pro`   | `deepseek-v4-pro`                           | ✅ keep        |

Live open-weight ids returned by `/zen/v1/models` today: `kimi-k2.7-code, kimi-k2.6, kimi-k2.5, qwen3.6-plus, qwen3.5-plus, deepseek-v4-pro, deepseek-v4-flash, deepseek-v4-flash-free, glm-5.2/5.1/5, minimax-m3/m2.7/m2.5, mimo-v2.5-free`.

### The one change — opus tier: `kimi-k2.6` → `kimi-k2.7-code`

- **Live-verified** on the gateway catalog today; **open-weight**, so the whole column still resolves on the budget **OpenCode Go** plan (the Go-resolvability invariant that drove the `deepseek-v4-flash` haiku pin is preserved).
- Moonshot's coding-agentic successor already noted in [comment #13](https://github.com/cbartens/bkit/issues/205#issuecomment): improves long-horizon end-to-end coding while using **~30% fewer thinking tokens**, 256K ctx — directly the opus/top-coder tier's job.
- Note: only the **code-specialized** `k2.7-code` is live (no bare `kimi-k2.7`). Fine for an agentic-coding toolkit; the opus tier is code+reasoning, so if a general K2.7 later appears, re-evaluate.

Proposed pin: `opencode/kimi-k2.7-code`.

### Deliberately NOT changed

- **sonnet — `qwen3.6-plus` stays.** The Go usage-limits page lists **"Qwen3.7 Plus" / "Qwen3.7 Max"**, but the live `/zen/v1/models` endpoint carries only `qwen3.6-plus` / `qwen3.5-plus`. This is the **same docs-ahead-of-endpoint trap** recorded at #245 Phase 3 (docs had `qwen3.7-plus`; endpoint had `qwen3.6-plus`). Re-probe the live endpoint before adopting — do not pin from the docs roster (would 404). **Watch item.**
- **haiku / convergent** — `deepseek-v4-flash` / `deepseek-v4-pro` are still the top DeepSeek flash/reasoner on the catalog and on the Go roster.

### Cross-provider ripple (opus tier is a shared identity)

The opus tier pins one identity across `nvidia`/`openrouter`/`ollama`(cloud)/`opencode` (all `kimi-k2.6` today). A clean bump keeps them aligned:

- **ollama (cloud)** — K2.7 Code already confirmed available ([comment #13](https://github.com/cbartens/bkit/issues/205)).
- **nvidia / openrouter** — need a live `/v1/models` probe for a `kimi-k2.7-code` equivalent before a coordinated bump. **Don't naive-bump** — probe first (same rule as Cursor/Ollama-tag corrections upthread). If they don't carry it yet, opencode can move alone (per-cell overrides are allowed) and the others follow when live.

### Usage-limits context (why this is budget-safe)

Go is dollar-metered — per the usage-limits page: **$12 / 5h, $30 / week, $60 / month** (plan $5 first month, then $10/mo), with per-model request capacity varying by cost (e.g. DeepSeek V4 Flash ~31,650 req/5h vs GLM-5.2 ~880 req/5h). Keeping haiku on `deepseek-v4-flash` (cheap, high-capacity) for the frequent summary agents is the right budget posture, and K2.7 Code's ~30%-fewer-thinking-tokens claim makes the opus bump budget-neutral-to-favorable on Go.

### Net

**One live-verified change:** opencode opus `kimi-k2.6` → `kimi-k2.7-code`. Everything else current. sonnet `qwen3.7-plus` is a docs-ahead watch item, not an action. Cross-provider opus alignment (nvidia/openrouter) needs a `/v1/models` probe first.

Not applied — flagging for go-ahead before editing `prompts.md` + regenerating the opencode mirrors.

## Aggressive-latest refresh — 2026-07-20

Re-probed every provider catalog live and refreshed `.bkit/prompts.md` § Models to the newest catalog entry per tier. Two structural changes beyond simple bumps.

### 1. OpenCode split into two providers: `opencode-zen` + `opencode-go`

The old single `opencode` provider (built-in, curated against `https://opencode.ai/zen/v1/models`) is now **two distinct providers**, because Zen and Go are separate models.dev providers with different catalogs and endpoints:

|            | `opencode-zen` (`https://opencode.ai/zen/v1`) | `opencode-go` (`https://opencode.ai/zen/**go**/v1`)   |
| ---------- | --------------------------------------------- | ----------------------------------------------------- |
| opus       | `kimi-k2.7-code`                              | **`kimi-k3`** ("Kimi K3 (2x usage)", absent from Zen) |
| sonnet     | `qwen3.6-plus`                                | **`qwen3.7-plus`**                                    |
| haiku      | `deepseek-v4-flash`                           | `deepseek-v4-flash`                                   |
| convergent | `deepseek-v4-pro`                             | `deepseek-v4-pro`                                     |

Both are now standard `@ai-sdk/openai-compatible` npm-driver providers with explicit baseURLs (one `OPENCODE_API_KEY` covers both) — this removed the old built-in-provider special case. Legacy `--opencode=opencode`/`=zen` alias-normalise to `opencode-zen`; `=go` to `opencode-go`. All four `opencode-go` cells were **tool-call-smoked** against the Go endpoint (`kimi-k3`, `qwen3.7-plus`, `deepseek-v4-pro`, `deepseek-v4-flash` all emitted `tool_calls`).

### 2. Gotcha: `/zen/v1/models` cannot see OpenCode Go models — use models.dev

Curating against `curl https://opencode.ai/zen/v1/models` reported Kimi K3 as "not on Go" while the opencode app clearly listed it. Root cause: that REST endpoint returns **only** the Zen catalog (even with auth); Go-only premium models (`kimi-k3`, `qwen3.7-plus`/`qwen3.7-max`) never appear there. **models.dev is the source of truth** (providers `opencode` = Zen, `opencode-go` = Go). The probe recipe in `providers.md` § Models is corrected, and the incident is logged in `docs/knowledge.jsonl`.

### Per-provider model deltas

| Provider                             | Change                                                                                                                                         |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **NVIDIA**                           | sonnet `qwen/qwen3-coder-480b-a35b-instruct` (**removed from catalog**) → `qwen/qwen3.5-397b-a17b`; opus stays `kimi-k2.6` (NIM's newest Kimi) |
| **Groq**                             | sonnet `qwen/qwen3-32b` (**removed**) → `qwen/qwen3.6-27b`                                                                                     |
| **Ollama (Cloud)**                   | opus `kimi-k2.6` → `kimi-k2.7-code`; sonnet `qwen3-coder:480b` (**removed**) → `qwen3.5:397b`                                                  |
| **OpenRouter**                       | opus `kimi-k2.6` → **`kimi-k3`**; convergent `deepseek-v3.2` → `deepseek-v4-pro` (both newly listed)                                           |
| **Cursor**                           | cross-family `gpt-5.5-high` → `gpt-5.6-sol-high` (5 agents)                                                                                    |
| **Cerebras / Claude / Ollama-Local** | unchanged (already latest)                                                                                                                     |

Three of these (NVIDIA/Groq/Ollama-Cloud sonnet) were **dead pins** — the pinned id had been dropped from the live catalog and would 404 on install.

### Verification

`typecheck` · `build` · **full test suite 2278 passed / 0 failed** · `lint` · `slop:delta` net 0 · `prettier` · `bkit check` exit 0 (0 drift). All host mirrors regenerated; docs (`prompts.md`, `providers.md`, `.env.example`, `README.md`) synced in the same change.

Tracker stays open for the next refresh.

Best value for money Claude + Kimi memberships https://github.com/cbartens/bkit/issues/364#issuecomment-5019495271

https://opencode.ai/go

We should not select Kimi K3 or Grok 4.5 as they churn through too many tokens and exhaust the Go 5h window too soon (1h into 5h window tokens exhausted) - we need a different model mix for Opencode Go - check AI intelligence on https://artificialanalysis.ai/leaderboards/models vs below and find best mix. Suggest Kimi K2.7 Code, Deepseek, Qwen

<img width="977" height="443" alt="Image" src="https://github.com/user-attachments/assets/0fc3d203-ca3e-4173-a841-4cba5758ed05" />

### OpenCode Go model mix — applied

Go opus burned the 5h window (~1h in) on high-cost pins (`kimi-k3`, and same class as `grok-4.5`). Re-pinned Go for intelligence-per-quota, not Kimi-family consistency.

**Pins now (`.bkit/prompts.md` § Models → OpenCode Go):**

| Tier       | Model                           | AA Index (approx) | Notes                                                     |
| ---------- | ------------------------------- | ----------------- | --------------------------------------------------------- |
| opus       | `opencode-go/minimax-m3`        | ~44               | Replaces `kimi-k3` (~57 but ~12× list $/token vs MiniMax) |
| sonnet     | `opencode-go/qwen3.7-plus`      | ~39               | Unchanged                                                 |
| convergent | `opencode-go/deepseek-v4-pro`   | ~44 (max)         | Unchanged                                                 |
| haiku      | `opencode-go/deepseek-v4-flash` | ~40 (max)         | Unchanged                                                 |

**Avoid as Go defaults:** `kimi-k3`, `grok-4.5`, `qwen3.7-max` — too expensive for the 5h window.

**Sources:** [opencode.ai/go](https://opencode.ai/go), [models.dev `opencode-go`](https://models.dev), [Artificial Analysis leaderboard](https://artificialanalysis.ai/leaderboards/models).

**Also updated:** `providers.md` tier row, install test, `.opencode` opus agents, `.env.example`. Prefer pins that stay within the Go 5h usage window.

Committed as e2086ee5 — fix(205): pin OpenCode Go opus to minimax-m3 for 5h window

### Cursor cross-family → Grok 4.5 — applied

Pinned Cursor cross-family slots from `gpt-5.6-sol-high` → **`cursor-grok-4.5-high`**.

**Why (Cursor only — not OpenCode Go):**

- Live `/v0/models` confirms `cursor-grok-4.5-high` / `-high-fast` (2026-07-21).
- First-party pool (with Auto + Composer 2.5) — does **not** burn the API pool.
- AA Coding Agent Index ~parity with GPT-5.5 at lower per-task cost; Intelligence Index ~#4 (54).
- Distinct from the Go “avoid Grok” decision (5h window token burn) — opposite incentive on Cursor.

**Pins now (`.bkit/prompts.md` § Models → Cursor):**

| Role               | Model                                               |
| ------------------ | --------------------------------------------------- |
| Depth (high/xhigh) | `claude-opus-4-8-thinking-high` — unchanged         |
| Cross-family       | **`cursor-grok-4.5-high`** — was `gpt-5.6-sol-high` |
| Cheap / volume     | `composer-2.5` — unchanged                          |

**Agents re-pinned (5):** `bkit-design-brainstorm-ideate-2`, `bkit-design-review-2`, `bkit-plan-generate`, `bkit-plan-scope-check-2`, `bkit-plan-complexity-split`.

**Also updated:** `.bkit/providers.md` § Cursor model catalog (Claude / Grok / Composer), `.bkit/comparison.md` lens note, `.cursor/agents/*` frontmatter for the five agents.

**Deliberately not changed:** Opus depth slots; Composer executors/summarizers; OpenCode Go (still avoids Grok for quota). GPT-5.x remains available on the API pool as a hedge — not pinned.

**Open:** IDE `Task` smoke-test of `cursor-grok-4.5-high` per-subagent dispatch (same residual caveat as v3.1.0 Cursor ID validation).

**Commit (local, not pushed):** `b92165c1` — `fix(205): pin Cursor cross-family slots to cursor-grok-4.5-high`

**Sources:** [Cursor models & pricing](https://cursor.com/docs/models-and-pricing) · live `curl https://api.cursor.com/v0/models` · [AA Grok 4.5](https://artificialanalysis.ai/articles/grok-4-5-brings-spacexai-to-the-the-intelligence-frontier)

Model selection — Z.AI and Moonshot columns for prompts.md § Models https://github.com/cbartens/bkit/issues/376#issuecomment-5042970178

## Local ollama refresh — MacBook Air M5 32GB (fanless)

Scored against the [AA Intelligence Index v4.1](https://artificialanalysis.ai/leaderboards/models) (9 evals: GDPval-AA v2, τ³-Banking, Terminal-Bench v2.1, SciCode, HLE, GPQA Diamond, CritPt, AA-Omniscience, AA-LCR; scale tops ~60, Fable 5 = 59.9). Current `ollama-local` pin = `qwen3-coder:30b`, uniform across all agents (`.bkit/prompts.md` § Models).

### Commands

**Pull** (tags verified against the live ollama registry — avoided the `-a3b`-style 404):

```bash
ollama pull gemma4:12b      # 7.6 GB — dense 12B, AA Intelligence Index 22
ollama pull qwen3.5:9b      # 6.6 GB — dense 9B (reasoning), AA Intelligence Index 21
```

**Remove** (superseded by qwen3.5:9b):

```bash
ollama rm qwen3:8b          # frees 5.2 GB, pulled ~6 weeks ago
```

Currently installed before this change: `qwen3-coder:30b` (18 GB) + `qwen3:8b` (5.2 GB), ollama 0.32.1.

### Options considered — AA index variables

| Model (ollama tag)              | Intel. Index | Output tok/s* | TTFT* | Price* $/1M | Context | Params / Arch    | Local fit (32GB)                     |
| ------------------------------- | ------------ | ------------- | ----- | ----------- | ------- | ---------------- | ------------------------------------ |
| `qwen3-coder:30b` (current pin) | 14           | 88.5          | 2.57s | 0.45->2.25  | 262k    | 30.5B / 3.3B MoE | Yes — 18GB, cool                     |
| `gpt-oss:20b`                   | ~14 (est)    | 226           | 0.88s | 0.08        | 131k    | 21B / 3.6B MoE   | Yes — ~12GB, coolest, +reasoning     |
| `gemma4:12b`                    | 22           | 105           | —     | 0.10        | 256k    | 12B / dense      | Yes — 7.6GB, dense=warmer            |
| `qwen3.5:9b` (reasoning)        | 21           | 51            | —     | 0.10        | 256k    | 9B / dense       | Yes — 6.6GB                          |
| `qwen3:8b` (removing)           | not scored   | —             | —     | free        | 40k     | 8B / dense       | Yes — 5.2GB                          |
| Qwen3.6 27B (reasoning)         | 37           | 54            | —     | 0.90        | 262k    | 27B / dense      | Caution — dense -> throttles fanless |
| Gemma 4 31B (reasoning)         | 29           | 35            | —     | —           | 256k    | 31B / dense      | Caution — heavy + slow               |
| Qwen3-Coder-Next 80B            | —            | —             | —     | —           | —       | 80B              | No — ~46GB, won't fit                |

<sub>*Output speed / TTFT / price are measured on AA's cloud API hosts, not local hardware. AA scores `qwen3.5:9b` / `gemma4:12b`, not the older `qwen3:8b`.</sub>

### Caveats (the table is not a coding ranking)

1. **Intelligence Index is reasoning/knowledge-heavy.** `qwen3-coder:30b` scores 14 because it is _non-reasoning_ + coding-specialised — it doesn't emit the reasoning tokens the index rewards, not because it codes badly. Treat the index as a capability proxy, not a coding leaderboard.
2. **Speed / TTFT / price are cloud-host artifacts.** Locally price = $0 and speed is bounded by the M5's memory bandwidth. The variables that transfer to a local pin are Intelligence Index, **architecture (MoE runs far cooler/faster than dense on a fanless Air — decisive)**, params (fit), and context.

### Net

- **Coding pin stays `qwen3-coder:30b`** — MoE (3.3B active) = fast + cool on the fanless Air; its low index is the non-reasoning artifact.
- **`gpt-oss:20b` is the alternative worth a smoke-test** — near-same index, lighter (~12GB), MoE, adds reasoning; good candidate for reasoning-lens agents if the uniform pin is ever split.
- **`gemma4:12b` + `qwen3.5:9b` pulled** as lighter general/reasoning candidates; **`qwen3:8b` removed** (superseded). Dense 27-31B models score higher on the index but throttle on a fanless chassis — wrong tool despite the number.

No pin change committed to `.bkit/` — the shipped `ollama-local` column is uniform-by-design (`OLLAMA_MAX_LOADED_MODELS=1`, single loaded model = memory-safe), and volatile benchmark numbers stay out of the shipped surface.

**Claude side reviewed — Opus 5 adopted.** Anthropic released Claude Opus 5 (`claude-opus-5`) 2026-07-24, same price as Opus 4.8 ($5/$25 per MTok). AA leaderboard now ranks it #1 overall (max effort, score 61), ahead of Fable 5 (60) — Fable 5 stays deliberately not-adopted, now on stronger grounds (beaten on AA at half the cost). Cursor's live `/v0/models` confirms `claude-opus-5-thinking-high`.

Bumped every `high`/`xhigh`/`max`-tier Claude pin repo-wide (Sonnet 5 / Haiku 4.5 untouched — already current): `prompts.md` (effort table, per-agent table, orchestrator table), `providers.md` Cursor catalog, `README.md` example, the 24 Opus-tier `.bkit/prompts/*.md` frontmatter files, and the hand-authored `utility-pre-release-check` agent. Mirrors regenerated (`bkit install --claude --cursor`), `bkit check` drift gate green, full test suite (2469 tests) + `slop:delta` clean. Committed to `dev` (`9cee30dd`), not pushed yet.

Remaining on this tracker per prior scope: Cursor/Ollama were already reviewed in earlier passes (see commit history); this closes out the Claude leg for the current cycle.

### Cursor defaults → first-party only (native pool) — applied

**Policy:** shipped Cursor pins are **first-party pool only** so workflows keep running when API credits are exhausted. API-pool models (Claude / GPT / Fable) are **opt-in** via `prompts.md` § Model Overrides — never default pins.

**Pins now (`.bkit/prompts.md` § Models → Cursor):**

| Role                                              | Model                  | Pool                         |
| ------------------------------------------------- | ---------------------- | ---------------------------- |
| Depth / synthesizers / `/design` `/plan` `/debug` | `cursor-grok-4.5-high` | first-party                  |
| Volume / executors / `/build` `/ship`             | `composer-2.5`         | first-party                  |
| Claude Opus / GPT / Fable                         | —                      | API pool — **override only** |

**What changed:**

- All former `claude-opus-5-thinking-high` Cursor cells (23 agents + 3 orchestrators) → `cursor-grok-4.5-high`
- Parallel medium slots that need native diversity vs Grok siblings (`ideate-2`, `design-review-2`, `scope-check-2`) → `composer-2.5`
- Unique Cursor defaults now: **`cursor-grok-4.5-high` + `composer-2.5` only**
- Docs: `providers.md` catalog (default vs override-only), Model Overrides CAUTION with API-pool example, README model labels, CHANGELOG Unreleased
- `.cursor/agents/*` mirrors regenerated; `bkit check` exit 0

**How to re-enable API-pool models** (when credits remain) — add rows below `<!-- bkit:end -->`:

```
| Prompt | Provider | Model |
| --- | --- | --- |
| bkit-design-generate | cursor | claude-opus-5-thinking-high |
```

**Commits (local, not pushed):**

- `c4c6ac59` — `fix(205): default Cursor pins to native Grok/Composer only`
- `01b4da09` — `docs(205): drop unrelated #385 changelog line from prior commit`

**Sources:** [Cursor models & pricing](https://cursor.com/docs/models-and-pricing) · prior #205 Grok first-party note · `prompts.md` § Model Overrides

### Cursor API-credit restore — Model Overrides recipe documented

`prompts.md` § Model Overrides now has a special Cursor NOTE:

- Defaults stay first-party (`cursor-grok-4.5-high` / `composer-2.5`)
- **If** you have third-party / additional API credits → paste the ready-to-use Opus block into the override table (Claude-opus-tier agents → `claude-opus-5-thinking-high`)
- Cursor has **no Sonnet** — sonnet/haiku agents stay on shipped Composer/Grok; optional API cross-family `gpt-5.6-sol-high` for diversity slots
- Orchestrators `/design` `/plan` `/debug` = **session model** (set at launch), not the override table
- Re-run `bkit install --cursor` after editing

Also cross-linked from `providers.md` § Cursor model catalog + consumer overrides.

**Commit:** `86f5248a` — `docs(205): Cursor API-credit Model Overrides paste recipe`

## Z.AI (GLM) column bump — GLM-5.2 (2026-07-27)

`--opencode=zai` was still pinning the 4.x line (`glm-4.7` / `glm-4.6` / `glm-4.5-air`) even though the Coding Plan API already serves GLM-5.2 ([Migrate to GLM-5.2](https://docs.z.ai/guides/overview/migrate-to-glm-new), [How to Switch Models](https://docs.z.ai/devpack/latest-model)).

### Live probe (`GET https://api.z.ai/api/coding/paas/v4/models`)

```
glm-5.2
glm-5.1
glm-5-turbo
glm-5
glm-4.7
glm-4.6
glm-4.5
glm-4.5-air
```

**No `glm-5.2-max` model ID.** "Max" on Z.AI is the Coding Plan tier and/or `reasoning_effort: max` (bkit maps Claude `effort: xhigh|max` → opencode `reasoningEffort: high|max`). Claude Code's `glm-5.2[1m]` 1M-context suffix is not listed on the coding-paas `/models` catalog — bkit pins bare `glm-5.2`.

### New Z.AI pins (`prompts.md` § Models)

| Tier              | Was               | Now                                                                   |
| ----------------- | ----------------- | --------------------------------------------------------------------- |
| opus + convergent | `zai/glm-4.7`     | `zai/glm-5.2`                                                         |
| sonnet            | `zai/glm-4.6`     | `zai/glm-5.1`                                                         |
| haiku             | `zai/glm-4.5-air` | `zai/glm-4.5-air` (unchanged; matches Z.AI Claude Code haiku default) |

All three tool-call smoked (`tools:` → `tool_calls`). Also synced: `.bkit/providers.md` tier table + curated-column note; install test; re-ran `pnpm bkit install --opencode=zai` so `.opencode/agents/*` are on the new IDs.

### Sources

- https://docs.z.ai/guides/overview/migrate-to-glm-new
- https://docs.z.ai/devpack/latest-model
- https://docs.z.ai/guides/llm/glm-5.2

## Z.AI reasoning effort — use `max` for xhigh (2026-07-27 follow-up)

AA shows **GLM-5.2 (max) Index 51** vs **GLM-5.2 Index 34** — same model ID, different `reasoning_effort`. There is no separate `glm-5.2-max` model.

### Problem

Default opencode effort map was `xhigh → high`, so top-of-pipeline Z.AI agents never hit Max.

### Fix

Provider-specific map when `model:` starts with `zai/` (matches [Z.AI Claude Code switch](https://docs.z.ai/devpack/latest-model) + [concept-param](https://docs.z.ai/guides/overview/concept-param)):

| Claude `effort:` | Default opencode | **Z.AI**   |
| ---------------- | ---------------- | ---------- |
| `low`            | `none`           | `none`     |
| `medium`         | `low`            | **`high`** |
| `high`           | `medium`         | **`high`** |
| `xhigh`          | `high`           | **`max`**  |
| `max`            | `max`            | **`max`**  |

After `pnpm bkit install --opencode=zai`: **7× `max`** (all `effort: xhigh` agents — generate/update/reconcile/diagnose/soak), **34× `high`**, **5× `none`** (summaries).

## Effort → provider thinking table in `prompts.md` (2026-07-27)

Effort ladders are no longer hardcoded in TS. Canonical table in `.bkit/prompts.md`:

| Default  | Claude   | Cursor   | OpenCode Go/Zen | NVIDIA   | Z.AI   | Moonshot |
| -------- | -------- | -------- | --------------- | -------- | ------ | -------- |
| `low`    | `low`    | `low`    | `none`          | `none`   | `none` | `none`   |
| `medium` | `medium` | `medium` | `low`           | `low`    | `high` | `low`    |
| `high`   | `high`   | `high`   | `medium`        | `medium` | `high` | `medium` |
| `xhigh`  | `xhigh`  | `xhigh`  | `high`          | `high`   | `max`  | `high`   |
| `max`    | `max`    | `max`    | `max`           | `max`    | `max`  | `max`    |

Install parses via `parseEffortMap` and applies on **all hosts**:

- **Claude** — remaps `effort:` (Claude column; identity today)
- **Cursor** — emits `effort:` from Cursor column (T3 no longer drops it)
- **opencode** — emits `reasoningEffort:` from provider column (Z.AI / NVIDIA / Moonshot / OpenCode Go/Zen; groq/cerebras/ollama/openrouter inherit OpenCode Go/Zen)

Z.AI `xhigh` → `max` still lands the AA “GLM-5.2 (max)” path.

Re evaluate models based on https://livebench.ai/#/?sort=Coding&dir=desc given more coding related

## Model-selection doctrine: parity of output quality, not parity of tier/effort

Decision on how non-Claude pins are chosen. This replaces the relative-tier mapping currently written in `.bkit/providers.md:350` and `.bkit/prompts.md:142`.

### Principle

Claude is the baseline. The pins bkit ships on the Claude host — `claude-opus-5`, `claude-sonnet-5`, `claude-haiku-4-5-20251001`, each at its role's `effort:` — define **three absolute quality targets**, one per tier.

On any other platform we are matching **those targets**, not the shape of the ladder. Model tier and reasoning effort are knobs for reaching a bar, not a structure to reproduce. Concretely: we do **not** map opus→their top model, sonnet→their mid, haiku→their small. That mapping compounds a deficit which is already there — a fallback provider's "mid" model is nowhere near Sonnet, so a sonnet-tier agent lands far below its target while the ladder looks tidy.

**Ranking of record: [LiveBench — Agentic Coding](https://livebench.ai/#/?cats=Agentic+Coding).** Artificial Analysis (linked in the issue body) stays useful for price/latency and general capability, but agentic-coding score is what decides a pin, since that is the workload every bkit agent runs.

### Selection rule

For each tier, pick the **cheapest (model, reasoning-effort) combination on that platform whose Agentic Coding score approaches the tier's Claude target.** Approaching is enough — it does not have to beat it.

Two consequences, and they pull in opposite directions:

1. **Opus- and sonnet-tier agents on a below-baseline platform → best model, max reasoning effort, for both tiers.** There is no headroom to spend: if the platform's ceiling still sits under `claude-sonnet-5`, take the ceiling and stop. Spreading opus/sonnet across two different models buys nothing and costs quality on the sonnet half.
2. **Haiku-tier agents are NOT swept up in that.** The haiku target is low enough that a mid or cheap model at low/medium effort already approaches it. Pinning GLM-5.2 at max, or Grok-4.5-high, to serve a read-and-emit summariser burns tokens for output quality nobody asked for. Keep haiku-tier cells on the cheap end and keep their effort low.

So the ladder does not disappear — it **compresses at the top and stays intact at the bottom**. Tier separation survives exactly where the platform has headroom over the target, which for today's field means the haiku row and nothing above it.

### Hard-constraint escape hatch

"Cheapest that approaches the target" is bounded by constraints that are _not_ about quality:

- `ollama-local` — single box, `OLLAMA_MAX_LOADED_MODELS=1`, fanless M5 32GB (≤~24GB Q4). Stays one uniform model; tiers differ only by `reasoningEffort` (opus/sonnet rows → max, haiku → low).
- Ollama Cloud — `kimi-k2.7-code` / `deepseek-v4-pro` need a paid plan; sonnet+haiku cells are the free-validated ones.
- Rate/quota/context ceilings — collapsing ~45 agents onto one flagship can hit walls a mixed ladder avoided.

Deviate only for these, and state the constraint in the Notes column so the cell doesn't read as a tier judgement.

### Non-goals

- **Claude-host tiering is unchanged.** The baseline defines itself; opus/sonnet/haiku each clear their own bar by construction, and the ladder there is a legitimate cost lever.
- **Cursor's missing Sonnet stops being a gap.** `providers.md:124` / `:378` currently apologise for "Cursor has no Sonnet — leave sonnet/haiku agents on shipped Composer/Grok". Under this rule that is the _correct_ outcome for the sonnet tier, not a shortfall to work around.

### Follow-up edits

- `.bkit/providers.md:350` — replace "Tier design — opus→top coder, sonnet→mid, haiku→small/fast, convergent→CoT" with the rule above.
- `.bkit/prompts.md:142` — "Cloud columns (`Nvidia`, etc.) mirror Claude tier (opus/sonnet/haiku → per-tier model)" is the relative mapping; rewrite to per-tier score targeting.
- `.bkit/prompts.md` § Models — collapse the **sonnet-tier cells onto the opus-tier pin** per provider, leave haiku cells alone. Expected outcome per column, to be confirmed cell-by-cell against the board at pin time rather than taken from this comment: `zai` glm-5.1→glm-5.2; `moonshot` kimi-k2.7-code→kimi-k3; `nvidia` qwen3.5-397b-a17b→kimi-k2.6; `openrouter` qwen/qwen3-coder→kimi-k3; `opencode-zen` qwen3.6-plus→kimi-k2.7-code; `opencode-go` qwen3.7-plus→minimax-m3; `ollama` (cloud) qwen3.5:397b→kimi-k2.7-code **only if** the paid-plan constraint is accepted, else document the deviation. `groq`/`cerebras` are already collapsed by catalog poverty — reframe the Notes as doctrine rather than accident.
- `.bkit/prompts.md:68` effort table — fallback-provider columns ceiling out on the opus/sonnet rows instead of tracking Claude's per-tier effort; haiku row stays low.
- `providers.md:124` / `:378` — reframe the Cursor notes per Non-goals.

## Parity board — measured, and it changes the pins

Doctrine refined and applied. The rule is **per-tier targets, cheapest sufficient pin**: each tier's target is the LiveBench Agentic Coding score of the Claude model bkit pins for it, and a fallback column picks the cheapest (model, effort) that _approaches_ that target. Not "best model at max effort everywhere" — the haiku target is low enough that cheap models clear it, and burning a flagship there is waste.

### Data source

[LiveBench](https://livebench.ai/#/?cats=Agentic+Coding) release **2026-06-25**, pulled from `LiveBench/new-livebench` `public/table_2026_06_25.csv` + `public/cost_2026_06_25.csv` (the site is a JS app with no data in the HTML; the leaderboard CSVs live in the site repo). Category definition from `categories_2026_06_25.json`: **Agentic Coding = `javascript` + `typescript` + `python`**. Score = mean of those three. **$/task** = category dollars ÷ 72 questions, from LiveBench's own cost table.

### The board

| Model                         | Score     | $/task    | Notes                                       |
| ----------------------------- | --------- | --------- | ------------------------------------------- |
| `claude-opus-5` (max)         | **65.2**  | $5.34     | **opus target**                             |
| `kimi-k3`                     | 62.2      | $1.76     | only non-Claude pin above the sonnet target |
| `claude-fable-5` (max)        | 62.2      | $8.86     | below Opus 5 at 1.7x cost — stays unadopted |
| `claude-sonnet-5` (xhigh)     | **59.4**  | $2.14     | **sonnet target**                           |
| `grok-4.5`                    | 56.5      | $0.54     | Cursor ceiling                              |
| `glm-5.2`                     | 51.8      | $0.96     |                                             |
| `claude-opus-4-8` (max)       | 50.5      | $4.96     | the 4.8 → 5 jump is +14.7                   |
| `kimi-k2.6-thinking`          | 46.9      | $0.72     |                                             |
| `kimi-k2.7-code`              | 45.7      | $0.39     |                                             |
| `glm-5.1`                     | ~45 †     | —         |                                             |
| `qwen3.7-max`                 | 43.6      | $0.80     |                                             |
| `deepseek-v4-pro`             | 42.6      | $0.14     |                                             |
| `kimi-k2.5`                   | ~42 †     | —         |                                             |
| `qwen3.6-plus`                | 41.4      | $1.55     |                                             |
| `minimax-m3`                  | 40.7      | $0.42     |                                             |
| `qwen3.6-27b`                 | 39.3      | $0.81     |                                             |
| `deepseek-v4-flash`           | 37.6      | **$0.03** |                                             |
| `claude-haiku-4-5` (thinking) | **~35 †** | —         | **haiku target**                            |
| `zai-glm-4.7`                 | ~35 †     | —         |                                             |
| `gpt-oss-120b`                | ~10 †     | —         |                                             |

† estimated: model absent from the 2026-06-25 release, bridged from its 2026-01-08 score via the mean delta of the three nearest-scoring models present in both. Cross-release scores are **not** directly comparable — overlapping models moved −1.4 to −31.5 — so † is a bracket, not a number. Unmeasured with no anchor (do not infer): `composer-2.5`, `qwen3.5-397b`, `qwen3-coder`, `qwen3.7-plus`, `glm-4.5-air`, `gpt-oss-20b`, `qwen3-coder:30b`.

### Corrections to my previous comment

- **"Even the best model on a fallback platform is below the Claude baseline" is false for the sonnet tier.** `kimi-k3` scores 62.2 — **above** `claude-sonnet-5` (59.4) and only 3.0 under Opus 5, at a third of Opus's cost per task. Moonshot and OpenRouter are effectively at parity for both top tiers, not making a compromise.
- `grok-4.5` at 56.5 / $0.54 is 2.9 under the sonnet target at a quarter of Claude's cost — Cursor's shipped default was already a good sonnet-tier match.
- The candidate collapses I listed were mostly right in direction but wrong in several specifics, which is why they were flagged as confirm-at-pin-time. The board overrode them in five places.

### What actually changed

Applied to `.bkit/prompts.md` § Models (all 92 rows + orchestrators) and `.bkit/providers.md`:

- **sonnet collapses onto the ceiling** — `nvidia` qwen3.5-397b→kimi-k2.6, `openrouter` qwen3-coder→kimi-k3, `ollama`-cloud qwen3.5:397b→kimi-k2.7-code, `zai` glm-5.1→glm-5.2, `moonshot` kimi-k2.7-code→kimi-k3.
- **`qwen3.6-plus` dropped** (opencode-zen) — strictly dominated: 41.4 at $1.55 against `kimi-k2.7-code`'s 45.7 at $0.39. Lower score, 4x the price.
- **`minimax-m3` / `qwen3.7-plus` dropped** (opencode-go) — `deepseek-v4-pro` scores higher (42.6 vs 40.7) at a third of the cost.
- **gpt-oss dropped everywhere** — `gpt-oss-120b` measures ~10, below _every_ target including haiku. `groq` and `cerebras` therefore collapse whole-column onto `qwen3.6-27b` / `zai-glm-4.7` and are flagged as the two weakest columns. Note this inverts groq's old pins, which had gpt-oss-120b on opus and qwen3.6-27b on sonnet.
- **haiku cells stay cheap** — `deepseek-v4-flash` (37.6, $0.03) clears the ~35 target at 1/180th of Opus 5 and holds both opencode gateways; `deepseek-v4-pro` ($0.14) takes haiku on nvidia/openrouter/ollama-cloud. `zai` haiku moves glm-4.5-air→glm-5.1 (air is below target).
- **Effort table inverted for opencode columns.** It used to _downshift_ non-Claude providers (medium→low, high→medium, xhigh→high) — exactly the relative-mapping error applied to thinking budget. Now they ceiling out: medium→high, high/xhigh/max→max, low→none. A provider under its target must spend _more_ thinking, not less, and can afford to at $0.03–$1.76/task. **Cursor stays identity** — its thinking lever is the model-ID suffix (`cursor-grok-4.5-high`), not the `effort:` field.
- `ollama-local` documented as **meeting no tier target** — a 30B Q4 local model is an offline/no-credit fallback, not a quality match. Hard-constraint deviation, stated as such.
- `ollama` (cloud) now needs a **paid plan on every tier**; the free pins it replaced were unmeasured or ~10. Free-tier users re-pin via § Model Overrides.

New `providers.md` § Agentic-coding parity board carries the score table plus a provider × tier lineup with per-cell deltas, so the distance from baseline is visible at the pin rather than buried in prose.

Full suite green (2665 passed); `.opencode` mirrors regenerated (41 × glm-5.2, 5 × glm-5.1 on the active `zai` provider).

### Open

`composer-2.5` is the one unresolved cell — it holds Cursor's sonnet and haiku tiers, is vendor-claimed ≈ Opus 4.7 (which measures 50.7), and has never appeared on LiveBench. Left pinned to preserve Cursor's deliberate cross-family fan-out diversity rather than churned on an unmeasured guess.

Check this out as well https://designarena.ai/leaderboard/code

## Cursor: Grok 4.6 assessed, holding the pin at `cursor-grok-4.5-high`

Checked 2026-08-20. **Decision: no change to shipped pins.** Grok 4.6 is available, but it is not worth switching to. Recording the numbers so this doesn't get re-litigated next time someone notices a newer version number.

### Live catalog (`curl https://api.cursor.com/v0/models`)

16 models. The Grok entries:

- `cursor-grok-4.5-high` — current default pin
- `cursor-grok-4.5-high-fast`
- `cursor-grok-4.6-high-fast`

**There is no plain `cursor-grok-4.6-high` in the catalog** — only the `-fast` variant. Cursor's IDE pricing page does list a non-fast "Grok 4.6", so the ID may well resolve for the IDE subagent runner, but the documented probe recipe can't confirm it. This is the same IDE-runner-vs-Cloud-Agents-API gap already flagged in `.bkit/providers.md:139`. Per Cursor's pricing page, `-fast` is charged at double the standard rate ($4/$12 per MTok vs $2/$6).

### Measured agentic-coding numbers

From LiveBench's official release — `table_2026_06_25.csv` and `cost_2026_06_25.csv`, the exact files `.bkit/providers.md` § Agentic-coding parity board already cites. Score computed the board's own way: mean of the `javascript`, `typescript`, `python` columns. `$/task` = those three categories' dollars ÷ 72 questions.

| Model      | Score    | $/task    |
| ---------- | -------- | --------- |
| `grok-4.5` | 56.5     | $0.68     |
| `grok-4.6` | **57.0** | **$1.79** |

**+0.5 points for 2.6x the cost per task.** Headline token pricing is identical between the two ($2/$6) — Grok 4.6 simply burns far more tokens reaching a similar score. Its TypeScript category cost alone goes $29.57 → $78.30.

If we pinned what is actually in the catalog (`cursor-grok-4.6-high-fast`, at double rate), the effective cost lands around 5x `grok-4.5` for the same +0.5 points.

That is precisely the trade the board's "cheapest model that reaches that tier's score" rule exists to prevent, so the pin stays put. The gap to the sonnet target would have narrowed from −2.9 to −2.4 — not enough to buy at that price.

**Method check:** the same script reproduces six existing board cells exactly — `claude-opus-5` 65.2, `claude-sonnet-5` 59.4, `kimi-k3` 62.2, `glm-5.2` 51.8, `grok-4.5` 56.5, and `deepseek-v4-pro` $0.14 — so the numbers above are computed the same way as everything else on the board.

### Correcting a claim that's circulating

Several write-ups (codersera, and search summaries repeating it) state that Grok 4.6 **regressed** on LiveBench agentic coding, 56.5 → 54.2, alongside a SkillsBench drop of 66.03 → 55.77. **The 54.2 figure does not survive contact with the actual CSV** — the real value is 57.0, a small gain. The claim is unattributed in every source carrying it. Noting it because it is wrong in the opposite direction from our conclusion: we're holding on cost, not on a quality regression.

### Two follow-ups found along the way (not actioned)

**1. Cursor has Sonnet again.** The catalog now carries `claude-sonnet-5-thinking-high` and `claude-sonnet-5-thinking-xhigh`. Five places in the shipped docs assert the opposite:

- `.bkit/providers.md:125` — "Cursor having no Sonnet is not a gap"
- `.bkit/providers.md:135` — "**No Sonnet** on Cursor — never pin `claude-*-sonnet-*` ID"
- `.bkit/providers.md:137` — "API currently **no Sonnet**"
- `.bkit/prompts.md:217` — "**No Sonnet** on Cursor"
- `.bkit/prompts.md:378` — "_(no Cursor Sonnet ID)_"

These are stale as written. Both IDs are API-pool, so the first-party-defaults doctrine is unaffected — this is a factual correction, not a pin change.

**2. Two parity-board cost cells have drifted** against the CSV the board cites:

- `grok-4.5` — board says $0.54, CSV now computes $0.68
- `glm-5.2` — board says $0.96, CSV now computes $1.46

The other six cells checked still match exactly.

### Also new in the catalog (unassessed)

`gemini-3.7-flash-high`, `gpt-5.6-luna-high`, `gpt-5.6-sol-xhigh` / `-fast`, `claude-fable-5-thinking-xhigh`. All API-pool, none candidates for default pins.

## OpenRouter model review — 2026-08-25

Prompted by the provider cleanup in #435, which cut the allowlist to four. This reviews whether the `OpenRouter` column in `.bkit/prompts.md` § Models still picks the best available models.

Short version: two of the pins are beatable, one clearly. Along the way I found a process bug in how we read the benchmark, and a result that changes how the whole parity board should be read.

---

### What we pin today

Two models cover all 49 agent rows:

| Pin                                   | Rows | LiveBench agentic-coding | $/task at OpenRouter prices |
| ------------------------------------- | ---- | ------------------------ | --------------------------- |
| `openrouter/moonshotai/kimi-k3`       | 44   | 62.2                     | $1.76                       |
| `openrouter/deepseek/deepseek-v4-pro` | 10   | 42.6                     | $0.19                       |

The second pin does two different jobs that happen to share a model: 5 convergent agents (`bkit-design-brainstorm-ideate-3`, `bkit-plan-review-3`, `bkit-build-challenge-2`, `bkit-debug-failure-diagnose`, `bkit-debug-failure-soak`) and 5 summary writers (`bkit-design-summary`, `bkit-plan-summary`, `bkit-build-summary`, `bkit-debug-summary`, `bkit-ship-summary`).

---

### Process bug: the benchmark file changes under a fixed date

`providers.md` § Agentic-coding parity cites LiveBench release **2026-06-25** (`table_2026_06_25.csv`). That reads as a frozen release stamp. It isn't — **LiveBench appends newly released models to the existing dated file rather than cutting a new release.** `RELEASES` in `src/lib/constants.js` still ends at `2026-06-25`, so there is no newer release to notice, but the contents moved.

Six models have been added to that file since our 2026-07-25 verification:

`qwen3.8-max`, `grok-4.6`, `glm-5.3`, `deepseek-v4-pro-0813`, `qwen3.8-27b`, `deepseek-v4-flash-vision-exp`

That is why the column went stale without anything looking stale. The fix is a re-probe trigger that does not rely on the release date changing.

---

### Recomputed board

Pulled fresh and recomputed. Two changes to method worth noting:

1. **$/task recomputed at OpenRouter's actual prices.** LiveBench's cost table assumes direct-vendor pricing, which diverges from what we pay. It assumes `$3/$15` per Mtok for `claude-sonnet-5`; OpenRouter charges `$2/$10`. For `openai/gpt-5.6-sol` the difference is $3.40/task assumed vs $1.36 actual.
2. **Category composition confirmed** from `public/categories_2026_06_25.json`: `Agentic Coding` = `["javascript","typescript","python"]`. Our method note is accurate.

| OpenRouter slug                         | mean(3) | $/task (OR prices) |
| --------------------------------------- | ------- | ------------------ |
| `anthropic/claude-opus-5`               | 65.2    | $5.34              |
| `deepseek/deepseek-v4-flash-vision-exp` | 65.1    | $0.11              |
| `qwen/qwen3.8-max`                      | 64.6    | $1.75              |
| `moonshotai/kimi-k3` ← current          | 62.2    | $1.76              |
| `qwen/qwen3.8-27b`                      | 61.4    | $1.52              |
| `z-ai/glm-5.3`                          | 60.9    | $1.60              |
| `anthropic/claude-sonnet-5`             | 59.4    | $1.43              |
| `google/gemini-3.7-flash`               | 58.3    | $0.42              |
| `x-ai/grok-4.6`                         | 57.0    | $1.79              |
| `deepseek/deepseek-v4-pro-0813`         | 54.9    | $0.22              |
| `deepseek/deepseek-v4-pro` ← current    | 42.6    | $0.19              |
| `deepseek/deepseek-v4-flash`            | 37.6    | $0.02              |

---

### The TypeScript finding

The three sub-tasks are not equally hard, and they are not equally weighted. Question counts are **JS 22, TS 30, PY 20** — TypeScript is the largest sub-task at 42% of the category, but the headline score is an unweighted mean, so it counts for one third.

**Every model on the board scores lower on TypeScript than on its own three-category mean.** JavaScript is what lifts the average: top JS scores reach 77.3, while nothing clears 56.7 on TS.

Since bkit's own source is TypeScript, this matters for us specifically.

| OpenRouter slug                      | TS only  | mean(3)  | rank on TS → rank on mean |
| ------------------------------------ | -------- | -------- | ------------------------- |
| `qwen/qwen3.8-max`                   | **56.7** | 64.6     | 1 → 3                     |
| `moonshotai/kimi-k3` ← current       | 53.3     | 62.2     | 5 → 6                     |
| `anthropic/claude-sonnet-5`          | 50.0     | 59.4     | 6 → 9                     |
| `z-ai/glm-5.3`                       | 50.0     | 60.9     | 10 → 8                    |
| `deepseek/deepseek-v4-pro-0813`      | 46.7     | 54.9     | 12 → 17                   |
| **`anthropic/claude-opus-5`**        | **43.3** | **65.2** | **18 → 1**                |
| `x-ai/grok-4.5`                      | 36.7     | 56.5     | 23 → 14                   |
| `deepseek/deepseek-v4-pro` ← current | 23.3     | 42.6     | 38 → 40                   |
| `deepseek/deepseek-v4-flash`         | 23.3     | 37.6     | 37 → 46                   |

`claude-opus-5` falls from 1st to 18th. It scores 77.3 on JavaScript and 75.0 on Python but 43.3 on TypeScript — a −21.9 gap, second-worst on the board. On TypeScript, `claude-sonnet-5` (50.0) sits ahead of `claude-opus-5` (43.3).

I checked whether our unweighted mean causes this. It does not — a question-weighted mean gives 63.9 vs 64.6 for `qwen3.8-max` and 62.5 vs 65.2 for `claude-opus-5`. Any three-category aggregate hides the effect. This is not a method bug in `providers.md`.

### …with a large caveat on resolution

30 questions means **one question moves the score by 3.33 points**, and every observed value is a multiple of that. Standard error at n=30 is roughly **9 points**. So most of the reordering above is not real:

- `qwen3.8-max` 56.7 vs `kimi-k3` 53.3 — **one question apart**.
- `claude-sonnet-5` 50.0 over `claude-opus-5` 43.3 — **two questions apart**.
- `deepseek-v4-pro-0813` 46.7 vs `deepseek-v4-pro` 23.3 — **seven questions**, about 2.6 SE. The only gap on this board even marginally outside noise.

The TypeScript sub-score is not precise enough to re-pin on by itself. It is precise enough to stop us treating the mean as a ranking of TypeScript ability.

---

### Recommendations, ranked by confidence

**1. `deepseek/deepseek-v4-pro` → `deepseek/deepseek-v4-pro-0813` — do this.**

Our current slug is not a floating alias. OpenRouter's `name` field for `deepseek/deepseek-v4-pro` reads **"DeepSeek V4 Pro 0423"** — it is frozen on the April snapshot. `deepseek/deepseek-v4-pro-0813` is the GA release.

- mean: 42.6 → 54.9 (**+12.3**)
- TypeScript: 23.3 → 46.7 (**+23.4**, seven questions)
- cost: $0.19 → $0.22 per task

OpenRouter charges more per token for `-0813` (`$1.12/$3.37` vs `$0.58/$1.16` per Mtok) but it emits far fewer tokens, so per-task lands level.

**2. Split the 5 summary writers onto `deepseek/deepseek-v4-flash` — do this, it now costs nothing.**

`deepseek-v4-flash` is **tied with our current pin on TypeScript at 23.3**, so the 9x price difference buys nothing measurable for those agents. It clears the ~35 haiku target on the mean (37.6) and is what both opencode gateways already use for that cell. Cost drops $0.19 → $0.02 per task.

Recommendation 1 is what makes this possible — today one model serves both the convergent and haiku roles, so it could not be cheapened without hurting the convergent agents.

**3. `moonshotai/kimi-k3` → `qwen/qwen3.8-max` — optional, do not record as a quality gain.**

+2.4 on the mean, +3.4 on TypeScript, same price ($1.76 → $1.75). One question of difference on TS. Fine to take while editing the column, but it is not a demonstrated upgrade.

**4. Add a TypeScript caveat to the parity board.**

The per-tier targets in `providers.md` are all mean-derived, and the Claude ladder is **not monotonic on TypeScript**. Worth a note so the next reader does not take 65.2 as "opus is best at our language".

---

### Checked and rejected

- **`deepseek/deepseek-v4-flash-vision-exp`** — 65.1 at $0.11/task would be the best value on the board by a wide margin. **Do not pin it.** It is flagged experimental, and its own OpenRouter description says it matches `deepseek-v4-flash-0731` on text capabilities — which scores **46.8**, eighteen points lower. The number does not survive its own datasheet.
- **`smaug-agentic` (64.6), `muse-spark-1.1-xhigh`, `muse-spark-1.2-xhigh`, `ox-alpha-max`, `inkling-xhigh`** — on the LiveBench board, absent from OpenRouter's 419-model catalog. Stealth entries.
- **`qwen/qwen3.8-27b`** — looks like 61.4 at $0.95, but that uses LiveBench's assumed price. At OpenRouter's actual price it is $1.52, and it burns 3.57M input tokens per task. Worse than `qwen3.8-max` on both axes.
- **`x-ai/grok-4.6` (57.0), `z-ai/glm-5.3` (60.9)** — both below `qwen3.8-max` at similar or higher cost.
- **`anthropic/claude-opus-5`** — worth stating explicitly since OpenRouter is the one column where the target model itself is purchasable. On the mean it is exact parity at 65.2. On TypeScript it would be a **downgrade** from what we already pin (43.3 vs `kimi-k3`'s 53.3) at 3x the cost. Not worth it.

---

### Still outstanding

**Tool-call smoke test is still blocked.** Ran it against all six candidates (`tools:` round-trip on `POST /api/v1/chat/completions`, checking for `tool_calls` in the response) and every one returned `403 Key limit exceeded (total limit)`. Same blocker recorded on 2026-07-25. These stay existence-verified via `supported_parameters` containing `tools`, which per our own validate-with-the-real-tool rule is not proof. Needs credit on the OpenRouter key before any of these pins are confirmed.

### Reproducing this

```
curl -s https://openrouter.ai/api/v1/models                     # public, no key
gh api repos/LiveBench/new-livebench/contents/public/table_2026_06_25.csv --jq '.content' | base64 -d
gh api repos/LiveBench/new-livebench/contents/public/cost_2026_06_25.csv  --jq '.content' | base64 -d
gh api repos/LiveBench/new-livebench/contents/public/categories_2026_06_25.json --jq '.content' | base64 -d
```

Score = mean of the `javascript`, `typescript`, `python` columns. $/task = summed category dollars ÷ summed `nq_*`, then rescaled to OpenRouter's `pricing.prompt` / `pricing.completion` by solving LiveBench's own dollar figure for implied input tokens.

## OpenRouter re-pin — applied, and it supersedes the recommendation above

Two things changed after [the previous comment](https://github.com/cbartens/bkit/issues/205#issuecomment-5410670368): a stated constraint that was never written down, and a speed finding that reverses the opus-cell pick.

---

### The constraint that was missing

**The `OpenRouter` column exists to carry work when the Claude weekly quota is spent.** That is why a Claude model must never be pinned there regardless of score — it defeats the column's purpose. The goal itself is unchanged: still "cheapest model that reaches that tier's Claude score", just with a hard non-Claude filter.

This was nowhere in the repo. `providers.md` described OpenRouter only as "Aggregator; broad catalog to re-pin from" — mechanical, no statement of purpose. That absence is why the pins kept drifting toward matching Claude on score alone. Now recorded.

### Score alone was picking the wrong model

The previous comment recommended `qwen/qwen3.8-max` for the opus cell: 64.6 vs `kimi-k3`'s 62.2, at the same price, and marginally cheaper. On score and price it strictly dominates.

It is also **noticeably slow in practice**, which sent me looking at fields the parity board never carried:

| Model                           | Endpoints       | Implicit caching | Input tok/task |
| ------------------------------- | --------------- | ---------------- | -------------- |
| **`qwen/qwen3.8-max`**          | **1** (Alibaba) | **no**           | **868k**       |
| `z-ai/glm-5.3`                  | 1 (Z.AI)        | no               | 1130k          |
| `x-ai/grok-4.5`                 | 4               | no               | 340k           |
| `google/gemini-3.7-flash`       | 6               | **yes**          | 1103k          |
| `qwen/qwen3.8-27b`              | 10              | no               | 3570k          |
| `moonshotai/kimi-k3`            | **14**          | no               | 579k           |
| `deepseek/deepseek-v4-pro-0813` | **15**          | **yes**          | 190k           |
| `deepseek/deepseek-v4-flash`    | **17**          | **yes**          | 222k           |

`qwen3.8-max` routes to Alibaba and nowhere else, so OpenRouter cannot route around a slow or down host and you inherit that provider's rate limits directly. It has no implicit caching, so every turn of a long agentic loop re-prefills the whole growing transcript. And it reads 50% more input per task than `kimi-k3`, none of it cached.

For a column whose entire job is absorbing work when the primary is exhausted, a single point of failure is the wrong shape independent of the speed.

**Evidence caveat:** OpenRouter returns `null` for measured throughput and latency on the public endpoints API, so there are no tokens/sec figures here. This is a mechanism consistent with the observed slowness, not a measurement of it. A timing test needs credit on the OpenRouter key — same blocker as the tool-call smoke.

This is already in-doctrine, not an exception: `providers.md` says _"Cheapest that reaches the target is bounded by constraints that are not about quality: paid-plan gating, rate/quota/context walls… Deviate for those, and say so in the Notes cell."_

---

### What shipped

| Tier          | Rows | Pin                                             | mean | vs target | Endpoints | Cache |
| ------------- | ---- | ----------------------------------------------- | ---- | --------- | --------- | ----- |
| opus (65.2)   | 24   | `openrouter/moonshotai/kimi-k3` — **unchanged** | 62.2 | −3.0      | 14        | no    |
| sonnet (59.4) | 20   | `openrouter/google/gemini-3.7-flash`            | 58.3 | −1.1      | 6         | yes   |
| convergent    | 5    | `openrouter/deepseek/deepseek-v4-pro-0813`      | 54.9 | n/a       | 15        | yes   |
| haiku (~35)   | 5    | `openrouter/deepseek/deepseek-v4-flash`         | 37.6 | +2.6      | 17        | yes   |

Column cost index **$79.34 → $51.84, a 35% cut**, with every cell at or closer to its target than before. Three of four cells now have implicit caching.

**The opus swap was buying nothing.** With `qwen3.8-max` the column costs $51.60 against $51.84 for `kimi-k3` — 0.3%. The whole saving comes from the other three cells. So the trade is 2.4 points of mean (one TypeScript question, inside noise) for 14 endpoints instead of 1, essentially free.

#### Two real fixes in there

**The sonnet cell was paying opus prices.** All 44 rows collapsed onto `kimi-k3` at $1.76, including 20 sonnet-tier rows, when the sonnet target is 59.4 and `gemini-3.7-flash` reaches 58.3 for **$0.42**. "Cheapest that reaches _that tier's_ target" had never been applied to the sonnet cell — it inherited the opus pin because `kimi-k3` happened to clear both. This is the only provider column where opus and sonnet separate; every other provider's ceiling sits under the sonnet target.

**The convergent pin was frozen on a stale snapshot.** `deepseek/deepseek-v4-pro` is not a floating alias — OpenRouter's `name` field reads "DeepSeek V4 Pro 0423". The GA build is a separate slug: **+12.3 mean, +23.4 TypeScript**, for $0.22/task against $0.19.

---

### Files changed

- **`.bkit/prompts.md`** — § Models (30 rows re-pinned across the agent and Orchestrator tables), the per-tier doctrine paragraph, and the live-verification note. Diff verified to touch **only** column 4.
- **`.bkit/providers.md`** — parity board rebuilt with the six models LiveBench added since the last check, plus four new method rules: re-probe on a schedule not a release stamp; rescale `$/task` to the provider actually billed; sub-scores are too coarse to pin on; endpoint count and implicit caching decide ties. Notes cell records why opus is not the top-scoring non-Claude model.
- **`.bkit/src/bkit-install.test.ts`** — tier-anchor expectations updated, plus two new guards: the convergent pin must be the dated GA build and never the frozen slug, and **no Claude model may appear anywhere in the column**.

### Gates

`pnpm test` **3542 passed**, 2 skipped, 2 todo. `format:check` clean, `slop:delta` net 0 findings / 0.00 score, `lint:prose` 0 errors (2 pre-existing warnings in `docs/deployments.md` and `docs/testing.md`), `bkit:lint:workflows` clean.

Staged, not committed. Host mirrors under `.opencode/agents/` are **not** regenerated — that needs a `bkit install` pass.

### Still outstanding

- **Tool-call smoke still blocked.** All candidates return `403 Key limit exceeded (total limit)`. `gemini-3.7-flash` and `deepseek-v4-pro-0813` are now load-bearing for 25 of 54 rows on existence-verification alone (`supported_parameters` contains `tools`), which is not proof under our own validate-with-the-real-tool rule.
- **`kimi-k3` caching is unconfirmed.** It has cache-read pricing ($0.30/Mtok, 10% of input) but not _implicit_ caching, so the discount needs the client to send explicit `cache_control` breakpoints. Whether opencode does is unchecked — it is in `sst/opencode`, not here. If it does, the column drops to **0.19x** of today's cost rather than 0.65x. Worth settling before any cost claim goes into `providers.md`.
- **Other provider columns unreviewed.** `Ollama`, `OpenCode Zen` and `OpenCode Go` were not re-probed; the six newly-measured models may move those too.

## Kimi caching on OpenRouter — checked, and it corrects the comment above

Settling the open question from the previous comment ("`kimi-k3` caching is unconfirmed"). The answer is **yes, it caches, automatically, with no client configuration** — which makes two statements in that comment wrong.

### Corrections

**1. `kimi-k3` does have automatic caching.** I said it "has cache-read pricing but not _implicit_ caching, so the discount needs the client to send explicit `cache_control` breakpoints". That is wrong. OpenRouter's [prompt-caching doc](https://openrouter.ai/docs/features/prompt-caching), § Moonshot AI, states verbatim:

> Cache writes: no cost
> Cache reads: charged at {MOONSHOT_CACHE_READ_MULTIPLIER}x the price of the original input pricing
> Prompt caching with Moonshot AI is automated and does not require any additional configuration.

Endpoint pricing confirms the multiplier: all 14 `kimi-k3` endpoints price `input_cache_read` at ~0.10x of input, with **no write cost** on any of them.

**2. The `supports_implicit_caching` field is unreliable — do not use it as a pin criterion.** I built the last two comments partly on it. It reports `false` on **all 14** `kimi-k3` endpoints, including Moonshot's own, while the provider doc says caching is automated. The per-provider doc sections are authoritative; that field is not.

So the parity board's caching column was wrong for `kimi-k3`, and "three of four cells have implicit caching" was wrong. It is **four of four**.

### Caching contract per pin

| Pin                             | Provider    | Caching                         | Config needed | Read mult | Write cost                       |
| ------------------------------- | ----------- | ------------------------------- | ------------- | --------- | -------------------------------- |
| `moonshotai/kimi-k3`            | Moonshot AI | automatic                       | none          | 0.10x     | free                             |
| `google/gemini-3.7-flash`       | Google      | implicit (2.5 series and newer) | none          | 0.10x     | free, ~5 min TTL, 4096-token min |
| `deepseek/deepseek-v4-pro-0813` | DeepSeek    | automatic                       | none          | 0.03x     | at input price                   |
| `deepseek/deepseek-v4-flash`    | DeepSeek    | automatic                       | none          | 0.20x     | at input price                   |

Providers requiring **explicit** `cache_control` breakpoints: Anthropic, Alibaba Qwen. bkit does not send breakpoints.

### This strengthens the decision to skip `qwen3.8-max`

Its caching situation is worse than I described. Alibaba requires explicit breakpoints, **and** the doc's supported list for Alibaba explicit caching names `qwen/qwen3-max`, `qwen/qwen-plus`, `qwen/qwen3.6-plus`, `qwen/qwen3-coder-plus`, `qwen/qwen3-coder-flash` and `deepseek/deepseek-v3.2` — `qwen3.8-max` is absent. So it gets **no caching at all** on OpenRouter, not merely "no implicit caching". Single endpoint plus zero caching, against `kimi-k3`'s 14 endpoints plus automatic caching, for 2.4 points of mean.

### Sticky routing is the thing that actually gates cache hits

A cache hit needs the same provider endpoint twice, and `kimi-k3` spreads across 14. OpenRouter handles this itself:

- After a cached request it pins the conversation to that provider.
- The key is `session_id` / `prompt_cache_key` when sent, otherwise a hash of the first system message plus the first non-system message.
- Sticky sessions expire after **10 minutes of inactivity**.
- Sticky routing is **disabled entirely** when `provider.order` is set — so never pin a provider order on a cached model.

bkit sends no session key, so it falls back to message hashing. For a bkit agent that is fine: the system prompt is fixed per agent and the opening user message is the task, so the hash is stable across a run.

**One gap worth knowing about.** bkit's OpenRouter block uses the generic `@ai-sdk/openai-compatible` driver, not opencode's native OpenRouter adapter (`packages/llm/src/providers/openrouter.ts` in `anomalyco/opencode` — note `sst/opencode` now redirects there). That adapter is what sends `usage: {include: true}`, `reasoning`, and `prompt_cache_key`, and it only sends `prompt_cache_key` when `providerOptions.openrouter.promptCacheKey` is set, which bkit does not set. Consequences: caching still works (it is server-side), but **cache metrics are not returned**, so hit rates are unobservable, and stickiness relies on the hash fallback rather than an explicit key. Not blocking; worth a follow-up if we ever want to measure hit rates.

### Corrected cost

| Column                     | Cost index | vs before |
| -------------------------- | ---------- | --------- |
| before this change         | $79.34     | 1.00x     |
| new column, cold cache     | $51.78     | 0.65x     |
| **new column, warm cache** | **$14.93** | **0.19x** |

Assumes 80% of input is a cache-hittable repeated prefix. The 0.19x figure the previous comment flagged as conditional on `kimi-k3` caching is now **unconditional** — every pin caches with no configuration.

### Docs updated

`.bkit/providers.md` § Agentic-coding parity:

- Replaced the `supports_implicit_caching` tie-break rule with one that reads the caching contract from the provider docs, and records the field as unreliable with the `kimi-k3` contradiction as the worked example.
- New rule covering sticky routing: the 10-minute inactivity expiry and the `provider.order` interaction.
- Board rows now carry the real contract per model (read multiplier, write cost, TTL, token minimums) instead of a yes/no.
- `qwen3.8-max` row and the per-tier Notes cell corrected to "no caching available".

`.bkit/prompts.md` live-verification note: caching criterion reworded, records that all four pins cache automatically.

Gates: `format:check` clean, `lint:prose` 0 errors (2 pre-existing warnings), `slop:delta` net 0 findings / 0.00 score, targeted suites 384 passed. Staged, not committed.

### Not changed

No pins move. The column stands as applied — `kimi-k3` opus, `gemini-3.7-flash` sonnet, `deepseek-v4-pro-0813` convergent, `deepseek-v4-flash` haiku. This finding confirms the shape rather than altering it; only the stated reasoning and the cost numbers were wrong.

Tool-call smoke remains blocked on `403 Key limit exceeded`.

## OpenRouter review — 2026-09-16 (applied)

Re-scored the OpenRouter column against every source in the issue body. Priority used: **(1) Claude parity (LiveBench Agentic Coding + AA Intelligence) · (2) cost · (3) speed**. Operational filters (endpoint count, automatic prompt caching) still apply; Claude stays off this column.

### Decision (applied in `.bkit/prompts.md`)

| Tier       | Was                                  | Now                                | LiveBench                  | AA $/task | tok/s | E2E 500 tok |
| ---------- | ------------------------------------ | ---------------------------------- | -------------------------- | --------- | ----- | ----------- |
| opus       | `moonshotai/kimi-k3` 62.2            | **`deepseek/deepseek-v4.1-flash`** | **77.3** (+12.1 vs Opus 5) | $0.27     | 212   | 13s         |
| sonnet     | `google/gemini-3.7-flash` 58.3       | **`deepseek/deepseek-v4.1-flash`** | **77.3** (clears 59.4)     | $0.27     | 212   | 13s         |
| haiku      | `deepseek/deepseek-v4-flash` 37.6    | **`z-ai/glm-5.3-flash`**           | 56.8 (>> ~35)              | $0.25     | 114   | 24s         |
| convergent | `deepseek/deepseek-v4-pro-0813` 54.9 | **`moonshotai/kimi-k3`**           | 62.2                       | $2.00     | 35    | 76s         |

V4.1 Flash is the only operational OpenRouter model that clears the opus target. It is also cheaper and faster than the previous sonnet pin, so opus+sonnet collapse onto it. GLM-5.3 Flash (not GLM-5.3) is the haiku pin — cheapest sufficient, 27 endpoints, automatic Z.AI cache. Kimi K3 stays **convergent only** so the risk/diagnosis lens keeps a distinct family with stronger AA intelligence (60 vs V4.1 Flash 39.5).

List prices: V4.1 Flash `$0.15 / $0.60` (cache read `$0.006`) · GLM-5.3 Flash `$0.075 / $0.25` · Kimi K3 `$2.10 / $10.95`. All three cache automatically. Endpoints: 16+ / 27 / 17.

### LiveBench Agentic Coding (pin score)

Mean of JS 22 / TS 30 / PY 20. CSV `table_2026_06_25.csv` (contents newer than the stamp).

| Model                   | Mean     | JS   | TS   | PY   | vs opus 65.2                                        |
| ----------------------- | -------- | ---- | ---- | ---- | --------------------------------------------------- |
| **DeepSeek V4.1 Flash** | **77.3** | 81.8 | 60.0 | 90.0 | **+12.1**                                           |
| Qwen3.8 Max             | 64.6     |      |      |      | −0.6 · rejected (1 Alibaba endpoint, no auto cache) |
| Muse Spark 1.3          | 64.1     |      |      |      | rejected (1 Meta endpoint)                          |
| Kimi K3                 | 62.2     |      |      |      | −3.0 · convergent only                              |
| GLM-5.3                 | 60.9     |      |      |      | −4.3 · viable but dominated by V4.1 Flash           |
| Claude Sonnet 5         | 59.4     |      |      |      | sonnet target                                       |
| Gemini 3.7 Flash        | 58.3     |      |      |      | previous sonnet pin                                 |
| GPT-6 Astra             | 57.3     |      |      |      | rejected ($10 / $50)                                |
| Grok 4.6                | 57.0     |      |      |      | not a pin — 4× Gemini cost                          |
| **GLM-5.3 Flash**       | **56.8** |      |      |      | haiku pin                                           |
| Gemini 3.8 Flash        | 54.2     |      |      |      | do not upgrade sonnet — worse than 3.7              |
| DeepSeek V4 Pro 0813    | 54.9     |      |      |      | previous convergent                                 |
| DeepSeek V4 Flash       | 37.6     |      |      |      | previous haiku                                      |

### Other boards (do not override LiveBench)

- **DeepSWE v1.1** (public 3 Sep): GPT-6 Astra / Gemini 3.8 Flash / Opus 5 tied 74%. Independent next: GLM-5.3 = Kimi K3 69%, Grok 4.6 67%, Gemini 3.7 Flash 65%. Qwen3.8 Max drops to 57%. V4.1 Flash is vendor-reported 74.2 — not yet on the public 21-model list.
- **AA Intelligence:** Grok 4.6 high 61 · Muse 1.3 max 62 · Kimi K3 max 60 · GLM-5.3 max 60 · Gemini 3.8 Flash 59 · Qwen3.8 Max 58 · Gemini 3.7 Flash 56 · **V4.1 Flash 39.5** (the one board where the LiveBench winner is weak — knowledge / HLE / CritPt, not agentic coding). This is why convergent stays Kimi.
- **LMArena WebDev** (11 Sep): Kimi K3 1674 · Qwen3.8 Max 1671 · Muse 1.3 1652 · Grok 4.6 1618 · GLM-5.3 = V4.1 Flash 1614 · Gemini 3.7 Flash 1587 · Gemini 3.8 Flash 1568. Kimi still wins preference among allowed pins.
- **OpenRouter volume** ignored (price signal, not quality).

### Rejects

| Candidate                  | Why not                                                                                                                                                                                                          |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `qwen/qwen3.8-max`         | 1 Alibaba endpoint; needs `cache_control` bkit does not send                                                                                                                                                     |
| `meta/muse-spark-1.3`      | 1 Meta endpoint                                                                                                                                                                                                  |
| `google/gemini-3.8-flash`  | LiveBench 54.2 < Gemini 3.7                                                                                                                                                                                      |
| `openai/gpt-6-astra`       | $10 / $50 — Claude-tier price, defeats the column                                                                                                                                                                |
| `x-ai/grok-4.6`            | Below V4.1 Flash; ~4× the cost of the previous sonnet pin                                                                                                                                                        |
| `z-ai/glm-5.3` (non-flash) | Clears sonnet but $2.01/task vs V4.1 Flash $0.27                                                                                                                                                                 |
| Hold Kimi on opus          | Freshness call only. LiveBench independently measured 77.3 with a consistent three-language split; endpoints + auto cache already pass. Six days old (released 10 Sep) + weak AA general is noted, not blocking. |

### Sources pulled 2026-09-16

LiveBench `table_2026_06_25.csv` · DeepSWE v1.1 public board 3 Sep · AA Intelligence Index v4.3 (score + cost + latency) · LMArena Code Arena WebDev 11 Sep · OpenRouter model pages + `/api/v1/models` + prompt-caching doc.

Issue body rewritten with the repeatable per-provider process and the full source list.

## Claude 5.5 pins — applied 2026-10-06

Probed the two catalogs that own the columns. Grok 4.7 is not a Cursor pin. Opus 5.5 / Sonnet 5.5 are Claude API IDs, hyphenated, and they are not on Cursor's Cloud catalog.

### Catalogs

| Host   | Probe                              | Result                                                                                                                                                                                                                                           |
| ------ | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Claude | `GET /v1/models` + models overview | Current IDs: `claude-opus-5-5`, `claude-sonnet-5-5`, `claude-haiku-4-5-20251001`, `claude-fable-5-1`. Opus 5 and Sonnet 5 still listed, not pinned. Opus 5.5 and Sonnet 5.5 are 1M context ($4/$20 and $2/$10).                                  |
| Cursor | `GET /v0/models`                   | First-party: `cursor-grok-4.5-high`, `composer-2.5`. No `cursor-grok-4.7`. No Opus 5.5 / Sonnet 5.5. API pool has `claude-opus-5-thinking-high`, `claude-sonnet-5-thinking-high`/`-xhigh`, `gpt-5.6-*`, `claude-fable-5-thinking-high`/`-xhigh`. |

### What changed

| Column                                                             | Was                                     | Now                 |
| ------------------------------------------------------------------ | --------------------------------------- | ------------------- |
| Claude opus (`high` / `xhigh` / `max`, `/design` `/plan` `/debug`) | `claude-opus-5`                         | `claude-opus-5-5`   |
| Claude sonnet (`medium`, `/build` `/ship`)                         | `claude-sonnet-5`                       | `claude-sonnet-5-5` |
| Claude haiku                                                       | `claude-haiku-4-5-20251001`             | unchanged           |
| Cursor                                                             | `cursor-grok-4.5-high` / `composer-2.5` | unchanged           |
| Other provider columns                                             | —                                       | unchanged           |

43 prompt files: `model:` frontmatter matches the Anthropic column. Fable stays unpinned (`claude-fable-5-1` on Claude; Cursor Cloud still lists Fable 5 thinking IDs, not 5.1). `max` stays on `claude-opus-5-5`.

Cursor override map (opt-in, not shipped defaults): opus tier → `claude-opus-5-thinking-high` (no 5.5 ID on `/v0/models`); sonnet tier → `claude-sonnet-5-thinking-high` (Sonnet 5, not 5.5). The old "no Sonnet on Cursor" note is gone.

Parity-board targets stay the last measured generation: `claude-opus-5` **65.2**, `claude-sonnet-5` **59.4**. 5.5 is not on that CSV, so those scores are not claimed for the new pins.

### Files

- `.bkit/prompts.md` — effort map, § Models, orchestrators, live-verification note (Claude + Cursor stamped 2026-10-06), Model Overrides.
- `.bkit/prompts/*.md` — `model:` on the 43 opus/sonnet agents.
- `.bkit/providers.md` — pin identity, Cursor catalog, Claude lineup row marked `n/m` for 5.5.

`bkit-models-table-parity.test.ts`: 4 passed. Host mirrors (`.claude/agents`, `.cursor/agents`, and the rest) are not regenerated — that needs a `bkit install` pass. Not committed.

## Haiku 5.5 adopted — 2026-10-09

Our last Claude check ([2026-10-06](https://github.com/cbartens/bkit/issues/205#issuecomment-6010384533)) said "Haiku unchanged" because Haiku 4.5 really was the newest Haiku that day. **Haiku 5.5 came out the next day, 2026-10-07**, so that comment was right when written and went stale within 24 hours.

### What the live API says

`GET /v1/models` (with `BKIT_ANTHROPIC_API_KEY`) now lists `claude-haiku-5-5` (created 2026-10-07T18:00Z) as the newest model. `GET /v1/models/claude-haiku-5-5`:

- lifecycle `active`, no deprecation or retirement date (the docs promise no retirement before 2027-10-07)
- reads up to 1M tokens of input; our old Haiku read up to 200K
- writes up to 128K tokens
- supports every effort level from `low` to `max`
- adaptive thinking only: the model decides how much to think, and you can't give it a fixed thinking budget

A real `POST /v1/messages` with `model: claude-haiku-5-5` answered correctly, so the ID works with our key.

**Price** ([model page](https://platform.claude.com/docs/en/models/haiku-5-5/overview)): $0.10 in / $0.50 out per million tokens for prompts up to 100K tokens, and $0.50 / $2.50 above that. Haiku 4.5 is $1 / $5 at every length, so short prompts cost a tenth as much. One caveat: Haiku 5.5 uses the newer tokenizer, which turns the same text into about 30% more tokens than Haiku 4.5 does.

### Benchmark (LiveBench Agentic Coding)

`table_2026_06_25.csv` now has Haiku 5.5. This is the same dated file growing in place, as noted [before](https://github.com/cbartens/bkit/issues/205#issuecomment-5410670368). The score is the mean of the `javascript`, `typescript` and `python` columns. **$/task** = those three categories' dollars ÷ 72 questions. The same script reproduces the board's existing `claude-opus-5` 65.2, `claude-sonnet-5` 59.4, `deepseek-v4-flash` 37.6 and `glm-5.3-flash` 56.8, so the numbers are computed the board's way.

| Model                         | Mean  | JS   | TS   | PY   | $/task |
| ----------------------------- | ----- | ---- | ---- | ---- | ------ |
| `claude-haiku-5-5` (max)      | 57.2  | 68.2 | 43.3 | 60.0 | $0.21  |
| `claude-haiku-5-5` (xhigh)    | 51.4  | 59.1 | 40.0 | 55.0 | $0.07  |
| `claude-haiku-4-5` (thinking) | ~35 † |      |      |      | —      |

The five summary writers run at `effort: low`, and LiveBench only measured `xhigh` and `max`. So the number for how we actually run it is **unmeasured**. Even the `xhigh` score sits far above the old Haiku's estimate.

### Decision

Haiku tier `claude-haiku-4-5-20251001` → **`claude-haiku-5-5`**. The swap affects the five agents that use Haiku: `bkit-design-summary`, `bkit-plan-summary`, `bkit-build-summary`, `bkit-debug-summary`, `bkit-ship-summary`. They stay at `effort: low`. No other column moves.

**The haiku quality target stays at ~35 for now.** In principle the target is the score of the Claude model we pin. But Haiku 5.5's score at `low` hasn't been measured, and raising the target to 51.4 (its `xhigh` score) would push `deepseek-v4-flash` (37.6) below the bar on both opencode gateways. Revisit once a `low` measurement exists. This is a judgement call and is written down as one in both files.

### Files (staged, not committed)

- `.bkit/prompts/bkit-{design,plan,build,debug,ship}-summary.md` — the `model:` line.
- `.claude/agents/bkit-{design,plan,build,debug,ship}-summary.md` — the same line, edited by hand. No full `bkit install` was run because another session was editing the same clone at the time. The other agent copies (Cursor, Codex, OpenCode) don't use the Claude ID for these agents, so they don't change.
- `.bkit/prompts.md` — `low` row of the effort map, § Models (5 rows), context-window note, tier-target paragraph, live-verification stamp (Claude → 2026-10-09), Cursor override table.
- `.bkit/providers.md` — Claude pin note with the new price, board rows for Haiku 5.5, and the Claude row in the tier lineup.

Gates: `bkit-models-table-parity.test.ts` 4 passed, every test file that mentions Haiku passes (210 tests), and `prettier --check` is clean.

### Found along the way — not actioned

The same CSV now scores **Opus 5.5 and Sonnet 5.5**. Both `prompts.md` and `providers.md` still say "5.5 is not on that CSV", which is now false:

| Model                       | Mean     | JS   | TS   | PY   | $/task | vs the 5.0 target                                |
| --------------------------- | -------- | ---- | ---- | ---- | ------ | ------------------------------------------------ |
| `claude-opus-5-5` (max)     | 71.7     | 81.8 | 63.3 | 70.0 | $4.48  | +6.5 over Opus 5 (65.2)                          |
| `claude-opus-5-5` (xhigh)   | 65.4     | 72.7 | 53.3 | 70.0 | $1.40  | level with Opus 5 at about a quarter of the cost |
| `claude-sonnet-5-5` (max)   | 56.3     | 77.3 | 56.7 | 35.0 | $5.57  | −3.1 under Sonnet 5 (59.4)                       |
| `claude-sonnet-5-5` (xhigh) | **39.3** | 36.4 | 46.7 | 35.0 | $0.50  | **−20.1 under Sonnet 5**                         |

For comparison, `claude-sonnet-5` (xhigh) is JS 68.2 / TS 50.0 / PY 60.0.

**Sonnet 5.5 at `xhigh` scores 20 points below the Sonnet 5 it replaced**, and below Haiku 5.5 at `xhigh` (51.4). JavaScript drops 31.8 points and Python 25. TypeScript drops less (50.0 → 46.7, one question at n=30). This needs its own review before anyone trusts the 2026-10-06 Sonnet pin. The open questions: are the scores real (one run, 72 questions), and should medium-effort agents stay on `claude-sonnet-5-5`, go back to `claude-sonnet-5`, or move elsewhere? Not decided here.

Both reports are in. Before I lean on them I'm checking the three claims that carry the decision myself.

**The Sonnet scare is mostly a measurement problem, so don't switch back to Sonnet 5.** But your instinct about effort is right. At `medium`, Sonnet 5.5 is the weak spot in the line-up. Raising Haiku's effort is cheap and worth doing. I checked the three claims the decision rests on myself; the rest comes from the two helpers.

## Sonnet 5.5

**Why LiveBench showed a drop.** Anthropic changed what each effort level means on Sonnet 5.5. Their docs say: "An effort level doesn't produce the same amount of thinking as it did on Claude Sonnet 5." LiveBench ran it at `xhigh` as if nothing had changed. I checked the token counts in their cost file: Sonnet 5.5 at `xhigh` wrote about half as much as Sonnet 5 at `xhigh` (JS 12,038 vs 24,398; TS 25,942 vs 50,362). So it gave up sooner, not got dumber. At `max` it ties Sonnet 5.

**Every other board shows a big gain.** CursorBench 4.0 is Cursor's own coding benchmark. I checked it directly, and it measures every effort level:

| Effort   | Sonnet 5      | Sonnet 5.5                              | Opus 5.5          |
| -------- | ------------- | --------------------------------------- | ----------------- |
| `low`    | 24.1% · $1.39 | 35.8% · $0.37                           | 43.7% · $1.17     |
| `medium` | 28.0% · $2.31 | **39.2% · $0.52** ← our 14 agents today | **52.5% · $2.91** |
| `high`   | 30.8% · $3.48 | **47.8% · $1.20**                       | 56.0% · $3.97     |
| `xhigh`  | 32.0% · $4.55 | 53.1% · $2.81                           | 56.0% · $6.98     |

Anthropic's own numbers (SWE-Bench Pro 81.3 vs 63.2) and Artificial Analysis point the same way. Sonnet 5.5 beats Sonnet 5 at every level, and costs less.

**On your Opus idea:**

- **Opus 5.5 at `low` isn't worth it.** It costs the same as Sonnet 5.5 at `high` ($1.17 vs $1.20) and scores lower (43.7 vs 47.8).
- **Opus 5.5 at `medium` is the quality option.** It scores 52.5, about 5 points above Sonnet at `high`, for about 2.4 times the cost. On your subscription that cost shows up as usage limits rather than dollars.
- **My pick: keep Sonnet 5.5 and raise the code-writing agents to `high`.** Anthropic's guidance says the same: `medium` for well-specified agentic tasks, `high` for harder or longer ones. Those agents are `bkit-build-plan-execute`, `bkit-build-plan-gaps-remediate`, `bkit-build-challenge-remediate`, `bkit-build-challenge-tests`, `bkit-debug-failure-remediate` and `bkit-ship-conflict-resolve`. The light ones stay at `medium`: `compress-markdown`, `complexity-check`, `abort-handover`, `install-skills` and so on.

**One real behaviour change to watch.** Sonnet 5.5 seems more likely to stop and ask the user whether to carry on. Our agents run with nobody watching, so a stop like that is a failed step. The evidence is one verified Hacker News report plus the low token counts above. I'd watch the next few `/build` runs for it.

## Haiku effort

You're right. CursorBench measures Haiku 5.5 at every level too:

| Effort   | Score | Cost per task |
| -------- | ----- | ------------- |
| `low`    | 30.9% | $0.08         |
| `medium` | 36.9% | $0.17         |
| `high`   | 42.3% | $0.32         |
| `xhigh`  | 44.3% | $0.56         |

`high` is where the gains level off: +11 points over `low` for pennies. After that it's +2 points for nearly double the cost. These agents also decide the PASS / CONCERNS / FAIL verdict that gates each phase, so they do more than summarise. **I'd move all five to `high`.**

A side benefit: every non-Claude score on the board was measured with heavy thinking. Running the summary writers at `high`, which means maximum thinking on OpenCode, finally makes those scores match how we actually run them. The quality bar then honestly becomes about 51 (Haiku 5.5's `xhigh` score). Better matches than `deepseek-v4-flash` exist on every column, and the Ollama change is needed anyway:

| Column       | Now                            | Proposed                                                                                                |
| ------------ | ------------------------------ | ------------------------------------------------------------------------------------------------------- |
| OpenRouter   | `z-ai/glm-5.3-flash` 56.8      | keep                                                                                                    |
| Ollama       | `deepseek-v4-pro` 42.6         | `deepseek-v4.1-flash` 77.3 · $0.06. The current pin has quietly dropped out of Ollama's model list.     |
| OpenCode Zen | `deepseek-v4-flash` 37.6       | `glm-5.3-flash` 56.8 · $0.11                                                                            |
| OpenCode Go  | `deepseek-v4-flash` 37.6       | `deepseek-v4.1-flash` 77.3 · $0.06                                                                      |
| Codex        | `gpt-5.6-luna` 48.4            | `gpt-6-luna` 51.2 · $0.03, better and cheaper                                                           |
| Cursor       | `composer-2.5`, never measured | keep for now. The only measured first-party option is `cursor-grok-4.5-high` at about 8 times the cost. |

**What I couldn't verify.** None of the new non-Claude picks could be test-called:

- Ollama needs a paid plan.
- The OpenCode Zen account has a zero balance.
- There's no OpenCode Go subscription, and no OpenAI key.

So those picks are confirmed to exist in each catalog, but untested. Every DeepSeek model on OpenCode Go also needs the workspace privacy setting switched to "Global regions". Separately, the docs say OpenCode Go carries no gpt or claude models, and that is no longer true.

## Your call

1. **Sonnet tier:** keep Sonnet 5.5 and raise the six code-writing agents to `high` (my pick), or move them to Opus 5.5 at `medium`?
2. **Haiku tier:** raise all five summary agents to `high`, set the quality bar to about 51, and apply the provider changes above?
3. Shall I record all of this on #205? Either way, the docs' "5.5 is not on that CSV" line needs fixing in both files.

I'll make the edits once you choose, and stage only my files again.

Sources:

- [CursorBench 4.0](https://cursor.com/cursorbench)
- [What's new in Claude Sonnet 5.5](https://platform.claude.com/docs/en/models/sonnet-5-5/whats-new-sonnet-5-5)
- [Sonnet 5.5 system card](https://www.anthropic.com/claude-sonnet-5-5-system-card)
- [Artificial Analysis, Sonnet 5.5 vs Sonnet 5](https://artificialanalysis.ai/models/comparisons/claude-sonnet-5-5-vs-claude-sonnet-5-high)
- [Hacker News report of Sonnet 5.5 stopping to ask](https://news.ycombinator.com/item?id=49882880)
- [LiveBench PR #59](https://github.com/LiveBench/new-livebench/pull/59) and [PR #60](https://github.com/LiveBench/new-livebench/pull/60)

Nothing new here: the Sonnet research already arrived and is in my last message. The three choices there are still open.

## Effort raised, haiku cells re-pinned, Sonnet 5.5 cleared — 2026-10-09

Follow-up to [the Haiku 5.5 comment above](https://github.com/cbartens/bkit/issues/205#issuecomment-6073571181). Three changes: two effort raises, and new haiku-tier pins on the other providers. Staged, not committed.

### 1. Sonnet 5.5: the LiveBench drop is not real. Keep it, and raise the code writers to `high`

The comment above flagged `claude-sonnet-5-5` at `xhigh` scoring **39.3** on LiveBench Agentic Coding, against `claude-sonnet-5`'s 59.4. Looking closer, that number doesn't hold up:

- **Anthropic recalibrated effort on 5.5.** [What's new in Sonnet 5.5](https://platform.claude.com/docs/en/models/sonnet-5-5/whats-new-sonnet-5-5): "An effort level doesn't produce the same amount of thinking as it did on Claude Sonnet 5. Re-run your effort sweep rather than carrying a setting over." LiveBench carried `xhigh` straight over.
- **The run quit early.** LiveBench's own cost file shows Sonnet 5.5 at `xhigh` writing about half Sonnet 5's output tokens on the same tasks: JS 12,038 vs 24,398, TS 25,942 vs 50,362, PY 9,648 vs 19,749. At `max` it scores 56.3, essentially level with Sonnet 5.
- **Every other board shows a large gain.** [CursorBench 4.0](https://cursor.com/cursorbench) (updated 2026-10-07) measures every effort level:

| Effort   | `claude-sonnet-5` | `claude-sonnet-5-5` | `claude-opus-5-5` |
| -------- | ----------------- | ------------------- | ----------------- |
| `low`    | 24.1% · $1.39     | 35.8% · $0.37       | 43.7% · $1.17     |
| `medium` | 28.0% · $2.31     | 39.2% · $0.52       | 52.5% · $2.91     |
| `high`   | 30.8% · $3.48     | **47.8% · $1.20**   | 56.0% · $3.97     |
| `xhigh`  | 32.0% · $4.55     | 53.1% · $2.81       | 56.0% · $6.98     |

Anthropic's own [system card](https://www.anthropic.com/claude-sonnet-5-5-system-card) (SWE-Bench Pro 81.3 vs 63.2) and [Artificial Analysis](https://artificialanalysis.ai/models/comparisons/claude-sonnet-5-5-vs-claude-sonnet-5-high) agree. Sonnet 5.5 beats Sonnet 5 at every effort level and costs less.

**Options considered:**

- Opus 5.5 at `low` costs the same as Sonnet 5.5 at `high` but scores lower (43.7 vs 47.8), so it's rejected.
- Opus 5.5 at `medium` (52.5, $2.91) is about 5 points better than Sonnet 5.5 at `high`, for about 2.4 times the cost.

**Decision:** keep `claude-sonnet-5-5`, and raise the source modifiers with test loops from `medium` to `high`:

- `bkit-build-plan-execute`
- `bkit-build-plan-gaps-remediate`
- `bkit-build-challenge-remediate`
- `bkit-build-challenge-tests`
- `bkit-debug-failure-remediate`
- `bkit-ship-conflict-resolve`

This follows Anthropic's own guidance: `medium` for well-specified agentic tasks, `high` for harder or longer ones. The other 8 Sonnet agents stay at `medium`.

**One behaviour change to watch.** Sonnet 5.5 seems more willing to stop and ask the user whether to continue. There's one verified report ([HN](https://news.ycombinator.com/item?id=49882880)), plus the low token counts above. bkit agents run unattended, so a stop like that counts as a failed step. Watch the next few `/build` runs.

### 2. Haiku tier: summary writers move from `low` to `high`

CursorBench measures `claude-haiku-5-5` at every effort: `low` 30.9% · $0.08, `medium` 36.9% · $0.17, **`high` 42.3% · $0.32**, `xhigh` 44.3% · $0.56. `high` is where the gains level off: +11.4 points for $0.24 per task, against +2.0 for the next step. These five agents also decide each phase's PASS / CONCERNS / FAIL verdict. So all five `*-summary` agents now run Haiku 5.5 at `high`.

**The haiku target moves from ~35 to ~51** (`claude-haiku-5-5` at `xhigh`, 51.4, the closest LiveBench rung to `high`). This also makes the comparison fair: every non-Claude score on the board was measured with heavy thinking, and the summary writers now run with heavy thinking too. On OpenCode, `effort: high` maps to `reasoningEffort: max`.

### 3. Haiku cells on the other providers

Scores are from LiveBench, pulled 2026-10-09. Slugs come from models.dev and Ollama's `/api/tags`.

| Column         | Was                             | Now                   | Score · $/task                                                                                       |
| -------------- | ------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------- |
| OpenRouter     | `z-ai/glm-5.3-flash`            | unchanged             | 56.8 · $0.11                                                                                         |
| Ollama         | `deepseek-v4-pro` (42.6)        | `deepseek-v4.1-flash` | 77.3 · $0.06                                                                                         |
| OpenCode Zen   | `deepseek-v4-flash` (37.6)      | `glm-5.3-flash`       | 56.8 · $0.11 (Zen bills V4.1 Flash at $0.30/$1.20, so GLM is cheaper there)                          |
| OpenCode Go    | `deepseek-v4-flash` (37.6)      | `deepseek-v4.1-flash` | 77.3 · $0.06                                                                                         |
| OpenAI (Codex) | `gpt-5.6-luna` (48.4)           | `gpt-6-luna`          | 51.2 · $0.03, better and cheaper                                                                     |
| Cursor         | `composer-2.5` (never measured) | unchanged             | the only measured first-party model above ~51 is `cursor-grok-4.5-high` (56.5), at about 8x the cost |

**Not verified:** none of the new cells could be test-called:

- Ollama needs a paid plan.
- The Zen balance is zero.
- There's no Go subscription, and no OpenAI key.

They are confirmed to exist in each catalog only, which our own rule says is not proof. Also, every DeepSeek model on OpenCode Go needs the workspace privacy setting switched to "Global regions".

### Docs corrected along the way

- "5.5 is not on that CSV" removed from `prompts.md` and `providers.md`. The board now carries the Opus 5.5 rows (`max` 71.7, `xhigh` 65.4), the Sonnet 5.5 rows (`max` 56.3, `xhigh` 39.3, marked as not read as a target, with the reason), Haiku 5.5, `gpt-6-luna` and `gpt-5.6-luna`.
- **The opus and sonnet targets stay at 65.2 and 59.4.** Opus 5.5 at `xhigh` lands level (65.4), and the Sonnet 5.5 rows don't read cleanly.
- OpenCode Go: "no `gemini-*`/`gpt-*`/`claude-*`" was out of date. Go now lists `gpt-6-luna`, `gpt-5.6-luna` and `claude-haiku-5-5`. It still has no `gemini-*`, and we still never pin Claude there.
- The effort docs now say outright that effort and model are set separately for each agent. The effort-to-model table is the default, not a rule. The field-rationale note named `bkit-build-challenge-2` as an Opus-at-`medium` agent; it runs at `high`. The two Opus-at-`medium` agents are `bkit-plan-review-2` and `bkit-plan-scope-check-1`.

### Approved sources

`providers.md` § Selecting pins → Sources:

- **Added CursorBench** (https://cursor.com/cursorbench). It is the only board that measures every effort level, which makes it the source for choosing an agent's `effort:`. Cursor's own `composer-*` rows count as vendor-only.
- **Added a URL for DeepSWE** (https://deepswe.datacurve.ai), which previously read "public DeepSWE listings".

**Allowed domains** (`.agents/context.md`):

- Added `datacurve.ai` (DeepSWE).
- `cursor.com` is **not** added. bkit already allows it through its built-in list (`.bkit/src/bkit-registry.ts`, the `agent-cursor` row covers `cursor.com` and its subdomains), and `context.md`'s own rule says not to list those hosts again.
- Every other source in the table is already covered:
  - `livebench.ai`, `artificialanalysis.ai`, `lmarena.ai`, `designarena.ai` are listed in `context.md`.
  - `openrouter.ai`, `ollama.com`, `opencode.ai`, `models.dev`, `anthropic.com`/`claude.com` and `githubusercontent.com` (the LiveBench CSVs) come from the built-in list.
  - `openai.com` is listed in `context.md`.

### Files (59, staged, not committed)

- `.bkit/prompts/` + `.claude/` + `.cursor/` + `.codex/` + `.opencode/` agent copies for the 11 agents. The copies were edited by hand because another session was using the clone. They were then checked byte for byte against a real `bkit install --claude --cursor --codex --opencode=openrouter` run in a throwaway copy: **44 of 44 identical**.
- `.bkit/prompts.md`: § Models (11 rows), effort map, effort tiers, field rationale, tier paragraph, OpenAI note, live-verification stamp.
- `.bkit/providers.md`: pin note, tier design, sources, board, lineup.
- `.bkit/src/bkit-install.test.ts`: Ollama / Zen / Go haiku expectations.
- `.agents/context.md`: `datacurve.ai`.

Gates: `bkit-models-table-parity.test.ts` + `bkit-install.test.ts` 214 passed; `prettier --check` clean.

### Open

- **The Ollama convergent cell (`deepseek-v4-pro`)** has left Ollama's advertised catalog but still resolves. Re-pin it before it stops working.
- **Two board costs have drifted** from LiveBench's current cost file: `gemini-3.7-flash` $0.42 → $0.83, `deepseek-v4-pro-0813` $0.22 → $0.084. Not changed here.
- **Smoke-test the new non-Claude haiku cells** once there's credit or a plan on each provider.

| Prompt                              | Anthropic           | Cursor                 | OpenRouter                     | Ollama                | OpenCode Zen      | OpenCode Go           | OpenAI          | Effort   | Max Turns | Role                                                                                                                                    |
| ----------------------------------- | ------------------- | ---------------------- | ------------------------------ | --------------------- | ----------------- | --------------------- | --------------- | -------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `bkit-design-brainstorm-ideate-1`   | `claude-opus-5-5`   | `cursor-grok-4.5-high` | `deepseek/deepseek-v4.1-flash` | `kimi-k2.7-code`      | `kimi-k2.7-code`  | `deepseek-v4-pro`     | `gpt-6-astra`   | `high`   | 100       | parallel slot 1 (pragmatic lens)                                                                                                        |
| `bkit-design-brainstorm-ideate-2`   | `claude-sonnet-5-5` | `composer-2.5`         | `deepseek/deepseek-v4.1-flash` | `kimi-k2.7-code`      | `kimi-k2.7-code`  | `deepseek-v4-pro`     | `gpt-5.6-terra` | `medium` | 100       | parallel slot 2 (optimal-tradeoff lens; Composer vs Grok siblings on Cursor; cross-tier on Claude)                                      |
| `bkit-design-brainstorm-ideate-3`   | `claude-opus-5-5`   | `cursor-grok-4.5-high` | `moonshotai/kimi-k3`           | `deepseek-v4-pro`     | `deepseek-v4-pro` | `deepseek-v4-pro`     | `gpt-6-astra`   | `high`   | 100       | parallel slot 3 (risk-premortem lens)                                                                                                   |
| `bkit-design-review-1`              | `claude-opus-5-5`   | `cursor-grok-4.5-high` | `deepseek/deepseek-v4.1-flash` | `kimi-k2.7-code`      | `kimi-k2.7-code`  | `deepseek-v4-pro`     | `gpt-6-astra`   | `high`   | 100       | design review slot 1 (web search + feasibility analysis)                                                                                |
| `bkit-design-review-2`              | `claude-sonnet-5-5` | `composer-2.5`         | `deepseek/deepseek-v4.1-flash` | `kimi-k2.7-code`      | `kimi-k2.7-code`  | `deepseek-v4-pro`     | `gpt-5.6-terra` | `medium` | 100       | design review slot 2 (Composer vs Grok sibling on Cursor; cross-tier on Claude)                                                         |
| `bkit-design-spike`                 | `claude-opus-5-5`   | `cursor-grok-4.5-high` | `deepseek/deepseek-v4.1-flash` | `kimi-k2.7-code`      | `kimi-k2.7-code`  | `deepseek-v4-pro`     | `gpt-6-astra`   | `high`   | 100       | settle review-named unknowns with throwaway probe code (conditional step)                                                               |
| `bkit-design-update`                | `claude-opus-5-5`   | `cursor-grok-4.5-high` | `deepseek/deepseek-v4.1-flash` | `kimi-k2.7-code`      | `kimi-k2.7-code`  | `deepseek-v4-pro`     | `gpt-6-astra`   | `xhigh`  | 100       | merge review critiques into design (whole-doc rewrite — needs depth)                                                                    |
| `bkit-design-organise`              | `claude-opus-5-5`   | `cursor-grok-4.5-high` | `deepseek/deepseek-v4.1-flash` | `kimi-k2.7-code`      | `kimi-k2.7-code`  | `deepseek-v4-pro`     | `gpt-6-astra`   | `high`   | 100       | decompose reviewed design into dependency-annotated workstreams; coverage self-verify + DAG cycle detection                             |
| `bkit-design-summary`               | `claude-haiku-5-5`  | `composer-2.5`         | `z-ai/glm-5.3-flash`           | `deepseek-v4.1-flash` | `glm-5.3-flash`   | `deepseek-v4.1-flash` | `gpt-6-luna`    | `high`   | 50        | summary writer                                                                                                                          |
| `bkit-design-generate`              | `claude-opus-5-5`   | `cursor-grok-4.5-high` | `deepseek/deepseek-v4.1-flash` | `kimi-k2.7-code`      | `kimi-k2.7-code`  | `deepseek-v4-pro`     | `gpt-6-astra`   | `xhigh`  | 100       | generate design from brainstorms (top-of-pipeline synthesizer; whole-doc rewrite)                                                       |
| `bkit-plan-complexity-check`        | `claude-sonnet-5-5` | `composer-2.5`         | `deepseek/deepseek-v4.1-flash` | `kimi-k2.7-code`      | `kimi-k2.7-code`  | `deepseek-v4-pro`     | `gpt-5.6-terra` | `medium` | 50        | complexity check                                                                                                                        |
| `bkit-plan-generate`                | `claude-opus-5-5`   | `cursor-grok-4.5-high` | `deepseek/deepseek-v4.1-flash` | `kimi-k2.7-code`      | `kimi-k2.7-code`  | `deepseek-v4-pro`     | `gpt-6-astra`   | `xhigh`  | 100       | plan draft generator (top-of-pipeline synthesizer)                                                                                      |
| `bkit-audit-generate`               | `claude-opus-5-5`   | `cursor-grok-4.5-high` | `deepseek/deepseek-v4.1-flash` | `kimi-k2.7-code`      | `kimi-k2.7-code`  | `deepseek-v4-pro`     | `gpt-6-astra`   | `xhigh`  | 150       | audit report from one template (top-of-pipeline synthesizer)                                                                            |
| `bkit-plan-review-1`                | `claude-opus-5-5`   | `cursor-grok-4.5-high` | `deepseek/deepseek-v4.1-flash` | `kimi-k2.7-code`      | `kimi-k2.7-code`  | `deepseek-v4-pro`     | `gpt-6-astra`   | `high`   | 100       | review slot 1 (tightness + design-coverage)                                                                                             |
| `bkit-plan-review-2`                | `claude-opus-5-5`   | `cursor-grok-4.5-high` | `deepseek/deepseek-v4.1-flash` | `kimi-k2.7-code`      | `kimi-k2.7-code`  | `deepseek-v4-pro`     | `gpt-6-astra`   | `medium` | 100       | review slot 2 (dependency-correctness + design-coverage; depth-sensitive lens — both opus)                                              |
| `bkit-plan-review-3`                | `claude-opus-5-5`   | `cursor-grok-4.5-high` | `moonshotai/kimi-k3`           | `deepseek-v4-pro`     | `deepseek-v4-pro` | `deepseek-v4-pro`     | `gpt-6-astra`   | `high`   | 100       | review slot 3 (regression-risk + design-coverage)                                                                                       |
| `bkit-plan-scope-check-1`           | `claude-opus-5-5`   | `cursor-grok-4.5-high` | `deepseek/deepseek-v4.1-flash` | `kimi-k2.7-code`      | `kimi-k2.7-code`  | `deepseek-v4-pro`     | `gpt-6-astra`   | `medium` | 50        | scope audit slot 1 (mechanical audit — medium effort)                                                                                   |
| `bkit-plan-scope-check-2`           | `claude-sonnet-5-5` | `composer-2.5`         | `deepseek/deepseek-v4.1-flash` | `kimi-k2.7-code`      | `kimi-k2.7-code`  | `deepseek-v4-pro`     | `gpt-5.6-terra` | `medium` | 50        | scope audit slot 2 (Composer vs Grok sibling on Cursor)                                                                                 |
| `bkit-plan-complexity-split`        | `claude-opus-5-5`   | `cursor-grok-4.5-high` | `deepseek/deepseek-v4.1-flash` | `kimi-k2.7-code`      | `kimi-k2.7-code`  | `deepseek-v4-pro`     | `gpt-6-astra`   | `high`   | 100       | split large plan                                                                                                                        |
| `bkit-plan-summary`                 | `claude-haiku-5-5`  | `composer-2.5`         | `z-ai/glm-5.3-flash`           | `deepseek-v4.1-flash` | `glm-5.3-flash`   | `deepseek-v4.1-flash` | `gpt-6-luna`    | `high`   | 50        | summary writer                                                                                                                          |
| `bkit-plan-update`                  | `claude-opus-5-5`   | `cursor-grok-4.5-high` | `deepseek/deepseek-v4.1-flash` | `kimi-k2.7-code`      | `kimi-k2.7-code`  | `deepseek-v4-pro`     | `gpt-6-astra`   | `xhigh`  | 100       | merge review + scope critiques into plan (whole-doc rewrite — needs depth)                                                              |
| `bkit-build-install-skills`         | `claude-sonnet-5-5` | `composer-2.5`         | `deepseek/deepseek-v4.1-flash` | `kimi-k2.7-code`      | `kimi-k2.7-code`  | `deepseek-v4-pro`     | `gpt-5.6-terra` | `medium` | 50        | skill identifier                                                                                                                        |
| `bkit-build-challenge-1`            | `claude-opus-5-5`   | `cursor-grok-4.5-high` | `deepseek/deepseek-v4.1-flash` | `kimi-k2.7-code`      | `kimi-k2.7-code`  | `deepseek-v4-pro`     | `gpt-6-astra`   | `high`   | 100       | parallel slot 1 (bug-hunting lens)                                                                                                      |
| `bkit-build-challenge-2`            | `claude-opus-5-5`   | `cursor-grok-4.5-high` | `moonshotai/kimi-k3`           | `deepseek-v4-pro`     | `deepseek-v4-pro` | `deepseek-v4-pro`     | `gpt-6-astra`   | `high`   | 100       | parallel slot 2 (security lens; depth-sensitive — both opus)                                                                            |
| `bkit-build-challenge-reconcile`    | `claude-opus-5-5`   | `cursor-grok-4.5-high` | `deepseek/deepseek-v4.1-flash` | `kimi-k2.7-code`      | `kimi-k2.7-code`  | `deepseek-v4-pro`     | `gpt-6-astra`   | `xhigh`  | 100       | merge parallel challenge findings (whole-doc rewrite)                                                                                   |
| `bkit-build-challenge-tests`        | `claude-sonnet-5-5` | `composer-2.5`         | `deepseek/deepseek-v4.1-flash` | `kimi-k2.7-code`      | `kimi-k2.7-code`  | `deepseek-v4-pro`     | `gpt-5.6-terra` | `high`   | 100       | test generator (source modifier, no test loop)                                                                                          |
| `bkit-build-plan-execute`           | `claude-sonnet-5-5` | `composer-2.5`         | `deepseek/deepseek-v4.1-flash` | `kimi-k2.7-code`      | `kimi-k2.7-code`  | `deepseek-v4-pro`     | `gpt-5.6-terra` | `high`   | 150       | task executor (source modifier with test loop; ceiling — split if exceeded)                                                             |
| `bkit-build-challenge-remediate`    | `claude-sonnet-5-5` | `composer-2.5`         | `deepseek/deepseek-v4.1-flash` | `kimi-k2.7-code`      | `kimi-k2.7-code`  | `deepseek-v4-pro`     | `gpt-5.6-terra` | `high`   | 150       | fix challenge findings (source modifier with test loop)                                                                                 |
| `bkit-build-plan-gaps-remediate`    | `claude-sonnet-5-5` | `composer-2.5`         | `deepseek/deepseek-v4.1-flash` | `kimi-k2.7-code`      | `kimi-k2.7-code`  | `deepseek-v4-pro`     | `gpt-5.6-terra` | `high`   | 150       | fix verification gaps (source modifier with test loop)                                                                                  |
| `bkit-build-summary`                | `claude-haiku-5-5`  | `composer-2.5`         | `z-ai/glm-5.3-flash`           | `deepseek-v4.1-flash` | `glm-5.3-flash`   | `deepseek-v4.1-flash` | `gpt-6-luna`    | `high`   | 50        | summary writer                                                                                                                          |
| `bkit-build-plan-verify`            | `claude-opus-5-5`   | `cursor-grok-4.5-high` | `deepseek/deepseek-v4.1-flash` | `kimi-k2.7-code`      | `kimi-k2.7-code`  | `deepseek-v4-pro`     | `gpt-6-astra`   | `high`   | 100       | verify impl vs plan                                                                                                                     |
| `bkit-build-plan-current`           | `claude-opus-5-5`   | `cursor-grok-4.5-high` | `deepseek/deepseek-v4.1-flash` | `kimi-k2.7-code`      | `kimi-k2.7-code`  | `deepseek-v4-pro`     | `gpt-6-astra`   | `high`   | 100       | judge plan vs changes landed since its base commit                                                                                      |
| `bkit-debug-abort-handover`         | `claude-sonnet-5-5` | `composer-2.5`         | `deepseek/deepseek-v4.1-flash` | `kimi-k2.7-code`      | `kimi-k2.7-code`  | `deepseek-v4-pro`     | `gpt-5.6-terra` | `medium` | 50        | handover writer                                                                                                                         |
| `bkit-debug-failure-diagnose`       | `claude-opus-5-5`   | `cursor-grok-4.5-high` | `moonshotai/kimi-k3`           | `deepseek-v4-pro`     | `deepseek-v4-pro` | `deepseek-v4-pro`     | `gpt-6-astra`   | `xhigh`  | 100       | failure diagnosis (Final-strategy attempts especially benefit from depth before human handover)                                         |
| `bkit-debug-failure-remediate`      | `claude-sonnet-5-5` | `composer-2.5`         | `deepseek/deepseek-v4.1-flash` | `kimi-k2.7-code`      | `kimi-k2.7-code`  | `deepseek-v4-pro`     | `gpt-5.6-terra` | `high`   | 150       | implement diagnosis fixes (source modifier with test loop)                                                                              |
| `bkit-debug-failure-soak`           | `claude-opus-5-5`   | `cursor-grok-4.5-high` | `moonshotai/kimi-k3`           | `deepseek-v4-pro`     | `deepseek-v4-pro` | `deepseek-v4-pro`     | `gpt-6-astra`   | `xhigh`  | 150       | soak fix — one accumulating-context instrument-or-fix step per iteration against the live boundary (orchestrator re-runs tests + loops) |
| `bkit-debug-summary`                | `claude-haiku-5-5`  | `composer-2.5`         | `z-ai/glm-5.3-flash`           | `deepseek-v4.1-flash` | `glm-5.3-flash`   | `deepseek-v4.1-flash` | `gpt-6-luna`    | `high`   | 50        | summary writer                                                                                                                          |
| `bkit-ship-summary`                 | `claude-haiku-5-5`  | `composer-2.5`         | `z-ai/glm-5.3-flash`           | `deepseek-v4.1-flash` | `glm-5.3-flash`   | `deepseek-v4.1-flash` | `gpt-6-luna`    | `high`   | 50        | summary writer                                                                                                                          |
| `bkit-ship-update-docs`             | `claude-opus-5-5`   | `cursor-grok-4.5-high` | `deepseek/deepseek-v4.1-flash` | `kimi-k2.7-code`      | `kimi-k2.7-code`  | `deepseek-v4-pro`     | `gpt-6-astra`   | `high`   | 100       | sync cataloged docs (multi-doc writer)                                                                                                  |
| `bkit-ship-conflict-resolve`        | `claude-sonnet-5-5` | `composer-2.5`         | `deepseek/deepseek-v4.1-flash` | `kimi-k2.7-code`      | `kimi-k2.7-code`  | `deepseek-v4-pro`     | `gpt-5.6-terra` | `high`   | 150       | mechanical rebase-conflict resolver (source modifier with test loop)                                                                    |
| `bkit-ship-deferred-sweep`          | `claude-opus-5-5`   | `cursor-grok-4.5-high` | `deepseek/deepseek-v4.1-flash` | `kimi-k2.7-code`      | `kimi-k2.7-code`  | `deepseek-v4-pro`     | `gpt-6-astra`   | `high`   | 100       | pre-merge completeness gate — intended-vs-actual + declared-deferral resurface                                                          |
| `bkit-utility-update-deferrals`     | `claude-opus-5-5`   | `cursor-grok-4.5-high` | `deepseek/deepseek-v4.1-flash` | `kimi-k2.7-code`      | `kimi-k2.7-code`  | `deepseek-v4-pro`     | `gpt-6-astra`   | `high`   | 100       | deferrals update                                                                                                                        |
| `bkit-utility-update-failures`      | `claude-opus-5-5`   | `cursor-grok-4.5-high` | `deepseek/deepseek-v4.1-flash` | `kimi-k2.7-code`      | `kimi-k2.7-code`  | `deepseek-v4-pro`     | `gpt-6-astra`   | `high`   | 100       | failures update                                                                                                                         |
| `bkit-utility-update-decisions`     | `claude-opus-5-5`   | `cursor-grok-4.5-high` | `deepseek/deepseek-v4.1-flash` | `kimi-k2.7-code`      | `kimi-k2.7-code`  | `deepseek-v4-pro`     | `gpt-6-astra`   | `high`   | 100       | decisions update                                                                                                                        |
| `bkit-utility-update-knowledge`     | `claude-opus-5-5`   | `cursor-grok-4.5-high` | `deepseek/deepseek-v4.1-flash` | `kimi-k2.7-code`      | `kimi-k2.7-code`  | `deepseek-v4-pro`     | `gpt-6-astra`   | `high`   | 100       | knowledge update                                                                                                                        |
| `bkit-utility-update-roadmap`       | `claude-opus-5-5`   | `cursor-grok-4.5-high` | `deepseek/deepseek-v4.1-flash` | `kimi-k2.7-code`      | `kimi-k2.7-code`  | `deepseek-v4-pro`     | `gpt-6-astra`   | `high`   | 100       | roadmap analysis                                                                                                                        |
| `bkit-utility-compress-markdown`    | `claude-sonnet-5-5` | `composer-2.5`         | `deepseek/deepseek-v4.1-flash` | `kimi-k2.7-code`      | `kimi-k2.7-code`  | `deepseek-v4-pro`     | `gpt-5.6-terra` | `medium` | 100       | token-optimize markdown                                                                                                                 |
| `bkit-utility-update-documentation` | `claude-sonnet-5-5` | `composer-2.5`         | `deepseek/deepseek-v4.1-flash` | `kimi-k2.7-code`      | `kimi-k2.7-code`  | `deepseek-v4-pro`     | `gpt-5.6-terra` | `medium` | 100       | doc sync (multi-doc writer)                                                                                                             |

LiveBench is not the only valid benchmark, but OpenRouter volume is a trap, and blending DeepSWE requires looking at how models actually solve tasks.
Here is the breakdown:

1. The premise that LiveBench is updated infrequently is wrong
   It looks stale because the CSV URL has table_2026_06_25.csv in its name, but the LiveBench team continuously appends new models to that existing file without bumping the date in the filename (.bkit/providers.md:451). gemini-3.8-flash is already in that file.
2. OpenRouter volume is deliberately banned (.bkit/providers.md:445)
   OpenRouter volume measures what casual users and bots do: cheap translation, discord bots, and roleplay chat. A model can be #1 on OpenRouter because it costs $0.05 for customer-service replies, while being completely incapable of editing code without deleting imports. Volume tells us nothing about agentic reliability.
3. DeepSWE is already an approved Priority 1 source (.bkit/providers.md:434)
   DeepSWE (a benchmark that tests agents solving real GitHub issues across 91 repositories) is already in bkit's evaluation criteria. However, you have to look at how gemini-3.8-flash achieved its 74% score:

- It took 166 steps on average (compared to 29 steps for gpt-6-astra and 99 for claude-opus-5).
- It produced 143k output tokens per task, costing $2.36.
- In bkit, most reviewer and planner agents have a hard turn cap (maxTurns: 100 or 50). A model that requires 160+ turns to converge will hit runaway-loop limits and fail.

4. What a mixed score would change
   If we blended DeepSWE and LiveBench into a composite score:

- gemini-3.8-flash would look competitive on repo search persistence.
- But on language syntax precision, its TypeScript score is 40.0 on LiveBench (bkit's own codebase is TypeScript).
- And economically, it costs 40x more than deepseek/deepseek-v4.1-flash ($2.36 vs $0.06) while demanding far more turns.
  A composite score makes sense for ranking frontier models in general, but for bkit's specific harness (strict turn limits, TypeScript-heavy codebase, and budget-conscious fallbacks), LiveBench Agentic Coding remains the primary filter because it tests raw tool and code syntax execution without letting a model brute-force 160 retries.

You are half right.
Where you are right:
Having deepseek/deepseek-v4.1-flash run both sides of a review creates a blind spot. For example:

- bkit-design-brainstorm-ideate-1 and -2 both use it.
- bkit-build-challenge-1 (the bug finder) and bkit-build-challenge-reconcile (the judge that merges findings) both use it.
  If DeepSeek misinterprets a pattern or hallucinates an API, the reconciler has the exact same training biases and won't catch it.
  Where the premise doesn't quite hold:

1. OpenRouter is not 100% DeepSeek today. bkit already uses three distinct model families on OpenRouter:

- Moonshot / Kimi (moonshotai/kimi-k3) is pinned for the convergent and adversarial roles: bkit-design-brainstorm-ideate-3 (pre-mortem), bkit-plan-review-3 (regression risk), bkit-build-challenge-2 (security), and bkit-debug-failure-diagnose.
- Z.AI / GLM (z-ai/glm-5.3-flash) is pinned for all five *-summary agents.
- DeepSeek (deepseek/deepseek-v4.1-flash) handles the primary coding and synthesis steps.

2. Infrastructure resilience is already high. On OpenRouter, deepseek/deepseek-v4.1-flash is served across 16+ independent host providers, so an outage at DeepSeek official doesn't bring the pipeline down.
   Why gemini-3.8-flash cannot be the diversity pin:
   To break the monoculture in slot 2, a candidate model must still clear the quality bar (.bkit/providers.md:413).
   gemini-3.8-flash fails that gate on LiveBench Agentic Coding:

- It scores 54.2 overall (40.0 on TypeScript, 50.0 on Python).
- That sits well below both the Sonnet target (59.4) and the Opus target (65.2), while deepseek/deepseek-v4.1-flash scores 77.3.
- It costs ~$2.36/task versus $0.06/task for DeepSeek.
  Putting Gemini 3.8 Flash into slot 2 would buy architectural diversity, but at the cost of significantly weaker code review and 40x higher spend.

## #377 — Self-hosted LLMs vs API: performance and cost analysis (OPEN)

## Question

Would it make sense to spin up large Depot runners, install ollama + large open-weight models, and run inference locally on the runner instead of making API calls? How does runner cost compare to API cost per month?

Related: #364 (provider cost analysis for Claude Code usage).

## Verdict: **No — dominated on every axis.**

Self-hosting on ephemeral CI runners is the most expensive, slowest, most ops-heavy way to solve a problem #364 already solves three better ways over. The one scenario where local compute wins (a dedicated **always-on, batched** vLLM server kept ~100% saturated) is neither "spin up a runner per job" nor compatible with bkit's parallel-subagent fan-out.

## Three structural killers

1. **You need a GPU; big CPU runners don't count.** Depot's large runners are CPU (up to 64 vCPU @ **$0.128/min = $7.68/hr**). A 70B on CPU runs ~1–4 tok/s — unusable — and that runner already costs _more per hour than an H100_. Real GPU inference needs Depot **GPU runners = Business-plan-only, custom (non-public) pricing**. RunPod floor reference: **H100 ≈ $2.89/hr, A100 ≈ $1.39/hr**.
2. **Cold start dominates bursty jobs.** Every ephemeral runner re-pulls/loads the model. A 70B Q4 is ~40 GB → ~30–90s of paid GPU time per job before the first token.
3. **No batching = terrible cost/token.** API providers batch dozens of concurrent requests (~1,200 tok/s aggregate on an H100). Ollama on a runner serves **one stream** at ~30–40 tok/s for a 70B — you rent the whole GPU to use a fraction of it.

## The decisive killer: cache-read economics (see #364)

Per #364, **~88% of our ~292M tokens/month are cache reads.** On the API those bill at ~10% of input rate — that's _why_ Max 20x returns ~2.4× its price in Opus-equivalent tokens.

Self-hosted ephemeral runners get **none of that**:

- No persistent server holds the KV state across turns / across fanned-out subagents. Each call re-prefills its full context from scratch.
- So the **257M "cheap" cache-read tokens become 257M tokens of real GPU prefill compute** — the exact thing we pay 10% for on API, we'd pay 100% of the compute for locally.

Self-hosting throws away the one mechanism that makes the current bill a bargain.

## Numbers against the real #364 profile (292M tok/mo: 7.3M out, 4.4M fresh in, 23M cache-write, 257M cache-read)

Single H100, 70B-class model, single-stream:

| Component                                                                  | Estimate                                                    |
| -------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Prefill 285M tokens @ ~8k tok/s (optimistic)                               | ~10 GPU-hrs                                                 |
| Decode 7.3M output @ ~35 tok/s single-stream                               | ~58 GPU-hrs                                                 |
| **Compute floor @ $2.89/hr**                                               | **~$196/mo — assumes 100% util, zero cold start (fantasy)** |
| Realistic (30% util: cold starts, idle between tool calls, bursty fan-out) | **~$550–700/mo (~AUD $850–1,100)**                          |

…for a model at index ~51 (GLM-5.2) vs Opus at 56, running **slower** than the already-hosted version, plus Business-plan Depot GPU + ollama ops we own.

## It loses to every overflow option in #364

The real problem (#364) is **quota timing** — the Monday-lunch wall — which needs a cheap, _instant_, always-available overflow valve. A cold-booting GPU runner is the worst possible one.

| Overflow option (#364)                                     | ~Cost                          | vs self-hosted runner                       |
| ---------------------------------------------------------- | ------------------------------ | ------------------------------------------- |
| Pin **Grok 4.5 in OpenCode Go** (index 54, 16s round-trip) | ~AUD $15                       | Better model, instant, ~$650 cheaper        |
| **GLM Coding Plan Pro** (GLM-5.2, index 51)                | ~AUD $80                       | Same-class model, hosted+batched, no ops    |
| **Codex CLI on API key**, tail only (Terra)                | ~AUD $116 for the 29% overflow | Frontier-ish, pay-per-use, zero idle cost   |
| **Self-hosted Depot GPU + ollama**                         | ~AUD $850–1,100                | Worse model, slower, cold starts, we run it |

## Recommendation

Drop the self-hosting idea. Follow #364: **pin Grok 4.5 in Go first** (free-ish, 5 min), add GLM Pro or a Codex-API-key overflow tier if the ceiling needs raising. Leave the GPUs to the API providers who can batch them.

## Sources

- [Depot pricing](https://depot.dev/pricing) · [Depot runners overview](https://depot.dev/docs/github-actions/overview)
- [RunPod GPU pricing](https://www.runpod.io/pricing) · [RunPod H100 pricing 2026](https://www.spheron.network/blog/runpod-h100-pricing-2026/)
- Volume/profile assumptions from #364 (verify actual split via `npx ccusage@latest`)

_Analysis by Claude; token/throughput figures are estimates — label as such._

## How prompt caching works, and why self-hosting can't capture it

Context for the cache-read killer above — this is the mechanism that makes the numbers land the way they do.

### The API is stateless; agentic tasks re-send context every turn

Claude has no memory between requests. Every turn, Claude Code re-sends the **entire** conversation so far — system prompt, CLAUDE.md, rules.md, tool schemas, every file read, every prior message and tool result. An agentic task is not one request; it's a loop of dozens:

```
Turn 1:  [system + rules + tools] + request              -> Read(fileA)
Turn 2:  [system + rules + tools + request + fileA]       -> Read(fileB)
Turn 3:  [ ...all above... + fileB]                       -> Edit
Turn 4:  [ ...all above... + edit result]                 -> ...
```

Each request's prompt is the previous request's prompt **plus a small suffix**. The first ~50K tokens of turn 4 are byte-for-byte identical to turn 3. **That identical prefix is what gets cached — across the turns of one session, not across issues.** Every issue can be 100% unique and the profile is still cache-dominated.

Prompt caching stores the model's computed KV state for that prefix server-side and, next turn, loads it instead of recomputing — billed at **~10% of input rate**. Only the new suffix pays full price.

### Longer threads => bigger savings (it compounds)

- **Without caching:** cost grows ~**quadratically** with thread length — turn N re-sends N units of context at full price; summed over every turn = ~N^2/2.
- **With caching:** the prefix rides at 10%, so cost grows closer to **linear**.

So the gap between the real bill and the no-cache bill widens the longer a session runs — in both absolute dollars and as a percentage. The 1d-23h sessions in the #364 stats are exactly where this pays off most. This is why ~88% of the 292M tokens/mo are cache reads despite no recurring jobs.

### Why self-hosting can't capture it

Not because the engines lack the feature — ollama/llama.cpp/vLLM **do** support prefix/KV caching **within one warm, persistent process serving a continuing conversation**. We can't capture it because:

1. **No persistent KV state across our workload.** Ephemeral CI runners + parallel subagent fan-out means each call is a cold context on a possibly-fresh runner. Nothing holds the KV state across turns or across fanned-out subagents, so each call re-prefills the full context from scratch.
2. **Local caching saves compute time, not billing.** Even where a warm local process reuses a prefix, you still pay for the GPU by wall-clock second regardless of cache hits. API caching is a direct 10%-billing discount; local "caching" only means slightly less GPU time on a meter that never stops.

Net: the 257M cache-read tokens that bill at 10% on the API become full-price GPU prefill compute when self-hosted. The longer/more-agentic the workload, the wider the API's advantage — which is the opposite of what you'd want from a cost-saving move.

_Verify the real split with `npx ccusage@latest`; 88% is an estimate of a typical heavy-agentic mix._

## Hardware, buy-vs-rent, and the Mac Studio option

Extends the analysis above: which open models come closest to Opus 4.8 (index 56), what it takes to run them, and whether owning hardware — server _or_ Mac Studio — beats renting or subscribing.

### Best open models vs Opus 4.8 (AA Intelligence Index from #364)

| Model                 | AA Index | Δ vs Opus | Size (total / active MoE)      | Weights                                               |
| --------------------- | -------- | --------- | ------------------------------ | ----------------------------------------------------- |
| **Kimi K3**           | 57       | +1        | 2.8T / ~50B active             | Open ~27 Jul 2026 (Modified MIT); API-only until then |
| **GLM-5.2**           | 51       | −5        | **744B / ~40B active**, 1M ctx | **MIT, on HF now (zai-org)**                          |
| DeepSeek V4 Pro       | 44       | −12       | 1.6T / 49B active              | MIT, on HF now                                        |
| Kimi K2.6 / K2.7 Code | 44 / 42  | −12 / −14 | ~1T / ~32B                     | Open now                                              |

- **Kimi K3** is the only open model that matches Opus — but 2.8T params = data-centre cluster, weights out ~27 Jul.
- **GLM-5.2** is the practical pick: best intelligence-per-param, smallest of the trio, MIT, downloadable now. ~5 index points under Opus; felt gap on agentic coding is bigger (weaker models need 1.3–2x more turns, per #364).

### Hardware required (VRAM ~= bytes/param x params + ~25–40% for KV/context)

| Model                  | Quant | Weights VRAM | Realistic rig                                                          |
| ---------------------- | ----- | ------------ | ---------------------------------------------------------------------- |
| **GLM-5.2 (744B)**     | Q4/Q5 | ~370–450 GB  | **1x 8-GPU H100 80GB node** (640 GB) — the only "single server" option |
| GLM-5.2                | FP8   | ~744 GB      | 1x 8-GPU H200 node (1.1 TB)                                            |
| DeepSeek V4 Pro (1.6T) | Q4    | ~800 GB      | 8x H200 or 16x H100                                                    |
| Kimi K3 (2.8T)         | Q4    | ~1.4 TB      | 16x H100 / ~12x H200 — multi-node cluster                              |

Everything that _matches_ Opus is multi-node. GLM-5.2 on one 8xH100 node is the only sane server target.

### Buy vs rent that hardware (2026 street prices)

|                               | 8x H100 node          | 8x H200 node         |
| ----------------------------- | --------------------- | -------------------- |
| Buy (HGX server)              | $250K–$320K (~$285K)  | $320K–$420K (~$370K) |
| + power/cooling/colo (~10 kW) | ~$1.5–3K/mo           | ~$2–3.5K/mo          |
| + depreciation (3-yr)         | ~$7.9K/mo             | ~$10K/mo             |
| + MLOps labour                | fractional FTE (real) | fractional FTE       |
| Rent 24/7 on-demand           | ~$16–36K/mo           | ~$15–26K/mo          |
| Rent 24/7 reserved (1–3yr)    | ~$8–14K/mo            | ~$12–18K/mo          |

**Business case = utilization.** An 8xH100 node running GLM-5.2 (vLLM, batched) does ~2,500 tok/s aggregate -> ~6.5B tokens/mo at 100% saturation.

| Scenario                                       | Effective $/1M tokens |
| ---------------------------------------------- | --------------------- |
| Node 100% saturated (~$14K/mo reserved ÷ 6.5B) | ~$2.1                 |
| Node at realistic single-dev load (~3% util)   | ~$70                  |
| GLM-5.2 hosted API (#364)                      | $0.90                 |
| GLM Coding Plan Pro (flat)                     | ~$50–72/mo total      |

**Break-even to beat the $0.90/M hosted API: ~6.5B tokens/mo sustained (~22x current 292M) — a team of ~20–30 heavy agentic devs hammering it 24/7.** And even then you only match a hosted API that batches the same open weights across thousands of tenants. You can't out-batch a provider serving the same weights at scale; self-hosting only wins under **compliance/data-sovereignty**, when **reselling inference**, or at **true hyperscale internal volume**.

### The Mac Studio option (buy, but sane capex)

The one place owning hardware stops being absurd. Apple Silicon's **unified memory** lets one quiet desktop hold a frontier-ish open model that would otherwise need eight datacenter GPUs.

|                              | Mac Studio M3 Ultra 512GB (available now) | M5 Ultra (est. ~Oct 2026)                                         |
| ---------------------------- | ----------------------------------------- | ----------------------------------------------------------------- |
| Capex                        | ~$9.5–10K (~AUD $15–16K)                  | >$10K; DRAM shortage removed the 512GB tier + is inflating prices |
| Mem bandwidth                | ~819 GB/s                                 | ~1,100 GB/s (leaked)                                              |
| Power                        | ~~200–480 W (~~$10–30/mo)                 | similar                                                           |
| Runs GLM-5.2 Q4 (~372 GB)?   | ✅ fits in one box                        | ✅ (if a ≥512 GB tier ships)                                      |
| Decode speed (GLM-5.2-class) | ~15–25 tok/s single-stream                | ~25–35 tok/s                                                      |

Reference points: M3 Ultra 512GB runs DeepSeek R1 ~17–18 tok/s, DeepSeek V4-Flash ~37 tok/s (MLX).

**Why it's attractive:** ~28x cheaper capex than an 8xH100 node ($10K vs $285K), ~30x lower power, silent, no colo/MLOps, and it's the _only_ single-appliance way to run a GLM-5.2-class model locally.

**Why it's not a rental/subscription replacement for heavy agentic work:**

1. **Prefill is the Achilles heel.** Mac prompt-processing is compute-bound and ~4x lower bandwidth than an H100. For our **88%-cache-read / ~285M-prefill-token** profile, long agentic contexts (50K+) mean tens of seconds to first token, every turn. It's slowest at exactly the thing our workload does most.
2. **Single-stream only** — no batching, so it serves one user, not a team.
3. **Still a below-Opus model** (GLM-5.2 index 51 vs 56).

**Where a Mac Studio genuinely fits:** privacy/offline needs, and as a **free-at-the-margin local tier** for bulk low-stakes subagent steps — which bkit's `ollama-local` runtime already targets (currently a MacBook Air; a 512GB Studio just lifts the ceiling from ~24 GB models to GLM-5.2-class). It complements the API tiers; it doesn't replace Opus for the work that matters.

### Bottom line

- **Runnable-now open model closest to Opus:** GLM-5.2 (index 51), 1x 8xH100 node **or** one 512GB Mac Studio at Q4.
- **Rent/own a server:** no case below ~20–30 sustained heavy users or a compliance mandate.
- **Mac Studio:** the only sane-capex buy (~$10K), but a _local supplement_ (privacy + bulk offload), not an Opus replacement — prefill-bound on exactly our cache-heavy profile.
- **For cost/quota relief, the hosted route still wins:** GLM Coding Plan Pro (~$50–72/mo) or GLM-5.2 API ($0.90/M) — per #364, pin Grok 4.5 in Go first.

Sources: [MarkTechPost — K3 vs V4 vs GLM-5.2](https://www.marktechpost.com/2026/07/18/kimi-k3-vs-deepseek-v4-pro-vs-glm-5-2-open-trillion-scale-moe-models-compared-on-benchmarks-license-and-serving-cost/) · [Mercatus — H100 8-GPU server](https://www.mercatus-ai.com/blog/h100-server-price) · [Mercatus — H200 8-GPU server](https://www.mercatus-ai.com/blog/h200-server-price) · [IntuitionLabs — H100 rental](https://intuitionlabs.ai/articles/h100-rental-prices-cloud-comparison) · [Macworld — M5 Mac Studio](https://www.macworld.com/article/2973459/2026-mac-studio-m5-release-date-specs-price-rumors.html) · [llmcheck — Apple Silicon LLM benchmarks](https://llmcheck.net/benchmarks)

_Token/throughput figures are estimates; verify the real usage split via `npx ccusage@latest`._

## Mac Studio: the one "buy" that isn't absurd (focused writeup)

A Mac Studio is a completely different animal from an 8xH100 node, because Apple's **unified memory** lets one silent desktop hold a model that would otherwise need eight datacenter GPUs. GLM-5.2 at Q4 is ~372 GB — that **fits in a 512 GB Mac Studio**, in one box, on a desk.

|                  | Mac Studio M3 Ultra 512GB (buy today) | 8x H100 node         |
| ---------------- | ------------------------------------- | -------------------- |
| Capex            | **~$10K (~AUD $16K)**                 | ~$285K               |
| Power            | ~~200–480 W (~~$20/mo)                | ~10 kW + colo        |
| Runs GLM-5.2 Q4? | ✅ one box                            | ✅ across 8 GPUs     |
| Decode speed     | ~15–25 tok/s single-stream            | far higher, batched  |
| Serves a team?   | ❌ single-user                        | ✅ dozens concurrent |

Reference: the M3 Ultra 512GB runs DeepSeek R1 at ~17–18 tok/s and V4-Flash at ~37 tok/s via MLX.

**Where it wins:** ~28x cheaper capex, ~30x lower power, no colo or MLOps, and it's the _only_ single-appliance way to run a GLM-5.2-class open model locally.

**Where it fails for our workload specifically — the decisive bit:**

1. **Prefill is the Achilles heel.** Mac prompt-processing is compute-bound with ~4x less memory bandwidth than an H100. Our usage is **88% cache reads / ~285M prefill tokens** — so long agentic contexts (50K+) mean _tens of seconds to first token, every turn_. The Mac is slowest at precisely the thing our work does most. On the API those tokens are cached at 10%; on the Mac you reprocess them cold each turn.
2. **Single-stream only** — it serves one person, not a team.
3. **Still a below-Opus model** (GLM-5.2 index 51 vs 56).

**Verdict:** a Mac Studio is _not_ a replacement for Opus-class agentic coding — it's a **local supplement**. It fits privacy/offline work, tinkering, or a **free-at-the-margin tier for bulk low-stakes subagent steps** — exactly what bkit's `ollama-local` runtime already targets (today a MacBook Air; a 512 GB Studio just lifts the model ceiling from ~24 GB models to GLM-5.2-class). It slots _beside_ the API tiers, not in place of them.

**Timing:** the M5 Ultra is delayed to ~Oct 2026 with ~1,100 GB/s bandwidth (meaningfully better prefill), but the DRAM shortage killed the 512 GB tier and is inflating prices — so right now the only buyable 512 GB box is the M3 Ultra. Want a local box for privacy/bulk offload → M3 Ultra 512 GB now; can wait for a ≥512 GB M5 tier → it'll prefill noticeably faster.

For the actual goal (cutting the Opus quota wall), no hardware route beats the hosted path in #364: GLM Coding Plan Pro (~$50–72/mo) or pin Grok 4.5 in Go first.

## Payback math when "slightly below Opus" is acceptable

The analyses above all assume we must **match Opus (index 56)** — that's what forces the $285K-node conclusion. This comment relaxes that: **accept GLM-5.2-class (index 51, −5 vs Opus)** — the best runnable-now open model — and compute the actual **compute payback** of the three ownership models against the API. Same #364 profile: **292M tok/mo (7.3M out, 4.4M fresh in, 23M cache-write, 257M cache-read).**

### The headline inversion

Relaxing the quality bar was supposed to rescue self-hosting. **It rescues the hosted API more.** The same GLM-5.2 you'd self-host is available hosted-and-batched for **~$60/mo flat** (GLM Coding Plan Pro) or **~$0.90/1M** metered. So the monthly saving you'd amortise capex against **collapses toward zero** — you can't have a 3-year payback on a $10K box when the thing it replaces costs $60/mo. Accepting a weaker model shrinks the arbitrage on **both** sides, and the hosted side shrinks faster, because the cost advantage lives in **provider batching**, not model choice. You cannot out-batch a provider serving the same open weights across thousands of tenants.

### The two API baselines to beat (GLM-5.2-class)

| Baseline                                  | Cost                     | Notes                                                         |
| ----------------------------------------- | ------------------------ | ------------------------------------------------------------- |
| **GLM Coding Plan Pro** (flat)            | **~$60/mo** (~AUD $95)   | Built for heavy agentic use; soft caps. The realistic number. |
| **GLM-5.2 metered API** ($0.90/1M × 292M) | **~$263/mo** (~AUD $415) | Uncapped; scales with volume. Cache-aware blended.            |

Everything below is a payback/opex comparison against these two.

### Scenario 1 — Hosted runner (on-demand cloud GPU, no commitment)

GLM-5.2 (744B, ~372 GB Q4) doesn't fit one H100 — it needs an **8×H100 node** (640 GB). On-demand ≈ 8 × $2.89 = **~$23/hr**, single-stream (no batching) at ~25 tok/s decode.

- Effective cost ≈ $23/hr ÷ (25 tok/s) ≈ **~$255 per 1M output tokens** — roughly **~280× the API's $0.90.** (prefill on top; cold-loading 372 GB per burst makes it worse)
- **Capex $0 → nothing to amortise; it's just permanently ~2 orders of magnitude worse opex.**
- **Payback: N/A — it is never cheaper, at any volume.**

### Scenario 2 — Rented server (reserved dedicated 8×H100)

~$8–14K/mo reserved (call it $11K). Batched vLLM ~2,500 tok/s aggregate → ceiling **~6.5B tok/mo at 100% saturation**.

- **Best case, fully saturated:** $11K ÷ 6.5B = **~$1.70/1M — still above the API's $0.90.** Even perfect utilisation loses.
- **At our volume (292M = ~4.5% of the node):** effective **~$38/1M**, i.e. ~$11K/mo for what the API bills ~$263/mo — **~42× worse**.
- **Break-even vs $0.90/1M needs ~12B tok/mo sustained (~42× our volume)** — and even then only _matches_ a hosted API.
- **Payback: never** — opex-only and strictly dominated.

### Scenario 3 — Owned Mac Studio (M3 Ultra 512 GB, ~$10K capex)

The only single-appliance GLM-5.2 Q4 host. ~15–25 tok/s single-stream, power ~$20/mo. This is the **one scenario with any capex to pay back** — so it's the only one where "payback period" is even a meaningful question.

Payback = capex ÷ (monthly API cost avoided − running cost):

| vs baseline        | Calculation            | Payback                          |
| ------------------ | ---------------------- | -------------------------------- |
| Flat plan ($60/mo) | $10,000 ÷ ($60 − $20)  | **~250 months (~21 yr)** → never |
| Metered ($263/mo)  | $10,000 ÷ ($263 − $20) | **~41 months (~3.4 yr)**         |

Even the "good" case (3.4 yr vs metered) **exceeds the useful life of the hardware+model** — GLM-5.2 is outclassed in ~18–24 months. And it assumes the Mac can actually _serve_ the profile, which is the catch:

- It can grind our ~285M prefill + 7.3M decode tokens in a month in aggregate (~60% duty at 24/7), **but not at interactive latency**: a 50K-token agentic context prefills in _tens of seconds to first token, every turn_ (Mac prompt-processing is ~4× lower bandwidth than an H100, and our profile is **88% prefill/cache-read** — the exact thing it's slowest at).
- **So it pays back only in tokens the workload can't spend** — batchable/offline bulk work, not the interactive coding that generates the volume. On paper, factoring resale (~$4K in 3 yr → ~$175/mo effective), it beats the _metered_ baseline; in practice those savings only apply to non-interactive tokens.

### Payback verdict

| Scenario                         | Capex | Effective $/1M (GLM-5.2-class)          | Payback vs API                                             |
| -------------------------------- | ----- | --------------------------------------- | ---------------------------------------------------------- |
| Hosted runner (on-demand 8×H100) | $0    | ~$255 out (~280× API)                   | **Never** — worse opex, nothing to amortise                |
| Rented server (reserved 8×H100)  | $0    | ~$1.70 saturated / ~$38 at our load     | **Never** — needs ~12B tok/mo just to match API            |
| Owned Mac Studio 512 GB          | ~$10K | fits, but single-stream + prefill-bound | **3.4 yr vs metered / 21 yr vs flat** — beyond useful life |

### Bottom line

Accepting a weaker model doesn't change the recommendation — it _reinforces_ it. The two rented options never pay back (no capex, worse per-token than the hosted API of the **same** weights). The owned Mac Studio is the only one with a real payback number, and it's 3.4–21 years — longer than the box or the model stays relevant, and payable only in throughput the interactive workload can't use.

The Mac Studio's genuine role is unchanged from the writeups above: a **free-at-the-margin local supplement** for privacy/offline and bulk low-stakes subagent steps — exactly what bkit's `ollama-local` runtime already targets (a 512 GB Studio just lifts that tier's ceiling from ~~24 GB models to GLM-5.2-class). For the actual goal — cost/quota relief — the hosted route in #364 still wins outright: **pin Grok 4.5 in Go first**, then GLM Coding Plan Pro (~~$60/mo) or a metered overflow tier.

_All token/throughput figures are estimates carried over from #364/#377; verify the real usage split via `npx ccusage@latest`. GLM-5.2 pricing/index and Mac Studio throughput are the sourced figures from the comments above._

## Correction: the payback baseline should be actual current spend, not GLM-5.2 hosted pricing

The "Payback math" comment above benchmarks capex against **GLM-5.2 hosted pricing** (~$60/mo flat, ~$263/mo metered) — i.e. "would owning hardware beat _switching to_ GLM-5.2 hosted?" That's the wrong baseline. The real question is "would owning hardware beat _what I'm already paying_?" — and per #364, that's **Max 20x (~AUD $300) plus ad hoc overflow credits, ~AUD $300–400/mo** total.

### Real baseline, converted (FX ~1.56, same #364 profile: 292M tok/mo)

AUD $300–400/mo → **USD $192–256/mo**

**Effective $/1M tokens: $192–256 ÷ 292M × 1e6 = $0.66–$0.88/1M** — for Opus (AA index 56).

That's the headline finding: it lands _at or below_ GLM-5.2's own $0.90/1M hosted metered rate — the Max subscription already delivers a better model at open-weight pricing. Same "2.4× value" point from #364, now expressed per-token.

### Scenarios re-run against the real baseline

| Scenario                                     | vs GLM baseline (prior comment) | vs real baseline (corrected)                     |
| -------------------------------------------- | ------------------------------- | ------------------------------------------------ |
| Hosted on-demand runner (~$255/1M)           | ~280× worse than $0.90          | **~290–390× worse** than $0.66–0.88              |
| Rented reserved server (~$1.70/1M saturated) | "still above $0.90"             | **~2× above** $0.66–0.88 — still never pays back |
| Owned Mac Studio ($10K capex, ~$20/mo power) | 41mo (metered) / 250mo (flat)   | **42–58 months (~3.5–4.8 yr)**                   |

Conclusion is unchanged — the Mac Studio payback still exceeds GLM-5.2's ~18–24 month useful-life window before the model/hardware is outclassed — but it's now benchmarked against reality instead of a hypothetical switch to a lower-quality hosted model.

### Open caveat

This treats the full AUD $300–400/mo as avoidable, but Max 20x's ~$300 is arguably a fixed cost that stays regardless (GLM-5.2 can't substitute for Opus-quality interactive work — same prefill/quality caveats as the scenarios above), with only the ad hoc overflow-credit slice being genuinely marginal spend. If so, the real avoidable baseline is much smaller than $300–400/mo and the Mac Studio payback stretches well past any useful-life window. Flagging as unresolved rather than assuming either framing.

_Analysis by Claude; token/cost figures are estimates carried over from #364/#377 — verify actual spend split via `npx ccusage@latest` and account statements._

Does this change anything? Cheaper non Mac version.

https://www.gmktec.com/products/amd-ryzen%e2%84%a2-ai-max-395-evo-x2-ai-mini-pc

GMKtec EVO-X2 AI Mini PC AMD Ryzen™ AI Max+ 395
128 GB RAM 2 TB SSD

USD 4K

CPU AMD Ryzen™ AI Max+ 395
• 16 cores / 32 threads
• TSMC 4nm FinFET process
• Up to 5.1 GHz (MAX)
• 16 MB L2 Cache / 64 MB L3 Cache
• TDP: runs steadily at 120W (peak up to 140W)
GPU Radeon 8060S Graphics
• 40-core RDNA 3.5 architecture
AI NPU Based on XDNA 2 architecture
• 50 TOPS
• Overall processor performance up to 126 TOPS

• LM Studio: AI performance 2.2× higher than NVIDIA RTX 4090 with lower power consumption
Memory (RAM) Onboard LPDDR5X (non-upgradeable)
• Options: 64GB or 128GB
• Speed: 8000MHz
Primary Storage (ROM) PCIe 4.0 M.2 2280 SSD
• Capacities: 2TB or 4TB
• Supports PCIe 3.0/4.0 (SATA drives are not supported)
Internal Storage Expansion Dual M.2 2280 slots
• Maximum total storage: 16TB (each slot supports up to 8TB via PCIe GEN4 x4)
Video Output Available via HDMI, DisplayPort, and USB4
• Maximum supported resolution: 7680×4320 @ 60Hz
Network (WiFi & LAN) WiFi:
• Wifi7: RZ717(MT7925)
Ethernet:
• 1 × RJ45 Gigabit LAN (2.5G, 8125BG)
Bluetooth Bluetooth 5.4
Power – Charger DC 19.5V, 11.8A (~230.1W)
• AC Input: 100–240V, 50/60Hz, 4.0A
Front Panel I/O • 2 × USB-A 3.2 Gen2
• 1 × Audio Combo (3.5mm jack)
• 1 × USB Type-C (USB4.0)
• 1 × SD Card Reader (SD4.0, supports SDXC)
• Buttons: Power, System Fan Lighting Control, Performance Mode Switch
Rear Panel I/O • 1 × DisplayPort 1.4 HBR3 (8.1 Gbps)
• 1 × HDMI 2.1 (FRL at 8 Gbps)
• 1 × USB-A 3.2 Gen2
• 2 × USB-A 2.0
• 1 × USB Type-C (USB4.0)
• 1 × Audio (3.5mm CTIA)
• 1 × DC IN (5525 interface)
• 1 × RJ45 Gigabit LAN (2.5G, 8125BG)
OS • Window 11 Pro / Ubuntu
Chassis / Form Factor • Dimensions: 193 mm x 185.8 mm x 77 mm
• Chassis finish: B/C-grade metal with CNC sandblasted oxidized finish; A-shell plastic spray coating
LLM support • 64GB+1TB：DeepSeek-R1: 32B
• 96GB+2TB：DeepSeek-R1: 32B, GPT-OSS: 120B
• 128GB+2TB：DeepSeek-R1: 32B, DeepSeek-R1: 70B, Lama 4: 109, Qwen3: 235B

128G Version - Local AI Performance Benchmark
Model Client Token Time Avg. Token Speed
Deepseek-R1: 32B 10.50s 9.26 tokens/s
OpenAI GPT-OSS: 120B 0.53s 19.25 tokens/s
OpenAI GPT-OSS: 20B 0.11s 57.15 tokens/s
Qwen3: 30B 0.18s 55.02 tokens/s
Qwen3: 235B 0.03s 11 tokens/s
Llama4: 109B-Q4KM 0.02s 13.83 tokens/s
QWQ: 32B 0.30s 9.65 tokens/s

EVO-X2 and T1 Model Compatibility
Model Type Model Name EVO-X2 128G EVO-X2 64G EVO-X2 96G EVO-T1
Deepseek Deepseek-R1: 14B ✔ ✔ ✔ ✔
Pre-installed Deepseek-R1: 32B ✔ ✔ ✔ ✔
Deepseek-R1: 70B ✔ ✘ ✘ ✘
Qwen Qwen2.5: 7B ✔ ✔ ✔ ✔
Qwen2.5: 14B ✔ ✔ ✔ ✔
Qwen3: 30B ✔ ✔ ✔ ✔
Qwen2.5: 72B ✔ ✔ ✔ ✘
Llama3 Llama3: 8B ✔ ✔ ✔ ✔
MiniCP MiniCP: PM-V ✔ ✔ ✔ ✔
QWQ QWQ: 32B ✔ ✔ ✔ ✔
Llama4 Pre-installed Llama4: 109B-Q4KM ✔ ✘ ✘ ✘
OpenAI GPT-OSS: 20B ✔ ✔ ✔ Not Supported
GPT-OSS: 120B ✔ ✘ ✔ Not Supported
Intel Custom Deepseek-R1: 32B Super ✘ ✘ ✘ ✔
I'm

## #99 — Friction triage (OPEN)

No `docs/templates/bkit-audit-*.md` for this audit. This issue is the template. Mirror `.bkit/prompts/bkit-audit-generate.md`: sequential steps, gates, evidence. Do not improvise past this issue.

Copy-paste prompt:

```
This issue is the audit template. No docs/templates/bkit-audit-*.md exists for it.

Mirror .bkit/prompts/bkit-audit-generate.md.

Read: this issue body.
Write: docs/audits/{YYYYMM}/friction.md
```

If that month already has `friction.md` or `friction-{TIMESTAMP}.md`, write `friction-{TIMESTAMP}.md` (`date -u +%Y%m%dT%H%M%SZ`). Do not overwrite.

# Friction Triage

> [!CAUTION]
> **Purpose:** Verdict on harvested friction — already fixed, still open, superseded, or the same row twice.
>
> **Rules:**
>
> - Read-only. Do not edit code, config, ledgers, or `harvest/`. Do not run harvest. Do not delete a friction row.
> - Correction and close text live in `Expected` only.
> - Canonical sources are `.bkit/` (prompts, workflows, `src`). A hit only under `.claude/`, `.cursor/`, or `.opencode/` is a mirror, not the source.
> - Use dense phrasing. Every claim cites `file:line` or a command. Empty search is not absence.
> - Read this issue once at the start.
> - Ledger rules: `.bkit/jsonl.md` § Friction Is a Drained Queue, § Severity, § Categories `friction`.

## Instructions

### Context & Goals

Consumers append `.bkit/friction.jsonl`. `bkit harvest` moves those rows into `harvest/` and prunes the consumer. Nothing in that path decides whether the friction is still true. Target failure: **an open friction the code already fixed, or two distinct frictions collapsed into one key**.

A dated fix list is not this procedure. Re-verify against the tree at `HEAD`. Paths in old comments (`.agents/prompts`, `.agents/workflows`) are historical; the source tree is `.bkit/prompts` and `.bkit/workflows`.

**Applies when:** `harvest/friction.jsonl` exists, or any checkout still has `.bkit/friction.jsonl`. Neither → one `N/A` row and stop. Harvest first (#343) when the consumer queues are the input and have not been harvested.

**Cadence:** after a harvest, and at least monthly. Extra pass after a workflow or prompt rewrite that would obsolete a cluster.

**Anchor standards:** record the revision read.

- `.bkit/jsonl.md` § Severity and the `friction` category enum, at the installed version.

### Scope

- Rows in `harvest/friction.jsonl`, plus any `.bkit/friction.jsonl` not yet harvested. Say which file each row came from.
- Cluster by `category` and by the same workflow, prompt, or path.
- One verdict per cluster verified this pass.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Running harvest or committing `harvest/` | Different audit | #343 |
| Implementing the fix | Audit reports only | A plan from this report |
| Deferrals and failures | Other ledgers | `bkit-audit-deferrals`, `bkit-audit-failures` |
| Rows only in a mirror directory | Generated | The `.bkit/` source |

### Verdicts

One per verified cluster.

- **FIXED:** the behaviour is gone at `HEAD`. Cite `file:line`. `Expected` = no code change.
- **OPEN:** still true. `Expected` = the change, the file, and the severity.
- **SUPERSEDED:** the surface moved or was removed, so the row no longer applies. Cite what replaced it.
- **DUPLICATE:** same behaviour as another row, including two texts that share one truncated `key`. Name both.
- **NEEDS HARVEST:** still only on a consumer `.bkit/friction.jsonl`. `Expected` = run #343. Do not harvest here.
- **OTHER:** say what it is and where it goes.

**FIXED is the verdict most likely to be wrong.** A closed issue or a commit message is not evidence. Read the source.

### 🚨 Pre-Flight / Dependencies 🚨

#### Core

- [ ] **Ledger spec:** `.bkit/jsonl.md` § Friction Is a Drained Queue and § Severity. Fallback: stop.
- [ ] **Store:** `harvest/friction.jsonl`. Missing → consumer files only, and say so.
- [ ] **Prior report:** newest `docs/audits/**/friction*.md`. None → baseline.

#### Conditional

- [ ] **Unharvested:** a consumer `.bkit/friction.jsonl` listed from `docs/consumers.md` when that file exists. Fallback: unharvested set `Not Checked`.
- [ ] **Source tree:** `.bkit/prompts`, `.bkit/workflows`, `.bkit/src`. Fallback: verdicts that need them stay unverified.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Probe Steps`.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Record `git rev-parse HEAD`. Read the newest prior report. Findings still open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Fold:** Parse `harvest/friction.jsonl` and any unharvested consumer friction files. Group by `key`. A `key` shared by byte-different `summary` or `description` values is a collision, not one event. Order: `CRITICAL`, then `HIGH`, then oldest `ts`. Missing `severity` → assign one with the verdict. Record count, age, missing `severity`, missing `category`, and rows verified / rows seen. A large set may be a partial pass. **Done when:** `Trend` holds those numbers, or `N/A` and stop.
- [ ] **Step 3 — Source:** No verdict before this step. For each cluster verified this pass, open the `.bkit/` file the row names. If the path is a retired `.agents/` path, search the same basename under `.bkit/`. Mirror copies do not count. Re-run an empty search before calling the row fixed. **Done when:** every verified cluster has `file:line` or a named search that was re-run.
- [ ] **Step 4 — Classify:** One verdict per cluster. Collisions are DUPLICATE plus a finding that the `key` is lossy. A row whose workaround is the only remaining trace is still OPEN if the behaviour remains. Do not edit the ledger. **Done when:** every verified cluster has one verdict.
- [ ] **Step 5 — Clusters:** Three or more OPEN rows on the same workflow, prompt, or path → one change in `Expected`, not one per row. **Done when:** `Clusters` lists those groups, or `none`.
- [ ] **Step 6 — Anything Else:** (a) Commits since the previous report touching `.bkit/prompts`, `.bkit/workflows`, harvest, or friction writers → one-line verdict each. (b) Bounded ~30 min: a friction shape no step asks about. Class seen on 2 runs → propose a step. **Done when:** `Beyond the Steps` holds both passes, or `none`.

### 🔒 Gate 2: Probes Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Findings`.

- [ ] **Steps complete:** every step `[x]`, or an explicit skip with evidence.
- [ ] **Evidence:** every FIXED and SUPERSEDED cites `file:line` or a re-run search, not a closed-issue title.
- [ ] **Read-only:** no ledger line, `harvest/` file, or product file changed.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | Friction is data loss, a security hole, or a broken workflow with no workaround |
| `HIGH` | Still-open behaviour with a workaround. A truncated `key` hiding a second event |
| `MEDIUM` | Repeated cost. A cluster of three or more on one surface |
| `LOW` | Cosmetic, or a row whose surface is gone |

Scale per `.bkit/jsonl.md` § Severity. Carry the row's severity when it is already set and still accurate. Number `friction-{n}`.

<!-- prettier-ignore -->
| ID | Severity | Verdict | Location | Evidence | Expected |
| --- | --- | --- | --- | --- | --- |
| PENDING | PENDING | PENDING | PENDING | PENDING | PENDING |

Empty and clean → one row `None`.

## Report

### Summary

`PENDING`

### Previous Run

`PENDING`

### Trend

`PENDING`

### Clusters

`PENDING`

### Checked

`PENDING`

### Not Checked

`PENDING`

### Beyond the Steps

`PENDING`

### Process Improvements

`PENDING`

### 🔒 Gate 3: Report Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, STOP.

- [ ] **No placeholders:** Findings table and every `Report` section have no `PENDING`.
- [ ] **Summary:** names count per severity and count per verdict.
- [ ] **Series:** row count and open-cluster count beside the previous report, or marked baseline.
- [ ] **Writes:** only this report. `harvest/` and ledgers unchanged.
- [ ] **Process Improvements:** proposed step changes only. `none` if empty.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

## Fix 4 (Group D) — recurrence + resolution applied (2026-06-10)

**Fresh recurrence:** `example-org/consumer-b`, `bkit-debug` on `feat/105-chat-email-polish` (Attempt 2), 2026-06-10. Step 2 `git rebase origin/dev` rewrote local SHAs; the remote feat branch still held pre-rebase history; the Step 8 plain `git push` was rejected non-fast-forward. Operator recovered with `git push --force-with-lease` — the exact command the line-29 Git rule prohibits "(any flavour)". Confirms the contradiction is structurally always-on (any resume after `origin/dev` has advanced), not a one-off.

**Resolution: option (b) — the `--force-with-lease` carve-out.** The issue's preferred (a) does not hold up: as written it either skips rebases the workflow actually wants (leaving a stale-base branch — which bkit squash-merges away anyway, so rebase buys little) **or** still rewrites already-pushed commits, so it does not remove the force-push need. (b) is what `rules.md:63` already promises and what the recovery actually did.

**Scope: extended to all 5 phase workflows** (design/plan/build/debug/ship), not debug only. Line 29 and the Step-2-rebase-then-push pattern are byte-identical across all of them, so a debug-only fix would just relocate the same friction to the next plan/design/build/ship resume.

### Changes (canonical sources `.bkit/workflows/*.md`)

1. **Line 29 Git rule** (all 5): ``git push --force` (any flavour)` → permit `git push --force-with-lease` to the personal `feat/{FID}`/`fix/{FID}` branch ONLY (documented as the Step-2 rebase companion: rebase rewrites SHAs so a plain push is non-fast-forward); bare `--force` and **any** force to `dev`/`main` stay prohibited. Now consistent with `rules.md:63`.
2. **Feature-branch push sites (11)** → branch-guarded one-liner, never forces a shared branch:
   ```bash
   B=$(git branch --show-current); case "$B" in dev|main) git push origin "$B" ;; *) git push --force-with-lease origin "$B" ;; esac
   ```
   Sites: debug `97/775/820/901/949`, build `96/1050/1089/1189`, ship `100`, plan `653`, design `552`. The `git push -u` (build Step 16) and bare `git push` (build Step 17.2) variants are preserved inside the guard.
3. **Untouched (correct):** `git push origin dev` (ship `713` / plan `735` / design `750` — shared branch, fast-forward after `pull --rebase`); `git push origin --delete` (branch teardown).

### Permission-layer check — no change required

The seeded deny rule `Bash(git push --force:*)` (`.bkit/templates/.claude/settings.json`) is **token-aware** and does NOT match the distinct token `--force-with-lease`. Empirically confirmed: consumer-b carries the identical deny list yet the recovery pushed successfully (a `deny` is a hard block with no override prompt), and `Bash(*)` in `allow` covers force-with-lease silently. So the workflow change is executable as-is.

_Optional hardening (not applied):_ add explicit `Bash(git push --force-with-lease:*)` to the template `allow` to survive a future allow-list tightening; a branch-aware PreToolUse Bash hook could enforce "force-with-lease on personal branches only, never `dev`/`main`" at the harness layer (the static deny can't be branch-aware) — ref the standing note in `project_settings_deny_scope_vs_workflow_prohibitions`.

### DoD Fix 4 status

Code change **applied** (option b, all 5 workflows). Remaining before this DoD item closes:

- [ ] `bkit install` mirror regen (batch at session end) — **note:** the installer has unrelated uncommitted WIP in `.bkit/src/` this session; regen should run on a clean installer.
- [ ] Mark the resolved friction entries `FIXED-IN: #99` on ship.

## Cross-harness permission audit (Claude / Cursor / OpenCode)

These workflows run under all three harnesses, so the line-29 carve-out must be executable under each one's command-gating model — refining the Claude-only "no change required" note above.

**Instruction parity is already covered:** `.bkit/workflows/*.md` → mirrors to `.claude/commands/`, `.cursor/commands/`, and `.opencode/` via `bkit install`, so all three receive the force-with-lease guidance from one canonical source.

**Deny/gate layer differs per harness:**

| Harness      | bkit-seeded git-push gate                                                                                                           | Blocks `--force-with-lease`?                                                                                                                                                                         | Action          |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| **Claude**   | `.claude/settings.json` deny `Bash(git push --force:*)` + `Bash(*)` allow                                                           | No — matcher is token-aware (`--force` != `--force-with-lease`); empirically confirmed by the consumer-b recovery pushing under the identical deny (a `deny` is a hard block, no override)           | none            |
| **Cursor**   | none — `.cursor/settings.json` is editor prefs, `hooks.json` is session-only, no command denylist seeded                            | No bkit gate (Cursor's own approval UI governs)                                                                                                                                                      | none            |
| **OpenCode** | `.opencode/opencode.json` native deny `Bash(git push --force:*)`; bash is **not** covered by the gateguard plugin (edit-tools only) | **Possibly** — OpenCode docs define `*` as "zero or more of any character" (glob, not token-aware) + **last-matching-rule-wins**; a glob normalisation of `--force` could catch `--force-with-lease` | **fix applied** |

**OpenCode change (`.bkit/templates/.opencode/opencode.json`):** added an `allow` rule for `Bash(git push --force-with-lease:*)` positioned **after** the force deny. Under OpenCode's last-match-wins precedence this guarantees force-with-lease is permitted regardless of whether the glob matcher catches it, while bare `--force`/`-f` stay denied (the force-with-lease pattern can't match them). Safe no-op if OpenCode's matcher turns out token-aware; necessary rescue if it's glob-prefix.

Net: the carve-out is executable under all three harnesses. Mirror regen (`bkit install`) still pending to propagate sources → live `.claude`/`.cursor`/`.opencode` trees (the installer WIP that blocked it earlier this session landed as #251, so a clean regen is now possible once the in-flight `.agents/rules.md` + `.bkit/prompts.md` edits settle).

## New harvest (2026-07-12) — three build-workflow frictions (Fix 8–10)

Surfaced from a remote-control observation of `consumer-a` build run `683-dashboard-calendar-cache`, cross-checked against the shipped `.bkit/` sources.

> **Path note:** since #160 / DE-19 the canonical sources moved `.agents/*` → `.bkit/workflows/*` + `.bkit/prompts/*`. The Fix 1–7 body above still cites the old `.agents/` paths; the references below use current `.bkit/` paths.

---

### Fix 8 — Build runs the `@live` tier locally, contradicting the push-only-canary doctrine

**Severity:** Medium — recurring; forces agents to add `[live=off]`, which the Claude auto-mode **safety classifier blocks** as a "test-suite kill-switch" (683 remediate step, 2026-07-12; also consumer-a friction ~line 616). bkit can't reconfigure that classifier — the lever is to stop needing the marker.

**Evidence:** `bkit-build.md:918-925` (Step 13) defaults `TESTS_LIVE=1` and _appends_ `test:live` to the **local** Run-Tests command whenever the consumer declares the script and `[live=off]` is absent. But at build time (local worktree, pre-PR, no preview deploy) there is no deployed URL — and the `@live` tier is defined as a **push-only canary against a DEPLOYED url** (`docs/testing.md:120-123`), excluded locally pre-push (`docs/testing.md:15`), re-run locally **only via Debug** (`.agents/rules.md:82`). So build either fails (no URL) or forces `[live=off]`. `docs/testing.md:233` currently says _both_ build+debug append the live tier — that line is the doctrine inconsistency.

**Fix:** The on/off distinction already lives in package.json as two scripts (`test` = unit + in-process integration; `test:live` = the live tier). Stop build from _unioning_ them — Step 13 runs only `test`; the `@live` tier stays owned by the push-only `bkit-tests-live` CI job + the Debug workflow (which correctly keeps its own live probe at `bkit-debug.md:369-370`). Reconcile `docs/testing.md:233,239` to "debug-only." `[live=off]` becomes vestigial for build.

**Tradeoff:** a consumer whose `test:live` targets a _persistent shared_ env loses a pre-merge live signal — acceptable, the post-push canary is that gate.

**Affected:** `bkit-build.md` Step 13; `docs/testing.md:233,239`; one-line `.agents/rules.md` clarification if needed.

---

### Fix 9 — Two CI runs per build (create-PR push, then close-workflow push)

**Severity:** Medium — every build burns two full CI runs. On 683: CI 1760 (create-PR) then 1761 (close-workflow), both "via pull request", back-to-back.

**Evidence:** `bkit-build.md` create-PR (Step 17) opens the PR → CI run #1; close-workflow (Step 18, push at `:1265`) commits the `close-workflow` status line + friction sweep + lock removal and pushes → PR `synchronize` → CI run #2.

**Key finding — bkit-debug already does the correct ordering:** close-workflow is **Step 10**, create-pr is **Step 11** (after), and the CI-Dispatch Gate is keyed to whichever push is "the CI-triggering push" (`bkit-debug.md:923` PR-mode / `:1043` LOCAL-mode) → exactly **one** run. Build should mirror this: do the close-workflow bookkeeping first, create the PR **last** as the single CI trigger, run one Dispatch Gate on it.

**Not affected:** ship (merge-based — the squash-merge to `dev` is the single CI event), design/plan (no code PR; squash-merge to `dev` carries `bkit [skip ci]`).

**Affected:** `bkit-build.md` Steps 17–18 (reorder + move the CI-Dispatch Gate onto the create-PR push).

---

### Fix 10 — Plan complexity thresholds sit right on the truncation cliff (Group A residual)

**Severity:** Medium-High — the single most frequent current friction. Heavy `@bkit-build-plan-execute` (and challenge/summary) subagents on large sub-plans truncate mid-final-bookkeeping — implementation done, but the agent is cut off before ticking plan checkboxes + writing `Verdict: PASS`, leaving `Verdict: PENDING`. Recurs across 294-calendar-page, 501-docling-cloud-run, 663-rag-embedding-sync, 683-dashboard-calendar-cache and more, in both consumer repos.

> Note re #99's "What's already shipped" → Group A: the stub-first `Edit`-flush pattern (#61/#79) does help `plan-verify` / `failure-diagnose`, but it does **not** cover heavy `plan-execute` on an oversized sub-plan. The residual is threshold _sizing_, not the stub pattern.

**Evidence:** `bkit-plan-complexity-check.md:36` → `SPLIT` if est. tokens `>100K` OR task count `>15`; `bkit-plan-complexity-split.md:4` targets sub-plan budget `<=100K`. Observed truncation at **~100–130K tokens / 100–120 tool calls** — i.e. the split cap sits _at_ the cliff, and estimates run optimistic, so `<=100K` sub-plans still lose the checkbox+verdict tail.

**Fix (careful-but-ambitious, not over-splitting):** lower to **`SPLIT` if est. `>85K` OR `>12` tasks; sub-plan cap `85K`**. ~15K headroom absorbs the bookkeeping tail + estimate slop; split-count rises only ~18% (a 200K plan 2→3 sub-plans, not 2→4) — no 10–20 sub-plan explosion. Orchestrator resume / verify-and-fill stays the safety net for the rare overrun. **Do NOT** add a parallel `plan-execute` pair (out of scope per #99).

**Affected:** `bkit-plan-complexity-check.md:36`, `bkit-plan-complexity-split.md:4-5,10,13` (all `<=100K` references + the `SINGLE`/`SPLIT` mapping); regenerate mirrors.

---

### DoD additions

- [ ] **Fix 8** — `bkit-build.md` Step 13 stops appending `test:live` (build runs only `test`); `docs/testing.md:233,239` reconciled to debug-only; `[live=off]` noted vestigial for build.
- [ ] **Fix 9** — `bkit-build.md` Steps 17–18 reordered to mirror `bkit-debug` (close-workflow bookkeeping before create-PR; single CI-Dispatch Gate on the create-PR push).
- [ ] **Fix 10** — complexity thresholds lowered to `85K / 12 tasks` (check) + `85K` sub-plan cap (split), all `<=100K` references updated.
- [ ] `bkit install` mirror regen once at end of session.

## Fix 8 — decision: remove `@live` from build entirely (not invert to opt-in)

Reviewed whether build should keep a live-test path but **default off, on under conditions** (opt-in marker) instead of removing it. Decision: **remove entirely.** Reasoning recorded so this isn't re-litigated.

### Does a live target even exist at build time?

`@live` needs a reachable **deployed URL + creds**. At Step 13 the agent is in a local worktree on `feat/{FID}`, pre-PR, pre-deploy. The only case where a live target exists is a **persistent shared env** (long-lived staging, not a per-PR preview — previews aren't created until Step 18). bkit's `@live` is a _deployed_ boundary by definition, not a local emulator.

### Why it still shouldn't gate a build — even with stable staging

1. **Your code isn't deployed yet (decisive).** `@live` validates the _deployed_ code + schema. During build the branch's changes are on disk, not on staging — so `test:live` runs **new client code against the old deployed server/schema**. Version mismatch → false failures (new migration not applied there) or false greens. It literally can't answer "does my change work in prod" because the change isn't in prod. That is _why_ `@live` is architecturally a post-deploy canary.
2. **Real side effects × build's loop.** `@live` = real LLM spend / emails / payment-sandbox / shared-DB writes. The push-only canary hits that once per merge; build loops (test → challenge → remediate → re-test), multiplying cost/pollution per feature.
3. **Infra failure isn't the PR's fault.** A read-only staging smoke validates the _environment_, not the change; staging being down should not red a build. bkit already codifies this — Debug "treats infra/credential failures as environment, not feature-broken."

### Why not the opt-in middle ground

An opt-in (`[force live]`) would dodge the classifier friction (adding an opt-in ≠ a kill-switch), but no flip-on condition is coherent: a marker only serves the stable-staging consumer, who per (1) is testing new-code-vs-old-server anyway; "a preview exists" is false until Step 18; build only runs on feature branches. It keeps a code path alive for a capability that's incoherent to use and re-contradicts the `rules.md`/`testing.md` doctrine (@live = push-only canary + Debug).

### Outcome

Nothing is lost: `@live` still runs post-merge (`bkit-tests-live` canary) and on-demand via `/bkit-debug` (which points at the real deployed boundary, resolving the new-vs-old mismatch). Build stopped running it only at the one moment it can't be correct. Earlier signal, if wanted, is better bought by a fast canary + cheap Debug trigger than by gating build on a deployed env the branch isn't part of yet. `[live=off]` is now inert for build (still honoured by `/bkit-debug`, which keeps its own probe at `bkit-debug.md:369`).

## Implementation status — Fix 8–10 done (parked on `feat/dev-wip-park`, pending #234)

All three implemented and validated (**full suite 1766 pass**). **Not on `dev` yet** — parked on branch `feat/dev-wip-park` because #234 (telemetry-jsonl) overlaps the same files and lands first; these rebase on top afterward (see "Sequencing" below).

### Fix 8 — build no longer runs `@live`

- `bkit-build.md` Step 13: dropped the `TESTS_LIVE` probe and the `test:live` append; build runs local tiers only.
- Removed `testsLiveSkipped` from build's close-workflow record.
- `docs/testing.md` §Live-test gates + line 15 reconciled to debug-only; `[live=off]` now inert for build (Debug keeps its own probe).
- Decision recorded (remove vs opt-in) in the earlier comment; wording corrected after checking `ci.yml` — `@live` runs only against a **deployed URL** (push-only `bkit-tests-live` canary + Debug), never locally, so "re-run locally" phrasing was fixed everywhere.

### Fix 9 — one combined terminal step, single CI run

- Merged the old Step 17 (Create PR) + Step 18 (Close Workflow) into a single **Step 17 — Close Workflow & Create PR**.
- Ordering: friction sweep → EC-1 → force-build → close-workflow commit (carries `[auto route]`) + push to feat (no PR → no CI) → `gh pr create` (the **single** CI-triggering event) → CI-Dispatch Gate → records → board/kill-switch/artifacts/final.
- Dropped the separate `create-pr` commit entirely — true single `opened` run, no reliance on concurrency-cancel (was two full CI runs per build; the original bug).
- **Both ledger entries preserved**: `build-create-pr` (PR_URL artifact) + `build-close-workflow` (ciDispatch), matching the original split.
- Invariants hold: exactly one CI-Dispatch kernel (byte-identical to debug), no `git push` after the verdict write (KN-11), `gate-alignment` (39 tests) green.
- Verified against git-HEAD by full line-by-line diff — nothing dropped; restored the `PR_NUMBER` re-derivation and the PR-title "Fix:" hint during review.
- **Scope note:** build was the only workflow with this create-then-close redundancy. Debug's two-step split is load-bearing (PR-mode vs LOCAL-mode); ship is merge-based; design/plan are single-step already.

### Fix 10 — complexity thresholds off the truncation cliff

- `bkit-plan-complexity-check.md` / `-split.md`: `SPLIT` at `>85K` tokens OR `>12` tasks; sub-plan cap `100K → 85K`. ~15K headroom for the bookkeeping tail; split-count up only ~18%.

### Also done (adjacent)

- `.agents/rules.md` (+ template) §Testing rewritten as a stage-keyed list (Local pre-push / CI-PR / CI-push / Debug), verified against `.husky/pre-push` + `ci.yml` + `testing.md`.
- Trimmed all rationale prose from the workflow file per `.bkit/workflows.md` § Authoring Rules (instructions-only).

### Sequencing (why not on `dev`)

#234 is a 165-file telemetry/JSONL migration (doc-ledgers → `.jsonl`) that also edits `bkit-build.md`, `rules.md`, `testing.md` — direct overlap. Decision: **land #234 first**, then rebase `feat/dev-wip-park` onto it (adopt #234's `friction.jsonl` idiom + structure, re-apply this logic), re-run the suite, regen mirrors, then split into proper PRs. Mirrors (`.claude`/`.cursor`/`.opencode`) for these edits are **not** yet regenerated (`bkit install` deferred to post-rebase).

## Full triage — all 101 rows in `harvest/friction.jsonl` (2026-07-15)

First complete sweep of the harvested consumer-friction corpus (101 rows: `consumer-a` 62, `consumer-b` 38, 1 mis-scoped). Every row was assigned to a root-cause cluster, and **every cluster was verified against the current `.bkit/` sources on `dev` @ `e93da128`** rather than taken at the row's word — necessary, because a large share of the corpus predates fixes that have since landed (Fix 8/9/10 are on `dev`; #234 deleted the ledger files five rows complain about; 4.3.1 fixed both reported CLI bugs).

Numbering continues this issue's series: Fix 1–10 above, **Fix 11–24 new**.

> **Correction to the record:** #99's "What's already shipped" table lists **Group B (`Verdict: PENDING`)** as resolved by #61/#76/#79. It is not. Fix 1 never landed — see Fix 13. The stub-first pattern did ship, but the prepend and the first-block parsers are untouched.

---

### Disposition of all 101 rows

| Disposition                           | Rows | Notes                                                                                                                                                  |
| ------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Already fixed — no action**         | 11   | Fix 4 force-with-lease (3), `[skip ci]`/CI-Dispatch KN-11 (2), Fix 8 `@live`-in-build (1), 4.3.1 CLI bugs (2), project-field id (1), Fix 10 sizing (2) |
| **Obsolete as written / transformed** | 5    | STRAY guard — the `pending.md`/`decisions.md` complaint is gone with #234, but the bug **re-appeared under the new filenames** → Fix 11                |
| **Refuted on inspection**             | 1    | `canonicalHash` drift claim — mechanism does not exist; real cause is different (see Fix 24 note)                                                      |
| **Open — new fixes**                  | 55   | Fix 11–24 below                                                                                                                                        |
| **Consumer-scoped, not bkit's**       | 12   | slop overrides, flaky e2e, ESLint boundary, unicode regex, test timeouts, root-level scripts                                                           |
| **Upstream / won't fix**              | 2    | auto-mode classifier merge-consent (not bkit's lever)                                                                                                  |
| **Corpus-integrity defects**          | 15   | see § Corpus integrity                                                                                                                                 |

---

### P0 — shipping broken today

#### Fix 11 — plan/design close STRAY guard rejects every ledger it mandates (recurrence-by-rename)

`bkit-plan.md:782` and `bkit-design.md:789` are byte-identical:

```bash
STRAY=$(git diff --cached --name-only | grep -vE '^docs/plans/|^\.bkit/friction\.md$' || true)
```

`.bkit/friction.md` **does not exist** — #234 renamed it to `.bkit/friction.jsonl`. The only non-`docs/plans/` allowlist entry is dead. Running the live regex against the real staged paths flags **all five** as STRAY → `exit 1`: `docs/deferrals.jsonl`, `docs/decisions.jsonl`, `docs/knowledge.jsonl`, `.bkit/friction.jsonl`, `.bkit/stats.jsonl`.

The workflow mandates the writes it then rejects: `bkit-plan.md:510` + Gate 7 `:540` (`deferrals.jsonl`), `bkit-plan-generate.md:45,46`, `bkit-design-generate.md:47`. This is the **same 5-occurrence bug the corpus already reported**, resurrected by a rename. The rows' proposed fix (widen to `pending|decisions`) is itself now stale.

**Fix:** both lines → `'^docs/plans/|^docs/(deferrals|decisions|knowledge)\.jsonl$|^\.bkit/(friction|stats)\.jsonl$'`.

#### Fix 12 — ship's only post-merge validation is a silent false-green

`bkit-ship.md:986-994`. Two independent defects in one gate:

1. **No `status == "completed"` assertion.** `:986` fetches `status` in the `--json` list and **never reads it** — a dead field, evidence the assert was intended. For an `in_progress` run `.conclusion` is `null` → `// empty` → `""`, and every check is fail-open equality (`= "failure"`, `= "skipped"`) → all false → **gate passes green on a run that hasn't finished**.
2. **Substring job match.** `:992` `test("test"; "i")` + `[0]` against the whole job list. Seven consumer jobs match `test` (`bkit-tests-static|-unit|-integration|-e2e|-live|-check|-migrate`); `[0]` picks whatever the API returns first, not the capstone. No job named exactly `bkit-tests` exists any more, so the gate prose `:983` and Gate-13 item `:1113` are stale too.

**The correct idiom is already in the same file, 620 lines up** — `:371-372` uses `select(.name == $n)` + fail-safe `!= "success"`. The defect is _not_ copy-pasted; `bkit-debug.md` is fail-safe. Ship is the lone outlier.

---

### P1

#### Fix 13 — Fix 1 never landed; `bkit-build.md` has zero verdict guards (20 rows — the corpus's largest cluster)

- Prepend survives verbatim at `bkit-plan-update.md:43`, `bkit-design-update.md:43`, `bkit-design-organise.md:43`.
- **All 33** extraction sites read the **first** `<!-- verdict:end -->`. Extraction is prose, not `awk` — a prose parser cannot be relied on to prefer a trailing block.
- Verdict re-invoke guard exists in `bkit-design.md` (3) and `bkit-plan.md` (2) — and in **`bkit-build.md`, `bkit-debug.md`, `bkit-ship.md`: zero**. Every truncating agent in the corpus (plan-execute, challenge-1/-2, summary) lives in `bkit-build.md`.
- `EXECUTE_VERDICT` is **never routed on**: `bkit-build.md:483` assert non-empty → `:484` extract → `:489-492` write `step-done` + commit. A truncated execute is recorded `verdict:"PENDING"` and the workflow proceeds.
- **Highest-value single edit:** `bkit-build-plan-execute.md` has the per-task log flush (`:45`) but **lacks the eager verdict flip** that challenge-1 has (`:43`). So truncation leaves a _populated log under a PENDING header_ — exactly the A2 signature.

_Incidental, found in the same pass:_ `bkit-plan.md:588` Gate 8 asserts `COMPLEXITY_VERDICT in PASS|FAIL` but the prompt emits `SINGLE|SPLIT` — **the gate can never pass**. And Fix 2's deterministic task-count gate (recorded shipped in `docs/completed.md:77`) is **absent** from `bkit-plan.md` Step 8; the count now lives only inside the prompt as "`grep -cE …` _or equivalent_" — back to LLM judgement.

#### Fix 14 — pre-worktree commit has no pathspec → sweeps the user's staged work

`git add` is an allow-list (#61, `3d2b665`) but **`git commit -m` carries no pathspec in any workflow** — `design.md:203`, `plan.md:207`, `build.md:260`, `ship.md:235`. A pathspec-less commit commits _the whole index_, so a pre-staged unrelated deletion is swept in regardless of what `git add` did. #61's fix does not address this path. **This is the destructive-backout row** (`ChatCTA.ts`, required `git revert`).

`bkit-ship.md:525-526` is worse: a second pre-commit site still uses the **old deny-list** #61 was meant to remove — effectively `git add -A` on the main checkout.

#### Fix 15 — `docs/plans/template.md` duplicates its own body; the stale half leaks a consumer stack

764 lines: 1–382 an unmarkered copy, 383–764 the `bkit:start…bkit:end` managed mirror. The halves **diverge across 22 lines and the outer (default-read) copy is the stale one** — including `@consumer-a/validators` at `:165` (**stack-independence violation**) and Unicode `≤` at `:40` (violates the ASCII-operators rule). Only `chore(release)` commits touch it: each `bkit upgrade` refreshes the inner mirror and leaves the outer to rot, so **divergence widens every release**, and it is structurally invisible to `bkit check`. `bkit-plan-generate.md:36,40,48` sends every plan-generate agent to read this self-contradicting file.

#### Fix 16 — the lock is a TOCTOU; two runs can both acquire (all 5 workflows)

`bkit-ship.md:132-150` (and `design:100/118`, `plan:101/119`, `build:143/161`, `debug:129/147`). `> "$LOCK"` truncate-creates unconditionally; no `noclobber`/`mkdir`/`flock` anywhere. The stale-check `exit 1` at `:146` fires **only if** the other run's folded status is already `IN_PROGRESS` _and_ has a step `.at`. A run holding the lock but not yet having written its first `step-done` reads as empty → skips the guard → falls to `:148` `rm -f "$LOCK"` → **deletes the live lock**. That is precisely the reported race, reproducible.

---

### P2 / P3 (summarised)

| Fix    | Rows | Gap                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Where                                     |
| ------ | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------- |
| **17** | 4    | Ship close gate hard-fails on a **pre-existing live-tier** failure at run level (`:991`) before any tier check; zero `live` matches in ship. Item 3 exiting means item 5's label reconciliation (`:1061`) never runs → merged work stranded as `bkit:ship`+`bkit:failed`, unrecoverable by re-run. **Distinct from Fix 8** (build-side, landed).                                                                                                                                                                               | `bkit-ship.md:991`                        |
| **18** | 4    | Benign non-`[skip ci]` dev drift → Failure Path, though the exact recovery recipe sits **two lines below** at `:736-737`. The `[skip ci]` carve-out exists but is inverted from what the rows need.                                                                                                                                                                                                                                                                                                                            | `bkit-ship.md:735`                        |
| **19** | 3    | Build branch-sync is docs-only (`-- docs/` pathspec) → non-docs dev commits never re-sync; no re-sync before challenge or push (`:1167` is fetch-only).                                                                                                                                                                                                                                                                                                                                                                        | `bkit-build.md:382`                       |
| **20** | 7    | No prompt asserts cwd before writing (**0 matches across all 46 prompts**); no orchestrator check that the artifact resolves under `$WORKTREE_PATH`. #209's `cd` injection covers all 46 dispatches but is a soft instruction, not a gate. Plus: no dirty-main-checkout gate before close-time squash; design/plan lack ship's `branch=dev` assert.                                                                                                                                                                            | prompts + `plan.md:779`/`design.md:786`   |
| **21** | 4    | Skills: bulk `npx skills add` (no `-s`), cap counts _gaps_ not skills; prune loop **silently no-ops under zsh** (`nomatch`, verified live) while Gate 11 ticks "pruned"; unanchored regex grep; `ship.md:873` **claims** lock-sync that doesn't happen (5 stale entries in bkit's own lock).                                                                                                                                                                                                                                   | `install-skills.md:40`, `ship.md:873-878` |
| **22** | 1    | `slop-scan.config.json` template doesn't ignore vendored skills — proven live, 2 findings in `.agents/skills/`. slop is the **only** shipped lint that doesn't exempt them (prettier/vale/renovate all do). Correct scope is `.agents/skills/**` + `.claude/skills/**`, **not** `.agents/**`. Tier-3 seed-or-print → template alone reaches new consumers only; `bkit-modules.ts:1843` merge instructions must name it too.                                                                                                    | template + `bkit-modules.ts:1843`         |
| **23** | 10   | `gh` 403 has **no fallback** — permission error is indistinguishable from red CI, both → Failure Path, though the runs-API fallback exists 70 lines below at `:358`. No pre-merge CI re-check (only read `:287`, merge `:545`). `env -u GH_TOKEN` absent from the entire shipped surface (KN-CORE-8 documents prevention, not recovery, and lives in `docs/` where consumers never see it). `rules.md:59`'s "backup only" clause names no backup — which is why 4 rows show orchestrators improvising `gh` during MCP outages. | `ship.md:287`, trackers.md                |
| **24** | 3    | Managed-block ownership warning exists **only** in `plan-scope-check-{1,2}.md:48`; design and build are unguarded. _(The rows' `canonicalHash` theory is refuted — `bkit check` never compares hashes; `pnpm bkit check` exits 0 against 382 lines of divergent consumer content. Real cause: `bkit-modules.ts:882` pushes `.bkit/version` into `ws.writes` outside the `!dryRun` guard, so a stale pin counts toward `totalWrites`.)_                                                                                         | build/design prompts                      |

**Doctrine item to settle:** project memory says "workflows are MCP-only for GitHub/Linear — no `gh` CLI". The shipped rule (`.agents/rules.md:59`) says _"Issue update via configured MCP only; use CLI/HTTP shell-outs as backup only."_ Those differ. Workflows honour the **shipped** rule exactly (0 `gh issue`/`gh api`/`gh project`; `gh` used only for PR/CI plumbing, which the rule doesn't cover). Under the strict memory reading, bkit's own `.bkit/trackers.md:89` (`gh api …/fields`) is a violation and Fix 23 is not actionable. **Either tighten `rules.md` or correct the memory** — Fix 23 depends on the answer.

---

### Corpus integrity — the harvest store is blind on the axes it slices by

Found while triaging; these are defects in the corpus itself, not in the workflows.

1. **93 of 101 rows carry `workflow:"migrate"`, `step:"bkit-telemetry-migrate"`** — the transport stamped as the origin. Fixed forward in `e93da128`, but **the existing rows were written by the pre-fix migrator and were never rebuilt**. Only 8 rows carry a true origin.
2. **The same rows predate two further fixes** — they have no `summary`, `severity`, `references`, or `source` at all, and `description` holds the title.
3. **Legacy `Step:` is a different vocabulary** — free-text numbered labels (`16 (summary push) — pre-push slop:delta`, `1-8`) vs the 64 canonical kebab ids live rows use. Recovering it verbatim keeps the step axis split; step numbers also shifted (Fix 9 merged Steps 17/18), so number-based mapping would fabricate precision.
4. **`key = slugify(title[:60])` collides — and it already cost a row.** `.bkit/jsonl.md:102` predicted this _and names this exact pair_. The migrator wrote **58** rows to `consumer-a`; harvest folded the colliding pair and stored **57**. Per #343's content-gated prune the fold-loser **stayed in the consumer** — nothing was destroyed, but the original STRAY-guard entry is **permanently stranded**: every future harvest folds it away and leaves it behind again. Recurrence entries are structurally the likeliest to collide, since a recurrence is titled like its original — i.e. the collision preferentially eats the highest-signal rows.
5. **54 friction entries were pruned from the consumer logs before migration and never reached the store** (27 consumer-a + 27 consumer-b), recoverable from git history with their own last status (7 `FIXED-IN:<ref>`, 22 `RECOVERED`, 21 none, 2 still `OPEN` at removal). Several are direct evidence for clusters above — "Ship Step 11 run-tests-skipped gate" (Group E.2), "Debug Step 6 rebase-on-dev requires force-push" (Fix 4), "Worktree gitignore" (Fix 6).

**Remediation in flight** (agreed this session): full re-migration of the 93 rows from the legacy corpus recovered at `b9bd7fcb~1` / `688d6dce~1` using the _fixed_ migrator contract (restores origin + summary/severity/references/source/description); `Workflow:` normalised to the 5-value enum (~17 values are dirty, e.g. `plan (523-shard-multiworker-e2e)`, `build → ship`); `Step:` mapped to canonical ids **only where unambiguous**, raw otherwise, with the mapped/unmapped split reported; the 54 pruned entries resurrected as `CLOSED`; the key made collision-resistant. The 8 live rows are preserved untouched.

_Note for the record:_ 2 of the 54 were still `OPEN` when removed, so blanket-`CLOSED` closes them; flagging once here rather than silently.

---

### Suggested sequencing

1. **Fix 11** and **Fix 12** — both ship broken behaviour today (a close that always fails; a merge gate that passes on unfinished CI). One-line changes each.
2. **Fix 13** — largest cluster (20 rows) and the eager-verdict-flip edit is one line.
3. **Fix 14**, **Fix 15**, **Fix 16** — one destructive, one leaking a consumer stack into the shipped template, one a live race.
4. Rest as capacity allows. **Fix 23** blocked on the doctrine call above.

## Triage state + recommended sequencing (2026-07-15)

Follow-up to the full-sweep comment above. The corpus work has landed; this records the final disposition state, one correction, and how to actually execute Fix 11–24.

### Corpus: rebuilt, and every entity now carries a disposition

Landed on `dev` as `573b9bb5` (rebuild) + `a9018658` (disposition fix).

|                                       | before |                                                                                    after |
| ------------------------------------- | -----: | ---------------------------------------------------------------------------------------: |
| entities                              |    101 | **156** (+54 resurrected from consumer git history, +1 recovered from the key collision) |
| rows                                  |    101 |                                                                                      257 |
| real origin `workflow`                |      8 |                                                                            **138 / 156** |
| `severity` / `summary` / `references` |      0 |                                                                          257 / 243 / 202 |
| disposition                           |   none |                                                               **78 TRIAGED · 78 CLOSED** |

Validated with the shipped `parse()`/`fold()` rather than a bespoke reader: 257 rows, **0 malformed, 0 entities missing required fields**.

**`TRIAGED` is now a first-class status** (`.bkit/src/bkit-telemetry.ts`, `.bkit/jsonl.md` § Updating a Row). It was already type-legal and nothing branches on friction `status`, so it is additive. It earns its place for the reason the ledger already gives for appending: a close is DATABLE, and `raised -> triaged -> closed` separates "sat unanalysed" from "knew but hadn't fixed" — two different failures that a bare `OPEN`/`CLOSED` pair cannot tell apart.

### Correction: 14 rows were mis-assigned TRIAGED

The first pass marked every analysed row `TRIAGED`, including **12 consumer-scoped** rows and **2 owned by the auto-mode classifier upstream**. Both are "not ours to fix", which `.bkit/jsonl.md` defines as **CLOSED** — while `TRIAGED` is defined there as _still-open work that readers counting open friction MUST count_.

Left as-is these could never have been drained: nobody in this repo can close a row whose fix lives in a consumer repo or in Anthropic's classifier. They would have inflated bkit's open-friction count permanently, with no path down. Fixed in `a9018658` (status only, 14 lines).

**Caveat for whoever picks this up:** ~12 of the remaining `TRIAGED` rows carry no `Fix N` — analysed and real, but unassigned (the misc long tail). Honest, but not actionable as written.

### ⚠️ Fix 11 must be done in-session, first — you cannot design/plan your way to it

Not a preference. **Fix 11 breaks the plan/design close-workflow, so `/bkit-plan` and `/bkit-design` cannot complete in this repo.** Running the live guard (`bkit-plan.md:782` / `bkit-design.md:789`) against the paths a close actually stages:

```
STRAY -> .bkit/friction.jsonl
STRAY -> docs/deferrals.jsonl
STRAY -> .bkit/stats.jsonl      -> exit 1 -> Failure Path
```

and `.bkit/friction.md` — the only thing the guard allow-lists besides `docs/plans/` — **does not exist** (#234 renamed it). bkit's own repo carries `.bkit/friction.jsonl` and `docs/deferrals.jsonl`, so a design/plan cycle here dies at its own close step. Attempting the cluster via the phase workflows would burn a full cycle and fail at the last gate.

### Recommended sequencing

| Bucket                                                              | Fixes                                                                                                                                   | Why                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **In-session now**                                                  | **11**, **12**                                                                                                                          | Both P0, both ~one line, zero design surface. 11 unblocks the phase workflows themselves; 12 stops a merge gate going green on unfinished CI.                                                                                                                                                                                                                                             |
| **In-session batch after**                                          | 14, 15, 18, 22, 24 + the Gate-8 ladder bug (`bkit-plan.md:588`, asserts `PASS\|FAIL` against a `SINGLE\|SPLIT` prompt — can never pass) | Mechanical, low-risk, no architecture.                                                                                                                                                                                                                                                                                                                                                    |
| **`/bkit-design` -> `/bkit-plan` -> `/bkit-build`** (once 11 lands) | **13**, 16, 17, 20, 21 + the `repo`-axis fix below                                                                                      | Real design surface. 13 is the largest cluster (20 rows) and a genuine choice: prepend->EOF vs last-block parser vs eager verdict flip, across 33 extraction sites + 3 workflows. 16 picks a lock primitive that is a cross-workflow contract. 17 needs tier semantics AND a recoverable half-closed state. 20 needs one pattern across 46 prompts. 21 needs a per-FID manifest contract. |
| **Blocked**                                                         | 23                                                                                                                                      | The `rules.md:59` vs project-memory doctrine call (see prior comment).                                                                                                                                                                                                                                                                                                                    |

### New defect found while triaging: the `repo` axis is split five ways

Same class as the workflow/step bug, on a third axis — and worse, because `identity()` puts `repo` in the tuple for **every kind** (`friction ${repo} ${key}`, `counter ${repo} ${workflow} ${parentSha} ${counterName}`), so a respelled repo **forks the entity**. `.bkit/jsonl.md:144` warns that a reworded `key` forks an entry; `repo` has identical power, carries no warning, and unlike `key` is not authored — it is derived three different ways:

1. `detectRepo()` (`bkit-telemetry-migrate.ts`) returns `package.json` `name` — an npm name, not a slug. For bkit it yields `@cbartens/bkit`; **the doc's own example value `cbartens/bkit` is unreachable by the code that fills the field.**
2. Orchestrator live writes — freehand, though `{OWNER_REPO}` (from `gh repo view --json nameWithOwner`, `bkit-build.md:172`) is in scope at Step 1 of every workflow.
3. `stampRepo()` -> `consumerPathToSlug()` (`bkit-harvest.ts`) — last two **filesystem path segments**, so `/Users/.../GitHub/consumer-a` becomes `GitHub/consumer-a`. The "owner" is a folder name on the operator's laptop.

Observed: `@cbartens/bkit` and `cbartens/bkit` **split within single files** (`.bkit/friction.jsonl`, `.bkit/stats.jsonl`); `consumer-a` vs `example-org/consumer-a` in `harvest/stats.jsonl`; and 3 rows in `consumer-a/.bkit/friction.jsonl` carry **no `repo`**, so the next `bkit harvest` will stamp them `GitHub/consumer-a` — a fourth spelling.

**Two load-bearing constraints for the fix:**

- **It cannot be repaired by appending.** `repo` is part of `identity()`, so an append with a corrected `repo` mints a NEW entity instead of updating the old one. This must be an in-place rewrite — a deliberate exception to § Updating a Row.
- **`harvest/friction.jsonl` is committed on the WRONG spelling.** The rebuild normalised toward the majority (`consumer-a`), which is the package name, not the slug. All 257 rows need re-canonicalising to `example-org/consumer-a` / `example-org/consumer-b`. Verification: entity count must stay **156 / 257 rows** — any change means an identity forked or merged.

### Preconditions before executing any of the above

- **`dev` currently fails `slop:delta`** — `added 4, net 3, score 7.00`, from commits already on `dev` (proven by stashing: identical numbers with the working tree clean). Pre-push will reject until resolved.
- **Concurrent sessions in one clone collide.** During this work another session committed my in-flight changes under `573b9bb5` via a broad `git add -A`. Benign this time; serialise before the next batch.

## 🚀 START HERE — handover for the next agent (2026-07-15)

Everything below is re-verified against `dev` @ `cac98d3c`. Tree clean, pushed, `slop:delta` green. **No blockers — you can start immediately.**

### What is already done (do NOT redo)

|                          | State                                                                                                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Friction corpus**      | ✅ Done. `harvest/friction.jsonl` = **257 rows / 156 entities**, every entity dispositioned **78 TRIAGED / 78 CLOSED**, `parse()` malformed 0, 0 missing required fields. |
| **`repo` axis**          | ✅ Closed, code AND data (`b363f04e`, `fa227538`, `7505f189`). One spelling per repo everywhere, each matching its real `git remote`.                                     |
| **`subagent` dimension** | ✅ Backfilled (`cac98d3c`) — 38 rows, 13 distinct agents.                                                                                                                 |
| **`slop:delta` on dev**  | ✅ Green (`ce745555`). Was a blocker; no longer.                                                                                                                          |

**Do not "fix" the ledger.** It is clean. If you change `repo` or `key` on any row, note that both are in the `identity()` tuple — a rewrite forks entities. The tripwire: **257 rows / 156 entities** before and after any touch.

### What is open: Fix 11–24 — none have been started

All 14 re-verified as still open at `cac98d3c`. The 11 recent commits were telemetry/JSONL work and touched **none** of them.

---

## ⚠️ Read this before choosing an approach

**You cannot use `/bkit-plan` or `/bkit-design` for this work until Fix 11 lands.** Fix 11 _is_ the bug that breaks their close step. Running the live guard against the paths a close actually stages:

```
STRAY -> .bkit/friction.jsonl
STRAY -> docs/deferrals.jsonl
STRAY -> .bkit/stats.jsonl      -> exit 1 -> Failure Path
```

The guard allow-lists `.bkit/friction.md`, which **#234 renamed out of existence**. bkit's own repo carries `.bkit/friction.jsonl` and `docs/deferrals.jsonl`, so a design/plan cycle here dies at its own close. Attempting the cluster via the phase workflows burns a full cycle and fails at the last gate.

**So: do Fix 11 + Fix 12 in-session, by hand, first.** Both are ~one line. Fix 11 unblocks the phase workflows for everything after.

---

## Start with these two (P0 — shipping broken today)

### Fix 11 — plan/design close rejects every ledger it mandates

`grep -n "STRAY=" .bkit/workflows/bkit-plan.md .bkit/workflows/bkit-design.md` — byte-identical in both:

```bash
STRAY=$(git diff --cached --name-only | grep -vE '^docs/plans/|^\.bkit/friction\.md$' || true)
```

The workflow mandates the writes it then rejects (`bkit-plan.md` Step 7 + Gate 7; `bkit-plan-generate.md`; `bkit-design-generate.md`). Suggested:

```bash
grep -vE '^docs/plans/|^docs/(deferrals|decisions|knowledge)\.jsonl$|^\.bkit/(friction|stats)\.jsonl$'
```

Confirm the real staged set first — `.bkit/stats.jsonl` is written to `$REPO_ROOT`, so check whether it reaches the index at close before allow-listing it.

### Fix 12 — ship's only post-merge validation is a silent false-green

`grep -n "TESTS_CONCLUSION=" .bkit/workflows/bkit-ship.md` (~`:982`). Two independent defects:

1. **No `status == "completed"` assert.** The run fetch (`--json databaseId,status,conclusion`) pulls `status` and **never reads it** — a dead field, evidence the assert was intended. On an `in_progress` run `.conclusion` is `null` → `// empty` → `""`, and every check is fail-open equality (`= "failure"`, `= "skipped"`) → all false → **the gate passes green on CI that hasn't finished**.
2. **Substring job match.** `test("test"; "i")` + `[0]` against the whole job list. Seven consumer jobs match `test` (`bkit-tests-static|-unit|-integration|-e2e|-live|-check|-migrate`); `[0]` takes whichever the API returns first, not the capstone. No job named exactly `bkit-tests` exists any more, so the gate prose and the Gate-13 checklist item are stale too.

**The correct idiom is already in the same file** (~`:371`): `select(.name == $n)` exact-match + fail-safe `!= "success"`. Copy it. `bkit-debug.md` is already fail-safe — the defect is not copy-pasted, ship is the lone outlier.

---

## Then

| Bucket                                                                | Fixes                                                                                                                                                                       |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **In-session batch** (mechanical, low-risk)                           | 14, 15, 18, 22, 24 + the Gate-8 ladder bug (`bkit-plan.md:588` asserts `COMPLEXITY_VERDICT in PASS\|FAIL` against a prompt that emits `SINGLE\|SPLIT` — **can never pass**) |
| **`/bkit-design` → `/bkit-plan` → `/bkit-build`** (once Fix 11 lands) | **13** (largest cluster, 20 rows), 16, 17, 20, 21                                                                                                                           |
| **Blocked**                                                           | 23 — needs the `rules.md:59`-vs-project-memory doctrine call (see the full-sweep comment)                                                                                   |

Fix 13 is the highest-value single edit in the whole set: `bkit-build-plan-execute.md` already flushes its log per-task but **lacks the eager verdict flip** that `bkit-build-challenge-1.md` has ("set `Verdict` = FAIL via `Edit` **immediately**; do NOT defer to final pass"). Truncation therefore leaves a _populated log under a `PENDING` header_ — the exact signature in 20 harvested rows. Also: verdict re-invoke guards exist in `bkit-plan.md` (2) and `bkit-design.md` (3) but are **0 in build, debug, and ship** — and every truncating agent lives in `bkit-build.md`.

## Gotchas

- **Line numbers have drifted twice during this triage.** Every anchor above is a `grep` target — grep the symbol, never trust the number.
- **Canonical sources are `.bkit/workflows/*` and `.bkit/prompts/*`.** Never edit `.claude/`, `.cursor/`, `.opencode/` — they are generated mirrors. Run `bkit install` **once at end of session**, not per edit.
- **Serialise.** Multiple sessions in this clone collided during this work — one committed another's in-flight changes via a broad `git add -A`. Check `git status` before you stage, and stage explicit paths.
- Several fixes touch all 5 workflows and are byte-identical across them (the lock, the pre-worktree commit, the line-29 git rules). Fix all 5 or the friction just relocates to the next phase.

## Verification

- Full suite: `npx vitest run` (2151 passing at handover).
- `pnpm bkit check` exits 0; `pnpm slop:delta` green.
- Ledger untouched: **257 rows / 156 entities**.
- For Fix 11: prove it by running the new regex against the real staged set, not by reading it.

## Session 2026-07-15 — Fix 11/12/14/15/18/22 + Gate 8 landed; friction sweep removed

Continues the [handover](https://github.com/cbartens/bkit/issues/99#issuecomment-4977046389). All **uncommitted on `dev`**. Ledger untouched: **257 rows / 156 entities**.

### The close-step friction sweep is gone (all 5 workflows)

> `2. Sweep .bkit/friction.jsonl for current workflow entries → ensure each has valid Recovery and Status.`

Removed from `bkit-{design,plan,build,debug,ship}.md` + the five `- [ ] Friction entries swept` gate items; close-step lists renumbered (verified contiguous 1..N in all five).

Both halves of the step failed:

- **`recovery`** — not decision-relevant. Priority is `severity` x recurrence; whether the operator recovered does not change whether the defect needs fixing. Its apparent unique content already belongs to `knowledge.jsonl` (escape hatch), `severity` (blast radius), `references` (evidence SHAs). And `bkit harvest` **drains** friction.jsonl out of the consumer repo, so no future agent ever reads the row — the escape-hatch defence does not survive that. Field removed outright: #234.
- **`status`** — the close-time write **cannot** transition for a consumer. A row is born `OPEN` and is still `OPEN` at close: the workflow recovered, but _bkit's_ defect is unfixed. The real `OPEN -> TRIAGED -> CLOSED` moves happen later, during triage in the bkit repo. Confirmed in the data: of 101 two-row entities, the second row is a triage disposition, not a close sweep.

The header rule (`**Friction:** watch → APPEND rows`) is the whole job. Capture at log time with `severity`/`category`/`remediation`; nothing to reconcile later.

Also fixed en route: `Recovery`/`Status` in that step were **legacy `.bkit/friction.md` markdown labels** — the real fields are lowercase (179 rows have `recovery`, zero have `Recovery`). Same #234 rename-residue class as Fix 11 below.

### Fixes applied

| Fix              | What                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **11**           | STRAY guard allow-listed `.bkit/friction.md`, which #234 renamed away -> every plan/design close died. Reproduced the real close (worktree -> `merge --squash`) and corrected the handover's proposed regex in both directions: it **omitted `docs/failures.jsonl`** (mandated by the found-bug rule, line 21 of both workflows) and added `stats`/`knowledge`, which nothing writes or stages here. `.bkit/stats.jsonl` is written to `$REPO_ROOT`, never the worktree — it never reaches the index, so allow-listing it would have re-created the exact dead-entry rot that caused this bug. Final: `^docs/plans/\|^docs/(deferrals\|decisions\|failures)\.jsonl$\|^\.bkit/friction\.jsonl$`. Proven to pass a legitimate close **and** still catch a stray `src/` edit. |
| **12**           | Added the missing `status == "completed"` assert. Did **not** hardcode `bkit-tests-check`: the template ships **no capstone** (fresh consumers get only `bkit-tests-static` + `bkit-tests-unit`), so that would break every new consumer. Gate now uses the capstone as sole authority where adopted (a deliberately self-skipped live tier must not false-fail) else every `bkit-tests*` lane, fail-safe on `!= "success"`. Substring bug was real — `latest-deploy` contains `test`. Run-level `conclusion` checks left alone (Fix 17 territory). Gate-13 item + prose updated.                                                                                                                                                                                          |
| **14**           | Pathspec-less `git commit` swept the user's pre-staged work. **Proven**: old form swept a staged `src/ChatCTA.ts` deletion (the incident that needed `git revert`); new form leaves it staged and intact. Fixed 4 pre-worktree sites + ship Step 6, which was still a deny-list (= `git add -A` on the main `dev` checkout).                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **15**           | `docs/plans/template.md` carried a 382-line unmarkered duplicate; the managed half was the fresher one. Now byte-identical to what `bkit upgrade` renders — which removed the `@consumer-a` stack leak and the Unicode `<=`. Also matches a friction row's own suggested remedy ("the template should not duplicate the body").                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **18** (partial) | Message only. The handover reads the guard as over-strict, but the rows say the opposite: pushing non-`[skip ci]` drift to `dev` is what **cancelled an in-flight feature-merge CI run** (#785 killed #784) — the very run Fix 12 validates. Auto-pushing would reintroduce that. Now lists the offending commits + the reconcile recipe that sat two lines below.                                                                                                                                                                                                                                                                                                                                                                                                         |
| **22**           | Confirmed live: 2 of 12 slop findings were in vendored third-party skills. Mirrored Vale's existing exemption set (`.agents/skills/**`, `.claude/skills/**`, `.cursor/skills/**`) in repo + template config, and updated `SLOP_SCAN_MERGE_INSTRUCTIONS` — the only path reaching **existing** consumers (`upgrade` reports `slop-scan.config.json — NOT overwriting`). 12 -> 10 findings, bkit's own 10 untouched.                                                                                                                                                                                                                                                                                                                                                         |
| **Gate 8**       | `bkit-plan.md` asserted `COMPLEXITY_VERDICT in PASS\|FAIL` against a prompt emitting `SINGLE\|SPLIT` — could never pass.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |

### Also this session

- **Tracker-block hoists** — the shared lead-in was authored 3x per site (`issue-id-extraction`, `fid-format`) across 5 workflows; now on the numbered line with only the per-tracker part inside the blocks (30 restatements -> 10). **Limit found and documented**: hoisting is only safe at `false`-block sites; a bare `github`/`linear` pair collapses to `_No tracker connected, skip step._` under `none`, so hoisted prose would strand above a "skip" stub. That is why the issue-scan `{QUERY}` prefix and the 73 `— NEW comment, no edit.` suffixes stay duplicated. Rendered and verified under all three tracker settings.
- **Tracker leaks on shared lines** — `bkit-build.md`'s FID line hardcoded "lowercase Linear `ISSUE_ID`", and two sites said "do not claim success on **Linear**". All now tracker-agnostic. The lowercase rule was **load-bearing, not noise**: Linear extraction yields uppercase `BAR-123` but the assert demands `^[a-z]+-[0-9]+...` — `BAR-123-foo` **fails the gate**. Relocated into the linear block in all 5 (build was the only workflow that stated it; the other four left it to an ambiguous trailing "lowercase").
- **`.bkit/workflows.md` synced** per `rules.md:130` — the pre-worktree primitive still documented the **pre-#61 deny-list** (stale before this session), Step 13 still named the non-existent `bkit-tests` job, Step 9 never mentioned the non-skip refusal.

### Still open

**13, 16, 17, 20, 21** — unchanged, need the design/plan/build track (Fix 11 no longer blocks it). **23** — still blocked on the `rules.md:59` doctrine call.

**24** — recommend re-scoping. Its rows' `canonicalHash` theory is already refuted in the triage, and its `bkit-modules.ts:882` claim looks wrong: pushing to `ws.writes` outside `!dryRun` is arguably correct, since a dry run _should_ report what it would write. The remaining ask (managed-block guard in design/build) is a placement decision, not a mechanical edit — this repo consolidated shared rules into one doctrine file rather than six prompts (`e4982ab6`), subagents do not read `rules.md`, and a live friction row shows the rule already being **over**-applied (an agent left a plan's mirror stale citing it).

Verified: 2193 tests pass, `pnpm bkit check` exits 0, `pnpm slop:delta` green (net -2), mirrors regenerated for all three harnesses.

## 🚀 START HERE — handover for the next agent (2026-07-15, session 2)

Continues the [previous handover](https://github.com/cbartens/bkit/issues/99#issuecomment-4977046389). Everything below re-verified against `dev` @ `8261d9d0`. **Tree clean. `dev` is 3 commits AHEAD of `origin/dev` and UNPUSHED.**

### ⚠️ Read this first — a second session is live in this clone

`git worktree list` shows **`.worktrees/58-workflow-counters` on `feat/58-workflow-counters`**, and it is ACTIVE — it committed to `dev` at 20:50 (`8261d9d0`) while this session was committing at 20:48 (`b953237c`).

**Do NOT `git add -A` on this clone.** Stage explicit paths only. This session found 3 files dirty that belonged to #58 and deliberately left them out; the other session then committed them itself. Both commits survived because staging was explicit — a broad `git add` would have swept them.

Relevant mechanic (proved this session): `STATS="$REPO_ROOT/.bkit/stats.jsonl"` writes to the **main checkout even from inside a worktree**, so a worktree run dirties `dev`'s tree. `.bkit/stats.jsonl` is never staged by any close step, so it accumulates there indefinitely.

`dev` unpushed x3: `29aee9ea`, `b953237c` (this session), `8261d9d0` (#58's).

---

### Shipped this session (`b953237c` — do NOT redo)

| Fix                         | State                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **11** STRAY guard          | ✅ Allow-list corrected to the ledgers each phase actually mandates. **The previous handover's proposed regex was wrong in both directions** — it omitted `docs/failures.jsonl` (mandated by the found-bug rule, line 21 of every workflow) and added `stats`/`knowledge`, which nothing writes or stages here. `.bkit/stats.jsonl` never reaches the index (proved by repro), so allow-listing it would have re-created the exact dead-entry rot that caused this bug. |
| **12** ship close gate      | ✅ `status == "completed"` assert added; job match is now capstone-or-lanes, fail-safe on `!= "success"`. **Did NOT hardcode `bkit-tests-check`** — the template ships no capstone, so that would break every fresh consumer. Substring bug was real (`latest-deploy` contains `test`).                                                                                                                                                                                 |
| **14** pathspec-less commit | ✅ All 4 pre-worktree sites + ship Step 6 (which was still a deny-list = `git add -A` on the main checkout). Proved: old form swept a staged `src/ChatCTA.ts` deletion; new form leaves it intact.                                                                                                                                                                                                                                                                      |
| **15** template duplication | ✅ `docs/plans/template.md` now byte-identical to what `bkit upgrade` renders (764 -> 384 lines). Removed the `@consumer-a` stack leak + Unicode `<=`.                                                                                                                                                                                                                                                                                                                  |
| **18** dev-drift            | 🟡 **Message only — behavioural half deliberately NOT done.** The handover reads the guard as over-strict; the rows say the opposite: pushing non-`[skip ci]` drift to dev is what **cancelled an in-flight feature-merge CI run** (#785 killed #784) — the run Fix 12 validates. Auto-pushing reintroduces that. Left as a real decision.                                                                                                                              |
| **22** slop vendored skills | ✅ Confirmed live (2 of 12 findings). Mirrored Vale's exemption set; updated `SLOP_SCAN_MERGE_INSTRUCTIONS` — the only path reaching **existing** consumers (Tier-3, never overwritten).                                                                                                                                                                                                                                                                                |
| **Gate 8**                  | ✅ Asserted `PASS\|FAIL` against a `SINGLE\|SPLIT` prompt — could never pass.                                                                                                                                                                                                                                                                                                                                                                                           |
| **#234**                    | ✅ `recovery` removed end-to-end; `isOpenWork()` deleted; `status` now validated on write. See #234.                                                                                                                                                                                                                                                                                                                                                                    |
| **Workflow prose sweep**    | ✅ All 8 files read in full (5,846 lines). Rationale / why-parentheticals / justifying comments / internal labels stripped; rehomed to `.bkit/workflows.md`. Net **-312 lines** off a surface where every byte is paid per run.                                                                                                                                                                                                                                         |

---

### Open — verified still open at `8261d9d0`

**13 — the largest cluster (20 rows), and now UNBLOCKED (Fix 11 landed).** Re-verified:

```
eager verdict flip:  challenge-1 = 1,  plan-execute = 0
verdict re-invoke guards: plan 2, design 3, build 0, debug 0, ship 0
```

Every truncating agent in the corpus lives in `bkit-build.md`, which has **zero** guards. The single highest-value edit is still one line in `bkit-build-plan-execute.md`.

**16 — lock TOCTOU.** Re-verified: **5** `printf … > "$LOCK"` sites, **0** uses of `noclobber` / `mkdir` / `flock`. Two runs can both acquire.

**20 — no cwd assertion.** Re-verified: **0 of 46** prompts assert `pwd` before writing.

**17, 19, 21** — unchanged, not started.

**23** — still blocked on the `rules.md:59`-vs-project-memory doctrine call.

**24** — **recommend re-scoping before starting.** Its rows' `canonicalHash` theory is already refuted in the triage, and its `bkit-modules.ts:882` claim looks wrong to me: pushing to `ws.writes` outside `!dryRun` is arguably correct, since a dry run _should_ report what it would write. The remaining ask (managed-block guard in design/build) is a **placement decision**, not a mechanical edit — this repo consolidated shared rules into one doctrine file rather than six prompts (`e4982ab6`), subagents do not read `rules.md`, and a live friction row shows the rule already being **over**-applied (an agent left a plan's mirror stale citing it).

### Open — #234 side

- **`jsonl.md:179` advertises three consumers that do not exist** — "CI gate on open `CRITICAL` failures, audit debt lens, age report". Re-verified: **0** `isOpenWork` references in TS. Either wire them or correct the doc.
- **Corpus integrity, still unremediated** (the triage's "re-migration in flight" never ran): **25** rows still stamped `workflow:"migrate"`, **14** rows with no `summary`. Plus the 54 pruned entries that never reached the store, and the `key` collision.
- 3 legacy free-text `status` rows (`WORKED_AROUND`, `Resolving`, a sentence) now fail the new write-time gate. **Harmless and deliberate** — they are superseded history, not entity-current; nothing re-validates existing rows; `parse` reads them fine.

### Smaller, flagged not fixed

- **`Route:`** — documented in `workflows.md` § Labeled decision blocks as one of two labels; **zero instances** in any workflow. Same "documents a thing that doesn't exist" shape as `isOpenWork`. Either drop it from the rule or adopt it.
- **`bkit-debug.md:1197`** — `ONLY add PR link if TRIGGER_PR = 1` (lowercase conditional). Owner said leave.
- **7 sites** still read `push (force-with-lease on **the** personal branch, plain on dev/main)`; the abort-path sibling was shortened to article-dropped style. Align all 7 together if you want it uniform.
- The **#99/#234 comments above this one** describe earlier states — they predate the friction-sweep removal, the `Decide` conversion and the prose sweep. This comment is current.

### Gotchas

- **Serialise, or use a separate clone.** See the top section — #58 is live here.
- **Line numbers drift constantly.** Every anchor above is a `grep` target.
- **Canonical sources are `.bkit/workflows/*` and `.bkit/prompts/*`.** Never edit `.claude/`, `.cursor/`, `.opencode/`. Run `bkit install <module-flags>` (bare errors) **once at end of session**; it needs `--claude --cursor --opencode=opencode --ci --typescript --dependency=renovate --renovate=self --auto=claude --tracker=github` to match this repo's manifest, and `git config core.bare false` after.
- **New authoring rules landed** in `.bkit/workflows.md` § Workflow Authoring Rules — read them before touching a workflow: **no internal labels / no coined guard names**, **bash decides, prose routes** (branch on the exit code, never on a restatement of the domain condition), and the tracker-block **hoist limit** (only safe at `false`-block sites).
- **A regression guard was anchored on a comment.** `bkit-ci-dispatch-gate-alignment.test.ts` sliced from `# ciDispatch verdict is ALWAYS written` — deleting it as rationale broke 6 tests. Re-anchored to `--arg o "$CI_OUTCOME" --arg h "$PUSHED_HEAD"`. If you strip more comments, check for test anchors first.

### Verification

- `npx vitest run` — **2204 passing** at handover.
- `pnpm bkit check` exits 0; `pnpm slop:delta` green (net -2).
- Ledger tripwire: **257 rows / 156 entities**.

## 🔍 Verification pass over the open list (2026-07-15, session 3)

Continues the [previous handover](https://github.com/cbartens/bkit/issues/99#issuecomment-4979733208). Every item it listed open was re-verified against `dev` @ `8113642f` (5 parallel audits + direct tracing). **Tree clean, `dev` == `origin/dev`, and the #58 worktree is gone.**

**Headline: roughly half the open list is refuted, already fixed, or misdescribed — and the audit surfaced 3 bugs no triage named, one of them serious.** Numbers below are re-derived, not inherited.

### ⚠️ Method warning — read before trusting any prior comment in this thread

Claims in this thread have been re-derived from drifted line numbers and **wrong paths**, then inherited as fact by the next handover. Three concrete cases found this pass:

- **`Route:` "zero instances"** — grepped `.bkit/workflows.md` (the _doc_) instead of `.bkit/workflows/*.md` (the _workflows_). There are **16**.
- **"All 33 extraction sites"** — `grep -h 'Verdict extracted and valid' .bkit/workflows/*.md | wc -l` = exactly **33**. That is the count of _gate checklist items_, a different artifact. The real extraction count is 31.
- **`src/bkit-modules.ts:882` / `.bkit/rules.md:59`** — neither path exists. They are `.bkit/src/bkit-modules.ts:882` and `.agents/rules.md:61`.

Every anchor below is a `grep` target, verified at `8113642f`.

---

## Confirmed — the 3 real bugs

### A. NEW / P0 — `bkit-build.md` Step 5 never routes on `EXECUTE_VERDICT`

`EXECUTE_VERDICT` has exactly **4** occurrences in `bkit-build.md`, and **not one is a route**:

```
:484  extract EXECUTE_VERDICT        <- sentence ends. no validity assert, no re-invoke
:489  written verbatim into status.jsonl
:503  echoed into the tracker comment
:512  gate checklist item
```

`bkit-design.md` has both halves at the same structural position:

```
:507  extract ORGANISE_VERDICT. **If** not in PASS|CONCERNS|FAIL -> invoke subagent again ... -> **If** still invalid -> **Failure Path**.
:508  4. **If** ORGANISE_VERDICT = FAIL -> **Failure Path**.
```

**So when `@bkit-build-plan-execute` returns `Verdict: FAIL` — a plan task ended `BLOCKED`, or lint/typecheck failed — build proceeds to Step 6 (Plan Verify) as though it passed.** The agent reports it could not implement the plan and the workflow ignores it. The `:481` assert checks _non-empty only_, so a truncated `PENDING` file also sails through and is written verbatim into `status.jsonl` at `:489`, violating the schema at `:29` (`verdict (PASS | FAIL | CONCERNS)`). The only thing catching either case is the orchestrator voluntarily honouring a prose checklist.

Step 5 is the weakest of all 31 extraction sites — the only one lacking _both_ an inline validity assert and FAIL routing.

**Fix:** 2 lines copied from `bkit-design.md:507-508`. This — not the prepend — is Fix 13's real content.

### B. P0 — ship strands merged work (this unifies Fix 17 + Fix 18 + re-run recovery)

The merge at Step 6 (`:548`) is a point of no return. Two later steps hard-exit past it:

| Site           | Trigger                                                                            |
| -------------- | ---------------------------------------------------------------------------------- |
| Step 9 `:741`  | benign non-`[skip ci]` dev drift                                                   |
| Step 13 `:993` | **run-level** `conclusion = "failure"` — fires before the tier logic at `:994-997` |

Both -> Failure Path -> `:73` adds `bkit:failed` **additively** (`prior phase label persists`). Step 13 item 4 (`:1071`) — "Drop all `bkit:*` phase labels, add `bkit:merged`, drop `bkit:failed`" — never runs. **The work is merged on `dev`; the issue is stuck at `bkit:ship` + `bkit:failed`.**

**Unrecoverable by re-run, two independent ways:**

1. **Step 12 runs before Step 13's gate** and deletes the worktree (`:925`), local branch (`:934`) **and remote branch** (`:939`). A re-run's Step 2 else-branch (`:275`) creates a fresh empty `feat/{FID}`; Step 3's regression guard then finds no history -> `CURRENT_RUN_ID` empty -> `REGRESSION_VERDICT` = FAIL (`:365-366`) -> Failure Path again.
2. **Step 6 is not idempotent.** `gh pr merge` at `:548` has its exit code unchecked (subshell), then:

```bash
RUN_ID=$(gh run list --branch dev ...)
[ -z "$RUN_ID" ] && { echo "CI did not trigger on dev after merge at $PUSH_AT" >&2; exit 1; }
```

This exits **before** `:561` extracts `state` and **before** `:585` `**If** state = MERGED -> Step 9`. It therefore preempts _both_ designed routes: the already-merged skip-forward, and the counter-bus retry at `:586-596` built precisely for a failed merge.

Two further defects in that same guard, worth fixing while it is open:

- **Latent race** — `PUSH_AT` captured, `sleep 30`, 60s window. Actions queue latency routinely exceeds that, so a good merge can register as "CI did not trigger on dev" -> Failure Path. Plausibly the real mechanism behind rows blaming other causes.
- **No documented route** — this `exit 1` has no `**If** exit non-zero -> **Failure Path**` line, unlike its siblings. Behaviour is orchestrator discretion.

**The framing that resolves this cluster: a post-merge gate is not a gate.** You cannot un-merge. Checking the squashed result is valuable _signal_, but its failure action must be label + comment + notify — never a Failure Path that strands the issue. Drift checks that legitimately want to abort (Step 9) belong **before** the merge, where exiting is free.

This also settles Fix 18: the previous handover was **right** to refuse the behavioural half. Auto-pushing non-`[skip ci]` dev drift re-creates the cancellation that killed #784. The guard's _message_ is correct; its _placement_ (post-merge) is the bug.

### C. NEW / P2 — `bkit-build.md:298` branches from `HEAD`, not `origin/dev`

```bash
git fetch origin dev
git worktree add "$WORKTREE_PATH" -b "feat/{FID}" HEAD        # build:298  <- fetches, then ignores
git worktree add "$WORKTREE_PATH" -b "feat/{FID}" origin/dev  # ship:275   <- correct
```

A fresh build off a stale local `dev` starts stale, and Step 3's sync is `docs/`-triggered so it may never correct it. One-word divergence between two otherwise-identical blocks. (Found while assessing Fix 19, which is itself low-severity — see below.)

---

## Refuted or already fixed — do NOT spend a session on these

| Item                                          | Finding                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **13 — prepend causes dual verdict blocks**   | **REFUTED.** All 3 prompts declare the verdict at the **TOP** (`plan-update.md:60`, `design-update.md:59`, `design-organise.md:64`), so the prepend correctly _stubs_ the canonical location — it is the stub-first pattern working as designed. `design-organise.md:39` strips first (`awk`); `design-update` / `plan-update` @ Step 5 read verdict-less inputs (`design-v1-draft.md`, `plan-v1-draft.md` carry 0 markers — `plan-generate.md` has 0 occurrences of "Verdict"). **Only `plan-update` @ `bkit-plan.md:509` (Step 7)** reads a verdict-bearing input. **Empirically 0 duplicates in any real artifact** — `202607/logs/342-injection-hardening/plan-v3-checked.md:1-2` has exactly one block despite `cp`-ing a verdict-bearing input. The multi-marker files are false positives (prose _describing_ the marker). If closed at all: copy `design-organise.md:39`'s `awk` strip into `plan-update.md:39`. |
| **13 — "all 33 sites read the FIRST marker"** | **REFUTED x3.** (a) Real count is **31** instruction lines / 36 file-level. (b) Every site is **prose** (`Read X until <!-- verdict:end --> -> extract Verdict`) — there is no `awk`/`sed`/`grep` verdict extraction anywhere in the workflows; nothing reads first _or_ last. (c) 33 = the gate-item count (see method warning).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **Gate 8 `COMPLEXITY_VERDICT`**               | **ALREADY FIXED** at `b953237c`. `bkit-plan.md:590` = `SINGLE\|SPLIT`, matching `plan-complexity-check.md:47`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **`Route:` label documented but unused**      | **REFUTED — 16 instances**: build 678, 778, 835, 887, 953, 1132; debug 416, 593, 660, 892; ship 499, 584, 846; plan 633, 698; design 590. Sibling ``Decide `VAR`:`` has 9. Both documented labels are in active use.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **7 push sites divergent**                    | **ALREADY FIXED** at `8113642f`. Was **8** sites / **2** variants (not 7 / 1); now 100% uniform, 0 residual drift.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **24 — `ws.writes` outside `!dryRun`**        | **REFUTED — works as intended.** (Correction to the prior handover's _reasoning_: `totalWrites` is **not** just a report — it gates `bkit check` exit 1 at `bkit-install.ts:2725-2735`. But the conclusion holds.) The same line runs in install and check; moving it inside `!dryRun` would make `check` under-report by one relative to a real install — the opposite and worse bug for a drift detector. The contract is literally "would N writes occur?" and a real install _would_ write. Drift semantics are deliberately over-inclusive (`:2711-2718`, #256). No feedback loop: the hash loop at `:840-854` skips the version file at `:843`.                                                                                                                                                                                                                                                                    |
| **24 — `canonicalHash` drift**                | **REFUTED.** `bkit check` -> `runInstall(dryRun:true)`. The only hash comparison is `diffFile` (`bkit-upgrade.ts:186`), whose sole caller is `runUpgrade` (`:364`) -> `bkit-install.ts:2225`, guarded by `upgradeFlags` — i.e. the **`bkit upgrade` command**, not `check`. `isCanonicalUnmodified` has 0 non-test callers.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **#234 — 54 entries pruned pre-migration**    | **REFUTED.** Reconstructed commit-by-commit entry counts of the legacy `.bkit/friction.md` in both consumers: **both grew strictly monotonically; there was never a truncation.** consumer-a `9 -> 58` then `0` at `b9bd7fcb` (the migration itself); consumer-b `1 -> 36` then `0` at `688d6dce`. 54 appears only as an intermediate count — the likely conflation source. Nothing failed to reach the store on this path.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **#234 — key collision, fold-loser stranded** | **REFUTED x3.** The key is **not** `slugify(title[:60])` — `bkit-telemetry-migrate.ts:489-493` `stableKey()` appends `sha256[:7]` whenever truncation discards characters, and its doc comment names this exact pair as the motivating case. (1) The pair is stored under **separate** keys (`...-102b388`, `...-c710e94`); both survive. (2) The prune is content-gated on byte-equal `canonicalRow()` (`bkit-harvest.ts:287-327`) and reports losers via `collisionRetained` — a loser can never be destroyed. (3) The "stranded" row is on disk **right now** at `consumer-a/.bkit/friction.jsonl:1`. "58 written / 57 stored" is a category error: 57 is an _entity_ count after `fold()`, not storage loss (`jsonl.md:183` — readers count entities, never lines). The destruction did happen **once, pre-fix**, recorded at `docs/knowledge.jsonl:54` — that is #343's historical bug, not current state.          |
| **#234 — `jsonl.md:179` phantom consumers**   | **REFUTED / self-retracted.** The only part that asserted an implementation — the trailing `(isOpenWork() in the codec)` pointer — was already deleted with the function in `b953237c`. What remains is prescriptive guidance _for readers_ ("if you build a CI gate / audit lens / age report, count `TRIAGED`"), not a claim bkit ships them. The author already retracted this in #234. **Nothing to do.**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **#234 — 3 legacy free-text `status` rows**   | **CONFIRMED harmless**, substantiated by code rather than assertion: `bkit-telemetry.ts:535-544` — _"Enforced on write only; `parse` stays tolerant so legacy free-text statuses still read."_ They fold and read fine; they merely cannot be re-written. Correct by design.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **19 — non-docs dev commits never re-sync**   | **PARTLY REFUTED, LOW severity.** `-- docs/` at `:382` restricts the **trigger**; the action is a full `git merge origin/dev`. And Step 2's resume path (`:271-272`) does a full **unrestricted rebase** onto `origin/dev` — only a single-session, never-resumed build relies on Step 3 alone. Four mitigations: PR CI builds a head+base merge commit (drift _is_ exercised at PR time), ship Step 2 (`:249`) does a full rebase, turbo's `--filter='...[origin/dev]'` stays fresh, textual conflicts surface at the PR. Gate 3 states the scope honestly (`- [ ] docs/ not behind origin/dev`) — the step is docs-scoped **by design**. The genuine bug nearby is `:298` (item C above).                                                                                                                                                                                                                              |
| **21 — `-s` flag missing**                    | **Flag REFUTED, substance CONFIRMED.** No `-s` flag exists; the selector is an `@skill` suffix (`.agents/skills/find-skills/SKILL.md:91`). But `npx skills add <owner/repo>` installs the **whole repo's** set, proven by bkit's own lock: `antfu/skills` -> 2, `wshobson/agents` -> 2, `obra/superpowers` -> **14**. So `:39`'s "install ONE per gap" is unachievable with `:40`'s command.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **21 — cap counts gaps not skills**           | **REFUTED** — the text says "skills" and always has (`git log -S"Cap at 10"` -> `69c7fa03` / `01f8b8d9`, identical wording). The real defect is the inverse: the cap is in _skills_ but the loop's only controllable unit is the _gap_, so 10 gaps can install far more than 10 skills. **Unenforceable as written**, not miscounted.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **21 — prune silently no-ops under zsh**      | **REFUTED for the normal case** (15 dirs on disk -> the loop runs correctly; Gate 11 is not ticking over a no-op). And zsh **errors loudly** (`no matches found` aborts the command) — it does not silently no-op. Narrow real risks only when `.agents/skills/` is empty/absent: zsh -> step aborts; **bash -> literal glob -> `npx skills remove '*' -y`**.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |

---

## Confirmed, still open — with corrected framing

### Fix 23 — **UNBLOCKED. There was never a doctrine conflict; the blocker was a stale memory.**

- The rule is **`.agents/rules.md:61`** (+ byte-identical template `.bkit/templates/.agents/rules.md:61`, CI-gated per DE-22): _"**Tracker MCP:** Issue update via configured MCP only; use CLI/HTTP shell-outs as backup only."_ (`.bkit/rules.md` does not exist.)
- **Workflows are 100% compliant:** `gh issue` **0**, `gh api` **0**, `gh project` **0**. All 56 `gh` calls are PR/CI/repo-identity plumbing (`pr view` 16, `run view` 7, `run list` 7, `pr list` 7, `repo view` 6, `pr create` 5, `pr edit` 2, `run download` 1, `pr update-branch` 1, `pr merge` 1). The shipped rule is scoped to _"Issue update"_ and does not cover PR/CI plumbing at all.
- The memory targets **`.agents/workflows/*.md` — a path that does not exist in this repo.** This was already caught once and recorded at `docs/plans/202606/logs/203-ci-green-validated/plan-v1-draft.md:303`, then lost.
- `trackers.md:89`'s `gh api .../fields` is **not** a violation: one-time human setup, a metadata _read_, and it exists to feed the MCP `projects_write` call correctly.

**Decision needed (owner):** read strictly, the memory would condemn all 56 PR/CI calls and outlaw the ship workflow. Either **tighten `rules.md`** to match, or **correct the memory** to match `rules.md`. Either way the `.agents/workflows/*.md` path is wrong and should be fixed.

**Substance CONFIRMED** — `bkit-ship.md:289`:

> **If** query errors **or** any check failed **or** rollup empty -> **Failure Path**.

Three semantically distinct conditions (403 permission error / red CI / not-yet-started run) collapse into one outcome. **Correction:** the runs-API at `:359-363` is a _different step_ (Step 3 regression guard) with the opposite polarity, **not** an unreached fallback — the accurate finding is stronger: **there is no fallback at all.** `env -u GH_TOKEN` appears only at `scripts/secrets/sync-github.sh:48`, never in `.bkit/`. KN-CORE-8 (`docs/knowledge.jsonl:8`) is prevention-only, and `knowledge.jsonl` is **not in `.bkit/templates/docs/` at all** — consumers get nothing, not a stale copy. **No pre-merge CI re-check:** read at `:289`, merge at `:548`; `gh pr update-branch` (`:547`) rebases onto fresh `dev` and then merges without re-checking against the new head.

### Fix 17 — real, but it is a **design contradiction**, not a line fix

`.bkit/workflows.md:661` states build deliberately does not run the live tier — `@live` needs a deployed URL, so it is _"validated post-merge by the push-only `bkit-tests-live` CI canary and reproduced on demand via `/bkit-debug`"_, i.e. **informational**. Ship Step 13 gates on **that exact run** (`:986` `--branch dev --commit "$SQUASH_SHA"`) as a **blocking** gate, _after_ the merge is irreversible.

- **"Port build's pattern" is not actionable — inverted.** Fix 8 was `@live` **removal** from build (`a4468f9c`: _"Fix 8 @live-removal"_; follow-up `b3908a6c` _"scope live tier to debug"_). `grep -c -i live bkit-build.md` -> **0**. There is no pattern to port.
- **Deleting `:993` is necessary but NOT sufficient.** Per `docs/testing.md:39-41` the capstone `bkit-tests-check` `needs:` **all** lanes, so a red `bkit-tests-live` reds the capstone -> the tier check at `:996` catches it anyway. Making `:996` tier-aware alone also fails, because `:993` short-circuits first.
- **bkit cannot dogfood-detect this.** `ci.yml:169` hardcodes `run_live: false` (`ci.yml:678`: _"all N/A for single-package, no-deploy bkit"_). It can only fire in consumer repos with a deploy. `grep -c -i live bkit-ship.md` -> **0**.

**Decision needed (owner): should ship gate on the live tier at all?** Doctrine says no. If no, the gate must select non-live lanes explicitly rather than use the capstone.

### Fix 13 (residual) — eager-flip asymmetry is real and **larger** than described

28 verdict-bearing prompts: **8 eager / 5 partial / 15 final-pass-only**. **All of design and plan have zero eager-flip prompts.**

`bkit-build-plan-execute.md` specifically: `:44` has a _narrow_ flip (missing `Done when` only, and without the `immediately; do NOT defer` qualifier); `:45` appends a `BLOCKED` log entry but triggers **no** flip; `:48-50` computes FAIL only in the final pass. Truncation therefore leaves a populated log under a `PENDING` header — the A2 signature. Reference idiom to copy: `bkit-build-challenge-1.md:43`.

Note this is **mitigated but not fixed** by the gates: `PENDING` fails all 33 `Verdict extracted and valid` items, so truncation is caught — _if_ the orchestrator honours the checklist. The 17-item `No PENDING placeholders remain` gap (ship is weakest: 8 verdict gates, 1 PENDING gate) affects only **body** placeholders, which no verdict gate covers.

### Fix 16 — lock TOCTOU: confirmed and mechanically worse, but **aimed at the wrong target**

5 sites (`design:118`, `plan:119`, `build:159`, `debug:147`, `ship:150`), **0** uses of `noclobber` / `flock` / `mkdir`-mutex. Two windows, not one:

1. **Cold start** — both runs see `[ -f "$LOCK" ]` false, the guard body never executes, both `printf`. Not a TOCTOU at all.
2. **Stale-check fall-through** — Step 1 writes **nothing** to `status.jsonl` (`workflow-started` lands in Step 2, _after_ `git worktree add` + `pnpm install`, a ~30-120s window). `LAST` = null -> `LAST_STATUS` = "" -> guard skipped -> `rm -f "$LOCK"` **deletes the live lock**. (2b: `steps:[]` -> `LAST_AT` = "" -> same.) No re-verify after `rm`. Cross-delete is **silent**: A's close `rm -f` deletes B's lock and A's `[ ! -f "$LOCK" ]` assert _passes_.

**But the blast radius is narrow and points elsewhere.** `$LOCK` is **per-FID** (`docs/plans/{YYYYMM}/logs/{FID}/.lock`), so it only guards two runs on the _same_ feature. **Every collision actually observed was cross-FID** — #58 running live in this clone during session 2; the 2026-05-26 `core.bare` / push-block incident. **A per-FID lock could not have prevented any of them**, and there is **no cross-FID guard anywhere** in the workflows. Ledger evidence for lock/race incidents: **0 rows**.

Minimal fix if taken (`set -C` is POSIX; bash 3.2 / 5 / zsh all fine; must not use `>|`, which bypasses noclobber in zsh):

```bash
if ! (set -C; printf '%s design\n' "$(date -u +%FT%TZ)" > "$LOCK") 2>/dev/null; then
  # ... existing stale-check ...
  rm -f "$LOCK"
  (set -C; printf '%s design\n' "$(date -u +%FT%TZ)" > "$LOCK") 2>/dev/null \
    || { echo "Lock contended for {FID}" >&2; exit 1; }
fi
```

Arguably higher-value companion: replace the stale-check fall-through with a lock **mtime** probe (`stat -f %m` BSD / `stat -c %Y` GNU — matching the existing `date -j -f` / `date -d` fallback idiom at `design.md:112`). That alone closes windows 2 and 2b; `set -C` closes window 1.

### Fix 20 — confirmed, zero incident evidence

**0 of 46** prompts contain `pwd` or any `cd`. The 46 dispatch sites _do_ say _"Switch into working directory `cd "{WORKTREE_PATH}"` -> verify with `pwd`"_ — but it is prose in a Context line with no prescribed comparison, no failure branch, and no orchestrator check. No gate resolves an artifact against `$WORKTREE_PATH`: `design.md:741-745` asserts `[ -s "$CANONICAL" ]` on a **relative** path, which passes identically from the main checkout. design/plan lack ship's `branch=dev` assert (`ship:735`) — they do have a `STRAY` allow-list that partially compensates; build has neither.

**Searched `docs/failures.jsonl` (1 row), `.bkit/friction.jsonl`, `docs/knowledge.jsonl`: 0 recorded instances of an artifact landing in the wrong place.** The ledgers are young, so absence is weak evidence — but the "real-world impact" framing is currently unbacked.

### Fix 21 — the confirmed half: `ship.md:874`'s lock-sync claim is false advertising

> _"...uninstall any `.agents/skills/` skills not listed in `.agents/skills.md` via the CLI **(keeps `skills-lock.json` and `package.json` in sync)**"_

**Wrong on both halves.** `skills-lock.json` (repo root, not under `.agents/`) is out of sync **bidirectionally**: **7** lock entries vs **15** dirs on disk, overlapping in exactly one (`find-skills`).

- **STALE (in lock, not on disk) — 6, not 5:** `github-actions-docs`, `nodejs-backend-patterns`, `opencode-qa`, `pnpm`, `typescript-advanced-types`, `vitest`
- **UNTRACKED (on disk, not in lock) — 14:** every `obra/superpowers` skill

The 6 stale entries are direct evidence that dirs were removed by something _other than_ `npx skills remove`. And **`package.json` contains zero skills references** — it is not a skills registry in this repo at all.

Also confirmed: the unanchored grep at `ship:878` interpolates `$skill` as a **regex** and matches anywhere including prose/URLs — fails toward **under-prune (fail-safe)**. Today's stale names are safe (skills.md has 0 occurrences of `pnpm` or `vitest`), but a skill dir named `git` would match `using-git-worktrees` at `skills.md:34` and never prune.

### Fix 24 — **re-scope; the friction row inverts the framing**

Guard confirmed only at `plan-scope-check-{1,2}.md:48` (lines did not drift); design/build prompts: **0** matches. But the driving row is at `harvest/friction.jsonl:36` (CLOSED) and `:193` (TRIAGED), tagged **Fix 15 — not Fix 24** — and it says the opposite of the fix's premise:

> "...`@bkit-plan-update` applied all 3 CRITICAL corrections to the expanded copy ONLY and deliberately left the canonical mirror untouched, **citing the never-edit-inside-markers rule. But that rule targets bkit-MACHINERY blocks (rendered prompts / `rules.md` / managed `ci.yml`) whose drift gate reverts edits — NOT a plan document under `docs/plans/logs/`, which no gate reverts.** ... **Both Step-6 scope-checkers correctly flagged this (CONCERNS, 6 findings).**"

**The detectors worked. The actor (`@bkit-plan-update`) is the one with no guard** — and confirmed by grep it never mentions managed blocks. The defect is that the rule as worded does not distinguish **gate-backed machinery blocks** (revert-on-drift) from **plan-internal mirrors** (no gate).

**Channel finding that should shape the placement decision:** `rules.md` is read by **0 of 46** prompts. `.agents/docs.md` is read by **44 of 46**; `jsonl.md` by 6. `e4982ab6` consolidated into **`.bkit/jsonl.md`, not `rules.md`**, and worked _because_ `jsonl.md` is referenced by the prompts that need it. **A `rules.md` consolidation would reach zero subagents.**

### #234 corpus counts — confirmed, with a scope caveat the claim omits

| Claim                             | `harvest/friction.jsonl` | Corpus-wide                                                                        |
| --------------------------------- | ------------------------ | ---------------------------------------------------------------------------------- |
| rows stamped `workflow:"migrate"` | **25** ✅ (was 93)       | **139** (knowledge 52, decisions 33, deferrals 21, harvest 25, `.bkit/friction` 8) |
| rows with no `summary`            | **14** ✅                | **59** (deferrals 30, harvest 14, `.bkit/friction` 15)                             |

The remediation only re-stamped friction. Both are **documented design calls in #234**, not defects: the `workflow` stamp overwrite is recorded there as _"a design call, deliberately not taken"_ (envelope `workflow` = who emitted, vs. where it occurred), and the missing-`summary` rows are residue of a payload-shape bug since fixed forward.

_(#97 — CLOSED, no live overlap. It guards the legacy counter-allocated markdown `KN-{N}` scheme against branch races; the JSONL `key` is content-derived via `stableKey` and immune to that mechanism.)_

---

## Recommended sequencing

1. **Bug A** (`EXECUTE_VERDICT` routing) — 2 lines, no decision needed, closes the largest cluster's _real_ content.
2. **Bug B** (post-merge stranding) — reorder Step 6 to extract `state` **before** the `RUN_ID` guard; make Steps 9-13 fail-soft; move the dev-drift check pre-merge. Closes 17 + 18 + re-run recovery together.
3. **Bug C** (`build:298` `HEAD` -> `origin/dev`) — one word.
4. **Fix 23** once the doctrine call lands; **Fix 17** once the live-gating call lands.
5. **Fix 21** lock-sync claim (delete the false parenthetical at minimum); **Fix 13** eager-flip in `plan-execute`.
6. **Fix 16 / 20** — cheap, but zero incident evidence; consider cross-FID serialisation instead of the per-FID TOCTOU.
7. **Close:** Fix 24, the Fix 13 prepend, the #234 corpus items, `Route:`, the 7-push-sites item.

## Open decisions (owner)

- **Fix 23 doctrine** — tighten `.agents/rules.md:61`, or correct the memory? The strict reading outlaws the ship workflow.
- **Fix 17 live-gating** — should ship gate on the live tier at all? Doctrine (`workflows.md:661`) says no.
- **Fix 16 scope** — per-FID TOCTOU, or the cross-FID gap that actually bites?

## 📊 Reality check on the friction corpus — and a retraction (2026-07-15, session 3b)

Owner asked the question none of the triage comments asked: **how many times did each of these actually happen?** Answer, measured against `harvest/friction.jsonl` at `8113642f`: **we mostly cannot know, the cluster sizes are ~2x inflated, and the single best-evidenced item is the one I told the owner to deprioritise.**

---

### ⚠️ Retraction — Fix 20 is the best-evidenced item in the corpus, not the worst

The [previous comment](https://github.com/cbartens/bkit/issues/99#issuecomment-4979966303) says of Fix 20: _"Searched `docs/failures.jsonl` (1 row), `.bkit/friction.jsonl`, `docs/knowledge.jsonl`: **0 recorded instances** of an artifact landing in the wrong place."_

**Wrong corpus.** `.bkit/friction.jsonl` is **bkit's own** friction (16 rows). The consumer corpus is **`harvest/friction.jsonl` (257 rows / 156 entities)**. Searching it:

**6 distinct reports**, all `example-org/consumer-b`, across **3 named subagents + the brainstorm pair**:

| Report                                                           | Subagent               |
| ---------------------------------------------------------------- | ---------------------- |
| `plan-summary.md` written to main checkout, worktree copy absent | `@bkit-plan-summary`   |
| `build-summary.md` created under MAIN checkout path              | `@bkit-build-summary`  |
| Brainstorm agents 1 and 3 wrote to main checkout                 | brainstorm ideate      |
| 2026-05-29 — subagent navigated to main checkout                 | `@bkit-design-summary` |
| + 2 more of the same shape                                       | —                      |

One row states outright: _"**Recurrence of 2026-06-02 / 2026-06-05 pattern**"_ — so the real occurrence count exceeds 6.

And the decisive line, from the `@bkit-build-summary` row:

> "**Despite** the `cd "{WORKTREE_PATH}"` + `pwd` instruction, `@bkit-build-summary` created `build-summary.md` under the MAIN checkout path … leaving the worktree copy absent — same failure mode as the previous entry."

That is direct field evidence that **#209's `cd` injection does not work** — which is precisely Fix 20's thesis (prose in a Context line, no comparison, no failure branch, no gate). Fix 20 is not a code-inspection curiosity. **It is the most-repeated, most-reproduced friction in the corpus, and its current mitigation is empirically ineffective.**

---

### The corpus cannot answer "how often" — five structural reasons

| #   | Finding                                                                                                                                                                                       | Consequence                                                                            |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 1   | **No occurrence/count field** in the schema (`bkitVersion, category, description, key, kind, references, remediation, repo, scope, severity, source, status, step, summary, ts, workflow`)    | Each entity = **one report**. Frequency is unrepresentable.                            |
| 2   | **`ts` is the migration timestamp, not the incident time.** Span of `ts` across all 257 rows: **2026-07-13 → 2026-07-15** (3 days — the migration window)                                     | No temporal axis. Cannot compute rate, trend, or recency.                              |
| 3   | **Only 35 of 156 entities have a recoverable incident date**, and only as a **prose prefix** in `summary` (`"2026-05-30 — …"`). Real span **2026-05-24 → 2026-07-12** (May 20, Jun 3, Jul 12) | 78% of the corpus is undateable.                                                       |
| 4   | **`severity` = `MEDIUM` for all 156 entities.** Uniform                                                                                                                                       | The field carries **zero** signal. No P0/P1 ranking in this issue was derived from it. |
| 5   | **41 of 156 still carry `step: "bkit-telemetry-migrate"`** (migrate 17, build 11, ship 7, plan 6) — transport stamped as the step                                                             | The step axis is ~26% corrupted; step-based clustering under-counts.                   |

Plus: **32 entities have `status: null`**, and **118 of 156 are already `CLOSED`**. Only **3 are OPEN**.

### Rows != entities — every cluster size in this issue is ~2x inflated

`.bkit/jsonl.md:183` says _"Readers count ENTITIES, never lines."_ The triage sized clusters in **rows**.

- **257 rows → 156 entities.** Distribution: 55 entities × 1 row, **101 entities × 2 rows**. No entity has 3+.
- For **all 101** two-row entities, the only fields that differ are **`references`, `ts`, `status`** — i.e. a create + a triage status-update. **Not a second occurrence.**

So _"Fix 13 — 20 rows, the corpus's largest cluster"_ is ~10 entities. Measured by entity, the largest genuine step clusters are:

```
build-plan-execute      7
plan-close-workflow     6
ship-switch-to-dev      4
plan-apply-scope        4
```

Nothing in this corpus is a 20-incident cluster.

### Proven recurrence: 4 cases, not the 9 a keyword scan suggests

Grepping `recurren` yields 6 hits — **2 are false positives**: `556-event-popover-recurrence` is a **feature name** in the consumer app, not a workflow recurrence. The 4 real ones:

| Recurrence                                                                                        | Maps to    | State                                              |
| ------------------------------------------------------------------------------------------------- | ---------- | -------------------------------------------------- |
| `663-rag-embedding-sync` Plan Close-Workflow STRAY guard **(recurrence)**                         | **Fix 11** | ✅ shipped `b953237c`                              |
| Plan Step 11 STRAY guard rejects mandated ledger edits **(recurrence of the 527 entry)**          | **Fix 11** | ✅ shipped `b953237c`                              |
| Brainstorm subagents wrote artifacts to main checkout **(recurrence of 2026-06-02 / 2026-06-05)** | **Fix 20** | ❌ **open — and wrongly deprioritised**            |
| re-plan pre-worktree `git add docs/plans/` would sweep unrelated WIP                              | **Fix 14** | 🟡 partly shipped; **2 `git add -A` sites remain** |

**Every item with proven recurrence is Fix 11, Fix 20, or Fix 14.** Nothing else in this issue has recurrence evidence at all.

### Evidence vs. effort — the uncomfortable table

| Item                                  |          Distinct reports |     Proven recurrence | Effort spent                     |
| ------------------------------------- | ------------------------: | --------------------: | -------------------------------- |
| **Fix 20** cwd / main-checkout writes |                    **6+** | **yes (≥1 explicit)** | dismissed as "zero evidence"     |
| **Fix 11** STRAY guard                |                        ~5 |          **yes (×2)** | ✅ shipped                       |
| **Fix 14** `git add -A` sweep         |                        ~4 |               **yes** | 🟡 2 sites remain                |
| **Fix 17** live-tier gate             |                     **2** |                    no | ✅ **built this session**        |
| **Fix 16** per-FID lock TOCTOU        |          0 lock/race rows |                    no | correctly deprioritised by owner |
| **Fix 13** verdict/PENDING            | ≤7 (`build-plan-execute`) |                    no | **refuted** (see below)          |

**Fix 17 has two reports, zero recurrence, and cannot fire in bkit's own repo** (`ci.yml:169` hardcodes `run_live: false`). It was built this session on the strength of a P2 label that, per finding #4 above, was never derived from the corpus.

---

### Bug A — REFUTED (owner caught this; the fix was worse than the bug)

Proposed in the previous comment as _"2 lines, no decision needed"_. Both halves were wrong.

1. **`PENDING` means the subagent was cut off — it is not a formatting defect.** `bkit-build-plan-execute.md:40` — _"Initialise **Create** output stub with `PENDING` placeholders"_; `:55` — _"`[Initially set to PENDING.]`"_. PENDING is the **initial** value, overwritten only by the agent's final Edit step. Surviving PENDING ⟺ **the agent never reached that step**.

   So the proposed re-invoke — _"Re-emit ONLY 'Verdict: PASS\|FAIL' … **Do NOT redo work**"_ — would ask a **truncated** agent to stamp a verdict on **incomplete** work, **fabricating a green verdict**. It converts a visible truncation into a false PASS. **Strictly worse than doing nothing.** The same flaw exists in the design/plan sites it was copied from (`design.md:507`, `plan.md:416/515`): that pattern is only sound for a _malformed_ verdict where the work is genuinely complete.

2. **It would have been a one-off.** The guard exists at **5 of 27** extraction sites (design 3/3, plan 2/5, build 0/10, debug 0/4, ship 0/5). Adding it to build alone = 1/10.

3. **The root cause is already fixed by sizing.** `bkit-plan-complexity-check.md:40-41` — `SINGLE` = ≤85K tokens **and** ≤12 tasks; `SPLIT` otherwise → the sub-plan loop. That is the Group A (budget-exhaustion) fix, and it shipped. PENDING should now be rare by construction.

4. **The gate already catches the residue.** Gate 5 asserts `EXECUTE_VERDICT in PASS|FAIL` **and** `No PENDING placeholders remain`; `bkit-build.md:18` routes any unpassable gate → Failure Path. The triage's _"the workflow proceeds"_ is **refuted**.

**Bug A is withdrawn. No workflow edit made.** The one option that remains is different in kind and is a _feature_, not a fix: `bkit-build-plan-execute.md:43` is **resumable** (_"Find first `[ ]` task and resume"_), so a truncated execute could be **continued** rather than aborted — needs a counter-bus for attempts. Owner's call.

---

### Shipped this session

**`29750cce` — repo-global dev lock (cross-FID).** `$REPO_ROOT/.bkit/.dev.lock`, gitignored (live + template), held only across a dev critical section. 6 sites: design + plan close squash; ship Step 6 / Step 9 / Step 13 / Failure Path. build/debug get none — they close via PR and never touch `dev`. Acquire is atomic (`set -C` = `O_EXCL`); the prior `> "$LOCK"` truncate-creates and **cannot arbitrate — two cold-start runs both won**. Release via `trap … EXIT`. Leaks self-clear at 900s (**3 locks were held on disk from May/June** — dead workflows; now removed). **Verified 15/15 under bash _and_ zsh, including an 8-way concurrent race resolving to exactly one winner.** Rationale + constants in `.bkit/workflows.md` (rule 52).

**Uncommitted, pending review:**

- **Bug C** — `git worktree add … -b "feat/{FID}" HEAD` → `origin/dev`. **3 sites** (design, plan, build), not 1; ship was already correct. All three `git fetch origin dev` then ignored it.
- **Bug B** — Step 2 now finds merged PRs (`gh pr list … --state all`) and routes `MERGED → Step 9`. Without this a re-run died at `:302` with an empty `PR_NUMBER`, because **`gh pr list` defaults to open PRs only** — the merged PR was invisible. Step 6 merge is now idempotent; the racy `RUN_ID` guard is **deleted** (Step 13's `--commit "$SQUASH_SHA"` lookup is the precise version of the same assertion, and the old one's `sleep 30` + 60s window lost to Actions queue latency). Failure Path is merge-aware: `bkit:merged` + `bkit:failed` when the work is genuinely on dev.
- **Fix 17** — run-level `conclusion = "failure"` check dropped (it folded in live, lint and deploy jobs); live excluded from the gate and **reported** instead. Necessary because `docs/testing.md:39-41`'s capstone `needs:` all lanes, so a red live reds `bkit-tests-check` too. **8/8 tests**, incl. live-red-with-green-tiers (passes, warns), real-tier-red-plus-live-red (still fails), and `skipped` live (**not** treated as red — an early cut wrongly did, which would have silently discarded the capstone's `*_ran > 0` assertion on every normal run).

---

### What this implies for the issue

1. **Fix 20 should be re-prioritised to the top.** It is the only open item with multiple independent reports **and** explicit recurrence **and** field evidence that the existing mitigation fails. Note the corpus points at a narrower fix than "assert cwd in 46 prompts": all 6 reports are **`*-summary` and brainstorm agents writing an artifact to the wrong root**, so an orchestrator-side assert that the artifact resolves under `$WORKTREE_PATH` would catch every recorded case.
2. **Stop sizing clusters in rows.** Rows are same-key updatable; entities are the unit. Every "N rows" in this thread wants halving.
3. **`severity` is unusable** (uniform MEDIUM) — do not read the P0/P1/P2 labels in the triage as evidence-derived.
4. **Fix the corpus before trusting the next triage**: add an occurrence counter, stamp a real incident `ts`, and stop stamping `step` with the transport (41/156 still say `bkit-telemetry-migrate`). Without these, "the largest cluster" is an artefact of how rows were written, not of what hurts.

## ✅ Evidence audit of everything shipped — and Fix 23 is superseded by #341

Follow-up to the [reality check](https://github.com/cbartens/bkit/issues/99#issuecomment-4980634761). Owner asked: **did we fix anything we should not have, and should any of it be undone?** Every shipped item re-tested against `harvest/friction.jsonl` (156 entities) at `8113642f`.

### Verdict: nothing from the prior session should be undone. Two items from this session were speculative.

| Shipped — prior session         |                   Entities | Verdict                                                                  |
| ------------------------------- | -------------------------: | ------------------------------------------------------------------------ |
| **Fix 11** STRAY guard          | **10** (**2 recurrences**) | Well justified                                                           |
| **Fix 14** pathspec-less commit |   **7** (**1 recurrence**) | Well justified                                                           |
| **Fix 18** dev-drift message    |                          5 | Justified                                                                |
| **Fix 12** ship close gate      |                          3 | Justified                                                                |
| **#234** recovery removal       |                          3 | Fine                                                                     |
| **Fix 15** template duplication |                          1 | Thin — but a **stack-independence violation**; correct on doctrine alone |
| **Fix 22** slop vendored skills |                          1 | Thin — but **proven live** (2 findings)                                  |
| **Gate 8**                      |                          1 | Correct on logic alone — the gate **could never pass**                   |

| Shipped — this session              |      Entities | Verdict                                    |
| ----------------------------------- | ------------: | ------------------------------------------ |
| **dev lock (cross-FID)** `29750cce` | **~5 strict** | **Vindicated**                             |
| **Fix 17** live-tier                |  2 (1 direct) | **Thin but real**                          |
| **Bug B** stranding                 |         **0** | **Speculative** — tightened, not reverted  |
| **Bug C** worktree base ref         |         **0** | **Speculative** — kept (deletes dead code) |

**The dev lock is vindicated by the corpus** (strict match, excluding `block*` false positives):

- _"Stray lock directory from wrong FID"_ — **cross-FID**
- _"Stale build lock during ship workflow start"_ — **cross-FID** (build's lock seen by ship)
- _"2026-05-30 — pre-worktree `git add docs/plans/` would sweep a **concurrent run's** untracked status.json"_
- _"Ship: **concurrent duplicate ship run** on #290"_

That last row also **upgrades Fix 16**: a _same-FID_ duplicate ship run is precisely what the per-FID lock exists to prevent, and it happened anyway. The TOCTOU is not hypothetical.

**Fix 17's single direct report** is `2026-06-24 — #231 ship Step 13: bkit-tests-live pre-existing failure blocks close` — an exact symptom match. Caveat for the record: that row is **title-only** (`description` duplicates `summary`; `remediation`, `status`, `references` all empty), i.e. one of the degraded rows.

### What was undone / tightened

**Bug B — tightened, not reverted.** The `--state all` change I made introduced a _new_ risk with no evidence behind it: a branch with an earlier **CLOSED** PR could bind `PR_NUMBER` to the wrong PR via an unordered `.[0]`. Now explicit — prefer OPEN, then MERGED, never CLOSED:

```
--jq '[.[] | select(.state == "OPEN")] + [.[] | select(.state == "MERGED")] | .[0]'
```

Verified across 6 cases incl. stale-CLOSED-listed-first (now correctly skipped) and CLOSED-only (yields `null` → Failure Path). The rest of Bug B stands: _"concurrent duplicate ship run on #290"_ is exactly the already-merged case Step 6 idempotency handles.

**Bug C — kept.** Zero corpus evidence, but it deletes provably-dead code: design/plan/build all ran `git fetch origin dev` and then branched from `HEAD`, so the fetch had no purpose. Aligns 3 workflows with ship, which was already correct.

**Bug A — withdrawn** (see prior comment). No edit made.

### ⚠️ Fix 23 is superseded by #341 — and it was mis-framed

Fix 23 is filed as _"`gh` 403 has no fallback"_. **#341 §2.2 root-causes it as something else entirely:** env-var **precedence**. `gh` reads `GH_TOKEN` → `GITHUB_TOKEN`, and an env token **overrides** `gh auth login` keyring creds ([gh manual](https://cli.github.com/manual/gh_help_environment), [cli/cli#2922](https://github.com/cli/cli/issues/2922)). bkit authenticates via `gh auth login --with-token` with a differently-named **`GH_BKIT_TOKEN`** (`cloud-bootstrap.sh:56-64`) — so a stale/placeholder `GH_TOKEN` silently wins.

That is exactly the corpus row _"Ship: stale `GH_TOKEN` fine-grained PAT shadowed keyring OAuth → repeated 403 on PR check status"_, and it matches **KN-CORE-8** (`docs/knowledge.jsonl:8`) and the `env -u GH_TOKEN` workaround. **It is not a missing-fallback problem — it is a token-precedence problem.**

#341 already settles the direction with far more research than this issue has: **§6a** harden gh in mode 3 (prefer the sanctioned `GH_TOKEN` env var, fix Go-TLS/CA trust, loud `gh auth status` preflight), **§6b** a single global gh→MCP fallback rule + **§6c** tool map, and **§6i** trackers stay on MCP. It also documents why MCP is a _fallback_ not a default (§5: prompt-injection trifecta, ~55k tokens of schema, remote-timeout failures).

**→ Fix 23 should be closed here and tracked under #341.** The one piece worth carrying over: the corpus row **"Ship Step 5: merged PR with failing CI run"** is direct evidence for the **missing pre-merge CI re-check** (ship reads `statusCheckRollup` at `:289`, merges at `:548`, never re-reads after `gh pr update-branch` rebases onto fresh `dev`). That is a distinct defect from the token issue and is **not** covered by #341.

### Outstanding, ranked by evidence

|     # | Item                                                                                                        | Entities | Recurrence                            |
| ----: | ----------------------------------------------------------------------------------------------------------- | -------: | ------------------------------------- |
| **1** | **Fix 20** — subagents write to main checkout                                                               |   **6+** | **yes**                               |
| **2** | **Fix 14 residual** — 2 surviving `git add -A` sites (Step 10 `:838`, Step 13)                              |        7 | **yes**                               |
| **3** | **Fix 16** — per-FID lock TOCTOU (upgraded — see above)                                                     |       ~5 | —                                     |
| ~~4~~ | ~~Fix 23~~ → **#341** (token precedence, not fallback). Carry over only the **pre-merge CI re-check**       |        8 | —                                     |
| **5** | **Fix 21** — skills (`ship.md:874` lock-sync claim false on both halves)                                    |        7 | —                                     |
| **6** | **NEW** — _"Ship Step 5: stale `CONFLICTING` mergeability blocked squash-merge though git merge was clean"_ |        1 | —                                     |
|     — | **Fix 13 / Fix 24**                                                                                         |        — | **refuted / re-scope — do not build** |

Note the corpus points Fix 20 at a **narrower** fix than "assert cwd in 46 prompts": all 6 reports are `*-summary` / brainstorm agents writing an artifact to the wrong root, so an **orchestrator-side assert that the artifact resolves under `$WORKTREE_PATH`** catches every recorded case.

### Shipped

- **`29750cce`** — repo-global cross-FID dev lock (6 sites; `set -C` atomic acquire; `trap … EXIT` release; 900s stale self-clear; 15/15 bash+zsh incl. an 8-way race → exactly one winner).
- **`e5e7133d`** — ship post-merge recovery (Step 2 `--state all` + OPEN→MERGED preference, Step 6 idempotent, `RUN_ID` guard deleted, merge-aware Failure Path) + Fix 17 (live is a canary, not a gate; 8/8 gate tests) + Bug C.

Both on `dev`, **unpushed**.

## ✅ Session close — 5 commits on `dev`, CI green

Continues the [evidence audit](https://github.com/cbartens/bkit/issues/99#issuecomment-4980813543). Everything below is pushed; CI green on `e924448e` and `1590bc21`. 2211 tests, `bkit check` 0, `slop:delta` net 0.

### Shipped

| Commit     | What                                                                                                                                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `29750cce` | **Cross-FID dev lock** — `.bkit/.dev.lock`, 6 critical sections, atomic `set -C` acquire, `trap … EXIT` release, 900s stale self-clear. 15/15 bash+zsh incl. an 8-way race → exactly one winner.                  |
| `e5e7133d` | **Ship post-merge recovery + Fix 17** — Step 2 `--state all` (OPEN→MERGED, never CLOSED), Step 6 idempotent, racy `RUN_ID` guard deleted, merge-aware Failure Path. Live is a canary, not a gate; 8/8 gate tests. |
| `422f17e9` | **Fix 20 / Fix 14 / Fix 16 / Fix 21 + stale-mergeability** — the items that actually recur.                                                                                                                       |
| `e924448e` | **Pre-merge CI re-check** + migrated-row reader semantics in `jsonl.md`.                                                                                                                                          |
| `1590bc21` | **`ts` fallback to the legacy heading date + corpus backfill.**                                                                                                                                                   |

### `ts` — fixed at the source, and backfilled

`ts` stays `ts`; the heading date is only the fallback when the source carries none (always true of markdown).

**The migrator had the date and threw it away.** `cleanTitle:467` was already extracting `(YYYY-MM-DD)` _purely to strip it_, while the row builder stamped `ts: baseTs + idx` off the migration clock. `parseTitleDate` now reads both conventions in the wild — documented trailing `(YYYY-MM-DD)` and ad-hoc leading `YYYY-MM-DD — ` — rejects an impossible date rather than letting `Date.UTC` roll it over (`2026-02-31` → Mar 3), and does not mistake a version/issue number for one. The heading is **not** rewritten: `stableKey` hashes the title, so stripping the leading form would re-key rows and mint duplicate entities.

**Harvest was never at fault** — `stampRepo` touches `repo` only; `ts` passes through untouched, and harvest cannot know an incident time it never saw. Live rows were already correct.

**Backfill: 183 of 257 rows.** Verified **only `ts` changed** — no other field on any row; 257 rows / 156 entities unchanged; zero missing `key`. Span went from the 3-day migration window to the real **2026-05-24 .. 2026-07-15** (May 12 / Jun 147 / Jul 98).

A **full re-migration was rejected**: 118 entities carry a triage `status` the legacy `.md` never knew, so re-deriving from it would destroy the triage work. Surgical patch instead. Safe against #343's content gate — none of the rows still in consumer-a share a key with the store.

### Corrections to this thread's record

- **`severity` is NOT a corpus defect.** The migrator documents it: _"with no Severity (the whole of `friction.md`, which never had the field) default to MEDIUM — the neutral point. This is an explicit unknown->neutral mapping, NOT a claim about the row; re-triage on next touch."_ It is required on write, so it cannot be nulled. Right to not read P0/P1 out of it; wrong to call it broken.
- **"harvest does not dedupe appends" is NOT a bug.** `.gitattributes:5-6` states duplicate lines are expected and reader-resolved (the same property that makes `merge=union` safe), and the fold collapses them — proved: 3 identical lines → 1 identity. The unconditional append is load-bearing: the prune's contract is _"I durably hold your row, so deleting yours is safe"_, which requires the append to have actually written it. 0 exact duplicates in 257 rows.
- **The stuck consumer rows are NOT "unharvestable".** `parse()` accepts all of them (`malformed: 0`) — the codec is deliberately tolerant. They were simply un-harvested.
- **Fix 23 is superseded by #341** (token _precedence_, not a missing fallback). Only the pre-merge CI re-check carried over — now shipped in `e924448e`.
- **Bug A withdrawn**, **Fix 13 / Fix 24 refuted** — see the prior two comments.

### ⚠️ Still live in consumers — the fixes are not released

`consumer-a` pins **4.5.0**; bkit's `package.json` is **4.5.0**. Everything above is on `dev`, **unreleased**. Its `bkit-ship` mirror still carries **10** `git add -A` sites.

That is not theoretical. **While closing this session, an uncommitted edit of mine in `consumer-a/.bkit/friction.jsonl` was swept into `398b62a1 docs(#715/#721/#722): correct the @live prod-safety story` — a commit that says nothing about friction rows — and pushed.** The `-3` diff is against the 7-row HEAD, so that commit inherited the edit rather than authoring it. The exact Fix 14 bug fixed in `422f17e9`, reproducing itself live in a repo that does not have the fix yet.

**A release is the remaining delivery step.**

### Open

| Item                                        | Note                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Release 4.6.0**                           | The only way any of this reaches consumers.                                                                                                                                                                                                                                                                                                                                                                   |
| **Branch protection on `dev`**              | Remediation (2) of the merged-PR-with-failing-CI row; repo config, not a workflow fix.                                                                                                                                                                                                                                                                                                                        |
| **Write-time validation for friction rows** | Root cause of corpus decay: workflows say _"append in `.bkit/jsonl.md` format"_, agents hand-write raw `jq >> file`, nothing validates. The codec validates but a raw append never invokes it — same prose-with-no-gate shape as Fix 20. Live proof: 3 rows in consumer-a carry a string `ts` + no `key`, written today. Needs a design call (e.g. a `bkit telemetry append` verb, or close-step validation). |
| **Data-side `step` repair**                 | 76 rows still stamped `bkit-telemetry-migrate`; only ~25 have a recoverable hint. Low value.                                                                                                                                                                                                                                                                                                                  |
| **Fix 13 / Fix 24**                         | Refuted / re-scope — do not build.                                                                                                                                                                                                                                                                                                                                                                            |

Archived description. This issue body is now the audit template. No `docs/templates` file exists for it.

---

<!-- linear-import: BAR-230 -->

**Linear:** [BAR-230](https://linear.app/bartens/issue/BAR-230) · **Created:** 2026-05-18 · **Linear assignee:** christian@bartens.biz

---

## Goal

Close the **still-open** friction items surfaced by the 2026-05-18 harvest of `.agents/friction.md` across `cbartens/bkit`, `example-org/consumer-a`, and `example-org/consumer-b` (date range 2026-05-09 → 2026-05-18, 14 net-new entries).

This is a **follow-up to** [#61](https://linear.app/bartens/issue/BAR-155/bkit-workflow-friction-optimisation). The harvest was originally grouped into seven root-cause clusters (see [#61 comment](https://linear.app/bartens/issue/BAR-155#comment-85f44350), 2026-05-18). After cross-checking each cluster against shipped commits and closed Linear issues, **most** of what looked open in the comment turned out to already be addressed — but a small set of items remain genuinely open and have concrete code evidence.

This issue tracks only the open residue. A "What's already shipped" section is included for traceability so future readers can see why the rest of the comment was deferred-out.

## ⚠️ Authoring rules — READ FIRST

Same as [#61](https://linear.app/bartens/issue/BAR-155):

- Canonical sources only — ONLY edit `.agents/*`. NEVER edit `.claude/*`, `.cursor/*`.
- Install to mirror — After editing `.agents/*` run `bkit install` to regenerate `.claude/` and `.cursor/` mirrors. **Batch at end of session, not after every edit.**
- Template sync, workflow / prompt authoring rules, and index doc updates — see `.agents/rules.md` § bkit Repo Authoring.

## What's already shipped (no action needed)

| Friction cluster                                                                                                               | Resolved by                                                                                                                                                                                       | Evidence                                                                                                                                                                                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Group A — Subagent budget exhaustion** (plan-execute / challenge / plan-verify / failure-diagnose return `Verdict: PENDING`) | [#61](https://linear.app/bartens/issue/BAR-155) Fix 1a + [#76](https://linear.app/bartens/issue/BAR-193) (parallel-pair + role differentiation) + [#79](https://linear.app/bartens/issue/BAR-198) | `bkit-build-plan-verify.md` and `bkit-debug-failure-diagnose.md` Process step 1 now mandates "Initialise **Create** output stub with `PENDING` placeholders" + step 4 / 10 mandates `Edit` + `echo >> {output}` flush as evidence arrives. Challenge is parallel-pair (`-1` bug-hunting, `-2` security) + reconcile. |
| **Group C.1 — friction.md rebase conflicts**                                                                                   | [#66](https://linear.app/bartens/issue/BAR-169)                                                                                                                                                   | `.gitattributes` declares `.agents/friction.md merge=union` (alongside `docs/{pending,knowledge,decisions,completed}.md`).                                                                                                                                                                                           |
| **Group C.2 —** `tsbuildinfo.json` **causing dev divergence**                                                                  | [#61](https://linear.app/bartens/issue/BAR-155) commit `3d2b665`                                                                                                                                  | Pre-worktree commit Step 2.1 now uses **allow-list** (`git add docs/ .agents/friction.md`) instead of deny-list — cache files can't slip in.                                                                                                                                                                         |
| **Group C.3 —** `bkit-debug` **orchestrator wrote status.json to repo root via** `$REPO_ROOT`                                  | [#71](https://linear.app/bartens/issue/BAR-187)                                                                                                                                                   | `$REPO_ROOT/docs/plans/logs/{FID}/status.json` is now canonical everywhere. 14 uniform occurrences in `bkit-debug.md` (no worktree-relative drift).                                                                                                                                                                  |
| **Group E.1 — Docs-only pre-worktree commit cancels feature CI**                                                               | [#61](https://linear.app/bartens/issue/BAR-155) commit `3d2b665` (+ [#74](https://linear.app/bartens/issue/BAR-190))                                                                              | Pre-worktree commit now always carries `[skip build] [skip ci]`; Step 7 Switch-to-Dev allows AHEAD>0 when every ahead commit is `[skip ci]`-tagged.                                                                                                                                                                  |
| **Group E.2 — Ship Step 11 run-tests-skipped gate vs PR-only test workflow**                                                   | Workflow restructure ([#71](https://linear.app/bartens/issue/BAR-187) + [#81](https://linear.app/bartens/issue/BAR-200))                                                                          | The post-merge `run-tests` gate that triggered Failure Path on legitimately-skipped runs is gone. Regression-gate verification moved to Step 2 (pre-merge), comparing same-SHA PR run to prior failed run. Step 11 in current `bkit-ship.md` is "Worktree Cleanup" — no run-tests assertion there.                   |
| **Group E.3 —** `[skip ci]` **on final PR push (**`bar-154`**)**                                                               | [#71](https://linear.app/bartens/issue/BAR-187) commit/push restructure                                                                                                                           | Build close-workflow now: `chore({FID}): close-workflow` (NO `[skip ci]`) on feat branch + `chore({FID}): build DONE [skip ci]` on dev only. Gate 18 explicitly checks: "HEAD on remote does NOT contain `[skip ci]`".                                                                                               |
| **Group G —** `@ts-ignore` **on JSX (**`bar-94`**)**                                                                           | Code-level, not a workflow gap                                                                                                                                                                    | Resolved at runtime via spread pattern; documented in friction log as `Status: Resolved`.                                                                                                                                                                                                                            |

## Open items — concrete fixes

### Fix 1 — Top-of-doc `Verdict: PENDING` prepend produces dual verdict blocks (Group B)

**Severity:** High — confirmed bug, two recent occurrences in the same workflow run (`bar-180-separate-prompt-tool`, 2026-05-17).

**Evidence:** `.agents/prompts/bkit-plan-update.md:43` prepends a literal `Verdict: PENDING` + `M1` block to `<Create>`:

```bash
T=$(mktemp); { printf 'Verdict: PENDING\nM2\n\n'; cat <Create>; } > "$T" && mv "$T" <Create>
```

When the subagent finishes, it emits its real verdict (`Verdict: PASS|CONCERNS|FAIL` + `M3`) **at the end** of `<Create>` (per the prompt's Output format, line 60-62) — but the top-of-doc PENDING block is never replaced. Orchestrator parser reads up to the **first** `M4` → captures `PENDING` → fires Failure Path or mis-routes.

Same shape observed in `@bkit-plan-scope-check-1` on the same run.

**Fix options:**

- **(a) Smaller-surface — change the agent prompts:** replace the top-of-doc PENDING prepend with an `Edit`-in-place pattern that targets the EOF verdict block. Subagent emits ONE verdict block at the canonical location.
- **(b) More-robust — change the orchestrator parsers:** read the **last** `M5` block before EOF, not the first. Tolerates leaked placeholders.

Prefer **(a)** as the primary fix and add **(b)** as defensive parsing in workflow `awk`/`grep` extraction. Belt-and-braces; both are one-line changes.

**Affected prompts (audit list — verify each has the same prepend pattern):**

- `.agents/prompts/bkit-plan-update.md` (line 43 — confirmed)
- `.agents/prompts/bkit-plan-scope-check-1.md` (suspected — same pattern, same friction)
- `.agents/prompts/bkit-plan-scope-check-2.md`
- `.agents/prompts/bkit-plan-review-{1,2,3}.md`
- `.agents/prompts/bkit-design-update.md`
- `.agents/prompts/bkit-design-review-{1,2}.md`
- `.agents/prompts/bkit-build-challenge-reconcile.md`
- Any other `.agents/prompts/*-{update,review,scope-check,reconcile}*.md`

### Fix 2 — Continuation-prompt template must not pre-classify findings (Group F)

**Severity:** Medium — single observation (`bar-94`, 2026-05-10), but the recurrence shape is recognised in the friction log itself (`Future-prevention:` note).

**Evidence:** When `bkit-build.md` Step 9 re-invokes `@bkit-build-challenge-{1,2}` for a second pass, the orchestrator's continuation prompt explicitly stated _"These are NEW defects … and should be flagged as FAIL-class new findings"_. The agent's own tier definition restricts `FAIL` to exploit/RLS-bypass/auth-bypass-class issues, but the priming overrode it → test-scaffolding regressions were mis-classified as FAIL.

`grep -nE "These are NEW|pre.classif|state observed symptoms" .agents/workflows/bkit-build.md` returns no hits — the continuation-prompt template is informal in the workflow doc and inherits whatever the orchestrator generates ad-hoc.

**Fix:** Add explicit guidance to `bkit-build.md` Step 9 continuation block — _"State observed symptoms only; do NOT pre-classify findings. The agent applies its own tier definition."_ Same guidance to the equivalent re-invocation step in any workflow that runs a challenge / review subagent on a second pass.

**Affected workflow steps (audit):**

- `bkit-build.md` Step 9 (challenge re-invocation on `CHALLENGE_REMEDIATE_ATTEMPT >= 1`)
- `bkit-debug.md` Step 4 (failure-diagnose re-invocation on PIVOT/FINAL strategy) — already partly covered by [#79](https://linear.app/bartens/issue/BAR-198) Fix A
- Any other workflow step that re-invokes an evaluative subagent with prior-attempt context

### Fix 3 — Ship `@bkit-ship-conflict-resolve` may drop fresh status.json entries during rebase (Group C residual)

**Severity:** High if reproducible — surfaced once (`bar-180-separate-prompt-tool`, 2026-05-17). Worth a targeted code audit before declaring a fix.

**Evidence:** Friction entry "status.json conflict storm during ship rebase + dev sync" reports that during Step 2 fast-path rebase, `@bkit-ship-conflict-resolve` took `--ours` on a `status.json` conflict where `--ours` happened to be the upstream side during rebase — **dropping** the freshly-committed `ship-start-workflow` + `ship-worktree-setup` entries the orchestrator had just added. Required manual `jq` re-insert.

**Audit task:** Read `.agents/prompts/bkit-ship-conflict-resolve.md` and inspect its handling of `status.json` conflicts. Two specific questions:

1. Does it understand the rebase-side semantics of `--ours` vs `--theirs` (which flip relative to merge)?
2. Does it treat `status.json` as a structured (jq-mergeable) file rather than a textual checkout-ours target? If the file is a JSON array of step entries, **union** semantics (append unique entries by `(step, at)` key) is the right resolution — not take-one-side.

**Suggested fix:** Add an explicit handler in `@bkit-ship-conflict-resolve` for `status.json` conflicts that does `jq -s 'add | unique_by(...)'` rather than `git checkout --ours`. Falls through to the existing handler for code/config conflicts. Mirrors the gitattributes union-merge pattern from [#66](https://linear.app/bartens/issue/BAR-169) but at the agent level (status.json is JSON, not plain-text-append, so `merge=union` doesn't apply).

### Fix 4 — Debug workflow rebase-then-push needs explicit `--force-with-lease` carve-out (Group D)

**Severity:** Medium — single confirmed observation (`bar-93`, 2026-05-09), but structurally always-on whenever `bkit-debug` resumes on an existing worktree with un-merged feat commits.

**Evidence:** `bkit-debug.md:162` mandates `git rebase --rebase-merges origin/dev` on resume. Rebase rewrites commit hashes. Subsequent pushes in the workflow (e.g. line 783 `chore({FID}): create-pr`) are plain `git push origin` and would be rejected non-fast-forward. The `bkit-debug.md:28` Git rules block forbids `git push --force` "(any flavour)" — no escape hatch.

This may already be implicitly handled (e.g. rebase only happens when worktree is brand-new and feat branch unpushed), but the friction entry shows it's not bulletproof. Worth a structural fix:

**Fix options:**

- **(a) Smaller-surface — drop unconditional rebase on resume:** only rebase if `git rev-list --count HEAD..origin/dev` > 0 AND `git rev-list --count @{upstream}..HEAD` == 0 (i.e. feat hasn't been pushed yet). Else skip.
- **(b) Explicit carve-out:** allow `git push --force-with-lease` in `bkit-debug.md` Step 6 / push-remediation steps, as a documented exception to the destructive-git prohibition, scoped to workflow-driven rebase on the agent's own `feat/{FID}` branch.

**(a) is preferred** because it also eliminates the metadata-file conflict storms that drive Group C entries (no rebase = no conflicts).

### Fix 5 — `/bkit-build` with no plan present: better Failure Path message (Group G)

**Severity:** Low — UX nit, single observation (`bar-180`, 2026-05-17).

**Evidence:** `bkit-build.md:123` Step 1.8: `If existing docs/plans/drafts/{FID}-plan.md or docs/plans/active/{FID}-plan.md → reuse FID. Else → Failure Path.` — but Failure Path assumes a mid-workflow state with established `{FID}`, `LOCK`, `COMMENT_ID`, and doesn't suggest `/bkit-plan {ID}` as the right next step.

**Fix:** Add a pre-Failure-Path guard in Step 1: if `FID` empty AND `Linear status != "Build"` AND no plan file exists, emit a short hint message recommending `/bkit-plan {LINEAR_ID}` (and `/bkit-design {LINEAR_ID}` first if no design exists) and exit cleanly without touching `status.json` or acquiring a lock.

### Fix 6 — Worktree gitignore for new plan files (Group G)

**Severity:** Low — single observation (`bar-95`, 2026-05-09), recovered cleanly at the time.

**Evidence:** `.gitignore` line `~71` declares `.worktrees/` as ignored. New files (`plan-v1-draft.md`, `plan-input.md`) written inside a worktree are evaluated as gitignored relative to the main repo root and silently dropped by `git add -A`. Modifications to previously-tracked files are still picked up.

**Audit task:** Inspect `bkit-plan.md` Step 3 (generate-plan commit step) to see whether the commit pattern uses `git add -A` or explicit `git add -f docs/plans/logs/{FID}/...`. If `git add -A` is still used and the gitignore line still applies, this can recur.

**Fix:** Use `git add -f` (or explicit file paths) for new plan-log files in worktree-based commits. Same in any other workflow step that creates new files inside `.worktrees/`.

### Fix 7 — bkit `pnpm bkit check` fails when husky pipes stdin (Group G, bkit-repo only)

**Severity:** Low — bkit-repo-specific, recovered via out-of-band push. Already in [#61](https://linear.app/bartens/issue/BAR-155) friction log; not in scope of any other shipped fix.

**Evidence:** `bkit/.agents/friction.md` 2026-05-09 entry. `.husky/pre-push` runs `pnpm bkit check`; husky forwards ref-update lines on stdin per git docs; `pnpm bkit check` returns exit 1 when stdin is non-empty even though all advisories are non-blocking.

**Fix:** Apply one of the three options listed in the friction entry. Smallest-surface: `.husky/pre-push` runs `pnpm bkit check < /dev/null`. **Belongs in the bkit repo only** (not in shipped templates) per memory rule `feedback_bkit_repo_vs_consumer_scoping`.

## DoD

- [ ] **Fix 1** — top-of-doc `Verdict: PENDING` prepend replaced with EOF-targeted `Edit` in `bkit-plan-update.md` and all sibling reviewer/checker prompts (audit list in Fix 1). Orchestrator parser reads the **last** `M6` block.
- [ ] **Fix 2** — `bkit-build.md` Step 9 challenge re-invocation block updated with explicit "state observed symptoms only" guidance. Same wording added to any other re-invocation step that ships prior-attempt context to an evaluative subagent.
- [ ] **Fix 3** — `.agents/prompts/bkit-ship-conflict-resolve.md` audited and (if confirmed) gains an explicit `status.json` handler using `jq` union semantics instead of `git checkout --ours`. Falls through to existing handler for non-`status.json` conflicts.
- [ ] **Fix 4** — `bkit-debug.md` Step 2 rebase made conditional (only rebase on never-pushed feat branches) **OR** explicit `--force-with-lease` carve-out documented in Git rules block + applied in push step.
- [ ] **Fix 5** — `bkit-build.md` Step 1 emits hint message and exits cleanly when no plan file exists (no `status.json` write, no lock acquisition).
- [ ] **Fix 6** — plan-generate commit step uses explicit `git add` paths (or `git add -f`) for new worktree files.
- [ ] **Fix 7** — `.husky/pre-push` in the bkit repo runs `pnpm bkit check < /dev/null` (bkit-repo only).
- [ ] Index docs updated per § Authoring rules (`.agents/prompts.md`, `.agents/workflows.md`).
- [ ] `bkit install` run once at end of implementation session.
- [ ] Resolved entries in `.agents/friction.md` marked `FIXED-IN: BAR-{N}` (this issue) once changes ship.

## Out of scope

- Re-architecting subagent budget allocation — Group A is resolved by stub-first patterns; no infrastructure change needed.
- Adding `bkit-debug-failure-diagnose-1/-2` parallel pair — suggested in the [#61 comment](https://linear.app/bartens/issue/BAR-155#comment-85f44350) but deferred; current single-agent + stub-first pattern is working. Revisit only if budget exhaustion recurs.
- KN-/DE-ID uniqueness guard — separately tracked in [#97](https://linear.app/bartens/issue/BAR-226).
- `ci-router` race-resolution refactor (Group G `git stash drop` entry) — tracked under in-progress [#59](https://linear.app/bartens/issue/BAR-148).
- PR-base verification gates — tracked under [#67](https://linear.app/bartens/issue/BAR-170).

## References

- [#61](https://linear.app/bartens/issue/BAR-155) (parent — bkit workflow friction optimisation), comment thread 2026-05-18 (harvest + grouping).
- [#71](https://linear.app/bartens/issue/BAR-187) (commit/push reduction + dev-canonical status.json) — addressed Group C.3.
- [#76](https://linear.app/bartens/issue/BAR-193) (role-differentiated parallel agents) — addressed Group A challenge variant.
- [#79](https://linear.app/bartens/issue/BAR-198) (sharpen debug/design prompts) — added stub-first patterns to `failure-diagnose` and `plan-verify`.
- [#81](https://linear.app/bartens/issue/BAR-200) (regression-gate verification in `bkit-ship`) — addressed Group E.2.
- [#69](https://linear.app/bartens/issue/BAR-184), [#66](https://linear.app/bartens/issue/BAR-169), [#74](https://linear.app/bartens/issue/BAR-190), [#57](https://linear.app/bartens/issue/BAR-146) — related shipped fixes.
- Friction log: `.agents/friction.md` HEAD on `dev` (2026-05-18 harvest, 14 entries, range 2026-05-09 → 2026-05-18).

<!-- linear-links-start -->

**Links:**

- **Related:** #57 ([BAR-146](https://linear.app/bartens/issue/BAR-146)), #59 ([BAR-148](https://linear.app/bartens/issue/BAR-148)), #61 ([BAR-155](https://linear.app/bartens/issue/BAR-155)), #66 ([BAR-169](https://linear.app/bartens/issue/BAR-169)), #67 ([BAR-170](https://linear.app/bartens/issue/BAR-170)), #69 ([BAR-184](https://linear.app/bartens/issue/BAR-184)), #71 ([BAR-187](https://linear.app/bartens/issue/BAR-187)), #74 ([BAR-190](https://linear.app/bartens/issue/BAR-190)), #76 ([BAR-193](https://linear.app/bartens/issue/BAR-193)), #79 ([BAR-198](https://linear.app/bartens/issue/BAR-198)), #81 ([BAR-200](https://linear.app/bartens/issue/BAR-200)), #97 ([BAR-226](https://linear.app/bartens/issue/BAR-226))

<!-- linear-links-end -->

## Friction harvest + triage, 2026-10-08

**Short version.** The harvest ran and the triage is done. But the harvest has a bug, and its second run lost 8 friction rows. They aren't gone for good: all 8 are still in consumer-a's last commit (`HEAD:.bkit/friction.jsonl`). **Until they are put back, don't run `pnpm bkit harvest` again, and don't commit `harvest/` or consumer-a's `.bkit/friction.jsonl` as they stand.**

The triage found 1 CRITICAL workflow bug: plan close can delete a feature branch after a failed merge. It also found 5 HIGH ones. Of the 166 entries the ledger still lists as open, 73 are either no longer true or aren't bkit's to fix.

Both runs followed the issue templates. Full reports: `docs/audits/202610/harvest.md` (#343) and `docs/audits/202610/friction.md` (this issue). Both are still local and uncommitted, so this comment carries the findings.

---

### Part 1: Harvest (#343)

Harvest copies each consumer's `.bkit/stats.jsonl` into `harvest/`. It moves `.bkit/friction.jsonl` rows into `harvest/` and deletes them from the consumer. For deferrals and failures it only counts rows. Step 4 of the template runs it a second time to prove re-running is harmless. It isn't harmless.

<!-- prettier-ignore -->
| consumer-a | Run 1 | Run 2 |
| --- | --- | --- |
| Friction rows moved out of the consumer | 54 | 8 |
| Friction rows left in the consumer | 24 | 16 |
| Distinct friction entries in the store | 156 → 210 | 210 (same keys, 8 different rows kept) |
| Distinct stats entries in the store | 10 → 397 | 397 |

consumer-b has an empty friction queue, no `stats.jsonl` and no `failures.jsonl`. Harvest counted 102 deferrals there. consumer-a counts: 377 deferral entries (663 rows) and 582 failure entries (991 rows).

**harvest-1, CRITICAL: the second run dropped 8 rows from everywhere.**

- **How the store picks a row.** The store keeps one row per key. It picks the winner by sorting on `ts` (the timestamp) with `a.ts - b.ts` (`.bkit/src/bkit-telemetry.ts:899`).
- **Why that broke.** 22 of consumer-a's 78 rows have a `ts` that isn't a number. 14 are date strings like `"2026-07-15T10:29:57Z"`, and 8 are empty or missing. Subtracting with those gives a result that isn't a number, so the sort stops meaning anything. Which row wins then depends on file order.
- **What run 2 did.** The file order was different on run 2, so it picked different winners. It then rewrote the store to keep only those winners (`.bkit/src/bkit-harvest.ts:394-400`). The 8 rows that run 1 had already removed from the consumer fell out of the store too.
- **The check that would have caught it.** Harvest never calls the existing `validate()` check, which already rejects a `ts` that isn't a number.

I checked this myself. I compared consumer-a's committed friction file with the current store and consumer files, ignoring the `repo` field that harvest adds when it copies. Exactly these 8 rows are missing:

- `ship-regression-guard-runs-before-conflict-resolve`
- `ship-step10-blanket-git-add-docs-sweeps-concurrent-sessions`
- `ship-local-dev-ahead-non-skip` (the row with `ts` 1785118280605)
- `712-subplan5-execute-agent-exhausted-before-writing-required-log`
- `build-plan-execute-subagent-ends-turn-mid-tasklist-pending-verdict`
- `build-summary-wrote-artifact-to-main-checkout-not-worktree`
- `debug-affected-filter-vacuous-when-debugging-post-merge-dev-failure`
- one row of kind `ignore-earlier-marker-stripped` with no `ts`

**Other harvest findings**

- **harvest-2, HIGH.** Even when every timestamp is valid, a newer row with the same key pushes an already-moved older row out of the store. The code header and `.bkit/jsonl.md:128` both say the store only ever grows. Run 1 removed 101 older rows from the committed store this way; git still has them.
- **harvest-3, HIGH.** `harvest/` is uncommitted (` M harvest/friction.jsonl`, ` M harvest/stats.jsonl`). It is now the only place 54 of the moved rows exist.
- **harvest-4, MEDIUM.** 14 rows with an unknown or missing `kind` get no identity, because `identity()` has no default case (`bkit-telemetry.ts:624-647`). Still open from the October notes on #343.
- **harvest-5, MEDIUM.** The deferral and failure counts are printed and then thrown away. Still open.
- **harvest-6, MEDIUM.** Rows that carry a bare `repo: "consumer-a"` sit in the store next to `example-org/consumer-a` rows for the same thing.
- **LOW:**
  - `.gitattributes` has no merge rule for `harvest/`.
  - `HARVEST_TIMEOUT_MS` is declared but nothing uses it, so the per-consumer timeout the header promises doesn't exist.
  - The log has a double slash in consumer paths and calls entries "rows".
  - Harvest still reads only the current files, not archive shards.
- **Exit status.** The command exits 0 even when it logs errors.

Two items from the October list on #343 are now **closed**:

- **Truncated-key collision.** The two `docs/pending.md` rows are now stored as two separate entries with hash suffixes.
- **Wrong repo name from the local path.** Harvest now reads the repo name from `origin`, and no stored row carries `GitHub/consumer-a`.

---

### Part 2: Triage (#99)

**Input.** 278 rows, which make 255 distinct entries:

- 210 from `harvest/friction.jsonl`
- 16 still in consumer-a, not yet harvested
- the 8 lost rows, recovered from the snapshot
- 44 from bkit's own `.bkit/friction.jsonl`

Harvest only reads consumers, so bkit's own queue never drains.

**Coverage. This was a partial pass.** I verified 169 of the 255 entries: 161 of the 166 that are still open, plus 8 closed ones as a spot check. The 8 closed ones all matched the code at HEAD. 81 closed entries weren't re-checked. 5 open entries were read but got no verdict.

**The 166 still-open entries, sorted:** 88 still true. 40 already fixed. 14 superseded. 19 not bkit's to fix (host, provider or consumer problems). 5 not verified.

**Findings:** 36 in total: CRITICAL 1, HIGH 5, MEDIUM 14, LOW 16. By verdict: 19 OPEN, 9 FIXED, 4 SUPERSEDED, 2 OTHER, 1 DUPLICATE, 1 NEEDS HARVEST. Each FIXED cites the line at HEAD.

**friction-1, CRITICAL: plan close can lose a plan.** I read this code myself; it has not been reproduced.

- In `.bkit/workflows/bkit-plan.md`, `git merge --squash` at `:962` has no check for failure.
- If the merge fails, the block keeps going. It runs `git commit` with no file list (`:991`). That commits whatever is staged in the main checkout, which breaks the rule at `.bkit/workflows.md:235`.
- It then pushes `dev`, force-removes the worktree, and deletes the feature branch locally and on GitHub (`:997-999`).
- Only after all that does it check that the plan reached `dev` (`:1040`). By then the branch is gone.
- Design close has the same shape (`bkit-design.md:837`).
- Fix: stop when the squash fails, commit only the squash's own files, and confirm the plan is on `dev` before deleting anything.

**HIGH**

- **friction-2, 43 entries.** A subagent stops early and leaves its file missing or still all `PENDING`. The only retry (`.bkit/workflows.md:602`) asks for just the verdict line and says "the body is already in place". That's wrong when the body was never written. Fix: treat that as an incomplete return and resume the same agent once before the Failure Path.
- **friction-3.** Build artifacts have fixed names. When an agent stops early, the previous run's `Verdict: PASS` file is still there and the gate accepts it (`bkit-build.md:1099-1100`). Fix: also require the file to have changed during this run.
- **friction-4.** Debug Step 3 counts exit 0 as PASS (`bkit-debug.md:466`). consumer-a's gate only tests changed packages. So debugging a failure that's already merged to `dev` runs zero tests and passes. Fix: zero tests, or no diff against `origin/dev`, should be INCONCLUSIVE.
- **friction-5.** In build and debug Step 2, any rebase conflict outside lockfiles and ledgers goes straight to the Failure Path. The conflict-resolve agent that could handle it is only used by ship.
- **friction-6.** The harvest follow-up: restore the 8 rows, then harvest again once harvest-1 and harvest-4 are fixed. Also decide whether bkit's own queue gets harvested or triaged where it is.

**Clusters (3 or more entries on one surface, one change each)**

<!-- prettier-ignore -->
| Cluster | Entries | Where | One change |
| --- | --- | --- | --- |
| Subagent stops early (friction-2) | 43 | `.bkit/workflows.md:584-605` | Resume the same agent once before the Failure Path |
| Artifact written to the main checkout (friction-7) | 9 | 46 dispatch sites; 20 of those agents have no Bash tool, so the `cd` instruction can't work for them | Pass absolute `{WORKTREE_PATH}/…` paths |
| Ship's "local dev is ahead" check runs after the merge (friction-8) | 4 | `bkit-ship.md:1078-1086` | Move it to ship Step 1 |
| Previous run's artifact passes the gate (friction-3) | 3 | `bkit-build.md:1099-1100` | Require the file to have changed this run |
| Debug passes with zero tests (friction-4) | 3 | `bkit-debug.md:451-466` | INCONCLUSIVE instead of PASS |
| Any rebase conflict ends build or debug (friction-5) | 3 | `bkit-build.md:296-303`, `bkit-debug.md:321-328` | Route to `@bkit-ship-conflict-resolve` |
| Two-dot diff while `dev` moves (friction-9) | 3 | `bkit-build.md:52`, `:654`, `:896`, `:900` | `origin/dev...HEAD` |
| Hard-coded env copy list (friction-10) | 3 | Step 2 of all 5 workflows (names `apps/web` paths) | Derive it from the consumer |
| install-skills installs whole catalogs (friction-11) | 3 | `bkit-build-install-skills.md:41` | Install by named skill and check the count |

All 5 workflows copy the same Step 2 worktree-setup block, and it carries 4 of these findings (friction-5, -10, -13, -17). One shared helper script would fix them in one place.

**Other MEDIUM findings, one line each**

- **friction-12.** In ship, around `bkit-ship.md:875-877`: the counter bus check runs before the append.
- **friction-13.** Design, plan and build refuse to run on `dev` before switching to the feature branch in adopt mode.
- **friction-14.** A search that returns zero hits is treated as "nothing found" without a control query (`bkit-plan.md:409`, `bkit-design.md:353`, `bkit-debug.md:706`).
- **friction-15.** The build CI-suppression check reads only `git log -1` (`bkit-build.md:1566`).
- **friction-16.** `bkit-plan-generate.md` appends ledger rows but has no Bash tool, so it can't stamp `ts` with `now`.
- **friction-17.** Step 2 in build and ship doesn't stop when `git fetch` fails, so the worktree can branch off a stale `origin/dev`.
- **friction-18.** The build sub-plan loop doesn't stop at the first sub-plan whose prerequisite isn't met.
- **friction-19.** Ship's branch-push path commits with a suppressor token that the pre-push hook then rejects.
- **friction-20.** Friction writers append rows with no shape check. That is where the bad `ts` values behind harvest-1 come from. Fix: run the same check `.bkit/src/bkit-telemetry.ts` already has, at write time.

---

### What I'd do next (my recommendation; nothing below has been done)

1. Put the 8 rows back into consumer-a's `.bkit/friction.jsonl` from its `HEAD` before anything is committed there. Keep `harvest/` uncommitted until step 3.
2. Fix harvest-1 and harvest-2 before the next harvest: validate rows before choosing winners, and keep every distinct row in the store, not only the winners. friction-20, a shape check at write time, stops new bad rows.
3. Re-run the harvest, then commit `harvest/` in its own commit.
4. Plan first for friction-1 (data loss) and friction-2 (43 entries, the biggest cluster).

## Follow-up, 2026-10-08: harvest fixed, lost rows recovered, 116 entries closed

Picks up from the [harvest + triage comment](https://github.com/cbartens/bkit/issues/99#issuecomment-6050548414). Everything below is edited locally and **not committed yet**.

**Harvest bug (harvest-1 and harvest-2): fixed.**

- `harvest/friction.jsonl` now keeps every distinct row it has ever banked. It only removes exact copies, and is never rewritten down to one row per key. Tools that read it still group rows by key; that now happens only when reading, never when writing (`.bkit/src/bkit-harvest.ts`).
- The timestamp sort now handles date-string and missing `ts` values, so which row counts as the latest no longer depends on file order. One shared comparison, `compareTs` in `.bkit/src/bkit-telemetry.ts`, replaces the four `a.ts - b.ts` sorts.
- New tests reproduce both failures. All 4,129 tests pass except two in `bkit-ledger-integrity.test.ts`, which are about 4 rows in `docs/deferrals.jsonl` and fail the same way on unmodified `HEAD`.
- Logged in `docs/failures.jsonl` (`harvest-store-rewrite-from-fold-drops-pruned-rows`, CRITICAL, CLOSED). `.bkit/jsonl.md`, `docs/architecture.md` and `docs/observability.md` now describe the new behaviour.

**Lost rows recovered.** The store now holds:

- every row from consumer-a's last commit (78 rows)
- every row from the last committed store (257 rows), including the 101 older rows run 1 had dropped

The fixed harvest then ran twice against both consumers:

- **Run 1:** moved the last 16 consumer-a rows into the store. consumer-a's queue is now empty.
- **Run 2:** changed nothing. The store came out byte-for-byte identical, and consumer-a's `stats.jsonl` was untouched.

**Plan and design close bug (friction-1): #493.**

**Subagent stopped early (friction-2, 43 entries): closed against #463.** Noted on #463: only the turn-limit increase from that issue is in the code. The "Reserve report budget" rule and the `MAXTURNS_HIT` counter are not.

**Stale entries closed.** Closing rows were appended for 116 entries:

- the 73 stale ones: 40 FIXED, 14 SUPERSEDED, 19 OTHER
- the 43 friction-2 entries

100 closing rows went to `harvest/friction.jsonl` and 16 to bkit's own `.bkit/friction.jsonl`. Each row cites this triage and its evidence, and the friction-2 rows also cite #463.

- Open entries in the store: 130 → 40.
- Open entries in bkit's own file: 24 → 8.

**What didn't fully close:** for 11 of the 116, the closing row is in the file but nothing will read it as closed. Those rows have a `kind` bkit doesn't recognise (`tool-failure`, `agent-rework`, `template-bug`, and similar), and the grouping code returns no identity for them at all. That's harvest-4 from the #343 report. Until it's fixed, those 11 can't be closed by appending a row.

**Still open from the triage:** the other OPEN findings (friction-3 to friction-21) and the 5 entries that weren't verified.

## Update: committed as `e2ce7a68`

The work in the [follow-up above](https://github.com/cbartens/bkit/issues/99#issuecomment-6050851125) is now committed on `dev`, **not pushed yet**:

- **`e2ce7a68`** `fix(343): harvest keeps every distinct row; close 116 triaged frictions`. It contains:
  - the triage report `docs/audits/202610/friction.md`
  - the harvest report `docs/audits/202610/harvest.md`
  - the harvest fix and its tests
  - the recovered `harvest/` store
  - the closing rows for 116 friction entries, in `harvest/friction.jsonl` and `.bkit/friction.jsonl`
- **`e7f2838c8`** in consumer-a: its `.bkit/friction.jsonl`, now empty because all of its rows are in `harvest/`.

The harvest side, including how the October open list stands now, is written up on #343.

**For the next triage run:** this run is the baseline. The next one should compare against `docs/audits/202610/friction.md`. That report counts 166 open entries before the cleanup. After the closing rows, 50 remain open by the report's own counting: 45 OPEN plus 5 seen but not verified. 11 of the 116 closed entries will still look open to any tool until harvest-4 is fixed (see #343).
