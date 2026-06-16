// bkit-check-opencode.integration.test.ts — #255 #8 regression
//
// `bkit check` must drift-gate the opencode host. `.opencode/opencode.json` is the most
// drift-sensitive file bkit ships (provider block + tracker-filtered mcp + the permission
// sandbox), so a consumer weakening it — or a tampered gateguard.js — must fail `check`.
//
// The trap this guards (the reason the gate was deferred until the render inputs were fixed):
// `bkit check` takes no `--opencode=` flag, so without a provider/tracker FALLBACK the check
// would re-render with the ollama-local/default and report FALSE drift for an nvidia/opencode/…
// consumer. The render inputs now fall back to the installed provider (package.json
// `bkit.opencodeProvider`, the authoritative signal for the opencode gateway whose on-disk block
// is keyed `opencode`) and the recorded tracker — so a clean install checks green across providers.
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
  // render-input fallback uses the INSTALLED provider, not the ollama-local default.
  it("clean install (nvidia + github) → check exits 0, zero would-write drift", () => {
    if (!fs.existsSync(getTsxBin())) return; // CI without devDeps
    const install = runBkit(["install", "--claude", "--opencode=nvidia", "--tracker=github"]);
    expect(install.status).toBe(0);
    expect(fs.existsSync(opencodeJsonPath())).toBe(true);

    const check = runBkit(["check"]);
    expect(check.status).toBe(0);
    expect(check.stdout).toContain("0 write(s) would occur");
    expect(`${check.stdout}${check.stderr}`).not.toContain("DRIFT DETECTED");
  });

  // opencode renders an `opencode`-keyed provider block. This is the case that false-drifts if
  // detection regresses to mapping the opencode.json provider-block key straight to a bkit key.
  it("clean install (opencode gateway, opencode block keyed by providerId) → check exits 0, no false drift", () => {
    if (!fs.existsSync(getTsxBin())) return;
    const install = runBkit(["install", "--claude", "--opencode=opencode", "--tracker=github"]);
    expect(install.status).toBe(0);
    // opencode ships a built-in `opencode` block — confirm the fixture exercises the providerId path.
    const cfg = JSON.parse(fs.readFileSync(opencodeJsonPath(), "utf-8")) as {
      provider?: Record<string, unknown>;
    };
    expect(cfg.provider?.opencode).toBeDefined();

    const check = runBkit(["check"]);
    expect(check.status).toBe(0);
    expect(check.stdout).toContain("0 write(s) would occur");
  });

  // A keyless provider with tracker=none (no mcp block) must also check green.
  it("clean install (ollama-local, no tracker) → check exits 0, no false drift", () => {
    if (!fs.existsSync(getTsxBin())) return;
    const install = runBkit(["install", "--opencode=ollama-local"]);
    expect(install.status).toBe(0);

    const check = runBkit(["check"]);
    expect(check.status).toBe(0);
    expect(check.stdout).toContain("0 write(s) would occur");
  });

  // The actual guard: a consumer who drops the bkit permission sandbox from opencode.json
  // (exactly the weakening #255 P1-3 hardened) must FAIL check.
  it("dropped permission block in opencode.json → check exits 1 (drift detected)", () => {
    if (!fs.existsSync(getTsxBin())) return;
    expect(runBkit(["install", "--opencode=nvidia", "--tracker=github"]).status).toBe(0);

    const cfg = JSON.parse(fs.readFileSync(opencodeJsonPath(), "utf-8")) as Record<string, unknown>;
    delete cfg.permission; // consumer weakened the sandbox — bkit-owned key removed
    fs.writeFileSync(opencodeJsonPath(), JSON.stringify(cfg, null, 2) + "\n", "utf-8");

    const check = runBkit(["check"]);
    expect(check.status).toBe(1);
    expect(`${check.stdout}${check.stderr}`).toContain(".opencode/opencode.json");
  });

  // gateguard.js is Tier-1 byte-equal (force-overwritten by install). A tampered copy is drift.
  it("tampered gateguard.js → check exits 1 (drift detected)", () => {
    if (!fs.existsSync(getTsxBin())) return;
    expect(runBkit(["install", "--opencode=nvidia", "--tracker=github"]).status).toBe(0);

    const gateguard = path.join(tmpDir, ".opencode", "plugin", "gateguard.js");
    fs.appendFileSync(gateguard, "\n// consumer tampered\n", "utf-8");

    const check = runBkit(["check"]);
    expect(check.status).toBe(1);
    expect(`${check.stdout}${check.stderr}`).toContain(".opencode/plugin/gateguard.js");
  });

  // An adding-extra-keys edit is NOT drift: opencode.json is Tier-2 deep-contained, so a
  // consumer's own extra keys are theirs to keep. (Locks in the deep-contain contract so a
  // future over-eager gate doesn't start failing on benign consumer additions.)
  it("consumer-added extra key in opencode.json → check exits 0 (deep-contain, not drift)", () => {
    if (!fs.existsSync(getTsxBin())) return;
    expect(runBkit(["install", "--opencode=nvidia", "--tracker=github"]).status).toBe(0);

    const cfg = JSON.parse(fs.readFileSync(opencodeJsonPath(), "utf-8")) as Record<string, unknown>;
    cfg.theme = "consumer-custom-theme"; // a key bkit does not own
    fs.writeFileSync(opencodeJsonPath(), JSON.stringify(cfg, null, 2) + "\n", "utf-8");

    const check = runBkit(["check"]);
    expect(check.status).toBe(0);
    expect(check.stdout).toContain("0 write(s) would occur");
  });
});
