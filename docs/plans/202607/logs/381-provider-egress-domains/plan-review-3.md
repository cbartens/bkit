Verdict: CONCERNS
Failures: 5

<!-- verdict:end -->

# Plan Review

Lens: Regression risk, design-coverage.

## Surface-Area Map

Every row below was read from source in this worktree on 2026-08-26. "Consumers" = every caller/reader found by `rg`, not the plan's own list.

<!-- prettier-ignore -->
| Task(s) | Surface edited | Symbols / content changed | Consumers found by grep | Risk |
| --- | --- | --- | --- | --- |
| 2, 3, 4 | `.bkit/src/bkit-registry.ts` `[NEW]`, `.bkit/src/bkit-modules.ts:1461-1518` | `EgressSource`, `BKIT_EGRESS_SOURCES`, `MULTI_*` denylists; `OPENCODE_PROVIDER_DEFAULTS` relocated | `OPENCODE_PROVIDER_DEFAULTS` confirmed module-private — no external importer, no test importer. `dist/bkit-registry.js` becomes a committed build output gated by `pnpm bkit:check:dist` (`package.json:61`) | LOW. Relocation + leaf. Not in the `test:coverage:unit` brace list (`package.json:58`), so branch-free is genuinely load-bearing |
| 5-9 | `.bkit/src/bkit-cloud-env.ts:465-503` | `BKIT_SHIPPED_NETWORK_DOMAINS` literal (10) becomes computed (15); `BKIT_SHIPPED_NETWORK_HOSTS` added; `deriveEgressEntries` added | `resolveNetworkAllowlist` (`:502`) has **four** callers: `writeNetworkAllowlistArtifact` (`bkit-cloud-env.ts:519`), `injectOpencodeNetworkCurlAllows` (`bkit-modules.ts:1730`), `enrichClaudeSettingsWebFetch` (`bkit-modules.ts:1768`), and **`bkit-uninstall.ts:589`**. The fourth is named nowhere in the plan | **HIGH** — public type export + shared utility. Widening flows into an uninstall path the plan believes is seed-driven. See CRITICAL 1 |
| 5-9 | same | Superset claim | Verified against `bkit-cloud-env.ts:471-482`: today's 10 are `github.com`, `githubusercontent.com`, `anthropic.com`, `claude.com`, `cursor.com`, `linear.app`, `opencode.ai`, `ollama.com`, `openrouter.ai`, `npmjs.com`. All ten appear in the plan's 15-base union (`Architecture § Registry`). **Strict superset confirmed — no consumer loses a base on upgrade** | LOW. Claim holds |
| 10-14 | `.bkit/src/bkit-cloud-env.ts:543-568`, `:643-667`; both `cloud.md` templates; `.agents/config.md` (+ template twin), `docs/observability.md` (+ template twin), `.bkit/cloud.md`, `.bkit/providers.md` | Both zero-declared branches deleted; fingerprint appended after fence | `.claude/cloud.md` / `.cursor/cloud.md` are untracked and in no manifest — no hash gate. Doc twins are managed-block drift-gated (`docs/knowledge.jsonl` key `managed-block-doc-edits-must-sync-template-or-bkit-check-drifts`); the plan names both halves for `config.md` and `observability.md` | **HIGH** — every existing zero-declaration consumer is told to change dashboard mode. See CRITICAL 5 |
| 15-18 | `.bkit/templates/.cursor/hooks/guardrails.cjs:114-147` | `SHIPPED_NETWORK_BASES` (10) deleted; `loadNetworkAllowlistBases()` starts empty | Manifest entry verified `format: "markered-text"` + `noMarkerMigration` (`bkit-manifest.ts:554-559`); `:115` is inside `// bkit:start` (`:22`) … `// bkit:end`. Only test reference is `bkit-permissions-parity.integration.test.ts:176`, and `:173-191` is the last `describe` in a 192-line file — a clean delete | **HIGH** (hash-gated shipped block) but the change is a **deletion**, so the block becomes trivially install-state-independent. `bkit check` claim verified |
| 15 | runtime behaviour of the hook | fail-open → fail-safe | `curlWgetHostAllowed` (`:189-194`): `hosts.length === 0 → false`; with an empty `bases` set `[...bases].some(...)` is `false`, so `hosts.every(...)` is `false` → **ask**. Verified fail-CLOSED, not fail-open. `.cursor/allowlist.json` is git-tracked and matched by no rule in `.bkit/templates/gitignore`, so a fresh clone still carries it | LOW after verification. The plan's security claim is correct |
| 19-25 | `.bkit/src/bkit-version.ts:37-113`, `bkit-modules.ts:887-962` + `:1751-1778`, `bkit-upgrade.ts:465-501`, `.bkit/templates/.claude/settings.json:10-22` | `webFetchDerived` field; enrich signature `void` → `readonly string[] \| null`; template seed emptied | Enrich call sites confirmed exactly two (`bkit-modules.ts:1062`, `bkit-install.ts:2588`). `parseBkitVersion` returns confirmed at `:103` and `:112`; install literal at `:955-959` builds fresh and drops unknown keys; upgrade spreads. **`.bkit/src/bkit-uninstall.test.ts:680-701` and `:737-738` do assert `WebFetch(domain:…)` literals** | **HIGH** — schema field + backwards-compat + public signature. See CRITICAL 2 and 3 |
| 26-29 | none (verification only) | — | `injectOpencodeNetworkCurlAllows` (`bkit-modules.ts:1726-1734`) sets `bash["curl *{base}*"] = "allow"` and **never deletes**. Ten new keys per consumer, no revocation path | **HIGH** — grant lifecycle asymmetry across the five surfaces. See CRITICAL 4 |
| 30-34 | `dist/`, `docs/decisions.jsonl`, `docs/deferrals.jsonl`, mirrors | 3 ADR + 3 deferral rows; single end-of-session `bkit install` | Task 31 asserts `rg -c '"key":"381-' docs/deferrals.jsonl` returns 7. Rows 1-3 of `related-deferrals.md` are already appended | MEDIUM — Task 31 freezes a row whose stated mechanism is contradicted by source. See CRITICAL 1 |

