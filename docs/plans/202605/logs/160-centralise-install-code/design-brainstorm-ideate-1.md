# Design Brainstorm & Ideas

Lens: Pragmatic — existing code, minimal new infra, ship fastest.

Issue #160 centralises all install machinery + payload into a new `.bkit/` root folder, so `.agents/` reverts to being just one install _destination_ (and bkit's own dogfood runtime), not the install _source_. Hard requirement: consumer output byte-identical before/after. The whole refactor reduces to **one question** — where does the source resolver (`getPkgRoot()` in `.agents/scripts/bkit-paths.ts`) point, and how do the ~6 hardcoded `path.join(pkgRoot, ".agents", "templates", …)` / `.agents` call-sites and the dogfood `src === dst` no-op survive the move. Because `.bkit-version` records **consumer-relative destination** paths (`canonicalHashes` / `tier3Hashes`), no migration of recorded hashes is needed — destinations are unchanged; only the package-internal source tree moves. That collapses the "backward-compatible upgrade across the boundary" risk into "does the new package still emit the same destination paths."

The three approaches differ only in **how aggressively the source tree is physically relocated** and therefore how much surface area the diff touches.

## Approach A — Source moves, single resolver indirection ⭐ Recommended

**Summary:** Physically move `.agents/scripts/bkit-*.ts` → `.bkit/src/` and `.agents/templates/**` → `.bkit/templates/**`, then funnel every source lookup through two new helpers in `bkit-paths.ts` (`getPkgRoot()` + a new `getTemplatesRoot()` / `getEngineSrcRoot()`) so the ~30 hardcoded `path.join(pkgRoot, ".agents", "templates", …)` sites become `path.join(getTemplatesRoot(), …)`. Update `tsconfig` (`rootDir: .bkit/src`), `package.json` (`files: ["dist", ".bkit", …]`, drop `.agents` from `files[]` except what bkit ships of its _own_ runtime — see note), and `bin` stays `./dist/bkit-install.js` (build output path is independent of source location).

- **Layout:**
  ```
  .bkit/
  ├── src/                 # engine (was .agents/scripts/bkit-*.ts) — tsc rootDir
  └── templates/           # payload (was .agents/templates/**), dest layout unchanged:
      ├── .agents/ .claude/ .cursor/ .github/ .husky/ docs/ scripts/
      └── gitignore .gitattributes .mcp.json .envrc .vale.ini AGENTS.md CLAUDE.md …
  ```
- **Dogfood no-op preservation (the crux):** Today the no-op is implicit — `runPayload()` mirrors `PKG_ROOT/.agents/templates` → `.agents/templates` and the `path.resolve(src) === path.resolve(dst)` guard makes it a no-op _because src and dst are literally the same path_ in-repo. After the move, src = `.bkit/templates/.agents/…` and dst = `.agents/…`, so they are **no longer equal** and the guard stops firing. Fix: make the dogfood detection **explicit** — a single `isDogfood()` predicate (`getPkgRoot() === process.cwd()`, i.e. the install source root equals the consumer cwd) that `runPayload()` and the core copy short-circuit on. This is _more_ robust than the current accidental path-equality coincidence. The bkit repo's own `.agents/` content (rules/skills/docs it actually runs) stays where it is and is regenerated into `.bkit/templates/.agents/` only by an explicit author-time sync, not by install.
- **Complexity:** MEDIUM. Mechanical file moves + one resolver indirection + explicit dogfood guard + `tsconfig`/`package.json`/`files[]` edits. Test/snapshot path churn is the bulk of the work, not logic.
- **Extensibility:** HIGH. A single `getTemplatesRoot()` seam means future relocations (or a second payload root) touch one function. New cross-agent/IDE targets (e.g. `.windsurf/`) drop into `.bkit/templates/` with zero resolver changes.
- **Risk:** Dogfood no-op silently breaks → install starts copying `.bkit/templates/.agents/` over the repo's live `.agents/` (self-overwrite). Mitigated by the explicit `isDogfood()` guard + an integration test asserting in-repo `bkit install` is a zero-write no-op for `.agents/`. Second risk: a missed hardcoded path that still points at `.agents/templates` resolves to a now-nonexistent dir → silent skip (templates exist as `if (fs.existsSync)` guards) → consumer file silently not written. Mitigated by grepping all `\.agents.*templates` literals to zero and the dry-run-parity + drift gates.
- **Maintenance:** LOW ongoing. One source-of-truth resolver; the conceptual model ("`.bkit/` = source, everything else = destination") is finally honest, removing the triple-duty confusion that motivated the issue.
- **Reuse vs new:** Maximal reuse — engine logic, tier writers, manifest, drift schema, NPM_STRIP_REMAP all unchanged. Net-new is ~2 path helpers + the explicit dogfood predicate. No new infra, no behaviour change.

## Approach B — Build-time payload staging (source stays, package relocates)

