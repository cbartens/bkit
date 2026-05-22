# Design Brainstorm & Ideas

Lens: Integration, lifecycle & operator ergonomics — workflow registry fit, Linear/git lifecycle, deprecation seam, downstream consumers, day-to-day friction.

## Approach A — Full-Ceremony Sixth Workflow (`/bkit-audit`, Linear-bound, `docs/audits/{FID}-audit.md` canonical) ⭐ Recommended

**Summary (one sentence):** Ship `/bkit-audit` as a peer to `/bkit-design`/`/bkit-plan` — full FID-driven orchestrator (worktree, lock, status.json, comment-per-step, dev squash-merge) producing a canonical `docs/audits/{FID}-audit.md`, with a dedicated Linear issue carrying the `Audit` phase label, mirroring the contract in `.agents/workflows.md` § Common Workflow Anatomy and § Versioned Outputs.

**Slash-command surface:**

- Command: `/bkit-audit [optional-target-glob]`. No argument → repo root. Argument is a glob/path (passed into `audit-input.md` as `SCOPE_GLOB`); lens probes intersect with it.
- Top-level `/bkit-audit` (not `/audit`) preserves the `/bkit-*` namespace established in `.agents/workflows.md` § File Layout. `/audit` would collide visually with `/audit` patterns common in tooling and break the `bkit install` Cursor T1/T2/T3 transform conventions which expect `bkit-` prefix.
- FID generation with no Linear issue: `audit-{YYYYMMDD-HHmm}-{repo-slug}` (e.g. `audit-20260515-1402-bkit`). Format-asserted with a regex extension to `^([a-z]+-[0-9]+-[a-z0-9-]+|audit-[0-9]{8}-[0-9]{4}-[a-z0-9-]+)$`. The Step 1 "extract `[A-Z]+-\d+` pattern" branch falls through to `save_issue({ title: "Audit run {timestamp}", state: "In Progress", labels: ["Audit"], team: "Bartens" })` — same pattern as design Step 1 sub-step 4 fallback. This keeps every audit attached to Linear by default, which preserves the comment-per-step audit trail and lets the synthesiser reuse `save_comment`/`list_comments` plumbing unchanged.

**Linear lifecycle:**

- New issue per audit run when invoked without `BAR-NNN`; if `/bkit-audit BAR-199` (re-audit a tracked issue) — reuse it, add `Audit` label, drop other phase label.
- New phase label `Audit` (mutually exclusive with `Design|Plan|Build|Ship|Merged` per `workflows.md` § Labels). `Failed` and `Debug` remain additive.
- State transitions: `Todo` → `In Progress` (Step 1) → `In Review` (Step N close). PASS audits with zero CRITICAL findings auto-route to `Done` (one-shot — no human review needed for a clean read-only report); CONCERNS/findings stay in `In Review`.
- Comment-per-step lifecycle identical to design — one comment, append-only sections. Each lens's verdict line appears in Step 3 fenced block as a compact table.

**Output location:**

- Canonical: `docs/audits/{FID}-audit.md` (versioned chain in `docs/plans/logs/{FID}/audit-v{N}-*.md`, copied at close-workflow, matching the design "v3-organised → drafts/" semantics).
- Per-lens logs: `docs/plans/logs/{FID}/audit-lens-{slug}.md` (opinion-only logs, same shape as `plan-review-1.md`).
- Synthesis/prioritize/summary: `audit-v1-synthesis.md`, `audit-v2-ranked.md`, `audit-summary.md` (versioned drafts per § Versioned Outputs row 1).
- Lifecycle: never auto-superseded. New audit = new FID = new file. `docs/audits/INDEX.md` (auto-appended at close-workflow) lists `{FID} | date | verdict | CRITICAL count` so consumers find latest without globbing.

**Standalone prompt deprecation:**

- Header-only deprecation note on `.agents/prompts/bkit-utility-audit-{codebase,security,tests,logs}.md`. Two-line block under frontmatter:
  ```
  > [!CAUTION]
  > **Deprecated — see `/bkit-audit`.** Standalone invocation supported for one-off scope; new audits SHOULD use the workflow for lens-diversity + synthesis.
  ```
- `.agents/prompts.md` § Utility table row gets a leading `⚠️` and a new `Status: deprecated; superseded by /bkit-audit` column-equivalent inline note.
- File move deferred — keeping standalone invocation alive avoids re-plumbing `@bkit-utility-audit-codebase` shortcuts users have in muscle memory.

**Cross-workflow hooks (Open question 1):**

