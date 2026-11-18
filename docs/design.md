# Design

> [!CAUTION]
> **Purpose:** How bkit's README artwork and generated capability diagrams use colour, type, layout and accessibility cues. The CLI has no application UI.
>
> **Rules:**
>
> - Follow `.bkit/authoring.md` § All Agent-Read Files and § Docs when you edit this file.
> - Record each palette value in § Machine-checked reference. Mark values transcribed from code until a human confirms them.
>
> **bkit practice:** Keep the § Machine-checked reference heading and its two rules. The gates audit and CI template cite it.
>
> **Not here:** [Testing](testing.md#design-assertions-are-a-dimension-not-a-lane) covers design assertions. [Technology](technology.md) records the tools. [Components](components.md) records product responsibilities.
>
> **Update when:** A visual role, theme, font, layout convention or accessibility rule changes.

## Tokens

The README generator defines the light and dark GitHub-style palettes in `THEMES`. Each key names a role or a workflow phase. The Mermaid generator uses the light palette for both GitHub themes and adds transparency for fills. [README artwork](../scripts/readme/readme-art.mjs) · [Capability diagrams](../scripts/graphify/bkit-graphify-rollup.py)

The knowledge-flow illustration defines five more phase fills directly in its SVG pair. [Light artwork](../.github/assets/bkit-knowledge-flow-light.svg) · [Dark artwork](../.github/assets/bkit-knowledge-flow-dark.svg)

## Typography

<!-- prettier-ignore -->
| Role | Family in the SVG generator | Size and weight |
| --- | --- | --- |
| Hero wordmark and headline | `SANS`, the platform sans-serif stack | The README hero uses 96px at weight 800 for the wordmark and 34px at 700 for the headline. The social preview uses 140px and 46px at the same weights. |
| Body and captions | `SANS` | The text helper defaults to 16px at 400. Hero descriptions use 21px. Footers use 15px. |
| Terminal titles and commands | `MONO`, the platform monospace stack | A terminal title uses 14px at the card's base scale. A phase command uses 17px at 600 at that scale. |

## Spacing and layout

The README hero uses a 1200 × 340 SVG canvas with the wordmark on the left and a card on the right. The 1280 × 640 social preview adds a row of supported hosts. The README embeds the SVG at the available width. Its view box scales the whole composition together, so a narrow screen keeps the same arrangement. Card text uses fixed lines. Keep labels short enough to fit with the fallback fonts.

The shared footer repeats a 28px gap above the divider, before the footer row and below it. Figure-specific coordinates and sizes belong to each drawing. The renderer has no shared breakpoint or spacing scale.

## Components

<!-- prettier-ignore -->
| Visual element | Meaning |
| --- | --- |
| Phase dots and labels | Show the five phases in workflow order. Keep each phase's colour across diagrams and badges. |
| Terminal card | Shows a command, conversation or comparison inside the hero or social preview. |
| Person inside an amber circle | Marks a gate that needs an owner's decision. |
| Artwork footer | Pairs the licence on the left with the bkit signature and repository address on the right. |
| Mermaid group and part boxes | Show which group owns a part. A key gives each top-level group a stable phase colour. Ungrouped parts are grey. With one group, the group is grey and its parts receive separate colours. |
| Mermaid findings and arrows | Dashed red boxes mark open findings. A solid amber box marks a finding accepted at a fixed count. Grey arrow widths show the relative weight of the connection. |

## Accessibility

- README artwork supplies light and dark SVGs through `prefers-color-scheme`. The fallback image has alternative text, and each SVG has an accessible name and the `img` role. [README](../README.md) · [Detailed guide](../DETAILS.md)
- Pair colour with a label, shape or line style. In capability diagrams, each open status has its own dash pattern. An accepted finding has a solid border.
- The text contrast target is WCAG 2.1 AA. Body and muted text exceed 4.5:1 against both page and card fills in each palette. The Mermaid outlines exceed 3:1 against both page backgrounds.
- Touch targets are not applicable inside these static images. GitHub renders the surrounding links.

At each SVG's native view-box size, three labels fall below the required 4.5:1. The check compared foreground colours with rendered backgrounds under the glyphs, including tinted and translucent fills, across the 38 SVGs in `.github/assets/`. Dark variants met their size-specific text thresholds at that size.

<!-- prettier-ignore -->
| Light artwork | Label | Size and weight | Contrast |
| --- | --- | --- | --- |
| [Feature grid](../.github/assets/bkit-features-light.svg) | EVERY PHASE | 13px at 700 | 3.14:1 on the page background |
| [Knowledge flow](../.github/assets/bkit-knowledge-flow-light.svg) | `/bkit-design` | 14px at 700 | 4.38:1 on the design fill |
| [Knowledge flow](../.github/assets/bkit-knowledge-flow-light.svg) | `/bkit-ship` | 14px at 700 | 4.42:1 on the ship fill |

## Machine-checked reference

> **bkit practice:** This is the hand-maintained palette reference. Identify the table by its header. Check the SVG generator and the Mermaid renderer separately so a mismatch identifies the implementation that changed.

- **No silent gap.** Every implementation token has a row or an explicit reason for its exclusion. A missing token must fail a comparison.
- **Transcribed is not ratified.** All values below were read from the generators and await confirmation by the maintainer.

<!-- prettier-ignore -->
| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `bg` | `#ffffff` | `#0d1117` | Page background |
| `surface` | `#f6f8fa` | `#151b23` | Card and tile fill |
| `border` | `#d0d7de` | `#3d444d` | Outline and divider |
| `text` | `#1f2328` | `#f0f6fc` | Headings and body text |
| `muted` | `#59636e` | `#9198a1` | Captions, secondary text and footer |
| `design` | `#8250df` | `#ab7df8` | Design phase and supported-hosts badge |
| `plan` | `#0969da` | `#4493f8` | Plan phase |
| `build` | `#1a7f37` | `#3fb950` | Build phase |
| `debug` | `#cf222e` | `#f85149` | Debug phase and open findings |
| `ship` | `#0a7b83` | `#39c5cf` | Ship phase |
| `gate` | `#bf8700` | `#d29922` | Gates, warnings and accepted findings |
| `gateInk` | `#ffffff` | `#0d1117` | Foreground on a gate fill |
| `ok` | `#1a7f37` | `#3fb950` | Passed check |
| `lime` | `#7a9a0e` | `#a8c93a` | Midpoint of the gate-to-build gradient |
| Inactive grey | `#afb8c1` | `#484f58` | Inactive bar segments in the token and re-reading charts |
| Token chart amber | `#bf8700` | `#bb8009` | Final bar segment in the token chart |
| Knowledge-flow design fill | `#f6ebff` | `#2a1e3a` | Design phase label background |
| Knowledge-flow plan fill | `#ddf4ff` | `#0d2a4a` | Plan phase label background |
| Knowledge-flow build fill | `#dffbe6` | `#0f2d1a` | Build phase label background |
| Knowledge-flow debug fill | `#feecee` | `#2d1115` | Debug phase label background |
| Knowledge-flow ship fill | `#dcf5f6` | `#0f2a2c` | Ship phase label background |

Mermaid uses the light values above on both backgrounds. Top-level groups use a 2px outline and 4% fill. Nested groups use a 1px outline and transparent fill. Part boxes use a 2px outline and 8% fill. Open findings use a 4px dashed outline and accepted findings a 3px solid outline, both with 15% fill. The three arrow weights use 2px, 3px and 6px strokes. The two lighter strokes are also fainter. Arrowheads scale to 1.8 times GitHub's default.

## Open questions

Does the maintainer confirm the transcribed palette, including the chart-specific colours and the phase fills in the knowledge-flow illustration?
