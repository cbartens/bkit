# Design Input — 381-provider-egress-domains

## Session Prompt

`/bkit-design 381`

Design feature for GitHub issue #381 — "Auto-derive provider cloud-egress domains from the provider registry" (repo `cbartens/bkit`, milestone `Provider Support`, labels `enhancement`, `bkit:design`).

Issue URL: https://github.com/cbartens/bkit/issues/381

## Issue Description (verbatim)

## Goal

Cloud agents (`bkit-cloud.yml`, Claude Code web, Cursor background agents) running `--opencode=` must reach that provider's API host at runtime. Today the cloud-egress allowlist rendered into `.claude/cloud.md` / `.cursor/cloud.md` is fed **only** by consumer-declared `allowed-domains` in `.agents/config.md`. So installing a remote opencode provider (e.g. `--opencode=zai`) does **not** add its API host to the cloud egress list — the consumer must hand-declare it, and most won't know to.

Auto-derive each installed provider's egress host from the registry instead.

## Proposal

In the cloud.md generator (`.bkit/src/bkit-cloud-env.ts` — `extractAllowedDomains` / `expandAllowedDomains` / `renderCloudNetworkAllowlist`, + the Cursor twin), **union** the consumer-declared domains with the **registrable base domain** of each installed opencode provider's `baseURL` host, read from `OPENCODE_PROVIDER_DEFAULTS` (`bkit-modules.ts`) keyed on `bkit.opencodeProviders` (the installed set):

- `zai` → baseURL `https://api.z.ai/api/coding/paas/v4` → host `api.z.ai` → base **`z.ai`** → expand to `z.ai` + `*.z.ai`
- `moonshot` → `api.moonshot.ai` → base **`moonshot.ai`**
- `nvidia` → `integrate.api.nvidia.com` → base **`nvidia.com`**, etc.
- keyless/local (`ollama-local`) and empty-baseURL built-ins (`opencode-zen`/`opencode-go`) contribute nothing (or the gateway host for the built-ins)

## Requirements

