// Claim C7: a landing-lock holder killed with SIGKILL is reclaimed at once by the real
// acquirePublicationLock (no wait, no stop).
import { spawn, execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { acquirePublicationLock } from "../../../../../../.bkit/core/engine/commands/workflow/locks.ts";

const repo = fs.mkdtempSync(path.join(process.env.TMPDIR ?? os.tmpdir(), "c7-"));
execFileSync("git", ["init", "-q", repo]);
const child = spawn(process.execPath, ["--import", "tsx", path.join(import.meta.dirname, "lock-holder.ts"), repo, "600000"]);
const held = await new Promise<string>((resolve) =>
  child.stdout.on("data", (d: Buffer) => resolve(d.toString().trim())),
);
console.log(`child: ${held}`);
const lockFile = held.split(" ")[1]!;
const holderPid = JSON.parse(fs.readFileSync(lockFile, "utf8")).owner.pid as number;
console.log(`lock file owner.pid=${holderPid}`);
process.kill(holderPid, "SIGKILL");
child.kill("SIGKILL");
await new Promise((r) => setTimeout(r, 300));
let alive = true;
try {
  process.kill(holderPid, 0);
} catch (e) {
  alive = (e as NodeJS.ErrnoException).code !== "ESRCH";
}
console.log(`holder alive after SIGKILL: ${alive}; lock file still present: ${fs.existsSync(lockFile)}`);
const t0 = performance.now();
const lock = await acquirePublicationLock(repo, {
  target: "dev-landing",
  invocation: "local",
  timeoutMs: 10_000,
});
console.log(
  `acquire after SIGKILL: ${lock ? `acquired (owner.pid=${lock.owner.pid} = me ${lock.owner.pid === process.pid})` : "null"} in ${Math.round(performance.now() - t0)} ms`,
);
fs.rmSync(repo, { recursive: true, force: true });
