// Claim C8: a holder that died and whose PID now belongs to another live process (PID reuse:
// the lock file's owner.startTime no longer matches the live PID's start time) is reclaimed,
// as the design's "a dead holder is reclaimed at once" requires.
import { spawn, execFileSync } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { acquirePublicationLock } from "../../../../../../.bkit/core/engine/commands/workflow/locks.ts";

const repo = fs.mkdtempSync(path.join(process.env.TMPDIR ?? os.tmpdir(), "c8-"));
execFileSync("git", ["init", "-q", repo]);
const common = execFileSync("git", ["-C", repo, "rev-parse", "--path-format=absolute", "--git-common-dir"], { encoding: "utf8" }).trim();
const digest = createHash("sha256").update("dev-landing\0local").digest("hex");
const file = path.join(common, "bkit-outbox", "publication-locks", `${digest}.lock`);
// A live unrelated process takes the role of the reused PID.
const reuser = spawn("sleep", ["60"]);
const liveStart = execFileSync("ps", ["-p", String(reuser.pid), "-o", "lstart="], { encoding: "utf8" }).trim();
const recordedStart = "Mon Jan  1 00:00:00 2024"; // the crashed holder's start time
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(
  file,
  JSON.stringify({
    path: file,
    token: randomBytes(16).toString("hex"),
    owner: { host: os.hostname(), pid: reuser.pid, startTime: recordedStart },
  }),
);
console.log(`lock file owner.pid=${reuser.pid} recorded startTime="${recordedStart}" live ps lstart="${liveStart}"`);
const t0 = performance.now();
const lock = await acquirePublicationLock(repo, {
  target: "dev-landing",
  invocation: "local",
  timeoutMs: 10_000,
});
console.log(
  `acquire with PID-reused holder: ${lock ? "acquired" : "null"} in ${Math.round(performance.now() - t0)} ms; lock file still present: ${fs.existsSync(file)}`,
);
const t1 = performance.now();
const again = await acquirePublicationLock(repo, {
  target: "dev-landing",
  invocation: "local",
  timeoutMs: 10_000,
});
console.log(`second attempt: ${again ? "acquired" : "null"} in ${Math.round(performance.now() - t1)} ms`);
reuser.kill("SIGKILL");
fs.rmSync(repo, { recursive: true, force: true });
