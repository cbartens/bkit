import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { runCommand } from "../lib";
import {
  FENCE_CLOSE,
  FENCE_INSTRUCTION_LINES,
  FENCE_OPEN,
  consumerSection,
  contextCommand,
  fetchBlocks,
  humanBytes,
} from "./context";
import { parseContextFetchStart } from "../../checks/before/index";

const FOOTER_2 = "> Dropped content was NOT read. Its absence is not evidence.";

let tmpDir: string;
beforeAll(() => {
  tmpDir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-context-")));
});
afterAll(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

async function run(argv: string[], cwd = tmpDir) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCommand(["context", ...argv], [contextCommand], {
    classicVerbs: new Set(),
    cwd,
    io: { stdout: (t) => out.push(t), stderr: (t) => err.push(t) },
  });
  return { code, json: out.length ? JSON.parse(out.join("")) : undefined, err: err.join("") };
}

const write = (name: string, content: string) => {
  const p = path.join(tmpDir, name);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
  return p;
};
const read = (p: string) => fs.readFileSync(p, "utf-8");

/** N lines of `width` bytes each (newline included). */
const lines = (n: number, width = 8, prefix = "L") =>
  Array.from({ length: n }, (_, i) => `${prefix}${i + 1}`.padEnd(width - 1, "x")).join("\n") + "\n";

const clamp = (file: string, profile: string, ...extra: string[]) =>
  run(["clamp", `--artifact=${file}`, `--profile=${profile}`, ...extra]);

// ---------------------------------------------------------------------------
// clamp
// ---------------------------------------------------------------------------

