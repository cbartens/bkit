# Plan input — BAR-167 (bar-167-drop-envelope-hybrid)

## Session prompt

User invoked `/bkit-plan bar-167` after a Design-phase conversation in which:

1. A bkit-consumer audit (app-gether-life + visitfrasercoast-com against v1.1.1 templates) surfaced two real issues — app-gether-life had lost the `pnpm bkit check` step from its heavily-customised `.github/workflows/ci.yml`, and `.cursor/hooks.json` had drifted from the template's top-level `hooks` array. Both were manually patched in app-gether-life during the audit.
2. While restoring the `.cursor/hooks.json` top-level array, the user questioned why bkit's template ships duplicated content — once inside `__bkit__`, once at top level — and pushed back across multiple turns until the design weakness was acknowledged.
3. Three architectural alternatives were evaluated (markers everywhere, containment everywhere, three-way merge, hybrid). The user reframed the problem: every file has a bkit-owned scope and a consumer-owned remainder; the size of bkit's scope can be 0%–100%; the Tier 1/2/3 distinction is artificial.
4. The decision was made to adopt the **hybrid model** — `bkit:start..bkit:end` markers for text formats + deep-tree containment for JSON. This drops the `__bkit__` envelope (introduced v0.8.0 under DE-7/DE-8) and unifies all template files under one rule: *"the template's bkit-owned scope must be intact in the consumer file."*
5. The user instructed that this redesign be documented as a Linear issue (BAR-167) and then planned via `/bkit-plan`.

This plan must implement the redesign in the bkit repo per the phased approach in BAR-167's description (Phase 1 — drop envelope; Phase 2 — extend marker coverage; Phase 3 — terminology cleanup), shipping as bkit v2.0.0 (Major-Change per DE-8 contract reversal).

## Issue description (BAR-167)

## TL;DR

Drop the `__bkit__` JSON envelope (introduced v0.8.0, BAR-131/142) and consolidate every template file under one ownership model: **format-aware containment** — `bkit:start..bkit:end` comment markers for text formats, deep-tree containment for JSON. The Tier 1/2/3 distinction collapses into a single mechanism with a single mental model: *"the template's bkit-owned scope must be intact in the consumer file."*

This reverses DE-7 and DE-8.

---

## 1. Debug — how this surfaced

Triggered during a routine bkit-consumer audit (app-gether-life + visitfrasercoast-com against the v1.1.1 template). Both consumers passed `pnpm bkit check` with `Done. 0 write(s).`. While reviewing the surface I'd just edited, the user inspected `.cursor/hooks.json` and asked why it contained the same hook content twice — once inside `__bkit__`, once at the top level:

```json
{
  "__bkit__": {
    "hooks": [ { "event": "sessionStart", "command": "echo '[bkit] session started'" }, ... ]
  },
  "hooks": [ { "event": "sessionStart", "command": "echo '[bkit] session started'" }, ... ],
  "version": 1
}
```

Initial response defended the duplication as "two readers, two purposes" (Cursor reads top-level, `bkit check` reads `__bkit__`). The user pushed back across multiple turns:

1. *"if cursor does not read it then why add it?"*
2. *"what is the purpose of having the below block in cursor hooks if they are not read?"*
3. *"so what we add that to a file to show the install script ran???"*
4. *"why have non-functional code in files that nothing reads?"*

The pushback was correct. The envelope's job is bkit-CLI bookkeeping (drift detection + safe upgrade), but the value it adds is disproportionate to the in-file noise it creates — especially for `.cursor/hooks.json` where the bkit-owned content (two `echo` statements) is itself decorative.

## 2. Discussion — what the audit covered

### 2.1 Today's three ownership shapes

The bkit template surface has files in three apparent categories:

