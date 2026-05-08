# Build Input — bar-131-related-bars-suite

## Session Prompt
Build feature from plan: docs/plans/active/bar-131-related-bars-suite-plan.md
Arguments: docs/plans/drafts/bar-131-related-bars-suite-plan.md
Linear Issue: BAR-131

## Description
Catch-all for friction observed during consumer-side adoption of @cbartens/bkit#v0.1.x. 

Resolve consumer-friction debt across bkit install/check/uninstall by phasing four self-contained releases. 

Success Criteria (master):
- Consumer keys in .claude/settings.json / .cursor/hooks.json survive bkit upgrades byte-identically.
- bkit install failing in Phase 3 exits 1 and surfaces a single-line recovery command using bkit uninstall.
- bkit uninstall round-trip on a customised consumer leaves consumer files byte-identical to pre-install state.

## Sub-plans
- Sub-plan 1: P0+P1 (v0.6.x) — BAR-142 §A3, B1-B6, A7
- Sub-plan 2: P2 (v0.7.x) — BAR-139 + BAR-142 §A6 + §A2
- Sub-plan 3: P3 (v0.8.x) — BAR-142 §A1 + §B3
- Sub-plan 4: P4 (v0.9.x to v1.0) — BAR-142 §A4 + §A5 + BAR-131 helper-action
