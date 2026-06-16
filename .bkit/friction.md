<!-- bkit:start -->

# Friction

> [!CAUTION]
> **Purpose:** Friction log — moments where orchestrator or subagents needed human action, rework, or recovery. Drives prompt and guardrail refinement.
> **Categories:** `human-confirm | permission-prompt | agent-rework | manual-install | tool-failure | destructive-backout | other`.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - Before writing, cross-check `.agents/docs.md` — verify topic does NOT belong in other doc.
> - Append-only at EOF, do NOT overwrite.
> - Once written, ONLY edit `Recovery` / `Status` / `Confidence` / `Last-confirmed` as required; NEVER edit `Description` / `Suggested fix`.
>
> **Format:**
>
> ```markdown
> ## {Title} (YYYY-MM-DD)
>
> - **Category:** {one of above}
> - **Scope:** bkit-repo | consumer | universal
> - **Workflow:** design | plan | build | debug | ship
> - **Step:** {N} — {Step Name} (or `orchestrator` if outside a step)
> - **Source:** orchestrator | {subagent-name}
> - **Description:** what happened, what action was needed
> - **Suggested fix:** prompt/guardrail change to consider (omit if none)
> - **Related:** {FID}, Linear IDs BAR-{N}, PRs PR-{N}, Commits {SHA}, paths, etc
> - **Recovery:** what unblocked it (manual fix, subagent retry, workaround in commit `{SHA}`, n/a)
> - **Status:** `OPEN` (default) | `RECOVERED` | `FIXED-IN: {REF}`
> - **Confidence:** high | medium | low — real recurring gap vs one-off; raise on recurrence
> - **Last-confirmed:** YYYY-MM-DD — most recent recurrence; defaults to entry date
> ```

<!-- bkit:end -->

<!-- Entries up to 2026-05-18 cleaned out after capture into BAR-155 (shipped) and BAR-230 (follow-ups). Harvest evidence preserved in those issues; recovered/duplicate entries removed. -->

<!-- 2026-06-01 friction reconciliation: 35 consumer entries harvested (app-gether-life + visitfrasercoast-com) and reconciled with the 9 bkit-repo entries against dev HEAD under a verified-fix bar. 12 already-fixed entries pruned; 27 verified-open gaps migrated to issue #216 (P0–P3 backlog) and removed here; the 5 consumer-side/transient entries below have no bkit-side fix. -->

## Ship Step 9: dev commit blocked by pre-commit hook (2026-05-24)

- **Category:** tool-failure
- **Workflow:** ship
- **Step:** 9 — Update Docs & Summary
- **Source:** orchestrator
- **Description:** Ship workflow Steps 8-12 must commit docs-only changes to `dev`. The `pre-commit` hook (husky `.husky/pre-commit`) refuses commits on `dev`/`main` unless `$PWD` matches `*.worktrees/*`. Git sets hook `$PWD` to the repo working-tree root (REPO_ROOT), not the caller's cwd, so calling `git -C "$REPO_ROOT" commit` from within a worktree directory does NOT pass the `*.worktrees/*` guard. No `--no-verify` allowed.
- **Suggested fix:** Ship workflow Steps 9/10/Close should commit via a temp branch (`docs/ship-{FID}`) created from dev in a new temp worktree, commit there (branch != dev/main → hook allows), then FF-merge dev from REPO_ROOT. Or: add a hook exception for commit messages matching `[skip ci]`.
- **Related:** bar-174-auto-bin-items, PR #70
- **Recovery:** Temp branch + FF-merge workaround (commits `0377061d`, `86e8c130`)
- **Status:** `RECOVERED`

## 2026-05-29 — Build Challenge 2 (114-email-thread-memory) — 529 Overloaded

**Step:** Step 9 (Build Challenge), challenge-2 subagent
**Error:** `API Error: 529 Overloaded` — two consecutive attempts failed.
**Recovery:** Retry after brief pause.
**Status:** Resolved — succeeded on 3rd attempt using haiku model.

## 2026-05-29 — Pre-push leakage guard blocked push (114-email-thread-memory)

**Step:** Step 16/17 (Summary/Create PR), pre-push hook
**Error:** `SeedRepoLeakage FAIL` — `app-gether-life` token in a JSDoc comment in `strip-quoted.ts:22`.
**Recovery:** Removed the forbidden token (replaced "app-gether-life" with "seed repo" in the comment). Fix committed and pushed clean.
**Status:** Resolved.

