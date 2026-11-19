# Noise

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
>
> **Not here:** Signal names and alert conditions belong in `docs/observability.md` § Signals and § Alerts.
>
> **Update when:** A signal is downgraded or an existing exception is reviewed. Append the outcome.

## Downgrades

<!-- prettier-ignore -->
| Date | Signal | Where | Change | Trigger | Why it is safe | Recheck when |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-10-19 | Trivy finding | `.cursor/Dockerfile`, rule `DS-0002` | Exclude this one image finding from the scan verdict. | The cloud agent installs packages at runtime with the image's default user. | The acceptance is limited to the Cursor sandbox image. Compatibility with a non-root user is still unverified. | At the expiry in `.trivyignore.yaml` or when the sandbox user changes. |
| 2026-11-18 | Trivy finding | `.trivyignore.yaml`, rule `DS-0002` | Renew the path-specific acceptance. | The sandbox still uses the default user. | The same path and rule bound the exception. | On 2026-12-18 or when Cursor supports the non-root setup. |
| 2026-11-18 | Dependency advisory | `scripts/ci/bkit-accepted-advisories.json`, `GHSA-fc5q-39xc-vjpf` | Accept the finding until expiry. | Development tools resolve the affected picomatch dependency. | These tools read this repository's own patterns. The package runtime does not use this dependency. | On 2026-12-18, on a dependency update or if the source of patterns changes. |
| 2026-11-19 | Dependency advisory | `scripts/ci/bkit-accepted-advisories.json`, `GHSA-fc5q-39xc-vjpf` | Remove the acceptance. | GitHub withdrew the advisory on 2026-11-18, so `pnpm audit` reports no finding for picomatch. | The audit gate fails on an acceptance for an advisory it no longer reports, and fails again if the advisory returns. | No recheck is needed. |

## Open questions

None recorded.