describe("bkit context clamp (#427 T1)", () => {
  it("leaves a file exactly at its cap byte-identical, with no footer", async () => {
    const content = lines(200);
    const f = write("at-cap.md", content);
    const r = await clamp(f, "ledger");
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ clamped: false, keptLines: 200 });
    expect(read(f)).toBe(content);
  });

  it("clamps a file one line over its cap and footers it, keeping the FIRST lines", async () => {
    const f = write("one-over.md", lines(201));
    const r = await clamp(f, "ledger");
    expect(r.json).toMatchObject({ clamped: true, origLines: 201, keptLines: 200 });
    const out = read(f);
    expect(out).toContain("> [bkit] TRUNCATED — kept 200 of 201 lines (");
    expect(out.trimEnd().endsWith(FOOTER_2)).toBe(true);
    expect(out.startsWith("L1")).toBe(true);
    expect(out).not.toContain("\nL201");
  });

  it("counts a final line with no trailing newline", async () => {
    const r = await clamp(write("no-newline.md", "a\nb\nc"), "ledger");
    expect(r.json).toMatchObject({ origLines: 3, keptLines: 3 });
  });

  it("fires the byte cap independently of the line cap", async () => {
    const r = await clamp(write("fat-lines.md", lines(100, 1024)), "ledger");
    expect(r.json.clamped).toBe(true);
    expect(r.json.origLines).toBe(100);
    expect(r.json.keptLines).toBeLessThan(100);
    expect(r.json.keptBytes).toBeLessThanOrEqual(51200);
  });

  it("reports counts that match the clamped file, and the artifact as given", async () => {
    const f = write("counts.md", lines(500));
    const r = await clamp("counts.md", "ledger");
    const body = read(f)
      .split("\n")
      .filter((l) => l !== "" && !l.startsWith("> [bkit]") && l !== FOOTER_2);
    expect(body.length).toBe(r.json.keptLines);
    expect(Buffer.byteLength(body.join("\n") + "\n")).toBe(r.json.keptBytes);
    expect(r.json.artifact).toBe("counts.md");
  });

  it("keeps both ends of a long failing run under debug-evidence", async () => {
    const total = 6000;
    const f = write("evidence.md", `FIRST FAILURE here\n${lines(total - 2)}FINAL SUMMARY here\n`);
    const r = await clamp(f, "debug-evidence");
    expect(r.code).toBe(0);
    const out = read(f);
    expect(out.startsWith("FIRST FAILURE here\n")).toBe(true);
    expect(out).toContain("FINAL SUMMARY here");
    expect(out).toContain("> [bkit] TRUNCATED HERE —");
    expect(out).toContain("lines omitted. Dropped content was NOT read.");
    expect(out.trimEnd().endsWith(FOOTER_2)).toBe(true);
    expect(r.json).toMatchObject({ clamped: true, origLines: total, ceilingHit: false });
    expect(r.json.keptLines).toBeLessThan(total);
  });

  it("never drops a signal line buried in the middle", async () => {
    const body = Array.from({ length: 9000 }, (_, i) =>
      i === 4500 ? "AssertionError: expected 3 to be 4" : `quiet line ${i}`,
    );
    const f = write("buried.md", body.join("\n") + "\n");
    const r = await clamp(f, "debug-evidence");
    const out = read(f);
    expect(r.json).toMatchObject({ clamped: true, ceilingHit: false });
    expect(out).toContain("AssertionError: expected 3 to be 4");
    expect(out).toContain("quiet line 4499");
    expect(out).toContain("quiet line 4501");
    expect(out).not.toContain("quiet line 3000");
  });

  it("keeps every signal line when they are scattered throughout", async () => {
    const body = Array.from({ length: 9000 }, (_, i) =>
      i % 50 === 0 ? `FAIL spec-${i} timed out` : `quiet line ${i}`,
    );
    const f = write("scattered.md", body.join("\n") + "\n");
    await clamp(f, "debug-evidence");
    const out = read(f);
    const missing = body.filter((l) => l.startsWith("FAIL") && !out.includes(l));
    expect(missing).toEqual([]);
  });

  it("matches the multibyte signal glyphs too", async () => {
    const body = Array.from({ length: 6000 }, (_, i) =>
      i === 3000 ? "  ✕ widget renders" : `quiet ${i}`,
    );
    const f = write("glyph.md", body.join("\n") + "\n");
    await clamp(f, "debug-evidence");
    expect(read(f)).toContain("✕ widget renders");
  });

  it("shortens an over-long line in place instead of evicting readable ones", async () => {
    const body = Array.from({ length: 4000 }, (_, i) => `quiet line ${i}`);
    body[10] = `{"gitDiff":"${"d".repeat(100_000)}"}`;
    const f = write("fat-line.md", body.join("\n") + "\n");
    const r = await clamp(f, "debug-evidence");
    const out = read(f);
    expect(r.json.lineCapped).toBe(1);
    expect(out).toContain("… [bkit] line shortened, ");
    expect(out).toContain("bytes dropped");
    expect(out).toContain("> [bkit] 1 over-long line was shortened; it says so inline.");
    expect(r.json.keptLines).toBeGreaterThan(1400);
    expect(out).not.toContain("d".repeat(3000));
  });

  it("keeps a line whose signal text sits past the per-line cap", async () => {
    const body = Array.from({ length: 4000 }, (_, i) => `quiet line ${i}`);
    body[2000] = `${"E".repeat(90_000)} AssertionError deep inside`;
    const f = write("deep-signal.md", body.join("\n") + "\n");
    await clamp(f, "debug-evidence");
    const out = read(f);
    expect(out).toContain("… [bkit] line shortened, ");
    expect(out).toContain("quiet line 1999");
    expect(out).toContain("quiet line 2001");
  });

  it("marks every removal in place, not just in the footer", async () => {
    const body = Array.from({ length: 9000 }, (_, i) =>
      i % 1000 === 0 ? `FAIL case ${i}` : `quiet line ${i}`,
    );
    const f = write("gaps.md", body.join("\n") + "\n");
    await clamp(f, "debug-evidence");
    const out = read(f);
    const gaps = out.match(/^> \[bkit\] TRUNCATED HERE — \d+ lines? omitted\./gm) ?? [];
    expect(gaps.length).toBeGreaterThan(1);
    expect(out).not.toContain("— 1 lines omitted");
    expect(out).toContain("the rest is NOT in this file, re-run the source to see it.");
  });

  it("bounds a file where nearly every line matches, and says the ceiling fired", async () => {
    const body = Array.from({ length: 40_000 }, (_, i) => `error: widget ${i} failed`);
    const f = write("all-signal.md", body.join("\n") + "\n");
    const r = await clamp(f, "debug-evidence");
    const out = read(f);
    expect(r.json).toMatchObject({ clamped: true, ceilingHit: true, origLines: 40_000 });
    expect(r.json.keptLines).toBeLessThanOrEqual(12_000);
    expect(r.json.keptBytes).toBeLessThanOrEqual(1_572_864);
    expect(out).toContain(
      "> [bkit] Hard ceiling reached — lines matching the signal pattern were dropped too.",
    );
    expect(out.trimEnd().endsWith(FOOTER_2)).toBe(true);
  });

  it("leaves a debug-evidence file under the threshold byte-identical", async () => {
    const content = `FAIL something broke\n${lines(2000)}`;
    const f = write("small-evidence.md", content);
    const r = await clamp(f, "debug-evidence");
    expect(r.json).toMatchObject({ clamped: false, lineCapped: 0 });
    expect(read(f)).toBe(content);
  });

  it("an unreadable file exits 4; an unknown profile exits 2; neither rewrites", async () => {
    const missing = await clamp(path.join(tmpDir, "nope.md"), "ledger");
    expect(missing.code).toBe(4);
    expect(missing.err).toContain("cannot read artifact");
    const f = write("known.md", "one line\n");
    const bogus = await clamp(f, "not-a-profile");
    expect(bogus.code).toBe(2);
    expect(bogus.err).toContain("unknown profile");
    expect(read(f)).toBe("one line\n");
  });

  it("the byte cap keeps the longest prefix that fits, and footers human sizes", async () => {
    const f = write("fat-lines-exact.md", lines(100, 1024));
    const r = await clamp(f, "ledger");
    expect(r.json).toMatchObject({
      clamped: true,
      origLines: 100,
      keptLines: 50,
      origBytes: 102400,
      keptBytes: 51200,
    });
    expect(read(f)).toContain("> [bkit] TRUNCATED — kept 50 of 100 lines (50 KB of 100 KB);");
  });

  it("a ledger over its cap with no final newline is cut whole-line, sized as on disk", async () => {
    const content = lines(300).trimEnd();
    const f = write("ledger-no-newline.md", content);
    const r = await clamp(f, "ledger");
    expect(r.json).toMatchObject({
      clamped: true,
      origLines: 300,
      keptLines: 200,
      origBytes: 2399,
      keptBytes: 1600,
    });
    const out = read(f);
    expect(out.startsWith(lines(200))).toBe(true);
    expect(out).toContain("> [bkit] TRUNCATED — kept 200 of 300 lines (2 KB of 2 KB);");
    expect(out.endsWith(`${FOOTER_2}\n`)).toBe(true);
  });

  it("shortens an over-long line by bytes, not characters", async () => {
    // 3000 x "é" is 6000 bytes: cut at byte 2000, so 4000 bytes dropped (not 1000 chars).
    const body = Array.from({ length: 3500 }, (_, i) => (i === 7 ? "é".repeat(3000) : `q ${i}`));
    const f = write("multibyte.md", body.join("\n") + "\n");
    const r = await clamp(f, "debug-evidence");
    expect(r.json).toMatchObject({ clamped: true, lineCapped: 1, origLines: 3500 });
    const shortened = read(f).split("\n")[7]!;
    expect(shortened).toBe(`${"é".repeat(1000)} … [bkit] line shortened, 4000 bytes dropped`);
  });

  it("over the threshold but every line kept by signal context: untouched, not clamped", async () => {
    for (const [name, content] of [
      [
        "dense-signal.md",
        Array.from({ length: 9000 }, (_, i) => (i % 3 === 0 ? `error ${i}` : "q")),
      ],
      ["all-fail.md", Array.from({ length: 5000 }, (_, i) => `fail ${i}`)],
    ] as const) {
      const text = content.join("\n") + "\n";
      const f = write(name, text);
      const r = await clamp(f, "debug-evidence");
      expect(r.json).toMatchObject({ clamped: false, lineCapped: 0, ceilingHit: false });
      expect(r.json.keptLines).toBe(r.json.origLines);
      expect(read(f)).toBe(text);
    }
  });

  it("a gap no larger than its own marker is kept instead of marked", async () => {
    const body = Array.from({ length: 9000 }, (_, i) =>
      i === 4000 ? "FAIL a" : i === 4006 ? "FAIL b" : `quiet line ${i}`,
    );
    const f = write("small-gap.md", body.join("\n") + "\n");
    const r = await clamp(f, "debug-evidence");
    const out = read(f);
    // head 500 + tail 1000 + 3998..4008 (two context windows plus the 1-line gap between)
    expect(r.json).toMatchObject({ clamped: true, keptLines: 1511 });
    expect(out).toContain("quiet line 4003");
    const between = out.slice(out.indexOf("FAIL a"), out.indexOf("FAIL b"));
    expect(between).not.toContain("TRUNCATED HERE");
    expect(out.match(/^> \[bkit\] TRUNCATED HERE/gm)).toHaveLength(2);
  });

  it("debug-evidence with no final newline ends the kept tail with one", async () => {
    const content = Array.from({ length: 5000 }, (_, i) => `q ${i}`).join("\n");
    const f = write("evidence-no-newline.md", content);
    const r = await clamp(f, "debug-evidence");
    // records count as awk's: the unterminated last line still costs its newline
    expect(r.json).toMatchObject({ clamped: true, origLines: 5000, keptLines: 1500 });
    expect(r.json.origBytes).toBe(Buffer.byteLength(content) + 1);
    const out = read(f);
    expect(out).toContain("\nq 4999\n> [bkit] TRUNCATED — kept 1500 of 5000 lines (");
  });

  it("keeps carriage returns verbatim and counts them as bytes", async () => {
    const content = Array.from({ length: 5000 }, (_, i) => `q ${i}\r`).join("\n") + "\n";
    const f = write("crlf.md", content);
    const r = await clamp(f, "debug-evidence");
    expect(r.json).toMatchObject({ clamped: true, origLines: 5000, origBytes: 38890 });
    const out = read(f);
    expect(out.startsWith("q 0\r\nq 1\r\n")).toBe(true);
    expect(out).toContain("\nq 4999\r\n> [bkit] TRUNCATED");
  });
});