## 2026-05-30 — Post-merge dev CI red: Payload migrate over Supabase IPv6 (43-payload-bootstrap)

- **Category:** infra / post-merge-failure
- **Workflow:** ship (follow-up fix on dev)
- **Step:** 12 — Close Workflow (squash-merge CI assertion)
- **Source:** orchestrator
- **Description:** WS-1 added a post-merge "Apply Payload Migrations" CI step (`payload migrate`) that connects directly via `DATABASE_URL` = the Supabase _direct_ endpoint `db.<ref>.supabase.co:5432`, served over IPv6 only. GitHub Actions runners have no IPv6 route → `connect ENETUNREACH …:5432`. Invisible on PRs (step is dev/main-push only), so it first failed on the dev squash-merge run `26680973946`. Unit/build/E2E all green; only the migration apply failed.
- **Suggested fix:** Any GitHub-Actions step that opens a _direct_ socket to Supabase Postgres must use the IPv4 **session** pooler (`aws-1-<region>.pooler.supabase.com:5432`, user `postgres.<ref>`), not the direct host. Transaction pooler (6543) can't run DDL. The Supabase CLI (`db push`) is unaffected — it uses the Management API.
- **Recovery:** Rewrote the step to fetch the pooler `db_host` from the Management API (region-agnostic) and rebuild `DATABASE_URL` as the session-pooler URL before `payload migrate`. Validated by a `[force build]` dev run.
- **Related:** #43; dev run `26680973946` (red) → fix commit on dev; docs/deployments.md § "System 2".
- **Status:** RECOVERED

## 2026-05-31 — pre-existing `fcte`-forbidden CI gate collides with #77 `source_type='fcte'` (77-ingest-partner-corrections)

