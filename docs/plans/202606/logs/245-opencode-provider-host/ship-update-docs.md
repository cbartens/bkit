# Ship — Docs Update (#245 opencode provider host)

FID: `245-opencode-provider-host` · Month bucket: `202606` · Merge: PR #248, squash `b7b3543`.

Post-merge doc sync for the opencode execution host. Reference docs synced to shipped
reality + cycle entry appended to the ledger. No code/implementation touched.

## Files modified

<!-- prettier-ignore -->
| File | Pass(es) | Why |
| --- | --- | --- |
| `README.md` | Sync | Removed `bkit mode` model-swap framing (removed this cycle) + dead `providers.md § Local / NVIDIA model swap` pointer; described the additive opencode host, `--opencode=<provider>` / `--cloud=claude\ | cursor\ | opencode` flags, `bkit doctor`/`bkit status`; renamed all `bkit-auto.yml` → `bkit-cloud.yml`; documented the dual-job (claude + opencode, secret-gated) cloud lane + `--cloud=opencode` remote-provider/tracker=github precondition. |
| `docs/deployments.md` | Sync, Cross-Reference | Added new § "`bkit-cloud.yml` — dual-job cloud-agent lane (#245)": claude/opencode job table, secret-gating rules (no-op not fail), `--cloud=opencode` precondition, single fanned-out provider key + GHA-injection hardening, cross-links to § GitHub Actions pinning + commit-tag taxonomy + KN-37. (The `bkit-auto.yml`→`bkit-cloud.yml` rename in §§ pinning/Renovate was already synced in-merge by `b049c9a`.) |
| `docs/testing.md` | Sync | Fixed stale provider key `--opencode=ollama` → `--opencode=ollama-local` (post-PR npm custom-provider rename) in the manual E2E recipe; noted single-local-model pin (`qwen2.5-coder:7b`), serialized fan-out under `OLLAMA_NUM_PARALLEL=1`, and `bkit doctor` Ollama memory-safety surface. (opencode host test-coverage tables were already added in-merge.) |
| `docs/completed.md` | Append | New ledger entry "opencode multi-provider execution host (Approach B) — #245 (2026-06-10)". |

## Drift resolved

- **README (largest drift):** still described the now-deleted `bkit mode` + ccr router model-swap and pointed at the deleted `.bkit/providers.md § Local / NVIDIA model swap`. README is hand-maintained (no `bkit:start/end` markers, untouched by the merge), so the install-time template sync did not reach it. Replaced with the additive-host model and corrected every `bkit-auto.yml` reference (5 sites: feature bullet, cloud-env section ×3, advisory-id table, module surface table, post-install checklist, uninstall example).
- **deployments.md:** rename was synced in-merge but the NEW dual-job _structure_ (the deployment-rule content: secret-gating semantics, `--cloud=opencode` precondition, injection hardening) was undocumented. Added as a focused section — deployments.md is the canonical home for CI/CD pipeline rules.
- **testing.md:** post-PR `ollama` → `ollama-local` rename and single-model collapse left the manual recipe stale.

## Role-separation honoured

- Incidents/lessons (KN-33..KN-38) and the ADR (DE-27, DE-26 supersession) were already written to `docs/knowledge.md` / `docs/decisions.md` in the merge — and are **excluded** from this sync by mandate. Reference docs (deployments.md/testing.md/README) carry rules + pointers only; commit-hash/PR/recurrence narrative stays in the KN/DE entries and the completed.md `Related` line.
- No Linear refs in any consumer-facing text touched.

## Pending items

Grepped `docs/pending.md` for `245` / `opencode` / `bkit mode` / `ollama` / `provider host` / `approach b` — **no matches**. Nothing to surface.

## Not modified (and why)

- `docs/knowledge.md`, `docs/decisions.md`, `docs/pending.md` — excluded by mandate.
- `.bkit/*.md` (providers.md, cloud.md, prompts.md), `.opencode/*`, templates — these are build-phase artifacts already shipped + synced in the merge; not part of the `docs/*.md` post-merge sync scope.
- `docs/architecture.md`, `docs/technology.md`, `docs/security.md` — reviewed; the host topology + GateGuard parallel-plugin facts they would carry are already covered by the shipped `.bkit/providers.md` canonical home + DE-27; no `docs/`-level drift introduced.
