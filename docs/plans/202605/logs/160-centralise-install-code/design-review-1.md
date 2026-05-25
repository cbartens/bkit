Verdict: CONCERNS

<!-- verdict:end -->

# Design Review

Lens: Buildability — stack feasibility, library fit, integration risk.

## Ecosystem Search

This is a pure internal-structural refactor (move source tree + re-point a resolver seam) on an existing TypeScript/Node CLI. No new capability, framework, library, or external API is introduced, so the "what exists in the ecosystem" axis is largely N/A. The relevant built-in primitives the design relies on are all already in the stack and proven:

- **File-tree relocation** — `git mv` (USE-AS-IS). Preserves history; no library needed. `.bkit/` does not yet exist (verified: no collision), so the move target is clean.
- **Run-context package-root resolution** — `node:url` `fileURLToPath(import.meta.url)` + `node:path` suffix walk (USE-AS-IS; already the live mechanism in `bkit-paths.ts:17-22`). The design extends the existing pattern rather than introducing anything new.
- **Path-equality dogfood guard** — `node:path.resolve` equality (already live at `bkit-install.ts:643,662`). The proposed `isDogfood()` is `getPkgRoot() === process.cwd()` — a thin wrapper, no new dependency.
- **tsc single-rootDir build** — already in use; moving `rootDir`/`include` is a config edit, not a new tool.

Recommendation: the entire change is BUILD-CUSTOM by necessity (it is repo-specific plumbing), but every primitive it leans on is USE-AS-IS from the existing stack. No ecosystem gap. The risk is not "can the stack do this" — it can — but "does the design correctly account for everything the live code actually does." Several claims do not (see below).

## Stack Feasibility

Buildable with the approved stack (TypeScript 5.4, tsc, tsx, vitest 4, Node ≥20, pnpm). `git mv` + config edits + a resolver seam are all well within reach. The `tsconfig` `rootDir`/`include` move from `.agents/scripts` → `.bkit/src` keeps `outDir: dist` flat, so `bin: ./dist/bkit-install.js` and `check:dist` are genuinely untouched — that part of the design is correct and verified against `tsconfig.json` and `package.json`.

Constraints / corrections against the live code:

1. **`getPkgRoot()` suffix detection is duplicated, not single-seam.** The design says it extends the suffix special-case in `bkit-paths.ts`. But the identical `scriptDir.endsWith('.agents/scripts')` derivation is INLINED a SECOND time inside `runPayload()` (`bkit-install.ts:628-630`), independent of `getPkgRoot()`. The seam is not single until that inline copy either calls `getPkgRoot()` or is deleted with the templates arm. The design's "single resolver seam" framing is therefore incomplete; the build will silently use the old `.agents/scripts` suffix in `runPayload`'s PKG_ROOT under tsx-from-`.bkit/src` and resolve PKG_ROOT one level too shallow.

2. **`vitest.config.ts:5` hardcodes `.agents/scripts/**/\*.test.ts`** and is NOT in the design's tooling-change list (which names only tsconfig + package.json scripts). Post-move, vitest finds zero tests → CI green-but-empty. This must move to `.bkit/src/\*\*`.

3. **`getPkgRoot()` two arms, not three resolution outcomes.** The design's "three run-contexts" is accurate as a risk frame, but contexts (1) and (3) collapse to the same `scriptDir/..` arm; only the suffix string in the source arm changes. Feasible, but the header-comment + shared-constant mitigations the design proposes are warranted because the tsx-source arm is the only one CI's `dist/` build does not exercise.

## Library / API Evaluation

No new libraries. `picomatch@^4` (the sole runtime dep) is untouched. `node:fs/path/url/crypto` usage is unchanged. Bundle size, type coverage, license: all N/A — no dependency-graph change. `dist/` stays flat and pre-built; the `check:dist` gate (`rm -rf dist && tsc && git diff --exit-code dist/`) remains the correctness oracle for the build output and is unaffected by source relocation as long as `rootDir`/`include`/`outDir` move together (they do in the design).

## Integration Risk

Monorepo fit: single package, single `tsconfig`, single `dist`. Blast radius is the install/upgrade engine + its tarball packaging + ~all test path constants. Systems touched: tsc build, vitest, npm pack/`files[]`, the install engine, the upgrade engine (separate), uninstall, preflight.

