// bkit-tokens.integration.test.ts — resolveTokens REPO_SLUG resolution against a
// real git repo (`git init` + `git remote add origin` subprocess).

import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { resolveTokens } from "./bkit-tokens";

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-tokens-integration-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function writeJson(filename: string, obj: unknown): void {
  fs.writeFileSync(path.join(tmpDir, filename), JSON.stringify(obj, null, 2), "utf-8");
}

// ---------------------------------------------------------------------------
// REPO_SLUG resolution — parsed from `git remote get-url origin`
// ---------------------------------------------------------------------------

describe("resolveTokens — REPO_SLUG", () => {
  function initRepoWithOrigin(url: string): void {
    // Strip git hook env vars so these commands operate on the temp dir,
    // not on the parent repo injected via GIT_DIR during pre-push hooks.
    const env = { ...process.env };
    delete env["GIT_DIR"];
    delete env["GIT_WORK_TREE"];
    const opts = { cwd: tmpDir, stdio: "ignore" as const, env };
    execSync("git init", opts);
    execSync(`git remote add origin ${url}`, opts);
  }

  it("returns '' when origin remote is absent / not a git repo", async () => {
    writeJson("package.json", { name: "proj" });
    const tokens = await resolveTokens(tmpDir);
    expect(tokens.REPO_SLUG).toBe("");
  });

  it("parses owner/repo from an HTTPS remote with .git suffix", async () => {
    writeJson("package.json", { name: "proj" });
    initRepoWithOrigin("https://github.com/acme/widget.git");
    const tokens = await resolveTokens(tmpDir);
    expect(tokens.REPO_SLUG).toBe("acme/widget");
  });

  it("parses owner/repo from an HTTPS remote without .git suffix", async () => {
    writeJson("package.json", { name: "proj" });
    initRepoWithOrigin("https://github.com/acme/widget");
    const tokens = await resolveTokens(tmpDir);
    expect(tokens.REPO_SLUG).toBe("acme/widget");
  });

  it("parses owner/repo from an SSH scp-style remote", async () => {
    writeJson("package.json", { name: "proj" });
    initRepoWithOrigin("git@github.com:acme/widget.git");
    const tokens = await resolveTokens(tmpDir);
    expect(tokens.REPO_SLUG).toBe("acme/widget");
  });
});
