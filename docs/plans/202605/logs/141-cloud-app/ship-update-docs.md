# Ship — Docs Update (141-cloud-app)

PR #201 / issue #141 (FID `141-cloud-app`), squash SHA `b2cc83f` on `dev`. #184 folded.

## Files Modified

- `docs/completed.md` — appended cycle entry (Sync: completed-ledger).
- `.agents/cloud.md` — fixed stale prose at the `.cursor/hooks/preflight.sh` row (Sync: GAP-3 closure).

## Drift Resolved

- **`docs/completed.md` — Sync.** Appended the `## bkit-cloud rebuilt on the Claude GitHub App (#184 folded) — #141 (2026-05-27)` entry. Artifacts cite `docs/plans/202605/141-cloud-app-plan{,-1,-2,-3}.md` + the logs dir (regex `docs/plans/[0-9]{6}/.*141-cloud-app` satisfied). Dense summary covers D1 OIDC App auth, the `cloud=claude`/`cloud=cursor` module split + single `bkit.cloudAgents` field (DECISION-C/D), the folded #184 HEAD-Subject Assertion, D2 skip-tags, the two-tier CI auto-route gate, the D3 concurrency restatement, Block-4 `claude.yml` dogfood + `Auto`→`bkit:auto` migration, the 10 challenge findings (2 HIGH fixed in-tree), and the single open post-merge human acceptance item (live dispatch). No consumer-facing Linear refs introduced in the entry body.
- **`.agents/cloud.md` — Sync.** Line 244 "What lives where" table described the Cursor preflight hook guard as the bare "Auto label"; the shipped migration renamed the opt-in label to `bkit:auto` across both preflight hook templates and `trackers.md`. Updated the prose to `` `bkit:auto` label `` so the doc matches shipped code (build-summary GAP-3). `cloud.md:400` "Auto-fix PRs" left untouched — different term, not the opt-in label.

## Already Synced During Build Cycle (no Ship-phase edit needed)

Verified current against shipped code; the build cycle already rewrote these (confirmed via grep against `dev`):

- `docs/deployments.md` § "CI trigger on final workflow push" — `bkit [auto route]` row added to the commit-tag taxonomy; rule points at the shared HEAD-Subject Assertion.
- `docs/security.md` § "CI Auto-Route Trust (bkit-cloud)" — PR-body marker trust (challenge Finding 5) documented; § Supply-Chain token-isolation invariant intact.
- `.agents/workflows.md` — § "HEAD-Subject Assertion (shared, single source — #184)" + § "`bkit [auto route]` Marker Propagation" + commit-tag tables present and consistent.
- `.agents/trackers.md` — `Auto`→`bkit:auto` migration complete (no bare `Auto` remains); kill-switch-check notes the live CI kill switch lives in `bkit-cloud.yml`.
- `.agents/templates/.{claude,cursor}/hooks/preflight.sh` — guard on `bkit:auto`, no bare `Auto`.

## Out of Scope (Exceptions — not touched)

Per doc-sync exceptions, `docs/knowledge.md` / `docs/decisions.md` / `docs/pending.md` were NOT edited. The build cycle already landed the matching entries (read-only verified): `decisions.md` DE-21 (full ADR for the rebuild) and `knowledge.md` KN-30 (D1/D2/D3 incident + D3 restatement root cause). No new KN/DE needed at Ship.

## Pending Items

Grepped `docs/pending.md` for `141-cloud-app` / `141` / cloud-app FID and the cycle's new markers (`bkit [auto route]`, `cloudAgents`): no FID match. Line 109 (`Router dead-letter / retry policy …`) is a pre-existing BAR-148 deferral about `bkit-cloud` failure handling, not a `141-cloud-app` item — not surfaced.
