# Noise

> Example document. `bkit install` does not write this file and does not overwrite a copy. Copy it to `docs/noise.md` and add its row to `.agents/docs.md` `## Project Documents`.

> [!CAUTION]
> **Purpose:** The registry of intentional signal downgrades (log-level reductions, error-tracker issue archives / mutes, alert-threshold raises), each with its trigger and rationale.
>
> **Rules:**
>
> - Follow `.bkit/authoring.md` § All Agent-Read Files and § Docs when you edit this file.
> - This file is append-only.
> - Add one entry per downgraded file / line, archived issue or raised threshold.
> - Downgrade a signal only when its trigger is known / expected.
> - Record the trigger, not just the verdict.
> - Never silence a signal at its source. Log it at a lower level instead.
> - Archive or mute an issue only when it is captured here.

## Project entries

Replace this section with one entry per downgraded signal. Each entry names the file or issue, the trigger and the reason.
