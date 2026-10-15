// install/payload-links.integration.test.ts — the payload view links end to end (#525).
//
// Install (core module) creates `.bkit/core` + `.bkit/shared` as relative symlinks
// into the package payload, gitignores them via the managed block and never hashes
// them. A real directory is never clobbered. Uninstall removes the links.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { dispatchModules, type ModuleContext } from "./modules/index";
import { getCoreRoot, getSharedRoot } from "../shared/package-roots";
import { readBkitVersion } from "./version-file";
import { runUninstall } from "../commands/install/uninstall";
import type { WriteSet } from "./write";
import type { PreflightFinding } from "../checks/before/index";

let tmpDir: string;
let originalCwd: string;

const CORE_LINK = path.join(".bkit", "core");
const SHARED_LINK = path.join(".bkit", "shared");
const LINK_PATHS = [CORE_LINK, SHARED_LINK];

function makeCtx(dryRun: boolean, ws: WriteSet, advisories: PreflightFinding[]): ModuleContext {
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
    advisories,
    ws,
    logPrefix: "[bkit-test]",
    postDispatch: [],
    issueTracker: "none",
  };
}

function runCore(dryRun = false): { ws: WriteSet; advisories: PreflightFinding[] } {
  const ws: WriteSet = { writes: [] };
  const advisories: PreflightFinding[] = [];
  dispatchModules(new Set(["core"]), makeCtx(dryRun, ws, advisories));
  return { ws, advisories };
}

function linkWrites(ws: WriteSet): string[] {
  return ws.writes.map((w) => String(w.path)).filter((p) => LINK_PATHS.includes(p));
}

beforeEach(() => {
  originalCwd = process.cwd();
  // realpath: process.cwd() reports /private/var on macOS, and install's paths come from it.
  tmpDir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-payload-links-")));
  fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify({ name: "c" }), "utf-8");
  process.chdir(tmpDir);
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("install creates the payload view links", () => {
  it("links .bkit/core + .bkit/shared, relative, into the package payload", () => {
    const { ws } = runCore();
    expect(linkWrites(ws)).toEqual([]);
    for (const [rel, root] of [
      [CORE_LINK, getCoreRoot()],
      [SHARED_LINK, getSharedRoot()],
    ] as const) {
      const linkAbs = path.join(tmpDir, rel);
      expect(fs.lstatSync(linkAbs).isSymbolicLink()).toBe(true);
      expect(path.isAbsolute(fs.readlinkSync(linkAbs))).toBe(false);
      expect(fs.realpathSync(linkAbs)).toBe(fs.realpathSync(root));
    }
  });

  it("gitignores both link paths inside the managed block, and never hashes the links", () => {
    runCore();
    const gi = fs.readFileSync(path.join(tmpDir, ".gitignore"), "utf-8");
    const block = gi.slice(gi.indexOf("bkit:start"), gi.indexOf("bkit:end"));
    for (const rel of LINK_PATHS) expect(block).toContain(rel);

    // No hash record: a symlink's bytes are the package's. (Also the EISDIR
    // regression proof — a hash attempt on a dir symlink would have thrown above.)
    const version = readBkitVersion(path.join(tmpDir, ".bkit", "version"))!;
    const keys = Object.keys(version.canonicalHashes);
    expect(keys.filter((k) => LINK_PATHS.includes(k))).toEqual([]);
  });

  it("dry-run (bkit check) with missing links reports zero link drift and creates nothing", () => {
    const { ws } = runCore(true);
    expect(linkWrites(ws)).toEqual([]);
    for (const rel of LINK_PATHS) expect(fs.existsSync(path.join(tmpDir, rel))).toBe(false);
  });

  it("never clobbers a real directory — skipped, contents intact, advisory raised", () => {
    runCore();
    const dirAbs = path.join(tmpDir, CORE_LINK);
    fs.rmSync(dirAbs);
    fs.mkdirSync(dirAbs);
    fs.writeFileSync(path.join(dirAbs, "mine.txt"), "consumer content\n", "utf-8");

    const { advisories } = runCore();
    expect(fs.lstatSync(dirAbs).isSymbolicLink()).toBe(false);
    expect(fs.readFileSync(path.join(dirAbs, "mine.txt"), "utf-8")).toBe("consumer content\n");
    const finding = advisories.find((a) => a.id === "payload-link-real-dir");
    expect(finding?.severity).toBe("advisory");
    expect(finding?.detect).toContain(CORE_LINK);
  });

  it("re-points a link that resolves somewhere else", () => {
    runCore();
    const linkAbs = path.join(tmpDir, CORE_LINK);
    fs.rmSync(linkAbs);
    fs.symlinkSync(tmpDir, linkAbs, "dir");
    const { ws } = runCore();
    expect(fs.realpathSync(linkAbs)).toBe(fs.realpathSync(getCoreRoot()));
    expect(linkWrites(ws)).toEqual([]);
  });
});

describe("uninstall removes the payload view links", () => {
  it("removes both links on a core uninstall", async () => {
    runCore();
    for (const rel of LINK_PATHS) {
      expect(fs.lstatSync(path.join(tmpDir, rel)).isSymbolicLink()).toBe(true);
    }
    await runUninstall(["core"], {
      cwd: tmpDir,
      dryRun: false,
      force: false,
      nuke: false,
      yes: true,
      logPrefix: "[bkit-test]",
    });
    for (const rel of LINK_PATHS) expect(fs.existsSync(path.join(tmpDir, rel))).toBe(false);
  });

  it("dry-run lists the links as deleted without removing them", async () => {
    runCore();
    const result = await runUninstall(["core"], {
      cwd: tmpDir,
      dryRun: true,
      force: false,
      nuke: false,
      yes: true,
      logPrefix: "[bkit-test]",
    });
    for (const rel of LINK_PATHS) {
      expect(result.deleted).toContain(rel);
      expect(fs.lstatSync(path.join(tmpDir, rel)).isSymbolicLink()).toBe(true);
    }
  });

  it("leaves a real directory at the link path alone — consumer content", async () => {
    runCore();
    const dirAbs = path.join(tmpDir, CORE_LINK);
    fs.rmSync(dirAbs);
    fs.mkdirSync(dirAbs);
    fs.writeFileSync(path.join(dirAbs, "mine.txt"), "consumer content\n", "utf-8");

    const result = await runUninstall(["core"], {
      cwd: tmpDir,
      dryRun: false,
      force: false,
      nuke: false,
      yes: true,
      logPrefix: "[bkit-test]",
    });
    expect(result.deleted).not.toContain(CORE_LINK);
    expect(fs.readFileSync(path.join(dirAbs, "mine.txt"), "utf-8")).toBe("consumer content\n");
  });
});
