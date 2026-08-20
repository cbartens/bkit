# Design Brainstorm & Ideas

Lens: Risk premortem — failure modes, scale, time, handover. Weighted toward correctness of the derivation and the security posture of what it widens.

## Ground truth verified before proposing

Read in this worktree (all line refs verified):

<!-- prettier-ignore -->
| Fact | Where |
| --- | --- |
| Consumer-declared domains parsed from `.agents/config.md` below `<!-- bkit:end -->` | `.bkit/src/bkit-cloud-env.ts:425` `extractAllowedDomains` |
| apex → `apex` + `*.apex` expansion | `.bkit/src/bkit-cloud-env.ts:458` `expandAllowedDomains` |
| Hardcoded tooling/provider hosts (13 entries incl. `nvidia.com`, `z.ai`, `moonshot.ai`, `kimi.com`, `ollama.com`, `opencode.ai`) | `.bkit/src/bkit-cloud-env.ts:471-485` `BKIT_SHIPPED_NETWORK_DOMAINS` |
| `resolveNetworkAllowlist` = shipped ∪ consumer, expanded | `.bkit/src/bkit-cloud-env.ts:505` |
| **`renderCloudNetworkAllowlist` does NOT call `resolveNetworkAllowlist`** — it renders `expandAllowedDomains(extractAllowedDomains(cwd))`, i.e. consumer-only | `.bkit/src/bkit-cloud-env.ts:546-557` |
| Cursor cloud renderer emits declared entries **verbatim, no `*.` expansion**, by deliberate policy | `.bkit/src/bkit-cloud-env.ts:646-669` `renderCursorNetworkAllowlist` |
| `.cursor/allowlist.json` writer (generated artifact, NOT in any manifest) | `.bkit/src/bkit-cloud-env.ts:510-538` |
| Hand-synced duplicate of the shipped list | `.cursor/hooks/guardrails.cjs:110-124` `SHIPPED_NETWORK_BASES` + `.bkit/templates/.cursor/hooks/guardrails.cjs` |
| **Hook is `byte-equal-text` + hash-gated** — installed copy must be byte-identical to the shipped template for every consumer | `.bkit/src/bkit-manifest.ts:266-267`; `.bkit/version:11`, `.bkit/version:71` |
| `.claude/settings.json` is `format: "json"` (deep-contains) — additive enrichment is legal there | `.bkit/src/bkit-manifest.ts:239` |
| `enrichClaudeSettingsWebFetch` additive-only, documented as such | `.bkit/src/bkit-modules.ts:1723-1758` |
| opencode `curl *{base}*` allows injected from the same list | `.bkit/src/bkit-modules.ts:1706-1714` `injectOpencodeNetworkCurlAllows` |
| Provider registry (11 entries, `baseURL` per entry) | `.bkit/src/bkit-modules.ts:1397-1500` `OPENCODE_PROVIDER_DEFAULTS` |
| Installed provider set | `.bkit/src/bkit-install.ts:1702` `detectOpencodeProviders` (`bkit.opencodeProviders`) |
| CLI allowlist + aliases (a third mirror of the same key set) | `.bkit/src/bkit-cli.ts:43-74` |
| Existing tests: only negative assertions on the shipped list; zero references to `SHIPPED_NETWORK_BASES` | `.bkit/src/bkit-cloud-env.test.ts:382-415` |

### "ALL providers" — the real registries (comment 3)

`OPENCODE_PROVIDER_DEFAULTS` is one of **six** shipped host sources. A design that only reads it does not satisfy comment 3.