- **v1 = no hooks.** Audit stays standalone. Rationale: `bkit-debug-summary` queueing an audit on workaround-close would silently create Linear issues from inside a debug loop — surprise side effect; violates the "agents NEVER touch Linear" workflow-only rule unless dispatched by an orchestrator. `bkit-design-review-1/2` referencing the lens checklist when introducing heavy deps is layered into the existing review prompt (no audit-workflow coupling) — append two bullets to `bkit-design-review-1.md` § Process Step 5 ("Check against lens checklist in `.agents/prompts/bkit-audit-lens-*.md` for dep/perf hotspots") without invoking the audit workflow itself.
- **v2 hook (designed, not implemented):** `bkit-debug-summary` emits a `recommended-followup: audit` field in its Linear-bound verdict body when `CONCERNS` + workaround applied. Human reads, optionally dispatches `/bkit-audit`. Recommendation-only, no auto-dispatch.

**Concurrency:**

- Lock key = `{FID}`. Audit run uses its own FID (`audit-{timestamp}-...` or the re-audited `bar-NNN-...`). Lock collisions only occur if user re-runs `/bkit-audit BAR-199` while `/bkit-build BAR-199` holds the lock for the same FID. Cross-FID parallelism = unrestricted (`/bkit-build bar-199-x` + `/bkit-audit audit-202605-bkit` coexist).
- Same-FID re-audit allowed (new audit FID per timestamp) — the timestamp suffix makes every invocation a fresh lock.
- Build/debug/ship NEVER reach into `docs/audits/`. Audit NEVER touches `docs/plans/`. Domain separation = no cross-contamination.

**Friction & noise (read-only workflow ergonomics):**

- The comment-per-step + status.json discipline costs ~7 Linear writes per run (steps 1, 2, 3 fan-out, 4, 5, 6, 7). Mitigation: Step 3 (lens fan-out) appends ONE compact comment listing all 12 lens verdicts in a table, not 12 individual comments. Same shape as design `Step 3 — Brainstorm & Ideate` single append.
- `bkit install` mirror-regen at session end is part of the standard close-workflow pattern (no special audit-only logic).
- Sweep `.agents/friction.md` at close, identical to design Step 10 sub-step 2.

### Premortems

**10× scale (~120 audits run/week across multiple repos):**

- _What breaks:_ `docs/audits/` accumulates 120+ files/week unsorted. Linear comment thread on shared "audit run" issues bloats. `bkit-audit-prioritize` becomes the bottleneck — 12 lens inputs \* average 15 findings = 180 findings to dedup, easy to OOM the synthesiser at `xhigh` effort.
- _Observability:_ `docs/audits/INDEX.md` length + `status.json` history — operator sees count drift. Linear's Audit label total count surfaces in milestone view.
- _Recovery:_ Add `docs/audits/{YYYYMM}/` monthly archival at close-workflow (mirrors `docs/plans/completed/{YYYYMM}/` shape). Per-lens prompt truncates findings to top 30 by severity before handoff to synthesiser. Cap prioritize input at 250 findings; CONCERNS verdict if exceeded.

**6 months later:**

- _What breaks:_ Lens prompts drift from probe descriptions in the design doc (Lens charter table in `design-input.md` §Lens charter). New stack-pinning creeps in as bkit's preview repos add Next.js / pnpm — violates portability decision #6. `.agents/prompts.md` § Utility table accumulates deprecated rows that no one prunes. Linear `Audit` label semantics drift — does it mean "audit in progress" or "issue needs audit"?
- _Observability:_ Quarterly review of `bkit-utility-audit-codebase.md` deprecation note — has it been ≥1 release since deprecation? If yes, schedule deletion. `grep -r "Next.js\|pnpm\|Vercel" .agents/prompts/bkit-audit-lens-*.md` cron-style check (could be CI gate).
- _Recovery:_ Deprecation header includes `Deprecated since: v{X.Y.Z}; deletion target: v{X.Y+1.0}` so future agents have a clock. Lens charter table copied verbatim into a `lens-charter.md` shared doc; lens prompts cite it for probe definitions to prevent drift.

**On-call at 3am:**

- _Page shape:_ No pages — read-only workflow. Failure mode = workflow stuck/crashed at 3am during a scheduled audit (v2 case). Page surface = `status.json` `IN_PROGRESS` > 30min idle.
- _Diagnosability:_ status.json shows last `step` slug + parentSha. Per-lens logs are persisted on disk in worktree even if synthesiser timed out — partial recovery viable. Comment-per-step on Linear shows last successful step.
- _Recovery:_ Standard workflow resume pattern (read status.json, pick up after last DONE). 30-min idle → stale-lock cleanup. If synthesiser repeatedly times out → manual `@bkit-audit-synthesize` standalone invocation with reduced lens count.

