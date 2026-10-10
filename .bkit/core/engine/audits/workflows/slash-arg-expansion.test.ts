/**
 * audits/workflows/slash-arg-expansion.test.ts — `.bkit/workflows/*.md` render into
 * `/bkit-*` slash commands, and the host substitutes argument placeholders into
 * the file body BEFORE the model ever sees it. `$N` is the documented shorthand
 * for `$ARGUMENTS[N]`, zero-based, so `/bkit-plan #442` rewrites every literal
 * `$0` in the file to `#442`.
 *
 * Inside an awk program, `awk '… tolower($0) …'` would become `awk '… tolower(#442) …'`.
 * `$1`, `$2` … are rewritten whenever that many arguments are passed.
 *
 * Ledger scans and lock-owner reads run inside `bkit` commands, so a workflow
 * needs no `$N` at all. When an inline awk
 * program does need a field, write `$(N)` (POSIX awk — `$` applied to a
 * parenthesised expression — with no `$`-digit sequence for any host to rewrite), not
 * the host's `\$N` escape (Claude-Code-specific; these files also render to
 * `.cursor/commands/` and `.opencode/commands/`).
 *
 * Scope is workflows only. `bkit` commands, `.bkit/scripts/*` and
 * `.github/workflows/*.yml` are executed as programs, never expanded.
 */

import * as fs from "node:fs";
import * as path from "node:path";

import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../../../../..");
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
