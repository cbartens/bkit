Verdict: CONCERNS
Failures: 6

<!-- verdict:end -->

# Build Challenge — BAR-167 (bkit v2.0.0: drop **bkit** envelope)

Coverage note: partial diff coverage (12768 lines > 10000 threshold). Findings limited to the
top-20 files supplied in build-input context (and tightly coupled callers found while reading
them). Did NOT inspect every workflow / template / mirror file.

## Findings Log

### MAJOR-1: writeTier2JsonContained silently destroys consumer content when destination JSON is malformed

- class: architectural
- location: `.agents/scripts/bkit-tiers.ts:227-241` (try/catch around `JSON.parse(dstRaw)`).
- scenario: A consumer hand-edits `.claude/settings.json` or `.cursor/hooks.json`, makes a typo
  (trailing comma, unclosed brace), then runs `pnpm bkit install` (e.g. inside CI auto-run, or via
  the husky `prepare` script after `pnpm install`). The catch-branch falls through to
  `fs.writeFileSync(dstPath, JSON.stringify(template, null, 2) + "\n", "utf-8")` — the entire
  consumer file is overwritten with the bkit template; ALL consumer-added keys are lost. There is
  no backup, no advisory, no log line distinguishing this from a fresh seed. Contrast with
  malformed `package.json`, which is correctly surfaced as a `malformed-package-json` blocker in
  preflight (`.agents/scripts/bkit-preflight.ts:86-101`) and refuses to mutate. Tier-2 JSON loses
  the same protection here.
