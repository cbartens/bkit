# Design Brainstorm & Ideas

Lens: Conceptual clarity + authoring/dogfood DX — where the `.bkit/` ↔ `.agents/` line sits, what the authoring rule becomes, and how dogfooding survives the move. (Secondary risk premortem per process.)

## Grounding facts (from the current code)

These constrain every approach — verified against the tree, not assumed:

- **Engine resolves payload by walking up from the script, then appending `.agents/templates`.** `getPkgRoot()` (`.agents/scripts/bkit-paths.ts:17`) special-cases the suffix `.agents/scripts`; `runPayload()` (`bkit-install.ts:626`), `runCoreTemplates()` (`bkit-modules.ts:188`), the claude/cursor modules (`bkit-modules.ts:558,620,645,670,749`), `bkit-upgrade.ts` candidate walk (`bkit-install.ts:736`), and uninstall (`bkit-uninstall.ts:425`) all build `path.join(PKG_ROOT, ".agents", "templates", …)`. Move the tree → every one of these join calls changes.
- **`dist/` is flat.** `tsconfig.json` `rootDir: .agents/scripts` → `outDir: dist`, so `bin` is `./dist/bkit-install.js` and `getPkgRoot()` from `dist/` returns `scriptDir/..` = pkgRoot. Any engine move must keep the `dist/` resolution arm working — that is the arm consumers actually run.
- **Dogfood no-op is a path-identity check, not a flag.** `runPayload` skips when `path.resolve(srcDir) === path.resolve(dstDir)` for `.agents/{workflows,prompts}` and `.agents/templates`. In the bkit repo, `PKG_ROOT` resolves to the repo root, so src==dst and the pass copies nothing.
- **bkit's own `.agents/workflows/bkit-*.md` + `.agents/prompts/bkit-*.md` are BOTH runtime content AND install source.** They are NOT under `templates/`. The claude/cursor modules read them from the hardcoded **cwd-relative** paths `.agents/workflows` / `.agents/prompts` (`bkit-modules.ts:531,707,728`), not via `PKG_ROOT`. This is load-bearing: in a consumer the payload pass first copies these into the consumer's `.agents/`, then the mirror reads them back from cwd.
- **`.agents/templates/.agents/` holds CONSUMER copies of `rules.md`/`docs.md`/`friction.md`/`skills.md` — distinct from bkit's own top-level `.agents/rules.md` etc.** `COPY_EXCLUDE` (`bkit-modules.ts:276`) deliberately stops bkit's own out-of-block content (e.g. `### bkit Repo Authoring`) leaking to consumers; the template versions carry only the shared managed block. This is the single hardest "two files, same name, different role" knot in the repo. `rules.md` is the **only** file with an explicit manual two-way sync rule (`.agents/rules.md:102`).
- **Manifest paths are consumer-relative dest paths** (`bkit-manifest.ts:145+`) — they do NOT encode the source tree, so they need no change. The byte-identical guarantee is anchored here: `canonicalHashes`/`tier3Hashes` in the consumer's `.agents/.bkit-version` hash the _destination_ bytes. The refactor is correct iff those hashes are unchanged after the move.
- **`files[]` ships `dist` + `.agents`** (minus tests/snapshots). A move to `.bkit/` must add `.bkit` (and likely drop or narrow `.agents`) so the tarball still carries the payload, including the `gitignore`→`.gitignore` strip remap (`NPM_STRIP_REMAP`, `bkit-install.ts:577`).

The conceptual problem the approaches solve: **`.agents/` is three things at once** — (1) install engine host, (2) install _source_ (`templates/`), (3) bkit's _own_ runtime agent content. The cleanest mental model draws ONE line: "source of truth for what bkit ships" vs "bkit's own working files." The disagreement between approaches is _how much of (1)–(3) crosses that line_, traded against churn and the byte-identical hard requirement.

---

## Approach A — Move the install _source_ into `.bkit/`, keep bkit's own runtime content in `.agents/` ⭐ Recommended

Summary: `.bkit/src/` (engine) + `.bkit/templates/` (the relocated `.agents/templates/**`, including `.claude`/`.cursor`/`.github`/`.husky`/dotfiles); bkit's own `.agents/workflows`, `.agents/prompts`, `.agents/rules.md`, `.agents/docs.md`, etc. **stay** in `.agents/` because they are content bkit runs against itself, not install machinery. The authoring rule splits cleanly: _"install source of truth lives in `.bkit/`; bkit's own agent runtime lives in `.agents/` exactly as a consumer's does."_