| Category | Examples | Today's mechanism |
| -- | -- | -- |
| **A. Bkit fully owns** | `AGENTS.md`, `CLAUDE.md`, `.vale/styles/House/*.yml`, preflight scripts, agent prompts, `.cursor/rules/00-shared-rules.mdc`, `.agents/{rules,docs,friction,skills}.md` | Tier-1 byte-equal mirror |
| **B. Bkit owns a portion, consumer extends** | `.husky/{pre-commit,pre-push}`, `.gitignore`, `.prettierignore`, `docs/*.md` | Tier-2 `bkit:start..bkit:end` markers (text) |
| **B'. Bkit owns a portion (JSON)** | `.claude/settings.json`, `.cursor/hooks.json` | Tier-2 `__bkit__` envelope wrapper key |
| **C. Bkit seeds, consumer takes ownership** | `.github/workflows/ci.yml`, `.cursor/{settings,environment}.json`, `.cursor/Dockerfile`, `.vale.ini`, `slop-scan.config.json` | Tier-3 seed, advisory only on drift |

The user observed this is artificial: even Group A files are extensible by the consumer (e.g. add project-specific guidance below `AGENTS.md`), and Group C files all started life as bkit content the consumer is now free to override. Reframed:

> **Every file has a bkit-owned scope and a consumer-owned remainder. The size of bkit's scope can be anywhere from 100% (whole file) to 0% (consumer fully owns post-seed). One model — only the scope size varies.**

### 2.2 Concrete cost the current model is paying

* **Visible duplication** in `.cursor/hooks.json` and `.claude/settings.json` (template ships both `__bkit__` envelope and top-level mirror; first install copies both verbatim → identical content under two keys).
* **Confusion** — eight conversation turns to explain what `__bkit__` is for. That's the opposite of self-documenting.
* **Schema pollution** — `__bkit__` is a custom top-level key. DE-7 verified Cursor and Claude don't reserve it, but it doesn't belong in either tool's documented schema.
* **Tier-3 drift not caught** — app-gether-life's `.github/workflows/ci.yml` was heavily customised post-seed and lost the `pnpm bkit check` step. Tier-3's "advisory only" model meant this was never gated. (Fixed manually in this session by re-adding the step.) Under a unified containment model, a small `bkit:start..bkit:end` block around `setup-auth + bkit check` would have made the gate non-removable without explicit `.bkitignore` opt-out.
* **Maintenance surface** — `bkit-tier1-defaults.ts` snapshots historical envelope shapes per shipped version (v0.5.0 → v0.7.x). Maintenance burden grows with each version.
* **Asymmetric drift detection** — Tier-1 uses `canonicalHashes`, Tier-2 text uses marker-block extraction, Tier-2 JSON uses `__bkit__` hash. Three code paths, one purpose.

### 2.3 Four candidate redesigns evaluated

| Option | Mechanism | Verdict |
| -- | -- | -- |
| **A. Markers everywhere** | `bkit:start..bkit:end` in every file | ❌ JSON has no comments — falls back to a wrapper key (i.e. `__bkit__`). Not actually one mechanism. |
| **B. Containment everywhere** | "Template content present in consumer file" universally | ❌ Free-form text loses ordering and contiguity meaning under set/subset semantics. `pnpm typecheck && pnpm test` ≠ `pnpm test && pnpm typecheck`. Needs markers anyway to delimit bkit's region. |
| **C. Three-way merge everywhere** (`diff3`-style) | base (template at recorded version) + theirs (current template) + ours (consumer); algorithmic merge per format | 🟡 Genuinely uniform, no in-file metadata, but 3-5× hybrid LOC, requires bundled historical templates, conflict-resolution UX, silent-corruption risk on overlapping edits. |
| **D. Hybrid — markers (text) + containment (JSON)** | Two mechanisms, one mental model: "bkit's scope must be intact" | ✅ Recommended. Uses each format's native ownership signals. |

### 2.4 Why hybrid (D) over three-way merge (C)

