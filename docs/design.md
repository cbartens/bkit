<!-- bkit:start -->

<!-- bkit:managed v6.0.0 — do not edit; run `bkit upgrade` to refresh -->

# Design

> [!CAUTION]
> **Purpose:** Design system — palette, typography, components, spacing, a11y, layout tokens.
>
> **Rules:**
>
> - Use dense token-efficient phrasing; no filler / hedging / restating; tables > prose, bullets > paragraphs.
> - Notation: one job per mark — `.bkit/authoring.md` § `Notation`.
> - Describe current state / rules, not reasons / history; state what to do, not why.
> - Check `.agents/docs.md` index first and confirm topic belongs in this doc, not another.
> - No ad-hoc hex — theme tokens only; all colours must support Dark Mode.
> - Touch targets >=44x44px; WCAG 2.1 AA contrast.

## Machine-checked reference

Sole hand-maintained source for token values: nothing generates it, so changing an expected value forces a human to restate intent in the same PR diff. Keeping the gate honest:

- **Select the table by its header row**, never "any row containing a hex", because this doc may hold >1 hex table. Renaming the header renames the contract; update the parser in the same change.
- **Assert each implementation separately** (stylesheet variables, theme object, rendered style guide), so a red names its own culprit.
- **No silent gap.** Every implementation token maps to a row here or to an explicit "intentionally undocumented" entry with a reason. A dropped token must red, not vanish.
- **Transcribed != ratified.** A row read out of the implementation is tautological on day one — mark it so until a human confirms the value is intended.

Example shape — choose your own columns, then pin them; the header row is the contract:

<!-- prettier-ignore -->
| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| Background (`--background`) | `#FFFFFF` | `#0A0A0A` | Page surface |
| Foreground (`--foreground`) | `#181818` | `#F1EFEA` | Headings / body — 17.8:1 light, 17.2:1 dark (AAA) |
| Primary (`--primary`) | `#2563EB` | `#2563EB` | Aligned L+D — buttons / active. **Transcribed-not-ratified**: read from source, pending human confirmation |

Lane map, tagging, cache rules: `testing.md` § "Design assertions are a dimension, not a lane".

<!-- bkit:end -->
