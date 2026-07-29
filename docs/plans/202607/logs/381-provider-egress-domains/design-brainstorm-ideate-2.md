# Design Brainstorm & Ideas — 2

Lens: Optimal-tradeoff — best long-term shape ignoring legacy constraints.

## Verified ground truth (source-anchored, not assumed)

- **The only provider→baseURL registry in the codebase** is `OPENCODE_PROVIDER_DEFAULTS`
  (`.bkit/src/bkit-modules.ts:1397-1500`) — 10 keys (`ollama-local`, `nvidia`, `groq`,
  `cerebras`, `openrouter`, `ollama`, `zai`, `moonshot`, `opencode-zen`, `opencode-go`).
  `opencode-zen`/`opencode-go` have `baseURL: ""` (managed-auth/models.dev-resolved, no
  host to derive); `ollama-local` is `http://localhost:11434/v1` (loopback, must be
  excluded). No other "provider" registry exists (grepped `PROVIDER|_DEFAULTS|baseURL`
  across `.bkit/src/*.ts` — the only other `PROVIDER_*` symbols, `OPENCODE_PROVIDERS`
  in `bkit-cli.ts` and `OPENCODE_PROVIDER_COLUMN`/`PROVIDER_DISPLAY` in `bkit-install.ts`,
  are aliases/display maps over the same registry, not independent sources). So comment
  3's "all providers, not just opencode" resolves concretely to: **derive from every
  registry entry, not only the currently-`--opencode=`-installed one** — the issue
  body's "installed set" framing (`bkit.opencodeProviders`) is narrower than the
  registry itself.
