#!/usr/bin/env node
// THROWAWAY SPIKE PROBE — cut-down `new-run.mjs --bootstrap`.
// Settles: can bootstrap be create-or-idempotent-verify-and-repair against a live
// public repo, never creating or deleting the repo on the verify path?
//
// Usage: node new-run.mjs --bootstrap --repo <owner/name> [--source <dir>]
//   source/main/**  -> files `main` must hold (the fixture; sentinel present)
//   source/dev/**   -> files `dev` must hold (the durable root harness)
// Exit 0 = verified or repaired. Exit 1 = preflight/failure.
import { execFileSync } from "node:child_process";
import {
  readFileSync,
  readdirSync,
  statSync,
  mkdirSync,
  cpSync,
  rmSync,
  existsSync,
} from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const LOG = "[bkit-example]";
const here = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const flag = (name, dflt) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? dflt : argv[i + 1];
};
const has = (name) => argv.includes(`--${name}`);

const repo = flag("repo", "cbartens/bkit-example-spike-20261012");
const source = path.resolve(flag("source", path.join(here, "source")));
const work = path.join(here, "work");
const SENTINEL = "BKIT-EXAMPLE-SENTINEL-";

function run(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: "utf-8", ...opts });
}
function tryRun(cmd, args, opts = {}) {
  try {
    return { ok: true, out: run(cmd, args, opts) };
  } catch (e) {
    return { ok: false, out: String(e.stderr ?? e.message) };
  }
}
function sha(buf) {
  return createHash("sha256").update(buf).digest("hex");
}
function walk(dir, base = dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = path.join(dir, e);
    if (statSync(p).isDirectory()) out.push(...walk(p, base));
    else out.push(path.relative(base, p));
  }
  return out;
}

const log = (...a) => console.log(LOG, ...a);

// ---- preflight (pre-mutation) ---------------------------------------------
const pre = [];
if (!tryRun("gh", ["auth", "status"]).ok) pre.push("gh auth status");
const major = Number(process.versions.node.split(".")[0]);
if (major < 20) pre.push(`node >= 20 (have ${process.versions.node})`);
if (!tryRun("pnpm", ["--version"]).ok) pre.push("pnpm");
if (pre.length) {
  log(`preflight failed: ${pre.join(", ")}`);
  process.exit(1);
}
log(`preflight ok (node ${process.versions.node}, gh authed)`);
if (!has("bootstrap")) {
  log("no --bootstrap; normal run path is out of this probe's scope");
  process.exit(0);
}

// ---- exists? ---------------------------------------------------------------
const view = tryRun("gh", ["repo", "view", repo, "--json", "name,visibility"]);
if (!view.ok) {
  log(`repo ${repo} absent -> create`);
  const created = tryRun("gh", ["repo", "create", repo, "--public"]);
  if (!created.ok) {
    log(`gh repo create failed: ${created.out.trim()}`);
    process.exit(1);
  }
  log(`repo-created ${repo}`);
} else {
  const meta = JSON.parse(view.out);
  log(`repo-exists ${repo} (${meta.visibility}) -> verify mode`);
}

// ---- fetch current state ---------------------------------------------------
rmSync(work, { recursive: true, force: true });
mkdirSync(work, { recursive: true });
const clone = path.join(work, "repo");
const cloned = tryRun("git", ["clone", "--quiet", `https://github.com/${repo}.git`, clone]);
if (!cloned.ok) {
  log(`clone failed: ${cloned.out.trim()}`);
  process.exit(1);
}
const g = (args, opts = {}) => tryRun("git", ["-C", clone, ...args], opts);
for (const b of ["main", "dev"]) {
  const ls = tryRun("gh", ["api", `repos/${repo}/branches/${b}`, "--jq", ".name"]);
  if (!ls.ok) {
    log(`branch ${b} ABSENT — bootstrap seeding incomplete`);
  }
}

// ---- verify ----------------------------------------------------------------
// Item: {branch, relPath, expect: Buffer|undefined, mustContain?: string}
const items = [];
for (const rel of walk(path.join(source, "main"))) {
  items.push({ branch: "main", rel, expect: readFileSync(path.join(source, "main", rel)) });
}
for (const rel of walk(path.join(source, "dev"))) {
  items.push({ branch: "dev", rel, expect: readFileSync(path.join(source, "dev", rel)) });
}

const drift = [];
for (const it of items) {
  const res = g(["show", `origin/${it.branch}:${it.rel}`]);
  if (!res.ok) {
    drift.push({ ...it, why: "MISSING" });
    continue;
  }
  const have = Buffer.from(res.out, "utf-8");
  if (sha(have) !== sha(it.expect)) drift.push({ ...it, why: "DIFFERS" });
}
// fixture-integrity: the sentinel must be present on main (a renamed fixture
// silently commits a pure deletion of the app)
const sent = g(["show", "origin/main:example/index.html"]);
if (!sent.ok || !sent.out.includes(SENTINEL)) {
  drift.push({ branch: "main", rel: "example/index.html", why: "SENTINEL-ABSENT" });
}

log(`verified ${items.length} item(s) across main+dev; drift=${drift.length}`);
for (const d of drift) log(`  drift: ${d.branch}:${d.rel} ${d.why}`);

if (drift.length === 0) {
  log("verify-and-repair complete: no drift, no write, no repo create/delete (idempotent)");
  process.exit(0);
}

// ---- repair ----------------------------------------------------------------
g(["config", "user.email", "spike@example.invalid"]);
g(["config", "user.name", "spike probe"]);
const byBranch = new Map();
for (const d of drift) {
  if (!byBranch.has(d.branch)) byBranch.set(d.branch, new Set());
  byBranch.get(d.branch).add(d.rel);
}
for (const [branch, rels] of byBranch) {
  const co = g(["checkout", "--quiet", "-B", branch, `origin/${branch}`]);
  if (!co.ok) {
    log(`repair: cannot check out ${branch}: ${co.out.trim()}`);
    process.exit(1);
  }
  const src = path.join(source, branch);
  for (const rel of rels) {
    cpSync(path.join(src, rel), path.join(clone, rel));
    log(`repair: wrote ${rel} on ${branch}`);
  }
  g(["add", "--", ...rels]);
  const staged = g(["diff", "--cached", "--name-only"]);
  if (staged.ok && staged.out.trim() === "") {
    log(`repair: nothing staged on ${branch}`);
    continue;
  }
  const msg = `chore(example): bootstrap verify-and-repair (${branch})`;
  g(["commit", "--quiet", "-m", msg]);
  const push = g(["push", "--quiet", "origin", branch]);
  if (!push.ok) {
    log(`repair: push ${branch} FAILED: ${push.out.trim()}`);
    process.exit(1);
  }
  log(`repair-pushed ${branch} (${[...rels].length} file(s))`);
}
log(`verify-and-repair complete: repaired ${drift.length} item(s); repo never created or deleted`);
