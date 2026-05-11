# Ship Input — bar-167-drop-envelope-hybrid

## Session Prompt

/bkit-ship bar-167 will need rebase to dev

## Issue Description

BAR-167: Template ownership via markers + JSON containment

bkit v2.0.0 — drop `__bkit__` JSON envelope and consolidate every template file under one ownership model:

- format-aware containment: `bkit:start..bkit:end` comment markers for text formats
- deep-tree containment for JSON
- Phase 1 (drop envelope), Phase 2 (markers everywhere), Phase 3 (terminology cleanup)

## PR

PR #20: https://github.com/cbartens/bkit/pull/20

## Plan

See: docs/plans/active/bar-167-drop-envelope-hybrid-plan.md (parent index)
Sub-plans: plan-1 (Phase 1), plan-2 (Phase 2), plan-3 (Phase 3)
