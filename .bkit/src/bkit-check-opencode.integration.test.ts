// bkit-check-opencode.integration.test.ts
//
// `bkit check` drift-gates the opencode host: a consumer weakening
// `.opencode/opencode.json` (provider block + tracker-filtered mcp + the permission
// sandbox) — or a tampered gateguard.js — fails `check`.
//
// `bkit check` takes no `--opencode=` flag; the render inputs fall back to the installed
// provider (package.json `bkit.opencodeProvider`, the authoritative signal for the opencode
// gateway whose on-disk block is keyed `opencode`) and the recorded tracker, so a clean
// install checks green across providers.
//
// Strategy (in-test dogfood): spawn the real install + check binaries against a tmpdir
// consumer. getPkgRoot resolves to THIS repo, so install renders the real sources into the
// tmpdir; check then runs read-only over them.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

let tmpDir: string;
let originalCwd: string;

const getInstallPath = () =>
  path.resolve(path.dirname(new URL(import.meta.url).pathname), "bkit-install.ts");
const getTsxBin = () =>
  path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../node_modules/.bin/tsx");

function runBkit(args: string[]): { stdout: string; stderr: string; status: number | null } {
  const result = spawnSync(getTsxBin(), [getInstallPath(), ...args], {
    cwd: tmpDir,
    encoding: "utf-8",
    env: { ...process.env, NODE_NO_WARNINGS: "1" },
    timeout: 90_000,
  });
  return { stdout: result.stdout ?? "", stderr: result.stderr ?? "", status: result.status };
}

const opencodeJsonPath = () => path.join(tmpDir, ".opencode", "opencode.json");

