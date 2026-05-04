import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { applyTokens, resolveTokens } from "./bkit-tokens";
import { writeTier2, type WriteSet } from "./bkit-tiers";
import { extractFullManagedBlock, extractManagedBlock } from "./bkit-install";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let tmpDir: string;
let originalCwd: string;

function makeWriteSet(): WriteSet {
  return { writes: [] };
}

beforeEach(() => {
  originalCwd = process.cwd();
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-modules-test-"));
  process.chdir(tmpDir);
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// Task 6.1b — Substituted ci.yml end-to-end integration test
// ---------------------------------------------------------------------------

describe("ci.yml end-to-end token substitution (Task 6.1b)", () => {
  it("resolveTokens + applyTokens + writeTier2 produces substituted ci.yml on disk", async () => {
    // Setup: pre-seed tmpdir per Acceptance Scenario
    fs.writeFileSync(path.join(tmpDir, ".nvmrc"), "22\n", "utf-8");
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "x", packageManager: "pnpm@10.4.1" }),
      "utf-8",
    );

    // Resolve tokens
    const tokens = await resolveTokens(tmpDir);
    expect(tokens.NODE_VERSION).toBe("22");
    expect(tokens.PNPM_VERSION).toBe("10");
    expect(tokens.PROJECT_NAME).toBe("x");
    // DEFAULT_BRANCH may be 'main' (fallback) since no git remote
    expect(tokens.DEFAULT_BRANCH).toBe("main");

    // Load the real ci.yml template
    const templatePath = path.resolve(
      import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname),
      "..",
      "templates",
      ".github",
      "workflows",
      "ci.yml",
    );
    expect(fs.existsSync(templatePath), `template must exist at ${templatePath}`).toBe(true);

    // Write the Tier 2 block to a new ci.yml in tmpDir
    const destDir = path.join(tmpDir, ".github", "workflows");
    fs.mkdirSync(destDir, { recursive: true });
    const dstPath = path.join(destDir, "ci.yml");
    const ws = makeWriteSet();

    writeTier2(templatePath, dstPath, tokens, "hash-comment", false, ws);

    expect(ws.writes).toHaveLength(1);
    expect(fs.existsSync(dstPath)).toBe(true);

    const onDisk = fs.readFileSync(dstPath, "utf-8");

    // Assert token substitution occurred
    expect(onDisk).toContain("node-version: 22");
    expect(onDisk).toContain("10"); // pnpm major version somewhere
    expect(onDisk).toContain("main"); // default branch

    // Assert NO raw placeholders remain
    expect(onDisk).not.toContain("{{NODE_VERSION}}");
    expect(onDisk).not.toContain("{{PNPM_VERSION}}");
    expect(onDisk).not.toContain("{{DEFAULT_BRANCH}}");
    expect(onDisk).not.toContain("{{PROJECT_NAME}}");

    // Assert auth-shim is present
    expect(onDisk).toContain("BKIT_READ_TOKEN");
    expect(onDisk).toContain("git config --global url.");
  });

  it("existing ci.yml with consumer jobs gets bkit block appended; consumer jobs preserved", async () => {
    fs.writeFileSync(path.join(tmpDir, ".nvmrc"), "22\n", "utf-8");
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "x", packageManager: "pnpm@10.4.1" }),
      "utf-8",
    );
    const tokens = await resolveTokens(tmpDir);

    const templatePath = path.resolve(
      import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname),
      "..",
      "templates",
      ".github",
      "workflows",
      "ci.yml",
    );

    // Existing ci.yml with consumer jobs (NO bkit markers)
    const destDir = path.join(tmpDir, ".github", "workflows");
    fs.mkdirSync(destDir, { recursive: true });
    const dstPath = path.join(destDir, "ci.yml");
    const consumerContent = `name: My CI
on: push
jobs:
  consumer-job-1:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
  consumer-job-2:
    runs-on: ubuntu-latest
    steps:
      - name: custom step
        run: echo hello
`;
    fs.writeFileSync(dstPath, consumerContent, "utf-8");

    const ws = makeWriteSet();
    writeTier2(templatePath, dstPath, tokens, "hash-comment", false, ws);

    const onDisk = fs.readFileSync(dstPath, "utf-8");

    // Consumer jobs preserved
    expect(onDisk).toContain("consumer-job-1:");
    expect(onDisk).toContain("consumer-job-2:");
    expect(onDisk).toContain("echo hello");

    // bkit block appended
    expect(onDisk).toContain("# bkit:start");
    expect(onDisk).toContain("# bkit:end");
    expect(onDisk).toContain("node-version: 22");
    expect(onDisk).toContain("BKIT_READ_TOKEN");

    // Consumer content precedes bkit block
    const bkitStart = onDisk.indexOf("# bkit:start");
    const consumerEnd = onDisk.indexOf("consumer-job-2:");
    expect(consumerEnd).toBeLessThan(bkitStart);

    expect(ws.writes).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// v4-3 territory stubs — do NOT add tests here until v4-3 Phase 4
// ---------------------------------------------------------------------------

it.todo("bkit install --claude seeds only .claude/** + core (v4-3)");
it.todo("bkit install --cursor seeds only .cursor/** + core (v4-3)");
it.todo("bkit install --lint seeds vale + slop-scan + core (v4-3)");
it.todo("bkit install --git-hooks seeds .husky/ + core (v4-3)");
it.todo("bkit install --full (no flags) seeds full stack on empty repo (v4-3)");
it.todo("second bkit install --full produces zero writes (idempotent) (v4-3)");