- fix: Before overwriting, either (a) push an advisory through `ctx.advisories` and ABORT the
  write (mirror malformed-package-json blocker semantics), or (b) rename the malformed file to
  `dstPath.bkit-malformed-{timestamp}` and then write the template (analogous to
  migrateLegacyBkitEnvelope's `.bkit-migrate-tmp` discipline). Same fix applies to the symmetric
  catch in `runClaudeModule` / `runCursorModule` (`bkit-modules.ts:518` / `:619`) where parse
  errors fall through silently.

### MAJOR-2: slop-scan.config.json manifest format ("json") does not match install behaviour ("byte-equal-text" via writeTier3) — uninstall path will deep-strip a file install never touched as JSON

- class: mechanical
- location: `.agents/scripts/bkit-manifest.ts:82` declares
  `{ path: "slop-scan.config.json", format: "json", module: "lint" }`. `bkit-modules.ts:1010-1028`
  installs it via `writeTier3` (seed-or-print, byte-equal-text semantics).
- scenario: Consumer runs `bkit install --lint` (file seeded once via Tier-3). They later edit
  `slop-scan.config.json` — e.g. adopt the default `weight: 1.5` intentionally for one rule, or
  keep the bkit-shipped rule set verbatim. They run `bkit uninstall --lint`. Decision table
  routes to `case "json"` → `stripTier2JsonScope(consumerDoc, templateDoc)`. Any key whose value
  is byte-equal to the template gets DELETED. The consumer who deliberately kept template defaults
  silently loses their config (`rules`, `ignores`, `overrides[0].files`, `overrides[0].rules` etc.
  all match the template). Decision reason logged is the misleading
  `"json (deep-containment) — strip bkit-owned scope, preserve consumer keys"` — implies safety
  that does not exist for a file that was never written under deep-containment semantics.
- fix: Either change manifest entry to `format: "byte-equal-text"` (so uninstall routes through
  `shouldDeleteTier3` hash guard — the install-time hash is already recorded in
  `tier3Hashes`/canonicalHashes per `bkit-modules.ts:381-414`), or change `runLintModule` to use
  `writeTier2JsonContained` for genuine deep-containment install + uninstall symmetry. The latter
  changes install UX (no more AI-merge advisory). The former matches current install semantics
  and is the surgical fix.

### MAJOR-3: ci.yml manifest format ("markered-text") does not match install behaviour (writeTier3) — uninstall always returns misleading "no bkit markers found" reason

- class: mechanical
- location: `.agents/scripts/bkit-manifest.ts:69` (`format: "markered-text"`), versus
  `bkit-modules.ts:895` `runCiModule` calls `writeTier3` (whole-file seed-or-print). The template
  itself (`.agents/templates/.github/workflows/ci.yml:23`) uses 6-space-indented
  `# bkit:start` / `# bkit:end` markers, which `findAnchored` in `bkit-install.ts:421-437` does
  NOT detect (`ALLOWED_PREFIXES = ["", "# ", "// "]` — no indent allowance).
- scenario chain:
  - `buildDecisionTable` (`bkit-uninstall.ts:231-249`) calls `detectMarkerStyle(content)`. Both
    regexes (`/^<!-- bkit:start -->$/m` and `/^# bkit:start$/m`) require column-0 anchors. ci.yml
    markers are at column 6. Returns `null` → decision `"preserve"`, reason
    `"markered-text but no bkit markers found — 100% consumer content"` (false — ci.yml DOES have
    indented markers; they're just not recognised). The user is told a wrong reason, the file is
    correctly preserved by accident.
  - `detectTier2TextDrift` (`bkit-preflight.ts:447-449`) uses the same column-0 regex; ci.yml
    drift is never surfaced as an advisory. A consumer whose ci.yml has gone stale gets no
    upgrade hint.
- fix: Either (a) accept indented markers in `findLineAnchoredMarkers` /
  `detectTier2TextDrift` (allow `^\s*# bkit:start$` for hash-comment), AND classify ci.yml as
  `byte-equal-text` in the manifest to match the Tier-3 install (so uninstall stops emitting a
  false reason), or (b) leave ci.yml as `byte-equal-text` in the manifest only (no install change
  needed) and document the indented-marker limitation in the detector. The current state has
  install/uninstall/check semantics in three different positions for the same file.

### MAJOR-4: .vale.ini manifest format mismatch — same class as MAJOR-3

- class: mechanical
- location: `.agents/scripts/bkit-manifest.ts:81` declares `format: "markered-text"`; runLintModule
  (`bkit-modules.ts:974-991`) installs via `writeTier3` (no markers written). The template DOES
  have hash-comment markers (Group B test verifies col-0 placement), but on the consumer side
  install never writes markers — it copies the whole template on absent, prints AI merge
  instructions on present. So on uninstall, the consumer file either has markers (only if the
  consumer manually preserved them) or no markers; either way the manifest classification doesn't
  match the install-time behaviour.
- scenario: Consumer ran `bkit install --lint` once (file seeded, markers from template happened
  to come along because writeTier3 dumps the whole template). Consumer edits the file outside the
  markers and runs `bkit uninstall --lint` → strip-block route runs, removing only the inner
  block (correct behaviour by coincidence). But if they edited INSIDE the marker block (intent =
  customize bkit-owned scope), uninstall blows their edits away. There's no install-time guard
  that warns the consumer the markers exist in their seeded file.
- fix: Switch manifest to `byte-equal-text` (mirror ci.yml fix in MAJOR-3) and document that
  Group B INI/YAML files are install-seed-or-skip, not install-managed-block.

### MAJOR-5: CHANGELOG 2.0.0 entry under-represents breaking changes — bkit:start/end markers added to 12 Group A + 3 Group B templates and lint-no-tier-terms regression guard are not listed

- class: mechanical
- location: `CHANGELOG.md:9-35` (2.0.0 entry).
- scenario: A consumer reading the CHANGELOG before bumping does not learn that (a) `AGENTS.md`,
  `CLAUDE.md`, `.agents/rules.md`, `.agents/docs.md`, `.agents/friction.md`, `.agents/skills.md`,
  `docs/plans/template.md`, `.cursor/rules/00-shared-rules.mdc` and the four
  `.vale/styles/House/*.yml` files now ship with `bkit:start/bkit:end` markers (changes consumer
  customisation semantics for these files), (b) `ci.yml` and `.vale.ini` now ship Group B partial-
  ownership markers, (c) install dispatch for `.claude/hooks/preflight.sh`,
  `.cursor/hooks/preflight.sh`, `.cursor/rules/00-shared-rules.mdc` switched from writeTier1
  (fully-managed rewrite) to writeTier2 (markered-text update) per `bkit-modules.ts:528-543`
  comment — this is a real behaviour change because writeTier2 preserves consumer content outside
  markers while writeTier1 would have rewritten the whole file. (d) `lint:no-tier-terms` script
  was added (consumers running `pnpm turbo lint` may see it on their CI).
- fix: Append a "Changed" / "Added" sub-bullets to the 2.0.0 entry covering: markers added to
  Group A/B templates (with list), Tier-1→Tier-2 dispatch shift for the three markered-text files,
  new `tier2-text-drift` advisory, new `lint-no-tier-terms` script + invocation.

### MAJOR-6: stripBkitBlock in preflight uses unsafe greedy regex (KN-8 lesson violation) — false-negative risk in detectHuskyBlockDuplicates and detectGitignoreBlockDuplicates

- class: mechanical
- location: `.agents/scripts/bkit-preflight.ts:65-69` —
  `content.replace(/<!--\s*bkit:start\s*-->[\s\S]*?<!--\s*bkit:end\s*-->/g, "").replace(/#\s*bkit:start[\s\S]*?#\s*bkit:end/g, "")`.
- scenario: KN-8 documents that whitespace-greedy regex marker detection is unsafe and that
  `findLineAnchoredMarkers` is the correct primitive. `stripBkitBlock` reintroduces the old
  pattern. Edge case: consumer prose in `CLAUDE.md` quotes ` `# bkit:start` ` literally without
  matching `# bkit:end` — the regex eats everything from the literal mention to the next
  `# bkit:end` it finds (potentially many lines), so subsequent detectors
  (`detectHuskyBlockDuplicates`, `detectGitignoreBlockDuplicates`,
  `detectPrettierignoreScopeNarrowing`) see a wrongly-truncated "consumer content" view and may
  silently skip a real advisory. Lower severity than KN-8's original case because the call sites
  are advisory-only (not write-mutating), but still a regression of the KN-8 fix surface.
- fix: Replace `stripBkitBlock` with a line-anchored implementation using
  `findLineAnchoredMarkers` (start, end) and slicing — mirror `stripManagedBlock` in
  `bkit-tiers.ts:363-399`, which is already KN-8-correct. Or call `stripManagedBlock` directly
  twice (once per style) and concatenate.

### MINOR-1: deepContains array-of-primitives subset semantics ignores multiplicity

- class: architectural
- location: `.agents/scripts/bkit-tiers.ts:118-126` `_deepContainsArray`.
- scenario: Template `["a", "a", "b"]` vs consumer `["a", "b"]` — both calls to
  `consumer.includes("a")` return true, so `ok=true` even though consumer has only one `"a"`.
  Unlikely in practice (JSON config arrays are sets in spirit), but the docstring claims
  "template elements must all appear in consumer (subset semantics)" without qualifying
  multiplicity.
- fix: Either update the docstring to clarify "set-subset, not multiset-subset", or check
  multiplicity via a multiset/`Map<string,number>` count.

### MINOR-2: stripTier2JsonScope leaf equality is sensitive to JSON.stringify key order — over-preserves on editor-reformatted consumer JSON

- class: architectural
- location: `.agents/scripts/bkit-uninstall.ts:152-158` —
  `JSON.stringify(cVal) === JSON.stringify(tVal)`.
- scenario: Consumer `{cmd: "x", env: {}}` vs template `{env: {}, cmd: "x"}` (semantically equal,
  keys reordered by Prettier or VSCode "Sort JSON Keys"). JSON.stringify produces different
  strings → strip preserves the value. Result: bkit content lingers post-uninstall when it
  shouldn't. Benign over-preservation, not data loss.
- fix: Replace JSON.stringify equality with a structural deep-equal helper (or import
  `deepEqual`-style util from `deepContains` symmetric variant).

### MINOR-3: migrateLegacyBkitEnvelope.\_detectSchemaFlip only walks first level — deeper schema flips silently report schemaFlipped=false

- class: architectural
- location: `.agents/scripts/bkit-tiers.ts:331-346` (annotated as "shallow first level only for
  perf" — but the only call site logs a one-line "schema flip applied" advisory, so depth-2 flips
  are silently mis-classified).
- scenario: Template `{ a: { b: [...] } }` (b is array) vs consumer post-strip
  `{ a: { b: "string" } }`. `_detectSchemaFlip` only compares the type of `a` (object in both) →
  returns false. The migrate path then deep-merges (`template wins`), the user sees the message
  "stripped **bkit** envelope" instead of "schema flip applied" — they don't know to look for
  data-shape changes.
- fix: Either recurse `_detectSchemaFlip` (cheap for typical JSON sizes), or rename the field to
  `topLevelSchemaFlipped` so callers know its scope.

### MINOR-4: detectPreEnvelopeBkitVersion only inspects two JSON files for the no-envelope signal — non-envelope-style installs from v0.6.x/v0.7.x may be mis-classified

- class: architectural
- location: `.agents/scripts/bkit-preflight.ts:491-503`.
- scenario: Consumer pinned to `0.7.0` (post-Tier-2-migration, but the `__bkit__` envelope did
  not yet wrap both files in early 0.7.x). If their `.cursor/hooks.json` was deleted/never
  installed, the loop sees no envelope in `.claude/settings.json` either → consumer is
  WRONGLY classified as "pre-envelope" and BLOCKED with the "route through v1.x first"
  message. They are NOT pre-envelope; they're partial-install of an envelope-era version.
- fix: Either tighten the version pin check to `< 0.7.0` (matches the historical introduction of
  the envelope), or change the signal to "no envelope AND no marker block in any installed JSON"
  (still racey but less false-positive prone), or, simplest, only check files that are present in
  the manifest for the modules the consumer has installed.

### MINOR-5: lint-no-tier-terms scope is docs/ markdown only — `.agents/README.md` (15 hits) and `CHANGELOG.md` (consumer-shipped tarball) are not scanned, regressing into shipped artifacts

- class: mechanical
- location: `.agents/scripts/lint-no-tier-terms.ts:70-73` — `SCAN_DIRS = [path.join(ROOT, "docs")]`.
- scenario: A future developer can add Tier-1/2/3 prose to `.agents/README.md` and the regression
  guard misses it. Since the `.agents/` tree is rendered by `npm publish` into the consumer
  tarball (`package.json#files` likely includes `.agents/`), Phase-3 terminology hygiene leaks
  into consumer-visible documentation. Same applies to `CHANGELOG.md` and `README.md` at root —
  intentional history is reasonable, but new entries should be caught.
- fix: Add `.agents` and root-level `*.md` to `SCAN_DIRS` (with a heading-section exclusion for
  CHANGELOG's historical version blocks). Or document a clear policy in the script header that
  `.agents/README.md` and root README/CHANGELOG are intentionally out-of-scope.

### MINOR-6: writeTier2JsonContained idempotent-guard returns `update` action even when re-write would be byte-identical to existing dst after deep-merge

- class: architectural
- location: `.agents/scripts/bkit-tiers.ts:250-257`. The guard `if (mergedStr === dstRaw) return`
  compares the re-serialised merge to the existing raw bytes. If the consumer's JSON uses a
  different indent/serializer (e.g. `JSON.stringify(_, null, 4)`), the comparison fails even when
  the structural content is contained. Then containment was already TRUE earlier (line 244-247),
  so this path isn't reached for re-formatted-but-equal content — but if the consumer has
  template-equivalent content plus extra keys AND uses 4-space indent, the early-return at
  line 245-247 fires (`containsResult.ok`), no rewrite, indent style preserved. Good.
  Actual issue: if the existing file uses CRLF or trailing whitespace, line 244 still computes
  `ok=true` based on parsed JSON (whitespace-blind), so no rewrite. Also fine. Reviewed and
  found no bug; leaving this finding as MINOR documentation of the close-call.
- fix: none required — recording for traceability of the audit.

## Cross-reference

- KN-8 (greedy whitespace regex unsafety) → MAJOR-6.
- DE-7 / DE-8 (envelope retire decision) → review only; no findings.
- The bkit-tiers.ts comment at lines 39-40 ("null template at any path → ok") matches
  deepContains line 58-60 — consistent.

## Tests reviewed but no findings

- `bkit-tiers.test.ts` deepContains 8-row matrix is well-covered.
- `bkit-tiers.test.ts` writeTier2JsonContained 5 cases cover absent/idempotent/schema-flip/
  malformed/dry-run.
- `bkit-uninstall.test.ts` stripTier2JsonScope 5 cases cover the spec well — but the consumer-
  side data-loss risk for slop-scan.config.json (MAJOR-2) is not tested because the manifest
  classification mismatch was not surfaced as a test concern.