- `BKIT_SHIPPED_NETWORK_DOMAINS` (`.bkit/src/bkit-cloud-env.ts:471-485`) is a flat,
  **install-state-independent** list today — `nvidia.com`/`z.ai`/`moonshot.ai`/
  `kimi.com`/`ollama.com` ship for every consumer regardless of which `--opencode=`
  provider they installed. `resolveNetworkAllowlist` (`:505-507`) unions it with
  `extractAllowedDomains(cwd)` (consumer's `config.md`) and expands via
  `expandAllowedDomains` (`:458-463`, apex + `*.`). This single function feeds **four**
  surfaces: `renderCloudNetworkAllowlist` (`.claude/cloud.md`), `writeNetworkAllowlistArtifact`
  (`.cursor/allowlist.json`), `enrichClaudeSettingsWebFetch` (`.claude/settings.json`,
  `bkit-modules.ts:1731-1758`), and `injectOpencodeNetworkCurlAllows`
  (`.opencode/opencode.json`, `bkit-modules.ts:1706-1714`).
- `.cursor/hooks/guardrails.cjs` (`bkit-manifest.ts:267`) is manifest format
  **`byte-equal-text`**, written via `writeTier1` (force-overwrite, `bkit-modules.ts:1268-1281`)
  — fully bkit-owned, identical render for every consumer of a given bkit version. Its
  `SHIPPED_NETWORK_BASES` (`.cursor/hooks/guardrails.cjs:110-124`, byte-identical in
  `.bkit/templates/.cursor/hooks/guardrails.cjs:110-124`) is a **hand-typed copy** of
  the same 13 domains as `BKIT_SHIPPED_NETWORK_DOMAINS`, held together only by a
  `keep in sync with BKIT_SHIPPED_NETWORK_DOMAINS` comment — no test enforces parity
  (only `BKIT_SHIPPED_NETWORK_DOMAINS` negative assertions exist,
  `bkit-cloud-env.test.ts:406-407`).
  `loadNetworkAllowlistBases()` (`guardrails.cjs:126-145`) **already unions**
  `SHIPPED_NETWORK_BASES` with `.cursor/allowlist.json` at runtime, wrapped in a
  `try/catch` that falls back to the shipped set alone on a missing/corrupt file. The
  Cursor module install pass writes `guardrails.cjs` (`bkit-modules.ts:1272-1281`) and
  `.cursor/allowlist.json` (`writeNetworkAllowlistArtifact`, `bkit-modules.ts:1332-1341`)
  **in the same `runCursorModule` pass**, so whenever the hook exists, the artifact is
  guaranteed rewritten alongside it (both go through `dryRun`-gated writes together —
  install order is source of the guarantee, not a runtime check).
- `enrichClaudeSettingsWebFetch` (`bkit-modules.ts:1731-1758`) is confirmed
  **additive-only** by its own JSDoc (`:1723-1730`): it computes `needed` from
  `resolveNetworkAllowlist(cwd)`, filters to `missing`, and appends — nothing in
  `permissions.allow` marks an entry as bkit-authored vs. consumer hand-added.
  `settings.json` itself is **not** exact-hash-gated (`writeTier2JsonContained`,
  deep-containment, not `byte-equal-text`) — so per-consumer variance in its
  `WebFetch(domain:…)` entries is already tolerated by `bkit check`; the drift-gating
  concern is specific to `guardrails.cjs`.
- `.bkit/version` (`bkit-version.ts`) already carries a JSON envelope
  (`{ pinnedVersion, tier3Hashes, canonicalHashes }`) that bkit freely extends
  additively (`canonicalHashes` itself landed as an additive P4.T4 field, `:18-19,96-103`)
  — an established, low-risk place to add a new sidecar field.
- `.agents/config.md` § Cloud allowed domains (`:111-135`) documents `BKIT_SHIPPED_NETWORK_DOMAINS`
  as "stack-agnostic tooling defaults" and never mentions providers by name — the
  prose update is additive, not a rewrite.

## Approach A — Static full-registry derivation + hook duplicate elimination ⭐ Recommended

Replace the 5 hand-typed provider hosts inside `BKIT_SHIPPED_NETWORK_DOMAINS`
(`nvidia.com`, `z.ai`, `moonshot.ai`, `kimi.com`, `ollama.com`) with a derived list
computed from **every** `OPENCODE_PROVIDER_DEFAULTS` entry that has a non-empty,
non-loopback `baseURL` — `new URL(baseURL).hostname`, then a `registrableBase(host)`
helper (last two labels; documented limitation below) — deduped and sorted. This is a
pure function of the static registry, so its output is **identical for every consumer
of a given bkit version**, exactly preserving `BKIT_SHIPPED_NETWORK_DOMAINS`'s existing
install-state-independence. The remaining non-provider tooling hosts (`github.com`,
`githubusercontent.com`, `anthropic.com`, `claude.com`, `cursor.com`, `linear.app`,
`opencode.ai`, `npmjs.com`) have no registry source (IDE/tracker/registry docs hosts)
and stay a small explicit list. `resolveNetworkAllowlist` is otherwise untouched, so
all four downstream surfaces (cloud.md, allowlist.json, Claude WebFetch, opencode curl
allows) pick up the change for free.

For the hook: **delete `SHIPPED_NETWORK_BASES` from `guardrails.cjs` (and its template
copy) entirely** rather than generating it — `loadNetworkAllowlistBases()` falls back
to an empty `Set` when `.cursor/allowlist.json` is absent/corrupt, which degrades to
"ask on every curl/wget" (the doctrine-established safe direction per the #394
resolution: "guessing here converts an ask into an allow"). This is safe because the
same install pass that (re)writes `guardrails.cjs` also (re)writes
`.cursor/allowlist.json` (`bkit-modules.ts:1272-1281` and `:1332-1341`, same
`runCursorModule` call). This is the literal elimination the input's hazard #1 asks
for, not automation of one side — after this there is exactly **one** array
(`BKIT_SHIPPED_NETWORK_DOMAINS`'s provider slice, itself derived) instead of two
hand-synced ones, and the hook file shrinks (no fallback array, no "keep in sync"
comment to rot).

For the prune hazard: add `webFetchDerived: string[]` to `.bkit/version`'s JSON
envelope (additive, mirroring how `canonicalHashes` itself was added) recording the
exact `WebFetch(domain:…)` strings bkit wrote on the last run. On each
install/upgrade, `enrichClaudeSettingsWebFetch` computes the new derived set; any entry
present in the **old** recorded set, absent from the **new** derived set, and still
literally present in `permissions.allow` is removed (bkit knows it authored it);
entries never recorded (consumer hand-added, or added before this landed) are never
touched. Sidecar is updated to the new set after reconciling. First run after upgrade
(empty/absent sidecar) prunes nothing — matches the "additive-only until we know
what we wrote" doctrine already stated in the code comment.

- **Complexity:** MEDIUM — one pure derivation function, one hook file shrink (net
  code removal), one additive `.bkit/version` field + prune-diff in an already-existing
  function.
- **Extensibility:** Adding a provider to `OPENCODE_PROVIDER_DEFAULTS` (as #376 did for
  `zai`/`moonshot`) now requires editing **zero** domain lists — the derivation and the
  hook both pick it up automatically. This is the direct fix for the exact hand-sync
  pattern #376's own retrospective named as still-unsolved.
- **Risk:** `registrableBase()`'s last-two-labels heuristic is wrong for multi-part
  public suffixes (`example.co.uk` → would wrongly derive `co.uk`) — none of the
  current 10 registry entries hit this, but a future provider on such a domain would
  silently ship a bad base. Mitigate with a unit test enumerating every current
  registry baseURL's expected base (regression trip-wire, not a general PSL fix) and a
  comment flagging the limitation for the next provider addition.
- **Maintenance:** LOW after landing — one function to review when a provider is
  added; existing `bkit-cloud-env.test.ts:406-407`-style negative assertions extend
  naturally; a new parity test (`guardrails.cjs` template ≡ live copy, both containing
  no domain array at all) is trivial to keep green since there's nothing left to drift.
- **Friction vs ideal:** Touches `bkit-cloud-env.ts` (new derivation fn, replace the 5
  literals), `.cursor/hooks/guardrails.cjs` + its template (delete ~15 lines, adjust
  `loadNetworkAllowlistBases`'s catch-comment), `bkit-version.ts` (new field + read/write
  helpers analogous to `canonicalHashes`'), `enrichClaudeSettingsWebFetch` (diff-prune
  logic), `.agents/config.md` § Cloud allowed domains (prose: "derived from the
  provider registry" instead of implying a hand-maintained list). No breaking change
  to any existing shipped artifact shape — `.cursor/allowlist.json`'s JSON shape is
  unchanged, `.claude/settings.json`'s `WebFetch(domain:…)` string format is unchanged.

## Approach B — Reactive installed-provider derivation, two-tier floor/ceiling model

Follow the issue body's literal proposal: derive cloud-egress domains from
`bkit.opencodeProviders` (the **installed** set), not the full registry — so an
uninstalled provider's host is absent (marginally tighter egress), and
switching/adding a provider changes the list reactively on the next
install/upgrade, per the issue's original "deterministic + reactive" requirement.
Because this reintroduces per-consumer variance into `resolveNetworkAllowlist`'s
output — which the hook's byte-equal-text `SHIPPED_NETWORK_BASES` cannot tolerate
(hazard #3) — split into two tiers: a **static full-registry floor** (Approach A's
derivation, unconditionally present, generated into the hook via a small codegen
script run at `pnpm build` so the two files are produced from one source rather than
hand-typed) and a **reactive installed-subset ceiling** layered on top only in the
consumer-varying artifacts (cloud.md, allowlist.json, Claude WebFetch, opencode curl
allows) via `bkit.opencodeProviders`. A codegen parity test asserts the live hook and
its template array are set-equal to the derivation function's output (catches drift
introduced by hand-editing either copy post-generation).

Existing-codebase friction: `bkit.opencodeProviders` is read from `package.json`
already for other purposes (per design-input's proposal reference) — reusing it here
is low-friction. The prune-sidecar for `enrichClaudeSettingsWebFetch` is needed
identically to Approach A.

- **Complexity:** MEDIUM-HIGH — two derivation modes (static floor vs. reactive
  ceiling) instead of one, plus a codegen step wired into `pnpm build` that Approach A
  doesn't need (Approach A needs no codegen because the hook carries no domain array
  at all).
- **Extensibility:** Good for the LLM-provider case specifically (matches the issue's
  literal ask precisely), but the floor/ceiling split is a new shape future
  "auto-derive X from registry Y" work would have to learn and re-apply — not a
  generalizable pattern the way Approach A's "delete the duplicate, derive the source"
  is.
- **Risk:** Main failure mode is **support confusion**: a provider's host is present in
  the Cursor hook's floor (because it's in the registry) but a curl to a _different_
  uninstalled provider's host still asks nowhere on Claude/opencode (because those
  layers use the reactive ceiling) — an asymmetry between "what's allowlisted for
  shell curl on Cursor" vs. "what's allowlisted for Claude WebFetch / opencode bash"
  that's easy to forget six months from now and hard to explain in a bug report. The
  security value of the narrower reactive ceiling is also marginal: an egress
  allowlist gates which **hosts** are reachable, not which **credentials** work — an
  uninstalled provider's host being reachable is not itself a capability leak (no key
  exists to call it), so the complexity buys little.