- **Category:** plan-vs-policy-collision
- **Workflow:** build
- **Step:** 5 — Plan Execute (sub-plan 2, slice A)
- **Source:** bkit-build-plan-execute + orchestrator
- **Description:** `packages/ai/src/prompts/forbidden-tokens.test.ts` (added by #137 realign-packages-ai) lists `fcte` in `FORBIDDEN_SOURCE_ONLY_TOKENS` and scans `packages/ai/src/prompts`, `packages/services/src/corpus`, `packages/ai/src`, `apps/web/src/app/api/chat`, `apps/web/evals` for the literal token. Green on `dev`. But #77 — and the live DB CHECK `source_type in ('web','partner','fcte')` (`20260521200000`) — requires `fcte` as a corpus `source_type` value in exactly those dirs. Part 1's T2 union narrowing (already verified PASS + committed: `314b729`) added `fcte` to `match-chunks.ts` (JSDoc) + `match-chunks.test.ts` (~8 assertions), turning the gate RED (4 violations). The Part-1 verify did NOT run this AI-package gate, so it slipped through. The slice-A agent tried to comply by writing `fcte` as `"fc"+"te"` (the repo's own anti-self-trigger idiom) in `embeddings.integration.test.ts` but left `as "fcte"` so the gate stayed red, and concatenation can't express a TS literal-union member anyway. The plan never anticipated this gate.
- **Suggested fix:** Plan/design step should grep for pre-existing `forbidden-tokens.test.ts` SCAN_DIR + token policies before introducing a new brand/source-type literal into a scanned dir. Part-1 verify (and any verify touching `packages/services/src/corpus` or `packages/ai`) should run the AI-package `forbidden-tokens.test.ts` gate, not only typecheck + co-located unit tests.
- **Related:** #137 (#111 realign); commit `314b729` (Part 1); DB CHECK `20260521200000`; `match-chunks.ts`, `match-chunks.test.ts`, `embeddings.integration.test.ts`.
- **Recovery:** Operator decision (AskUserQuestion 2026-05-31): UPDATE the gate — drop `fcte` from `FORBIDDEN_SOURCE_ONLY_TOKENS` (legitimate DB-CHECK-enforced corpus source_type, not brand leakage) and remove the `"fc"+"te"` obfuscation so code/tests use the plain literal. To be captured in Part 3 Task 13 ADR + `docs/sync-with-gether.md` § Deviation.
- **Status:** RECOVERED

## 2026-06-02 — Branch push blocked: lint-staged prettier --write disagrees with pre-push prettier --check (203-ci-green-validated)

- **Category:** tooling / hook-divergence
- **Workflow:** plan
- **Step:** 10 — Summary (branch push)
- **Source:** orchestrator
- **Description:** Each per-step commit's pre-commit hook runs lint-staged `prettier --write --ignore-unknown` on the STAGED files only, so generated plan markdown is written-and-committed as "formatted." But the pre-push hook runs repo-wide `prettier --check` (`pnpm format:check`), which flagged two already-committed plan files (`plan-v2-reviewed.md`, `plan-v4-1.md`) as unformatted and blocked `git push` (`husky pre-push code 1`). The two tools disagreed on large subagent-authored markdown (tables / embedded fenced YAML), so `--write` at commit-time did not satisfy `--check` at push-time.
- **Suggested fix:** Plan/design/build close + summary steps that push a branch should run `pnpm format:check` (or a `prettier --write` over `docs/plans/{YYYYMM}/logs/{FID}/`) BEFORE `git push`, not rely on per-commit lint-staged. Alternatively make lint-staged + format:check share one resolved prettier invocation so `--write` is guaranteed to satisfy `--check`.
- **Recovery:** `npx prettier --write` on the two flagged files → `pnpm format:check` clean → committed `chore(203-...): prettier-fix plan docs` → push succeeded.
- **Status:** RECOVERED

## [2026-06-10] Build #245 plan-1 spike blocked — opencode not installed

- **Workflow:** build
- **Step:** 5 — Plan Execute (sub-plan 1/5)
- **Issue:** `build-plan-execute-1-log.md` returned PENDING verdict. Root cause: plan-1 is an empirical spike requiring (a) opencode CLI binary (not found on PATH), (b) a real provider endpoint (Ollama or NVIDIA), and (c) human confirmation of Gate 1 checkboxes (both unchecked). Agent cannot complete the spike without these preconditions.
- **Recovery:** Install opencode (`npm i -g opencode` or equivalent), start a provider (Ollama with model pulled, or set NVIDIA_API_KEY), check both Gate 1 human-confirmation boxes in `plan-1.md`, then re-run `/bkit-build #245`.
- **Status:** Failure Path triggered; handover written.

## [2026-06-16] Build #261 WS-7 mirror render — `pnpm bkit install` silently flips opencodeProvider + `--opencode` scopes install

- **Workflow:** build
- **Step:** 5 — Plan Execute (WS-7 mirror re-render); recurred at Step 11 remediate re-render
- **Source:** orchestrator
- **Description:** Plain `pnpm bkit install` (no host flags) defaulted `bkit.opencodeProvider` to `ollama-local` (`bkit-modules.ts` `?? "ollama-local"`) instead of preserving the committed dev value `nvidia` — silently rewriting `package.json`, re-rendering every `.opencode/agents/*.md` `model:` line to `ollama-local/...`, flipping `.opencode/opencode.json`, and updating `.bkit/version`'s opencode.json canonicalHash — all out-of-scope drift for an authoring-only feature. Compounding: `pnpm bkit install --opencode=nvidia` does NOT do a full render — `--opencode=<provider>` SCOPES the install to the opencode module only (adds `opencode` to `moduleFlags`), so `.claude/`/`.cursor/` command mirrors are never re-rendered and silently went stale (a later NOTE-comment edit reached `.opencode` but not `.claude`/`.cursor`).
- **Suggested fix:** WS-7 mirror re-render in bkit-repo builds must pin the provider AND select all hosts: `pnpm bkit install --claude --cursor --opencode=<committed bkit.opencodeProvider>`. Better: make install preserve an existing `package.json` `bkit.opencodeProvider` (read-existing-then-default) so a plain dogfood install is idempotent on the provider.
- **Recovery:** Reverted the flip (`git checkout HEAD -- package.json .opencode/opencode.json .bkit/version`), then full-host re-render with the committed provider: `pnpm bkit install --claude --cursor --opencode=nvidia`. Verified `.opencode/agents` 0-diff, provider `nvidia`, all 6 command mirrors carry the gate + NOTE, `pnpm bkit check` exit 0.
- **Status:** RECOVERED
