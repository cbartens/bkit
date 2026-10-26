// PROBE 6 — where does a friction row land if the seam writes to `repoRoot(cwd)`?
//
// Review CRITICAL 3: `repoRoot(cwd)` resolves `--git-common-dir`'s parent — the MAIN checkout
// even when called from `.worktrees/{fid}` — so `appendLedgerRows(repoRoot(cwd), ...)` writes
// outside the run's tree. This probe resolves the paths from inside this worktree and shows
// whether the run's own `.bkit/friction.jsonl` is the same file.
import fs from "node:fs";
import path from "node:path";
import { repoRoot, statusLocation } from "../../../../../../.bkit/core/engine/commands/lib.js";

const cwd = process.cwd();
const root = repoRoot(cwd);
const top = new URL("../../../../../../", import.meta.url).pathname.replace(/\/$/, "");

const loc = statusLocation({
  cwd,
  workflow: "design",
  fid: "699-engine-run-completeness",
  month: "202610",
});

console.log(`cwd (the run's worktree)      : ${cwd}`);
console.log(`repoRoot(cwd)                 : ${root}`);
console.log(`worktree toplevel             : ${top}`);
console.log(`statusLocation.bookRoot       : ${loc.bookRoot}`);
console.log(`statusLocation.path           : ${loc.path}`);
console.log(`\nrepoRoot == worktree toplevel : ${root === top}`);

const frictionAt = (base: string) => path.join(base, ".bkit", "friction.jsonl");
const main = frictionAt(root);
const wt = frictionAt(top);
const stat = (f: string) => {
  try {
    const s = fs.statSync(f);
    return `ino=${s.ino} size=${s.size}`;
  } catch {
    return "absent";
  }
};
console.log(`\nmain-checkout .bkit/friction.jsonl : ${main}  ${stat(main)}`);
console.log(`worktree      .bkit/friction.jsonl : ${wt}  ${stat(wt)}`);
console.log(
  `same file (same inode)             : ${(() => {
    try {
      return fs.statSync(main).ino === fs.statSync(wt).ino;
    } catch {
      return "n/a (one absent)";
    }
  })()}`,
);

console.log(
  `\nwhere the workflow prose's own \`bkit ledgers append\` writes (--root default: cwd):`,
);
console.log(
  `  ${path.join(cwd, ".bkit", "friction.jsonl")}  == worktree copy: ${path.join(cwd, ".bkit", "friction.jsonl") === wt}`,
);