beforeEach(() => {
  originalCwd = process.cwd();
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-check-opencode-"));
  // Minimal consumer prerequisites: package.json + a .git marker so the preflight
  // not-a-git-repo blocker is satisfied. The bkit.* manifest fields are written by install.
  fs.writeFileSync(
    path.join(tmpDir, "package.json"),
    JSON.stringify({ name: "check-opencode-consumer", version: "0.0.0" }, null, 2) + "\n",
    "utf-8",
  );
  fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("#255 #8 — bkit check gates opencode drift (no false positives)", () => {
  // A clean install must check GREEN for every provider/tracker shape — proving the
  // render-input fallback uses the INSTALLED provider, not the ollama default.
  it("clean install (openrouter + github) → check exits 0, zero would-write drift", () => {
    if (!fs.existsSync(getTsxBin())) return; // CI without devDeps
    const install = runBkit(["install", "--claude", "--opencode=openrouter", "--tracker=github"]);
    expect(install.status).toBe(0);
    expect(fs.existsSync(opencodeJsonPath())).toBe(true);

    const check = runBkit(["check"]);
    expect(check.status).toBe(0);
    expect(check.stdout).toContain("0 write(s) would occur");
    expect(`${check.stdout}${check.stderr}`).not.toContain("DRIFT DETECTED");
  });

  // opencode renders an `opencode`-keyed provider block, read through package.json, not the
  // opencode.json provider-block key.
  it("clean install (opencode-go gateway, opencode-go block keyed by provider) → check exits 0, no false drift", () => {
    if (!fs.existsSync(getTsxBin())) return;
    const install = runBkit(["install", "--claude", "--opencode=opencode-go", "--tracker=github"]);
    expect(install.status).toBe(0);
    // opencode-go renders a built-in block keyed `opencode-go` — confirm the fixture exercises it.
    const cfg = JSON.parse(fs.readFileSync(opencodeJsonPath(), "utf-8")) as {
      provider?: Record<string, unknown>;
    };
    expect(cfg.provider?.["opencode-go"]).toBeDefined();

    const check = runBkit(["check"]);
    expect(check.status).toBe(0);
    expect(check.stdout).toContain("0 write(s) would occur");
  });

  // A keyless provider with tracker=none (no mcp block) must also check green.
  it("clean install (ollama, no tracker) → check exits 0, no false drift", () => {
    if (!fs.existsSync(getTsxBin())) return;
    const install = runBkit(["install", "--opencode=opencode-go"]);
    expect(install.status).toBe(0);

    const check = runBkit(["check"]);
    expect(check.status).toBe(0);
    expect(check.stdout).toContain("0 write(s) would occur");
  });

  // A consumer who drops the bkit permission sandbox from opencode.json FAILS check.
  it("dropped permission block in opencode.json → check exits 1 (drift detected)", () => {
    if (!fs.existsSync(getTsxBin())) return;
    expect(runBkit(["install", "--opencode=openrouter", "--tracker=github"]).status).toBe(0);

    const cfg = JSON.parse(fs.readFileSync(opencodeJsonPath(), "utf-8")) as Record<string, unknown>;
    delete cfg.permission; // consumer weakened the sandbox — bkit-owned key removed
    fs.writeFileSync(opencodeJsonPath(), JSON.stringify(cfg, null, 2) + "\n", "utf-8");

    const check = runBkit(["check"]);
    expect(check.status).toBe(1);
    expect(`${check.stdout}${check.stderr}`).toContain(".opencode/opencode.json");
  });

  // gateguard.js is Tier-2 markered-text: bkit owns only the content between
  // `// bkit:start` / `// bkit:end`. Tampering INSIDE the block is drift (check must
  // fail); tampering OUTSIDE it is the consumer's own driver code (check must pass).
  it("tampered gateguard.js INSIDE the managed block → check exits 1 (drift detected)", () => {
    if (!fs.existsSync(getTsxBin())) return;
    expect(runBkit(["install", "--opencode=openrouter", "--tracker=github"]).status).toBe(0);

    const gateguard = path.join(tmpDir, ".opencode", "plugin", "gateguard.js");
    const original = fs.readFileSync(gateguard, "utf-8");
    expect(original).toContain('const EDIT_TOOLS = new Set(["write", "edit", "patch"]);');
    fs.writeFileSync(
      gateguard,
      original.replace(
        'const EDIT_TOOLS = new Set(["write", "edit", "patch"]);',
        'const EDIT_TOOLS = new Set(["write"]);', // consumer weakened the managed block
      ),
      "utf-8",
    );

    const check = runBkit(["check"]);
    expect(check.status).toBe(1);
    expect(`${check.stdout}${check.stderr}`).toContain(".opencode/plugin/gateguard.js");
  });

  it("tampered gateguard.js OUTSIDE the managed block → check exits 0 (consumer-owned)", () => {
    if (!fs.existsSync(getTsxBin())) return;
    expect(runBkit(["install", "--opencode=openrouter", "--tracker=github"]).status).toBe(0);

    const gateguard = path.join(tmpDir, ".opencode", "plugin", "gateguard.js");
    fs.appendFileSync(gateguard, "\n// consumer's own extra logic\n", "utf-8");

    const check = runBkit(["check"]);
    expect(check.status).toBe(0);
  });

  // Host agent/command mirrors push would-writes into ws.writes — content drift (marker
  // still current) must fail check, not only managed-version-marker stale.
  it("tampered agent mirror content → check exits 1 (writeset drift)", () => {
    if (!fs.existsSync(getTsxBin())) return;
    expect(runBkit(["install", "--opencode=openrouter", "--tracker=github"]).status).toBe(0);

    const agentDir = path.join(tmpDir, ".opencode", "agents");
    const agentFile = fs.readdirSync(agentDir).find((f) => f.endsWith(".md"));
    expect(agentFile).toBeDefined();
    fs.appendFileSync(path.join(agentDir, agentFile!), "\n<!-- consumer tampered -->\n", "utf-8");

    const check = runBkit(["check"]);
    expect(check.status).toBe(1);
    expect(`${check.stdout}${check.stderr}`).toMatch(/write\(s\) would occur|DRIFT DETECTED/);
  });

  // An adding-extra-keys edit is NOT drift: opencode.json is Tier-2 deep-contained, so a
  // consumer's own extra keys are theirs to keep. (Locks in the deep-contain contract so a
  // future over-eager gate doesn't start failing on benign consumer additions.)
  it("consumer-added extra key in opencode.json → check exits 0 (deep-contain, not drift)", () => {
    if (!fs.existsSync(getTsxBin())) return;
    expect(runBkit(["install", "--opencode=openrouter", "--tracker=github"]).status).toBe(0);

    const cfg = JSON.parse(fs.readFileSync(opencodeJsonPath(), "utf-8")) as Record<string, unknown>;
    cfg.theme = "consumer-custom-theme"; // a key bkit does not own
    fs.writeFileSync(opencodeJsonPath(), JSON.stringify(cfg, null, 2) + "\n", "utf-8");

    const check = runBkit(["check"]);
    expect(check.status).toBe(0);
    expect(check.stdout).toContain("0 write(s) would occur");
  });

  // No default provider. `bkit check` / `bkit upgrade` take no `--opencode=` flag and read
  // what the consumer installed; a repo carrying .opencode/ with no recorded provider is
  // reported as a broken install, never rendered against a substitute.
  it("opencode installed but no provider recorded → check exits 1 and names the fix", () => {
    if (!fs.existsSync(getTsxBin())) return;
    expect(runBkit(["install", "--opencode=openrouter", "--tracker=github"]).status).toBe(0);

    // Erase both provider signals: the package.json manifest field and the opencode.json block.
    const pkgPath = path.join(tmpDir, "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8")) as {
      bkit?: { opencodeProvider?: unknown; opencodeProviders?: unknown };
    };
    delete pkg.bkit?.opencodeProvider;
    delete pkg.bkit?.opencodeProviders;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf-8");

    const cfg = JSON.parse(fs.readFileSync(opencodeJsonPath(), "utf-8")) as Record<string, unknown>;
    delete cfg.provider;
    fs.writeFileSync(opencodeJsonPath(), JSON.stringify(cfg, null, 2) + "\n", "utf-8");

    const check = runBkit(["check"]);
    expect(check.status).toBe(1);
    const combined = `${check.stdout}${check.stderr}`;
    expect(combined).toMatch(/no provider is recorded/);
    expect(combined).toMatch(/bkit install --opencode=<provider>/);
    // The message must list the real allowlist so the fix is actionable.
    expect(combined).toMatch(/openrouter, ollama, opencode-zen, opencode-go/);
  });

  it("a consumer with no opencode host at all is not failed for a missing provider", () => {
    if (!fs.existsSync(getTsxBin())) return;
    expect(runBkit(["install", "--claude", "--tracker=github"]).status).toBe(0);

    const check = runBkit(["check"]);
    expect(check.status).toBe(0);
    expect(`${check.stdout}${check.stderr}`).not.toMatch(/no provider is recorded/);
  });
});