1. **Three-way merge has a hidden tax that compounds.** Every shipped bkit version requires its template snapshot kept in code. `bkit-tier1-defaults.ts` already shows this is annoying for two files across four versions; multiply by ~50 template files and a multi-year version history.
2. **Text and JSON have natural ownership signals; respect them.** Comment markers ARE how text declares regions. Deep object structure IS how JSON declares regions. Forcing both through one merge algorithm satisfies conceptual purity but loses pragmatic clarity.
3. **Hybrid keeps almost everything already built.** Markers exist and work. JSON containment is ~50 LOC of recursive walk. Net code goes *down* (delete `applyBkitNamespace`, `extractBkitNamespace`, `migrateTier1JsonToTier2`, `BKIT_TIER1_DEFAULTS_BY_VERSION`).
4. **Three-way merge silent-corruption risk is real.** Overlapping edits produce conflict markers in the consumer file that ship into their repo. Hybrid + `.bkitignore` per-key opt-out (already exists, DE-6) gives the consumer an explicit, ergonomic override mechanism without inline conflict markers.
5. **Migration is cheap.** Only `.claude/settings.json` and `.cursor/hooks.json` need envelope removal; markers in text files don't change at all.

### 2.5 One real wrinkle: JSON arrays

Object containment is straightforward (every key + value recursively present). Array containment is ambiguous — `template.hooks: [echoStart, echoStop]` vs `consumer.hooks: [echoStart, echoStop, customStop]` could mean set-membership, ordered subsequence, or exact equality.

**Resolution per file:**

* `.cursor/hooks.json` — migrate template to Cursor v1 schema (`hooks: { eventName: [...commands] }`) — keyed object instead of flat array. Plain deep-object containment then works. DE-7 already verified Cursor accepts both shapes.
* `.claude/settings.json` — `hooks.SessionStart` is an array of objects. Define containment rule: "every element in template's array exists as a deep-equal element in consumer's array, order-insensitive." Implementable in ~15 LOC.

---

## 3. Decision

**Adopted: Option D (hybrid — markers for text + deep containment for JSON).** Replaces and supersedes DE-7 and DE-8.

### Single rule

> Every template file in `.agents/templates/` declares a **bkit-owned scope**. The consumer file must contain that scope intact. Everything outside is consumer territory.

### Format mapping

| Format | Bkit scope = | Drift check |
| -- | -- | -- |
| Text with `bkit:start..bkit:end` markers | Content between markers | Block byte-equal |
| Text without markers | Entire template | Whole-file byte-equal |
| JSON | Entire template's deep tree | Deep containment (template ⊆ consumer) |
| Empty scope | Nothing (consumer fully owns) | No check (advisory only) |

### Override mechanism

`.bkitignore` (already exists, DE-6) retained as the explicit per-file / per-key opt-out for consumers who want to override a bkit-shipped scope.

### What changes per current file class

| File class today | Action |
| -- | -- |
| Group A (Tier-1 byte-equal whole files) | No change. Optionally add markers around current content if extensibility is wanted (Phase 2). |
| Group B text (Tier-2 markers) | No change. |
| Group B JSON (Tier-2 envelope) | **Drop** `__bkit__`. Template becomes schema-clean. Containment check on consumer. |
| Group C (Tier-3 seed) | Add a small marker block around the genuinely-required portion (e.g. `setup-auth + bkit check` in `ci.yml`). Everything else stays consumer territory. (Phase 2.) |

### Rationale

1. Eliminates the visible-duplication confusion that triggered this issue.
2. Templates match their tools' documented schemas exactly (Cursor v1 hooks, Claude Code `settings.json`).
3. One mental model across all formats; two mechanisms (markers / containment) instead of today's three (`canonicalHashes` / marker-extract / envelope-extract).
4. `.github/workflows/ci.yml` and other Tier-3 files gain a real drift gate where bkit needs one (e.g. `bkit check` step preservation), while keeping consumer customisation freedom.
5. Net code reduction: delete `applyBkitNamespace`, `extractBkitNamespace`, `migrateTier1JsonToTier2`, `writeTier2Json` envelope branch, `BKIT_TIER1_DEFAULTS_BY_VERSION`. Replace with one `deepContains(template, consumer)` primitive plus marker logic that already exists.
6. Major-Change → bkit v2.0.0 (`__bkit__` was a v0.8.0 public contract per DE-8).

### Trade-offs accepted

