import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { runCommand } from "../lib";
import { COMMANDS } from "../registry";
import {
  CLAMP_PROFILES,
  FENCE_CLOSE,
  FENCE_INSTRUCTION_LINES,
  FENCE_OPEN,
  consumerSection,
  contextCommand,
  fetchBlocks,
  humanBytes,
  keepRaw,
  summariseRecords,
  writeDiffArtifact,
  type ClampRecord,
} from "./context";
import { parseContextFetchStart } from "../../checks/before/context-fetch";

const FOOTER_2 = "> Dropped content was NOT read. Its absence is not evidence.";

let tmpDir: string;

beforeAll(() => {
  tmpDir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-context-")));
});

afterAll(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

async function run(argv: string[], cwd = tmpDir) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCommand(["context", ...argv, "--json"], [contextCommand], {
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

/** `n` filler lines `<prefix> <i>`; a test overwrites the few that matter. */
const quietLines = (n: number, prefix = "quiet line") =>
  Array.from({ length: n }, (_, i) => `${prefix} ${i}`);

/** Nine thousand lines where every third one is an `error` signal line. */
const DENSE_SIGNAL_LINES = Array.from({ length: 9000 }, (_, i) =>
  i % 3 === 0 ? `error ${i}` : "q",
);

/** The lines a clamped file keeps as content: no blanks, no [bkit] markers, no footer. */
const contentLines = (text: string) =>
  text.split("\n").filter((l) => l !== "" && !l.startsWith("> [bkit]") && l !== FOOTER_2);

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
    const body = contentLines(read(f));
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
    const body = quietLines(9000);
    body[4500] = "AssertionError: expected 3 to be 4";
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
    const body = quietLines(9000);
    for (let i = 0; i < body.length; i += 50) body[i] = `FAIL spec-${i} timed out`;
    const f = write("scattered.md", body.join("\n") + "\n");
    await clamp(f, "debug-evidence");
    const out = read(f);
    const signal = body.filter((l) => l.startsWith("FAIL"));
    expect(signal).toHaveLength(180);
    expect(signal.filter((l) => !out.includes(l))).toEqual([]);
  });

  it("matches the multibyte signal glyphs too", async () => {
    const body = quietLines(6000, "quiet");
    body[3000] = "  ✕ widget renders";
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
    const body = quietLines(9000);
    for (let i = 0; i < body.length; i += 1000) body[i] = `FAIL case ${i}`;
    const f = write("gaps.md", body.join("\n") + "\n");
    await clamp(f, "debug-evidence");
    const out = read(f);
    const gaps = [...out.matchAll(/^> \[bkit\] TRUNCATED HERE — \d+ lines? omitted\./gm)];
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
    const body = quietLines(3500, "q");
    body[7] = "é".repeat(3000);
    const f = write("multibyte.md", body.join("\n") + "\n");
    const r = await clamp(f, "debug-evidence");
    expect(r.json).toMatchObject({ clamped: true, lineCapped: 1, origLines: 3500 });
    const shortened = read(f).split("\n")[7]!;
    expect(shortened).toBe(`${"é".repeat(1000)} … [bkit] line shortened, 4000 bytes dropped`);
  });

  it("over the threshold but every line kept by signal context: untouched, not clamped", async () => {
    for (const [name, content] of [
      ["dense-signal.md", DENSE_SIGNAL_LINES],
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
    const body = quietLines(9000);
    body[4000] = "FAIL a";
    body[4006] = "FAIL b";
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

describe("bkit context clamp — per-context profiles (#697)", () => {
  it("names the ledger, base and per-context profiles", () => {
    expect(CLAMP_PROFILES).toEqual(["ledger", "debug-evidence", "ci", "e2e", "runtime"]);
  });

  /**
   * One section header per context, each carrying no base signal word, buried past the
   * kept head and tail. The `ci` marker is `bkit-github.md`'s `===== job … =====`; the
   * `e2e` marker is `bkit-playwright.md`'s `===== file: … =====`; the `runtime` marker is
   * `bkit-cloudrun.md`'s `===== cloud run … =====`.
   */
  const HEADERS: Record<string, string> = {
    ci: "===== job build =====",
    e2e: "===== file: test-results/checkout/missing.md (first 300 lines) =====",
    runtime: "===== cloud run my-service, freshness 4h — 3 entr(ies), newest 50 max =====",
  };
  const PROFILES = ["ci", "e2e", "runtime"];

  it("keeps each context's own section header and drops every other context's", async () => {
    for (const profile of PROFILES) {
      const line = HEADERS[profile]!;
      const body = quietLines(9000);
      body[4500] = line;
      const content = body.join("\n") + "\n";
      const own = write(`own-${profile}.md`, content);
      await clamp(own, profile);
      expect(read(own), `${profile} must keep its own header`).toContain(line);
      for (const other of [...PROFILES, "debug-evidence"].filter((p) => p !== profile)) {
        const file = write(`cross-${profile}-${other}.md`, content);
        await clamp(file, other);
        expect(read(file), `${other} must not keep ${profile}'s header`).not.toContain(line);
      }
    }
  });

  /**
   * Every banner a context's shipped blocks print must survive that context's profile.
   * Each banner below carries no base signal word, so only the profile whose block prints
   * it keeps it and every other profile drops it. The remaining shipped banners
   * (`supabase`, `inngest`, `stripe`, `expo`'s FAILURE runs, `===== failing steps …`)
   * carry `error` / `fail` in their own text and are kept by every profile already;
   * `sentry` prints no banner. Sourced from `.bkit/templates/context/`: `vercel`,
   * `cloudrun`, `resend`, `expo` (`runtime`); `expo-workflows` (`e2e`).
   */
  const CONTEXT_BANNERS: Record<string, string[]> = {
    runtime: [
      "===== cloud run my-service, freshness 4h — 3 entr(ies), newest 50 max =====",
      "===== resend outbound since 2026-01-01 — 1 send(s), 1 page(s) =====",
      "===== eas builds, newest 50 (ios) — 3 build(s) =====",
    ],
    e2e: [
      "===== eas workflow runs, newest 10 — 1 run(s) =====",
      "===== JUnit (first 300 lines) =====",
      "===== app JS console per flow (count, then the lines) =====",
      "===== distinct app messages =====",
    ],
  };

  it("keeps each context's own section banner and drops every other context's", async () => {
    for (const [profile, banners] of Object.entries(CONTEXT_BANNERS)) {
      for (const banner of banners) {
        const body = quietLines(9000);
        body[4500] = banner;
        const content = body.join("\n") + "\n";
        const own = write(`banner-own-${profile}.md`, content);
        await clamp(own, profile);
        expect(read(own), `${profile} must keep ${banner}`).toContain(banner);
        for (const other of [...PROFILES, "debug-evidence"].filter((p) => p !== profile)) {
          const file = write(`banner-cross-${profile}-${other}.md`, content);
          await clamp(file, other);
          expect(read(file), `${other} must not keep ${banner}`).not.toContain(banner);
        }
      }
    }
  });

  it("a ci artifact keeps a section header that carries none of the base signal words", async () => {
    const body = quietLines(9000);
    body[4500] = "===== job build ===== — the lines below belong to this job";
    const f = write("ci-header.md", body.join("\n") + "\n");
    const r = await clamp(f, "ci");
    expect(r.json).toMatchObject({ clamped: true });
    expect(read(f)).toContain("===== job build =====");
  });

  it("every evidence profile keeps a buried ===== TRUNCATED: … ===== line", async () => {
    // The page-cap line `.agents/context.md` § Authoring your own asks every block to print.
    const line = "===== TRUNCATED: stopped at CI_MAX_PAGES=5 — older runs NOT read =====";
    for (const profile of [...PROFILES, "debug-evidence"]) {
      const body = quietLines(9000);
      body[4500] = line;
      const f = write(`truncated-${profile}.md`, body.join("\n") + "\n");
      const r = await clamp(f, profile);
      expect(r.json, profile).toMatchObject({ clamped: true });
      expect(read(f), `${profile} must keep the TRUNCATED line`).toContain(line);
    }
  });
});

describe("bkit context clamp — per-context saving (#697)", () => {
  const record = (artifact: string, extra: Partial<ClampRecord> = {}): ClampRecord => ({
    artifact,
    clamped: true,
    origLines: 10,
    keptLines: 4,
    origBytes: 100,
    keptBytes: 40,
    lineCapped: 0,
    ceilingHit: false,
    raw: null,
    source: null,
    fetchedAt: null,
    ...extra,
  });
  const dir = "docs/plans/202608/logs/427-x";

  it("totals artifacts, lines, bytes and table / raw per context", () => {
    expect(
      summariseRecords([
        record(`${dir}/context-ci-github-1-1.md`, {
          render: "table",
          origLines: 10,
          keptLines: 4,
          origBytes: 100,
          keptBytes: 40,
        }),
        record(`${dir}/context-ci-1-1.md`, {
          render: "raw",
          origLines: 20,
          keptLines: 5,
          origBytes: 200,
          keptBytes: 50,
        }),
        record(`${dir}/context-runtime-vercel-1.md`, {
          render: "table",
          origLines: 8,
          keptLines: 8,
          origBytes: 80,
          keptBytes: 80,
        }),
      ]),
    ).toEqual({
      ci: {
        artifacts: 2,
        origLines: 30,
        keptLines: 9,
        origBytes: 300,
        keptBytes: 90,
        table: 1,
        raw: 1,
      },
      runtime: {
        artifacts: 1,
        origLines: 8,
        keptLines: 8,
        origBytes: 80,
        keptBytes: 80,
        table: 1,
        raw: 0,
      },
    });
  });

  it("counts a record whose render is absent, and skips a record naming no context-fetch context", () => {
    expect(
      summariseRecords([
        record(`${dir}/context-e2e-maestro-1.md`),
        record(`${dir}/context-e2e-2-1.md`, { render: "raw" }),
        record(`${dir}/run-tests-1.md`, { origLines: 999, keptLines: 1 }),
        record(`${dir}/context-tests-local-1.md`, { origLines: 999, keptLines: 1 }),
      ]),
    ).toEqual({
      e2e: {
        artifacts: 2,
        origLines: 20,
        keptLines: 8,
        origBytes: 200,
        keptBytes: 80,
        table: 0,
        raw: 1,
      },
    });
  });
});

describe("untouched originals (keepRaw)", () => {
  function gitDir(prefix: string) {
    const dir = fs.mkdtempSync(path.join(tmpDir, prefix));
    spawnSync("git", ["init", "-q"], { cwd: dir });
    return dir;
  }
  const outbox = (dir: string, ...rest: string[]) => path.join(dir, ".git", "bkit-outbox", ...rest);
  /** Every file under `root`, relative, so a test can say nothing landed there. */
  const filesUnder = (root: string): string[] =>
    fs.existsSync(root)
      ? (fs.readdirSync(root, { recursive: true }) as string[]).filter((f) =>
          fs.statSync(path.join(root, f)).isFile(),
        )
      : [];

  it("keepRaw copies the original byte-identical to {name}.raw.{ext} in the folder given", () => {
    const dir = gitDir("raw-");
    const src = path.join(dir, "docs/plans/202610/logs/1-x/run-tests-1.md");
    fs.mkdirSync(path.dirname(src), { recursive: true });
    const bytes = Buffer.from("caf\u00e9\r\nline 2\n\u0000end");
    fs.writeFileSync(src, bytes);
    const raw = keepRaw(src, outbox(dir, "1-x"));
    expect(raw).toBe(outbox(dir, "1-x", "run-tests-1.raw.md"));
    expect(fs.readFileSync(raw).equals(bytes)).toBe(true);
    const noExt = path.join(dir, "trace");
    fs.writeFileSync(noExt, "t\n");
    expect(path.basename(keepRaw(noExt, outbox(dir)))).toBe("trace.raw");
  });

  it("clamp keeps the original in the outbox, never under logs/, and the record names it with its source", async () => {
    const dir = gitDir("clamp-raw-");
    const artifact = "docs/plans/202610/logs/1-x/big.md";
    const content = lines(250);
    fs.mkdirSync(path.join(dir, path.dirname(artifact)), { recursive: true });
    fs.writeFileSync(path.join(dir, artifact), content);
    const r = await run(
      [
        "clamp",
        `--artifact=${artifact}`,
        "--profile=ledger",
        "--fid=1-x",
        "--step=s",
        "--source=gh run view 42 --log-failed",
      ],
      dir,
    );
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({
      clamped: true,
      raw: ".git/bkit-outbox/1-x/big.raw.md",
      source: "gh run view 42 --log-failed",
    });
    expect(r.json.fetchedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    expect(read(outbox(dir, "1-x", "big.raw.md"))).toBe(content);
    expect(filesUnder(path.join(dir, "docs"))).toEqual(["plans/202610/logs/1-x/big.md"]);
    const logged = await run(["clamp-log", "--fid=1-x", "--step=s"], dir);
    expect(logged.json.records).toEqual([r.json]);
  });

  it("a file left whole keeps no copy: raw is null", async () => {
    const dir = gitDir("clamp-whole-");
    fs.writeFileSync(path.join(dir, "small.md"), lines(3));
    const r = await run(
      ["clamp", "--artifact=small.md", "--profile=ledger", "--fid=1-x", "--step=s"],
      dir,
    );
    expect(r.json).toMatchObject({ clamped: false, raw: null, source: null });
    expect(fs.existsSync(outbox(dir, "1-x"))).toBe(false);
  });

  it("outside a git repo the original has nowhere to go: clamped, raw null, and it says so", async () => {
    const f = write("no-repo/big.md", lines(250));
    const r = await clamp(f, "ledger");
    expect(r.json).toMatchObject({ clamped: true, raw: null });
    expect(r.err).toContain("original not kept");
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
    expect(r.json.provision).toEqual([]);
    expect(r.err).toContain("NO BLOCKS CONFIGURED");
  });

  it("emits each provision block's bash body below bkit:end, in file order, and no fetch body", async () => {
    write(
      "prov/.agents/context.md",
      [
        "<!-- context-fetch:provision managed-example -->",
        "```bash",
        "never",
        "```",
        "<!-- context-fetch:end -->",
        "<!-- bkit:end -->",
        "<!-- context-fetch:start a context=ci -->",
        "```bash",
        "fetch-body",
        "```",
        "<!-- context-fetch:end -->",
        "<!-- context-fetch:provision a -->",
        "```bash",
        "command -v a || install-a",
        "```",
        "<!-- context-fetch:end -->",
        "<!-- context-fetch:provision b -->",
        "```bash",
        "command -v b || install-b",
        "```",
        "<!-- context-fetch:end -->",
      ].join("\n"),
    );
    const r = await run(["list-blocks"], path.join(tmpDir, "prov"));
    expect(r.json.provision).toEqual(["command -v a || install-a", "command -v b || install-b"]);
    expect(r.json.blocks).toHaveLength(1);
  });
});

describe("bkit context provision", () => {
  const recipe = (name: string, body: string) => [
    `<!-- context-fetch:provision ${name} -->`,
    "```bash",
    body,
    "```",
    "<!-- context-fetch:end -->",
  ];
  const unavailable = (dir: string) => path.join(dir, ".bkit/.unavailable");

  it("runs every recipe, lists each failed one with its last error line, and keeps going", async () => {
    const dir = path.join(tmpDir, "pv");
    write(
      "pv/.agents/context.md",
      [
        "<!-- bkit:end -->",
        ...recipe(
          "db",
          'echo "pulling" >&2\necho "db unavailable: 3 GB free, needs 10 GB" >&2\nexit 1',
        ),
        ...recipe("ok", "touch ran-ok"),
        ...recipe("cli", "false"),
      ].join("\n"),
    );
    const r = await run(["provision"], dir);
    expect(r.code).toBe(0);
    expect(fs.existsSync(path.join(dir, "ran-ok"))).toBe(true);
    expect(r.json.recipes).toBe(3);
    expect(r.json.unavailable).toEqual([
      { name: "db", reason: "db unavailable: 3 GB free, needs 10 GB" },
      { name: "cli", reason: "exit 1" },
    ]);
    expect(r.json.file).toBe(".bkit/.unavailable");
    expect(fs.readFileSync(unavailable(dir), "utf-8")).toBe(
      "db: db unavailable: 3 GB free, needs 10 GB\ncli: exit 1\n",
    );
  });

  it("removes a stale failure file once every recipe succeeds", async () => {
    const dir = path.join(tmpDir, "pv-ok");
    write("pv-ok/.agents/context.md", ["<!-- bkit:end -->", ...recipe("ok", "true")].join("\n"));
    write("pv-ok/.bkit/.unavailable", "ok: old failure\n");
    const r = await run(["provision"], dir);
    expect(r.json).toMatchObject({ recipes: 1, unavailable: [], file: null });
    expect(fs.existsSync(unavailable(dir))).toBe(false);
  });

  it("with no recipes, runs nothing and removes a stale failure file", async () => {
    const dir = fs.mkdtempSync(path.join(tmpDir, "pv-none-"));
    write(`${path.basename(dir)}/.bkit/.unavailable`, "x: old\n");
    const r = await run(["provision"], dir);
    expect(r.json).toMatchObject({ recipes: 0, unavailable: [], file: null });
    expect(fs.existsSync(unavailable(dir))).toBe(false);
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

  it("a clamped fetch keeps the whole payload in the outbox; the record carries the block body as its source", async () => {
    const dir = workspace();
    const body = 'printf "FIRST\\n"; seq 1 9000 | sed "s/$/ quiet payload/"';
    const r = await run(["run-block", "--idx=1", script(dir, body), ...base], dir);
    expect(r.json.clamp).toMatchObject({
      clamped: true,
      raw: ".git/bkit-outbox/427-x/context-ci-github-1-1.raw.md",
      source: body,
    });
    expect(r.json.clamp.fetchedAt).toMatch(/Z$/);
    const raw = read(path.join(dir, ".git/bkit-outbox/427-x/context-ci-github-1-1.raw.md"));
    expect(raw.split("\n")).toHaveLength(9002);
    expect(raw).not.toContain(FENCE_OPEN);
    expect(
      fs
        .readdirSync(path.join(dir, "docs/plans/202608/logs/427-x"))
        .filter((f) => f.includes(".raw")),
    ).toEqual([]);
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

  it("clamps a ci block with the ci profile and a runtime block without it", async () => {
    const dir = workspace();
    const body =
      '{ seq 1 4499 | sed "s/$/ quiet payload/"; echo "===== job build ====="; seq 4500 9000 | sed "s/$/ quiet payload/"; }';
    const ci = await run(["run-block", "--idx=1", script(dir, body), ...base], dir);
    expect(ci.json.clamp).toMatchObject({ clamped: true });
    expect(read(path.join(dir, ci.json.artifact))).toContain("===== job build =====");
    const rt = await run(["run-block", "--idx=2", script(dir, body), ...base], dir);
    expect(rt.json.clamp).toMatchObject({ clamped: true });
    expect(read(path.join(dir, rt.json.artifact))).not.toContain("===== job build =====");
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
    // render is absent on these run-block records: counted as neither table nor raw.
    const one = {
      artifacts: 1,
      origLines: 1,
      keptLines: 1,
      origBytes: 3,
      keptBytes: 3,
      table: 0,
      raw: 0,
    };
    expect(r.json.clampSummary).toEqual({ ci: one, runtime: one });
  });

  it("finalise totals a rendered fetch per context (table vs raw)", async () => {
    const dir = workspace();
    const fetched = await run(
      ["fetch", "--idx=1", script(dir, `echo '[{"name":"widget","state":"open"}]'`), ...base],
      dir,
    );
    expect(fetched.json.render).toBe("table");
    const r = await run(["finalise", ...base], dir);
    expect(r.json.verdict).toBe("PASS");
    expect(r.json.clampSummary).toEqual({
      ci: expect.objectContaining({ artifacts: 1, table: 1, raw: 0 }),
    });
  });

  it("finalise totals a rendered fetch's origBytes as the bytes the block printed", async () => {
    const dir = workspace();
    const printed = `[${Array.from({ length: 3 }, (_, i) => `{"name":"widget-${i}","state":"open"}`).join(",")}]`;
    const fetched = await run(["fetch", "--idx=1", script(dir, `echo '${printed}'`), ...base], dir);
    expect(fetched.json.render).toBe("table");
    const r = await run(["finalise", ...base], dir);
    const ci = r.json.clampSummary.ci;
    expect(ci.origLines).toBe(1);
    expect(ci.origBytes).toBe(Buffer.byteLength(`${printed}\n`));
    // The table is what the artifact holds: header, divider and one row per object.
    expect(ci.keptLines).toBe(5);
    expect(ci.keptBytes).not.toBe(ci.origBytes);
  });

  it("finalise with no artifacts is FAIL", async () => {
    const dir = workspace();
    const r = await run(["finalise", ...base], dir);
    expect(r.json).toMatchObject({ verdict: "FAIL", artifacts: [], clamped: [] });
  });

  it("finalise --record writes and commits the context-fetch row, and prints the step comment", async () => {
    const dir = workspace();
    const g = (...args: string[]) =>
      spawnSync("git", ["-c", "user.email=t@t", "-c", "user.name=t", ...args], {
        cwd: dir,
        encoding: "utf-8",
      }).stdout.trim();
    spawnSync("git", ["config", "user.email", "t@t"], { cwd: dir });
    spawnSync("git", ["config", "user.name", "t"], { cwd: dir });
    g("commit", "-q", "--allow-empty", "-m", "base");
    await run(["run-block", "--idx=1", script(dir, "echo ci"), ...base], dir);
    const status = "docs/plans/202608/logs/427-x/status.jsonl";
    fs.writeFileSync(
      path.join(dir, status),
      `${JSON.stringify({ type: "workflow-started", workflow: "debug", at: "2026-08-01T00:00:00Z" })}\n`,
    );
    const r = await run(
      [
        "finalise",
        ...base,
        `--file=${status}`,
        "--record",
        "--message=chore(427-x): fetch-context attempt 1",
        "--number=4",
        "--title=Fetch Context",
      ],
      dir,
    );
    expect(r.code).toBe(0);
    expect(r.json.row).toMatchObject({
      type: "step-done",
      workflow: "debug",
      step: "context-fetch",
      verdict: "PASS",
      attempt: 1,
      artifacts: ["docs/plans/202608/logs/427-x/context-ci-github-1-1.md"],
      contextsConfigured: ["runtime", "ci", "web"],
      clampSummary: {
        ci: {
          artifacts: 1,
          origLines: 1,
          keptLines: 1,
          origBytes: 3,
          keptBytes: 3,
          table: 0,
          raw: 0,
        },
      },
    });
    expect(r.json.commit).toBe(g("rev-parse", "HEAD"));
    expect(g("log", "-1", "--format=%s")).toBe("chore(427-x): fetch-context attempt 1");
    expect(r.json.comment).toContain("Step 4 — Fetch Context");
    expect(r.json.comment).toContain("Verdict: PASS");
    expect(fs.readFileSync(r.json.commentFile, "utf-8")).toBe(r.json.comment);
    expect(g("show", "--name-only", "--format=", "HEAD")).not.toContain("tmp/bkit-comment-");
  });

  it("finalise --record needs --file", async () => {
    expect((await run(["finalise", ...base, "--record", "--message=m"], workspace())).code).toBe(2);
  });
});

describe("bkit context diff", () => {
  const g = (dir: string, ...args: string[]) =>
    spawnSync("git", ["-c", "user.email=t@t", "-c", "user.name=t", ...args], {
      cwd: dir,
      encoding: "utf-8",
    }).stdout.trim();
  const put = (dir: string, file: string, content: string) => {
    fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
    fs.writeFileSync(path.join(dir, file), content);
  };
  const commitAll = (dir: string, msg: string) => {
    g(dir, "add", "-A");
    g(dir, "commit", "-q", "-m", msg);
    return g(dir, "rev-parse", "HEAD");
  };
  const numbered = (n: number, prefix: string) =>
    Array.from({ length: n }, (_, i) => `${prefix} ${i + 1}`).join("\n") + "\n";
  /** A repo on `dev` whose base commit is also `origin/dev`. */
  function repo(name: string): string {
    const dir = path.join(tmpDir, "diff", name);
    fs.mkdirSync(dir, { recursive: true });
    g(dir, "init", "-q", "-b", "dev");
    put(dir, "src.txt", "a\nb\n");
    put(dir, "docs/plans/202610/1-x-plan.md", "plan v1\n");
    commitAll(dir, "base");
    g(dir, "update-ref", "refs/remotes/origin/dev", "HEAD");
    return dir;
  }
  const ARTIFACT = "docs/plans/202610/logs/1-x/build-diff-1.md";

  it("writes origin/dev...HEAD without docs/plans/** and prints the numstat numbers", async () => {
    const dir = repo("whole");
    put(dir, "src.txt", "a\nb\nc\n");
    put(dir, "new.txt", "one\ntwo\nthree\n");
    put(dir, "docs/plans/202610/1-x-plan.md", "plan v2\nmore\n");
    commitAll(dir, "work");
    const r = await run(["diff", `--artifact=${ARTIFACT}`], dir);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({
      artifact: ARTIFACT,
      base: "origin/dev",
      range: "origin/dev...HEAD",
      filesChanged: 2,
      linesAdded: 4,
      linesDeleted: 0,
      linesChanged: 4,
      partial: false,
      clamp: { artifact: ARTIFACT, clamped: false, ceilingHit: false },
    });
    const body = read(path.join(dir, ARTIFACT));
    expect(body).toContain("diff --git a/new.txt b/new.txt");
    expect(body).toContain("+c\n");
    expect(body).not.toContain("1-x-plan.md");
    expect(r.json.diffLines).toBe(body.split("\n").length - 1);
    expect(r.err).toBe("");
  });

  it("--base narrows the range to the commits after a group's start sha", async () => {
    const dir = repo("base");
    put(dir, "first.txt", "1\n");
    const start = commitAll(dir, "group 1");
    put(dir, "second.txt", "2\n2\n");
    commitAll(dir, "group 2");
    const r = await run(["diff", `--artifact=${ARTIFACT}`, `--base=${start}`], dir);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ base: start, filesChanged: 1, linesAdded: 2 });
    const body = read(path.join(dir, ARTIFACT));
    expect(body).toContain("second.txt");
    expect(body).not.toContain("first.txt");
  });

  it("diff from a group start covers only the group's commits", async () => {
    const dir = repo("group-start");
    put(dir, "group1.txt", "one\n");
    commitAll(dir, "group 1 work");
    const all = async (argv: string[]) => {
      const out: string[] = [];
      const code = await runCommand([...argv, "--json"], COMMANDS, {
        classicVerbs: new Set(["status"]),
        cwd: dir,
        io: { stdout: (t) => out.push(t), stderr: () => {} },
      });
      return { code, json: JSON.parse(out.join("")) };
    };
    const status = "docs/plans/202610/logs/1-x/status.jsonl";
    const start = await all([
      "steps",
      "done",
      `--file=${status}`,
      "--workflow=build",
      "--step=build-group-start",
      "--group=2",
      "--commit=none",
    ]);
    expect(start.code).toBe(0);
    put(dir, "group2.txt", "two\ntwo\n");
    commitAll(dir, "group 2 work");
    const routed = await all([
      "status",
      "route",
      `--file=${status}`,
      "--workflow=build",
      "--step=build-group-start",
      "--group=2",
    ]);
    expect(routed.json.parentSha).toBe(start.json.row.parentSha);
    const r = await run(["diff", `--artifact=${ARTIFACT}`, `--base=${routed.json.parentSha}`], dir);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ filesChanged: 1, linesAdded: 2 });
    const body = read(path.join(dir, ARTIFACT));
    expect(body).toContain("group2.txt");
    expect(body).not.toContain("group1.txt");
  });

  it("a base that is not a commit exits 5 and writes nothing", async () => {
    const dir = repo("nobase");
    const r = await run(["diff", `--artifact=${ARTIFACT}`, "--base=origin/nowhere"], dir);
    expect(r.code).toBe(5);
    expect(r.err).toContain("origin/nowhere does not name a commit");
    expect(fs.existsSync(path.join(dir, ARTIFACT))).toBe(false);
  });

  it("an empty range writes a one-line note and zero numbers", async () => {
    const dir = repo("empty");
    put(dir, "docs/plans/202610/1-x-plan.md", "plan v2\n");
    commitAll(dir, "plan only");
    const r = await run(["diff", `--artifact=${ARTIFACT}`], dir);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({
      filesChanged: 0,
      linesChanged: 0,
      diffLines: 0,
      partial: false,
    });
    expect(read(path.join(dir, ARTIFACT))).toBe(
      "No changes in origin/dev...HEAD outside docs/plans/**.\n",
    );
  });

  it("over the guard: the first line says so, then --stat, then the largest files first, each cut", async () => {
    const dir = repo("guard");
    put(dir, "big.txt", numbered(12000, "big"));
    put(dir, "mid.txt", numbered(700, "mid"));
    put(dir, "small.txt", "s1\ns2\n");
    commitAll(dir, "large");
    const r = await run(
      ["diff", `--artifact=${ARTIFACT}`, "--fid=1-x", "--step=build-diff", "--attempt=1"],
      dir,
    );
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ filesChanged: 3, linesAdded: 12702, partial: true });
    expect(r.json.diffLines).toBeGreaterThan(10000);
    expect(r.json.clamp).toMatchObject({
      clamped: true,
      origLines: r.json.diffLines,
      ceilingHit: false,
    });
    expect(r.json.clamp.keptLines).toBeLessThan(r.json.diffLines);
    expect(r.err).toContain("over the 10000-line guard");
    const body = read(path.join(dir, ARTIFACT));
    const lines = body.split("\n");
    expect(lines[0]).toMatch(
      /^# partial diff coverage: origin\/dev\.\.\.HEAD has \d+ diff lines across 3 files; showing the 3 largest files, 500 lines each/,
    );
    expect(body).toContain(" 3 files changed, 12702 insertions(+)");
    const order = ["### big.txt", "### mid.txt", "### small.txt"].map((h) => body.indexOf(h));
    expect(order.every((i) => i >= 0)).toBe(true);
    expect(order).toEqual([...order].sort((a, b) => a - b));
    const bigStart = lines.indexOf("### big.txt");
    // big's kept lines, its "not shown" marker, a blank line, then the next heading.
    const bigEnd = lines.indexOf("### mid.txt") - 2;
    expect(bigEnd - bigStart - 1).toBe(500);
    expect(lines[bigEnd]).toMatch(/^# \d+ more lines of big\.txt not shown$/);
    expect(body).toContain("+s2\n");
    expect(body).not.toContain("more lines of small.txt");
    expect(r.json.clamp.keptLines).toBe(lines.length - 1);
    const log = await run(["clamp-log", "--fid=1-x", "--step=build-diff", "--attempt=1"], dir);
    expect(log.json.records).toEqual([r.json.clamp]);
  });

  it("--reset-log empties the step's clamp log before the record lands", async () => {
    const dir = repo("reset");
    put(dir, "src.txt", "a\nb\nc\n");
    commitAll(dir, "work");
    const flags = [`--artifact=${ARTIFACT}`, "--fid=1-x", "--step=build-diff"];
    await run(["diff", ...flags], dir);
    await run(["diff", ...flags], dir);
    const reset = await run(["diff", ...flags, "--reset-log"], dir);
    expect(reset.code).toBe(0);
    const log = await run(["clamp-log", "--fid=1-x", "--step=build-diff"], dir);
    expect(log.json.records).toEqual([reset.json.clamp]);
    expect((await run(["diff", `--artifact=${ARTIFACT}`, "--reset-log"], dir)).code).toBe(2);
  });

  it("partial: prints and writes the files not shown whole, and keeps the whole diff in the outbox", async () => {
    const dir = repo("omitted");
    put(dir, "a.txt", numbered(6, "a"));
    put(dir, "b.txt", numbered(5, "b"));
    put(dir, "c.txt", numbered(4, "c"));
    commitAll(dir, "three files");
    const out = path.join(dir, ARTIFACT);
    const res = writeDiffArtifact(
      dir,
      out,
      ARTIFACT,
      "origin/dev...HEAD",
      { fullLines: 5, topFiles: 2, perFileLines: 11, totalLines: 100 },
      { rawDir: path.join(dir, ".git/bkit-outbox/1-x") },
    );
    expect(res.partial).toBe(true);
    expect(res.omitted).toEqual(["a.txt", "c.txt"]);
    const body = read(out);
    expect(body.split("\n")[1]).toBe("# not shown whole: a.txt, c.txt");
    expect(res.record.raw).toBe(".git/bkit-outbox/1-x/build-diff-1.raw.md");
    expect(res.record.source).toBe("git diff origin/dev...HEAD -- . ':(exclude)docs/plans/**'");
    const raw = read(path.join(dir, ".git/bkit-outbox/1-x/build-diff-1.raw.md"));
    expect(raw).toContain("+c 4");
    expect(raw).toContain("+a 6");
  });

  it("whole: nothing omitted and no copy kept", async () => {
    const dir = repo("whole-raw");
    put(dir, "src.txt", "a\nb\nc\n");
    commitAll(dir, "work");
    const r = await run(["diff", `--artifact=${ARTIFACT}`, "--fid=1-x", "--step=d"], dir);
    expect(r.json).toMatchObject({ partial: false, omitted: [], clamp: { raw: null } });
    expect(fs.existsSync(path.join(dir, ".git/bkit-outbox/1-x"))).toBe(false);
  });

  it("the budget honours topFiles and totalLines and says when the ceiling cut a file", () => {
    const dir = repo("ceiling");
    put(dir, "a.txt", numbered(6, "a"));
    put(dir, "b.txt", numbered(5, "b"));
    put(dir, "c.txt", numbered(4, "c"));
    commitAll(dir, "three files");
    const out = path.join(dir, ARTIFACT);
    const res = writeDiffArtifact(dir, out, ARTIFACT, "origin/dev...HEAD", {
      fullLines: 5,
      topFiles: 2,
      perFileLines: 3,
      totalLines: 12,
    });
    expect(res.partial).toBe(true);
    expect(res.record.ceilingHit).toBe(true);
    const body = read(out);
    expect(body.match(/^### /gm)?.length).toBe(1);
    expect(body).toContain("### a.txt");
    expect(body).toContain("# total line budget reached; b.txt and smaller files not shown");
    expect(body).not.toContain("c.txt\n###");
    expect(res.record.keptLines).toBe(body.split("\n").length - 1);
  });
});

// ---------------------------------------------------------------------------
// brief
// ---------------------------------------------------------------------------

describe("bkit context brief", () => {
  const task = (n: number, title: string, done: boolean, extra: string[] = []) => [
    `<!-- bkit:task ${n} start -->`,
    "",
    `- [${done ? "x" : " "}] **TASK ${n}:** ${title}`,
    `  - **UPDATE:** \`src/t${n}.ts\`: task ${n} code`,
    ...extra,
    `  - **DONE WHEN:** task ${n} works`,
    `  - **TEST FIRST:** n/a — docs only`,
    "",
    `<!-- bkit:task ${n} end -->`,
    "",
  ];
  const group = (n: number, title: string, tasks: string[][]) => [
    `<!-- bkit:group ${n} start -->`,
    "",
    `### GROUP ${n}: ${title}`,
    "",
    ...tasks.flat(),
    `<!-- bkit:group ${n} end -->`,
    "",
  ];
  const PLAN = [
    "# Widget Status Implementation Plan",
    "",
    "## Context & Goals",
    "",
    "Widgets need a status the API can set.",
    "",
    "## Acceptance Scenario",
    "",
    "### Narrative",
    "",
    "A user marks a widget done and sees it move.",
    "",
    "### Success Criteria",
    "",
    "- The status survives a reload.",
    "",
    "### Edge Cases",
    "",
    "Edge text that stays out of the brief.",
    "",
    "## Out of Scope",
    "",
    "- Bulk status changes.",
    "",
    "## Agent Execution Runbook",
    "",
    ...group(1, "Schema", [
      task(1, "Add the status column", true),
      task(2, "Add the status type", false),
    ]),
    ...group(2, "API", [
      task(3, "Set the status", false, ["  - **DEPENDS ON:** 1, 2"]),
      task(4, "Validate the status", false),
      task(5, "Log the change", false),
    ]),
    ...group(3, "UI", [task(6, "Show the status", false, ["  - **DEPENDS ON:** 3"])]),
  ].join("\n");

  /** A logs folder where group 1 is done (task 2 by its DONE line) and group 2 has task 4 DONE. */
  function setup(name: string) {
    const dir = path.join(tmpDir, "brief", name);
    fs.mkdirSync(dir, { recursive: true });
    const plan = path.join(dir, "1-x-plan.md");
    fs.writeFileSync(plan, PLAN);
    const logs = path.join(dir, "logs");
    fs.mkdirSync(logs, { recursive: true });
    fs.writeFileSync(path.join(logs, "build-plan-execute-1-log.md"), "DONE — TASK 2\n");
    fs.writeFileSync(
      path.join(logs, "build-plan-execute-2-log.md"),
      "notes\nDONE — TASK 4: validated\n",
    );
    return { dir, plan, logs };
  }

  it("brief --next picks the first group with an open task", async () => {
    const { dir, plan, logs } = setup("next");
    const r = await run(["brief", `--plan=${plan}`, "--next", `--dir=${logs}`], dir);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ group: 2, tasks: [3, 5] });
    expect(r.json.artifact).toBe(path.join(logs, "build-brief-2-1.md"));
    const body = read(r.json.artifact);
    expect(body).toContain("Widgets need a status the API can set.");
    expect(body).toContain("A user marks a widget done and sees it move.");
    expect(body).toContain("- The status survives a reload.");
    expect(body).toContain("- Bulk status changes.");
    expect(body).not.toContain("Edge text that stays out of the brief.");
    expect(body).toMatch(/Group 1: Schema — done/);
    expect(body).toMatch(/Group 2: API — this group/);
    expect(body).toMatch(/Group 3: UI — next/);
    // A second brief for the same group takes the next number.
    const again = await run(["brief", `--plan=${plan}`, "--next", `--dir=${logs}`], dir);
    expect(again.json.artifact).toBe(path.join(logs, "build-brief-2-2.md"));
  });

  it("brief --next with every task done writes nothing and reports no group", async () => {
    const { dir, plan, logs } = setup("all-done");
    fs.writeFileSync(
      path.join(logs, "build-plan-execute-2-log.md"),
      "DONE — TASK 3\nDONE — TASK 4\nDONE — TASK 5\n",
    );
    fs.writeFileSync(path.join(logs, "build-plan-execute-3-log.md"), "DONE — TASK 6\n");
    const r = await run(["brief", `--plan=${plan}`, "--next", `--dir=${logs}`], dir);
    expect(r.code).toBe(0);
    expect(r.json).toEqual({
      artifact: null,
      bytes: 0,
      group: null,
      tasks: [],
      workBytes: 0,
      workCap: 8192,
    });
    expect(fs.readdirSync(logs).some((f) => f.startsWith("build-brief-"))).toBe(false);
  });

  it("brief leaves out tasks with a DONE line", async () => {
    const { dir, plan, logs } = setup("done-line");
    const r = await run(["brief", `--plan=${plan}`, "--group=2", `--dir=${logs}`], dir);
    expect(r.code).toBe(0);
    const work = read(r.json.artifact).split("## The work")[1]!;
    expect(work).toContain("- [ ] **TASK 3:** Set the status");
    expect(work).toContain("- [ ] **TASK 5:** Log the change");
    expect(work).not.toContain("**TASK 4:**");
  });

  it("brief carries DEPENDS ON summaries from earlier groups", async () => {
    const { dir, plan, logs } = setup("depends");
    const r = await run(["brief", `--plan=${plan}`, "--group=2", `--dir=${logs}`], dir);
    const work = read(r.json.artifact).split("## The work")[1]!;
    expect(work).toContain("- TASK 1 (group 1, done): Add the status column — `src/t1.ts`");
    expect(work).toContain("- TASK 2 (group 1, done): Add the status type — `src/t2.ts`");
    // Group 1's task blocks are not copied in whole.
    expect(work).not.toContain("**TASK 1:**");
    expect(work).not.toContain("task 1 works");
  });

  it("brief includes the note file under deviations", async () => {
    const { dir, plan, logs } = setup("note");
    const note = path.join(dir, "note.md");
    fs.writeFileSync(note, "Task 3 must keep the old column name.\n");
    const r = await run(
      ["brief", `--plan=${plan}`, "--group=2", `--dir=${logs}`, `--note-file=${note}`],
      dir,
    );
    const body = read(r.json.artifact);
    expect(body.split("## Deviations")[1]).toContain("Task 3 must keep the old column name.");
    const plain = await run(["brief", `--plan=${plan}`, "--group=2", `--dir=${logs}`], dir);
    expect(read(plain.json.artifact)).not.toContain("## Deviations");
  });

  it("brief names a red already recorded for an open task", async () => {
    const { dir, plan, logs } = setup("red");
    const status = path.join(dir, "status.jsonl");
    fs.writeFileSync(
      status,
      JSON.stringify({
        type: "step-done",
        workflow: "build",
        step: "build-task-red",
        task: 5,
        test: "src/t5.test.ts",
        testName: "logs the change",
      }) + "\n",
    );
    const r = await run(
      ["brief", `--plan=${plan}`, "--group=2", `--dir=${logs}`, `--file=${status}`],
      dir,
    );
    expect(read(r.json.artifact)).toContain(
      "TASK 5: red already recorded for `src/t5.test.ts` `logs the change` — test written and seen failing; code may be partly done in the files it names",
    );
  });

  it("brief prints path and sizes only", async () => {
    const { dir, plan, logs } = setup("stdout");
    const r = await run(["brief", `--plan=${plan}`, "--group=2", `--dir=${logs}`], dir);
    expect(Object.keys(r.json).sort()).toEqual([
      "artifact",
      "bytes",
      "group",
      "tasks",
      "workBytes",
      "workCap",
    ]);
    expect(r.json.bytes).toBe(fs.statSync(r.json.artifact).size);
    const work = "## The work" + read(r.json.artifact).split("## The work")[1]!;
    expect(r.json.workBytes).toBe(Buffer.byteLength(work.trimEnd() + "\n"));
    expect(r.json.workCap).toBe(8192);
    expect(JSON.stringify(r.json)).not.toContain("Set the status");
    expect(r.err).toBe("");
  });

  /** The setup plan with a Reuse Inventory and Architecture section before the runbook. */
  function setupWithSections(name: string, arch: (file: string) => string[]) {
    const s = setup(name);
    const sections = [
      "## Reuse Inventory",
      "",
      "| Capability | File | Search performed | Existing candidates | Decision | Justification |",
      "| --- | --- | --- | --- | --- | --- |",
      "| set status | `src/t3.ts` | grep setStatus | `src/t3.ts` | EXTEND | add the setter |",
      "| validate status | `src/t4.ts` | grep validate | `src/t4.ts` | EXTEND | add the check |",
      "| log change | `./src/t5.ts` | grep log | None | NEW | (a) no candidate |",
      "| show status | `src/t6.ts` | grep show | `src/t6.ts` | EXTEND | add the badge |",
      "",
      "## Architecture & Component Changes",
      "",
      "### API",
      "",
      ...arch("src/t3.ts"),
      ...arch("src/t5.ts"),
      "### UI",
      "",
      ...arch("src/t6.ts"),
      "## Agent Execution Runbook",
    ].join("\n");
    fs.writeFileSync(s.plan, PLAN.replace("## Agent Execution Runbook", sections));
    return s;
  }
  const smallArch = (file: string) => [
    `#### [MODIFY] \`${file}\``,
    "",
    `- **Existence Check:** ${file} exists.`,
    `- ${file} gains its part.`,
    "",
  ];

  it("brief carries the Reuse Inventory rows and Architecture entries for the group's files", async () => {
    const { dir, plan, logs } = setupWithSections("sections", smallArch);
    const r = await run(["brief", `--plan=${plan}`, "--group=2", `--dir=${logs}`], dir);
    expect(r.code).toBe(0);
    const work = read(r.json.artifact).split("## The work")[1]!;
    const inventory = work.split("### Reuse Inventory rows")[1]!.split("###")[0]!;
    expect(inventory).toContain("| Capability | File |");
    expect(inventory).toContain("| set status | `src/t3.ts` |");
    expect(inventory).toContain("| log change | `./src/t5.ts` |");
    // Task 4 is done and task 6 is in group 3: their rows stay out.
    expect(inventory).not.toContain("src/t4.ts");
    expect(inventory).not.toContain("src/t6.ts");
    const archPart = work.split("### Architecture entries")[1]!;
    expect(archPart).toContain("#### [MODIFY] `src/t3.ts`");
    expect(archPart).toContain("- src/t3.ts gains its part.");
    expect(archPart).toContain("#### [MODIFY] `src/t5.ts`");
    expect(archPart).not.toContain("src/t6.ts");
    expect(work).not.toContain("left out");
    expect(r.err).toBe("");
  });

  it("brief leaves out entries past the 8KB work cap and says how many and where", async () => {
    const bigArch = (file: string) => [
      `#### UPDATE \`${file}\``,
      "",
      ...Array.from({ length: 60 }, (_, i) => `- ${file} detail ${i}: ${"x".repeat(60)}`),
      "",
    ];
    const { dir, plan, logs } = setupWithSections("cap", bigArch);
    const r = await run(["brief", `--plan=${plan}`, "--group=2", `--dir=${logs}`], dir);
    expect(r.code).toBe(0);
    const work = read(r.json.artifact).split("## The work")[1]!;
    expect(work).toContain("| set status | `src/t3.ts` |");
    expect(work).toContain("#### UPDATE `src/t3.ts`");
    expect(work).not.toContain("#### UPDATE `src/t5.ts`");
    expect(work).toContain(
      `Reuse Inventory rows left out: 0; Architecture entries left out: 1 — read them in ${plan} § Reuse Inventory and § Architecture & Component Changes.`,
    );
    expect(r.json.workBytes).toBeLessThanOrEqual(8192);
    expect(r.err).toBe("");
  });

  it("brief refuses a group the plan does not have", async () => {
    const { dir, plan, logs } = setup("nogroup");
    const r = await run(["brief", `--plan=${plan}`, "--group=9", `--dir=${logs}`], dir);
    expect(r.code).toBe(2);
    expect(r.err).toContain("no group 9");
  });
});
