# bkit stats

This repo only: `.bkit/stats.jsonl`, `.bkit/friction.jsonl`, `docs/deferrals.jsonl`. Written by `bkit stats`; workflow closes append the rows.

## Rows

<!-- prettier-ignore -->
| Kind | Rows |
| --- | --- |
| deferral | 114 |
| compliance | 41 |
| counter | 25 |
| outcome | 20 |

<!-- prettier-ignore -->
| Workflow | Rows |
| --- | --- |
| utility | 78 |
| design | 40 |
| plan | 36 |
| ship | 18 |
| build | 13 |
| migrate | 13 |
| unknown | 2 |

## Run durations

<!-- prettier-ignore -->
| Runs | Mean (min) | Median (min) | Min (min) | Max (min) |
| --- | --- | --- | --- | --- |
| 20 | 583.4 | 653.1 | 27.4 | 1305 |

## Change size vs failures

A run counts as an error when it added failures. Dispatch-size threshold: 0 lines added.

<!-- prettier-ignore -->
| Lines added | Runs | Errors | Error rate |
| --- | --- | --- | --- |
| XS (0–49) | 1 | 1 | 100.0% |
| M (200–499) | 2 | 1 | 50.0% |
| L (500–999) | 1 | 0 | 0.0% |
| XL (1000+) | 16 | 9 | 56.3% |

Attempt counters: 17 counted by the shell (trusted), 3 reported by the model (untrusted).

## Compliance by rule

<!-- prettier-ignore -->
| Rule | Pass | Fail | n/a | Pass rate |
| --- | --- | --- | --- | --- |
| skip-ci-not-head | 21 | 0 | 0 | 100.0% |
| no-mirror-edit | 17 | 3 | 0 | 85.0% |

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

## Deferral discipline

Deferrals adjudicated unjustified, by the writer that deferred.

<!-- prettier-ignore -->
| Writer | Model | Deferrals | Unjustified | Rate | Reasons |
| --- | --- | --- | --- | --- | --- |
| utility (orchestrator) | claude-opus-5-5 | 51 | 3 | 5.9% | hard-blocked=4 needs-decision=6 own-cycle=10 scope-declared=28 unjustified=3 |
| unattributed | claude-opus-5 | 2 | 1 | 50.0% | own-cycle=1 unjustified=1 |
| bkit-utility-update-deferrals | claude-opus-5-5 | 18 | 0 | 0.0% | hard-blocked=3 needs-decision=6 own-cycle=3 scope-declared=6 |
| migrate (orchestrator) | unknown | 13 | 0 | 0.0% | unspecified=13 |
| bkit-design-generate | deepseek/deepseek-v4.1-flash | 9 | 0 | 0.0% | scope-declared=9 |
| utility (orchestrator) | unknown | 9 | 0 | 0.0% | hard-blocked=1 needs-decision=2 own-cycle=3 scope-declared=3 |
| design (orchestrator) | claude-opus-4-8 | 4 | 0 | 0.0% | unspecified=4 |
| bkit-plan-generate | claude-opus-5-5 | 3 | 0 | 0.0% | scope-declared=3 |
| bkit-design-generate | moonshotai/kimi-k3 | 1 | 0 | 0.0% | scope-declared=1 |
| bkit-plan-generate | claude-opus-4-8 | 1 | 0 | 0.0% | unspecified=1 |
| bkit-plan-review-apply | claude-opus-4-8 | 1 | 0 | 0.0% | unspecified=1 |
| bkit-plan-update | claude-opus-5-5 | 1 | 0 | 0.0% | hard-blocked=1 |
| ship (orchestrator) | unknown | 1 | 0 | 0.0% | needs-decision=1 |
