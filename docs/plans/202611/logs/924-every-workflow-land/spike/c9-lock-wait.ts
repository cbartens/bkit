// Claim C9: a second landing waits on a live same-host holder and acquires the real
// publication lock once the holder releases it (Settled Q7: "the second waits").
// Also measured: what a caller asking for a 45 s wait gets while the holder keeps it 40 s.
import { spawn, execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { acquirePublicationLock } from "../../../../../../.bkit/core/engine/commands/workflow/locks.ts";

async function scenario(label: string, holdMs: number, waitMs: number) {
  const repo = fs.mkdtempSync(path.join(process.env.TMPDIR ?? os.tmpdir(), "c9-"));
  execFileSync("git", ["init", "-q", repo]);
  const child = spawn(process.execPath, ["--import", "tsx", path.join(import.meta.dirname, "lock-holder.ts"), repo, String(holdMs)]);
  let out = "";
  child.stdout.on("data", (d: Buffer) => (out += d.toString()));
  while (!out.includes("HELD")) await new Promise((r) => setTimeout(r, 20));
  const t0 = performance.now();
  const lock = await acquirePublicationLock(repo, {
    target: "dev-landing",
    invocation: "local",
    timeoutMs: waitMs,
  });
  const ms = Math.round(performance.now() - t0);
  console.log(
    `[${label}] holder holds ${holdMs} ms, caller asks ${waitMs} ms: ${lock ? "acquired" : "null"} after ${ms} ms; holder said: ${out.trim().replace(/\n/g, " | ").replace(/HELD \S+/, "HELD <lock>")}`,
  );
  child.kill("SIGKILL");
  fs.rmSync(repo, { recursive: true, force: true });
}
await scenario("release-then-acquire", 3000, 10_000);
await scenario("long-wait-request", 40_000, 45_000);
