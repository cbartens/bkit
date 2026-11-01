# bkit stats

> [!CAUTION]
> **Purpose:** This repo's workflow statistics, computed from `.bkit/stats.jsonl`, `.bkit/friction.jsonl`, `docs/deferrals.jsonl`. Workflow closes append the rows.
>
> **Rules:**
>
> - Generated — do not edit. `bkit stats` rewrites this file.

## Rows

<!-- prettier-ignore -->
| Kind | Rows |
| --- | --- |
| deferral | 158 |
| compliance | 71 |
| counter | 40 |
| outcome | 35 |
| friction | 16 |

<!-- prettier-ignore -->
| Workflow | Rows |
| --- | --- |
| plan | 88 |
| utility | 81 |
| design | 49 |
| build | 46 |
| ship | 41 |
| migrate | 13 |
| unknown | 2 |

## Run durations

<!-- prettier-ignore -->
| Runs | Mean (min) | Median (min) | Min (min) | Max (min) |
| --- | --- | --- | --- | --- |
| 35 | 427.5 | 226.7 | 17.4 | 1305 |

## Change size vs failures

A run counts as an error when it added failures. Dispatch-size threshold: 0 lines added.

<!-- prettier-ignore -->
| Lines added | Runs | Errors | Error rate |
| --- | --- | --- | --- |
| XS (0–49) | 10 | 6 | 60.0% |
| S (50–199) | 1 | 0 | 0.0% |
| M (200–499) | 2 | 1 | 50.0% |
| L (500–999) | 2 | 1 | 50.0% |
| XL (1000+) | 20 | 12 | 60.0% |

Attempt counters: 32 counted by the shell (trusted), 3 reported by the model (untrusted).

## Build challenge size

Small changes (under 300 lines and 10 files) run the security reviewer alone.

<!-- prettier-ignore -->
| Runs | Small (challenge-1 skipped) | Large |
| --- | --- | --- |
| 3 | 0 | 3 |

## Agent context peaks

Cap: 160000 tokens per agent. 5 of 35 runs recorded context.

<!-- prettier-ignore -->
| Agent type | Subagents | Runs | Peak (tokens) | Runs over cap |
| --- | --- | --- | --- | --- |
| bkit-plan-generate | 3 | 3 | 267072 | 3 |
| bkit-plan-review-2 | 3 | 3 | 264790 | 3 |
| bkit-plan-update | 3 | 3 | 261700 | 3 |
| bkit-plan-review-1 | 3 | 3 | 255726 | 2 |
| bkit-design-generate | 1 | 1 | 215073 | 1 |
| bkit-plan-scope-check | 3 | 3 | 191657 | 2 |
| bkit-ship-deferred-sweep | 1 | 1 | 186233 | 1 |
| bkit-design-review-1 | 1 | 1 | 176188 | 1 |
| bkit-design-spike | 1 | 1 | 141836 | 0 |
| bkit-design-brainstorm-ideate-3 | 1 | 1 | 136612 | 0 |
| bkit-design-brainstorm-ideate-1 | 1 | 1 | 114516 | 0 |
| bkit-design-update | 1 | 1 | 102920 | 0 |
| bkit-design-organise | 1 | 1 | 79463 | 0 |
| bkit-ship-update-docs | 1 | 1 | 64303 | 0 |
| bkit-design-review-2 | 1 | 1 | 60344 | 0 |
| bkit-design-brainstorm-ideate-2 | 1 | 1 | 36541 | 0 |

## Compliance by rule

<!-- prettier-ignore -->
| Rule | Pass | Fail | n/a | Pass rate |
| --- | --- | --- | --- | --- |
| skip-ci-not-head | 36 | 0 | 0 | 100.0% |
| no-mirror-edit | 28 | 7 | 0 | 80.0% |

## Compliance by bkit version

<!-- prettier-ignore -->
| Version | Runs | Pass rate |
| --- | --- | --- |
| 4.1.4 | 1 | 100.0% |
| 4.8.0 | 6 | 100.0% |
| 4.10.0 | 18 | 94.4% |
| 4.12.0 | 6 | 66.7% |
| 5.0.2 | 2 | 100.0% |
| 5.0.3 | 2 | 100.0% |
| 5.5.0 | 4 | 100.0% |
| 5.5.1 | 2 | 100.0% |
| 6.0.0 | 30 | 86.7% |

## Deferral discipline

Deferrals adjudicated unjustified, by the writer that deferred.

<!-- prettier-ignore -->
| Writer | Model | Deferrals | Unjustified | Rate | Reasons |
| --- | --- | --- | --- | --- | --- |
| utility (orchestrator) | claude-opus-5-5 | 49 | 3 | 6.1% | hard-blocked=4 needs-decision=6 own-cycle=9 scope-declared=27 unjustified=3 |
| bkit-ship-deferred-sweep | deepseek/deepseek-v4.1-flash | 1 | 1 | 100.0% | unjustified=1 |
| unattributed | claude-opus-5 | 2 | 1 | 50.0% | own-cycle=1 unjustified=1 |
| bkit-utility-update-deferrals | claude-opus-5-5 | 23 | 0 | 0.0% | hard-blocked=3 low-severity=5 needs-decision=6 own-cycle=3 scope-declared=6 |
| bkit-plan-generate | claude-opus-5-5 | 20 | 0 | 0.0% | own-cycle=1 scope-declared=19 |
| migrate (orchestrator) | unknown | 13 | 0 | 0.0% | unspecified=13 |
| build (orchestrator) | unknown | 12 | 0 | 0.0% | low-severity=12 |
| bkit-design-generate | deepseek/deepseek-v4.1-flash | 9 | 0 | 0.0% | scope-declared=9 |
| utility (orchestrator) | unknown | 9 | 0 | 0.0% | hard-blocked=1 needs-decision=2 own-cycle=3 scope-declared=3 |
| design (orchestrator) | claude-opus-4-8 | 4 | 0 | 0.0% | unspecified=4 |
| bkit-plan-generate | deepseek-v4.1-flash | 3 | 0 | 0.0% | scope-declared=3 |
| bkit-plan-update | claude-opus-5-5 | 3 | 0 | 0.0% | hard-blocked=1 needs-decision=1 scope-declared=1 |
| bkit-plan-update | deepseek/deepseek-v4.1-flash | 3 | 0 | 0.0% | scope-declared=3 |
| bkit-design-generate | moonshotai/kimi-k3 | 1 | 0 | 0.0% | scope-declared=1 |
| bkit-design-generate | claude-opus-5-5 | 1 | 0 | 0.0% | hard-blocked=1 |
| bkit-plan-generate | claude-opus-4-8 | 1 | 0 | 0.0% | unspecified=1 |
| bkit-plan-generate | deepseek/deepseek-v4.1-flash | 1 | 0 | 0.0% | scope-declared=1 |
| bkit-plan-review-apply | claude-opus-4-8 | 1 | 0 | 0.0% | unspecified=1 |
| bkit-plan-update | deepseek-v4.1-flash | 1 | 0 | 0.0% | own-cycle=1 |
| ship (orchestrator) | unknown | 1 | 0 | 0.0% | needs-decision=1 |
