Verdict: PASS
<!-- verdict:end -->

# Build Skills Installed — FID 384-ship-bookkeeping

> Skill-gap analysis and install log for the Ship Bookkeeping build (3 sub-plans, Tasks 0–11).
> Protocol: match plan technology requirements against `.agents/skills/` folder names; install missing relevant skills; document rationale.

## Technologies Identified

Derived from the three sub-plans (`384-ship-bookkeeping-plan-1/2/3.md`):

<!-- prettier-ignore -->
| Technology | Where in plan | Coverage need |
| --- | --- | --- |
| **Bash / shell scripting** | `bkit-ship-gate.sh` (9 exit codes, `gh api` queries, `jq`, error routing), `bkit-ship-timeouts.sh` (config literals), `bkit-protect-main.sh` (literal→config refactor), PATH-shimmed `gh` stub (`tests/fixtures/gh/bin/gh`) — SP1 Tasks 1/2/4 | Shell quality patterns, linting |
| **Bats (Bash Automated Testing System)** | `tests/ship-gate.bats` (10 named cases), `tests/ship-failure-path.bats`, `tests/ship-worktree-ownership.bats`, `tests/fixtures/gh/smoke.bats` — SP1 Task 4, SP2 Task 5 | Test structure, assertions, mocking via PATH shim |
| **Vitest (TypeScript unit/integration)** | `bkit-ship-invariants.test.ts` (RED→GREEN Tier-2 invariant), `bkit-config-keys.test.ts`, `bkit-status-hole-detector.test.ts`, `bkit-dogfood-noop.integration.test.ts` — SP1 Task 3, SP2 Task 6, SP3 Task 10 | Covered by TDD skill |
| **Test-Driven Development** | RED→GREEN invariant is the plan's "central quality mechanism" (SP1 Task 3 writes RED, SP2 Task 7 turns GREEN) | Methodology |
| **Verification before completion** | Every task carries explicit Done-when checks + gate checkboxes + `diff` byte-identity + `bkit check` drift — all three SP gates | Already installed |
| **Markdown workflow editing** | 1278-line structural rewrite of `bkit-ship.md`, `workflows.md` re-sectioning, rendered mirror regeneration — SP2 Task 7/8 | Bkit-internal tooling, no external skill |
| **GitHub CLI (`gh`)** | `gh api` workflow-scoped run queries, `gh pr merge --squash --match-head-commit`, `gh workflow run`, rate-limit sampling — SP1 Task 4, SP2 Task 7 | Tool, not a skill domain |
| **JSONL ledger management** | `decisions.jsonl`, `deferrals.jsonl`, `knowledge.jsonl`, `failures.jsonl` appends — SP3 Task 9 | Bkit-internal format |
| **Template mirroring / byte-identity** | root ↔ template pairs enforced via `diff` + `bkit-dogfood-noop.integration.test.ts` + `bkit check` — SP1 Tasks 1/4, SP2 Task 6 | Bkit-internal mechanics |

## Already Installed

`.agents/skills/` folder names (15, pre-install) — verified via `ls`:

<!-- prettier-ignore -->
| Folder | Relevance to this build |
| --- | --- |
| `brainstorming` | — (design phase) |
| `dispatching-parallel-agents` | — (orchestration) |
| `executing-plans` | ● (plan execution methodology) |
| `find-skills` | ● (skill discovery — used this session) |
| `finishing-a-development-branch` | — (merge/PR phase) |
| `receiving-code-review` | — (post-build review) |
| `requesting-code-review` | — (post-build review) |
| `subagent-driven-development` | ○ (parallel task dispatch) |
| `systematic-debugging` | ● (Failure Path hardening, SP2 Task 5) |
| `test-driven-development` | ● (RED→GREEN Tier-2 invariant, SP1 Task 3) |
| `using-git-worktrees` | ○ (worktree already provisioned) |
| `using-superpowers` | ● (skill loading protocol) |
| `verification-before-completion` | ● (gate checkboxes, Done-when checks) |
| `writing-plans` | — (plan phase) |
| `writing-skills` | — (meta) |

## Newly Installed

Searched the skills catalog (`npx skills find`) for the two technology gaps; selected the top-relevance, highest-install match for each (both from `wshobson/agents` — the same package the catalog references):

<!-- prettier-ignore -->
| Skill | Package | Installs | Security | Rationale |
| --- | --- | --- | --- | --- |
| `bats-testing-patterns` | `wshobson/agents@bats-testing-patterns` | 8.1K | Safe / 0 alerts / Low Risk | SP1 Task 4 mandates 10 named bats cases (`tests/ship-gate.bats`) covering exit codes 0/10–16/20 against fixture-dispatched `gh` stubs; SP2 Task 5 adds `ship-failure-path.bats` + `ship-worktree-ownership.bats`. The PATH-shim idiom (`bkit-runtime.bats:44-58`) is extended with fixture-file dispatch — a non-trivial bats pattern this skill covers. |
| `shellcheck-configuration` | `wshobson/agents@shellcheck-configuration` | 8.5K | Safe / 0 alerts / Low Risk | `bkit-ship-gate.sh` is a new complex shell script: 9 distinct exit codes, workflow-scoped `gh api` queries, `jq` config reads, stderr diagnostics behind `[bkit-ship-gate]` prefix, override handling. SP2 Task 5 removes six `2>/dev/null \|\| true` silencings — ShellCheck catches that class of error-swallowing. Script quality is a gate-acceptance criterion (SP1 Gate: no bolt-on). |

**Verification on disk:** both folders present at `.agents/skills/bats-testing-patterns/` and `.agents/skills/shellcheck-configuration/` (each carries `SKILL.md` + `references/`). Total `.agents/skills/` folders: 17 (was 15).

## Not Found

None. Every load-bearing technology in the build maps to either an installed skill or a bkit-internal mechanism that does not have (or need) an external skill:

- **Vitest** — no standalone skill exists in the catalog, but the TDD methodology (`test-driven-development`, already installed) plus the plan's explicit RED→GREEN contract fully covers the vitest usage. The vitest API surface needed (`stripFencedBlocks` reuse, markdown parsing assertions) is project-specific, not generalisable skill material.
- **Markdown workflow editing / template mirroring / JSONL ledgers** — bkit-internal tooling governed by `.agents/docs.md` + `.bkit/jsonl.md` + the `bkit install`/`bkit check` engine. No external skill adds value; the plan's own Done-when checks and gate checkboxes are the verification mechanism.
- **GitHub CLI (`gh`)** — a CLI tool, not a skill domain. The plan specifies exact `gh api` endpoints and flags; no pattern library needed.

## Verdict

All load-bearing build technologies are covered:

- **Shell scripting quality** → `shellcheck-configuration` (newly installed) + `verification-before-completion` (installed).
- **Bats testing** → `bats-testing-patterns` (newly installed).
- **TDD / RED→GREEN** → `test-driven-development` (installed).
- **Debugging** → `systematic-debugging` (installed).
- **Plan execution / verification** → `executing-plans` + `verification-before-completion` (installed).

2 skills newly installed; 5 relevant skills confirmed already present; 0 gaps remain. No scope expansion — no skills installed beyond what the build tasks directly require.

<!-- verdict:end -->