**Author leaves:**

- _Knowledge concentration:_ 12 lens charters + synthesis dedup rules + prioritize matrix logic = ~15 prompt files. High bus factor risk if only one human owns the lens taxonomy.
- _Load-bearing tribal knowledge:_ "Why are there exactly 12 lenses and not 9 or 15?" The BAR-197 retro context (`design-input.md` §Context) is the rationale anchor. Must live in `.agents/prompts.md` § Audit Phase rationale block, not get lost when BAR-199 closes.
- _Recovery:_ Add "Audit Phase" section to `.agents/prompts.md` with the Lens charter table copied + the BAR-197 retro link as historical justification. Same pattern as Build Challenge phase section.

### Risk-mitigation guidance (additive — layer onto chosen approach)

- Lens charter table → `.agents/prompts/bkit-audit-lens-charter.md` (shared doc all 12 lens prompts cite). Single source of truth for probe wording; prevents drift.
- Lens output cap: 30 findings per lens (top by severity). Prevents prioritize-step OOM at scale.
- Synthesiser → `bkit-audit-synthesize` carries a Justification block when collapsing findings across lenses (matches `bkit-build-challenge-reconcile` § "Downgrade only with explicit `## Justification`" pattern in `.agents/prompts.md` § Build Phase).
- Workflow registry update: add row to `.agents/workflows.md` § File Layout table + § Common Workflow Anatomy reference. Don't forget the `bkit install` template under `.agents/templates/.claude/commands/` — that directory doesn't exist (verified by `Glob`), so the mirror is generated; just ensure `bkit-install.ts` picks up the new file.
- `docs/audits/INDEX.md` is append-only with stable schema; consumers (humans + future bkit tools) parse it without globbing.
- Lens portability gate: at audit-synthesize step, grep findings text for stack-pinning words (`Next\.js|Vercel|pnpm|esbuild`) — if any, append CONCERNS to verdict with a `## Portability Drift` section. Enforces decision #6 mechanically.

---

## Approach B — Lightweight Subroutine of `/bkit-design` (no top-level command, no Linear)

**Summary (one sentence):** Add `audit-mode` as a flag to `/bkit-design` (`/bkit-design --audit [target]`) reusing the brainstorm-ideate triplet fan-out pattern but routing to lens-subagents instead; output is a single `docs/plans/logs/{audit-FID}/audit-report.md` with no Linear issue and no `docs/audits/` canonical artifact — purely ephemeral inside `docs/plans/logs/`.

**Slash-command surface:** No new top-level command — `/bkit-design` carries a mode switch.
**Linear lifecycle:** None. Audit doesn't touch Linear; FID generated locally from timestamp; no comment, no label, no issue.
**Output location:** `docs/plans/logs/audit-{timestamp}/audit-report.md` (ephemeral; cleaned up on `docs/plans/logs/` archival).
**Standalone prompt deprecation:** Registry note only (no file move); existing `bkit-utility-audit-*` prompts stay live since they're closer in spirit to this lightweight mode.
**Cross-workflow hooks:** None — too lightweight to integrate.
**Concurrency:** No lock collisions since no FID overlap with feature work; can run alongside any other `/bkit-*` freely.
**Friction & noise:** Minimal — single output file, zero Linear writes.

### Premortems

**10× scale:** Audits run frequently but findings are forgotten — no canonical artifact, no Linear trail, audits become disposable. Operators stop running them. _Recovery:_ none — fundamental design choice.

**6 months later:** Zero institutional memory of past audit findings. The BAR-197 retro motivation ("would an audit pass have caught the bundling debt") fails because audits don't persist beyond a single session. `/bkit-design --audit` overloads the design command's semantics — new contributors confused about whether it produces a design or an audit. _Recovery:_ requires migration to Approach A.

**On-call at 3am:** No page surface (no Linear, no status.json — actually status.json still exists in `docs/plans/logs/`). Workflow stuck = manual cleanup of `docs/plans/logs/audit-*/` directories. _Recovery:_ `rm -rf docs/plans/logs/audit-*` brute-force.

**Author leaves:** Lens taxonomy lives only in the design-workflow prompt file — fragile. Discovery requires reading `/bkit-design`'s prompt; `.agents/workflows.md` doesn't list `--audit` separately.

### Risk-mitigation guidance

- Promote `audit-report.md` to a tracked output by adding `docs/audits/{audit-FID}-audit.md` at close — but at that point you're 80% of the way to Approach A and have lost the simplicity.
- Document the `--audit` flag in `.agents/workflows.md` § Design Phase entry to mitigate discoverability.
- Add a one-line registry note in `.agents/prompts.md` § Utility deprecation row.

