Verdict: CONCERNS
Failures: 3

<!-- verdict:end -->

# Plan Review

Lens: Dependency correctness, design-coverage.

Design artifact: none (`docs/plans/**/651-sops-env-backup-design.md` absent; plan `Inputs` confirms design step skipped) → design-coverage check n/a; issue § Decisions already made used as implied-dependency source (all reflected). Template structure vs `docs/templates/bkit-plan.md`: every section present, in order; every task carries `Done when` + `Test first`; dropped Conditional rows (`Schema State`, `Notifications`) inapplicable. No dependency cycles.

Dependency graph (producer → consumer): T1 `hasTool`, EB file, `MIN_SOPS`, CI install → T2-T7 · T2 script skeleton, config, `.sops.yaml` template + root copies, dogfood entries → T3-T7 · T3 encrypt/stage → T4 (tracked `.enc` fixtures), T6 · T4/T5 verbs → T6 row 23 · T6 hooks + `.husky/post-commit` + dogfood entry → T7 (dogfood whole-adoption) · T8, T9 independent · T10 rule source → T12 mirror · T11 doc sources → T12 mirror · all → T12.

## CRITICAL

1. **Task 10 consumes an artefact produced only by Task 12.** Task 10 `Done when` = `pnpm vitest run .bkit/core/engine/audits` green, but that folder holds `.bkit/core/engine/audits/repo/rules-sync.test.ts:58-69`, which asserts the managed block of `.agents/rules.md` byte-equals `.bkit/core/.agents/rules.md`. The mirror refresh (`pnpm tsx .bkit/core/engine/cli.ts upgrade`) is in Task 12 → Task 10 cannot reach `Done when` in runbook order. Fix: run the mirror refresh (and `git config core.bare false`) inside Task 10, or move the `audits` run out of Task 10 into Task 12.
2. **Age public key prerequisite pinned to the wrong task.** Pre-Flight `User Context` says "Needs from Christian before Task 7: age public key (Q9)", but Task 2 consumes it (root `.sops.yaml` fill, `grep -c "{{AGE_PUBLIC_KEY}}" .sops.yaml` = 0, dogfood `placeholder` entry). Task 2 cannot defer the root copy: `dogfood-templates.test.ts:685` "every template has an entry, and every entry is a template" forces the root `.sops.yaml` in the same task that adds `.bkit/templates/.sops.yaml`. Build-agent constraints, A6 and Manual Verification Step 1 all say Task 2 → Pre-Flight contradicts them. Fix: Pre-Flight `User Context` → "before Task 2".
3. **Matrix rows 5 and 18 assigned to Task 2 depend on Task 3 logic.** Task 2 ships `encrypt` as "plans only". Row 5 requires "first-encrypt probe file deleted" — the no-`.enc`-yet key probe is "the first create below" (Architecture § Key probe), i.e. Task 3's new-`.enc` create + verify path. Row 18 requires `--dry-run` to name "files that would change" — for an existing `.enc` that needs Task 3's decrypt + per-key diff; Task 2's `Test first` asserts only the would-create path, and no later task asserts `would update`. Fix: split — Task 2 keeps row 5's existing-`.enc` probe case and row 18's would-create case; Task 3 adds row 5's first-create probe case (temp file deleted on exit 128) and row 18's `would update` assertion to its `Done when` / `Test first`.

## OPTIONAL

- **Task order 6 → 7 leaves an inconsistent intermediate tree.** Task 6 wires the root `.husky/pre-commit` env-backup block; Task 7 adds the `.gitignore` `!.env.enc` / `!.env.*.enc` lines. Between them, a main-checkout commit with the key would stop on the `.gitignore` gate. Harmless in the build worktree (no husky hooks run), but swapping 6 and 7 (or folding Task 7 into Task 6) keeps every commit self-consistent.
- **Task 9 tip vs `.bkit/wording.md`.** OPEN failure `wording-test-setup-tips-lines-not-in-wording-file` says setup-tip lines must appear in `.bkit/wording.md`; `.bkit/wording.md` is in the `template-path-refs.test.ts:100` corpus, which forbids every template path (new: `.sops.yaml`, `.husky/post-commit`, `scripts/env-backup/…`). State in Task 9 whether a wording line is added and that its text names no template path.
- **Human-gated items bundled into chain-head tasks.** Task 1 bundles the Q6-gated CI step with `hasTool` + EB; Task 2 bundles the Q9-gated key fill with the script skeleton. Either gate unmet blocks Tasks 2-7. Tasks 8 and 9 have no upstream dependency — note in Integration Shape that they can run while Q6 / Q9 are pending, and state the Task 1 fallback if Q6 is refused (EB `hasTool` throws on CI).
- **Related issues unverified.** #497 and #529 listed "state not in plan input"; `related-issues.md` = "None". Both touch `bkit-secrets.mjs` (Task 8). Confirm neither is an open blocker or in-flight branch before Task 8.
- **Tasks 3-6 re-sync check.** `Done when` uses `cmp` for the root script copy; adding `dogfood-templates.test.ts` to each (as Task 2 / Task 7 do) catches config-file drift too.

## OUT OF SCOPE

- None beyond the plan's own `Suggested Scope Expansion` table (guardrails `.env*.enc` classification, README row, agents-audit Step 8 clause).