describe("bkit context clamp-log (#427 T1)", () => {
  it("collects records across calls and survives a repeated read", async () => {
    const log = path.join(tmpDir, "logs/records.jsonl");
    const small = write("collect-small.md", lines(5));
    const big = write("collect-big.md", lines(400));
    await run(["clamp-log", `--log=${log}`, "--reset"]);
    await clamp(small, "ledger", `--log=${log}`);
    await clamp(big, "ledger", `--log=${log}`);
    const first = await run(["clamp-log", `--log=${log}`]);
    const second = await run(["clamp-log", `--log=${log}`]);
    expect(second.json).toEqual(first.json);
    expect(first.json.records).toHaveLength(2);
    expect(first.json.records[0]).toMatchObject({ artifact: small, clamped: false });
    expect(first.json.records[1]).toMatchObject({ artifact: big, clamped: true });
  });

  it("reports an empty array when a step clamped nothing, or the log is absent", async () => {
    const log = path.join(tmpDir, "empty.jsonl");
    expect((await run(["clamp-log", `--log=${log}`, "--reset"])).json.records).toEqual([]);
    expect(
      (await run(["clamp-log", `--log=${path.join(tmpDir, "never.jsonl")}`])).json.records,
    ).toEqual([]);
  });

  it("derives tmp/bkit-clamp-{fid}-{step}[-{attempt}].jsonl under the repo top", async () => {
    const repo = path.join(tmpDir, "repo-log");
    fs.mkdirSync(path.join(repo, "sub"), { recursive: true });
    spawnSync("git", ["init", "-q"], { cwd: repo });
    const r = await run(
      ["clamp-log", "--fid=9-x", "--step=context-fetch", "--attempt=2", "--reset"],
      path.join(repo, "sub"),
    );
    expect(r.json.log).toBe(path.join(repo, "tmp/bkit-clamp-9-x-context-fetch-2.jsonl"));
    expect(fs.existsSync(r.json.log)).toBe(true);
  });

  it("needs a log", async () => {
    expect((await run(["clamp-log"])).code).toBe(2);
    expect((await run(["clamp-log", "--fid=9-x"])).code).toBe(2);
  });
});

