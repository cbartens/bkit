<!-- bkit:start -->

<!-- bkit:managed v6.0.0 — do not edit; run `bkit upgrade` to refresh -->

# Design

> [!CAUTION]
> **Purpose:** The design system: palette, typography, components, spacing, a11y and layout tokens.
>
> **Rules:**
>
> - Follow `.bkit/authoring.md` § All Agent-Read Files and § Docs when you edit this file.
> - Use theme tokens only, with no ad-hoc hex.
> - All colours must support Dark Mode.
> - Touch targets must be >=44x44px.
> - Contrast must meet WCAG 2.1 AA.

## Machine-checked reference

This table is the sole hand-maintained source for token values. Nothing generates it, so changing an expected value forces a human to restate the intent in the same PR diff. To keep the gate honest:

- **Select the table by its header row**, never by "any row containing a hex", because this doc may hold >1 hex table. Renaming the header renames the contract, so update the parser in the same change.
- **Assert each implementation separately** (stylesheet variables, theme object, rendered style guide), so a red names its own culprit.
- **No silent gap.** Every implementation token maps to a row here, or to an explicit "intentionally undocumented" entry with a reason. A dropped token must red, not vanish.
- **Transcribed != ratified.** A row read out of the implementation is tautological on day one, so mark it as transcribed until a human confirms the value is intended.

An example shape follows. Choose your own columns, then pin them, because the header row is the contract:

<!-- prettier-ignore -->
| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| Background (`--background`) | `#FFFFFF` | `#0A0A0A` | Page surface |
| Foreground (`--foreground`) | `#181818` | `#F1EFEA` | Headings / body — 17.8:1 light, 17.2:1 dark (AAA) |
| Primary (`--primary`) | `#2563EB` | `#2563EB` | Aligned L+D — buttons / active. **Transcribed-not-ratified**: read from source, pending human confirmation |

Lane map, tagging, cache rules: `testing.md` § "Design assertions are a dimension, not a lane".

<!-- bkit:end -->
