## Session Prompt — this run's, newer than everything below

/bkit-build #985 publish=false

## Issue description — oldest

### Problem

`bkit install` and `bkit upgrade` merge bkit's settings files (for example the permission lists in `.claude/settings.json`) into the project's own copy. The merge keeps everything the project already has and adds what bkit ships. So when a bkit release stops shipping a permission (an allowed command, a network domain, a hook) because it was too broad or is no longer needed, upgrading does not remove it. Every project that installed the earlier release keeps the old grant for good, and neither the upgrade nor `bkit check` says so.

This is finding F4 of [#964 — Review since v6.1.1: tech debt findings and consolidation work](https://github.com/cbartens/bkit/issues/964). The merge itself came from [#787 — Show authoring rules before every edit, including shell edits](https://github.com/cbartens/bkit/issues/787). I read the code on `dev` today and did not run an upgrade across two releases.

What I saw in `.bkit/core/engine/install/write.ts`:

- `mergeManagedList` (`:238-282`): for a list of plain values (such as permission strings) the result is the template's entries, then every entry from the project's copy that the template does not hold (`const extras = base.filter(...)`, `return [...override, ...extras]`). A string bkit used to ship and no longer does is indistinguishable from one the person added, so it stays.
- `mergeManagedJson` (`:285-297`) applies the same rule to objects: keys only the project has are kept.
- `:404` is where the merged text is written for the settings file.
- Nothing records which entries an earlier bkit release wrote, so the merge has no way to tell a retired grant from the person's own.

### Outcome

When a release retires a shipped grant, `bkit upgrade` removes it from a project's settings, and leaves the person's own entries alone. A grant bkit cannot safely remove is named in the upgrade output with the line to delete.

### Success criteria

- A test seeds a settings file holding a grant bkit shipped in an earlier release and that the current template drops; after upgrade it is gone, and a person-added entry beside it is untouched.
- The list of retired grants is registered in `docs/migrations.md` (§ Migrations), per its rules.
- `bkit check` reports a retired grant that is still present.

### Constraints and non-goals

- The person's own entries are never removed.
- Not in scope: widening any grant, or the hook-group merge rules, which already replace bkit's own groups.

### Decisions already made

None. Two designs are open: a fixed list of retired grants shipped with each release, or a record in `.bkit/version` of the entries bkit wrote (the file already records hashes of written files).

### Open questions

- Fixed retired list, or a record of what bkit wrote?
- A retired grant the person has since edited (a changed string): remove, keep, or warn?

### References

- `.bkit/core/engine/install/write.ts:201-297`, `:404`
- `docs/migrations.md` § Migrations
- [#787 — Show authoring rules before every edit, including shell edits](https://github.com/cbartens/bkit/issues/787)

## Issue comment — posted 2026-11-16T11:06:09.000Z

One parked deferral belongs here: upgrade never removes a settings entry bkit shipped earlier, so a permission that was dropped from the shipped list stays in a consumer's settings file. Ledger key `787-show-authoring-rules-challenge-low-bkit-core-engine-install-write-ts-256` in `docs/deferrals.jsonl` (finding `deferrals-5` in `docs/audits/202611/deferrals-20261116T065554Z.md`). The row is tracked on this issue; the sweep in [#968 — Sweep the deferrals and failures parked since v6.1.1 before v6.2](https://github.com/cbartens/bkit/issues/968) opened no separate issue for it. Code read on `dev` on 2026-11-16: `.bkit/core/engine/install/write.ts` and the settings merge in `.bkit/core/engine/shared/settings.ts` (around `:382`); not re-run.

## Issue comment — posted 2026-11-17T11:36:56.000Z

Owner decisions for this issue, 2026-11-17 (v6.3 run):

- `bkit upgrade` learns which old settings entries were bkit's from a fixed retired list: each release ships the exact entries it retired, each with a row in `docs/migrations.md`.
- An entry the person edited no longer matches the list, so it is kept and the upgrade output warns about it. A person's own entries are never removed.
- bkit does not record in `.bkit/version` what it wrote.
- Building this migration is approved, with a test that seeds the old shape.

Two other v6.3 issues retire their stale rows through this list: [#1006 — Shell guard: the hook code is the only source of the deny, ask and secret rules](https://github.com/cbartens/bkit/issues/1006) and [#1019 — Git rules and the shell guard disagree: Codex, push, reset, stash](https://github.com/cbartens/bkit/issues/1019).