describe("humanBytes", () => {
  it.each([
    [1023, "1023 B"],
    [1024, "1 KB"],
    [1535, "1 KB"],
    [1536, "2 KB"],
    [1048576, "1.0 MB"],
    // Exact ties round to even, as awk's printf does: 1.25 -> 1.2, 1.75 -> 1.8.
    [1310720, "1.2 MB"],
    [1835008, "1.8 MB"],
    [1415577, "1.3 MB"],
    [1415578, "1.4 MB"],
  ])("%d -> %s", (b, want) => {
    expect(humanBytes(b)).toBe(want);
  });
});

// ---------------------------------------------------------------------------
// ledger-scan
// ---------------------------------------------------------------------------

describe("bkit context ledger-scan (#427 T3)", () => {
  const row = (n: number, text: string) => JSON.stringify({ key: `DE-${n}`, note: text });

  async function scan(terms: string, srcLines: string[] | null, ...extra: string[]) {
    const dir = fs.mkdtempSync(path.join(tmpDir, "ledger-"));
    if (srcLines) fs.writeFileSync(path.join(dir, "src.jsonl"), srcLines.join("\n") + "\n");
    const r = await run(
      [
        "ledger-scan",
        `--terms=${terms}`,
        "--source=src.jsonl",
        "--artifact=out/related.md",
        ...extra,
      ],
      dir,
    );
    expect(r.code).toBe(0);
    return { ...r, out: read(path.join(dir, "out/related.md")), dir };
  }
  const bodyOf = (out: string) => out.split("\n").filter((l) => l && !l.startsWith("> "));

  it("keeps the top 40 by term overlap and footers the total", async () => {
    const weak = Array.from({ length: 45 }, (_, i) => row(i + 1, "clamp artifact only"));
    const strong = Array.from({ length: 3 }, (_, i) =>
      row(100 + i, "clamp artifact ledger together"),
    );
    const { out, json } = await scan("clamp artifact ledger", [...weak, ...strong]);
    const body = bodyOf(out);
    expect(body).toHaveLength(40);
    expect(body.slice(0, 3).every((l) => l.includes("ledger together"))).toBe(true);
    expect(out).toContain(
      "> [bkit] TRUNCATED — kept 40 of 48 matching lines, strongest term-overlap first.",
    );
    expect(out.trimEnd().endsWith(FOOTER_2)).toBe(true);
    expect(json).toMatchObject({ total: 48, kept: 40 });
  });

  it("ties break newest-line first", async () => {
    const rows = Array.from({ length: 50 }, (_, i) => row(i + 1, "clamp artifact same"));
    const body = bodyOf((await scan("clamp artifact", rows)).out);
    expect(body[0]).toContain('"DE-50"');
    expect(body[39]).toContain('"DE-11"');
  });

  it("emits no footer, and drops no line, below the cap", async () => {
    const rows = [
      row(1, "clamp artifact here"),
      row(2, "unrelated entirely"),
      row(3, "clamp artifact again"),
    ];
    const { out } = await scan("clamp artifact", rows);
    expect(out).not.toContain("TRUNCATED");
    expect(out.split("\n").filter(Boolean)).toEqual([rows[2], rows[0]]);
  });

  it("keeps a literal tab inside a matching JSONL line intact", async () => {
    const tabbed = '{"key":"DE-9","note":"clamp\tartifact\tsplit"}';
    expect((await scan("clamp artifact", [tabbed])).out.split("\n").filter(Boolean)).toEqual([
      tabbed,
    ]);
  });

  it("writes None. when nothing matches and when the ledger is absent", async () => {
    expect((await scan("clamp artifact", [row(1, "nothing alike")])).out).toBe("None.\n");
    expect((await scan("clamp artifact", null)).out).toBe("None.\n");
  });

  it("a sole term matches on its own; matching is case-insensitive", async () => {
    const { out } = await scan("Clamp", [row(1, "CLAMP here"), row(2, "nothing")]);
    expect(out).toBe(`${row(1, "CLAMP here")}\n`);
  });

  // The workflow's awk counts a repeated term twice and counts the empty field
  // a leading or trailing space makes, so `clamp clamp` matched any line with
  // `clamp`, and ` clamp` matched nothing at all.
  it("counts distinct terms, ignoring repeats and stray spaces", async () => {
    expect((await scan("clamp clamp", [row(1, "clamp only")])).out).toBe(
      `${row(1, "clamp only")}\n`,
    );
    expect((await scan(" clamp ", [row(1, "clamp only")])).out).toBe(`${row(1, "clamp only")}\n`);
    expect((await scan("clamp ledger clamp", [row(1, "clamp only")])).out).toBe("None.\n");
  });

  it("applies the same shape to the failures ledger and records the clamp", async () => {
    const rows = Array.from({ length: 41 }, (_, i) => row(i + 1, "clamp artifact flaky"));
    const { out, dir } = await scan("clamp artifact", rows, "--log=clamp.jsonl", "--reset-log");
    expect(out).toContain("kept 40 of 41 matching lines");
    const records = read(path.join(dir, "clamp.jsonl")).trim().split("\n");
    expect(records).toHaveLength(1);
    expect(JSON.parse(records[0]!)).toMatchObject({ artifact: "out/related.md", clamped: false });
  });

  it("blank lines in the ledger never match and still count toward newest-first", async () => {
    const { out, json } = await scan("clamp", [row(1, "clamp"), "", row(3, "clamp")]);
    expect(out).toBe(`${row(3, "clamp")}\n${row(1, "clamp")}\n`);
    expect(json).toMatchObject({ total: 2, kept: 2 });
  });

  it("--reset-log empties the log; without it records accumulate", async () => {
    const dir = fs.mkdtempSync(path.join(tmpDir, "ledger-log-"));
    fs.writeFileSync(path.join(dir, "clamp.jsonl"), '{"stale":true}\n');
    await run(
      [
        "ledger-scan",
        "--terms=x",
        "--source=none",
        "--artifact=a.md",
        "--log=clamp.jsonl",
        "--reset-log",
      ],
      dir,
    );
    await run(
      ["ledger-scan", "--terms=x", "--source=none", "--artifact=b.md", "--log=clamp.jsonl"],
      dir,
    );
    expect(
      read(path.join(dir, "clamp.jsonl"))
        .trim()
        .split("\n")
        .map((l) => JSON.parse(l).artifact),
    ).toEqual(["a.md", "b.md"]);
  });
});

