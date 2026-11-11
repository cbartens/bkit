Verdict: CONCERNS
Failures: 3
Redesign: false

<!-- verdict:end -->

# Plan Review

Lens: Regression risk — touched surfaces, backwards compatibility, design-coverage.

## Surface-Area Map

No design artifact exists for this FID (step 7 skipped; the plan input records the design as removed by the owner).

- **Task 1 — OpenCode exact-origin webfetch, no shell fetch allows**
  - Edits `injectOpencodeDerivedAllows` (`.bkit/core/engine/install/modules/opencode.ts:348-369`), called only from `renderOpencodeJson` (`opencode.ts:250`). Output flows through `reconcileOpencodeJson` (`opencode.ts:384-459`), whose `deepMergeJson` keeps every consumer key, so legacy `curl *x*` / `wget *x*` / `*x*` allows survive upgrade (Task 2 reports them).
  - Reads `networkAllowlistBases` (`cloud-env.ts:587`), `resolveNetworkAllowlist` (`cloud-env.ts:596`), `BKIT_SHIPPED_NETWORK_HOSTS` (`cloud-env.ts:578`). No signature change.
  - Consumers of the rendered map: OpenCode's permission engine (glob, last match wins; template `.bkit/shared/.opencode/opencode.json` keeps `"curl *": "ask"`, `"wget *": "ask"`, webfetch `"*": "ask"`); tests `opencode.integration.test.ts:464-467`, `:551-559`; `index.integration.test.ts:956-1000` (template-only curl parity), `:1219-1221` (derived-base parity); `cloud-env.integration.test.ts:112-113` (comment names curl globs, assertion is a probe-substring check and still passes).
  - Docs: `.bkit/core/.bkit/providers.md:438-441`, `:463`; `.bkit/core/.bkit/workflows.md:1437`. Generated copy `.opencode/opencode.json`.
- **Task 2 — `opencode-substring-fetch-grants` detector**
  - New `detectOpencodeSubstringFetchGrants` + exported key matcher in `.bkit/core/engine/checks/before/files.ts`; pushed from `runPreflight` (`checks/before/index.ts:90`).
  - `runPreflight` consumers: install, upgrade (`runUpgradeAdvisories`, `install.ts:203`), `bkit check`, and `bkit doctor` (`doctor.ts:167`). Read-only, per kn-4.
  - Matcher consumer: Task 3 (`uninstall.ts`). Import direction checks/before -> commands/install already exists (`uninstall.ts:73` imports `checks/before/mcp.js`).
- **Task 3 — uninstall by `claudeAllowDerived` record**
  - Edits the `.claude/settings.json` branch of `uninstall.ts` (`:733-746`, today calls `resolveClaudeDerivedAllows(ctx.cwd)` at `:739`) and the `.opencode/opencode.json` branch after `stripOpencodeJsonScope` (`:750`).
  - Reads `readBkitVersion` (`install/version-file.ts`, record written by `enrichClaudeSettingsAllows` in `install/modules/claude.ts`; kn-9 says read `.bkit/version` only through it).
  - Ordering dependency: one table loop in manifest order; core's `.bkit/version` (`manifest.ts:129`) precedes `.claude/settings.json` (`manifest.ts:165`); `.bkit/version` is deleted at `uninstall.ts:497-511` on a full or core uninstall; `canonicalHashes` is read before the loop at `uninstall.ts:430-431`. A bare `bkit uninstall` resolves to `["core","claude","cursor", ...opt-ins]` (`cli.ts:195-216`).
- **Task 4 — Codex private-key deny**
  - Shared high-risk surface: `shellSecretRead` in `.bkit/core/hooks/guardrails-tiers.js`, spliced into `.cursor/hooks/bkit-guardrails.cjs` (`:35`), `.agents/plugins/bkit/hooks/bkit-guardrails.cjs` (`:47`), `.codex/hooks/bkit-guardrails.cjs` (`:43`); not into the Claude hook.
  - `decideShell` in `.bkit/core/.codex/hooks/bkit-guardrails.cjs:62-86`; secret case `:74-77` returns `ask(... "Command: ${c}")`.
  - Message registry: `.bkit/instructions.md` § Hook Text (`:8890-8937`, secret advisory `:8916-8925`), enforced by `HOOK_SOURCES` (`instructions-sources.ts:304-314`) and `instructions-sources.test.ts:241-244`.
  - Tests: `index.integration.test.ts` `SHELL_SECRET_READS` (`:636-653`), `codexVerdict` (`:736`); T6 mirror parity (`guardrails-cursor.integration.test.ts`).
  - Docs referencing the Codex ask tier: `.bkit/core/.bkit/prompts.md:435` (Guardrails row, "Codex ask tier … command still runs").
