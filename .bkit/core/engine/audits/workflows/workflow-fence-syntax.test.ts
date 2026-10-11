// Every fenced shell block in `.bkit/core/workflows/*.md` parses under `bash -n` and
// `zsh -n`: the host shell is not guaranteed bash. `{PLACEHOLDER}`s are replaced
// first, as the orchestrator would substitute them. The zsh half is skipped where zsh
// is not installed.

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterAll, describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../../../../..");
const WORKFLOWS = path.join(REPO_ROOT, ".bkit", "core", "workflows");
const SHELL_FENCES = new Set(["bash", "sh", "zsh", "shell"]);

interface Fence {
  file: string;
  line: number;
  body: string;
}

/**
 * The shell fences of one workflow, de-indented, placeholders replaced. A fence opened
 * with N backticks closes only on a line of N or more, so a literal block nested in a
 * longer outer fence is never read as a fence of its own.
 */
function shellFences(file: string, text: string): Fence[] {
  const lines = text.split("\n");
  const fences: Fence[] = [];
  let i = 0;
  while (i < lines.length) {
    const open = /^(\s*)(`{3,})\s*([A-Za-z0-9_+-]*)\s*$/.exec(lines[i]!);
    if (!open) {
      i += 1;
      continue;
    }
    const indent = open[1] ?? "";
    const ticks = open[2] ?? "```";
    const lang = (open[3] ?? "").toLowerCase();
    const body: string[] = [];
    let j = i + 1;
    for (; j < lines.length; j++) {
      const close = /^\s*(`{3,})\s*$/.exec(lines[j]!);
      if (close && close[1]!.length >= ticks.length) break;
      body.push(lines[j]!);
    }
    if (SHELL_FENCES.has(lang)) {
      const script = body
        .map((l) => (l.startsWith(indent) ? l.slice(indent.length) : l))
        .join("\n")
        .replace(/\{[A-Za-z][A-Za-z0-9_.-]*\}/g, "DUMMY");
      fences.push({ file, line: i + 1, body: `${script}\n` });
    }
    i = j + 1;
  }
  return fences;
}

const hasShell = (shell: string) => spawnSync(shell, ["-c", "exit 0"]).status === 0;

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-fence-syntax-"));
afterAll(() => fs.rmSync(dir, { recursive: true, force: true }));

const fences = fs
  .readdirSync(WORKFLOWS)
  .filter((f) => /^bkit-.*\.md$/.test(f))
  .sort()
  .flatMap((f) => shellFences(f, fs.readFileSync(path.join(WORKFLOWS, f), "utf-8")));

/** `<shell> -n` over every fence; one line per fence that does not parse. */
function syntaxErrors(shell: string): string[] {
  return fences.flatMap((fence) => {
    const script = path.join(dir, `${fence.file}-${fence.line}.sh`);
    fs.writeFileSync(script, fence.body);
    const r = spawnSync(shell, ["-n", script], { encoding: "utf-8" });
    return r.status === 0 ? [] : [`${fence.file}:${fence.line}: ${r.stderr.trim()}`];
  });
}

describe("workflow shell fences", () => {
  it("finds the fences: every phase workflow has some", () => {
    const files = new Set(fences.map((f) => f.file));
    for (const w of ["auto", "build", "debug", "design", "plan", "ship"]) {
      expect(files.has(`bkit-${w}.md`), w).toBe(true);
    }
  });

  it("de-indents a list-nested fence and replaces placeholders", () => {
    const [fence] = shellFences("x.md", '1. Run:\n   ```bash\n   echo "{FID}"\n   ```\n');
    expect(fence).toEqual({ file: "x.md", line: 2, body: 'echo "DUMMY"\n' });
  });

  it("every fence parses under bash -n", { timeout: 60_000 }, () => {
    expect(syntaxErrors("bash")).toEqual([]);
  });

  it.skipIf(!hasShell("zsh"))("every fence parses under zsh -n", { timeout: 60_000 }, () => {
    expect(syntaxErrors("zsh")).toEqual([]);
  });
});
