// install/template-copies.integration.test.ts — templates are templates.
//
// Install and upgrade copy the whole templates root into the consumer's
// `.bkit/templates/`, raw, and never hash the copies. Uninstall removes the copies
// folder.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { dispatchModules, type ModuleContext } from "./modules/index";
import { formatTemplateChanges, syncTemplateCopies } from "./template-copies";
import { listFilesRecursive } from "./template-copies";
import { getPkgRoot, getTemplatesRoot } from "../shared/package-roots";
import { readBkitVersion } from "./version-file";
import { runUninstall } from "../commands/install/uninstall";
import type { WriteSet } from "./write";

let tmpDir: string;
let originalCwd: string;

const COPIES = path.join(".bkit", "templates");

function makeCtx(dryRun: boolean, ws: WriteSet): ModuleContext {
  return {
    dryRun,
    tokens: {
      DEFAULT_BRANCH: "main",
      PROJECT_NAME: "test-project",
      REPO_SLUG: "acme/test-project",
    },
    modelLookup: new Map(),
    opencodeModelLookup: new Map(),
    effortMap: new Map(),
    advisories: [],
    ws,
    logPrefix: "[bkit-test]",
    postDispatch: [],
    issueTracker: "none",
  };
}

function runCore(dryRun = false): WriteSet {
  const ws: WriteSet = { writes: [] };
  dispatchModules(new Set(["core"]), makeCtx(dryRun, ws));
  return ws;
}

function shippedTemplates(): string[] {
  const root = getTemplatesRoot();
  return listFilesRecursive(root)
    .map((abs) => path.relative(root, abs))
    .sort();
}

function copiedTemplates(): string[] {
  const root = path.join(tmpDir, COPIES);
  return listFilesRecursive(root)
    .map((abs) => path.relative(root, abs))
    .sort();
}

