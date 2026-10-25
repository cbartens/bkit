// audits/templates/context-templates.test.ts — the per-provider context-fetch templates in
// `.bkit/templates/context/`.
//
// A consumer copies these blocks below `bkit:end` in `.agents/context.md`, where
// `/bkit-debug` runs every fetch block and cloud setup runs every provision block. The
// markers pair up the way those parsers read them, and a block whose CLI or token is
// missing self-skips loudly (`exit 0` plus a `[context-fetch:<name>] skipped —` breadcrumb).

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterAll, describe, expect, it } from "vitest";

import { syncTemplateCopies } from "../../install/template-copies";
import { getCoreRoot, getTemplatesRoot } from "../../shared/package-roots";
import { blockBoundsOutput } from "../../checks/before/context-fetch";
import type { WriteSet } from "../../install/write";

const CONTEXT_DIR = path.join(getTemplatesRoot(), "context");
const files = fs
  .readdirSync(CONTEXT_DIR)
  .filter((f) => f.endsWith(".md"))
  .sort();

const SAFE_PATH = process.env.PATH ?? "/usr/bin:/bin";

type Block = { kind: "start" | "provision"; name: string; body: string };

/** Fetch and provision blocks in file order, each with its fenced bash body. */
function parseBlocks(text: string): { blocks: Block[]; unbalanced: string[] } {
  const blocks: Block[] = [];
  const unbalanced: string[] = [];
  let cur: { kind: Block["kind"]; name: string; body: string[] } | null = null;
  let inFence = false;
  for (const line of text.split("\n")) {
    const start = /^<!-- context-fetch:start ([\w.-]+)(?: context=\w+)? -->$/.exec(line);
    const prov = /^<!-- context-fetch:provision ([\w.-]+) -->$/.exec(line);
    if (start || prov) {
      if (cur) unbalanced.push(`${cur.name}: opened before the previous block ended`);
      cur = { kind: start ? "start" : "provision", name: (start ?? prov)![1]!, body: [] };
      inFence = false;
      continue;
    }
    if (/^<!-- context-fetch:end -->$/.test(line)) {
      if (!cur) unbalanced.push("end marker with no open block");
      else blocks.push({ kind: cur.kind, name: cur.name, body: cur.body.join("\n") });
      cur = null;
      continue;
    }
    if (line.startsWith("<!-- context-fetch:")) unbalanced.push(`unparsed marker: ${line}`);
    if (cur && line.startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (cur && inFence) cur.body.push(line);
  }
  if (cur) unbalanced.push(`${cur.name}: never ended`);
  return { blocks, unbalanced };
}

const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-context-tpl-"));
afterAll(() => fs.rmSync(scratch, { recursive: true, force: true }));

describe(".bkit/templates/context/", () => {
  it("ships the provider set", () => {
    expect(files).toEqual(
      expect.arrayContaining([
        "bkit-expo.md",
        "bkit-github.md",
        "bkit-maestro.md",
        "bkit-playwright.md",
        "bkit-vercel.md",
      ]),
    );
    expect(files.length).toBeGreaterThanOrEqual(13);
  });

  it.each(files)("%s: every block is named, closed, and carries a bash body", (file) => {
    const { blocks, unbalanced } = parseBlocks(
      fs.readFileSync(path.join(CONTEXT_DIR, file), "utf-8"),
    );
    expect(unbalanced).toEqual([]);
    expect(blocks.length).toBeGreaterThan(0);
    for (const b of blocks) expect(b.body.trim(), `${file} ${b.kind} ${b.name}`).not.toBe("");
  });

  it.each(files)("%s: a provision block self-guards on its CLI", (file) => {
    const { blocks } = parseBlocks(fs.readFileSync(path.join(CONTEXT_DIR, file), "utf-8"));
    for (const b of blocks.filter((x) => x.kind === "provision")) {
      expect(b.body, `${file} provision ${b.name}`).toMatch(
        /command -v [\w.-]+ >\/dev\/null 2>&1[\s\\]*\|\|/,
      );
    }
  });

  // Clean env: no tokens, a throwaway HOME (no gh / gcloud login), a cwd outside any repo.
  const fetchBlocks = files.flatMap((file) =>
    parseBlocks(fs.readFileSync(path.join(CONTEXT_DIR, file), "utf-8"))
      .blocks.filter((b) => b.kind === "start")
      .map((b) => ({ file, ...b })),
  );

  it.each(fetchBlocks)("$file: $name self-skips with no credentials", ({ name, body }) => {
    const home = fs.mkdtempSync(path.join(scratch, "home-"));
    const script = path.join(home, "block.sh");
    fs.writeFileSync(script, `${body}\n`, "utf-8");
    const r = spawnSync("bash", [script], {
      cwd: home,
      encoding: "utf-8",
      timeout: 30_000,
      env: {
        PATH: SAFE_PATH,
        HOME: home,
        GH_CONFIG_DIR: path.join(home, "gh"),
        CLOUDSDK_CONFIG: path.join(home, "gcloud"),
        GIT_CEILING_DIRECTORIES: path.dirname(home),
      },
    });
    expect(r.status, r.stderr).toBe(0);
    expect(r.stderr).toContain(`[context-fetch:${name}] skipped —`);
    expect(r.stdout).toBe("");
  });

  /**
   * The last line of a block's leading comment header, or `null` when it opens with code.
   * `.agents/context.md` § Context Fetch promises the knobs sit "in the block's
   * `# Customise:` comment, last comment before the body".
   */
  const lastCommentLine = (body: string): string | null => {
    const lines = body.split("\n");
    let last = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i]!.startsWith("#")) last = i;
      else if (lines[i]!.trim() !== "") break;
    }
    return last === -1 ? null : lines[last]!;
  };

  it.each(fetchBlocks)(
    "$file: $name bounds its own output at the source",
    ({ file, name, body }) => {
      expect(blockBoundsOutput(body.split("\n")), `${file} ${name}`).toBe(true);
    },
  );

  it.each(fetchBlocks)(
    "$file: $name ends its comment header with a `# Customise:` line",
    ({ file, name, body }) => {
      expect(lastCommentLine(body), `${file} ${name}`).toMatch(/^# Customise:/);
    },
  );

  // The positive-control sentence is a suggested addendum, not a universal one: five shipped
  // fetch blocks (github ci / diff, tavily, playwright, maestro) do not carry it, so only the
  // blocks that DO name a positive control are pinned to the canonical wording.
  it("states a positive control the same way wherever a `# Customise:` comment carries one", () => {
    const named = fetchBlocks.filter((b) => b.body.includes("Positive control"));
    expect(named.length).toBeGreaterThan(0);
    for (const b of named) {
      expect(b.body, `${b.file} ${b.name}`).toMatch(
        /Positive control \(suggested\): .*reader broken, not clean\./,
      );
    }
  });

  it("rejects a fetch block that bounds nothing (the audit's own red case)", () => {
    const text =
      "<!-- context-fetch:start dump context=runtime -->\n" +
      "```bash\n# Whole-run dump.\n" +
      'gh run view "$RUN_ID" --log\n' +
      "```\n" +
      "<!-- context-fetch:end -->\n";
    const fetchBlocksInFixture = parseBlocks(text).blocks.filter((b) => b.kind === "start");
    expect(fetchBlocksInFixture).toHaveLength(1);
    expect(fetchBlocksInFixture.every((b) => blockBoundsOutput(b.body.split("\n")))).toBe(false);
  });

  it("rejects a block whose only bound words sit in its mandated `# Customise:` comment", () => {
    const text =
      "<!-- context-fetch:start dump context=runtime -->\n" +
      "```bash\n" +
      "# Customise: raise --limit as needed.\n" +
      'gh run view "$RUN_ID" --log\n' +
      "```\n" +
      "<!-- context-fetch:end -->\n";
    const fetchBlocksInFixture = parseBlocks(text).blocks.filter((b) => b.kind === "start");
    expect(fetchBlocksInFixture).toHaveLength(1);
    expect(fetchBlocksInFixture.every((b) => blockBoundsOutput(b.body.split("\n")))).toBe(false);
  });

  it("names no maintainer: no bartens string in the context templates", () => {
    const sources = [
      ...files.map((f) => path.join(CONTEXT_DIR, f)),
      path.join(getCoreRoot(), ".agents", "context.md"),
    ];
    for (const abs of sources) {
      expect(fs.readFileSync(abs, "utf-8"), abs).not.toMatch(/\bc?bartens\b/i);
    }
  });

  it("install copies them into .bkit/templates/context/", () => {
    const cwd = fs.mkdtempSync(path.join(scratch, "consumer-"));
    const ws: WriteSet = { writes: [] };
    const changes = syncTemplateCopies(cwd, { dryRun: false, ws });
    for (const f of files) {
      expect(changes.added).toContain(path.join("context", f));
      expect(fs.readFileSync(path.join(cwd, ".bkit", "templates", "context", f))).toEqual(
        fs.readFileSync(path.join(CONTEXT_DIR, f)),
      );
    }
  });
});
