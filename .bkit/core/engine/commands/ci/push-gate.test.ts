import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { useGateRunner } from "../../../../../vitest.gate-fixture";
import { runCommand } from "../lib";
import { ciCommand } from "./ci";
import { requireTsx } from "../../../../../vitest.tsx-bin";

const ROOT = path.resolve(__dirname, "../../../../..");
const dirs: string[] = [];
const UNIT = "bkit:gate:static-unit";
const INTEGRATION = "bkit:gate:static-unit-integration";
const ZERO = "0".repeat(40);
useGateRunner(".gate-runner-invoked");

function git(cwd: string, ...args: string[]): string {
  const result = spawnSync("git", ["-c", "user.name=Test", "-c", "user.email=t@t", ...args], {
    cwd,
    encoding: "utf8",
  });
  expect(result.status, result.stderr).toBe(0);
  return result.stdout.trim();
}
function write(cwd: string, file: string, content: string) {
  fs.mkdirSync(path.dirname(path.join(cwd, file)), { recursive: true });
  fs.writeFileSync(path.join(cwd, file), content);
}
function commit(cwd: string, message = "change") {
  git(cwd, "add", "-A");
  git(cwd, "commit", "-qm", message, "--allow-empty");
  return git(cwd, "rev-parse", "HEAD");
}
function fixture(
  script = "node -e \"require('fs').writeFileSync('.gate-ran','yes')\"",
  integration = false,
) {
  fs.mkdirSync(path.join(ROOT, "tmp"), { recursive: true });
  const cwd = fs.mkdtempSync(path.join(ROOT, "tmp", "push-gate-"));
  dirs.push(cwd);
  write(
    cwd,
    "package.json",
    JSON.stringify({
      scripts: {
        [UNIT]: script,
        ...(integration ? { [INTEGRATION]: script } : {}),
        "bkit:gate:min": "true",
        "bkit:gate:static": "true",
      },
    }),
  );
  write(cwd, ".gitignore", ".gate-*\n");
  write(cwd, "src/code.ts", "original\n");
  git(cwd, "init", "-q", "-b", "feat/test");
  const base = commit(cwd);
  git(cwd, "update-ref", "refs/remotes/origin/dev", base);
  write(cwd, "src/code.ts", "feature\n");
  const code = commit(cwd);
  return { cwd, base, code };
}
async function run(cwd: string, verb: string, ...args: string[]) {
  const lines: string[] = [];
  const status = await runCommand(["ci", verb, ...args, "--json"], [ciCommand], {
    cwd,
    classicVerbs: new Set(),
    io: { stdout: (s) => lines.push(s), stderr: () => undefined },
  });
  return { status, output: lines.join("") };
}
const gate = (cwd: string, name = UNIT) => run(cwd, "push-gate", `--gate=${name}`);
const min = (cwd: string, old: string, next: string, ...extra: string[]) =>
  run(cwd, "min-push", `--update=${old}:${next}`, ...extra);
function book(cwd: string) {
  write(cwd, "docs/plans/202611/logs/test/summary.md", "done\n");
  return commit(cwd);
}
const receipt = (cwd: string, sha: string) =>
  path.join(cwd, ".git/bkit-outbox/push-gates", `${sha}.json`);
