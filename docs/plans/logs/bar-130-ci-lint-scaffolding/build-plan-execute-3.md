# Build Plan Execute — Sub-plan 3 (Scope C: CLI redesign + ship prep)

**FID:** bar-130-ci-lint-scaffolding
**Sub-plan:** 3/3
**Verdict:** CONCERNS

## Tasks completed

- Phase 3 (deprecation stubs) — Tasks 3.1, 3.2, 3.3
- Phase 4 (module dispatcher + CLI refactor) — Tasks 4.1, 4.2, 4.3, 4.4 (deletion of bkit-init.ts), 4.5, 4.6
- Phase 8 (README rewrites) — Tasks 8.1 (README.md ## Consumer CI auth), 8.2 (.agents/README.md)
- Phase 9 (decisions + pending) — appends complete
- Phase 10 (version bump) — Task 10.1 (package.json 0.1.2), Task 10.2 (pre-PR gate), Task 10.4 (bkit-ship handoff documented)

## Tasks deferred (manual + external)

- Task 10.3 — `app-gether-life` smoke (Gate 4.5a) → post-PR human run
- Task 10.4 — Tag push handed off to `bkit-ship`
- Manual Verification Step 8 — second-consumer onboarding (Gate 4.5b) → post-PR human run

## Verification commands

| Command               | Exit | Detail                                                        |
| --------------------- | ---- | ------------------------------------------------------------- |
| `pnpm typecheck`      | 0    | clean                                                         |
| `pnpm test`           | 0    | 157 passed, 0 todo, 7 files                                   |
| `pnpm format:check`   | 0    | clean                                                         |
| `pnpm lint:slop`      | 0    | 3 pre-existing in `.agents/skills/`; no v4-3 surface findings |
| `pnpm build`          | 0    | dist clean — no `bkit-init.js`                                |
| `pnpm pack --dry-run` | 0    | only `dist/`, `.agents/`, `README.md`, `package.json` ship    |
| `pnpm tsx ... check`  | 1    | DRIFT DETECTED — 4 writes pending; see Concerns               |

## Concerns

1. `bkit check` against bkit-the-repo exits 1 (drift on `docs/decisions.md`, `docs/pending.md`, `.agents/.bkit-version`, `.github/workflows/ci.yml`). The plan v4-1 line 291 anticipated this would be exit 0; reality is the templates differ from bkit-the-repo's actual content, so drift is expected. Real fix is either (a) align bkit-the-repo's content with templates exactly, or (b) skip self-test on bkit-the-repo dogfood and rely on consumer-CI for self-test parity. Recommend (b) — bkit-the-repo is the source of truth for templates, not a consumer of them.
2. Unplanned files: `.agents/scripts/bkit-status.ts` + `bkit-status.test.ts` (status.json invariant validator). Not in plan-3. Harmless utility but scope creep. Optional follow-up: extract to `docs/pending.md` for review.
3. Manual smoke gates 4.5a/4.5b — deferred to post-PR human run.

<!-- verdict:end -->