Schemas / migrations: none (no DB). The one persisted schema is the `.bkit/version` envelope; ordering is sound — old payload → `[]` → `previous \ current` empty → first run prunes nothing. Confirmed against `parseBkitVersion` (`bkit-version.ts:81-113`), which has no `webFetchDerived` today and returns object literals at `:103` and `:112` that the plan names correctly.

Endpoints / events / queues: none.

## CRITICAL

### 1. The uninstall deferral records a mechanism the source contradicts, and `bkit-uninstall.ts` is an unlisted consumer of the widened set

`.bkit/src/bkit-uninstall.ts:583-598` already handles enrich-added grants and does **not** read them from the template seed:

```ts
if (summary.file === path.join(".claude", "settings.json")) {
  …
  const enriched = resolveNetworkAllowlist(ctx.cwd).map((d) => `WebFetch(domain:${d})`);
  permsObj.allow = [...allow, ...enriched.filter((e) => !allow.includes(e))] as JsonValue;
}
```

It recomputes the derived set at uninstall time and folds it into the template scope before `stripTier2JsonScope`. So emptying `.bkit/templates/.claude/settings.json:10-22` strands nothing: the 13 seeded strings are all inside `expandAllowedDomains` of the new 15 bases, so the strip scope after this change is **wider**, not narrower.

Three consequences:

- The `Out of Scope` row "WebFetch grants survive `bkit uninstall` once the template seed is emptied" is not a genuinely-additive deferral. It is a non-issue, justified by a claim (`with the seed empty … the grants are no longer template-scoped and are left behind`) that the code disproves.
- `docs/deferrals.jsonl` row `381-webfetch-grants-survive-uninstall-after-seed-emptied` is **already appended** (row 2 of `related-deferrals.md`) and carries the same false mechanism plus a `remediation` proposing to build what `:589` already does. Task 31's `Done when` (`rg -c '"key":"381-' docs/deferrals.jsonl` returns 7) freezes it in the ledger.
- The real uninstall exposure is the opposite one and is unanalysed: `:589` uses the **current** derived set, so widening 10 → 15 bases widens the set of `permissions.allow` entries uninstall treats as bkit-owned and deletes — including a hand-added consumer grant that collides with a newly-derived base (`tavily.com`, `models.dev`, `skills.sh`, `githubcopilot.com`, `npmjs.org`). That is the same disclosed-honesty problem the plan solved carefully for the prune, on a different verb, with no `Edge Cases` row, no task and no `Derived Test Matrix` row.

**Required:** name `bkit-uninstall.ts:583-598` in `Architecture` as the fourth `resolveNetworkAllowlist` downstream; replace the `Out of Scope` row and append a same-`key` correction row to `docs/deferrals.jsonl` (`.bkit/jsonl.md` § Updating a Row — never edit the line); adjust Task 31's count assertion accordingly; add an `Edge Cases` row for the widened uninstall strip scope.

### 2. "No test asserts a `WebFetch(domain:…)` literal" is false, and Task 22's `Done when` is unsatisfiable as written

The plan's Assumption reads: _"No test anywhere asserts a `WebFetch(domain:…)` literal except the parity assertion WS-4 deletes … Re-verified: the only other occurrences are `bkit-modules.ts` JSDoc + generator and the template file itself."_ Repo-wide grep says otherwise:

- `.bkit/src/bkit-uninstall.test.ts:680, 691, 692, 701` — `stripTier2JsonScope` regression case "install-enriched allow list does not survive while deny/ask are stripped".
- `.bkit/src/bkit-uninstall.test.ts:737, 738` — `runUninstall — .claude/settings.json leaves no grants behind`, which reads the **real** `.bkit/templates/.claude/settings.json` off disk (`:726-729`) and simulates install output from it.