Why this draws the right line: the issue's stated goal is "centralise install-related code, templates, scripts." The engine and `templates/**` ARE install-related; bkit's own workflows/prompts/rules are NOT — they are dogfooded content that an installed consumer also has. Keeping them in `.agents/` means **the bkit repo's own `.agents/` looks exactly like a consumer's `.agents/` after install**, which is the whole point of dogfooding and the easiest model to hold in your head: "edit `.agents/` like any consumer; edit `.bkit/` only when changing what bkit ships."

Mechanics that preserve byte-identical output:

- Engine: `tsconfig` `rootDir` → `.bkit/src`; `outDir` stays `dist` (or `.bkit/dist`). Keep `dist/` flat so `bin` and the `dist/` arm of `getPkgRoot()` are unchanged. Add a `.bkit/templates` arm to `getPkgRoot()`/`runPayload`'s PKG_ROOT logic (the suffix special-case becomes `.bkit/src` instead of `.agents/scripts`).
- Templates: `git mv .agents/templates .bkit/templates`; replace every `path.join(PKG_ROOT, ".agents", "templates", …)` (≈8 sites listed above) with a single shared `getTemplatesRoot()` helper so the path is defined once, not 8 times.
- Dogfood: bkit's own `.agents/workflows`/`prompts` stay put → the payload pass src==dst no-op **still holds unchanged** (it compares `.agents/workflows` against `.agents/workflows`). The `templates` mirror arm (`bkit-install.ts:660`) targeted `.agents/templates` → now there is no consumer-side `.agents/templates`, so that arm is **deleted entirely** (templates live in `.bkit/` and are never mirrored into a consumer's `.agents/`). This is a real simplification, not a relocation.
- The `.agents/templates/.agents/{rules,docs,…}.md` consumer copies move to `.bkit/templates/.agents/{rules,docs,…}.md`. The two-way sync rule (`rules.md:102`) is rewritten to point at the new path but the _concept_ is unchanged.

Premortems:

- **10× scale:** Largely inert — install is a one-shot per consumer. The one hotspot is the `getTemplatesRoot()` helper becoming a fan-out point: if mis-resolved, every module fails identically. Blast radius is "all installs broken," but it fails loud and early (the `if (!fs.existsSync(PKG_AGENTS))` guard pattern at `bkit-modules.ts:359` already hard-exits "package corrupt?"). Mitigation: keep that guard and add an equivalent `templates/ not found` guard.
- **6 months later:** Risk that someone "tidies" bkit's own `.agents/rules.md` and forgets the `.bkit/templates/.agents/rules.md` sync — the exact drift this file already warns about, now with a longer path. Magic-number risk: the `getPkgRoot` suffix special-case is a load-bearing string (`.bkit/src`) that, if it drifts from the actual `rootDir`, silently breaks the source-tree resolution arm while the `dist/` arm keeps working — so it passes `pnpm build` + CI but breaks `tsx`-run dev/test. Mitigation: derive the suffix from a shared constant and add a dogfood test that runs the engine via `tsx` (not just `dist/`).
- **On-call at 3am:** Page shape is "consumer install/upgrade emits 0 writes where it should emit N" or "ERR template not found." Diagnosability is good _if_ the path is centralised — one `getTemplatesRoot()` to log. Recovery: `bkit doctor` is read-only and already prints resolved state; extend it to print the resolved `templates/` root. Without centralisation, you grep 8 call sites at 3am.
- **Author leaves:** Bus-factor risk is the dual-resolution arm (`dist/` vs source tree) — non-obvious tribal knowledge that "the suffix check is why dogfood and consumer behave the same." Mitigation: a header comment block in `bkit-paths.ts` enumerating the three run contexts (consumer `dist/`, bkit-repo `tsx`, packed tarball) and which arm each hits. This is the single most important doc artifact of the whole refactor.

Risk-mitigation guidance to fold in regardless: (1) Introduce `getTemplatesRoot()` / `getSrcRoot()` as the _only_ places the layout is encoded — no raw `path.join(PKG_ROOT, ".agents", "templates")` survives. (2) Add a `tsx`-context dogfood integration test asserting `runPayload` is a no-op AND that a packed-tarball install into a clean dir produces byte-identical `.bkit-version` `canonicalHashes` to a pre-refactor baseline (the memory note "dogfood via packed tarball, not the repo" applies directly). (3) Keep `dist/` flat and at repo root for one release even if engine source moves, to avoid simultaneously changing `bin` resolution and payload resolution.