- **Task 5 — manual Codex run**: new files under `tests/experiments/hooks/results/` and `reports/`; `docs/testing.md` § Manual recipe. No code consumer.
- **Task 6 — `codex-setup` advisory wording**: `runCodexModule` (`install/modules/codex.ts:211-221`, "Three things …"); no existing test asserts that text (text search over `*.test.ts` finds no `codex-setup` / `Three things`). Docs `providers.md:271`, `:307-308`.
- **Task 7 — allowlist fingerprint**
  - `egressFingerprint` (`cloud-env.ts:655`, public export; callers `renderCloudNetworkAllowlist` `:706` and `renderWidenedNetworkList` `:935`) gains an optional `entries` parameter; no-argument behaviour preserved.
  - `renderNetworkAllowlist` (`network-allowlist.ts:20`) writes `{domains, fingerprint}`; the list equals the Claude paste list from `resolveNetworkAllowlist(cwd)` (`cloud-env.ts:687`), so the two stamps can match. `.bkit/allowlist.json` readers use only `.domains` (`guardrails-shell.js:246`), so the added key is compatible.
  - Decision row `docs/decisions.jsonl:739` (`803-cloud-allowlist-fingerprint`). Doc `.bkit/core/.bkit/cloud.md:103`, `:116-126`.
- **Task 8 — bootstrap compare**
  - `.bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh` (runs under `set -euo pipefail` at `:22`; non-remote early exit `:27-29`; jq trust check guarded with `2>/dev/null || printf 'false'` at `:48-51`; stdout `.bkit/.unavailable` notice `:147-150`; `exit 0` at `:186`) and its byte-identical root copy (`dogfood-templates.test.ts:72`).
  - Stdout consumers: SessionStart hook output (knowledge row `kn-hooks-sessionstart-stdout-is-one-json-document`) and the exact-stdout test `cloud-env.integration.test.ts:269-341`; both stay safe only if the new block writes to stderr through the `log` helper (`:31`).
  - Tests: `tests/shell/bkit-cloud-bootstrap-preflight.bats` (setup links `node` and `jq` into `FAKE_BIN`, `:50-52`; `NO_GH_BIN` also carries `jq`, `:60`).
- **Task 9 — `cloud-bootstrap-fingerprint-missing` detector**: new detector in `checks/before/files.ts`, pushed from `runPreflight` (same consumers as Task 2); prior art reading the bootstrap at `checks/before/context-fetch.ts:554`; related tip `tips/catalogue.ts:305` (fires on a missing bootstrap). Tests in `files.test.ts` and `commands/install/check.integration.test.ts` (exists). Doc `.bkit/core/.bkit/templates.md:79`.
- **Task 10 — mirrors and docs**: `.opencode/opencode.json` hand edit, re-rendered `.bkit/{providers,cloud,templates,workflows}.md`, `dist/`, `docs/testing.md`. Knowledge row `dogfood-template-mirrors-need-install` applies (upgrade runs before parity tests).

## CRITICAL