// ---------------------------------------------------------------------------
// context-fetch blocks
// ---------------------------------------------------------------------------

const CONTEXT_MD = [
  "# Context",
  "<!-- context-fetch:start example context=ci -->",
  "```bash",
  "echo managed example never runs",
  "```",
  "<!-- context-fetch:end -->",
  "<!-- bkit:end -->",
  "",
  "<!-- context-fetch:start github context=ci -->",
  "# Customise: limit",
  "```bash",
  'echo "ci log for $CONTEXT attempt $DEBUG_ATTEMPT"',
  "```",
  "<!-- context-fetch:end -->",
  "<!-- context-fetch:provision vercel -->",
  "```bash",
  "echo provision never listed",
  "```",
  "<!-- context-fetch:end -->",
  "<!-- context-fetch:start vercel -->",
  "```bash",
  "echo runtime",
  "```",
  "<!-- context-fetch:end -->",
  "<!-- context-fetch:start github context=ci -->",
  "```bash",
  "echo second ci",
  "```",
  "<!-- context-fetch:end -->",
  "<!-- context-fetch:start odd context=logs -->",
  "```bash",
  "echo unknown",
  "```",
  "<!-- context-fetch:end -->",
  "<!-- context-fetch:start empty context=web -->",
  "no fence here",
  "<!-- context-fetch:end -->",
  "",
].join("\n");

describe("context-fetch block parsing", () => {
  it("parses name and context, last token winning, context defaulting to runtime", () => {
    expect(parseContextFetchStart("<!-- context-fetch:start github context=ci -->")).toEqual({
      context: "ci",
      name: "github",
    });
    expect(parseContextFetchStart("<!-- context-fetch:start -->")).toEqual({
      context: "runtime",
      name: "",
    });
    expect(parseContextFetchStart("<!-- context-fetch:start\ta  b context=e2e -->")).toEqual({
      context: "e2e",
      name: "b",
    });
    // glued close: the marker parser strips `-->` first
    expect(parseContextFetchStart("<!-- context-fetch:start x context=ci-->")).toEqual({
      context: "ci",
      name: "x",
    });
    expect(parseContextFetchStart("<!-- context-fetch:start   vercel   -->")).toEqual({
      context: "runtime",
      name: "vercel",
    });
  });

  it("lists only blocks after <!-- bkit:end -->, with ordinal, body and artifact stem", () => {
    const blocks = fetchBlocks(consumerSection(CONTEXT_MD));
    expect(blocks.map((b) => [b.idx, b.context, b.name, b.known, b.prefix, b.suffix])).toEqual([
      [1, "ci", "github", true, "context-ci", "github-1-"],
      [2, "runtime", "vercel", true, "context-runtime", "vercel-"],
      [3, "ci", "github", true, "context-ci", "github-3-"],
      [4, "logs", "odd", false, null, "odd-"],
      [5, "web", "empty", true, "context-web", "empty-"],
    ]);
    expect(blocks[0]!.body).toBe('echo "ci log for $CONTEXT attempt $DEBUG_ATTEMPT"');
    expect(blocks[4]!.body).toBe("");
  });

  it("joins every fenced range in one block", () => {
    const md = [
      "<!-- bkit:end -->",
      "<!-- context-fetch:start a -->",
      "```",
      "one",
      "```",
      "prose",
      "```sh",
      "two",
      "```",
      "<!-- context-fetch:end -->",
    ].join("\n");
    expect(fetchBlocks(consumerSection(md))[0]!.body).toBe("one\ntwo");
  });

  it("no bkit:end line means no consumer blocks", () => {
    expect(
      fetchBlocks(
        consumerSection("<!-- context-fetch:start a -->\n```\nx\n```\n<!-- context-fetch:end -->"),
      ),
    ).toEqual([]);
  });
});

