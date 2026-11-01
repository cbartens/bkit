# Design Brainstorm & Ideas

Lens: Optimal trade-off — best long-term shape, legacy constraints set aside.

## Approach A — One `docs/brain.jsonl` with a generic envelope, a pure-function core library, and thin CLI verbs ⭐ Recommended

Build a single library (fold, link resolver, premise-gone check, path-overlap selector, FTS5 index, brain-update planner) as pure functions over the folded row set. Every `bkit brain <verb>` is a thin wrapper over it. The grill settled the on-disk shape: one file, one envelope (`key`, `kind`, `status`, `summary`, `links{supersedes,dependsOn,relatedTo}`, `references`, per-kind body), identity `(repo, key)`, a closed kind-transition list beside `KIND_WRITERS`. Reads go only through `bkit brain context|search|check`. The always-loaded digest is knowledge-only plus assumptions and capped (about 6k tokens, to be fixed from measurement). Decision and deferral rows come in by path overlap. Brain update is one planner that emits a `Suggested Changes` list. `ask: true` writes it as a report; `ask: false` applies it. Both modes run the same code, and the mechanical-cleanup step is a separate function. Concurrency without a lock: every brain-update change is an idempotent same-`key` append, and each suggestion has a deterministic id (a hash of the change type plus the keys and the latest `ts` of the rows it touches). Two concurrent runs therefore produce identical ids, and union merge plus fold dedupes them. A rejection is stored as a row keyed by that id. It becomes void when any row it touched gets a newer `ts`, which gives the Q20 behaviour for free.

- Complexity: HIGH (one migration plus a new row format, five new verbs, one new agent; but each part is small and testable in isolation).
- Extensibility: new kinds (for example `feature`) are an enum entry and a body schema. New link types are one key in `links`. A new retrieval backend (qmd) reads the same folded view.
- Risk: the migration is the single point of failure. A fold-winner change, a lost row, or a key collision across the four old files would corrupt history. Mitigation: a migration that is a pure function with a golden test on this repo's real ledgers (fold winners, `bkit stats`, roadmap render byte-equal), and a fixed collision rule (suffix by old kind, record the mapping in `links.relatedTo`). A second risk is the 6k-token digest drifting up as the knowledge row count grows; the cap must be enforced by truncation in the tool, not by convention.
- Maintenance: LOW to MEDIUM. One format, one reader, one writer table. The four updater agents and their `Cross-Ledger Impact` sections disappear. Remaining ongoing cost is the transition list and the digest cap.
- Friction vs ideal: the highest of the three. It touches `APPEND_LEDGERS` (`telemetry.ts:386`), `KIND_WRITERS`, `.bkit/jsonl.md`, the seven "Check gotchas first" prompts, four updater agents, `bkit stats`, the roadmap render, `.gitattributes`, `docs/migrations.md`, and every doc that names the four files. Consumers with branches opened before the upgrade rely on the old-shape reader shim. The shim is cheap, but it is a permanent branch in the reader until the next major version.

## Approach B — Keep four files, add a generated unified view and typed links in place

Leave the four ledgers as storage. Add `supersedes` / `dependsOn` / `relatedTo` as optional fields on each kind and teach the existing `foldFrom` to read all four as one logical brain through a derived, gitignored `brain.view` (fold plus link index). `bkit brain context|search|check|update` operate on the view. `assumption` becomes a kind inside `decisions.jsonl`. No migration of consumers beyond an optional backfill of exact-key references.

- Complexity: MEDIUM.
- Extensibility: fine for links and retrieval. Weak where the grill asked for generality: kind lifecycle changes (failure to knowledge) stay two unrelated rows, and a link still needs a kind qualifier or a four-file lookup unless keys are made globally unique by a new check.
- Risk: the split hides inconsistent state. Keys can legally collide across files, so links can silently resolve to the wrong row. Four updaters keep their bookkeeping, and brain update has to write into four files.
- Maintenance: MEDIUM. Two models stay alive (physical split, logical merge), and every new feature pays that translation tax.
- Friction vs ideal: low on migration (additive fields, no row rewrite), but it contradicts settled Q2, Q12, Q13 and Q15. It is the fallback if the migration proves too risky to ship in one release.

## Approach C — Merge into one file, but keep the old row shapes (no new envelope), and ship the checks only

Merge the four files into `docs/brain.jsonl` mechanically. Keep each kind's per-kind field set as it is, and add only `links` as a new top-level field. Defer brain update, the fading logic, shared `lastRecalled` and summaries to later. Ship `context`, `check`, `search` first.

- Complexity: MEDIUM.
- Extensibility: moderate. Kinds keep their ad hoc shapes, so new tools branch per kind and the generic-envelope goal is deferred rather than met.
- Risk: a half-generic format becomes permanent. Rewriting rows twice (merge now, envelope later) means two migrations, and each one is a risk to consumers.
- Maintenance: MEDIUM. Per-kind branches stay in every reader.
- Friction vs ideal: moderate. It skips the envelope rewrite but still touches most of the surfaces in A, and it departs from settled Q13, so the owner would have to confirm.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| One file `docs/brain.jsonl`, one envelope, one migration, as the grill settled (A) | Keep four files plus a derived view (B); merge without the envelope (C) | A pays the migration cost once. B and C each leave a second model or a second migration, and both contradict settled Q2, Q12, Q13. |
| Core library of pure functions; CLI verbs and brain update are thin wrappers | Logic inside each command or agent prompt | The premise-gone check, selector and planner can be unit-tested and reused by `append`, `check`, `update` and the qmd export. |
| Concurrency by deterministic suggestion ids plus idempotent same-`key` appends | A lock file; a "last run wins" report | Q28 forbids a lock. Identical ids from concurrent runs collapse under union merge and fold, with no coordination. |
| Rejections stored as rows keyed by suggestion id, voided by any newer `ts` on the touched rows | A separate gitignored rejection list | Rejections must be shared across clones and branches. This gives Q20 with no extra rule. |
| `lastRecalled` is written only by brain update from local recall logs; readers take the max across the entry's rows | Writing it on every read | Writes on read would create merge noise on every task. The max rule makes the union merge lossless (Q25). |
| Digest is knowledge plus assumption rows only, hard-capped by the tool (about 6k tokens, final number from measurement); decisions and deferrals come in by path overlap | Digest of all kinds (about 29k tokens) | Measured: decisions alone are about 18k tokens, which exceeds any always-loaded budget. This resolves open Q7. |
| Migration key-collision rule: keep the key for the first file in a fixed order (decisions, knowledge, deferrals, failures), suffix the others with `~<oldkind>`, link them with `relatedTo` | Fail the migration; silent overwrite | The rule is repeatable and loses no row, and none exist today so the cost is nil. |
| Old-shape reader shim kept until the next major version, and brain update normalises such rows | Refuse old-shape rows | Required by the pre-upgrade branch edge case, and cheaper than breaking in-flight branches. |
| FTS5 index in `node:sqlite`, gitignored, rebuilt when the file hash changes; qmd stays the opt-in template with a per-row markdown export | A pure-JS library in core | Node >= 24 bundles FTS5, so core needs no dependency. |
