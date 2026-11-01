## Owner answers

- **Question:** Open Question 11 — how `bkit tests changed` reports a `tests`-lock give-up of the gate it runs.
  - **Answer:** A
  - Decision: 724-tests-changed-lock-wait-exit-81
- **Question:** Open Question 12 — whether a `bkit tests run --file` that exits 81 on the `tests` lock appends a `test-run` status row.
  - **Answer:** A
  - Decision: 724-lock-wait-writes-no-test-run-row
- **Question:** Open Question 13 — whether bkit's `bkit:gate:changed` takes the `tests` lock.
  - **Answer:** A
  - Decision: 724-gate-changed-wrapped-in-tests-lock
