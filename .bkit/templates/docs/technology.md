> Starter document. `bkit install` does not write this file and does not overwrite a copy. Copy it to `docs/technology.md`, fill it in, then delete this introduction.
>
> **Fill these first:** `docs/components.md`.
>
> **Finish against:** none.
>
> **Where the facts come from:** the package manifests and lockfiles, the build and tool configuration files, the CI configuration and the lint and format settings.
>
> **Fill in:**
>
> 1. Copy this starter to `docs/technology.md`.
> 2. List every layer the components in `docs/components.md` need, and read each layer's technology from the manifest or configuration file that declares it.
> 3. Fill `## Stack` with one row per technology. In `Version from`, name the file that holds the version, and never type the number.
> 4. Fill `## Conventions` with each rule a reviewer enforces, and name the tool or review step that enforces it.
> 5. Fill `## Not used` with technologies a contributor might expect, and name what the project uses instead.
> 6. Record unresolved facts under `## Open questions`.
> 7. Add this row to the `## Project Documents` table in `.agents/docs.md`: | `docs/technology.md` | ● | ● | ○ | ○ | ○ | Which frameworks, libraries and styling systems the project uses, and the coding conventions a reviewer enforces. Why a choice was made goes in `decisions.jsonl`. |
> 8. Check the document against each completion check, then delete this introduction.
>
> **If it does not apply:** every project uses some technology. Write `Not applicable: {reason}` under a section that does not apply, such as `## Not used` for a project with no alternatives in play.
>
> **Completion checks:**
>
> - Every layer in `docs/components.md` has a row in `## Stack`.
> - Every `Version from` cell names an existing file, and no version number is typed in the document.
> - Every convention names what enforces it.
> - No example row remains.

# Technology

> [!CAUTION]
> **Purpose:** Which frameworks, libraries and styling systems the project uses, and the coding conventions a reviewer enforces. Why a choice was made goes in `decisions.jsonl`.
>
> **Rules:**
>
> - Follow `.bkit/authoring.md` § Docs when you edit this file.
> - Name the file that holds a version, and never type a version number.
> - List each technology once, with how it is used.
>
> **Not here:** The reason for a choice goes in `decisions.jsonl`. Service boundaries and deployment topology go in `docs/architecture.md`. Setup commands go in `docs/setup.md`.
>
> **Update when:** A framework, library or styling system is added, replaced or removed, or a convention a reviewer enforces changes.

## Stack

<!-- prettier-ignore -->
| Layer | Technology | Version from | Chosen for |
| --- | --- | --- | --- |
| [Layer] | [Technology] | [File that holds the version.] | [What it is used for.] |
| [e.g., Web interface] | A component framework | The package manifest. | Rendering the report screens. |

## Conventions

<!-- prettier-ignore -->
| Convention | Rule | Enforced by |
| --- | --- | --- |
| [Convention] | [What a contributor does.] | [Tool or review step.] |
| [e.g., Formatting] | One formatter settings file for the whole repository. | The formatter check in CI. |

## Not used

<!-- prettier-ignore -->
| Technology | Use instead |
| --- | --- |
| [Technology a contributor might expect] | [What the project uses.] |
| [e.g., A second test runner] | The project's one test runner. |

## Open questions

[Each unresolved fact, who can answer it and which section it affects.]
