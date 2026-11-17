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

## Visual palette

bkit has no UI. Its visuals are the README images and the Mermaid diagrams, and both draw from one palette. Its values follow GitHub's Primer colours, so the images sit naturally on a GitHub page in either theme.

- `THEMES` in `scripts/readme/readme-art.mjs` defines the tokens. That object and this table must agree; change both in the same commit.
- Each workflow phase owns one colour (design, plan, build, debug, ship). Use that colour wherever the visual stands for that phase.
- Debug red means failure, and gate amber means a check that stops the run or a warning. Do not use either as a plain decoration colour.
- The values are transcribed from `readme-art.mjs` and have not yet been confirmed as intended.

<!-- prettier-ignore -->
| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `bg` | `#ffffff` | `#0d1117` | Page background |
| `surface` | `#f6f8fa` | `#151b23` | Card and tile fill |
| `border` | `#d0d7de` | `#3d444d` | Card outline, divider |
| `text` | `#1f2328` | `#f0f6fc` | Headings and body text |
| `muted` | `#59636e` | `#9198a1` | Secondary text, captions, the footer |
| `design` | `#8250df` | `#ab7df8` | The design phase; the README badge |
| `plan` | `#0969da` | `#4493f8` | The plan phase |
| `build` | `#1a7f37` | `#3fb950` | The build phase |
| `debug` | `#cf222e` | `#f85149` | The debug phase, failures |
| `ship` | `#0a7b83` | `#39c5cf` | The ship phase |
| `gate` | `#bf8700` | `#d29922` | Gates, warnings |
| `gateInk` | `#ffffff` | `#0d1117` | Text on a `gate` fill |
| `ok` | `#1a7f37` | `#3fb950` | A passed check (same values as `build`) |
| `lime` | `#7a9a0e` | `#a8c93a` | The midpoint of the `gate` → `build` gradient |
| Inactive grey | `#afb8c1` | `#484f58` | Bar segments that are not the subject (the token and re-reading charts) |

### Mermaid diagrams

A Mermaid diagram on GitHub takes one hex per colour for both themes, so `scripts/graphify/bkit-graphify-rollup.py` uses only light values, each at least 3:1 against both `bg` values. A box fill is its outline colour at low alpha, so it tints whichever background the theme draws and the theme's own text stays readable on it.

- Colour belongs to the top-level groups. A group's outline and every box inside it share one colour, so the colour shows where a box lives. A box in no group is grey.
- A chart with only one top-level group draws that group grey and gives each box its own colour, because one colour across the whole chart tells the reader nothing.
- A group keeps its colour from run to run, because the colour is picked from the group's key.
- Arrows are grey, and their width carries the weight.
- The four phase colours mark groups. `debug` red and `gate` amber mark findings, so neither is ever a group colour.
- Red means an open finding, and only that. A red box is always dashed, so the meaning survives without colour.
- Amber means a finding somebody has accepted, held to a fixed count. Its box is solid, never dashed.

<!-- prettier-ignore -->
| Diagram element | Token (light value) | Drawing |
| --- | --- | --- |
| Top-level group | `design`, `plan`, `build`, `ship` | 2px outline, 4% fill |
| Nested group | Its top-level group's colour | 1px outline, transparent fill |
| Part box | Its top-level group's colour, or `muted` when in no group; its own colour when the chart has one top-level group | 2px outline, 8% fill |
| Drift box (`split`, `bypassed`, `gap`, `dead`) | `debug` | 4px dashed outline, one dash pattern per status, 15% fill |
| Budgeted box | `gate` | 3px solid outline, 15% fill: accepted, and held to a count by the gate |
| Arrow | `muted` | Grey. Width 2, 3 or 6px for the light, middle and heavy third of the chart's weights; the lighter two are also fainter |
| Arrowhead | Theme line colour | Scaled 1.8x by `themeCSS` in the diagram's front matter, to match the thicker lines |