describe("bkit context list-blocks", () => {
  it("emits blocks, coverage and configured contexts, and narrates coverage", async () => {
    write("lb/.agents/context.md", CONTEXT_MD);
    const r = await run(["list-blocks"], path.join(tmpDir, "lb"));
    expect(r.code).toBe(0);
    expect(r.json.blocks).toHaveLength(5);
    expect(r.json.coverage).toEqual({ runtime: 1, ci: 2, diff: 0, e2e: 0, web: 1 });
    expect(r.json.contextsConfigured).toEqual(["runtime", "ci", "web"]);
    expect(r.err).toContain("context-fetch context=ci CONFIGURED (2 block(s))");
    expect(r.err).toContain(
      "context-fetch context=diff NOT CONFIGURED — that evidence is UNCHECKED this attempt, NOT confirmed clean",
    );
    expect(r.err).toContain("UNKNOWN context='logs' (block 'odd')");
  });

  it("says loudly when nothing is configured", async () => {
    const r = await run(["list-blocks"], fs.mkdtempSync(path.join(tmpDir, "empty-")));
    expect(r.json.blocks).toEqual([]);
    expect(r.err).toContain("NO BLOCKS CONFIGURED");
  });
});

describe("bkit context run-block / finalise (#427 T4)", () => {
  function workspace() {
    const dir = fs.mkdtempSync(path.join(tmpDir, "fetch-"));
    spawnSync("git", ["init", "-q"], { cwd: dir });
    fs.mkdirSync(path.join(dir, ".agents"));
    fs.writeFileSync(path.join(dir, ".agents/context.md"), CONTEXT_MD);
    return dir;
  }
  const script = (dir: string, body: string) => {
    fs.writeFileSync(path.join(dir, "block.sh"), body);
    return "--script=block.sh";
  };
  const base = ["--fid=427-x", "--month=202608", "--attempt=1"];

  it("a clamped artifact ends at END UNTRUSTED, with the truncation footer inside the fence", async () => {
    const dir = workspace();
    const r = await run(
      [
        "run-block",
        "--idx=1",
        script(
          dir,
          'printf "FIRST FAILURE line\\n"; seq 1 9000 | sed "s/$/ quiet payload/"; printf "FINAL SUMMARY line"',
        ),
        ...base,
      ],
      dir,
    );
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({
      outcome: "checked",
      artifact: "docs/plans/202608/logs/427-x/context-ci-github-1-1.md",
    });
    const rows = read(path.join(dir, r.json.artifact)).trimEnd().split("\n");
    expect(rows.slice(0, 8)).toEqual([...FENCE_INSTRUCTION_LINES, FENCE_OPEN]);
    expect(rows.at(-1)).toBe(FENCE_CLOSE);
    expect(rows.at(-2)).toBe(FOOTER_2);
    expect(rows.at(-3)).toMatch(/^> \[bkit\] TRUNCATED — kept \d+ of 9002 lines/);
    expect(rows[8]).toBe("FIRST FAILURE line");
    expect(rows.at(-4)).toBe("FINAL SUMMARY line");
    // the record names the real artifact, not a temp payload
    const log = read(path.join(dir, "tmp/bkit-clamp-427-x-context-fetch-1.jsonl"));
    const rec = JSON.parse(log.trim());
    expect(rec).toMatchObject({
      artifact: "docs/plans/202608/logs/427-x/context-ci-github-1-1.md",
      clamped: true,
      origLines: 9002,
    });
    expect(rec.keptLines).toBeLessThan(9002);
  });

  it("an unclamped payload is wrapped whole; the block sees its context variables", async () => {
    const dir = workspace();
    const r = await run(
      [
        "run-block",
        "--idx=1",
        script(dir, 'echo "ci log for $CONTEXT attempt $DEBUG_ATTEMPT"\n\n\n'),
        ...base,
      ],
      dir,
    );
    expect(read(path.join(dir, r.json.artifact))).toBe(
      [...FENCE_INSTRUCTION_LINES, FENCE_OPEN, "ci log for ci attempt 1", FENCE_CLOSE, ""].join(
        "\n",
      ),
    );
    expect(r.json.clamp).toMatchObject({ clamped: false, origLines: 1 });
    expect(r.err).toContain("context-fetch context=ci name=github CHECKED — data returned");
  });

  it("no stdout but a skip line writes the breadcrumb and says NOT CHECKED", async () => {
    const dir = workspace();
    const r = await run(
      [
        "run-block",
        "--idx=2",
        script(
          dir,
          'echo "noise" >&2; echo "[context-fetch:vercel] skipped — no token" >&2; exit 0',
        ),
        ...base,
      ],
      dir,
    );
    expect(r.json).toMatchObject({
      outcome: "self-skipped",
      skip: "[context-fetch:vercel] skipped — no token",
    });
    expect(read(path.join(dir, "docs/plans/202608/logs/427-x/context-runtime-vercel-1.md"))).toBe(
      "[context-fetch:vercel] skipped — no token\n",
    );
    expect(r.err).toContain("SELF-SKIPPED");
  });

  it("neither data nor a skip line writes nothing and says so", async () => {
    const dir = workspace();
    const r = await run(["run-block", "--idx=2", script(dir, "printf '\\n\\n'"), ...base], dir);
    expect(r.json).toMatchObject({ outcome: "silent", artifact: null });
    expect(r.err).toContain("produced neither data nor a skip breadcrumb");
  });

  it.each([
    ["4", "UNKNOWN context='logs'"],
    ["5", "has no fenced body"],
    ["9", "no block 9"],
  ])("block %s is not run", async (idx, reason) => {
    const dir = workspace();
    const r = await run(
      ["run-block", `--idx=${idx}`, script(dir, "echo should-not-run"), ...base],
      dir,
    );
    expect(r.code).toBe(0);
    expect(r.json.outcome).toBe("not-run");
    expect(r.json.reason).toContain(reason);
    expect(fs.existsSync(path.join(dir, "docs"))).toBe(false);
  });

  it("reads the attempt from status.jsonl, and refuses a run without one", async () => {
    const dir = workspace();
    const status = path.join(dir, "status.jsonl");
    const at = "2026-10-01T00:00:00Z";
    fs.writeFileSync(
      status,
      [
        { type: "workflow-started", workflow: "debug", at },
        { type: "workflow-meta", workflow: "debug", at, debugAttempt: 2 },
      ]
        .map((r) => JSON.stringify(r))
        .join("\n") + "\n",
    );
    const r = await run(
      [
        "run-block",
        "--idx=2",
        script(dir, "echo hi"),
        "--fid=427-x",
        "--month=202608",
        "--file=status.jsonl",
      ],
      dir,
    );
    expect(r.json.artifact).toBe("docs/plans/202608/logs/427-x/context-runtime-vercel-2.md");
    fs.writeFileSync(
      status,
      `${JSON.stringify({ type: "workflow-started", workflow: "debug", at })}\n`,
    );
    expect(
      (
        await run(
          [
            "run-block",
            "--idx=2",
            "--script=block.sh",
            "--fid=427-x",
            "--month=202608",
            "--file=status.jsonl",
          ],
          dir,
        )
      ).code,
    ).toBe(2);
    expect(
      (
        await run(
          [
            "run-block",
            "--idx=2",
            "--script=block.sh",
            "--fid=427-x",
            "--month=202608",
            "--file=nope.jsonl",
          ],
          dir,
        )
      ).code,
    ).toBe(3);
    expect(
      (
        await run(
          ["run-block", "--idx=2", "--script=block.sh", "--fid=427-x", "--month=202608"],
          dir,
        )
      ).code,
    ).toBe(2);
  });

  it("finalise derives verdict, artifacts, configured contexts and clamp records", async () => {
    const dir = workspace();
    await run(["run-block", "--idx=1", script(dir, "echo ci"), ...base], dir);
    await run(["run-block", "--idx=2", script(dir, "echo rt"), ...base], dir);
    const logs = path.join(dir, "docs/plans/202608/logs/427-x");
    fs.writeFileSync(path.join(logs, "context-related-1.md"), "None.\n");
    fs.writeFileSync(path.join(logs, "context-empty-1.md"), "");
    fs.writeFileSync(path.join(logs, "context-ci-github-11.md"), "other attempt\n");
    const r = await run(["finalise", ...base], dir);
    expect(r.json.verdict).toBe("PASS");
    expect(r.json.artifacts).toEqual([
      "docs/plans/202608/logs/427-x/context-ci-github-1-1.md",
      "docs/plans/202608/logs/427-x/context-related-1.md",
      "docs/plans/202608/logs/427-x/context-runtime-vercel-1.md",
    ]);
    expect(r.json.contextsConfigured).toEqual(["runtime", "ci", "web"]);
    expect(r.json.clamped).toHaveLength(2);
  });

  it("finalise with no artifacts is FAIL", async () => {
    const dir = workspace();
    const r = await run(["finalise", ...base], dir);
    expect(r.json).toMatchObject({ verdict: "FAIL", artifacts: [], clamped: [] });
  });
});