- **Maintenance:** MEDIUM — every future "should this be install-state-reactive or
  registry-static" question has to be re-litigated per surface; the codegen step is
  one more thing that can silently stop running (e.g. a `pnpm build` skipped locally)
  and let the two hook copies drift again, which is exactly the failure mode hazard #1
  was raised to eliminate.
- **Friction vs ideal:** Everything Approach A touches, plus: new codegen script +
  `pnpm build` wiring, a parity test for it, and the two-tier floor/ceiling
  documentation burden in `.agents/config.md` and `.bkit/providers.md`.

## Approach C — Fully unified runtime artifact (partially infeasible — noted, not recommended)

The theoretical ideal: one generated JSON artifact (tooling defaults ∪ all registry
provider hosts ∪ consumer `allowed-domains`, pre-expanded) that **every** consumer
(`.cursor/hooks/guardrails.cjs`, `.claude/settings.json`, `.opencode/opencode.json`)
reads at runtime instead of embedding literal domain strings — collapsing
`BKIT_SHIPPED_NETWORK_DOMAINS`, `SHIPPED_NETWORK_BASES`, and the `WebFetch(domain:…)`
allow entries into reads of one file, eliminating all three hand-maintained shapes at
once. Cursor's hook already does this partially (`loadNetworkAllowlistBases` reading
`.cursor/allowlist.json`); this approach generalizes it.