The dominant integration risk is the **`files[]` / tarball-contents claim, which is factually wrong against the live code** (see CRITICAL). The design states (line 73) "bkit's own `.agents/` runtime is NOT shipped in the tarball (it never was as content — only `.agents/templates/**` and `.agents/{workflows,prompts}/bkit-*.md` shipped)." Verified false via `npm pack --dry-run`: today's tarball ships **187 files under `.agents/`**, including `.agents/skills/**`, `.agents/trackers.md`, `.agents/IDEs.md`, `.agents/cloud.md`, `.agents/prompts.md`, `.agents/workflows.md` — not just templates + workflows/prompts. And the engine genuinely depends on several of these at consumer-install time:

- `runCoreModule` step 1 (`bkit-modules.ts:380`) does `fs.readdirSync(PKG_ROOT/.agents)` + `copyAdditive` of EVERY entry except `COPY_EXCLUDE` {skills, scripts, README.md, .bkit-version, rules.md, friction.md, docs.md, skills.md, .env.example}. So it copies `IDEs.md`, `cloud.md`, `prompts.md`, `workflows.md`, `trackers.md`, `workflows/`, `prompts/` (and currently `templates/`) into the consumer's `.agents/`.
- `IDEs.md`/`cloud.md`/`prompts.md`/`workflows.md` are `CANONICAL_OVERWRITE_RELPATHS` (`bkit-modules.ts:304-309`) — overwritten on every install, i.e. tracked canonical consumer output.
- `loadTrackers(pkgRoot)` reads `PKG_ROOT/.agents/trackers.md` (`bkit-trackers.ts:204`) and HARD-THROWS if absent.
- `bkit-install.ts:904` reads `PKG_ROOT/.agents/prompts.md` for the cursor model lookup.

Dropping `.agents` wholesale from `files[]` and shipping only a narrow `workflows/prompts/bkit-*.md` glob — the design's stated answer to its own open question — would break tracker loading (hard throw) and stop shipping the canonical `.agents/*.md` docs and skills to consumers. The open question is materially underscoped: it considers only workflows/prompts, not the five+ other `.agents/` paths the engine reads or copies.

## PoC Approach

Minimal proof (do NOT build): in a scratch worktree, (1) capture a baseline `.bkit-version` (`canonicalHashes`/`tier3Hashes`) AND a full recursive listing of the installed `.agents/` tree from a pre-refactor packed-tarball install into a clean dir; (2) `git mv` `.agents/scripts`→`.bkit/src` and `.agents/templates`→`.bkit/templates`; (3) re-point the resolver seam + BOTH inline PKG_ROOT derivations + vitest include + tsconfig; (4) `npm pack`, install AND upgrade into a clean dir; (5) diff the new `.bkit-version` hashes AND the recursive `.agents/` listing against baseline. The listing diff (not just hashes) is essential because the bulk `copyAdditive` output is NOT hash-tracked. This is just inside 200 words but only because the byte-identical oracle alone is insufficient — the hash set does not cover the untracked payload, so the proof needs a second comparison axis. That gap is itself a CONCERNS signal.

## Unknowns & Blockers

- **Resolved during review:** `.agents/templates/.agents/` holds only rules/docs/friction/skills/.env.example (no workflows/prompts) — design claim confirmed. `.bkit-version` keys are destination-relative (confirmed: keys like `.agents/rules.md`, `scripts/rollback-main.sh`; zero source-shaped `templates`/`.agents/scripts` keys) — the no-migration claim is sound at the schema level. claude/cursor mirrors read cwd-relative `.agents/{workflows,prompts}` (`bkit-modules.ts:532-533,707,728`) — confirmed unaffected by source move. The `runPayload` templates arm (`bkit-install.ts:660-666`) is genuinely dead after the move (its `tplSrc` ceases to exist → `fs.existsSync` guard skips) — design claim correct.
- **Blocker before planning:** the precise `files[]` glob set that keeps the tarball shipping every `.agents/` path the engine reads/copies (trackers.md, IDEs.md, cloud.md, prompts.md, workflows.md, skills/, workflows/, prompts/) while excluding the relocated source. This needs experimentation against a real `npm pack` + clean-dir install+upgrade, not a paper rule.
- **Unknown:** whether fresh consumers losing `.agents/templates/` (post-move, `copyAdditive` no longer has a `PKG/.agents/templates` to recurse) is acceptable. It is untracked output (integration test at `bkit-modules.integration.test.ts:220-223` explicitly filters `.agents/templates/**` out of consumer-output comparison), so it likely is — but the design never states this behaviour change.

## Verdict Reasoning

