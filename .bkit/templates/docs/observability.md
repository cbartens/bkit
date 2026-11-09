# Observability

> Example document. `bkit install` does not write this file and does not overwrite a copy. Copy it to `docs/observability.md` and add its row to `.agents/docs.md` `## Project Documents`.

> [!CAUTION]
> **Purpose:** The project's logging architecture, correlation tracing, telemetry pipelines and log drains.
>
> **Rules:**
>
> - Follow `.bkit/authoring.md` § All Agent-Read Files and § Docs when you edit this file.
> - NEVER log PII. Scrub sensitive fields at the source.
> - Observability never blocks business logic.

## Project facts to record

Replace this section with the project's own content.

- The structured logger and where log lines go.
- Correlation ids and how a request is traced end to end.
- Telemetry pipelines, log drains and error trackers.
- Failure-evidence fetching for `/bkit-debug` is configured in `.agents/context.md`, not here.
