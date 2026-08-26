/**
 * bkit-slash-arg-expansion.test.ts — `.bkit/workflows/*.md` render into
 * `/bkit-*` slash commands, and the host substitutes argument placeholders into
 * the file body BEFORE the model ever sees it. `$N` is the documented shorthand
 * for `$ARGUMENTS[N]`, zero-based, so `/bkit-plan #442` rewrites every literal
 * `$0` in the file to `#442`.
 *
 * That lands inside awk programs. `awk '… tolower($0) …'` became
 * `awk '… tolower(#442) …'`, which dies with a syntax error — and dies SILENTLY,
 * because the call site is `M=$(awk …)`: awk's exit status is discarded, `M` is
 * empty, and the step writes `None.` as though the ledger held no matches. On
 * 2026-08-26 that turned 16 matching `docs/deferrals.jsonl` rows into `None.` in
 * a plan's `related-deferrals.md`. Nothing failed; the artifact was just wrong.
 *
 * `$1`, `$2` … are the same hazard, dormant: an index with no matching argument
 * is left unchanged, so `awk '{print $2}'` survives a one-argument invocation and
 * breaks the moment a third argument is passed.
 *
 * The fix is `$(N)`, not the host's `\$N` escape. `$(0)` is POSIX awk — `$`
 * applied to a parenthesised expression — identical in behaviour and containing
 * no `$`-digit sequence for any host to rewrite. The backslash escape is
 * Claude-Code-specific, and these same files also render to `.cursor/commands/`
 * and `.opencode/commands/`, where a surviving `\$0` would reach awk as a syntax
 * error of its own.
 *
 * Scope is workflows only. `.bkit/scripts/*.sh` and `.github/workflows/*.yml`
 * are executed as files, never expanded, and their `$1` is a genuine positional
 * parameter. Shell functions taking arguments belong in those scripts — `$(1)`
 * is command substitution in bash, so the workaround does NOT carry over.
 */

import * as fs from "node:fs";
import * as path from "node:path";

import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../..");
const WORKFLOW_DIR = ".bkit/workflows";

/** Every placeholder the host rewrites: `$0`–`$9`, `$ARGUMENTS`, `$ARGUMENTS[N]`. */
const EXPANDED_PLACEHOLDER = /\$(?:[0-9]|ARGUMENTS\b)/g;

function workflowFiles(): string[] {
  const abs = path.join(REPO_ROOT, WORKFLOW_DIR);
  return fs
    .readdirSync(abs)
    .filter((n) => n.endsWith(".md"))
    .sort()
    .map((n) => `${WORKFLOW_DIR}/${n}`);
}

describe("slash-command argument expansion cannot clobber workflow bash", () => {
  it("enumerates workflow files (not vacuous)", () => {
    expect(workflowFiles().length).toBeGreaterThan(5);
  });

  it("no workflow contains a host-expanded argument placeholder", () => {
    const bad: string[] = [];
    for (const file of workflowFiles()) {
      fs.readFileSync(path.join(REPO_ROOT, file), "utf-8")
        .split("\n")
        .forEach((text, i) => {
          for (const m of text.matchAll(EXPANDED_PLACEHOLDER)) {
            const fix = /^\$[0-9]$/.test(m[0]) ? ` — write \`$(${m[0].slice(1)})\`` : "";
            bad.push(`${file}:${i + 1}: ${m[0]} is substituted before the model reads it${fix}`);
          }
        });
    }
    expect(bad).toEqual([]);
  });
});

describe("awk field references survive the rewrite", () => {
  /**
   * The rewrite is only safe if `$(N)` is what the shipped programs actually use.
   * A regression that reintroduces `$0` would be caught above; this catches the
   * opposite slip — a workflow that drops the field reference entirely while
   * chasing the placeholder rule, leaving `tolower()` or `{print}`.
   */
  it("the ledger scan still reads whole lines", () => {
    const plan = fs.readFileSync(path.join(REPO_ROOT, `${WORKFLOW_DIR}/bkit-plan.md`), "utf-8");
    expect(plan.match(/tolower\(\$\(0\)\)/g)?.length).toBe(2);
    expect(plan.match(/printf "%d\\t%d\\t%s\\n", c, NR, \$\(0\)/g)?.length).toBe(2);
  });

  it("every lock-owner read still selects the second field", () => {
    const withLock = workflowFiles().filter((f) =>
      fs.readFileSync(path.join(REPO_ROOT, f), "utf-8").includes("LOCK_WORKFLOW="),
    );
    expect(withLock.length).toBeGreaterThan(3);
    for (const file of withLock) {
      expect(
        fs.readFileSync(path.join(REPO_ROOT, file), "utf-8"),
        `${file}: lock-owner read lost its field reference`,
      ).toContain(`LOCK_WORKFLOW=$(awk '{print $(2)}' "$LOCK")`);
    }
  });
});