---

## Approach C — Hybrid: top-level `/bkit-audit` but no Linear issue, output to `docs/plans/drafts/`

**Summary (one sentence):** Top-level `/bkit-audit` command with the full multi-lens-then-synthesise pipeline, but skip Linear entirely (no issue, no comment, no label) and route canonical output to `docs/plans/drafts/{audit-FID}-audit.md` — treats audits as draft artifacts in the same directory as designs/plans, leveraging the existing `drafts/` discovery surface.

**Slash-command surface:** `/bkit-audit [optional-target]`. FID = `audit-{YYYYMMDD-HHmm}-{repo-slug}` always; never reuses BAR-NNN.
**Linear lifecycle:** Skipped. Local-only workflow. status.json still maintained for resume + lock semantics.
**Output location:** `docs/plans/drafts/{audit-FID}-audit.md` (alongside `{FID}-design.md` and `{FID}-plan.md`). Mixes audit artifacts into the same dir as designs/plans.
**Standalone prompt deprecation:** Header-only, same as Approach A.
**Cross-workflow hooks:** None in v1.
**Concurrency:** Lock per FID; no overlap with feature-FID work since audit FIDs are always `audit-*`-prefixed.
**Friction & noise:** Zero Linear writes — least noisy of all three approaches. But also least visible — no audit trail in Linear means findings can be silently ignored.

### Premortems

