> Starter document. `bkit install` does not write this file and does not overwrite a copy. Copy it to `docs/design.md`, fill it in, then delete this introduction.
>
> **Fill these first:** `docs/components.md`.
>
> **Finish against:** `docs/technology.md`, once it names the styling tool; the token table in `## Tokens` waits for it.
>
> **Where the facts come from:** the stylesheet variables and theme files, the rendered style guide or design files, the user interface components in the repository and the accessibility settings.
>
> **Fill in:**
>
> 1. Copy this starter to `docs/design.md`.
> 2. **If** the project has no user interface → write `Not applicable: no user interface` under the title, keep the rules box, and go to step 9.
> 3. Fill `## Tokens` with one row per colour, spacing and sizing variable, read from the implementation.
> 4. Fill `## Typography` with the font families, sizes and weights in use.
> 5. Fill `## Spacing and layout` with the scale, breakpoints and layout rules.
> 6. Fill `## Components` with the shared interface components and when each is used.
> 7. Confirm or change each default in `## Accessibility`.
> 8. Follow the steps in `## Machine-checked reference` for the token table the gates read, and keep its two rules.
> 9. Record unresolved facts under `## Open questions`.
> 10. Add this row to the `## Project Documents` table in `.agents/docs.md`: | `docs/design.md` | ○ | ○ | ○ | — | — | The project's design system: tokens, typography, spacing and layout, components and accessibility rules. |
> 11. Check the document against each completion check, then delete this introduction.
>
> **If it does not apply:** write `Not applicable: no user interface` under the title and delete the skeleton sections.
>
> **Completion checks:**
>
> - Every token in the implementation has a row in `## Tokens`, or an entry that says why it is undocumented.
> - Every default in `## Accessibility` is confirmed or replaced.
> - The token table in `## Machine-checked reference` has a header row and no row left as an example.
> - No example row remains.

# Design

> [!CAUTION]
> **Purpose:** The project's design system: tokens, typography, spacing and layout, components and accessibility rules.
>
> **Rules:**
>
> - Follow `.bkit/authoring.md` § Docs when you edit this file.
> - Name each token once, in the table that holds its value.
> - Mark a value read from the implementation as transcribed until a human confirms it.
>
> **bkit practice:** `## Machine-checked reference` keeps its heading and its two rules, because the gates audit and the CI workflow cite it. Sections marked **bkit practice** keep their heading text and stay separate sections. Do not rename, merge or compress them, because bkit's CI template, advisories and audits cite them by name.
>
> **Not here:** Test lanes and design assertions go in `docs/testing.md`. The styling tool and its version go in `docs/technology.md`. Component ownership goes in `docs/components.md`.
>
> **Update when:** A token, a font, a shared component or an accessibility rule is added, changed or removed.

## Tokens

[The colour, spacing and sizing variables, read from the implementation, with the light and dark value of each.]

<!-- prettier-ignore -->
| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| [Token name] | [Light value.] | [Dark value.] | [Where it is used.] |
| [e.g., Background] | The page surface colour. | The dark page surface colour. | Page surface. |

## Typography

<!-- prettier-ignore -->
| Role | Family | Size and weight | Use |
| --- | --- | --- | --- |
| [Role] | [Font family.] | [Size and weight.] | [Where it is used.] |
| [e.g., Body text] | The project's text font. | Regular, base size. | Paragraphs. |

## Spacing and layout

[The spacing scale, the breakpoints and the layout rules the interface follows.]

<!-- prettier-ignore -->
| Step | Value | Use |
| --- | --- | --- |
| [Step name] | [Value.] | [Where it is used.] |
| [e.g., Small gap] | The scale's second step. | Between a label and its field. |

## Components

<!-- prettier-ignore -->
| Component | Use it for | Do not use it for |
| --- | --- | --- |
| [Component] | [When to use it.] | [What to use instead.] |
| [e.g., Primary button] | The one main action of a screen. | A second action on the same screen. |

## Accessibility

[Each default below is a starting point. Confirm it or change it, and say why when it changes.]

- [Default: every colour comes from a theme token, with no ad-hoc hex value.]
- [Default: every colour supports a dark mode.]
- [Default: touch targets are at least 44 by 44 pixels.]
- [Default: text contrast meets WCAG 2.1 level AA.]

## Machine-checked reference

> **bkit practice:** This table is the sole hand-maintained source for token values. Nothing generates it, so changing an expected value forces a human to restate the intent in the same pull request. Keep the section heading, because the gates audit and the CI workflow cite it.

Fill it in this way:

- **Select the table by its header row**, never by "any row containing a hex", because this document may hold more than one hex table. Renaming the header renames the contract, so update the parser in the same change.
- **Assert each implementation separately** (stylesheet variables, theme object, rendered style guide), so a red names its own culprit.

Two rules survive adoption:

- **No silent gap.** Every implementation token maps to a row here, or to an explicit "intentionally undocumented" entry with a reason. A dropped token must go red, not vanish.
- **Transcribed is not ratified.** A row read out of the implementation is tautological on day one, so mark it as transcribed until a human confirms the value is intended.

Choose your own columns, then pin them, because the header row is the contract. An example shape:

<!-- prettier-ignore -->
| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| Background (`--background`) | `#FFFFFF` | `#0A0A0A` | Page surface |
| Foreground (`--foreground`) | `#181818` | `#F1EFEA` | Headings / body — 17.8:1 light, 17.2:1 dark (AAA) |
| Primary (`--primary`) | `#2563EB` | `#2563EB` | Aligned L+D — buttons / active. **Transcribed-not-ratified**: read from source, pending human confirmation |

Lane map, tagging, cache rules: `testing.md` § "Design assertions are a dimension, not a lane".

## Open questions

[Each unresolved fact, who can answer it and which section it affects.]