Task 22's `Done when` requires `rg -c 'WebFetch\(domain:' .bkit/src/*.test.ts .bkit/src/*.integration.test.ts` to return 0. It will not. A build agent following the runbook literally has two exits, both bad: delete assertions (explicitly forbidden by Gate 2) or weaken the grep until it passes.

My read of the two tests is that both still pass after the seed is emptied — the synthetic-template one never touches the real file, and the real-template one appends `WebFetch(domain:github.com)` / `WebFetch(domain:npmjs.com)`, which `:589` still recomputes into scope, so the file is still fully stripped and deleted. But that is a conclusion the plan has to reach and own, not one a `Done when` should assume away.

**Required:** correct the Assumption; restate Task 22's `Done when` to scope the grep to the template plus "the two `bkit-uninstall.test.ts` cases still pass unmodified"; add both cases to `Verification Plan § Test Synchronization` beside the three `bkit-cloud-env.test.ts` cases and the deleted parity block.

### 3. The `dryRun` contract as written can silently delete `bkit check`'s drift signal for `.claude/settings.json`, and no matrix row would catch it

Today (`bkit-modules.ts:1766-1777`) the `ws.writes.push` sits **outside** the `if (!dryRun)`:

```ts
if (missing.length === 0) return;
if (!dryRun) { doc.permissions!.allow = [...allow, ...missing]; fs.writeFileSync(…); }
if (!ws.writes.some((w) => w.path === settingsDst)) ws.writes.push({ path: settingsDst, action: "write" });
```

That is what makes `bkit check` report a write — and exit non-zero on the CI drift gate — when a consumer's `.claude/settings.json` is missing a grant bkit would add. The plan's recording-contract table gives `dryRun` a single row: _"Writes settings.json? no · Returns null"_. It says nothing about `ws.writes`, and Task 23 tells the builder to _"Restructure — do not extend — the early return"_. The obvious restructure — `if (dryRun) return null;` near the top — passes every row of the matrix:

- T8 asserts only that `dryRun` returns `null` and leaves the prior record unchanged.
- T14 asserts 0 writes on a **clean** install and a **clean** upgrade — the state where `add` and `remove` are both empty anyway, so it is green either way.

Nothing anywhere asserts that `bkit check` still reports a write when a grant is missing or prunable. A drift gate that stops reporting drift fails green: exactly the failure shape `docs/testing.md` exists to prevent, and it ships to every consumer's CI.

**Required:** add an explicit `ws.writes` column to the recording-contract table (`dryRun` must still push when `add` or `remove` is non-empty, or state plainly that it must not and why); add a matrix row — `bkit check` on a consumer whose `.claude/settings.json` is missing one derived grant reports exactly one write, and on one carrying a prunable recorded grant reports one write — owned by Task 23 or 28.

### 4. OpenCode `permission.bash` grants are never revoked, and the plan neither states it nor defers it

`injectOpencodeNetworkCurlAllows` (`bkit-modules.ts:1726-1734`) only assigns keys:

```ts
for (const base of networkAllowlistBases(resolveNetworkAllowlist(cwd))) {
  bash[`curl *${base}*`] = "allow";
  bash[`wget *${base}*`] = "allow";
}
```

Across the five surfaces the grant lifecycle is now split three ways: cloud paste and `.cursor/allowlist.json` are full rewrites (revoke for free), Claude `WebFetch` gains the prune (revokes what bkit recorded), and OpenCode revokes **nothing, ever**. A consumer who drops `sentry.io` from `allowed-domains` keeps `curl *sentry.io*` = allow and `wget *sentry.io*` = allow in `.opencode/opencode.json` permanently — a _shell_ egress grant, strictly broader than the `WebFetch` grant the plan takes such care to remove, and one that also survives uninstall (the injected keys are not in the rendered template, so `stripTier2JsonScope` leaves them). This change adds ten more such keys per consumer.

The plan is silent on this. `Success Criteria` 4 is worded `WebFetch`-only so it technically passes, but the `Concrete Example` step 5 reads as though removing a domain revokes its reach, and `Security & Privacy` discusses the `curl *{base}*` substring weakness without mentioning that those entries are immortal. The existing deferral `381-opencode-curl-glob-substring-bypass` covers the glob **shape**, not the **lifecycle** — no row covers this.

**Required:** either extend WS-5's prune to the OpenCode surface (`previous \ current` maps cleanly onto the two glob keys), or state the asymmetry in `Security & Privacy` plus `.bkit/providers.md` in the same commit and append a new `docs/deferrals.jsonl` row. Silence is the one option that is not available — WS-6's "unchanged code path, prove it, do not edit it" currently reads as a considered decision when the question was never asked.

### 5. Retiring the Trusted branch can NARROW egress for zero-declaration consumers unless the "extends, not replaces" instruction survives — and nothing asserts it does

The two branches carry different vendor instructions today:

- Trusted branch (`bkit-cloud-env.ts:547-548`): _"Set to **Trusted** (default) — covers package registries, GitHub, and common cloud SDK hosts."_
- Custom branch (`:556-559`): _"Set to **Custom** and tick **Also include default list of common package managers** — this EXTENDS the trusted defaults …, it does not replace them."_

Task 10 says the deleted Trusted branch is _"replaced by a single always-Custom block carrying the bkit set plus the existing pointer prose"_ — and "the existing pointer prose" is the Trusted branch's `_No allowed-domains block declared …_` sentence, not the Custom branch's tick instruction. If the single branch is assembled from the bkit set plus that pointer prose, a zero-declaration consumer moves from Trusted (package registries + GitHub + cloud SDKs) to a 32-line Custom list **without** the checkbox, and loses reach they have today: PyPI, crates.io, Go proxy, the cloud SDK hosts. That is a new cloud-session breakage introduced by a change whose entire purpose is fixing cloud-session breakage, and it lands on the population least likely to diagnose it.

The `Done when` for Task 10 checks only that the Trusted string is gone and that a fence containing `githubcopilot.com` renders. T12 asserts only that a fence appears where a zero-declared branch used to suppress it. Neither would fail if the tick instruction vanished.

**Required:** state in Task 10 that the always-Custom block keeps the `Also include default list of common package managers` / "EXTENDS, does not replace" instruction verbatim, and add it to T12's assertions (`toContain("Also include default list")` for both the declared and zero-declared render paths).

## OPTIONAL

- **Base count is internally inconsistent — 14 in three places, 15 in five.** `Related Issues § WARNING` ("the derived union is **14 bases**"), the Assumptions bullet ("The derived union (14 bases)") and Open Question 6 ("14 bases is ~28 lines") disagree with `Architecture § Registry` (15, enumerated), the `Concrete Example` (15 derived, 16 with `sentry.io`, 32 lines), the ground-truth delta table ("13 rows / 15 bases") and Tasks 7/32/33. 15 is right once Open Question 2 resolves to A and `npmjs.org` joins. Harmless to a careful reader, but a build agent that anchors on 14 drops `npmjs.org` and then Open Question 2's whole `reason` invariant is unmotivated.
- **`.bkit/providers.md:256` is a fourth stale spot the doc list misses.** The host-capability table row says `curl`/`wget` ask unless host ∈ `.cursor/allowlist.json` **(tooling ∪ consumer domains)** and describes `WebFetch` as "tooling … enriches with consumer `allowed-domains`". The plan's `Documentation Updates` row for `providers.md` names `:266`, `:270-275`, `:277`, `:279` only. Cheap to fold into Task 29.
- **Add a regression row for uninstall.** Given CRITICAL 1, an integration case worth one assertion: after a real install and a real `bkit uninstall claude`, `.claude/settings.json` carries no `WebFetch(domain:…)` entry bkit derived, and a hand-added non-derived grant survives. It pins the behaviour the deferral currently mis-describes, and `bkit-uninstall.ts` is inside the `test:coverage:unit` brace list (`package.json:58`) so the coverage lane already measures it.
- **`hostMatchesBase` only ever runs for commands matching `\bcurl\b` / `\bwget\b`.** Deleting the fallback does not change that, so it is not a regression — but the plan's `Security & Privacy` claim "net security posture improves on the Cursor surface" would read more honestly with the bound stated: the improvement applies to `curl`/`wget` only, and every other network-capable command still reaches `allow()` at `guardrails.cjs:111` as it does today.
- **Task 5's `Done when` compares against `git show HEAD:` for a `try {` count.** Fine in a clean worktree; note that it is meaningless after the first commit of the phase, so pin it to the pre-task baseline SHA rather than `HEAD`.

## OUT OF SCOPE

- **Provenance-aware `bkit uninstall`.** Once CRITICAL 1 is corrected, the honest follow-up is the inverse of what is currently deferred: `:589` deletes by _recomputation_, which cannot distinguish a hand-added grant that collides with a derived base. `webFetchDerived` is the record that would let it delete by _provenance_ instead. Same remediation text, correct premise.
- **Revocation parity across the five surfaces.** CRITICAL 4 asks for the OpenCode half to be stated or fixed; the general shape — one revocation contract every surface implements, asserted by a single parity test — is a separate change and belongs beside `381-unified-runtime-allowlist-artifact-all-hosts`.
- **Refreshing `canonicalHashes` for enrich/prune writes on the upgrade path.** `bkit-install.ts:2615-2624` feeds `updateCanonicalHashesAfterUpgrade` from `result.updated` + `renderedDocPaths`; the `enrichWs` writes at `:2587-2593` are logged but not fed in. Pre-existing, and harmless for `format: "json"` files because `bkit check` decides them by `deepContains` rather than by hash — but it is the same install-vs-upgrade finalisation asymmetry as `381-upgrade-does-not-write-advisories-artifact` and would sit naturally in that issue.
- **Probing the dashboard field cap (Open Question 6).** Agreed with the plan's recommendation A; noted here only so it is not re-raised as a plan gap.
