// install/modules/cloud.integration.test.ts — Integration tests for the cloud module.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { WriteSet } from "../write";
import { runCloudModule } from "./cloud";
import { dispatchModules, type ModuleContext } from "./index";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let tmpDir: string;

let originalCwd: string;

function makeWriteSet(): WriteSet {
  return { writes: [] };
}

function makeCtx(overrides: Partial<ModuleContext> = {}): ModuleContext {
  return {
    dryRun: false,
    tokens: {
      DEFAULT_BRANCH: "main",
      PROJECT_NAME: "test-project",
      REPO_SLUG: "acme/test-project",
    },
    modelLookup: new Map(),
    opencodeModelLookup: new Map(),
    effortMap: new Map(),
    advisories: [],
    ws: makeWriteSet(),
    logPrefix: "[bkit-install]",
    postDispatch: [],
    issueTracker: "none",
    ...overrides,
  };
}

beforeEach(() => {
  originalCwd = process.cwd();
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-modules-test-"));
  // Seed package.json so resolveTokens doesn't fail
  fs.writeFileSync(
    path.join(tmpDir, "package.json"),
    JSON.stringify({ name: "test-project", packageManager: "pnpm@10.4.1" }),
    "utf-8",
  );
  process.chdir(tmpDir);
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// runCloudModule — opt-in post-CI auto-routing
// ---------------------------------------------------------------------------

describe("runCloudModule — opt-in cloud agents (post-CI auto-routing)", () => {
  const routerRel = path.join(".github", "workflows", "bkit-cloud.yml");
  const bootstrapRel = path.join(".claude", "hooks", "cloud-bootstrap.sh");
  const dockerRel = path.join(".cursor", "Dockerfile");
  const envRel = path.join(".cursor", "environment.json");

  it("cloud=claude: writes only cloud-bootstrap.sh and points the setup advisory at the workflow template", () => {
    const ws = makeWriteSet();
    const ctx = makeCtx({ ws, cloudVariant: "claude" });
    runCloudModule(ctx);

    expect(fs.existsSync(path.join(tmpDir, bootstrapRel))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, routerRel))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, dockerRel))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, envRel))).toBe(false);

    const advisory = ctx.advisories.find((a) => a.id === "bkit-cloud-setup");
    expect(advisory).toBeDefined();
    expect(advisory!.action).toContain(".bkit/templates/.github/workflows/bkit-cloud.yml");
    expect(advisory!.action).toMatch(/Add `ANTHROPIC_API_KEY`/);
    expect(advisory!.action).toMatch(/install-github-app/);
    // Bare `Auto` must NOT appear in advisory text (migrated to bkit:auto)
    expect(advisory!.action).not.toMatch(/\bAuto\b(?! route)/);
    expect(advisory!.action).toMatch(/bkit:auto/);
    expect(advisory!.action).not.toMatch(/BKIT_LINEAR_API_KEY/);
    // The env-scaffolding customisation advisory is emitted for cloud=claude too.
    expect(ctx.advisories.find((a) => a.id === "cloud-env-customize")).toBeDefined();
  });

  it("cloud=opencode: writes no files and points the setup advisory at the workflow template", () => {
    const ws = makeWriteSet();
    const ctx = makeCtx({ ws, cloudVariant: "opencode", issueTracker: "github" });
    runCloudModule(ctx);

    expect(ws.writes).toEqual([]);
    expect(fs.existsSync(path.join(tmpDir, routerRel))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, bootstrapRel))).toBe(false);

    const advisory = ctx.advisories.find((a) => a.id === "bkit-cloud-setup");
    expect(advisory).toBeDefined();
    expect(advisory!.action).toContain(".bkit/templates/.github/workflows/bkit-cloud.yml");
    expect(advisory!.action).toMatch(/OPENCODE_PROVIDER_KEY/);
    expect(advisory!.action).not.toMatch(/BKIT_ANTHROPIC_API_KEY/);
  });

  it("cloud=cursor: writes no files and points the setup advisory at the .cursor templates", () => {
    const ws = makeWriteSet();
    const ctx = makeCtx({ ws, cloudVariant: "cursor", issueTracker: "linear" });
    runCloudModule(ctx);

    expect(ws.writes).toEqual([]);
    expect(fs.existsSync(path.join(tmpDir, dockerRel))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, envRel))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, routerRel))).toBe(false);

    const advisory = ctx.advisories.find((a) => a.id === "bkit-cloud-setup");
    expect(advisory).toBeDefined();
    expect(advisory!.action).toContain(".bkit/templates/.cursor/Dockerfile");
    expect(advisory!.action).toContain(".bkit/templates/.cursor/environment.json");
    expect(advisory!.action).toMatch(/BKIT_LINEAR_API_KEY/);
  });

  it("an adopted bkit-cloud.yml, Dockerfile and environment.json stay byte-identical", () => {
    for (const rel of [routerRel, dockerRel, envRel]) {
      fs.mkdirSync(path.dirname(path.join(tmpDir, rel)), { recursive: true });
      fs.writeFileSync(path.join(tmpDir, rel), `mine: ${rel}\n`, "utf-8");
    }
    for (const cloudVariant of ["claude", "opencode", "cursor"] as const) {
      runCloudModule(
        makeCtx({ cloudVariant, issueTracker: cloudVariant === "cursor" ? "linear" : "github" }),
      );
    }
    for (const rel of [routerRel, dockerRel, envRel]) {
      expect(fs.readFileSync(path.join(tmpDir, rel), "utf-8")).toBe(`mine: ${rel}\n`);
    }
  });

  for (const variant of ["claude", "opencode", "cursor"] as const) {
    it(`cloud=${variant}: persists bkit.cloudAgents = '${variant}' to package.json`, () => {
      runCloudModule(makeCtx({ cloudVariant: variant }));
      const pkg = JSON.parse(fs.readFileSync(path.join(tmpDir, "package.json"), "utf-8")) as {
        bkit?: { cloudAgents?: string };
      };
      expect(pkg.bkit?.cloudAgents).toBe(variant);
    });
  }

  it("dry-run: writes nothing to disk but still emits the setup advisory", () => {
    const ctx = makeCtx({ dryRun: true, cloudVariant: "claude" });
    runCloudModule(ctx);

    expect(fs.existsSync(path.join(tmpDir, bootstrapRel))).toBe(false);
    expect(ctx.advisories.find((a) => a.id === "bkit-cloud-setup")).toBeDefined();
  });

  it("the default module set does NOT ship cloud scaffolding", () => {
    // `cursor` is omitted — its applyT3 transform process.exit(1)s on the empty
    // modelLookup in this harness (see the dispatch tests above).
    dispatchModules(new Set(["core", "claude", "lint"]), makeCtx({}));
    // claude is in the set — cloud-bootstrap.sh is in --cloud, not claude.
    expect(fs.existsSync(path.join(tmpDir, bootstrapRel))).toBe(false);
  });
});
