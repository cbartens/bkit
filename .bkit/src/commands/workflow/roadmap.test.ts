import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { runCommand } from "../lib";
import { MARKERS, project, roadmapCommand } from "./roadmap";

const dirs: string[] = [];
afterEach(() => {
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

function root() {
  const d = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-roadmap-")));
  dirs.push(d);
  fs.mkdirSync(path.join(d, "docs"));
  fs.mkdirSync(path.join(d, ".bkit"));
  return d;
}

async function fold(cwd: string, ...flags: string[]) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCommand(["roadmap", "fold", ...flags], [roadmapCommand], {
    classicVerbs: new Set(),
    cwd,
    io: { stdout: (t) => out.push(t), stderr: (t) => err.push(t) },
  });
  return { code, json: out.length ? JSON.parse(out.join("")) : undefined, err: err.join("") };
}

const feature = (ts: number, key: string, status: string, extra: Record<string, unknown> = {}) =>
  JSON.stringify({
    ts,
    kind: "feature",
    repo: "x/y",
    bkitVersion: "1",
    workflow: "w",
    step: "s",
    key,
    category: "other",
    summary: key,
    description: "d",
    status,
    ...extra,
  });
const ledger = (r: string, ...rows: string[]) =>
  fs.writeFileSync(path.join(r, ".bkit/issues.jsonl"), rows.map((l) => `${l}\n`).join(""));
const board = (r: string) => fs.readFileSync(path.join(r, "docs/roadmap.md"), "utf-8");
const lineOf = (text: string, needle: string, last = false) => {
  const ls = text.split("\n");
  return (
    (last ? ls.findLastIndex((l) => l.includes(needle)) : ls.findIndex((l) => l.includes(needle))) +
    1
  );
};
/** Text from `from` up to (not including) `to`. */
const section = (text: string, from: string, to?: string) => {
  const a = text.indexOf(from);
  const b = to ? text.indexOf(to, a) : text.length;
  return text.slice(a, b);
};
const unstamped = (text: string) => {
  expect(text.match(/^_\(refreshed /gm)).toHaveLength(1);
  return text.replace(/^_\(refreshed .*$/m, "");
};

describe("bkit roadmap fold (tests/roadmap-fold.bats)", () => {
  it("row 5: bootstrap creates docs/roadmap.md with every marker block; notes-post is last", async () => {
    const r = root();
    const res = await fold(r);
    expect(res.code).toBe(0);
    const b = board(r);
    for (const m of [
      MARKERS.statusStart,
      MARKERS.statusEnd,
      MARKERS.analysisStart,
      MARKERS.analysisEnd,
      MARKERS.notesPostStart,
    ]) {
      expect(b).toContain(m);
    }
    expect(b).not.toContain("## Backlog / Ideas");
    expect(lineOf(b, MARKERS.analysisEnd, true)).toBeLessThan(lineOf(b, MARKERS.notesPostStart));
    expect(res.err).toContain("[bkit-roadmap] bootstrapping docs/roadmap.md");
    expect(res.json).toMatchObject({ path: path.join(r, "docs/roadmap.md"), written: true });
  });

  it("row 1: projects each FID under its folded latest status", async () => {
    const r = root();
    ledger(r, feature(1, "412-export-csv", "DESIGNED", { summary: "CSV export" }));
    await fold(r);
    expect(section(board(r), "### Design", "### Plan")).toContain(
      "| 412-export-csv | CSV export | 1 |",
    );
  });

  it("row 2: deterministic, idempotent regenerate; a BUILT row survives a later fold", async () => {
    const r = root();
    ledger(r, feature(1, "412-export-csv", "DESIGNED"), feature(2, "412-export-csv", "BUILT"));
    await fold(r);
    const first = board(r);
    await fold(r);
    expect(unstamped(board(r))).toBe(unstamped(first));
    fs.appendFileSync(
      path.join(r, ".bkit/issues.jsonl"),
      `${feature(3, "418-rate-limit", "PLANNED")}\n`,
    );
    await fold(r);
    expect(section(board(r), "### Build", "### Debug")).toContain("412-export-csv");
  });

  it("row 3: SHIPPED moves to Shipped; ABANDONED hidden everywhere; a same-key append moves sections", async () => {
    const r = root();
    ledger(
      r,
      feature(1, "401-login", "DESIGNED"),
      feature(2, "401-login", "SHIPPED"),
      feature(3, "402-dropped", "DESIGNED"),
      feature(4, "402-dropped", "ABANDONED"),
    );
    const res = await fold(r);
    const b = board(r);
    expect(section(b, "### Design", "### Plan")).not.toContain("401-login");
    expect(section(b, "### Shipped")).toContain("401-login");
    expect(b).not.toContain("402-dropped");
    expect(res.json.counts).toEqual({ designed: 0, planned: 0, built: 0, debugged: 0, shipped: 1 });
  });

  it("row 4: a malformed ledger is fail-open — exit 0, logged, board never blank", async () => {
    const r = root();
    fs.writeFileSync(path.join(r, ".bkit/issues.jsonl"), "not json at all\n");
    const res = await fold(r);
    expect(res.code).toBe(0);
    expect(board(r)).toContain(MARKERS.statusStart);
    expect(res.err).toContain("[bkit-roadmap]");
    expect(res.json.malformed).toBe(1);
  });

  // jq -s fails on the first bad line, so one torn row blanked every table.
  it("row 4 (fixed): one malformed line skips only that row", async () => {
    const r = root();
    ledger(
      r,
      feature(1, "412-export-csv", "DESIGNED"),
      "{torn",
      feature(2, "418-rate-limit", "BUILT"),
    );
    await fold(r);
    expect(board(r)).toContain("412-export-csv");
    expect(board(r)).toContain("418-rate-limit");
  });

  it("row 4b: absent ledger exits 0 and bootstraps the board, saying so", async () => {
    const r = root();
    const res = await fold(r);
    expect(res.code).toBe(0);
    expect(res.err).toContain("[bkit-roadmap] .bkit/issues.jsonl absent or empty");
  });

  it("an empty ledger with plan files present points at bkit telemetry migrate", async () => {
    const r = root();
    fs.mkdirSync(path.join(r, "docs/plans/202610"), { recursive: true });
    fs.writeFileSync(path.join(r, "docs/plans/202610/1-x-design.md"), "x");
    expect((await fold(r)).err).toContain("run 'bkit telemetry migrate'");
  });

  it("row 6: consumer text above and below the marker blocks survives a regenerate", async () => {
    const r = root();
    await fold(r);
    fs.writeFileSync(
      path.join(r, "docs/roadmap.md"),
      `SCRATCH-ABOVE\n${board(r)}\nSCRATCH-BELOW\n`,
    );
    ledger(r, feature(1, "412-export-csv", "DESIGNED"));
    await fold(r);
    const b = board(r);
    expect(b).toContain("SCRATCH-ABOVE");
    expect(b).toContain("SCRATCH-BELOW");
    expect(b).not.toContain("## Backlog / Ideas");
  });

  it("notes: bootstrap brackets bkit and analysis with two notes blocks", async () => {
    const r = root();
    await fold(r);
    const b = board(r);
    const pre = lineOf(b, MARKERS.notesPreStart);
    const status = lineOf(b, MARKERS.statusStart);
    const analysis = lineOf(b, MARKERS.analysisStart);
    const post = lineOf(b, MARKERS.notesPostStart);
    expect(b).not.toContain("roadmap-notes-mid");
    expect(pre).toBeLessThan(status);
    expect(status).toBeLessThan(analysis);
    expect(analysis).toBeLessThan(post);
  });

  it("notes: a stray docs/tracker.jsonl renders no tracker block", async () => {
    const r = root();
    fs.writeFileSync(
      path.join(r, "docs/tracker.jsonl"),
      '{"ts":1,"kind":"tracker","key":"#1","title":"open issue","labels":[],"status":"Todo"}\n',
    );
    await fold(r);
    expect(board(r)).not.toContain("<!-- bkit:tracker start -->");
    expect(board(r)).not.toContain("open issue");
  });

  it("notes: user text in both notes blocks survives a regenerate exactly once", async () => {
    const r = root();
    ledger(r, feature(1, "412-export-csv", "DESIGNED"));
    await fold(r);
    const edited = board(r)
      .replace(
        /(<!-- bkit:roadmap-notes-pre start -->\n)[\s\S]*?(\n<!-- bkit:roadmap-notes-pre end -->)/,
        "$1PRE-NOTE-KEEP$2",
      )
      .replace(
        /(<!-- bkit:roadmap-notes-post start -->\n)[\s\S]*?(\n<!-- bkit:roadmap-notes-post end -->)/,
        "$1POST-NOTE-KEEP$2",
      );
    fs.writeFileSync(path.join(r, "docs/roadmap.md"), edited);
    fs.appendFileSync(
      path.join(r, ".bkit/issues.jsonl"),
      `${feature(2, "418-rate-limit", "PLANNED")}\n`,
    );
    await fold(r);
    const b = board(r);
    expect(b).toContain("418-rate-limit");
    expect(b.match(/PRE-NOTE-KEEP/g)).toHaveLength(1);
    expect(b.match(/POST-NOTE-KEEP/g)).toHaveLength(1);
    expect(lineOf(b, "PRE-NOTE-KEEP")).toBeLessThan(lineOf(b, MARKERS.statusStart));
    expect(lineOf(b, MARKERS.analysisStart)).toBeLessThan(lineOf(b, "POST-NOTE-KEEP"));
  });

  it("notes: a board without notes markers gains them, keeping head, analysis and tail", async () => {
    const r = root();
    fs.writeFileSync(
      path.join(r, "docs/roadmap.md"),
      [
        "# Roadmap",
        "",
        "HEAD-KEEP",
        "",
        MARKERS.statusStart,
        "old board",
        MARKERS.statusEnd,
        "",
        MARKERS.analysisStart,
        "ANALYSIS-KEEP",
        MARKERS.analysisEnd,
        "",
        "## Backlog / Ideas",
        "",
        "TAIL-KEEP",
        "",
      ].join("\n"),
    );
    ledger(r, feature(1, "412-export-csv", "DESIGNED"));
    expect((await fold(r)).code).toBe(0);
    const b = board(r);
    for (const s of [
      "HEAD-KEEP",
      "TAIL-KEEP",
      "ANALYSIS-KEEP",
      MARKERS.notesPreStart,
      MARKERS.notesPostStart,
      "412-export-csv",
      "## Backlog / Ideas",
    ]) {
      expect(b).toContain(s);
    }
    expect(b).not.toContain("roadmap-notes-mid");
    expect(b).not.toContain("old board");
    expect(b.match(/HEAD-KEEP/g)).toHaveLength(1);
    expect(b.match(/TAIL-KEEP/g)).toHaveLength(1);
    expect(lineOf(b, MARKERS.analysisEnd, true)).toBeLessThan(lineOf(b, MARKERS.notesPostStart));
    expect(lineOf(b, MARKERS.notesPostStart)).toBeLessThan(lineOf(b, "TAIL-KEEP"));
  });

  it("row 19: duplicate ledger lines fold to one row; a deleted board rebuilds identically", async () => {
    const r = root();
    const row = feature(2, "412-export-csv", "BUILT");
    ledger(r, row, row);
    await fold(r);
    expect(
      board(r)
        .split("\n")
        .filter((l) => l.includes("412-export-csv")),
    ).toHaveLength(1);
    const before = board(r);
    fs.rmSync(path.join(r, "docs/roadmap.md"));
    await fold(r);
    expect(unstamped(board(r))).toBe(unstamped(before));
  });

  it("row 23: Shipped caps at 10, newest first; a mid-ship FID stays in its active section", async () => {
    const r = root();
    const rows = Array.from({ length: 11 }, (_, i) =>
      feature(i + 1, `fid-${String(i + 1).padStart(2, "0")}`, "SHIPPED"),
    );
    ledger(r, ...rows, feature(100, "still-building", "BUILT"));
    await fold(r);
    const b = board(r);
    expect(b.split("\n").filter((l) => l.includes("fid-"))).toHaveLength(10);
    expect(section(b, "### Shipped")).not.toContain("fid-01");
    expect(section(b, "### Build", "### Debug")).toContain("still-building");
  });

  it("Shipped ranks on shippedAt with a ts fallback; a backfill does not evict a recent ship", async () => {
    const r = root();
    const old = Array.from({ length: 10 }, (_, i) =>
      feature(90001 + i, `old-${String(i + 1).padStart(2, "0")}`, "SHIPPED", { shippedAt: i + 1 }),
    );
    ledger(r, ...old, feature(50000, "really-recent", "SHIPPED"));
    await fold(r);
    const shipped = section(board(r), "### Shipped");
    expect(shipped).toContain("really-recent");
    expect(/really-recent|old-\d\d/.exec(shipped)![0]).toBe("really-recent");
    expect(shipped).not.toContain("old-01");
    expect(shipped).toContain("| 10 |");
  });

  it("row 25: self-heals a mangled marker pair without swallowing consumer text", async () => {
    const r = root();
    fs.writeFileSync(
      path.join(r, "docs/roadmap.md"),
      `# Roadmap\n\nCONSUMER PARAGRAPH THAT MUST SURVIVE\n\n${MARKERS.statusStart}\nstale content, end marker missing (mangled)\n`,
    );
    ledger(r, feature(1, "412-export-csv", "DESIGNED"));
    const res = await fold(r);
    expect(res.code).toBe(0);
    const b = board(r);
    expect(b).toContain("CONSUMER PARAGRAPH THAT MUST SURVIVE");
    expect(b).toContain("stale content, end marker missing (mangled)");
    expect(b).toContain("412-export-csv");
    expect(res.err).toContain("repairing mangled marker pair");
  });

  it("row 26: first fold over a hand-authored board keeps it in notes-post", async () => {
    const r = root();
    fs.writeFileSync(
      path.join(r, "docs/roadmap.md"),
      "# My Own Roadmap\n\n- ship the billing rewrite\n- decide on the queue vendor\n",
    );
    ledger(r, feature(1, "412-export-csv", "DESIGNED"));
    const res = await fold(r);
    const b = board(r);
    expect(b).toContain("ship the billing rewrite");
    expect(b).toContain("decide on the queue vendor");
    expect(b).not.toContain("## Backlog / Ideas");
    expect(lineOf(b, MARKERS.notesPostStart)).toBeLessThan(lineOf(b, "ship the billing rewrite"));
    expect(lineOf(b, MARKERS.analysisEnd, true)).toBeLessThan(lineOf(b, MARKERS.notesPostStart));
    expect(b).toContain("412-export-csv");
    expect(res.err).toContain("preserved under");
  });

  it("row 27: a board that already carries markers is NOT re-bootstrapped", async () => {
    const r = root();
    fs.writeFileSync(
      path.join(r, "docs/roadmap.md"),
      `# Roadmap\n\n${MARKERS.statusStart}\nold board\n${MARKERS.statusEnd}\n\n## Backlog / Ideas\n\nconsumer note\n`,
    );
    ledger(r, feature(1, "412-export-csv", "DESIGNED"));
    const res = await fold(r);
    expect(res.err).not.toContain("bootstrapping docs/roadmap.md");
    const b = board(r);
    expect(b).toContain("consumer note");
    expect(b).toContain("412-export-csv");
    expect(b).toContain(MARKERS.notesPostStart);
    expect(b).toContain("## Backlog / Ideas");
  });

  it("an unwritable board is fail-open: exit 0, written false", async () => {
    const r = root();
    fs.mkdirSync(path.join(r, "docs/roadmap.md"));
    const res = await fold(r);
    expect(res.code).toBe(0);
    expect(res.json.written).toBe(false);
    expect(res.err).toContain("fail-open");
  });

  it("--root points the fold at another checkout", async () => {
    const r = root();
    ledger(r, feature(1, "412-export-csv", "DESIGNED"));
    await fold(os.tmpdir(), `--root=${r}`);
    expect(board(r)).toContain("412-export-csv");
  });

  it("DEBUGGED rows land under Debug; a null summary falls back to the FID, an empty one stays empty", async () => {
    const r = root();
    ledger(
      r,
      feature(1, "420-debugged", "DEBUGGED"),
      feature(2, "430-no-summary", "DESIGNED", { summary: null }),
      feature(3, "431-empty-summary", "DESIGNED", { summary: "" }),
    );
    const res = await fold(r);
    const b = board(r);
    expect(section(b, "### Debug", "### Shipped")).toContain("| 420-debugged | 420-debugged | 1 |");
    expect(section(b, "### Design", "### Plan")).toContain(
      "| 430-no-summary | 430-no-summary | 2 |",
    );
    expect(section(b, "### Design", "### Plan")).toContain("| 431-empty-summary |  | 3 |");
    expect(res.json.counts).toEqual({ designed: 2, planned: 0, built: 0, debugged: 1, shipped: 0 });
  });

  it("whitespace-only notes and analysis bodies are re-seeded, not carried as blanks", async () => {
    const r = root();
    fs.writeFileSync(
      path.join(r, "docs/roadmap.md"),
      [
        MARKERS.notesPreStart,
        "  ",
        MARKERS.notesPreEnd,
        MARKERS.analysisStart,
        "\t",
        MARKERS.analysisEnd,
        MARKERS.notesPostStart,
        "",
        MARKERS.notesPostEnd,
        "",
      ].join("\n"),
    );
    await fold(r);
    const b = board(r);
    for (const [start, end] of [
      [MARKERS.notesPreStart, MARKERS.notesPreEnd],
      [MARKERS.analysisStart, MARKERS.analysisEnd],
      [MARKERS.notesPostStart, MARKERS.notesPostEnd],
    ] as const) {
      const body = section(b, start, end).slice(start.length);
      expect(body.trim(), start).not.toBe("");
    }
    expect(b).not.toContain("\t");
  });

  it("carries notes and analysis verbatim, keeps a custom title, and folds the tail under an existing notes-post body", async () => {
    const r = root();
    fs.writeFileSync(
      path.join(r, "docs/roadmap.md"),
      [
        "",
        "# Title",
        "",
        "HEAD",
        "",
        MARKERS.notesPreStart,
        "",
        "PRE",
        "   ",
        "",
        MARKERS.notesPreEnd,
        MARKERS.statusStart,
        "old",
        MARKERS.statusEnd,
        MARKERS.analysisStart,
        "  ANALYSIS",
        MARKERS.analysisEnd,
        MARKERS.notesPostStart,
        "POST",
        MARKERS.notesPostEnd,
        "",
        "TAIL 1",
        "",
        "TAIL 2",
        "",
      ].join("\n"),
    );
    ledger(r, feature(1, "412-export-csv", "DESIGNED"));
    await fold(r);
    const b = board(r);
    expect(b.startsWith("# Title\n\nHEAD\n\n")).toBe(true);
    expect(b).not.toContain("# Roadmap");
    expect(b).toContain(`${MARKERS.notesPreStart}\n\nPRE\n   \n${MARKERS.notesPreEnd}`);
    expect(b).toContain(`${MARKERS.analysisStart}\n  ANALYSIS\n${MARKERS.analysisEnd}`);
    expect(b).toContain(
      `${MARKERS.notesPostStart}\nPOST\n\nTAIL 1\n\nTAIL 2\n${MARKERS.notesPostEnd}`,
    );
    expect(b.endsWith(`${MARKERS.notesPostEnd}\n`)).toBe(true);
    expect(b).not.toContain("old");
  });

  it("an empty board file and an empty ledger file still fold to a full board", async () => {
    const r = root();
    fs.writeFileSync(path.join(r, "docs/roadmap.md"), "");
    ledger(r);
    const res = await fold(r);
    expect(res.code).toBe(0);
    const b = board(r);
    for (const m of Object.values(MARKERS)) expect(b).toContain(m);
    expect(res.err).toContain(".bkit/issues.jsonl absent or empty");
    expect(res.err).not.toContain("bootstrapping");
  });

  it("an end marker above its start marker loses no consumer line", async () => {
    const r = root();
    fs.writeFileSync(
      path.join(r, "docs/roadmap.md"),
      `top\n${MARKERS.statusEnd}\nmiddle\n${MARKERS.statusStart}\nbottom\n`,
    );
    expect((await fold(r)).code).toBe(0);
    const b = board(r);
    for (const s of ["top", "middle", "bottom"]) expect(b).toMatch(new RegExp(`^${s}$`, "m"));
    expect(lineOf(b, MARKERS.notesPostEnd, true)).toBe(b.split("\n").length - 1);
  });

  it("text after the last marker with no final newline is folded into notes-post", async () => {
    const r = root();
    fs.writeFileSync(
      path.join(r, "docs/roadmap.md"),
      `# R\n${MARKERS.notesPostStart}\nP\n${MARKERS.notesPostEnd}\nafter`,
    );
    await fold(r);
    const b = board(r);
    expect(b).toContain(`${MARKERS.notesPostStart}\nP\n\nafter\n${MARKERS.notesPostEnd}\n`);
    expect(b.endsWith(`${MARKERS.notesPostEnd}\n`)).toBe(true);
  });
});

describe("project", () => {
  // jq's sort_by(-(.shippedAt // .ts)) errors on a string ts, which blanked the
  // whole board; legacy rows carry ISO-string ts.
  it("orders legacy ISO-string ts rows instead of failing", () => {
    const p = project([
      { key: "a", status: "SHIPPED", ts: "2026-01-01T00:00:00Z" },
      { key: "b", status: "SHIPPED", ts: "2026-06-01T00:00:00Z" },
      { key: "c", status: "BUILT", ts: 1 },
      { key: "c", status: "SHIPPED", ts: "2026-03-01T00:00:00Z" },
    ]);
    expect(p.shipped.map((r) => r.key)).toEqual(["b", "c", "a"]);
    expect(p.built).toEqual([]);
  });

  it("buckets in key order, the last row of equal ts winning", () => {
    const p = project([
      { key: "z", status: "DESIGNED", ts: 1 },
      { key: "a", status: "DESIGNED", ts: 1 },
      { key: "a", status: "PLANNED", ts: 1 },
      5,
      { status: "DESIGNED", ts: 1 },
    ]);
    expect(p.designed.map((r) => r.key)).toEqual(["z"]);
    expect(p.planned.map((r) => r.key)).toEqual(["a"]);
  });
});