1. **(plan edit) Task 3 — a full `bkit uninstall` reads an already-deleted record, so it strips no derived grant.** Task 3 reads `readBkitVersion(...)?.claudeAllowDerived` inside the `.claude/settings.json` branch (`uninstall.ts:733-746`). A bare `bkit uninstall` resolves to core first (`cli.ts:195-216`), and the table loop runs in manifest order: `.bkit/version` (`manifest.ts:129`) is deleted at `uninstall.ts:497-511` before `.claude/settings.json` (`manifest.ts:165`) is reached. The record then reads as absent → `[]`, every derived grant is kept and only listed for review. Today's recompute removes them, so the most common uninstall path (the plan's Manual Step 5 runs `bkit uninstall`) regresses, and the row `381-webfetch-grants-survive-uninstall-after-seed-emptied` is not closed on it. None of the four Task 3 tests runs a bare (all-modules) uninstall, so the gap is untested. Fix: read `claudeAllowDerived` once before the loop, beside `canonicalHashes` (`uninstall.ts:430-431`, whose comment already states hashes are read before the loop for this reason), and add a Task 3 test `a full bkit uninstall removes recorded WebFetch grants` that runs uninstall with no module flags.
2. **(plan edit) Task 4 — the new Codex deny message breaks the Hook Text registry test.** Task 4 adds a `deny(...)` reason to `decideShell` (`.bkit/core/.codex/hooks/bkit-guardrails.cjs:74-77`) and narrows the existing secret advisory to `.env` files, but no task updates `.bkit/instructions.md` § Hook Text. The existing entry (`.bkit/instructions.md:8916-8925`) describes the advisory as covering "env, secrets or private-key file", and the new deny text has no entry. `instructions-sources.test.ts:241-244` asserts that every message emitted by a `HOOK_SOURCES` file (`instructions-sources.ts:304-314`, includes the Codex guardrails hook) has an entry and every entry is still emitted, so it fails after Task 4. Fix: add `.bkit/instructions.md` (§ Hook Text: new private-key deny entry, `.env`-only advisory entry) to Task 4's UPDATE list and `instructions-sources.test.ts` passing to its DONE WHEN.
3. **(plan edit) Task 8 — a malformed `.bkit/allowlist.json` aborts the bootstrap; no matrix row covers it.** The bootstrap runs `set -euo pipefail` (`bkit-cloud-bootstrap.sh:22`). The planned block reads the expected stamp with `jq`; on malformed or unreadable JSON `jq` exits non-zero inside the command substitution and the hook aborts with a non-zero exit, against the plan's "never non-zero / warns and continues" contract and before provisioning (`:135-143`) runs. The five planned bats tests cover unset, differ, match, missing-field / jq-absent and non-hex, but not a present-but-unparseable file, so the Derived Test Matrix has no row for that state of the touched surface. Fix: guard the read the way the trust check does (`:48-51`, `2>/dev/null || printf ''`), and add a bats case `fingerprint: warns and continues when .bkit/allowlist.json is not valid JSON` asserting exit 0 and the "expected fingerprint is unavailable" WARNING. (This brings the file to six fingerprint tests; still within the per-task cap.)

## OPTIONAL

- **Reporting surfaces assumption is wrong.** `bkit doctor` also calls `runPreflight` (`doctor.ts:167`), so both new advisories (Tasks 2 and 9) appear there too. Correct the plan's assumption text; optionally assert one detector in a doctor test.
- **Stale doc after Task 4.** `.bkit/core/.bkit/prompts.md:435` (Guardrails row, "Codex ask tier … Advisory naming the bypassed gate; command still runs") is not in any task's UPDATE list; add it to Task 4 or Task 6, with its rendered mirror in Task 10.
- **Stale test comment after Task 1.** `cloud-env.integration.test.ts:112-113` says "permission.bash curl globs"; the assertion still passes but the comment misdescribes the new surface. Add it to Task 1's UPDATE list.
- **Exact-origin webfetch keys are still never revoked.** After Task 1, `https://{name}` / `https://{name}/*` allows for a domain later dropped from `allowed-domains` persist through `deepMergeJson` on upgrade and survive `stripOpencodeJsonScope` on uninstall; Task 2's matcher deliberately ignores exact-origin keys. The `381-opencode-bash-grants-never-revoked` lifecycle gap remains for webfetch. State this as a residual in the plan, or record a deferral row.
- **Review listing volume.** With no record (Task 3 test 3), the review listing can print one line per derived-looking row (about 160 for bkit's own settings). Consider one aggregated line with a count and a pointer.
- **High-risk surfaces (flagged, not CRITICAL):** shared `shellSecretRead` in `guardrails-tiers.js` (three hosts splice it; Task 4's DONE WHEN already asserts Cursor and Antigravity verdicts unchanged); public `egressFingerprint` signature (optional parameter, both callers preserved; DONE WHEN asserts `renderWidenedNetworkList` unchanged); `.bkit/allowlist.json` shape (additive; readers use `.domains` only, `guardrails-shell.js:246`); Task 1's subdomain asks (e.g. `api.github.com` not in `BKIT_SHIPPED_NETWORK_HOSTS`) are already listed under Breaking Changes.
- **bats on macOS.** Knowledge row `384-bats-tmpdir-collision`: run `tests/shell/bkit-cloud-bootstrap-preflight.bats` as its own invocation in Task 8's DONE WHEN.

## OUT OF SCOPE

- An OpenCode guardrails plugin that enforces shell secret reads the way the Codex / Cursor hooks do (already a deferral).
- Extending `secretFileKind` to further private-key names (`id_ed25519`, `*.key`, `*.p12`) so the Codex deny covers them.
