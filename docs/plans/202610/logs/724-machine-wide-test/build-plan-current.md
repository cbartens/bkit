Verdict: CONCERNS
Affected: 1

<!-- verdict:end -->

# Plan Currency

## Affected Tasks

### TASK 1 — Generalise the stack lock into `bkit-machine-lock.sh` with named, machine-wide locks and distinct `run` exits

- **Class:** Reword
- **Landed change:** `.bkit/templates/scripts/ci/bkit-local-stack-lock.sh:143` gained a final FIFO read after the Perl holder exits, in `79b96cfcb` (`feat(715-retire-lite-workflows): retire lite workflows; add build publish true/false (#790)`). The current `HEAD` blob is `fc8109764b24cad5f1bd91c01bf37e8978c0904b`; the blob at `git merge-base HEAD main` is `ee750f6bfb28ba7b5c16105d7eaade6be5777511`.
- **Resolution for a re-run:** Use one explicit source revision for the frozen compatibility fixture. TASK 1 currently creates it from `HEAD`, but its `DONE WHEN` compares it with the different `main` merge-base version. Preserve the intended older-copy compatibility test and make the creation command and byte-comparison command name the same revision. The named-lock implementation approach remains executable.