* Stale-orphan scenario: if a future bkit version drops a key it used to ship, the consumer's file keeps the old key (bkit can't tell if it was a consumer addition or a leftover). **Acceptable.** Harmless; cleanup via explicit `bkit upgrade --prune` if it ever matters.
* Two mechanisms (markers + containment) instead of one. **Acceptable.** They share one mental model and one rule.
* Loses the "envelope as visible boundary marker" benefit. **Acceptable.** The benefit was illusory — eight-turn confusion proves it wasn't self-documenting.

---

## 4. Final solution — implementation plan

### Phase 1 — Drop the JSON envelope (small, contained, no Tier-3 changes yet)

**Templates:**

* `.agents/templates/.cursor/hooks.json`: rewrite as Cursor v1 schema — `{ "version": 1, "hooks": { "sessionStart": [...], "sessionStop": [...] } }`. No `__bkit__`, no top-level/inner duplication. (Optional decision: drop the decorative echoes entirely if they have no real purpose. See follow-up.)
* `.agents/templates/.claude/settings.json`: rewrite without `__bkit__`. Top-level keys only.

**Code:**

* New: `deepContains(template, consumer): { ok: boolean; missing: string[]; mismatched: string[] }` in `bkit-tiers.ts`. Recursive object walk; arrays handled per type (primitive arrays = subset; object arrays = element-wise deep-contain by identity).
* New: `writeTier2JsonContained(templatePath, destPath, dryRun, ws)` replacing the envelope branch of `writeTier2Json`. Deep-merges template into consumer: template values win at template paths; consumer keys outside template stay.
* `bkit check`: switch JSON drift detection from `extractBkitNamespace + hash` to `deepContains`.
* `bkit upgrade`: deep-merge per above.
* `bkit upgrade` migration step: if consumer JSON has `__bkit__` key, strip it on next upgrade and verify post-strip containment. One-shot. Log: `[bkit] migrated .cursor/hooks.json — stripped __bkit__ envelope (v2.0.0)`.

**Delete:**

* `applyBkitNamespace`, `extractBkitNamespace` (`bkit-tiers.ts`)
* `migrateTier1JsonToTier2` (`bkit-tiers.ts`)
* `BKIT_TIER1_DEFAULTS_BY_VERSION` and `bkit-tier1-defaults.ts` if no other consumer
* Envelope branch of `writeTier2Json` (rename remaining branch to `writeTier2JsonContained`)

**Tests:**

* Update `bkit-tiers.test.ts` for `deepContains` semantics
* Update `bkit-modules.upgrade.integration.test.ts` two-version regression — confirm consumer `Stop` hook + `failClosed` + `loop_limit` keys still survive byte-identical under containment + deep-merge
* New: array-containment edge cases (extra elements, reorder, missing required element)

**Docs:**

* New decision entry replacing DE-7/DE-8 — record the reversal, reasoning, and migration mechanic.
* Update `docs/architecture.md` Tier-2 JSON section.
* Update `docs/knowledge.md` KN-8 with the supersession.
* `CHANGELOG.md` v2.0.0 entry: BREAKING — `__bkit__` envelope removed; consumer files auto-migrated on first upgrade.

### Phase 2 — Collapse Tier 1/2/3 into one model (optional, can ship later)

**Templates:**

* Add `bkit:start..bkit:end` markers around current content in:
  * `AGENTS.md`, `CLAUDE.md`, `.cursor/rules/00-shared-rules.mdc`, `.vale/styles/House/*.yml`, `.agents/{rules,docs,friction,skills}.md`, `docs/plans/template.md` (where extensibility is wanted)
* Add small marker blocks around required portions in:
  * `.github/workflows/ci.yml` — `setup-auth` step + `pnpm bkit check` step (would have caught the app-gether-life drift)
  * `.vale.ini` — `StylesPath`, `Packages`, `MinAlertLevel`, House style enable
  * `slop-scan.config.json` — bkit's required core rules
  * `.cursor/{settings,environment}.json`, `.cursor/Dockerfile` — keep as advisory-only (no required portion worth gating)

**Code:**

* `bkit-manifest.ts` simplifies to `{ path, format }` — Tier number gone. Format determines scope-extraction mechanism.
* `bkit check`: single dispatch on format → markers extract / JSON containment / byte-equal.

**Tests:**

