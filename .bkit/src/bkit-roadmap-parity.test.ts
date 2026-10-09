/**
 * bkit-roadmap-parity.test.ts — `bkit roadmap fold` writes the board
 * `bkit_roadmap_fold` writes, while both exist.
 *
 * Each fixture (ledger + current board) is copied twice; the script folds one,
 * the command the other, and the boards must match byte for byte apart from the
 * `_(refreshed …)_` wall-clock line. Retire with bkit-roadmap-fold.sh.
 */

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterAll, describe, expect, it } from "vitest";

import { runCommand } from "./commands/lib";
import { MARKERS as M, roadmapCommand } from "./commands/workflow/roadmap";

const SCRIPT = path.resolve(__dirname, "../templates/.bkit/scripts/bkit-roadmap-fold.sh");
const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-roadmap-parity-")));
afterAll(() => fs.rmSync(dir, { recursive: true, force: true }));

const row = (ts: number, key: string, status: string, extra: Record<string, unknown> = {}) =>
  JSON.stringify({
    ts,
    kind: "feature",
    repo: "x/y",
    key,
    summary: `${key} title`,
    status,
    ...extra,
  });

const LEDGER = [
  row(1, "412-export-csv", "DESIGNED"),
  row(2, "412-export-csv", "BUILT"),
  row(3, "418-rate-limit", "PLANNED"),
  row(4, "420-debugged", "DEBUGGED"),
  row(5, "401-login", "SHIPPED"),
  row(6, "402-dropped", "ABANDONED"),
  row(7, "430-no-summary", "DESIGNED", { summary: null }),
  row(8, "431-empty-summary", "DESIGNED", { summary: "" }),
  row(9, "432-tie", "DESIGNED"),
  row(9, "432-tie", "PLANNED"),
  ...Array.from({ length: 12 }, (_, i) =>
    row(100 + i, `s-${i}`, "SHIPPED", i % 3 ? {} : { shippedAt: i }),
  ),
].join("\n");

const FIXTURES: Record<string, { ledger?: string; board?: string }> = {
  bootstrap: {},
  "bootstrap with ledger": { ledger: LEDGER },
  "empty ledger file": { ledger: "" },
  "hand-authored board": { ledger: LEDGER, board: "\n\n# Mine\n\n- a\n- b\n\n\n" },
  "empty board file": { board: "" },
  "mangled pair": { ledger: LEDGER, board: `# R\n\nKEEP\n\n${M.statusStart}\nstale\n\n` },
  "head, notes, analysis and tail": {
    ledger: LEDGER,
    board: [
      "",
      "# Title",
      "",
      "HEAD",
      "",
      M.notesPreStart,
      "",
      "PRE",
      "   ",
      "",
      M.notesPreEnd,
      M.statusStart,
      "old",
      M.statusEnd,
      M.analysisStart,
      "  ANALYSIS",
      M.analysisEnd,
      M.notesPostStart,
      "POST",
      M.notesPostEnd,
      "",
      "TAIL 1",
      "",
      "TAIL 2",
      "",
    ].join("\n"),
  },
  "whitespace-only notes and analysis": {
    board: [
      M.notesPreStart,
      "  ",
      M.notesPreEnd,
      M.analysisStart,
      "\t",
      M.analysisEnd,
      M.notesPostStart,
      "",
      M.notesPostEnd,
      "",
    ].join("\n"),
  },
  "status only, no notes markers": {
    ledger: LEDGER,
    board: `# R\n\n${M.statusStart}\nx\n${M.statusEnd}\n\n## Backlog\n\nnote\n`,
  },
  "end marker before start marker": {
    board: `top\n${M.statusEnd}\nmiddle\n${M.statusStart}\nbottom\n`,
  },
  "no final newline": {
    ledger: LEDGER,
    board: `# R\n${M.notesPostStart}\nP\n${M.notesPostEnd}\nafter`,
  },
};

function seed(root: string, f: { ledger?: string; board?: string }) {
  fs.mkdirSync(path.join(root, "docs"), { recursive: true });
  fs.mkdirSync(path.join(root, ".bkit"), { recursive: true });
  if (f.ledger !== undefined)
    fs.writeFileSync(path.join(root, ".bkit/issues.jsonl"), f.ledger ? `${f.ledger}\n` : "");
  if (f.board !== undefined) fs.writeFileSync(path.join(root, "docs/roadmap.md"), f.board);
}

const unstamped = (root: string) =>
  fs
    .readFileSync(path.join(root, "docs/roadmap.md"), "utf-8")
    .replace(/^_\(refreshed .*\)_$/m, "_(refreshed)_");

describe("bkit_roadmap_fold = bkit roadmap fold", () => {
  const cases = Object.entries(FIXTURES).map(([name, f], i) => {
    const sh = path.join(dir, `sh-${i}`);
    const ts = path.join(dir, `ts-${i}`);
    seed(sh, f);
    seed(ts, f);
    return { name, sh, ts };
  });
  const res = spawnSync(
    "sh",
    [
      "-c",
      `. "${SCRIPT}"\n${cases.map((c) => `bkit_roadmap_fold "${c.sh}" 2>/dev/null`).join("\n")}`,
    ],
    {
      encoding: "utf-8",
    },
  );

  it("the script ran", () => {
    expect(res.status, res.stderr).toBe(0);
  });

  it.each(cases.map((c) => [c.name, c] as const))("%s", async (_, c) => {
    const code = await runCommand(["roadmap", "fold", `--root=${c.ts}`], [roadmapCommand], {
      classicVerbs: new Set(),
      io: { stdout: () => undefined, stderr: () => undefined },
    });
    expect(code).toBe(0);
    expect(unstamped(c.ts)).toBe(unstamped(c.sh));
  });
});
