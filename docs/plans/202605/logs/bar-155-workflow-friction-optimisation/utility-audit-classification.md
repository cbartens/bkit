# Utility Prompt Audit Classification — BAR-155

Task 3 audit pass. Each file classified as (a) freeform multi-finding (Fix-1b applicable) or (b) stubbed/structured verdict-bearing (no change needed).

<!-- prettier-ignore -->
| File | Classification | Rationale | Fix-1b Applied |
| --- | --- | --- | --- |
| `bkit-utility-audit-codebase.md` | (b) | Writes severity-sorted findings directly to `docs/audits/codebase-audit.md`; no incremental echo-log pattern; output is a whole-doc structured report | No |
| `bkit-utility-audit-security.md` | (b) | Same shape as codebase — whole-doc structured report to `security-audit.md` | No |
| `bkit-utility-audit-tests.md` | (b) | Same shape — whole-doc structured report to `tests-audit.md` | No |
| `bkit-utility-audit-logs.md` | (b) | Structured table-format report; update rules preserve existing annotations; whole-doc writer | No |
| `bkit-utility-audit-logs-ship.md` | (b) | Stubbed verdict-bearing (`Verdict: HEALTHY\|DEGRADED\|BROKEN` + `<!-- verdict:end -->`); single-pass health check; Linear-bound output cap (`Output cap: MAX 500 token` per prompts.md rules) | No |
| `bkit-utility-update-documentation.md` | (b) | Structured report listing files modified; no multi-finding accumulation | No |
| `bkit-utility-update-references.md` | (b) | Structured report listing paths fixed; no multi-finding accumulation | No |
| `bkit-utility-compress-markdown.md` | (b) | Single-pass compression; post-compression verification at end; no incremental multi-finding | No |

**Result:** Zero (a)-classified utility prompts. No spot-fix edits applied.
