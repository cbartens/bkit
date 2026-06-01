# Build Plan Execute — Sub-plan 3 Log

## WS-4: Two-Axis Verification Gate

**WS4-T1: Install axis 1 — hash diff**

- Packed tarball installed into clean temp dir, `bkit install` run
- `canonicalHashes` diff vs baseline: EMPTY (byte-identical)
- `tier3Hashes` diff vs baseline: EMPTY (byte-identical)
- `package.json` hash delta is test-harness artifact (tarball path differs by filename, not template content)

**WS4-T2: Install axis 2 — .agents/ tree diff**

- Recursive `.agents/` tree diff vs `baseline/agents-tree.txt`: ONLY `.agents/templates/**` removal
- Fresh consumer NEVER receives `.agents/templates/` from the post-move tarball
- All other `.agents/` paths identical to baseline

**WS4-T3: Upgrade axis 1 — hash diff after upgrade**

- Stale consumer upgraded to post-move tarball
- After fix to `updateCanonicalHashesAfterUpgrade`: `canonicalHashes` empty diff; `tier3Hashes` empty diff
- Fix applied: `.agents/` internal files excluded from hash tracking in upgrade path, mirroring install path filter (`bkit-upgrade.ts:363`)

**WS4-T4: Upgrade axis 2 + D1 orphan assertion**

- Stale consumer with `.agents/templates/` upgraded to post-move tarball
- `.agents/templates/` is ABSENT after upgrade (D1 auto-clean confirmed)
- Recursive `.agents/` tree diff shows ONLY `.agents/templates/**` removal; all other paths identical

**WS4-T5: Tarball content check (npm pack --dry-run)**

- `.agents/templates/` — ABSENT (PASS)
- `.agents/scripts/` — ABSENT (PASS)
- `.bkit/templates/` — 56 entries ship correctly (PASS)
- `.agents/trackers.md`, `.agents/IDEs.md`, `.agents/cloud.md` etc. — still ship (runtime reads preserved)
- `dist/` — still ships (PASS)

## Source Fix Applied

**`bkit-upgrade.ts:363` — `updateCanonicalHashesAfterUpgrade` path filter**
Added `.agents/` prefix filter to match the same filter applied in the install path. Without this, upgrade incorrectly tracked `.agents/rules.md` etc. in `canonicalHashes`, causing spurious drift on subsequent installs.

## Gate Verification

- `pnpm build` — exit 0
- `pnpm test` — 1138 passed, 2 skipped, 1 todo, 31 files, 0 failures
- All 5 WS-4 verification tasks pass
- bkit-upgrade.ts fix committed, dist rebuilt

<!-- verdict:start -->

Verdict: PASS

<!-- verdict:end -->