beforeEach(() => {
  originalCwd = process.cwd();
  // realpath: process.cwd() reports /private/var on macOS, and install's paths come from it.
  tmpDir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-template-copies-")));
  fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify({ name: "c" }), "utf-8");
  process.chdir(tmpDir);
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("the templates root is the copy-and-own set", () => {
  it("holds the renamed workflows, hooks, context blocks and the slop plugin", () => {
    for (const p of [
      ".github/workflows/bkit-ci.yml",
      ".github/workflows/bkit-cloud.yml",
      ".github/workflows/bkit-renovate.yml",
      ".husky/pre-push",
      ".vale.ini",
      ".vale/styles/House/LLMSlop.yml",
      ".prettierignore",
      ".envrc",
      ".cursor/Dockerfile",
      ".claude/hooks/bkit-cloud-bootstrap.sh",
      "scripts/graphify/bkit-graphify.sh",
      "scripts/slop/bkit-slop-type-suppression.mjs",
      "context/bkit-github.md",
    ]) {
      expect(fs.existsSync(path.join(getTemplatesRoot(), p)), p).toBe(true);
    }
    for (const p of [
      ".mcp.json",
      ".claude/settings.json",
      ".claude/hooks/bkit-preflight.sh",
      "AGENTS.md",
      "gitignore",
    ]) {
      expect(fs.existsSync(path.join(getTemplatesRoot(), p)), p).toBe(false);
    }
  });
});

describe("install copies the template set into .bkit/templates/", () => {
  it("copies exactly the set, raw, keeping each file's mode, with no hash record", () => {
    runCore();

    expect(copiedTemplates()).toEqual(shippedTemplates());

    const ci = path.join(".github", "workflows", "bkit-ci.yml");
    const copy = fs.readFileSync(path.join(tmpDir, COPIES, ci));
    expect(copy.equals(fs.readFileSync(path.join(getTemplatesRoot(), ci)))).toBe(true);
    expect(copy.toString("utf-8")).toContain("{{DEFAULT_BRANCH}}");

    const hook = path.join(".husky", "pre-push");
    const exec = (p: string) => fs.statSync(p).mode & 0o111;
    expect(exec(path.join(tmpDir, COPIES, hook))).toBe(exec(path.join(getTemplatesRoot(), hook)));

    const version = readBkitVersion(path.join(tmpDir, ".bkit", "version"))!;
    const keys = Object.keys(version.canonicalHashes);
    expect(keys.filter((k) => k.startsWith(COPIES + path.sep))).toEqual([]);
  });

  it("a second run writes no copy; a stale or stray copy is a write in dry-run and live alike", () => {
    runCore();
    const again = runCore();
    expect(again.writes.filter((w) => w.path.startsWith(COPIES + path.sep))).toEqual([]);

    const envrc = path.join(tmpDir, COPIES, ".envrc");
    const stray = path.join(tmpDir, COPIES, "retired", "old.yml");
    fs.writeFileSync(envrc, "edited\n", "utf-8");
    fs.mkdirSync(path.dirname(stray), { recursive: true });
    fs.writeFileSync(stray, "gone\n", "utf-8");

    const dryWs: WriteSet = { writes: [] };
    const dry = syncTemplateCopies(tmpDir, { dryRun: true, ws: dryWs });
    expect(dry).toEqual({
      changed: [".envrc"],
      added: [],
      removed: [path.join("retired", "old.yml")],
    });
    expect(fs.readFileSync(envrc, "utf-8")).toBe("edited\n");
    expect(fs.existsSync(stray)).toBe(true);

    const liveWs: WriteSet = { writes: [] };
    const live = syncTemplateCopies(tmpDir, { dryRun: false, ws: liveWs });
    expect(live).toEqual(dry);
    expect(liveWs.writes).toEqual(dryWs.writes);
    expect(
      fs.readFileSync(envrc).equals(fs.readFileSync(path.join(getTemplatesRoot(), ".envrc"))),
    ).toBe(true);
    expect(fs.existsSync(path.dirname(stray))).toBe(false);
  });

  it("does nothing in dogfood, where .bkit/templates/ is the package source", () => {
    const ws: WriteSet = { writes: [] };
    expect(syncTemplateCopies(getPkgRoot(), { dryRun: true, ws })).toEqual({
      changed: [],
      added: [],
      removed: [],
    });
    expect(ws.writes).toEqual([]);
  });
});

describe("formatTemplateChanges", () => {
  it("names every changed, added and removed path, then points at templates.md", () => {
    const text = formatTemplateChanges({
      changed: [".envrc"],
      added: [path.join(".husky", "pre-push")],
      removed: ["old.yml"],
    });
    expect(text).toContain(path.join(COPIES, ".envrc"));
    expect(text).toContain(path.join(COPIES, ".husky", "pre-push"));
    expect(text).toContain(path.join(COPIES, "old.yml"));
    expect(text).toContain(".bkit/templates.md");
  });

  it("names the consequence when a changed template's adopted copy backs a gate", () => {
    const text = formatTemplateChanges({
      changed: ["slop-scan.config.json"],
      added: [],
      removed: [],
    });
    expect(text).toContain(path.join(COPIES, "slop-scan.config.json"));
    expect(text).toContain("slop gate may go red");
  });

  it("leaves a changed template with no gate consequence unannotated", () => {
    const text = formatTemplateChanges({ changed: [".envrc"], added: [], removed: [] });
    expect(text).toContain(path.join(COPIES, ".envrc"));
    expect(text).not.toContain("slop gate may go red");
  });

  it("is empty when nothing changed", () => {
    expect(formatTemplateChanges({ changed: [], added: [], removed: [] })).toBe("");
  });
});

describe("uninstall", () => {
  it("removes the consumer's .bkit/templates/ copies", async () => {
    runCore();
    expect(fs.existsSync(path.join(tmpDir, COPIES))).toBe(true);
    await runUninstall(["core"], {
      cwd: tmpDir,
      dryRun: false,
      force: false,
      nuke: false,
      yes: true,
      logPrefix: "[bkit-test]",
    });
    expect(fs.existsSync(path.join(tmpDir, COPIES))).toBe(false);
  });
});
