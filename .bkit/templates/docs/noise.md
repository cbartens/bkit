> Starter document. `bkit install` does not write this file and does not overwrite a copy. Copy it to `docs/noise.md`, fill it in, then delete this introduction.
>
> **Fill these first:** `docs/observability.md`.
>
> **Finish against:** none.
>
> **Where the facts come from:** the log-level changes in the code, the error tracker's archived and muted issues, and the alert rules whose thresholds were raised.
>
> **Fill in:**
>
> 1. Copy this starter to `docs/noise.md`. The table starts empty, because the file is append-only.
> 2. Add one row for each signal already downgraded: a log-level reduction, an archived or muted error-tracker issue or a raised alert threshold.
> 3. Add a row in the same change as every later downgrade, before the signal goes quiet.
> 4. Record unresolved facts under `## Open questions`.
> 5. Add this row to the `## Project Documents` table in `.agents/docs.md`: | `docs/noise.md` | — | — | ○ | ● | ○ | Intentional signal downgrades: log levels, error-tracker archives and mutes, and alert thresholds, each with its trigger and reason. |
> 6. Check the document against each completion check, then delete this introduction.
>
> **If it does not apply:** a project with no downgraded signal keeps the empty table.
>
> **Completion checks:**
>
> - Every downgraded signal has one row with a trigger and a reason it is safe.
> - Every row names the signal in the way `docs/observability.md` § Signals names it.
> - No example row remains.

# Noise

> [!CAUTION]
> **Purpose:** Intentional signal downgrades: log levels, error-tracker archives and mutes, and alert thresholds, each with its trigger and reason.
>
> **Rules:**
>
> - Follow `.bkit/authoring.md` § Docs when you edit this file.
> - This file is append-only.
> - Add one row per downgraded file or line, archived issue or raised threshold.
> - Downgrade a signal only when its trigger is known and expected.
> - Record the trigger, not just the verdict.
> - Never silence a signal at its source. Log it at a lower level instead.
> - Archive or mute an issue only when it is recorded here.
>
> **Not here:** The signals themselves and the alerts go in `docs/observability.md`.
>
> **Update when:** A signal is downgraded, or a recheck condition in a row is met.

## Downgrades

[One row per downgraded signal, added at the bottom.]

<!-- prettier-ignore -->
| Date | Signal | Where | Change | Trigger | Why it is safe | Recheck when |
| --- | --- | --- | --- | --- | --- | --- |

## Open questions

[Each unresolved fact, who can answer it and which section it affects.]
