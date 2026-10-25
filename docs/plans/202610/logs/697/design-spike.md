Verdict: FAIL

<!-- verdict:end -->

# Design Spike

Feasibility spike for the issue #697 option 6 proposal: "extend `checkedTable` so an array of objects holding one level of nesting also renders, with stable flattened keys, keeping the round-trip check". This artifact is the decision note. Throwaway probe code was a temporary test file deleted before this note was written; no tracked source was changed.

## Claims

<!-- prettier-ignore -->
| # | Claim (falsifiable) — the design depends on this being true | Design element resting on it | Class |
| --- | --- | --- | --- |
| C1 | Flattening a nested item value to a column (`{ b: [{ c: 2 }] }` → column `b.c`) still produces a table that `parseText` reads back as the same nested object with the same types. | Option 6's whole premise: nested rows "also render". | `DISPROVEN` |
| C2 | Design (a) — dotted flattened keys with no parser change — keeps the round-trip check intact while rendering nested rows. | Option 6 as literally worded. | `DISPROVEN` |
| C3 | Design (b) — dotted keys plus teaching `readTable` / `parseText` to expand dotted keys back — keeps the round-trip check AND today's literal-dotted-key behaviour. | The only parser change option 6 could pivot to. | `DISPROVEN` |
| C4 | Design (c) — each nested array as its own table below the main one — lets `parseText` return the original object. | The stacked-table alternative. | `DISPROVEN` |
| C5 | The existing behaviour already round-trips a nested array of objects without any table: `checkedTable` refuses, and the printed JSON / list rendering is the lossless path. | The fallback option 6 says it will keep (`render: raw`). | `SETTLED` |

## Method

<!-- prettier-ignore -->
| # | What was built | Where it ran | Exact command |
| --- | --- | --- | --- |
| all | One throwaway Vitest file asserting exact table text and exact `parseText` / `checkedTable` return values, printing them too. | `.bkit/core/engine/shared/text.scratch.test.ts` (deleted after the run) | `npx vitest run .bkit/core/engine/shared/text.scratch.test.ts --silent=false` |
| C5 | Baseline of the pre-existing contract, unchanged and green. | `.bkit/core/engine/shared/text.test.ts` | `npx vitest run .bkit/core/engine/shared/text.test.ts` |

No dependency, no build, no `dist/` edit, no `bkit install`. `checkedTable`, `readTable`, `parseText`, `markdownTable` and `renderText` were read and exercised as-is; nothing under source was modified.

## Evidence

Verbatim probe output (throwaway file, 8/8 passing), `--silent=false`:

```
SPIKE checkedTable([{b:[{c:2}]}]) -> {"ok":false,"reason":"item 0 key b is nested"}

SPIKE dotted table text:
| b.c |
| --- |
| 2 |
SPIKE parseText(dotted table) -> {"rows":[{"b.c":2}]}

SPIKE checkedTable([{'b.c':2}]) -> {"ok":true,"text":"| b.c |\n| --- |\n| 2 |"}

SPIKE empty nested array -> table has no 'b' column:
| x |
| --- |
| 1 |

SPIKE multi-element cell -> {"rows":[{"b":"[{\"c\":1},{\"c\":2}]"}]}

SPIKE dotted object key -> "b.c: 1\n"
SPIKE dotted table key  -> "rows:\n| b.c |\n| --- |\n| 1 |\n"

SPIKE stacked tables -> null

SPIKE deep-equal but not reference-equal: [ { c: 2 } ] [ { c: 2 } ] false
SPIKE renderText fallback:
rows:
  -
    b:
    | c |
    | --- |
    | 2 |
```

Interpretation, against the exact strings above:

- **C1 `DISPROVEN`.** Input `[{ b: [{ c: 2 }] }]`. A dotted flattener prints `| b.c |\n| --- |\n| 2 |`; `parseText` returns `{"rows":[{"b.c":2}]}`. The original is `{ rows: [{ b: [{ c: 2 }] }] }`. They are not equal, and the cell is a scalar `2`, so no parser reading cells as scalars (`readScalar`) can ever produce the nested array. A table cell holds a string; a nested value is not a string.
- **C2 `DISPROVEN`.** `checkedTable`'s round-trip check compares `rows[i][k] === flat.rows[i][k]`, the printed document's own rows (`text.ts` ~line 200-208). For a nested `k`, `readTable` can only return a scalar, so the check can never be satisfied. Today `checkedTable([{ b: [{ c: 2 }] }])` returns `{"ok":false,"reason":"item 0 key b is nested"}`. Extending `flatRows` to accept the row without changing the check would make every nested row hit `{ ok: false, reason: "table parses back to different rows" }` — the feature renders nothing. Making it render requires deleting the check, which is the unsound move.
- **C3 `DISPROVEN`.** Teaching `readTable` / `parseText` to expand dotted keys collides with a literal dotted key: `checkedTable([{ "b.c": 2 }])` is already `{"ok":true,"text":"| b.c |\n| --- |\n| 2 |"}`, byte-for-byte identical to the flattened form of `[{ b: [{ c: 2 }] }]`. The two inputs are indistinguishable on read-back, so a key collision is structurally guaranteed, not hypothetical. It also breaks today's plain round-trips `parseText("b.c: 1\n") → {"b.c":1}` and `parseText(renderText({rows:[{"b.c":1}]})) → {rows:[{"b.c":1}]}`, because key/entry dots are not escaped anywhere in `keyText` or `markdownTable`. And even a perfect reconstruction fails `checkedTable`: the row compare is `===`, so a fresh `[{ c: 2 }]` is deep-equal to the input but not reference-equal (`true` for `toEqual`, `false` for `===`).
- **C4 `DISPROVEN`.** A stacked-tables text (`rows:` + main table + a second table) parses back as `null`: `parseText`'s grammar (`readBlock` / `readObject`) has no way to attach a second table to a row, and the indented lines it does collect do not form a valid single table. There is no per-row table reference in the format at all.
- **C5 `SETTLED`.** The existing fallback is lossless: `renderText({ rows: [{ b: [{ c: 2 }] }] })` falls back to a list block, and `parseText` of it equals `{ rows: [{ b: [{ c: 2 }] }] }`. `context.ts` `tableOf` already returns `{ reason }` when `checkedTable` refuses, and `runBlock` then writes the output as printed and logs `render: raw (<reason>)` (`context.ts` ~1742-1751). This is exactly the "any mismatch … still writes the output as printed" arm option 6 already keeps.

Extra lossy cases found (each on its own is enough to force a fallback for "one level of nesting"): an empty nested array (e.g. `{ b: [] }`) produces no `b.*` column, so the key vanishes; a nested array of length > 1 cannot fit one cell without serializing to JSON, and `readScalar` does not re-parse JSON, so `[{"c":1},{"c":2}]` reads back as the string `'[{"c":1},{"c":2}]'`; ragged multi-element nested arrays would need per-index presence markers to keep holes.

## Design Impact

**Option 6 as written is not buildable under its own contract.** The guarantee is not a formality — `bkit context fetch` replaces a block's printed JSON with a table only because `checkedTable` has proved `readTable(text)` equals the input rows. Cells are strings and `readScalar` only yields `string | number | boolean | null`, so a table can never parse back to a nested object or array of the right type. Therefore:

- (a) dotted keys, no parser change: refuses **every** nested case — a no-op feature; if the round-trip check is weakened to make it pass, the artifact no longer reads back as the same data.
- (b) dotted keys + dotted expansion: key collisions (literal `"b.c"` vs nested `b.c` are the same column), no escaping for literal dots in `keyText` / `markdownTable`, and the `===` row compare can never match a reconstructed object; also regresses today's dotted-key round-trips.
- (c) stacked tables: `parseText` returns `null`; the format has no per-row sub-table reference.
- (d) the sound design is the one that already ships: refuse the table and write the output as printed (`render: raw (<reason>)`), with `renderText`'s list/JSON path as the lossless rendering. Option 6 adds nothing that is not already the fallback.

What evidence supports instead: keep `flatRows` refusing non-scalars (C2, C5) and keep the check. If a nested row must be table-shaped, the only sound route is a distinct cell encoding (serialize + escape, then deep-compare and reconstruct) plus dot-escaping in headers and a deep-equality row check — a new serialization layer, not "stable flattened keys", and it still must fall back for empty containers, multi-element nested arrays and ragged arrays. That is a different, larger proposal than option 6 and loses the property that a column is one field.

## Unsettled

- Whether a deliberately designed lossless cell encoding (prefix + escaped JSON, deep-equality in `checkedTable`, dot-escaping in `keyText` / `markdownTable`) could be made sound was not probed in depth: it is out of option 6's shape, needs its own round-trip proof for empty containers, multi-element nested arrays, ragged arrays and every existing `checkedTable` / `parseText` case, and it stops being a flattened table. Recommend the owner decide whether that is wanted before any planning.
- No `pnpm typecheck` was run, because no source file was changed (read-only spike). If a future plan edits `text.ts`, run it.

## Verdict Reasoning

`FAIL`: claim C1 is `DISPROVEN` by captured exact output, and `FAIL = any claim DISPROVEN`. C2, C3 and C4 are also `DISPROVEN`; only C5 holds. The round-trip guarantee (parse the table back to the original typed value) is structurally incompatible with a markdown cell holding only a scalar, so option 6 cannot both flatten nested rows and keep its check. The sound behaviour is the existing refusal plus raw fallback, which option 6 already retains.
