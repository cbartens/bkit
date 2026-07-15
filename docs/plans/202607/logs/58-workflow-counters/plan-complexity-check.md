Verdict: SPLIT
<!-- verdict:end -->

# Plan Complexity Check

## Counts

- **Tasks:** 37 (`T1.1`–`T8.3`, counted directly off `- [ ] **T…` markers: WS-1=3, WS-2=11, WS-3=11, WS-4=2, WS-5=4, WS-6=2, WS-7=1, WS-8=3 — 3+11+11+2+4+2+1+3=37). Matches the plan's own self-check ("37 tasks").
- **🔒 Gates:** 6 — Gate 1 (Prerequisites), Gate 2a (Derivation Available), Gate 2b (Derivation COMPLETE — the KN-26 seam), Gate 2 (Code Implementation), Gate 3 (Testing & Documentation), Gate 4 (Automated Verification). Plus an unnumbered Manual Verification block with 8 steps (Step 1–7 incl. 4b/4c/4d).
- **Domain areas:** Effectively one domain (shell scripts + markdown-orchestrated workflow prose + their test suites, all inside a single repo, no API/DB/web UI/mobile/infra split) — but it fans out across **5 workflow files** (`bkit-build.md`, `bkit-debug.md`, `bkit-ship.md`, `bkit-plan.md`, `bkit-design.md`), **2 shipped shell scripts** (new `bkit-status-fold.sh`, modified `bkit-counter-bus.sh`) + a config file, and **4 test artifacts** (2 new `.bats` suites, 1 modified `.bats` suite, 1 new + 1 rewritten Vitest suite).
- **Derived Test Matrix:** 19 rows, each 1:1 mapped to a task (per the plan's own mandatory self-check).
- **Line count:** 740 lines (verified via Read — the plan states 737, close enough; either count is far past a "quick plan" size).

## Session Fit Estimate

37 tasks is already **>12**, which alone crosses the SPLIT threshold in the verdict mapping. Estimated tokens independently corroborate it: each task's `Done when` is a multi-clause verification block (typically 2–6 `grep`/`diff`/`vitest`/`bats` commands plus at least one "verify by temporary edit, then restore" cycle — WS-2/WS-3/WS-5 tasks in particular mandate red→green→red-again proofs). Reading + editing across 5 workflow files at up to 18 distinct call sites, writing 4 new/rewritten test files, running the full bats+vitest+static-gate matrix at 3 separate gates (2a, 2b, 2/3/4), and executing an 8-step manual verification pass (each invoking real subprocess chains) is conservatively 130K–180K tokens of agent work end-to-end — well past the 85K threshold even before counting the plan's own re-reads of its 740-line self.

## Rationale

This is a large but _not_ uniformly mechanical plan: the size comes from 37 independently-verified tasks, not from one repetitive loop. It does not fit one session by either the task-count or token-count leg of the threshold, so **SPLIT** applies. However, the split must respect the plan's own load-bearing constraint before anything else:

**The seam that must NOT become a sub-plan boundary:** Gate 2b names it explicitly — T3.0–T3.7 (derivation, 8 tasks) and T3.8 (fail-closed hardening) must land as one unit, because hardening `decide_next`/`check_max` before every site derives converts "may silently overrun" into "never retries" (KN-26). The plan also ties T5.3 (completeness rule) and T5.4 (mapping rule) into that same seam: both must be RED before WS-3 starts and GREEN after it finishes, and T5.4's own Done-when is exercised via edits made _against already-converted_ WS-3 sites. WS-6 (delete inert primitives) is independently pinned to run only _after_ every site converts, so it cannot precede WS-3 either. None of these can be pulled out from the WS-3 block.

**Proposed groupings (3 sub-plans), each proven not to cross the seam:**

1. **Sub-plan A — Prerequisite + additive scaffolding (WS-1 + WS-2 + T5.2 + Gate 2a).**
   Tasks: T1.1–T1.3, T2.0–T2.10, T5.2 = 15 tasks (11 from WS-2 alone, which the plan itself calls "additive, primitives untouched"). Single-sources the fold, adds `counter_count`/`counter_next`/`counter_current` as new functions alongside the still-live inert primitives, adds the cross-process derivation test suites, and adds the no-dead-constant rule. **Not the seam:** nothing here touches an existing call site, hardens a guard, or deletes anything — Gate 2a is explicitly a pure-addition checkpoint ("primitives untouched", guard not yet hardened). This is the one grouping in this plan that is genuinely reversible/no-risk in isolation, and it is the biggest task cluster (15) but the lowest-risk one, so it absorbs the excess.

2. **Sub-plan B — The KN-26 atomic core (T5.1 + T5.3 + T5.4 + WS-3 [T3.0–T3.9] + Gate 2b).**
   Tasks: T5.1, T5.3, T5.4, T3.0–T3.9 = 14 tasks. This is the one grouping the plan forbids splitting further — it must convert all 18 `--argjson` sites across `bkit-build.md`/`bkit-debug.md`/`bkit-ship.md` _and_ harden the guard _and_ prove both the completeness and mapping rules fire, in that order, in one continuous pass, because Gate 2b is positioned specifically to block T3.8 until every site is converted. At 14 tasks this sits 2 over the 12-task heuristic — a deliberate exception, not a quality miss: the plan's own text ("Task order is load-bearing… do not reorder, do not split the PR along that seam") makes this the one block where honoring the 12-task ceiling would recreate the exact regression #58/KN-26 exists to prevent. This sub-plan must run as one uninterrupted execution session even though it nominally exceeds the threshold.

3. **Sub-plan C — Prose cleanup, deletion, provenance, docs (WS-4 + WS-6 + WS-7 + WS-8 + Gate 3 + Gate 4 + Manual Verification).**
   Tasks: T4.1, T4.2, T6.1, T6.2, T7.1, T8.1, T8.2, T8.3 = 8 tasks, plus the Gate 3/Gate 4 checklists and the 8-step Manual Verification block. Depends on Gate 2b having passed (T4.1 is explicitly gated on it — deleting prose before every site converts is "worse than the status quo"; T6.1/T6.2 must run after every call site converts; T7.1 depends on T3.4). **Not the seam:** by the time this sub-plan starts, derivation and hardening are already both shipped together from sub-plan B: nothing here can re-separate them. Comfortably under 12 core tasks even before folding in gate/verification overhead.

Each of the three groupings ends at a plan-native gate (2a, 2b, 4) that already exists as a checkpoint in the document, so the split lines are the plan's own seams, not new ones invented for this check. Sub-plan B is flagged as the one place where a strict 12-task cap cannot be honored without reproducing the regression the plan exists to fix — that tension should be surfaced to the human, not silently resolved by cutting it further.
