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

Default proposer, applied to each registry `baseURL`:

```
host = URL.canParse(baseURL) ? new URL(baseURL).hostname : ""      # canParse first, NEVER try/catch
if host is "" or "localhost" or an IP literal or a *.localhost   -> entry contributes nothing
base = last two labels of host                                    # api.z.ai -> z.ai; integrate.api.nvidia.com -> nvidia.com
```

Gate (test-enforced in the bkit repo; failing means CI red at authoring time, never a shipped surprise):

```
base === host || host.endsWith("." + base)   # label boundary, not substring
base has >= 2 labels
base NOT in MULTI_LABEL_SUFFIXES             # co.uk, com.au, com.cn, co.jp, com.br, ...
base NOT in MULTI_TENANT_APEXES              # amazonaws.com, googleapis.com, azure.com,
                                             # azurewebsites.net, workers.dev, vercel.app,
                                             # pages.dev, hf.space, run.app, appspot.com, ...
```

A registry entry may override `base` (or declare `egress: "none"` with a recorded reason) **when and only when** the gate rejects the default. All 10 current entries pass the default with no override, so this change adds zero per-provider authoring burden today while making the next bad case fail loud.

## Data Model

### `EgressSource` — the one row shape (`.bkit/src/bkit-registry.ts`)

```ts
type EgressSource = {
  /** Stable id — registry key ("zai") or synthetic source id ("mcp-github"). */
  id: string;
  /** Which shipped registry this row belongs to; drives the completeness test. */
  kind: "opencode-provider" | "tracker-mcp" | "agent-host" | "package-registry" | "skills" | "docs";
  /** Exact host(s) bkit configures something to call. [] when the host is not knowable. */
  hosts: string[];
  /** Registrable base for apex + `*.` expansion. "" means this row contributes no egress. */
  base: string;
  /** Required when `base` is "" or overrides the derived default — recorded, not inferred. */
  reason?: string;
};
```

`opencode-provider` rows are **derived** from `OPENCODE_PROVIDER_DEFAULTS[key].baseURL` at module init; every other `kind` is a **declared** row, because no `baseURL` exists to derive from.

### Populated set (the union this change ships)