**10× scale:** `docs/plans/drafts/` becomes cluttered with audit-* mixed in with plan/design drafts. Browsing the directory becomes painful. *Recovery:\* split — move to `docs/audits/` (which is Approach A's choice).

**6 months later:** No Linear tie means audit findings die in `drafts/`. Workflow registry has an orphan command that nobody surfaces in milestone planning. Issues that should have triggered an audit (e.g. BAR-197-style retros) don't because there's no Linear label/state to query "issues needing audit". _Recovery:_ retrofit Linear plumbing — same work as starting from Approach A.

**On-call at 3am:** Less observability — failure isn't visible in Linear. Operator must grep status.json or `docs/plans/drafts/audit-*`. _Recovery:_ manual.

**Author leaves:** Same lens-charter concentration risk as Approach A. Plus the "why is `/bkit-audit` not Linear-bound when every other `/bkit-*` is?" question — surprises every new contributor.

### Risk-mitigation guidance

- If retaining no-Linear stance: explicit `.agents/workflows.md` § Audit Phase block stating "Linear-skipped by design" with rationale, or future contributors will "fix" the omission.
- Move output to `docs/audits/` (away from drafts/) to keep concerns separated — once you do, you have Approach A minus Linear.
- Add an `audit-index.md` similar to Approach A's `docs/audits/INDEX.md`.

---

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives considered | Why |
| --- | --- | --- |
| Top-level `/bkit-audit` command (Approach A surface) | `/bkit-design --audit` subroutine (B), `/audit` non-prefixed (rejected) | Mirrors `/bkit-*` namespace convention in `.agents/workflows.md` § File Layout. Subroutine overloads design semantics. |
| Linear-bound (own issue when no `BAR-NNN`, reused when present) | Linear-skipped (B, C) | Comment-per-step audit trail + label-based queryability for "needs audit" workflows. Reuses entire orchestrator plumbing from design/plan. |
| New phase label `Audit` (mutually exclusive with Design/Plan/Build/Ship/Merged) | Reuse `Design` label, additive label | Mutually exclusive matches `.agents/workflows.md` § Labels semantics — workflow state machine stays consistent. |
| Canonical output → `docs/audits/{FID}-audit.md` | `docs/plans/drafts/` (C), ephemeral in logs (B) | Domain separation — audits are not plans/designs. Mirror existing `docs/plans/drafts/` + close-workflow copy pattern. `docs/audits/INDEX.md` enables consumer discovery without globbing. |
| FID format extends to `audit-{YYYYMMDD-HHmm}-{repo-slug}` when no Linear issue | Reuse Linear ID always (forces issue creation) | Audits invoked ad-hoc shouldn't require an existing Linear issue; timestamp suffix guarantees uniqueness for concurrent runs. |
| Standalone prompts: header-only deprecation | File move, immediate deletion | Per existing decision #5 in `design-input.md`; keeps muscle-memory standalone invocations alive during transition. |
| No cross-workflow hooks in v1 | Wire debug-summary / design-review hooks | Surprises and side-effects compound risk in v1. v2 can layer hooks once the lens charter is stable. Layering lens-checklist references into `bkit-design-review-*` prompts is a non-coupling enhancement, doesn't require workflow integration. |
| `audit-{FID}` lock semantics: per-FID, never overlaps feature FIDs | Per-repo audit lock (rejected) | Maintains uniform lock-key invariant across all workflows; audit FIDs are isolated by prefix. |
| Single comment per Step 3 fan-out (table of lens verdicts) instead of 12 separate comments | 12 individual comments per lens | Avoids Linear-thread bloat; matches design `Step 3 — Brainstorm & Ideate` pattern. |
| `bkit install` mirror-regen at session end (standard pattern) | Per-edit mirror-regen | Per user memory (`feedback_bkit_install_batching.md` + `feedback_no_per_edit_bkit_install_in_subagents.md`): batch at session end. |

## Cross-Approach Risks

Surface for the final design's `Risks & Open Questions` section regardless of which approach is chosen:

1. **Lens-prompt portability drift (decision #6).** Without a mechanical gate (synthesiser-level grep for stack-pinning words), individual lens-prompt edits will silently re-pin to Next.js / pnpm over time. The portability decision is load-bearing for cross-repo use but has no enforcement teeth in current `.agents/prompts.md` rules.
2. **Synthesiser scale-out.** 12 lenses × ~15 findings each ≈ 180 findings into one `bkit-audit-synthesize` agent. At `xhigh` effort + 200K context the Opus model could truncate. Compare to `bkit-build-challenge-reconcile` which merges 2 inputs only. Mitigation: per-lens finding cap + truncation observability (`bkit-audit-synthesize` should self-report "{N}/{TOTAL} findings processed" in verdict header).
3. **Deprecation half-life.** `bkit-utility-audit-{codebase,security,tests,logs}.md` deprecation note has no expiration mechanism. Without a "deletion target version" annotation, deprecated prompts will live indefinitely, accumulating tech debt in `.agents/prompts.md` § Utility table.
4. **`Audit` label semantics.** Does `Audit` mean "issue under audit by `/bkit-audit` run" or "issue flagged as needing audit"? Both readings will surface. Resolution must land in `.agents/workflows.md` § Labels with one canonical definition.
5. **Smoke-test reproducibility (acceptance criterion).** "Run against bkit repo at pre-BAR-197 dev tip → lenses 1, 2, 3, 7 surface known debt" requires git checkout to a specific SHA. Worktree creation in Step 2 hardcodes `origin/dev` — need an explicit `BASE_REF` override path or smoke-test cannot run.
6. **Comment-per-step cost.** Even with the Step 3 fan-out consolidation, an audit run = 7-8 Linear writes. At 10× scale this is ~1000 writes/week from audits alone. Linear's API best-effort wrapper (`save_comment`/`save_issue`) absorbs failures but at high volume rate limits become realistic. Consider batching the close-workflow steps' summary + comment into one write.
7. **Downstream consumers (Open question 3).** Today nothing reads `docs/audits/{FID}-audit.md`. If the answer stays "nothing", the audit risks becoming write-only. Mitigation: lightweight `docs/audits/INDEX.md` + a future `bkit-build-install-skills` hook checking the latest audit's CRITICAL count before letting a build proceed (deferred to v2; only viable once audits are routinely run).
8. **Lock-collision with same-issue re-audit.** `/bkit-audit BAR-199` while `BAR-199` already has a feature workflow in flight shares the FID-based lock. Resolution: timestamp-suffix audit FID ALWAYS (never reuse `BAR-199` directly as audit FID) — but then "re-audit this issue" loses the lineage tie. Open: should the audit FID be `{ISSUE_ID}-audit-{timestamp}` for traceability, or fully decoupled?

## Lens Summary

The audit workflow is fundamentally a new peer in a tightly-orchestrated `/bkit-*` family — its biggest integration risk is not the lens taxonomy (which is well-specified) but the lifecycle seams: Linear issue/label/state semantics, the deprecation half-life of the standalone `bkit-utility-audit-*` prompts, and the absence of downstream consumers that would make audit findings actionable. Approach A's full-ceremony recommendation aligns the new workflow with the existing pattern (status.json, lock, comment-per-step, dev squash-merge) so operators carry zero new mental model; the cost is ~8 Linear writes per run, mitigated by Step-3 fan-out consolidation. The hardest-to-reverse decisions are the FID format extension (`audit-{timestamp}` namespace), the new `Audit` label semantics, and the `docs/audits/` canonical location with INDEX file — these define the audit's identity in the bkit ecosystem and should be locked first; cross-workflow hooks, scheduled audits, and standalone-prompt deletion can all be deferred to v2 without backtracking.