<!-- prettier-ignore -->
| # | Registry / source | Symbol / file | Egress hosts | Installed-subset key | Covered by `BKIT_SHIPPED_NETWORK_DOMAINS` today? |
| --- | --- | --- | --- | --- | --- |
| R1 | opencode model providers | `OPENCODE_PROVIDER_DEFAULTS` (`bkit-modules.ts:1397`) | `integrate.api.nvidia.com`, `api.groq.com`, `api.cerebras.ai`, `openrouter.ai`, `ollama.com`, `api.z.ai`, `api.moonshot.ai`, `localhost:11434`, ``(×2 builtins) | `bkit.opencodeProviders` | partly — **`groq.com`, `cerebras.ai`, `openrouter.ai` are MISSING** |
| R2 | tracker MCP servers | `renderOpencodeJson` (`bkit-modules.ts:1651,1653`), `.bkit/templates/.mcp.json:5,9`, `.bkit/templates/.cursor/mcp.json:5,9`, `preflight.sh:86` | `api.githubcopilot.com`, `mcp.linear.app`, `api.linear.app` | `issueTracker` | **`githubcopilot.com` MISSING** (`github.com` does not cover it) |
| R3 | agent host / CLI providers | claude / cursor / opencode modules, `.bkit/templates/.bkit/.env.example:59-74` | `console.anthropic.com`, `api.cursor.com`, `opencode.ai`; opencode built-ins additionally resolve catalogs from `models.dev` | installed modules | partly — **`models.dev` MISSING** |
| R4 | package registry / VCS toolchain | `bkit-postinstall.ts`, `ci.yml:228,265` | `npmjs.com`, `npm.pkg.github.com`, `raw.githubusercontent.com`, `github.com` | always | yes |
| R5 | skills registry | `.bkit/templates/.agents/skills.md:17` | `skills.sh` | `.agents/skills.md` | **MISSING** |
| R6 | consumer stack domains | `.agents/config.md` `allowed-domains` | consumer-declared | always | n/a (union'd) |

Three of the six carry live gaps **today**, before any auto-derivation. That is the strongest argument that the hand-maintained list is the bug, not just the duplication.

### The three defects this change must not inherit

1. **Cloud egress never saw the shipped list at all.** `renderCloudNetworkAllowlist` reads `extractAllowedDomains`, not `resolveNetworkAllowlist`. A consumer with zero `allowed-domains` gets the "Trusted" fallback prose and **no provider host anywhere** — so `--opencode=zai` in Claude-web is broken even though `z.ai` is already in the shipped constant. #381 as written ("union the consumer domains with the derived provider bases") accidentally fixes this; state it as an explicit requirement, not a side effect.
2. **The Cursor cloud renderer is deliberately non-wildcarded** (`bkit-cloud-env.ts:646-669`, citing Cursor's own `*.s3….amazonaws.com` warning). A derivation that only produces apex bases has nothing correct to give that surface. The derived record must carry **both** the exact API host and the base, and let each surface choose.
3. **The Cursor hook is hash-gated.** Anything consumer-varying written into `guardrails.cjs` breaks `bkit check` for every consumer — the same objection that killed alternative 1 in #376. Whatever lands in the hook must be a **build-time constant derived only from bkit's own registries**, never from installed-subset or `config.md`.

---

## Approach A — Declared egress with a derivation _gate_, not a derivation _guess_ ⭐ Recommended

**Summary.** Add an explicit `egress: { host, base } | "none"` field to every entry across R1–R5 (one shared shape), keep a pure `deriveEgress(url)` helper as the **default proposer and the test-time assertion**, and make CI fail when a registry entry has no egress, when the declared base is not a label-boundary suffix of the `baseURL` host, or when the base lands on a multi-tenant platform apex. Codegen the union of all registries into a single generated module that emits **both** `BKIT_SHIPPED_NETWORK_DOMAINS` and the hook's `SHIPPED_NETWORK_BASES` at build time (hash-stable), while the installed-subset/consumer union continues to flow through `resolveNetworkAllowlist` into `.cursor/allowlist.json`, `settings.json`, `opencode.json`, and — newly — `cloud.md`.

**Why declaration beats derivation here (the honest rule).** Naive last-two-labels is wrong for `co.uk` / `com.au` / `com.cn`, and PSL fixes exactly that class. But PSL does **not** fix the class that actually matters for egress:

- `bedrock-runtime.us-east-1.amazonaws.com` → PSL registrable base is `amazonaws.com` → `*.amazonaws.com` = every S3 bucket on the internet.
- `us-central1-aiplatform.googleapis.com` → `googleapis.com` → `*.googleapis.com` = Drive, Gmail, GCS, IAM — to an agent that may hold an ambient GCP token.
- `<resource>.openai.azure.com` → `azure.com`; a vLLM box on `foo.hf.space` → `hf.space` (PSL _private_ section would narrow this one, ICANN-only would not — so the answer depends on which PSL section you honour, which is itself a policy decision nobody will remember in six months).

So: **PSL buys the rare correctness case (`co.uk`) and does not buy the security case.** A runtime dependency (`psl` / `tldts`) whose data is a snapshot needing Renovate bumps, for that trade, is not worth it. A vendored table is the same trade minus the bump automation. Declaration + a mechanical gate gets both.

The gate, stated so it is testable:

```
egress.base is valid iff:
  host = new URL(baseURL).hostname            (URL.canParse first — Node >=20, no try/catch)
  host !== "localhost" && !isIpLiteral(host)  (else egress = "none")
  base === host || host.endsWith("." + base)  (label boundary, not substring)
  base has >= 2 labels
  base not in MULTI_LABEL_SUFFIXES  (co.uk, com.au, com.cn, co.jp, com.br, …)
  base not in MULTI_TENANT_APEXES   (amazonaws.com, googleapis.com, azure.com,
                                     azurewebsites.net, workers.dev, vercel.app,
                                     pages.dev, hf.space, run.app, appspot.com, …)
```

`deriveEgress` proposes `base` = last two labels; the author accepts it or overrides. Both denylists are small, review-visible, and — crucially — **fail loud** (CI red on a new provider) rather than silently widening. `api.z.ai → z.ai` and `integrate.api.nvidia.com → nvidia.com` both fall out of the default with no special-casing.

**Explicit `"none"` cases (each needs a recorded reason, not an empty string):** `ollama-local` (`localhost`, no egress), `opencode-zen` / `opencode-go` (empty `baseURL` — but they are **not** egress-free: declare `opencode.ai` and, pending verification, `models.dev` for catalog resolution).

**Premortems.**

- **10× scale (≈60 providers, ≈8 surfaces).** The union crosses ~70 bases → `expandAllowedDomains` doubles it to ~140 entries, each fanning into `curl *{b}*` **and** `wget *{b}*` in `opencode.json` (≈280 keys in one JSON map), one `WebFetch(domain:…)` per entry in `settings.json` (~140), and a ~140-line paste block in `cloud.md`. Hotspot: `curlWgetHostAllowed` (`guardrails.cjs:187`) is `hosts.every(h => [...bases].some(...))` — an O(hosts × bases) scan with a `Set`→array spread **inside** the loop, executed on **every shell command** in a Cursor session. At 140 bases that is still sub-millisecond, so it is not a perf page; the real blast radius is that the same 140 entries are also the Claude-web dashboard paste, and Claude/Cursor dashboards have practical limits on that field that nobody has measured. _Observability:_ emit the entry count + a short fingerprint in `cloud.md` and in the install log. _Recovery:_ the `"none"`/opt-out field lets a provider be dropped from the union without deleting it from the registry.
- **6 months later.** The load-bearing invariant is "`egress.base` is a suffix of the `baseURL` host". Without the gate test, someone adds `groq` with a copy-pasted `nvidia.com` base and nothing notices — exactly how `groq.com`/`cerebras.ai`/`githubcopilot.com` went missing in the first place. Drift vector: the two denylists become stale magic tables; a new AI vendor on `*.modal.run` or `*.fly.dev` collapses to the platform apex and the gate does not know. _Mitigation:_ the gate is a **deny**, so an unknown platform apex passes — accept that and add a second, softer check that fails when the base is a _known_ CDN/PaaS-shaped label (`.run`, `.dev`, `.app` TLDs get a warning, not a block) plus a comment in the registry stating the rule in one sentence.
- **On-call at 3am.** Two page shapes. (a) _Cloud agent cannot reach the provider_ — the agent's model call fails inside the harness, surfacing as an opaque timeout, not a network error. Diagnosis: `.claude/cloud.md` § Network access lists what _should_ be pasted; the dashboard holds what _is_ pasted; **nothing can compare them** because the allowlist is applied by a human in a web UI. Recovery is "re-paste", and there is no signal telling you to. _Mitigation:_ print a stable one-line fingerprint (`# allowlist-fp <8 hex>`) in `cloud.md` and have the cloud bootstrap hook echo the fingerprint it expects, so a mismatch is at least visible in the run log. (b) _Cursor asks on every `curl`_ — means `.cursor/allowlist.json` is absent/corrupt; the hook fails open to the shipped constant, so the symptom is "asks for consumer domains but not GitHub". Recovery: re-run `bkit install`.
- **Author leaves.** The tribal knowledge is _why declaration beat PSL_. Written down as a `docs/decisions.jsonl` ADR (with the `*.googleapis.com` example verbatim) it survives; left in a PR comment it does not, and the next maintainer adds the `psl` dependency "to do it properly" and re-widens everything. Bus factor is otherwise low — the gate tests encode the rule mechanically.

**Risk-mitigation guidance to layer on (additive, applies to whichever approach wins).**

- **Prune with a provenance sidecar, not a guess.** Record what bkit itself wrote in `.bkit/version` (e.g. `derivedNetworkDomains: [...]`). On the next install/upgrade, remove from `settings.json` `permissions.allow` only entries in `previous ∖ current`; never touch anything not in `previous`. This is the only shape that cannot delete a consumer's hand-added `WebFetch(domain:…)`. Log every pruned entry.
- **Emit `{host, base}`, not just `base`.** Claude cloud + `allowlist.json` + `opencode.json` consume `base` (+ `*.`); `renderCursorNetworkAllowlist` consumes `host` verbatim, preserving its deliberate narrowness (`bkit-cloud-env.ts:665-669`).
- **Do not write derived content into `guardrails.cjs` at install time.** Generate it at build time from the registry only, or shrink the fallback to `[]` (see Approach C's trade). Either keeps `byte-equal-text` + `canonicalHashes` intact.
- **Avoid `try/catch` around `new URL()`.** `URL.canParse(...)` first (Node >=20). A new catch-with-default-return trips `defensive.error-obscuring` and fails `slop:delta` on net-score even at net-zero count.
- **IPv6/port edge already present:** `extractUrlHosts` (`guardrails.cjs:154-169`) strips ports with `authority.split(":")[0]`, which mangles `[::1]:8080` → `[`. Not introduced here, but the derivation must not emit anything that lands in that path; reject IP literals at derivation time.

---

## Approach B — Pure derivation with a vendored suffix table (no registry field)

**Summary.** Keep the registries untouched; add `registrableBase(host)` in `bkit-cloud-env.ts` backed by a small vendored multi-label-suffix table plus a "do not collapse below this" platform table, and derive everything at build/install time. Zero new fields, zero per-provider authoring burden.

**Premortems.**

- **10× scale.** Same fan-out arithmetic as A, plus one extra hazard: the tables are consulted for hosts that were never reviewed by a human, so at 60 providers the probability that _one_ sits on an untabled multi-tenant apex approaches certainty. The failure is silent and in the wrong direction — a `*.<platform>` grant that no test asserts against because no test knows the platform exists.
- **6 months later.** The vendored table is a classic drift artifact: it has no upstream, no bump automation, and its entries look like magic constants. The PSL is revised continuously (new ccTLD second levels, new private-section entries); a hand-copied 40-line subset is a snapshot dated the day it was written. Worse, the "which PSL section" question (ICANN-only vs +private) is a policy embedded in the table's contents with no comment explaining it.
- **On-call at 3am.** Better than A in one respect: no human step, so provider egress is never stale relative to the registry. Diagnosability is worse — when a host resolves to a surprising base you have to reason about the table, and the artifact (`.cursor/allowlist.json`) shows the _result_ with no trace of _why_. _Mitigation:_ have the writer emit `{ domains: [...], derivedFrom: { "api.z.ai": "z.ai" } }` so the mapping is inspectable at 3am.
- **Author leaves.** Highest-risk of the three. The table is pure tribal knowledge — what belongs in it, why `amazonaws.com` is there but `nvidia.com` is not, and that adding a provider requires _checking_ the table rather than _editing_ anything. Nothing fails when a successor gets it wrong.

**Risk-mitigation guidance to layer on.** If B is picked, make the platform table a **hard block, not a rewrite**: on a hit, fall back to the raw host (narrow) and emit an install-time advisory naming the provider, so the over-broad case degrades to "too narrow, visible" instead of "too broad, silent". Add the `derivedFrom` map to the artifact. Add an annual "re-check the vendored suffix table" entry to the release checklist — and accept that this is exactly the kind of item that rots.

---

## Approach C — Narrow by default: exact host, artifact-only, empty hook fallback

**Summary.** Do not collapse at all. Emit the **exact** `baseURL` host (`api.z.ai`, `integrate.api.nvidia.com`) into every surface; keep `*.` expansion for consumer-declared `config.md` entries only. Shrink `SHIPPED_NETWORK_BASES` in `guardrails.cjs` to `[]` and make `.cursor/allowlist.json` the single runtime truth (per comment 2's suggestion), deleting the duplication instead of automating it.

**The case for it.** The public-suffix problem disappears entirely — there is nothing to collapse, so `co.uk`, `amazonaws.com`, and `googleapis.com` are all non-issues. The allow is exactly as wide as the API bkit configured. And the usual counter-argument ("robust to vendor subdomain moves") is weaker than it looks _for the derived half_: the derived value comes from the same `baseURL` string the client actually calls, so it cannot go stale independently — a vendor host move requires a bkit release either way. The wildcard only helps when the vendor keeps `baseURL` valid but _redirects_ to a sibling subdomain, or serves streaming/file endpoints from a second host.

**The case against it.** Those redirect/second-host cases are real and are precisely the 3am failure (see below), and the change is a _narrowing_ relative to today's shipped constant (`z.ai` → `api.z.ai`), which will silently start asking on `curl https://docs.z.ai/...` that used to pass.

**Premortems.**

- **10× scale.** Best of the three: one entry per provider, no `*.` doubling for the derived half, ~60 entries at 10×. Smallest paste block, smallest `opencode.json` map, smallest hook scan.
- **6 months later.** Drift is _self-correcting_ for the derived half. The undocumented invariant becomes "derived entries are hosts, consumer entries are apexes" — two entry kinds in one list, which will get muddled by the first person who edits `expandAllowedDomains`. Encode the kinds in the data (`{kind: "host" | "apex"}`), not in convention.
- **On-call at 3am.** Worst of the three. Symptom: provider works for weeks, then a vendor moves streaming to `stream.z.ai` and every cloud agent run dies mid-response with a harness-level error. Nothing in the allowlist mentions the new host; recovery is a bkit release + a human re-paste in two dashboards. The empty hook fallback adds a second page shape: a fresh clone before `bkit install` asks on **every** `curl`, including `github.com` — which reads as "bkit is broken" to a new contributor. _Mitigation:_ keep a two-entry fallback (`github.com`, `npmjs.com`) rather than truly empty, and state in the ask message that `bkit install` populates the list.
- **Author leaves.** Lowest knowledge concentration — the rule is "use the host, verbatim", which needs no table, no PSL, no gate. Easiest to hand over; hardest to live with.

**Risk-mitigation guidance to layer on.** If C is picked, add a per-registry `wildcard: true` opt-in for vendors with known multi-host APIs, so the escape hatch exists and is reviewed per provider. Keep the docs-host concern (`kimi.com` vs `api.moonshot.ai`, noted in #376) explicitly out — it belongs to the WebFetch docs allowlist, which #381 scopes out.

---

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Declared `egress` per registry entry, derivation as default + CI gate (**A**) | Pure derivation (B); raw host only (C) | The gate turns "a new provider silently misses a surface" into a red build. B has no such trip-wire; C has none either and pays with 3am fragility. |
| **No PSL dependency, no vendored PSL subset** | `psl` / `tldts` runtime dep; vendored ICANN table | PSL solves `co.uk` (rare in AI-provider hosts) and does **not** solve `amazonaws.com` / `googleapis.com` / `azure.com` (the case that actually widens egress). Wrong tool for the risk, plus a snapshot dataset to keep bumped. |
| Two denylists (`MULTI_LABEL_SUFFIXES`, `MULTI_TENANT_APEXES`) as **gates**, not rewriters | Silent narrowing on hit; no check at all | A gate fails loud at authoring time in the bkit repo; a silent rewrite ships a surprise to consumers. |
| Derived record carries `{host, base}` | `base` only (as the issue proposes) | `renderCursorNetworkAllowlist` (`bkit-cloud-env.ts:646`) deliberately refuses `*.` expansion; a base-only record has nothing correct to give it. |
| Hook list is **build-time generated from bkit registries only** | Install-time write into `guardrails.cjs`; consumer-varying content | `.cursor/hooks/guardrails.cjs` is `byte-equal-text` + `canonicalHashes` (`bkit-manifest.ts:267`, `.bkit/version:11,71`) — consumer-varying content breaks `bkit check` for everyone, the same objection that killed #376 alternative 1. |
| `renderCloudNetworkAllowlist` switches to the full union (shipped ∪ derived ∪ consumer) | Keep consumer-only | Today it renders consumer-only (`bkit-cloud-env.ts:557`), so cloud egress omits provider hosts even when they are already in the shipped constant. Not fixing this leaves #381's stated goal unmet. |
| Prune via a `.bkit/version` provenance record of what bkit last wrote | Prune-by-shape guess; no prune | Nothing in `permissions.allow` distinguishes bkit-written from consumer-written entries (`bkit-modules.ts:1723-1730`). `previous ∖ current` is the only removal set that provably cannot delete consumer entries. |
| Scope = R1–R5 registries (opencode providers, tracker MCP, agent hosts, package registries, skills) | R1 only, as the issue body says | Comment 3 ("all providers"); and R2/R3/R5 carry live gaps today (`githubcopilot.com`, `models.dev`, `skills.sh`, `groq.com`, `cerebras.ai`, `openrouter.ai`). |

### Test strategy (what would actually catch a future provider missing a surface)

1. **Completeness property** — for every key in every registry (R1–R5), `egress` is present and is either `"none"` with a recorded reason or a `{host, base}` pair. Table-driven over `Object.keys(...)`, so a new entry fails until it declares.
2. **Suffix invariant** — `host === base || host.endsWith("." + base)` for every entry, plus `host === new URL(baseURL).hostname`. Catches copy-paste of a neighbouring provider's base (the `groq → nvidia.com` failure mode).
3. **Anti-widening** — no `base` in `MULTI_TENANT_APEXES` or `MULTI_LABEL_SUFFIXES`; `base` has ≥ 2 labels; no IP literal; no `localhost`.
4. **Fan-out parity (the one that matters)** — a single test that takes the derived union and asserts it appears in **every** surface: `BKIT_SHIPPED_NETWORK_DOMAINS`, the `SHIPPED_NETWORK_BASES` array parsed out of _both_ `guardrails.cjs` copies, `.cursor/allowlist.json` after a tmp-dir install, `WebFetch(domain:…)` in `.claude/settings.json`, `curl *{b}*` + `wget *{b}*` in `.opencode/opencode.json`, and the rendered `cloud.md` paste block. Today there is **zero** coverage here: no test references `SHIPPED_NETWORK_BASES`, and the only assertions on the shipped list are negative (`bkit-cloud-env.test.ts:406-408`).
5. **Injected-provider test** — add a synthetic provider to a fixture registry and assert all six surfaces change. This is the test that fails when someone adds a surface without wiring it, which no golden snapshot can catch.
6. **Byte parity** — `.bkit/templates/.cursor/hooks/guardrails.cjs` vs `.cursor/hooks/guardrails.cjs` byte-equal (currently only co-listed in `slop-scan.config.json:174`, never asserted).
7. **Negative/edge cases** — `ollama-local` contributes nothing (assert no `localhost` in any surface); `opencode-zen`/`opencode-go` contribute `opencode.ai` and not `""`; malformed/empty `baseURL` yields `"none"` without throwing; a `?src=z.ai` query param still asks in the hook (regression guard on the widened list, per #394 finding 1).
8. **Prune round-trip** — install with provider X, install with provider Y, assert X's `WebFetch` grant is gone and a hand-added consumer entry survives.

---

## Cross-Approach Risks

- **The cloud allowlist is a human-mediated channel.** `cloud.md` renders text a person pastes into a Claude/Cursor dashboard. Auto-derivation makes that text change more often, and **no surface can detect that the pasted value is stale**. This is the highest-severity residual risk regardless of approach; a fingerprint line + a bootstrap-time echo is the only cheap mitigation identified.
- **Widening the list widens the Cursor guardrail surface.** Every added base is one more `endsWith("." + base)` that a lookalike host can aim at, and one more `curl *{base}*` **substring** glob in `opencode.json` (`bkit-modules.ts:1711`) — OpenCode's permission model is a command glob, so `curl https://evil.tld/?x=z.ai` is allowed there even though the Cursor hook now rejects it. That asymmetry is inherent to OpenCode's schema and should be stated in the docs, not implied.
- **Additive-only enrichment is a growing grant.** Until the prune lands, every provider ever installed keeps its `WebFetch` grant forever (`bkit-modules.ts:1723`). Auto-derivation multiplies the entries and therefore the drift; the prune and the derivation should ship together, not sequenced.
- **The registry key set is mirrored in at least four places** (`OPENCODE_PROVIDER_DEFAULTS`, `OPENCODE_PROVIDERS` + aliases in `bkit-cli.ts:43`, `OPENCODE_PROVIDER_COLUMN` in `bkit-install.ts:320`, `EFFORT_COLUMN_FOR_PROVIDER` in `bkit-install.ts:436`, plus `.bkit/prompts.md` / `.bkit/providers.md` tables). This change adds a fifth consumer. Consider whether the completeness test should assert **all** mirrors from the one registry, since the same "keep in sync with…" comment pattern is what #381 exists to remove.
- **`.bkit/version` `canonicalHashes` must be regenerated** whenever the generated hook content changes; forgetting it ships a `bkit check` drift to every consumer.
- **Docs must move in the same change** — `.agents/config.md` § Cloud allowed domains (line 113-118 still says the list is consumer-declared only), `.bkit/providers.md` § Network allowlist, `.bkit/templates/.agents/config.md:116`, and `.bkit/workflows.md:1128`.
- **Open question — opencode built-ins.** `opencode-zen` / `opencode-go` have empty `baseURL` and resolve endpoints + catalogs via models.dev. `opencode.ai` alone may be insufficient; `models.dev` needs verification against a live run before it is declared or omitted.
- **Open question — Claude-web dashboard field limits.** No measured upper bound on the Allowed-domains paste block. At 10× providers the union is ~140 lines; worth probing before the fan-out is designed around it.