<!-- prettier-ignore -->
| kind | id | hosts | base | note |
| --- | --- | --- | --- | --- |
| `opencode-provider` | `nvidia` | `integrate.api.nvidia.com` | `nvidia.com` | derived |
| `opencode-provider` | `groq` | `api.groq.com` | `groq.com` | derived — **gap today** |
| `opencode-provider` | `cerebras` | `api.cerebras.ai` | `cerebras.ai` | derived — **gap today** |
| `opencode-provider` | `openrouter` | `openrouter.ai` | `openrouter.ai` | derived — **gap today** |
| `opencode-provider` | `ollama` | `ollama.com` | `ollama.com` | derived |
| `opencode-provider` | `zai` | `api.z.ai` | `z.ai` | derived |
| `opencode-provider` | `moonshot` | `api.moonshot.ai` | `moonshot.ai` | derived |
| `opencode-provider` | `ollama-local` | [] | `""` | `reason`: loopback, no egress |
| `opencode-provider` | `opencode-zen` / `opencode-go` | `opencode.ai`, `models.dev` | `opencode.ai` + `models.dev` rows | `reason`: empty `baseURL`, models.dev-resolved |
| `tracker-mcp` | `mcp-github` | `api.githubcopilot.com` | `githubcopilot.com` | declared — **gap today** |
| `tracker-mcp` | `mcp-linear` | `mcp.linear.app`, `api.linear.app` | `linear.app` | declared |
| `agent-host` | `claude` / `cursor` / `opencode` | `console.anthropic.com`, `api.cursor.com`, `opencode.ai` | `anthropic.com`, `claude.com`, `cursor.com`, `opencode.ai` | declared |
| `package-registry` | `npm` / `github` | `registry.npmjs.org`, `npm.pkg.github.com`, `raw.githubusercontent.com` | `npmjs.com`, `github.com`, `githubusercontent.com` | declared |
| `skills` | `skills-sh` | `skills.sh` | `skills.sh` | declared — **gap today** |
| `docs` | `kimi-docs` | [] | `kimi.com` | `reason`: docs host, not derivable from `api.moonshot.ai` (#376) |

Deliberately **absent**: `DEP_UPDATERS` / `RENOVATE_RUNNERS` hosts (`developer.mend.io`, `depot.dev`) — their egress happens on GitHub Actions runners, not in an agent session; they are correctly absent today and adding them widens the allowlist for no reachable benefit.

### Derived exports (`.bkit/src/bkit-cloud-env.ts`)

<!-- prettier-ignore -->
| Symbol | Shape | Consumers |
| --- | --- | --- |
| `BKIT_SHIPPED_NETWORK_DOMAINS` | `readonly string[]` — sorted unique non-empty `base` | unchanged name + type, so `resolveNetworkAllowlist` and its 4 downstreams need no signature change |
| `BKIT_SHIPPED_NETWORK_HOSTS` | `readonly string[]` — sorted unique `hosts` | `renderCursorNetworkAllowlist` only (its deliberate no-wildcard policy) |

### `.bkit/version` provenance field (additive)

```jsonc
{
  "pinnedVersion": "…",
  "tier3Hashes": { … },
  "canonicalHashes": { … },
  "webFetchDerived": ["WebFetch(domain:github.com)", "WebFetch(domain:*.github.com)", …]
}
```

Exact `WebFetch(domain:…)` strings bkit wrote on the last install/upgrade. Parsed with a `[]` default exactly like `canonicalHashes` gets `{}`, so old payloads are read as "no record" and prune nothing. This is the only field that makes a safe prune possible: nothing in `permissions.allow` distinguishes a bkit-authored entry from a consumer's hand-added one.

## Components / Flows

### 1. Cloud egress paste blocks — the literal #381 defect

`renderCloudNetworkAllowlist` switches from `expandAllowedDomains(extractAllowedDomains(cwd))` to `resolveNetworkAllowlist(cwd)` (shipped ∪ derived ∪ consumer, apex + `*.`). Consequence: the `declared.length === 0` "Trusted default" branch disappears — Claude's Trusted list covers package registries and GitHub but **not** `api.z.ai`, so a consumer who declared nothing still needs Custom. The branch is replaced by a Custom block carrying the bkit set plus the existing pointer prose inviting them to add stack domains.

`renderCursorNetworkAllowlist` unions `BKIT_SHIPPED_NETWORK_HOSTS` (exact hosts) with the consumer's declared entries verbatim, preserving its deliberate no-wildcard narrowness. This is why the record carries `{hosts, base}` and not `base` alone: a base-only record has nothing correct to give the Cursor surface.

Both blocks gain a stable one-line fingerprint (`# bkit-allowlist <8 hex over the sorted set>`) so a stale dashboard paste is at least diagnosable in a bug report — the only cheap mitigation for a channel where a human is the transport and nothing can compare what was pasted to what should have been.

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
remove   = (previous \ current) ∩ allow        # provably cannot touch a consumer entry
write    = allow - remove + add ; log every removed entry
record   = webFetchDerived := current
```

First run after upgrade has no record and therefore prunes nothing — the honest behaviour, and the same "additive-only until we know what we wrote" doctrine already stated in the code.

### 4. OpenCode `curl`/`wget` allows and `.cursor/allowlist.json`

Unchanged code paths — both already call `resolveNetworkAllowlist` and pick up the widened set for free. One doc consequence: `curl *{base}*` is a **command substring** glob, so `curl https://evil.tld/?x=z.ai` is allowed on OpenCode even though the Cursor hook (host-parsed since #394) rejects it. Widening the base list widens that asymmetry; it is inherent to OpenCode's permission schema and must be **stated** in the docs, not implied.

### 5. Docs changed in the same commit

<!-- prettier-ignore -->
| File | Change |
| --- | --- |
| `.agents/config.md:111-118` § Cloud allowed domains | State that provider/tooling hosts are derived from bkit's registries and must **not** be re-declared here; `allowed-domains` is consumer stack domains only. |
| `.bkit/templates/.agents/config.md:113-118` | Same edit — the template twin is what ships into consumers. |
| `.bkit/providers.md:260-275` § Network allowlist | Line 273 ("Missing file ⇒ guardrails falls back to tooling defaults embedded in the hook") becomes false — rewrite to "missing file ⇒ ask on every `curl`/`wget`; re-run `bkit install`". Add the OpenCode substring-glob weakness note. |
| `.bkit/cloud.md:109-111` | The "no `allowed-domains` block -> Trusted is enough" guidance is no longer true once provider hosts are in play. |
| `.bkit/workflows.md:1124` | Permission-table row for `WebFetch(domain:…)` — confirm it still matches after the template seed is emptied. |
| `.bkit/README.md:345` | Allowlist-encoding pointer — verify wording still holds. |

ASCII operators only in `.bkit/*.md` (`!=`, `>=`, `<=`).

### 6. Tests (none of this is covered today)

1. **Completeness** — every key of every registry has a row; every row has `base` or a `reason`. Table-driven over `Object.keys`, so a new registry entry fails until it declares.
2. **Suffix invariant** — `host === base || host.endsWith("." + base)` and `host === new URL(baseURL).hostname` per derived row. Catches the copy-paste failure (`groq` inheriting `nvidia.com`) that produced the current gaps.
3. **Anti-widening** — no `base` in `MULTI_TENANT_APEXES` / `MULTI_LABEL_SUFFIXES`; `>= 2` labels; no IP literal; no `localhost`.
4. **Fan-out parity** — one derived union asserted present in **all five** surfaces after a tmp-dir install: cloud paste block, `.cursor/allowlist.json`, `.claude/settings.json` `WebFetch`, `.opencode/opencode.json` `curl`/`wget` globs, and (as an absence assertion) the hook carrying no domain array.
5. **Injected-provider** — add a synthetic entry to a fixture registry, assert every surface changes. This is the test that fails when someone adds a surface without wiring it; no golden snapshot catches that.
6. **Hook byte parity** — `.bkit/templates/.cursor/hooks/guardrails.cjs` byte-equal to `.cursor/hooks/guardrails.cjs` (co-listed in `slop-scan.config.json:174` today, never asserted).
7. **Negative/edge** — `ollama-local` contributes nothing (no `localhost` in any surface); builtins contribute `opencode.ai` + `models.dev` and never `""`; malformed `baseURL` yields no row without throwing; `curl https://evil.tld/?x=z.ai` still asks in the hook (regression guard on the widened list).
8. **Prune round-trip** — record set A, shrink to B, assert `A \ B` grants are gone, a hand-added consumer grant survives, and an absent `webFetchDerived` prunes nothing.

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
| **Emit `{hosts, base}` per row, not `base` alone** | `base` only, as the issue body proposes | `renderCursorNetworkAllowlist` (`bkit-cloud-env.ts:646-669`) deliberately refuses `*.` expansion on Cursor's own broad-wildcard warning. A base-only record has nothing correct to give that surface. |

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
| **New leaf `.bkit/src/bkit-registry.ts` holds data only; derivation stays in `bkit-cloud-env.ts`** | Derive inside `bkit-modules.ts`; lazy import to tolerate a cycle; put derivation in the leaf too | `bkit-modules.ts:59-65` already imports from `bkit-cloud-env.ts` and both symbols are module-init consts, so the cycle is not survivable. Keeping the leaf branch-free avoids adding a file to the `package.json:47` unit-coverage brace list under a `branches=70` threshold. |
| **Prune via a `webFetchDerived` provenance field in `.bkit/version`** | No prune; prune by shape/guess; a separate sidecar file | `previous \ current` is the only removal set that provably cannot delete a consumer's hand-added grant. `.bkit/version`'s JSON envelope is an established additive extension point — `canonicalHashes` landed exactly this way with a default-on-absent reader. |
| **Scope = opencode providers + tracker MCP + agent hosts + package registries + skills registry** | opencode providers only (issue body); include dep-updater/CI hosts | Comment 3 widens to all providers, and four of the six live gaps (`githubcopilot.com`, `models.dev`, `skills.sh`, plus the three registry providers) are outside the opencode registry. Dep-updater hosts stay out: their egress is on GitHub Actions runners, not in an agent session. |
| **`kimi.com` survives as a declared `docs` row** | Derive everything; drop it | Kimi's docs host is unreachable from its API `baseURL` (`api.moonshot.ai`). Dropping it silently regresses the #376 WebFetch grant. Recorded with a `reason` so the next maintainer does not "clean it up". |
| **Emit an allowlist fingerprint line into both cloud paste blocks** | No fingerprint | The dashboard paste is the one surface where nothing can compare intended to actual. A stable 8-hex line is the only cheap thing that makes a stale paste visible in a bug report. Untracked file, so no hash cost. |
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

**Gained by the prune, sacrificed:** a consumer who hand-added a domain that later also appears in the derived set will see it recorded as bkit-written and pruned if it leaves the set. Accepted: the alternative (never recording, never pruning) is the status quo the issue exists to fix, and the failure mode is a re-declarable grant rather than data loss.

**Gained by widening the base list, sacrificed:** every added base is one more `endsWith("." + base)` a lookalike host can aim at in the Cursor hook, and one more substring `curl *{base}*` glob on OpenCode where a query param defeats the check. Accepted because the hosts added are ones bkit already configures agents to call; the OpenCode weakness is documented rather than implied.

## Risks & Open Questions

### Risks

<!-- prettier-ignore -->
| Risk | Severity | Mitigation |
| --- | --- | --- |
| **The cloud allowlist is human-mediated and no surface can detect a stale paste.** Symptom is an opaque harness timeout on the model call, not a network error. | HIGH | Static list (rarely changes) + fingerprint line in both cloud paste blocks. Residual: no automatic comparison exists. Bootstrap-time reachability probe deferred. |
| **`bkit check` drift from a missed `.bkit/version` regeneration.** The hook and both template files change; forgetting to regenerate ships a drift to every consumer. | HIGH | `bkit install` regenerates; test 6 (hook byte parity) plus a clean `bkit check` on the dogfood install is a release gate. Memory note: `bkit install` flips `core.bare=true` — reset after. |
| **Moving `OPENCODE_PROVIDER_DEFAULTS` touches a heavily-tested file.** 5 in-file call sites plus `renderOpencodeJson` fixtures. | MEDIUM | Symbol is module-private, so the move is a relocation plus one import; no external call site or test import changes. Verified via grep — the only non-`bkit-modules.ts` hits are comments and `dist/`. |
| **Unit-lane coverage accounting.** `package.json:47` gates `branches=70` over a literal file list; new branching in an unlisted file silently leaves the measured set. | MEDIUM | Leaf module carries data only; all branching (derivation, gate, prune diff) stays in `bkit-cloud-env.ts`, already in the list. |
| **Stale slop-scan `_reason` prose.** `slop-scan.config.json:175` justifies the empty catch as "fail-OPEN … the shipped fallback is correct behaviour" — false after this. | LOW | Rewrite the `_reason` in the same commit. Adding a new `try`/`catch` anywhere in this change would fail `slop:delta` on net score — use `URL.canParse`. |
| **Denylist rot.** A future AI vendor on `*.modal.run` / `*.fly.dev` collapses to a platform apex the gate does not know about. | MEDIUM | Accept the deny-shaped gate; add a soft warning (not a block) when a derived base sits on a `.dev` / `.app` / `.run` TLD, and state the invariant in one sentence in the registry file. |
| **The "why declaration beat PSL" reasoning is tribal.** The next maintainer adds `psl` "to do it properly" and re-widens everything. | MEDIUM | Record as an ADR row in `docs/decisions.jsonl` with the `*.googleapis.com` example verbatim, not only in a PR comment. |
| **Scale.** At ~10x providers the union is ~70 bases -> ~140 expanded entries -> ~280 keys in `opencode.json`'s bash map and a ~140-line dashboard paste block. | LOW | Not a perf concern (`curlWgetHostAllowed` stays sub-millisecond). Real limit is unmeasured dashboard field caps — see open questions. |

### Open questions

1. **Does an opencode built-in gateway session actually contact `models.dev`?** `.bkit/prompts.md:223-225` states catalogs are resolved from models.dev, which is why the row is declared — but this has not been confirmed against a live cloud run. Omitting it breaks `opencode-zen`/`opencode-go` in cloud; including it is a low-risk two-label widening. Included pending verification.
2. **Are `console.anthropic.com` / `api.cursor.com` reachable-from-cloud requirements or docs-only hosts?** Their bases (`anthropic.com`, `cursor.com`) already ship, so this affects only the `hosts` list the Cursor cloud renderer emits verbatim.
3. **Is there a practical upper bound on the Claude-web / Cursor "Allowed domains" dashboard field?** Unmeasured. Worth probing before the fan-out grows, since the paste block is the one surface with a human in the loop.
4. **Should `registry.npmjs.org` be the declared host for the npm row, or is `npmjs.com` alone sufficient?** The base covers both; the exact host only matters for the non-wildcarded Cursor cloud list.
5. **Does emptying the `settings.json` template's `WebFetch` array break the opencode/claude gate-parity assertion in `bkit-modules.integration.test.ts`?** Likely yes — that test needs re-anchoring on the derived set rather than the template literal. Confirm at plan time.