async function waitForFile(file: string) {
  const until = Date.now() + 10_000;
  while (!fs.existsSync(file) && Date.now() < until)
    await new Promise((resolve) => setTimeout(resolve, 10));
  expect(fs.existsSync(file)).toBe(true);
}
afterEach(() => {
  for (const dir of dirs.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
});

describe("verified incremental push gates", () => {
  it.each([
    { outcome: "failure", stop: (_child: ChildProcess) => undefined },
    { outcome: "interruption", stop: (child: ChildProcess) => child.kill("SIGTERM") },
  ])(
    "keeps the later $outcome when two full gates overlap on the same commit",
    async ({ stop }) => {
      const { cwd, code } = fixture(
        "node -e \"const fs=require('fs'); const id=process.env.BKIT_TEST_GATE_ID; fs.writeFileSync('.gate-start-'+id,'yes'); setInterval(()=>{if(fs.existsSync('.gate-release-'+id))process.exit(id==='a'?0:9)},10)\"",
      );
      const driver = path.join(cwd, ".git", "gate-driver.mts");
      fs.writeFileSync(
        driver,
        `import {runPushGate} from ${JSON.stringify(path.join(__dirname, "push-gate.ts"))}; process.exit(runPushGate(process.cwd(), ${JSON.stringify(UNIT)}, ()=>{}));`,
      );
      const start = (id: string) => {
        const child = spawn(requireTsx(), [driver], {
          cwd,
          env: { ...process.env, BKIT_TEST_GATE_ID: id },
          stdio: "ignore",
        });
        const exited = new Promise<number | null>((resolve, reject) => {
          child.once("exit", resolve);
          child.once("error", reject);
        });
        return { child, exited };
      };
      const a = start("a");
      await waitForFile(path.join(cwd, ".gate-start-a"));
      const b = start("b");
      try {
        await waitForFile(path.join(cwd, ".gate-start-b"));
        write(cwd, ".gate-release-a", "yes");
        expect(await a.exited).toBe(0);
        expect((await min(cwd, code, code)).status).toBe(1);
        stop(b.child);
        write(cwd, ".gate-release-b", "yes");
        expect(await b.exited).not.toBe(0);
        expect((await min(cwd, code, book(cwd))).status).toBe(1);
      } finally {
        a.child.kill();
        b.child.kill();
      }
    },
  );
  it.each([
    { gateName: UNIT, scripts: {} },
    { gateName: UNIT, scripts: { [UNIT]: "  " } },
    { gateName: "bkit:gate:min", scripts: { [UNIT]: "true" } },
    { gateName: "bkit:gate:min", scripts: { [UNIT]: "true", "bkit:gate:min": "" } },
  ])(
    "rejects missing or empty $gateName before starting the package runner",
    async ({ gateName, scripts }) => {
      const { cwd } = fixture();
      write(cwd, "package.json", JSON.stringify({ scripts }));
      commit(cwd);
      expect((await gate(cwd, gateName)).status).toBe(2);
      expect(fs.existsSync(path.join(cwd, ".gate-runner-invoked"))).toBe(false);
    },
  );
  it("blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success", async () => {
    const { cwd } = fixture(
      "node -e \"const fs=require('fs'); if(fs.existsSync('.gate-ran')) process.exit(9); fs.writeFileSync('.gate-ran','yes')\"",
    );
    expect((await gate(cwd)).status).toBe(0);
    const failed = book(cwd);
    expect((await gate(cwd)).status).toBe(9);
    const next = commit(cwd, "trigger");
    expect((await min(cwd, failed, next)).status).toBe(1);
    fs.writeFileSync(`${receipt(cwd, failed)}.failed`, "{broken");
    expect((await min(cwd, failed, next)).status).toBe(1);
    fs.rmSync(path.join(cwd, ".gate-ran"));
    expect((await gate(cwd)).status).toBe(0);
    expect((await min(cwd, next, commit(cwd, "next trigger"))).status).toBe(0);
  });
  it("does not fall back through a malformed later success receipt", async () => {
    const { cwd } = fixture("true");
    expect((await gate(cwd)).status).toBe(0);
    const later = book(cwd);
    expect((await gate(cwd)).status).toBe(0);
    fs.writeFileSync(receipt(cwd, later), "{broken");
    expect((await min(cwd, later, commit(cwd, "trigger"))).status).toBe(1);
  });
  it("requires proof for empty docs updates and refuses rewritten or unknown remote heads", async () => {
    const { cwd, base } = fixture();
    git(cwd, "checkout", "-qb", "docs", base);
    const docs = book(cwd);
    expect((await min(cwd, docs, commit(cwd, "trigger"))).status).toBe(1);
    git(cwd, "checkout", "-qb", "other-docs", base);
    write(cwd, "docs/plans/other.md", "other\n");
    const other = commit(cwd);
    expect((await min(cwd, docs, other)).status).not.toBe(0);
    expect((await min(cwd, "1".repeat(40), other)).status).not.toBe(0);
  });
  it("invalidates an earlier receipt when a repeat full gate fails", async () => {
    const { cwd, code } = fixture(
      "node -e \"const fs=require('fs'); if(fs.existsSync('.gate-ran')) process.exit(9); fs.writeFileSync('.gate-ran','yes')\"",
    );
    expect((await gate(cwd)).status).toBe(0);
    expect(fs.existsSync(receipt(cwd, code))).toBe(true);
    expect((await gate(cwd)).status).toBe(9);
    expect(fs.existsSync(receipt(cwd, code))).toBe(false);
  });
  it("executes the full gate and carries its proof across bookkeeping and empty commits", async () => {
    const { cwd, code } = fixture();
    expect((await gate(cwd)).status).toBe(0);
    expect(fs.readFileSync(path.join(cwd, ".gate-ran"), "utf8")).toBe("yes");
    const bookkeeping = book(cwd);
    expect((await min(cwd, code, bookkeeping)).status).toBe(0);
    const empty = commit(cwd, "trigger");
    expect((await min(cwd, bookkeeping, empty)).status).toBe(0);
    expect((await run(cwd, "min-push", `--ref=${empty}`)).status).toBe(1);
  });
  it("requires proof even when the pushed increment changes no files", async () => {
    const { cwd, code } = fixture();
    expect((await min(cwd, code, commit(cwd, "trigger"))).status).toBe(1);
    expect((await min(cwd, code, book(cwd))).status).toBe(1);
  });
  it("ignores malformed receipts", async () => {
    const { cwd, code } = fixture();
    expect((await gate(cwd)).status).toBe(0);
    write(cwd, path.relative(cwd, receipt(cwd, code)), "{bad");
    expect((await min(cwd, code, book(cwd))).status).toBe(1);
  });
  it.each([
    {
      kind: "tracked",
      script: "true",
      prepare: (cwd: string) => write(cwd, "src/code.ts", "dirty\n"),
    },
    {
      kind: "untracked",
      script: "true",
      prepare: (cwd: string) => write(cwd, "unexpected", "dirty\n"),
    },
    {
      kind: "mutated",
      script: "node -e \"require('fs').writeFileSync('src/code.ts','mutated')\"",
      prepare: () => undefined,
    },
    {
      kind: "committed",
      script: "git -c user.name=Test -c user.email=t@t commit --allow-empty -m gate",
      prepare: () => undefined,
    },
  ])("does not record a $kind tree", async ({ script, prepare }) => {
    const { cwd, code } = fixture(script);
    prepare(cwd);
    expect((await gate(cwd)).status).toBe(0);
    expect(fs.existsSync(receipt(cwd, code))).toBe(false);
  });
  it("records no proof for a failed gate or lighter gate", async () => {
    const { cwd, code } = fixture("exit 9");
    expect((await gate(cwd)).status).toBe(9);
    expect((await gate(cwd, "bkit:gate:min")).status).toBe(0);
    expect((await gate(cwd, "bkit:gate:static")).status).toBe(0);
    expect(fs.existsSync(receipt(cwd, code))).toBe(false);
  });
  it("requires integration proof when integration is declared", async () => {
    const { cwd, code } = fixture("true", true);
    expect((await gate(cwd)).status).toBe(0);
    expect(fs.existsSync(receipt(cwd, code))).toBe(false);
    expect((await gate(cwd, INTEGRATION)).status).toBe(0);
    expect((await min(cwd, code, book(cwd))).status).toBe(0);
  });
  it("rejects new code, a mixed push, new branches with code, and non-ancestor old heads", async () => {
    const { cwd, code, base } = fixture();
    expect((await gate(cwd)).status).toBe(0);
    const docs = book(cwd);
    expect((await min(cwd, ZERO, docs)).status).toBe(1);
    git(cwd, "checkout", "-qb", "other", base);
    write(cwd, "src/code.ts", "rewritten\n");
    const rewrite = book(cwd);
    expect((await min(cwd, code, rewrite)).status).not.toBe(0);
    git(cwd, "checkout", "-q", "feat/test");
    write(cwd, "src/code.ts", "untested\n");
    const newCode = commit(cwd);
    expect((await min(cwd, docs, newCode)).status).toBe(1);
    expect((await min(cwd, code, docs, `--update=${docs}:${newCode}`)).status).toBe(1);
  });
  it("invalidates proof when the gate definition changes", async () => {
    const { cwd, code } = fixture();
    expect((await gate(cwd)).status).toBe(0);
    write(
      cwd,
      "package.json",
      JSON.stringify({
        scripts: { [UNIT]: "echo different" },
        bkit: { testing: { minPushPaths: ["package.json"] } },
      }),
    );
    expect((await min(cwd, code, commit(cwd))).status).toBe(1);
  });
  it("keeps whole-branch docs-only classification and rejects mixed argument modes", async () => {
    const { cwd, base } = fixture();
    git(cwd, "checkout", "-qb", "docs", base);
    const docs = book(cwd);
    expect((await min(cwd, ZERO, docs)).status).toBe(0);
    expect((await min(cwd, base, docs, `--base=${base}`)).status).toBe(2);
    expect((await min(cwd, base, docs, `--ref=${docs}`)).status).toBe(2);
  });
});
