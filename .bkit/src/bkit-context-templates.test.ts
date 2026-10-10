// bkit-context-templates.test.ts — the per-provider context-fetch templates in
// `.bkit/templates/context/`.
//
// A consumer copies these blocks below `bkit:end` in `.agents/context.md`, where
// `/bkit-debug` runs every fetch block and cloud setup runs every provision block. So
// the markers must pair up the way those parsers read them, and a block whose CLI or
// token is missing must self-skip loudly (`exit 0` plus a `[context-fetch:<name>]
// skipped —` breadcrumb) rather than fail the step or print nothing.

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterAll, describe, expect, it } from "vitest";

import { isTemplate, syncTemplateCopies } from "./bkit-modules";
import { getTemplatesRoot } from "./bkit-paths";
import type { WriteSet } from "./bkit-tiers";

const CONTEXT_DIR = path.join(getTemplatesRoot(), "context");
const files = fs
  .readdirSync(CONTEXT_DIR)
  .filter((f) => f.endsWith(".md"))
  .sort();

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
      expect.arrayContaining(["github-ci.md", "github-diff.md", "playwright.md", "vercel.md"]),
    );
    expect(files.length).toBeGreaterThanOrEqual(15);
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
        PATH: process.env.PATH ?? "/usr/bin:/bin",
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

  it("names no consumer: no gether / bartens string in the context templates", () => {
    const sources = [
      ...files.map((f) => path.join(CONTEXT_DIR, f)),
      path.join(getTemplatesRoot(), ".agents", "context.md"),
    ];
    for (const abs of sources) {
      expect(fs.readFileSync(abs, "utf-8"), abs).not.toMatch(/gether|bartens/i);
    }
  });

  it("isTemplate covers them and install copies them into .bkit/templates/context/", () => {
    for (const f of files) expect(isTemplate(`context/${f}`), f).toBe(true);
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