## Approach B — Full mirror: move EVERYTHING bkit ships under `.bkit/templates/`, including bkit's own workflows/prompts

Summary: `.bkit/templates/.agents/workflows/`, `.bkit/templates/.agents/prompts/`, plus rules/docs/etc. all live under `.bkit/`; bkit's own runtime `.agents/` is then _generated by installing onto itself_ from `.bkit/`. The authoring rule becomes the absolute _"only ever edit `.bkit/...`; `.agents/`, `.claude/`, `.cursor/` are ALL generated mirrors — never hand-edit any of them."_

Why someone would want this: maximal conceptual purity — `.bkit/` is the _sole_ source of truth for literally everything bkit ships, and `.agents/` drops to being purely a destination (matching the issue's aspiration "`.agents/` reverts to being just one of the install destinations"). One rule, no exceptions, no "two files same name" knot because the consumer-copy and bkit's-own-copy collapse into the template being installed onto bkit itself.

Premortems:

- **10× scale:** Same one-shot profile, but the dogfood install now does real work every session (it generates bkit's own `.agents/workflows` from `.bkit/templates/`), so the "batch at end of session, not per-edit" memory note becomes load-bearing — per-edit installs get expensive and noisy.
- **6 months later:** The dangerous failure. Today bkit's `.agents/workflows/bkit-*.md` are edited directly and are real files. Under B they are _generated_, so an author editing `.agents/workflows/bkit-design.md` directly (muscle memory) gets silently overwritten on the next `bkit install`, OR — worse — the dogfood install src==dst identity that currently makes the pass a no-op no longer holds (src is `.bkit/templates/.agents/workflows`, dst is `.agents/workflows`, different paths), so the pass becomes a live copy _in the bkit repo itself_. That copy can diverge from byte-identical if any transform/token differs between "bkit installing on itself" and "consumer installing." This directly threatens the hard requirement.
- **On-call at 3am:** Harder to diagnose — "is this file the source or a generated mirror?" is now ambiguous for `.agents/workflows` specifically, where it was previously unambiguous (source). Recovery requires knowing the generation direction.
- **Author leaves:** Higher bus factor — the "everything is generated, edit nothing under `.agents/`" model is clean to state but contradicts years of muscle memory and the existing `.claude`/`.cursor` mirror rule only covering those two trees. New maintainers will hand-edit `.agents/workflows` and be confused when it reverts.

Risk-mitigation guidance: if chosen, the dogfood no-op MUST be re-established explicitly — either (a) a special-case making `.bkit/templates/.agents/workflows` resolve to `.agents/workflows` in the bkit repo (re-introducing path-identity), or (b) a `--self`/dogfood flag that skips the workflows/prompts copy in the bkit repo. Add a CI gate asserting `.agents/workflows/bkit-*.md` byte-equals the rendered `.bkit/templates/.agents/workflows/bkit-*.md` so direct edits are caught immediately rather than silently reverted. Verify the packed-tarball install hashes against baseline (non-negotiable here given the divergence risk).

## Approach C — Lift only the engine to `.bkit/src/`; leave `templates/` where it is (interim/minimal)

Summary: `git mv .agents/scripts .bkit/src` and update `tsconfig`/`bin`; `.agents/templates/**` and bkit's own `.agents/` content stay exactly where they are. The authoring rule barely changes: _"engine code lives in `.bkit/src`; everything else as before."_

Why someone would want this: smallest diff, lowest risk to the byte-identical requirement (template resolution paths are untouched), and it can ship as a safe first step before the bigger template move. Decouples "where does the TypeScript live" from "where do the templates live."

Premortems:

- **10× scale:** No change from today.
- **6 months later:** This is the _incomplete-refactor_ trap. It half-solves the issue: the engine moves but the most confusing part — cross-agent/IDE files living under `.agents/templates/.claude` etc., explicitly called out in the issue as the headline problem — is untouched. The repo now has BOTH `.bkit/` and `.agents/templates/`, arguably _worse_ conceptual clarity than today (a third location). High odds it sits half-done for months.
- **On-call at 3am:** Unchanged diagnosability, but a new maintainer now has to learn that the engine is in `.bkit/src` while its data is in `.agents/templates` — the split that the issue exists to eliminate.
- **Author leaves:** The rationale for the half-split ("we were going to move templates next") is exactly the kind of undocumented intent that evaporates when the author leaves.

Risk-mitigation guidance: only acceptable as an explicitly-sequenced Phase 1 of Approach A with the template move scheduled in the same plan, NOT as a terminal state. If used, the `getPkgRoot` suffix special-case must already be updated to `.bkit/src`, and a `docs/decisions.md` ADR must record that `.agents/templates/` is a _known interim location pending Phase 2_ so the split reads as intentional, not abandoned.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Recommend Approach A: install _source_ (engine + `templates/**`) → `.bkit/`; bkit's own runtime `.agents/` stays | B (full mirror incl. workflows/prompts), C (engine-only) | A matches the issue's actual scope ("install-related"), preserves the dogfood src==dst no-op _unchanged_ for workflows/prompts, and keeps "bkit's `.agents/` == a consumer's `.agents/`" — the clearest mental model. |
| Keep bkit's own `.agents/workflows`/`prompts`/`rules.md` in `.agents/`, NOT under `.bkit/templates/` | Move under `.bkit/templates/.agents/` (B) | These are runtime content bkit _uses_, dogfooded identically to a consumer. Moving them breaks the path-identity no-op and risks non-byte-identical self-install. |
| Centralise layout in ONE helper (`getTemplatesRoot()`/`getSrcRoot()`) | Inline `path.join(PKG_ROOT, ".agents", "templates")` at each site (status quo) | ≈8 call sites encode the layout today; centralising is the only way the move is auditable and 3am-diagnosable. |
| Delete the `templates`→`.agents/templates` mirror arm of `runPayload` rather than relocate it | Re-point it at `.bkit/templates` | Templates no longer live inside any consumer's `.agents/`, so there is nothing to mirror there — the arm becomes dead code. Net simplification. |
| Keep `dist/` flat and at repo root (at least for the boundary release) | Move to `.bkit/dist` simultaneously | Avoids changing `bin` resolution and payload resolution in the same release; the `dist/` arm of `getPkgRoot` is what consumers run — touch it last. |

## Cross-Approach Risks

For the final design's `Risks & Open Questions` section:

- **Byte-identical is verified by `.bkit-version` hashes, not eyeballing.** The pass/fail oracle is: packed-tarball install into a clean dir produces identical `canonicalHashes`/`tier3Hashes` to a pre-refactor baseline. Capture that baseline BEFORE moving anything. Run install AND upgrade (separate engines — memory note "verify install and upgrade live").
- **Dual run-context resolution (`dist/` vs `tsx` source vs packed tarball)** is the highest-leverage failure: a move can pass CI (which builds `dist/`) yet break dev (`tsx` from source) or vice versa, because `getPkgRoot` has two arms. Every approach must add a `tsx`-context dogfood test, not rely on `dist/`-only coverage.
- **`files[]` + `.npmignore` + the `gitignore`→`.gitignore` strip remap must all move together.** If `.bkit/templates/gitignore` is not shipped (npm strips literal `.gitignore` by basename anywhere in the tree, per `bkit-install.ts:565`), upgrade's template walk silently skips it and consumers drift. Verify the packed tarball _contents_ (`npm pack` → list), not just that it builds.
- **The `.agents/rules.md` ↔ `.agents/templates/.agents/rules.md` two-way sync rule** is fragile today and gets a longer path under A/C. Consider a CI assertion that the managed block of bkit's own `rules.md` byte-equals the template's, eliminating the manual sync entirely (independent of which approach ships).
- **Backward-compat for in-flight consumers:** upgrade reads paths from the consumer's existing `.bkit-version`. Those are dest paths (unaffected), but confirm no recorded _source_-shaped path exists anywhere in the version file or migration code before asserting safety.
- **`docs/`, `.agents/docs.md`, `.agents/workflows.md`, and `README.md` reference `.agents/templates`/`.agents/scripts`** in prose — these are doc-drift surfaces that won't fail any gate. Inventory them as part of scope (grep `\.agents/(templates|scripts)` across `docs/` + `*.md`).

> Stopping after brainstorming per protocol — no design doc, plan, or code written.
