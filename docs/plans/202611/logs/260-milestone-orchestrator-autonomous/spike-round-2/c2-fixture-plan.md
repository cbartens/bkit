# Plan: fix add so it adds

## Acceptance Scenario

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| add returns the sum | Unit | `test/add.test.js` | 1 |

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| add sums | `src/add.js` | `grep -rn add src` | `src/add.js` — subtracts | EXTEND | fix the operator |

## Agent Execution Runbook

<!-- bkit:group 1 start -->

### TASK GROUP 1: add sums

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Make `add` return the sum
  - **UPDATE:** `add` in `src/add.js`: return `a + b`
  - **DONE WHEN:** `add(2, 3)` returns 5
  - **TEST FIRST:**
    - `test/add.test.js` `add returns the sum` fails on `add` subtracting

<!-- bkit:task 1 end -->

<!-- bkit:group 1 end -->
