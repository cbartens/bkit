Verdict: CONCERNS
Affected: 1

<!-- verdict:end -->

# Plan Currency

## Affected Tasks

1. **TASK 15** (Rewrite the root README and roadmap guidance; document the held handoff and the manual batch recipe) — `class`: `Reword`
   - **Landed change:** commit `7c9b909ea` "docs(readme): drop lite workflows, fix model section and counts, short alt text" removed the `.bkit/lite.md` row from `README.md` § Documentation (base `README.md:482`; on `origin/dev` the table at `README.md:471` lists no lite doc), plus the `*:lite` command row (base `README.md:97`) and the "Or run fewer steps" paragraph (base `README.md:413`).
   - **Mismatch:** the task's `READ` field (`§ Documentation` in `README.md`: "the table that links `.bkit/lite.md`") describes a row that no longer exists; the task's own `UPDATE` field already records the removal, so the approach (add the `publish=false` hold row, held handoff, batch recipe; rewrite `docs/roadmap.md` item 20, which still names `lite:build` on `origin/dev`) holds.
   - **Re-run must resolve:** reword or drop the `READ` field so it names the current `README.md` anchor the hold row and recipe sit beside (the `Build it` row at `README.md:96` / § Documentation without a lite row), and state that the README part of `DONE WHEN`'s `grep -niE '(:lite|lite\.md|[Ll]ite workflows?)' README.md` already passes on `origin/dev`, so only `docs/roadmap.md` still needs that edit.
