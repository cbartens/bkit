// Claim C10: when the real acquirePublicationLock does not acquire, the cause is a timeout
// behind a live holder the run can name (the design's "fails closed on timeout, holder named").
// Disproved by any null that comes back early, or with no live holder to name.
import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { createHash, randomBytes } from "node:crypto";
import { acquirePublicationLock } from "../../../../../../.bkit/core/engine/commands/workflow/locks.ts";

const opts = { target: "dev-landing", invocation: "local", timeoutMs: 10_000 };
function repoWithLock(content: string | null) {
  const repo = fs.mkdtempSync(path.join(process.env.TMPDIR ?? os.tmpdir(), "c10-"));
  execFileSync("git", ["init", "-q", repo]);
  const common = execFileSync("git", ["-C", repo, "rev-parse", "--path-format=absolute", "--git-common-dir"], { encoding: "utf8" }).trim();
  const digest = createHash("sha256").update("dev-landing\0local").digest("hex");
  const file = path.join(common, "bkit-outbox", "publication-locks", `${digest}.lock`);
  if (content !== null) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
  }
  return { repo, file };
}
async function attempt(label: string, repo: string, file: string) {
  const t0 = performance.now();
  const lock = await acquirePublicationLock(repo, opts);
  console.log(
    `[${label}] ${lock ? "acquired" : "null"} in ${Math.round(performance.now() - t0)} ms (asked ${opts.timeoutMs} ms); lock file present after: ${fs.existsSync(file)}`,
  );
  fs.rmSync(repo, { recursive: true, force: true });
}

// a) a truncated holder file (a holder killed mid-write).
let r = repoWithLock('{"path":"x","token":"');
await attempt("truncated holder file", r.repo, r.file);

// b) a holder file written by another host sharing the git common dir.
r = repoWithLock(
  JSON.stringify({
    path: "x",
    token: randomBytes(16).toString("hex"),
    owner: { host: "another-host.example", pid: 1, startTime: new Date().toString() },
  }),
);
await attempt("holder on another host", r.repo, r.file);

// c) no holder at all, on a host without `ps` (e.g. a slim container image): PATH keeps git only.
r = repoWithLock(null);
const onlyGit = fs.mkdtempSync(path.join(process.env.TMPDIR ?? os.tmpdir(), "c10-path-"));
fs.symlinkSync(execFileSync("sh", ["-c", "command -v git"], { encoding: "utf8" }).trim(), path.join(onlyGit, "git"));
const savedPath = process.env.PATH;
process.env.PATH = onlyGit;
console.log(`[no ps] PATH=${onlyGit} (contains only git)`);
await attempt("no holder, ps not on PATH", r.repo, r.file);
process.env.PATH = savedPath;
fs.rmSync(onlyGit, { recursive: true, force: true });