* Marker presence enforcement on Group-A migrations
* Tier-3 drift detection regression (would `app-gether-life`'s missing `bkit check` step now be caught?)

### Phase 3 — Cleanup

* Remove `tier3Hashes` from `.bkit-version` schema if no longer used
* Remove "Tier 1/2/3" terminology from docs
* Update `bkit-tiers.ts` doc-block to reflect single-model semantics

---

## 5. Migration plan for existing consumers

On next `bkit upgrade` after v2.0.0 ships:

1. **Detect:** parse `.cursor/hooks.json` and `.claude/settings.json`; check for top-level `__bkit__` key.
2. **Strip:** remove `__bkit__` from consumer file.
3. **Verify:** run `deepContains(currentTemplate, postStripConsumerFile)`. If template content is present in top-level keys (which is the normal case — the template was seeded at top-level on first install), pass. If absent, run a deep-merge to inject template content.
4. **Log:** `[bkit] migrated <file> — __bkit__ envelope stripped (v2.0.0 contract change)`.
5. **Commit:** as part of upgrade write-pass.

Pre-v2.0.0 consumers running `bkit check` against v2.0.0 will see one-time advisory `legacy-bkit-envelope-detected — run \`pnpm bkit upgrade\` to migrate to v2.0.0 ownership model`. No blocker.

---

## 6. Open questions / follow-ups (not blocking decision)

* Drop the decorative `.cursor/hooks.json` echo statements entirely? They were 0.1.2-era scaffolding placeholder content that was never replaced with real functionality. Under v2.0.0 the envelope's gone but the template still ships them as Cursor's working hooks. If they have no real purpose, ship `.cursor/hooks.json` with an empty `hooks` object as the canonical "bkit reserves this file for future hook injection."
* `.cursor/hooks.json` template adopts Cursor v1 keyed-object schema as part of Phase 1 — confirm via spike that current Cursor builds still accept the keyed form (DE-7 noted v1 schema uses it; verify before shipping).
* Should `bkit upgrade --prune` flag for orphan-key cleanup be included in v2.0.0 or deferred? Probably defer — not needed unless we drop a key in a future minor.
* `app-gether-life`-style heavy `ci.yml` customisation: under Phase 2, the auth+check marker block lives inside the consumer's customised file. Confirm marker survival under typical consumer ci.yml restructuring. Add an integration test fixture for this.

---

## 7. Conversation context (for posterity)

This issue documents a real-time discovery during a consumer audit on 2026-05-09. The full conversation arc:

1. Initial audit flagged that `app-gether-life/.github/workflows/ci.yml` had lost its `pnpm bkit check` step (Tier-3 drift, not gated). Fixed manually.
2. While restoring `.cursor/hooks.json` top-level `hooks` array (also drifted from template), user questioned why the file contained duplicated content under `__bkit__` and at top level.
3. Eight-turn discussion exposed that `__bkit__` exists for bkit-CLI bookkeeping (drift detection + safe upgrade) but that the architecture is overweight relative to the value delivered, especially given `.cursor/hooks.json`'s decorative payload.
4. User proposed: "template should be the intended working file; compare consumer to template; no non-functional code in working files." This was the right insight.
5. Refined to: "every file has a bkit-owned scope; size can be 0% to 100%." Collapses Tier 1/2/3 into one model.
6. Evaluated four mechanism candidates; selected hybrid.
7. This issue.

**Related decisions superseded:** DE-7 (cursor `__bkit__` schema spike), DE-8 (`__bkit__` envelope contract). Both should be marked "superseded by [this BAR-ID] (2026-05-09)."

**Related knowledge:** KN-8 (Tier-2 deep-merge canonical) — supersede with new KN entry once v2.0.0 ships.

**Manual fixes applied during the audit (not part of this redesign):**

* `app-gether-life/.github/workflows/ci.yml` — added `Run Bkit Check` step
* `app-gether-life/.cursor/hooks.json` — restored top-level `hooks` array (will be schema-clean once v2.0.0 ships and `__bkit__` is stripped via migration)

## Comments

(none)

## Parent design

(none — standalone plan)
