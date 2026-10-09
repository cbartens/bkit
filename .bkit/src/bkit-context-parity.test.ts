/**
 * bkit-context-parity.test.ts — `bkit context` answers exactly as the shell it
 * replaces, while both exist: `bkit-context-clamp.sh`, plan Step 4's ledger
 * scan, and debug Step 4's context-fetch blocks.
 *
 * The workflow blocks are run as SHIPPED, cut out of the workflow files, so a
 * copy here cannot drift. Retire with the script and the inline blocks.
 */

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterAll, describe, expect, it } from "vitest";

import { runCommand } from "./commands/lib";
import { contextCommand, consumerSection, fetchBlocks } from "./commands/workflow/context";

const REPO = path.resolve(__dirname, "../..");
const SCRIPTS = path.join(REPO, ".bkit/templates/.bkit/scripts");
const CLAMP_SH = path.join(SCRIPTS, "bkit-context-clamp.sh");
const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-context-parity-")));
afterAll(() => fs.rmSync(dir, { recursive: true, force: true }));

async function command(argv: string[], cwd = dir) {
  const out: string[] = [];
  const code = (await runCommand(["context", ...argv], [contextCommand], {
    classicVerbs: new Set(),
    cwd,
    io: { stdout: (t) => out.push(t), stderr: () => undefined },
  }))!;
  return { code, json: out.length ? JSON.parse(out.join("")) : undefined };
}