CONCERNS (not FAIL): the refactor IS feasible in the approved stack — the relocation, seam, tsconfig/vitest edits, and dogfood guard are all buildable, and the no-migration + mirror-unaffected + dead-templates-arm claims verify true. It is not PASS because the design rests on a factually incorrect statement about tarball contents that, if implemented as written ("drop `.agents` wholesale, narrow workflows/prompts glob"), would produce a broken build/install: hard-throw in `loadTrackers` and dropped canonical consumer docs/skills. These are addressable (the fix is a correct `files[]` glob and acknowledging the `copyAdditive` payload), so the design can proceed once corrected — hence CONCERNS, not FAIL.

## CRITICAL

1. **Correct the false "`.agents/` not shipped" premise (design line 73) and re-scope the `files[]` open question.** The engine ships AND consumes far more than workflows/prompts from `PKG_ROOT/.agents/`: `trackers.md` (runtime hard-read by `loadTrackers`, `bkit-trackers.ts:204`), `prompts.md` (`bkit-install.ts:904`), and `copyAdditive` of `IDEs.md`/`cloud.md`/`prompts.md`/`workflows.md`/`trackers.md`/`workflows/`/`prompts/` (`bkit-modules.ts:380` + `CANONICAL_OVERWRITE_RELPATHS` 304-309), plus `skills/**` shipping today. The `files[]` rule must keep all of these in the tarball; the current open-question answer (drop `.agents`, narrow glob) would break tracker loading and consumer doc parity.

2. **The resolver seam is duplicated — `runPayload()` (`bkit-install.ts:628-630`) inlines its own `endsWith('.agents/scripts')` PKG_ROOT derivation independent of `getPkgRoot()`.** Extending only `bkit-paths.ts` leaves this second site resolving against the old suffix under tsx-from-`.bkit/src`. Either route it through `getPkgRoot()` or delete it with the (correctly dead) templates arm — but the surviving workflows/prompts arm still needs a correct PKG_ROOT, so the derivation cannot simply vanish.

3. **`vitest.config.ts:5` `include` is hardcoded to `.agents/scripts/**` and is missing from the design's tooling-change inventory.\*\* Unchanged, vitest discovers zero tests post-move → CI passes vacuously. Add it to scope alongside tsconfig and package.json.

4. **Byte-identical oracle has a blind spot the design treats as complete.** `canonicalHashes`/`tier3Hashes` track only Tier-managed files (5 `.agents/*` keys + the cross-agent destinations). The bulk `copyAdditive` output (workflows/, prompts/, IDEs.md, cloud.md, trackers.md) is explicitly NOT added to the writeset (`bkit-modules.ts:390` comment). The verification gate must add a recursive `.agents/` tree diff (and full consumer-tree diff) against baseline, not rely on the hash set alone, or a dropped-file regression in untracked payload ships green.

## OPTIONAL

- Acknowledge in the design that fresh consumers stop receiving `.agents/templates/` post-move (it is currently `copyAdditive`'d in but is untracked output filtered out of test comparisons). Confirm this is intended; if so, state it as an accepted, behaviour-visible change rather than leaving "byte-identical" unqualified.
- The test-churn inventory should explicitly include the parity-test harness seed `fs.mkdirSync(tmpDir/.agents/templates)` (`bkit-dry-run-parity.integration.test.ts:29`) and the in-test PKG_ROOT-relative template literals at `bkit-modules.integration.test.ts:678,869,1151,1263` (in addition to the line-866 PKG_ROOT derivation the design already names). The `path.resolve(SCRIPTS_DIR, "..", "..")` PKG_ROOT derivations stay correct (`.bkit/src` is still two levels under root); only the embedded `.agents/templates/...` segments need re-pointing.
- `CORE_TEMPLATE_DIRS` (`bkit-modules.ts:154` = `{"docs", ".agents", "scripts"}`) are dest-relative dir names within the template tree, not source paths — verify they are untouched by the move (they should be) and note so, to pre-empt a false-positive grep hit during the bulk edit.
- Prose-drift inventory should include `.bkitignore` (its header comment cites `.agents/templates/`) and the `.github/workflows/ci.yml:82` comment (and its template source).

## OUT OF SCOPE

- `outDir`/`dist` relocation to `.bkit/dist/` — design correctly defers; orthogonal to centralisation and would churn `bin`.
- Retiring the manual `rules.md` two-way sync via a CI byte-equality gate — cheap to bundle but independent of this refactor; defer to planning as the design suggests.
- The external skills-sync mechanism (`skills-lock.json` + tooling outside the bkit install engine) — `.agents/skills/` ships in the tarball but does not flow through the template/payload seam this refactor touches; its shipping requirement is a `files[]` concern (covered in CRITICAL #1), not an engine-logic concern.
