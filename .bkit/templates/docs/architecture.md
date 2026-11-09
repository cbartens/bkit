# Architecture

> Example document. `bkit install` does not write this file and does not overwrite a copy. Copy it to `docs/architecture.md` and add its row to `.agents/docs.md` `## Project Documents`.

> [!CAUTION]
> **Purpose:** The system design: service boundaries, deployment topology and an integration sketch.
>
> **Rules:**
>
> - Follow `.bkit/authoring.md` § All Agent-Read Files and § Docs when you edit this file.
> - Hold topology and boundaries only. Operational rules and library lists go in the domain docs.
> - Update this file when a package is added or removed, or a boundary shifts.

## Project facts to record

Replace this section with the project's own content. Cite the repository evidence for each fact (a path, a config file, a CI job).

- Services, packages or apps, and what each one owns.
- Boundaries and who may call whom.
- Deployment topology: where each part runs.
- An integration sketch: the main data flows between parts.