- Extract the **registrable base domain** (`z.ai` from `api.z.ai`), NOT the raw subdomain — broadest allow, robust to vendor subdomain changes (per the base-domain direction agreed in #376). Reuse `expandAllowedDomains`' apex→`*.` expansion.
- **Zero duplication:** the consumer never re-declares provider hosts; `config.md allowed-domains` stays the single place for **consumer** app/observability domains.
- **Deterministic + reactive:** derives from the installed provider set, so add/switch provider → cloud egress list updates on the next `install`/`upgrade`.
- Add tests in `bkit-cloud-env.test.ts` and update the `.agents/config.md` § Cloud allowed domains guidance prose (docs-match-code).

## Decision context (from #376)

This was chosen over two rejected alternatives:

1. **"`config.md` drives `settings.json` WebFetch too"** — rejected: `config.md allowed-domains` is consumer-owned and stack-specific; the `.claude/settings.json` managed block is bkit-shipped, **hash-gated** (in `.bkit/version` canonicalHashes) and **stack-agnostic**. Consumer content driving it would vary the shipped hash per consumer (breaking `bkit check` drift detection) and leak stack-specific domains into the shipped surface.
2. **Manual `config.md` declaration of provider hosts** — rejected: redundant once auto-derive lands, and wrong owner (provider hosts are bkit-ecosystem, not consumer stack).

## Scope boundary

The `settings.json` **WebFetch** allowlist (which #376 extended with `z.ai`/`moonshot`/`kimi.com`) is a **separate concern** — it governs which **docs** hosts an interactive agent may fetch, and stays bkit-shipped. This issue is only about **cloud runtime egress**.

## Files

- `.bkit/src/bkit-cloud-env.ts` (generator + Cursor twin)
- `.bkit/src/bkit-modules.ts` (`OPENCODE_PROVIDER_DEFAULTS` baseURL source)
- `.bkit/src/bkit-cloud-env.test.ts`
- `.agents/config.md` (§ Cloud allowed domains guidance)

Follow-up from #376.

## Issue Comments (verbatim, chronological)

### Comment 1 — cbartens, 2026-07-29T04:20:56Z

Datapoint from the post-merge review of #394 (reopened), since it lands on the same list this issue wants auto-derived.

`BKIT_SHIPPED_NETWORK_DOMAINS` (`.bkit/src/bkit-cloud-env.ts:471-485`) currently hardcodes the provider hosts — `nvidia.com`, `z.ai`, `moonshot.ai`, `kimi.com`, `ollama.com`, `opencode.ai` — and that list is **duplicated by hand** into `SHIPPED_NETWORK_BASES` in `.cursor/hooks/guardrails.cjs:110-123` (plus its template copy), with only a `keep in sync with BKIT_SHIPPED_NETWORK_DOMAINS` comment holding them together. No test asserts parity, so adding a provider today means editing three files and silently degrading the Cursor guardrail if one is missed.

Two things worth folding into this issue's scope:

1. Whatever derives the list from the provider registry should emit **both** consumers, so the guardrail copy stops being hand-maintained. The `.cursor/allowlist.json` artifact written by `writeNetworkAllowlistArtifact` already exists as a runtime channel — the hook's hardcoded fallback could shrink to "empty, ask on everything" if that file is guaranteed present after install.
2. The derived set only ever grows: `enrichClaudeSettingsWebFetch` appends to `permissions.allow` and never prunes, so a provider removed from the registry keeps its `WebFetch(domain:…)` grant. Auto-derivation makes that worse, not better, unless a prune pass lands with it.

Separately, note that the Cursor host check is a substring match over the whole command rather than a URL-host match (detail in #394) — auto-deriving a longer domain list widens that surface, so the two are worth sequencing together.

### Comment 2 — cbartens, 2026-07-29T05:38:53Z

Follow-up to my earlier datapoint, now that the #394 enforcement fixes have landed on `dev` (`2ebf3d56`).

**Leaving this open — nothing in this issue's scope was implemented.** The domain list is still hardcoded in two hand-synced places, which is exactly what this issue exists to remove:

- `BKIT_SHIPPED_NETWORK_DOMAINS` — `.bkit/src/bkit-cloud-env.ts:471-485`
- `SHIPPED_NETWORK_BASES` — `.cursor/hooks/guardrails.cjs` (+ its template copy), held together only by a `keep in sync with …` comment. Verified again: no test references `SHIPPED_NETWORK_BASES` at all, and the only `BKIT_SHIPPED_NETWORK_DOMAINS` assertions are negative (`not.toContain("vercel.com")`).

Two things changed that affect this issue's design:

1. **The guardrail now parses the URL host** instead of substring-matching the whole command, so its fallback list is consulted through `hostMatchesBase` (apex or `.`-boundary suffix). Whatever derives the list must emit apex bases for that consumer — the `.cursor/allowlist.json` artifact already carries the apex + `*.` expansion, and the hook normalises `*.` away on read. If auto-derivation guarantees that artifact is present post-install, the hook's hardcoded fallback could shrink to empty (ask on everything), which would delete the duplication rather than automate it.

2. **`enrichClaudeSettingsWebFetch` is confirmed additive-only** and is now documented as such. Auto-derivation makes that worse, not better: a provider dropped from the registry keeps its `WebFetch(domain:…)` grant forever. A prune pass should land with this issue, not after it — noted on #394 as the reason it was not attempted there.

### Comment 3 — cbartens, 2026-07-29T05:54:49Z

Important: This should apply to all providers not just opencode!

## Orchestrator Notes

- Comment 3 materially widens scope beyond the issue body: derivation must cover **all** provider registries bkit ships (not only `OPENCODE_PROVIDER_DEFAULTS` / opencode providers). Treat "all providers" as a first-class design requirement.
- Comments 1–2 fold in three additional concerns: (a) single source of truth feeding **both** the cloud.md/allowlist artifact and the Cursor guardrail fallback, (b) an **additive-only** `enrichClaudeSettingsWebFetch` needing a prune pass landing with this change, (c) parity tests, since none exist today.