/** The fenced bash block in `rel` containing `needle`, de-indented, fences dropped. */
function shippedBlock(rel: string, needle: string): string {
  const lines = fs.readFileSync(path.join(REPO, rel), "utf-8").split("\n");
  for (let open = 0; open < lines.length; open++) {
    if (!/^\s*`{3,}bash$/.test(lines[open]!)) continue;
    const fence = lines[open]!.trim().replace("bash", "");
    const indent = /^\s*/.exec(lines[open]!)![0];
    let close = open + 1;
    while (lines[close]!.trim() !== fence) close++;
    const body = lines.slice(open + 1, close);
    if (body.some((l) => l.includes(needle))) {
      return body.map((l) => (l.startsWith(indent) ? l.slice(indent.length) : l)).join("\n");
    }
    open = close;
  }
  throw new Error(`no bash block in ${rel} contains ${needle}`);
}

const lines = (n: number, width = 8) =>
  Array.from({ length: n }, (_, i) => `L${i + 1}`.padEnd(width - 1, "x")).join("\n") + "\n";
const many = (n: number, f: (i: number) => string) =>
  Array.from({ length: n }, (_, i) => f(i)).join("\n") + "\n";

// ---------------------------------------------------------------------------
// clamp_artifact = bkit context clamp
// ---------------------------------------------------------------------------

const CLAMP_FIXTURES: Record<string, [string, string]> = {
  "ledger at cap": ["ledger", lines(200)],
  "ledger one over": ["ledger", lines(201)],
  "ledger no final newline": ["ledger", "a\nb\nc"],
  "ledger byte cap": ["ledger", lines(100, 1024)],
  "ledger 500 lines": ["ledger", lines(500)],
  "ledger over cap, no final newline": ["ledger", lines(300).trimEnd()],
  "evidence small": ["debug-evidence", `FAIL x\n${lines(2000)}`],
  "evidence both ends": ["debug-evidence", `FIRST FAILURE\n${lines(5998)}FINAL\n`],
  "evidence buried signal": [
    "debug-evidence",
    many(9000, (i) => (i === 4500 ? "AssertionError: x" : `quiet ${i}`)),
  ],
  "evidence scattered": [
    "debug-evidence",
    many(9000, (i) => (i % 50 === 0 ? `FAIL ${i} timed out` : `q ${i}`)),
  ],
  "evidence glyphs and case": [
    "debug-evidence",
    many(7000, (i) => (i % 700 === 3 ? `  ✕ ${i} Panic ● ×` : `q ${i}`)),
  ],
  "evidence fat line": [
    "debug-evidence",
    many(4000, (i) => (i === 10 ? `{"d":"${"d".repeat(100_000)}"}` : `q ${i}`)),
  ],
  "evidence deep signal": [
    "debug-evidence",
    many(4000, (i) => (i === 2000 ? `${"E".repeat(90_000)} Traceback` : `q ${i}`)),
  ],
  "evidence multibyte cut": [
    "debug-evidence",
    many(3500, (i) => (i === 7 ? "é".repeat(3000) : `q ${i}`)),
  ],
  "evidence small gaps kept": [
    "debug-evidence",
    many(9000, (i) => (i % 3 === 0 ? `error ${i}` : `q`)),
  ],
  "evidence no final newline": ["debug-evidence", many(5000, (i) => `q ${i}`).trimEnd()],
  "evidence all signal": ["debug-evidence", many(40_000, (i) => `error: widget ${i} failed`)],
  "evidence every line matches, under ceiling": ["debug-evidence", many(5000, (i) => `fail ${i}`)],
  "evidence crlf": ["debug-evidence", many(5000, (i) => `q ${i}\r`)],
};

describe("clamp_artifact = bkit context clamp", () => {
  const cases = Object.entries(CLAMP_FIXTURES).map(([name, [profile, content]], i) => {
    const sh = path.join(dir, `clamp-sh-${i}.md`);
    const ts = path.join(dir, `clamp-ts-${i}.md`);
    fs.writeFileSync(sh, content);
    fs.writeFileSync(ts, content);
    return { name, profile, sh, ts };
  });
  // One sh process for every call: one per call is a lot of spawn time.
  const res = spawnSync(
    "sh",
    [
      "-c",
      `. "${CLAMP_SH}"\n${cases.map((c) => `clamp_artifact "${c.sh}" ${c.profile}`).join("\n")}`,
    ],
    { encoding: "utf-8", maxBuffer: 1 << 26 },
  );
  const records = res.stdout.trim().split("\n");

  it.each(cases.map((c, i) => [c.name, i] as const))("%s", async (_, i) => {
    const c = cases[i]!;
    const ts = await command(["clamp", `--artifact=${c.ts}`, `--profile=${c.profile}`]);
    expect(ts.code).toBe(0);
    expect({ ...ts.json, artifact: "" }).toEqual({ ...JSON.parse(records[i]!), artifact: "" });
    expect(fs.readFileSync(c.ts).equals(fs.readFileSync(c.sh)), "clamped bytes differ").toBe(true);
  });
});

// ---------------------------------------------------------------------------
// plan Step 4 ledger scan = bkit context ledger-scan
// ---------------------------------------------------------------------------

describe("plan Step 4 ledger scan = bkit context ledger-scan", () => {
  const block = shippedBlock(".bkit/workflows/bkit-plan.md", "related-deferrals.md");
  const row = (n: number, text: string) => JSON.stringify({ key: `DE-${n}`, note: text });
  const SCANS: Record<string, [string, string[] | null]> = {
    "over the cap": [
      "clamp artifact ledger",
      [
        ...many(45, (i) => row(i, "clamp artifact"))
          .trim()
          .split("\n"),
        row(99, "clamp artifact ledger"),
      ],
    ],
    "ties newest first": [
      "clamp artifact",
      many(50, (i) => row(i, "clamp artifact same"))
        .trim()
        .split("\n"),
    ],
    "below the cap": [
      "clamp artifact",
      [row(1, "clamp artifact"), row(2, "unrelated"), row(3, "artifact clamp")],
    ],
    "embedded tab": ["clamp artifact", ['{"note":"clamp\tartifact"}']],
    "sole term, mixed case": ["Clamp", [row(1, "CLAMP"), row(2, "no")]],
    "no match": ["clamp artifact", [row(1, "nothing")]],
    "ledger absent": ["clamp artifact", null],
    "blank lines in the ledger": ["clamp", [row(1, "clamp"), "", row(3, "clamp")]],
  };

  it.each(Object.keys(SCANS))("%s", async (name) => {
    const [terms, rows] = SCANS[name]!;
    const work = fs.mkdtempSync(path.join(dir, "scan-"));
    if (rows) fs.writeFileSync(path.join(work, "src.jsonl"), rows.join("\n") + "\n");
    const sh = block
      .replace("TERMS='{QUERY}'", `TERMS='${terms}'`)
      .replace('OUT="docs/plans/{YYYYMM}/logs/{FID}/related-deferrals.md"', 'OUT="sh.md"')
      .replace('SRC="docs/deferrals.jsonl"', 'SRC="src.jsonl"')
      .replace('"$REPO_ROOT/.bkit/scripts/bkit-context-clamp.sh"', `"${CLAMP_SH}"`)
      .replace(/CLAMP_LOG="\$REPO_ROOT\/tmp\/[^"]*"/, 'CLAMP_LOG="sh-clamp.jsonl"');
    const r = spawnSync("bash", ["-c", sh], { encoding: "utf-8", cwd: work });
    expect(r.status, r.stderr).toBe(0);
    const ts = await command(
      [
        "ledger-scan",
        `--terms=${terms}`,
        "--source=src.jsonl",
        "--artifact=sh.md",
        "--log=ts-clamp.jsonl",
        "--reset-log",
      ].map((a) => a.replace("--artifact=sh.md", "--artifact=ts.md")),
      work,
    );
    expect(ts.code).toBe(0);
    expect(fs.readFileSync(path.join(work, "ts.md"), "utf-8")).toBe(
      fs.readFileSync(path.join(work, "sh.md"), "utf-8"),
    );
    const rec = (f: string) => ({
      ...JSON.parse(fs.readFileSync(path.join(work, f), "utf-8")),
      artifact: "",
    });
    expect(rec("ts-clamp.jsonl")).toEqual(rec("sh-clamp.jsonl"));
  });
});

// ---------------------------------------------------------------------------
// debug Step 4 context-fetch = list-blocks / run-block
// ---------------------------------------------------------------------------

const CONTEXT_MD = [
  "<!-- context-fetch:start managed context=ci -->",
  "```bash",
  "echo never",
  "```",
  "<!-- context-fetch:end -->",
  "<!-- bkit:end -->",
  "<!-- context-fetch:start github context=ci -->",
  "```bash",
  'printf "FIRST\\n"; seq 1 9000 | sed "s/$/ quiet/"; printf "LAST"',
  "```",
  "<!-- context-fetch:end -->",
  "<!-- context-fetch:provision vercel -->",
  "```bash",
  "echo provision",
  "```",
  "<!-- context-fetch:end -->",
  "<!-- context-fetch:start   vercel   -->",
  "```bash",
  'echo "[context-fetch:vercel] skipped — no token" >&2; exit 0',
  "```",
  "<!-- context-fetch:end -->",
  "<!-- context-fetch:start github context=ci -->",
  "```sh",
  "echo small payload",
  "```",
  "more prose",
  "```",
  "echo second range",
  "```",
  "<!-- context-fetch:end -->",
  "<!-- context-fetch:start context=e2e -->",
  "```bash",
  "printf '\\n'",
  "```",
  "<!-- context-fetch:end -->",
  "",
].join("\n");

function fetchRepo(): string {
  const work = fs.mkdtempSync(path.join(dir, "fetch-"));
  spawnSync("git", ["init", "-q"], { cwd: work });
  fs.mkdirSync(path.join(work, ".agents"));
  fs.writeFileSync(path.join(work, ".agents/context.md"), CONTEXT_MD);
  const logs = path.join(work, "docs/plans/202608/logs/427-x");
  fs.mkdirSync(logs, { recursive: true });
  const at = "2026-10-01T00:00:00Z";
  fs.writeFileSync(
    path.join(logs, "status.jsonl"),
    [
      { type: "workflow-started", workflow: "debug", at },
      { type: "workflow-meta", workflow: "debug", at, debugAttempt: 1 },
    ]
      .map((r) => JSON.stringify(r))
      .join("\n") + "\n",
  );
  return work;
}

const fill = (sh: string) =>
  sh
    .replace(/\{YYYYMM\}/g, "202608")
    .replace(/\{FID\}/g, "427-x")
    .replace(/"\$REPO_ROOT\/\.bkit\/scripts\//g, `"${SCRIPTS}/`);

describe("debug Step 4 = bkit context list-blocks / run-block", () => {
  it("FETCH_BLOCKS lists the same ordinal, context and name", async () => {
    const work = fetchRepo();
    const r = spawnSync(
      "bash",
      ["-c", shippedBlock(".bkit/workflows/bkit-debug.md", "FETCH_BLOCKS=$(")],
      {
        encoding: "utf-8",
        cwd: work,
      },
    );
    const ts = await command(["list-blocks"], work);
    const listed = ts.json.blocks.map(
      (b: { idx: number; context: string; name: string }) => `${b.idx}\t${b.context}\t${b.name}`,
    );
    expect(listed.join("\n")).toBe(r.stdout.replace(/\n$/, ""));
  });

  it("Step 6 CONFIGURED names the same contexts", async () => {
    const work = fetchRepo();
    const step6 = shippedBlock(".bkit/workflows/bkit-debug.md", "CONTEXTS_JSON=$(");
    const from = step6.indexOf("CONFIGURED=$(");
    const tail = `done | jq -R . | jq -s 'map(select(. != ""))')`;
    const to = step6.indexOf(tail, from) + tail.length;
    const sh = step6
      .slice(from, to)
      .replace("CONTEXTS_JSON=$(", "(")
      .replace(tail, "done | tr '\\n' ' ')");
    const r = spawnSync("bash", ["-c", sh], { encoding: "utf-8", cwd: work });
    const ts = await command(["list-blocks"], work);
    expect(ts.json.contextsConfigured.join(" ")).toBe(r.stdout.trim());
  });

  it.each([1, 2, 3, 4])("block %i writes the same artifact and clamp record", async (idx) => {
    const blocks = fetchBlocks(consumerSection(CONTEXT_MD));
    const b = blocks[idx - 1]!;
    const shRepo = fetchRepo();
    const tsRepo = fetchRepo();
    const step = fill(shippedBlock(".bkit/workflows/bkit-debug.md", "{customised BLOCK}"))
      .replace('CONTEXT="{CONTEXT}"', `CONTEXT="${b.context}"`)
      .replace('IDX="{IDX}"', `IDX="${idx}"`)
      .replace('NAME="{NAME}"', `NAME="${b.name}"`)
      .replace("{customised BLOCK}", 'eval "$BLOCK"');
    const r = spawnSync("bash", ["-c", step], { encoding: "utf-8", cwd: shRepo });
    expect(r.status, r.stderr).toBe(0);
    fs.writeFileSync(path.join(tsRepo, "block.sh"), b.body);
    const ts = await command(
      [
        "run-block",
        `--idx=${idx}`,
        "--script=block.sh",
        "--fid=427-x",
        "--month=202608",
        "--file=docs/plans/202608/logs/427-x/status.jsonl",
      ],
      tsRepo,
    );
    expect(ts.code).toBe(0);
    const logs = (root: string) => {
      const d = path.join(root, "docs/plans/202608/logs/427-x");
      return Object.fromEntries(
        fs
          .readdirSync(d)
          .filter((f) => f.startsWith("context-"))
          .map((f) => [f, fs.readFileSync(path.join(d, f), "utf-8")]),
      );
    };
    expect(logs(tsRepo)).toEqual(logs(shRepo));
    const clampLog = (root: string) => {
      const f = path.join(root, "tmp/bkit-clamp-427-x-context-fetch-1.jsonl");
      return fs.existsSync(f) ? fs.readFileSync(f, "utf-8") : "";
    };
    expect(clampLog(tsRepo)).toBe(clampLog(shRepo));
  });
});
