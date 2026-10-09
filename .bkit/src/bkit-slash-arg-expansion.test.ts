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
 * The ledger scans and lock-owner reads that used awk field references now run
 * inside `bkit` commands, so a workflow needs no `$N` at all. When an inline awk
 * program does need a field, write `$(N)` (POSIX awk — `$` applied to a
 * parenthesised expression — with no `$`-digit sequence for any host to rewrite),
 * not the host's `\$N` escape: the backslash escape is Claude-Code-specific, and
 * these same files also render to `.cursor/commands/` and `.opencode/commands/`,
 * where a surviving `\$0` would reach awk as a syntax error of its own.
 *
 * Scope is workflows only. `bkit` commands, `.bkit/scripts/*` and
 * `.github/workflows/*.yml` are executed as programs, never expanded.
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