// ---------------------------------------------------------------------------
// untrusted-fence
// ---------------------------------------------------------------------------
/**
 * untrusted-fence — the wrapper put around fetched external text as
 * it lands on disk. `/bkit-debug` writes fetched CI / runtime / web output; that
 * payload is attacker-influenceable and is read back by a subagent.
 *
 * The fence is written in exactly one place: `bkit context run-block`, from the
 * constants exported by `commands/workflow/context.ts` (its own tests pin the
 * written bytes). This file guards everything around that:
 *
 * - no workflow prints a fence of its own (run-block already wraps the payload);
 * - any other copy of the instruction lines in a shipped source (prompts,
 *   templates, scripts, agent rules) is the WHOLE fence, verbatim and in order;
 * - consumer fetch blocks emit no fence, and subagents reading fenced artifacts
 *   are told so on spawn.
 *
 * The prose sits next to the payload, not in a header; it is defence-in-depth and does
 * not replace a narrowly-scoped token.
 */
describe("untrusted-fence", () => {
  const REPO_ROOT = path.resolve(__dirname, "../../../../..");

  /** Workflows whose subagents read fetched external evidence. */
  const FENCED_WORKFLOWS = [".bkit/workflows/bkit-debug.md"] as const;

  /** Artifacts holding fetched external evidence — tracker dumps excluded. */
  const UNTRUSTED_ARTIFACTS = /context-(?!related)/;

  const read = (rel: string) => fs.readFileSync(path.join(REPO_ROOT, rel), "utf-8");

  const countOf = (haystack: string, needle: string) => haystack.split(needle).length - 1;

  /** Every regular file under `rel` (recursive), repo-relative. */
  function filesUnder(rel: string): string[] {
    const abs = path.join(REPO_ROOT, rel);
    if (!fs.existsSync(abs)) return [];
    if (fs.statSync(abs).isFile()) return [rel];
    return fs
      .readdirSync(abs, { withFileTypes: true })
      .flatMap((e) =>
        e.isDirectory() ? filesUnder(`${rel}/${e.name}`) : e.isFile() ? [`${rel}/${e.name}`] : [],
      )
      .sort();
  }

  const WORKFLOWS = filesUnder(".bkit/workflows").filter((f) => f.endsWith(".md"));

  /**
   * Shipped sources that could write or hand an agent another copy of the fence.
   * Docs (`docs/*.md`, `.bkit/workflows.md`) are excluded: they quote single lines
   * in prose to explain the fence, which is not a copy.
   */
  const OTHER_SURFACES = [
    ".bkit/prompts",
    ".bkit/templates/.agents",
    ".bkit/templates/scripts",
    ".bkit/scripts",
    ".agents/context.md",
    ".agents/rules.md",
  ].flatMap(filesUnder);

  describe("the fence is written once, by bkit context run-block", () => {
    it("enumerates workflow files (not vacuous)", () => {
      expect(WORKFLOWS.length).toBeGreaterThanOrEqual(6);
      expect(OTHER_SURFACES.length).toBeGreaterThan(10);
    });

    for (const rel of WORKFLOWS) {
      it(`${rel} prints no fence line of its own`, () => {
        const content = read(rel);
        const hits = [...FENCE_INSTRUCTION_LINES, FENCE_OPEN, FENCE_CLOSE].filter((line) =>
          content.includes(line),
        );
        expect(hits, `${rel} carries fence text; run-block already wraps the payload`).toEqual([]);
      });
    }

    it("any other copy of the instruction lines is the whole fence, in order", () => {
      const partial: string[] = [];
      for (const rel of OTHER_SURFACES) {
        const content = read(rel);
        const counts = FENCE_INSTRUCTION_LINES.map((line) => countOf(content, line));
        if (counts.every((c) => c === 0)) continue;
        if (new Set(counts).size !== 1) {
          partial.push(`${rel}: fence lines out of step (${counts.join("/")})`);
          continue;
        }
        const whole = [...FENCE_INSTRUCTION_LINES, FENCE_OPEN].join("\n");
        if (countOf(content, whole) !== counts[0]) partial.push(`${rel}: fence reordered or split`);
      }
      expect(partial).toEqual([]);
    });
  });

  describe("the payload is wrapped once, never twice", () => {
    // Fetch blocks are consumer-authored and their stdout IS the payload. A block
    // that prints its own banner nests a second fence inside the first, and the
    // shipped templates are what consumers copy. Prose about untrusted output is fine;
    // a marker line emitted into the payload is not.
    const contextTemplates = fs
      .readdirSync(path.join(REPO_ROOT, ".bkit/templates/context"))
      .filter((f) => f.endsWith(".md"))
      .map((f) => `.bkit/templates/context/${f}`);
    for (const rel of [".agents/context.md", ...contextTemplates]) {
      it(`${rel} fetch blocks emit no fence of their own`, () => {
        const emitted = read(rel).match(/^.*={3,}[^\n]*UNTRUSTED.*$/gm) ?? [];
        expect(emitted, `${rel} emits its own fence marker`).toEqual([]);
      });
    }
  });

  describe("subagents reading untrusted artifacts are told so on spawn", () => {
    for (const rel of [...FENCED_WORKFLOWS]) {
      it(`${rel} names untrusted input on the Context: line above each Read:`, () => {
        const lines = read(rel).split("\n");
        const readLines = lines
          .map((line, i) => ({ line, i }))
          .filter(({ line }) => /^\s*Read:/.test(line) && UNTRUSTED_ARTIFACTS.test(line));
        expect(readLines.length, `no untrusted Read: paths found in ${rel}`).toBeGreaterThan(0);
        for (const { line, i } of readLines) {
          const context = lines[i - 1] ?? "";
          expect(
            /^\s*Context:/.test(context) && context.includes("Untrusted:"),
            `${rel}:${i + 1} reads untrusted artifacts but its Context: line does not say so — ${line.trim().slice(0, 60)}…`,
          ).toBe(true);
        }
      });
    }
  });
});