This is **not fully deliverable today**: Claude Code's `permissions.allow` schema has
no "read domains from a file" primitive — `WebFetch(domain:…)` must be a literal
string per host in `settings.json`, so the Claude surface cannot become artifact-driven
without either a Claude Code product change (out of bkit's control) or falling back to
Approach A's additive-write-with-prune-sidecar for that one surface regardless. Only
Cursor (already artifact-driven) and possibly opencode's `permission.bash` glob map
(`injectOpencodeNetworkCurlAllows`, itself a literal-string-per-host write, same
constraint as Claude) could move this way — and opencode has the identical schema
limitation as Claude (command-glob permissions, not a file reference). So the "one
artifact, three readers" story is blocked on two of the three surfaces by the target
tools' own schemas, not by bkit's design choices — worth recording so it isn't
re-proposed without re-discovering this constraint.

- **Complexity:** HIGH — new artifact format + migration of the artifact-consumption
  path is real work, delivered for only 1 of 3 surfaces.
- **Extensibility:** Excellent in principle (single source, single format) but the
  value is capped by Claude/opencode's schema — the two surfaces most likely to grow
  (WebFetch grants, opencode curl allows) stay literal-string writes either way, so
  most of the future maintenance burden Approach A/B already solve is unaffected by
  this extra work.
- **Risk:** Effort spent building a unified artifact format for a story that only
  lands on Cursor is the main failure mode — scope creep relative to the issue's
  actual asks, for a partial win Approach A already achieves via the existing
  `.cursor/allowlist.json`.
- **Maintenance:** MEDIUM — one more artifact format to keep documented and tested,
  for marginal gain over Approach A's simpler "derive the source array, delete the
  hook's copy" move.

## Decisions

| Decided                                                                                                                                                         | Alternatives                                                                                     | Why                                                                                                                                                                                                                                                                                         |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Derive `BKIT_SHIPPED_NETWORK_DOMAINS`'s provider slice from **every** `OPENCODE_PROVIDER_DEFAULTS` entry (static, registry-wide), not just the installed subset | Reactive installed-subset derivation (issue body's literal text)                                 | Resolves hazard #3 (determinism) for free — output is install-state-independent so it stays safe to embed in the byte-equal-text `guardrails.cjs`; also is the natural reading of comment 3 ("all providers, not just opencode[-installed]") since it's the only registry that exists       |
| Delete `SHIPPED_NETWORK_BASES` from `guardrails.cjs` (+ template) rather than generate/sync it                                                                  | Codegen-generate it from the same derivation function (Approach B)                               | `loadNetworkAllowlistBases()` already unions with `.cursor/allowlist.json`, guaranteed rewritten in the same install pass; empty-fallback degrades to "ask" (the established safe direction), so there is nothing left to keep in sync — literal elimination beats automation of one side   |
| Prune `enrichClaudeSettingsWebFetch` via a new `webFetchDerived` sidecar field in `.bkit/version`                                                               | No prune (status quo) / guess-based prune off the current `resolveNetworkAllowlist` output alone | Only a record of what bkit itself wrote can distinguish a bkit-derived entry from a consumer's hand-added one without risking removing the wrong thing; `.bkit/version`'s JSON envelope is an established, additive extension point (`canonicalHashes` itself landed the same way)          |
| Reject the two-tier floor/ceiling split (Approach B)                                                                                                            | Single static-registry derivation (Approach A)                                                   | The security value of "installed-only" egress narrowing is marginal (host reachability isn't a credential leak) while the floor/ceiling asymmetry is a durable support-confusion risk and reopens the exact hook-drift failure mode (codegen silently not re-run) the issue exists to close |
| Do not pursue a unified runtime artifact across all three IDE surfaces (Approach C)                                                                             | Full artifact unification                                                                        | Blocked on Claude/opencode's permission schemas requiring literal per-host strings, not a file reference — most of the maintenance win is already captured by Approach A without the extra artifact-format work                                                                             |