**Summary:** Leave `.agents/scripts/` and `.agents/templates/` **in place in the repo** (minimal diff, dogfood path-equality untouched), and introduce a `prepack`/`build` step that copies them into a `.bkit/` tree _only in the published tarball_. `package.json` `files[]` ships the generated `.bkit/` + `dist/`; the runtime resolver gains a "prefer `.bkit/` if present, else fall back to `.agents/`" lookup so consumers read `.bkit/templates` while the in-repo dev/dogfood path still reads `.agents/templates`.

- **Complexity:** MEDIUM-HIGH. The repo layout doesn't visibly change (so the issue's _stated goal_ — clean repo structure — is only half-met), but you add a generated-artifact pipeline + a dual-location fallback resolver, plus `prepack` must run for `pnpm pack` dogfooding to be representative (the MEMORY note "dogfood via packed tarball" becomes load-bearing).
- **Extensibility:** MEDIUM. New targets still go in `.agents/templates/` (the very mislocation #160 wants to kill), then get copied. The fallback resolver is a permanent fork in the code path.
- **Risk:** Two source-of-truth locations that can silently diverge (repo `.agents/templates` vs tarball `.bkit/templates`); the dual-resolver fallback masks a missing payload as "use the other one" instead of failing loudly. `check:dist`-style staleness gate now also needs a `.bkit/` staleness gate.
- **Maintenance:** HIGH. Permanent build-artifact + dual-path branch; defeats the "single source of truth" intent. Reversible but adds standing complexity.
- **Reuse vs new:** High reuse of engine, but net-new build pipeline + fallback resolver. Does NOT satisfy the issue's structural goal — repo still has install code under `.agents/`.

## Approach C — Big-bang move incl. engine→`.bkit/dist`, no resolver seam

**Summary:** Same physical move as A, but go further: relocate build output to `.bkit/dist/` (not root `dist/`), point `bin` at `./.bkit/dist/bkit-install.js`, and instead of a `getTemplatesRoot()` helper, do a repo-wide find/replace of `.agents/templates` → `.bkit/templates` and `.agents/scripts` → `.bkit/src` at every call-site directly.

- **Complexity:** HIGH. Touches `bin`, `files[]`, `tsconfig outDir`, every consumer's lockfile resolution of the bin path, AND ~30 inline literals with no central seam. Larger blast radius for the same end state as A.
- **Extensibility:** LOW. Inlined literals everywhere mean the next relocation repeats the whole exercise; no seam to change once.
- **Risk:** Moving `dist/` to `.bkit/dist/` changes the `bin` target — any consumer tooling, CI, or doc that references `dist/bkit-install.js` breaks, and it's a gratuitous change unrelated to the centralisation goal (build output location is orthogonal to source location). Higher chance of a missed literal → silent template skip.
- **Maintenance:** MEDIUM-HIGH. No central resolver to maintain, but every future change re-touches many files.
- **Reuse vs new:** High reuse, but the scattered-literal approach is strictly worse than A's single seam for the same payoff, and the `dist/` relocation is net-new churn with no benefit.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Recommend Approach A — physical move + single resolver seam | B (build-time staging), C (big-bang inline) | A actually achieves the issue's structural goal (one honest source of truth) with the smallest standing-complexity cost; B keeps the mislocation and adds a permanent dual-path fork; C inlines literals and gratuitously moves `dist/`. |
| Keep build output at root `dist/`; `bin` unchanged | Move to `.bkit/dist/` (Approach C) | Build-output location is orthogonal to source location. Changing `bin`/`dist` is unrelated churn that risks consumer tooling and the `check:dist` gate for zero centralisation benefit. |
| Make dogfood no-op an **explicit** `isDogfood()` predicate, not implicit `src === dst` path-equality | Rely on path-equality coincidence after move (breaks); skip payload pass by env flag | After templates move to `.bkit/`, src != dst in-repo, so the current accidental no-op stops firing → self-overwrite risk. An explicit `getPkgRoot() === cwd` guard is correct by construction and testable. |
| No migration of `.bkit-version` recorded paths | Rewrite `canonicalHashes`/`tier3Hashes` keys on upgrade | Recorded keys are **consumer-relative destination** paths; the source move does not change any destination, so existing pins stay valid. Treating it as a migration would be solving a non-problem (and risks corrupting valid pins). |
| Funnel all source lookups through `getTemplatesRoot()` / `getEngineSrcRoot()` helpers in `bkit-paths.ts` | Inline find/replace at ~30 call-sites (Approach C) | One seam = one place to change next time, and one place to assert in tests; eliminates the "missed literal → silent template skip" failure mode that scattered literals invite. |
| `files[]` ships `.bkit/` (templates) + `dist/`; drop `.agents/` as an install _source_ from the tarball | Keep shipping `.agents/` for back-compat fallback (Approach B) | The payload now lives entirely under `.bkit/templates/`; shipping `.agents/` too would re-create the dual-source ambiguity #160 exists to remove. NPM_STRIP_REMAP (`gitignore`→`.gitignore`) is unchanged and still applies under `.bkit/templates/`. |

</content>
</invoke>
