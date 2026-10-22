#!/usr/bin/env node
// Example. Copy into the repo and own it.
// bkit install does not write this file and does not overwrite a copy.
// bkit-env-backup.mjs — an encrypted .enc copy beside every gitignored env file. See .bkit/templates.md § Env backup.
//
//   node scripts/env-backup/bkit-env-backup.mjs encrypt [--dry-run]  update the .enc beside each env file, one variable at a time
//   node scripts/env-backup/bkit-env-backup.mjs restore              write each env file back from its .enc (never overwrites)
//   node scripts/env-backup/bkit-env-backup.mjs rekey                move every .enc to the key in .sops.yaml
//   node scripts/env-backup/bkit-env-backup.mjs restage              post-commit hook: re-stage .enc copies a path-limited commit left behind
//
// Identical in every repo: bkit-env-backup.config.mjs beside it holds the repo's skip list.
// Needs Node >= 20, git, age and sops >= 3.11.0. The age private key stays on the machine; .sops.yaml holds the public key.
// Values are never printed: output is file paths, key names and counts.
// Exit: 0 done, or skipped with a warning · 1 stop (setup error, failed write) · 2 bad arguments.

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const MIN_SOPS = [3, 11, 0];
const PLACEHOLDER = "{{AGE_PUBLIC_KEY}}";
const PROBE_LINE = "BKIT_ENV_BACKUP_PROBE=1\n";
const CONFIG_KEYS = new Set(["skip"]);
const DOTENV = ["--input-type", "dotenv", "--output-type", "dotenv"];
const ENV_NAME = /^\.env(\..+)?$/;
const ENC_NAME = /^\.env(\..+)?\.enc$/;
const ENV_KEY = /^[A-Za-z_][A-Za-z0-9_.-]*$/;
const SOPS_VALUE = /^ENC\[AES256_GCM,/;
const USAGE = `Usage:
  node scripts/env-backup/bkit-env-backup.mjs encrypt [--dry-run]
  node scripts/env-backup/bkit-env-backup.mjs restore
  node scripts/env-backup/bkit-env-backup.mjs rekey
  node scripts/env-backup/bkit-env-backup.mjs restage
  node scripts/env-backup/bkit-env-backup.mjs help`;

class Stop extends Error {
  constructor(message, code = 1) {
    super(message);
    this.code = code;
  }
}

const warn = (message) => console.error(`[env-backup] ${message}`);

// A subprocess, argv array only. Returns { status, stdout, stderr, error }; callers check error, then status.
function run(cmd, args, { cwd, input } = {}) {
  const r = spawnSync(cmd, args, { cwd, input, encoding: "utf8", maxBuffer: 64 << 20 });
  return { status: r.status, stdout: r.stdout ?? "", stderr: r.stderr ?? "", error: r.error };
}

// git at the repo top, inheriting the hook's environment (GIT_INDEX_FILE reaches `git add`).
function git(top, args, { input, soft = false } = {}) {
  const r = run("git", args, { cwd: top, input });
  if (r.error) throw new Stop(`git: ${r.error.message}`);
  if (!soft && r.status !== 0) throw new Stop(`git ${args[0]} failed (exit ${r.status})`);
  return soft ? r : r.stdout;
}

// ── Arguments ─────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const [verb, ...flags] = argv;
  const verbs = { encrypt: ["--dry-run"], restore: [], rekey: [], restage: [] };
  const allowed = Object.hasOwn(verbs, verb) ? verbs[verb] : undefined;
  if (verb === undefined || verb === "help" || verb === "--help" || verb === "-h")
    return { verb: "help" };
  if (allowed === undefined) throw new Stop(`unknown verb "${verb}"\n${USAGE}`, 2);
  for (const f of flags)
    if (!allowed.includes(f)) throw new Stop(`unknown option "${f}" for ${verb}\n${USAGE}`, 2);
  return { verb, dryRun: flags.includes("--dry-run") };
}

// ── Repo, config, tools ──────────────────────────────────────────────────────

function repoTop() {
  const r = run("git", ["rev-parse", "--show-toplevel"]);
  if (r.error) throw new Stop(`git: ${r.error.message}`);
  if (r.status !== 0) throw new Stop("not inside a git repository");
  return r.stdout.trim();
}

function isLinkedWorktree(top) {
  const resolve = (arg) => fs.realpathSync(path.resolve(top, git(top, ["rev-parse", arg]).trim()));
  return resolve("--git-dir") !== resolve("--git-common-dir");
}

async function loadConfig() {
  const dir = path.dirname(fileURLToPath(import.meta.url));
  const file = path.join(dir, "bkit-env-backup.config.mjs");
  const cfg = (await import(pathToFileURL(file).href)).default;
  for (const k of Object.keys(cfg))
    if (!CONFIG_KEYS.has(k)) throw new Stop(`bkit-env-backup.config.mjs: unknown key "${k}"`);
  const skip = cfg.skip ?? [];
  if (!Array.isArray(skip) || !skip.every((s) => typeof s === "string"))
    throw new Stop('bkit-env-backup.config.mjs: "skip" must be an array of strings');
  return { skip };
}

function checkSopsYaml(top) {
  const file = path.join(top, ".sops.yaml");
  if (!fs.existsSync(file))
    throw new Stop(
      "no .sops.yaml at the repo root — copy .bkit/templates/.sops.yaml there and put your age public key in it",
    );
  if (fs.readFileSync(file, "utf8").includes(PLACEHOLDER))
    throw new Stop(
      `.sops.yaml still holds ${PLACEHOLDER} — replace it with your age public key (age1…)`,
    );
}

// `sops --version` without the network check: usable when it is present and at least MIN_SOPS.
function sopsUsable() {
  const r = run("sops", ["--version", "--disable-version-check"]);
  const m = !r.error && r.status === 0 ? /(\d+)\.(\d+)\.(\d+)/.exec(r.stdout) : null;
  if (!m) return false;
  const have = [Number(m[1]), Number(m[2]), Number(m[3])];
  for (let i = 0; i < 3; i++) if (have[i] !== MIN_SOPS[i]) return have[i] > MIN_SOPS[i];
  return true;
}

// The default age key file SOPS reads: $XDG_CONFIG_HOME, else the OS config folder.
function defaultKeyFile() {
  const rel = path.join("sops", "age", "keys.txt");
  const xdg = process.env.XDG_CONFIG_HOME;
  if (xdg) return path.join(xdg, rel);
  if (process.platform === "darwin")
    return path.join(os.homedir(), "Library", "Application Support", rel);
  if (process.platform === "win32") return path.join(process.env.APPDATA ?? "", rel);
  return path.join(os.homedir(), ".config", rel);
}

// Errors that mean "no usable key file here": missing, not a folder, no permission, symlink loop.
const NO_FILE_CODES = new Set(["ENOENT", "ENOTDIR", "EACCES", "EPERM", "ELOOP", "ENAMETOOLONG"]);

// A readable regular file; any other error is rethrown.
function readableFile(file) {
  try {
    fs.accessSync(file, fs.constants.R_OK);
    return fs.statSync(file).isFile();
  } catch (e) {
    if (NO_FILE_CODES.has(e.code)) return false;
    throw e;
  }
}

// An age key source on this machine, found without running sops.
function ageKeySourcePresent() {
  if (process.env.SOPS_AGE_KEY || process.env.SOPS_AGE_KEY_CMD) return true;
  return [process.env.SOPS_AGE_KEY_FILE, defaultKeyFile()].filter(Boolean).some(readableFile);
}

const SOPS_TOO_OLD = `sops is missing or older than ${MIN_SOPS.join(".")}`;

// ── Discovery ────────────────────────────────────────────────────────────────

// `*` and `?` stay in one folder, `**` crosses folders; no leading `/` matches at any depth.
function globToRegExp(glob) {
  const anchored = glob.startsWith("/");
  const body = anchored ? glob.slice(1) : glob;
  let re = "";
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (c === "*" && body[i + 1] === "*") {
      const slash = body[i + 2] === "/";
      re += slash ? "(?:.*/)?" : ".*";
      i += slash ? 2 : 1;
    } else if (c === "*") re += "[^/]*";
    else if (c === "?") re += "[^/]";
    else re += c.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  }
  return new RegExp(`^${anchored ? "" : "(?:.*/)?"}${re}$`);
}

// Git pathspecs for env file names at any depth under `base` ("" = the repo top, else "dir/"),
// glob characters in `base` escaped.
const envPathspecs = (base) => {
  const prefix = base.replace(/[\\*?[]/g, "\\$&");
  return [`:(glob)${prefix}**/.env`, `:(glob)${prefix}**/.env.*`];
};

// Gitignored env files git lists, with folders git collapsed (`dir/`) that are not themselves
// ignored listed again, env file names only. A folder git ignores whole is never entered.
function listIgnoredFiles(top) {
  const listing = (extra, paths) =>
    git(top, [
      "ls-files",
      "-z",
      "--others",
      "--ignored",
      "--exclude-standard",
      ...extra,
      "--",
      ...paths,
    ])
      .split("\0")
      .filter(Boolean);
  const entries = listing(["--directory"], envPathspecs(""));
  const files = new Set(entries.filter((e) => !e.endsWith("/")));
  const dirs = entries.filter((e) => e.endsWith("/"));
  if (dirs.length > 0) {
    const ignored = new Set(
      git(top, ["check-ignore", "-z", "--stdin"], { input: `${dirs.join("\0")}\0`, soft: true })
        .stdout.split("\0")
        .filter(Boolean),
    );
    const open = dirs.filter((d) => !ignored.has(d));
    if (open.length > 0)
      for (const f of listing([], open.flatMap(envPathspecs))) if (!f.endsWith("/")) files.add(f);
  }
  return [...files];
}

// True when a folder between the repo top and the file holds its own .git (nested repo, submodule).
function insideOtherRepo(top, rel) {
  const parts = rel.split("/").slice(0, -1);
  for (let i = 1; i <= parts.length; i++)
    if (fs.existsSync(path.join(top, ...parts.slice(0, i), ".git"))) return true;
  return false;
}

function discover(top, skip) {
  const skips = skip.map(globToRegExp);
  return listIgnoredFiles(top)
    .filter((rel) => {
      const base = path.posix.basename(rel);
      return ENV_NAME.test(base) && !base.endsWith(".enc") && base !== ".env.example";
    })
    .filter((rel) => !skips.some((re) => re.test(rel)))
    .filter((rel) => fs.lstatSync(path.join(top, rel), { throwIfNoEntry: false })?.isFile())
    .filter((rel) => !insideOtherRepo(top, rel))
    .sort();
}

function trackedEnc(top) {
  const files = git(top, ["ls-files", "-z"])
    .split("\0")
    .filter((f) => ENC_NAME.test(path.posix.basename(f)));
  return [...new Set(files)];
}

// Tracked .enc copies that exist in the worktree.
function presentEnc(top) {
  return trackedEnc(top).filter((f) => fs.existsSync(path.join(top, f)));
}

// Tracked .enc copies git left unmerged or holding conflict markers.
function conflictedEnc(top) {
  const unmerged = git(top, ["ls-files", "-u", "-z"])
    .split("\0")
    .filter(Boolean)
    .map((entry) => entry.slice(entry.indexOf("\t") + 1));
  const marked = presentEnc(top).filter((f) =>
    /^<{7}( |$)/m.test(fs.readFileSync(path.join(top, f), "utf8")),
  );
  return new Set([...unmerged, ...marked]);
}

const conflictFix = (file) =>
  `resolve ${file}: take one side whole (git checkout --ours|--theirs -- ${file}), then rerun encrypt`;

// The commit's own content: every staged .enc must be SOPS output, so a plain env file copied to an
// .enc name never gets committed. Needs no key.
function checkStagedEnc(top, conflicted) {
  const staged = git(top, ["diff", "--cached", "--name-only", "-z", "--diff-filter=ACM"])
    .split("\0")
    .filter((f) => ENC_NAME.test(path.posix.basename(f)) && !conflicted.has(f));
  for (const f of staged) requireSopsOutput(f, git(top, ["show", `:${f}`]));
}

// ── Env text ─────────────────────────────────────────────────────────────────

// Splits on "\n" only, so a trailing "\r" stays in the value. Returns the key -> raw value map and
// the invalid lines; a comment starts with "#", a blank line holds only whitespace. A line is invalid
// unless it is NAME=value with NAME matching ENV_KEY and a value that is not only "=" signs (the
// tail of a bare padded base64 token). SOPS keeps variable names in the clear, so an invalid line
// reports its number only, never its text; a repeated key reports the key.
function parseEnv(text) {
  const map = new Map();
  const problems = [];
  text.split("\n").forEach((line, i) => {
    if (/^\s*$/.test(line) || line.startsWith("#")) return;
    const eq = line.indexOf("=");
    const key = line.slice(0, eq);
    const value = line.slice(eq + 1);
    if (eq <= 0 || !ENV_KEY.test(key) || /^=+\r?$/.test(value)) problems.push({ line: i + 1 });
    else if (map.has(key)) problems.push({ line: i + 1, key });
    else map.set(key, value);
  });
  return { map, problems };
}

function sameMap(a, b) {
  if (a.size !== b.size) return false;
  for (const [key, value] of a) if (b.get(key) !== value) return false;
  return true;
}

// ── Key probe and .gitignore gate ────────────────────────────────────────────

function sopsFailure(r, file) {
  if (/no matching creation rules/.test(r.stderr))
    return `.sops.yaml has no creation rule matching ${file}`;
  if (/MAC mismatch/.test(r.stderr))
    return `${file} fails its integrity check — ${conflictFix(file)}`;
  return `sops failed (exit ${r.status}) on ${file}`;
}

// SOPS dotenv output: the sops_mac and sops_version lines are present and every other line is a
// sops_ metadata line, an encrypted value or comment, or an empty value (SOPS leaves those clear).
function isSopsOutput(text) {
  let mac = false;
  let version = false;
  for (const line of text.split("\n")) {
    if (line === "") continue;
    if (line.startsWith("sops_")) {
      mac ||= line.startsWith("sops_mac=ENC[");
      version ||= line.startsWith("sops_version=");
      continue;
    }
    const value = line.startsWith("#") ? line.slice(1) : line.slice(line.indexOf("=") + 1);
    if (value !== "" && !SOPS_VALUE.test(value)) return false;
  }
  return mac && version;
}

// Stops, naming the file only, unless `text` is SOPS output. A file holding merge conflict markers
// gets the conflict fix.
function requireSopsOutput(label, text) {
  if (isSopsOutput(text)) return;
  if (/^<{7}( |$)/m.test(text)) throw new Stop(conflictFix(label));
  throw new Stop(`${label} is not a SOPS-encrypted file — rename or remove it`);
}

// Decrypts one .enc into memory. { text } on success, { noKey: true } when no age key opens it.
// `label` names the file in messages when `file` is a temp path.
function decryptEnc(top, file, label = file) {
  requireSopsOutput(label, fs.readFileSync(path.resolve(top, file), "utf8"));
  const r = run("sops", ["decrypt", ...DOTENV, file], { cwd: top });
  if (r.error) throw new Stop(`sops: ${r.error.message}`);
  if (r.status === 0) return { text: r.stdout };
  if (r.status === 128) return { noKey: true };
  throw new Stop(sopsFailure(r, label));
}

// A fixed non-secret line encrypted under .sops.yaml and decrypted again, from a folder outside the repo.
function probeFixedLine(top) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-env-backup-probe-"));
  try {
    fs.writeFileSync(path.join(dir, ".env"), PROBE_LINE);
    const enc = run(
      "sops",
      [
        "--config",
        path.join(top, ".sops.yaml"),
        "encrypt",
        ...DOTENV,
        "--output",
        path.join(dir, ".env.enc"),
        path.join(dir, ".env"),
      ],
      { cwd: top },
    );
    if (enc.error) throw new Stop(`sops: ${enc.error.message}`);
    if (enc.status !== 0) throw new Stop(sopsFailure(enc, ".env"));
    const dec = decryptEnc(top, path.join(dir, ".env.enc"));
    if (dec.noKey) return { noKey: true };
    if (dec.text !== PROBE_LINE) throw new Stop("key probe: the round trip changed the probe line");
    return {};
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

// Does this key open the file? Any sops failure counts as "no": the probe never stops the run.
function opens(top, file) {
  const r = run("sops", ["decrypt", ...DOTENV, file], { cwd: top });
  if (r.error) throw new Stop(`sops: ${r.error.message}`);
  return r.status === 0;
}

// Does this machine hold the key? Yes when any tracked .enc git did not leave conflicted opens
// (those beside a candidate first), else when a fixed line round-trips under .sops.yaml.
function probeKey(top, conflicted, candidates) {
  const wanted = new Set(candidates.map((c) => `${c}.enc`));
  const encs = presentEnc(top)
    .filter((f) => !conflicted.has(f))
    .sort((a, b) => Number(wanted.has(b)) - Number(wanted.has(a)));
  return encs.some((f) => opens(top, f)) ? {} : probeFixedLine(top);
}

// Every candidate's .enc must be trackable: stop with the ignoring line and the exception to add.
function gitignoreGate(top, candidates) {
  const encs = candidates.map((c) => `${c}.enc`);
  const out = git(top, ["check-ignore", "--no-index", "-v", "-z", "--stdin"], {
    input: `${encs.join("\0")}\0`,
    soft: true,
  }).stdout.split("\0");
  const ignored = [];
  for (let i = 0; i + 3 < out.length; i += 4) {
    const [source, line, pattern, file] = out.slice(i, i + 4);
    if (!pattern.startsWith("!")) ignored.push({ file, rule: `${source}:${line}:${pattern}` });
  }
  if (ignored.length === 0) return;
  const lines = new Set(
    ignored.map(({ file }) =>
      path.posix.basename(file) === ".env.enc" ? "!.env.enc" : "!.env.*.enc",
    ),
  );
  throw new Stop(
    [
      `git would ignore ${ignored.length} .enc ${ignored.length === 1 ? "copy" : "copies"}:`,
      ...ignored.map(({ file, rule }) => `  ${file}  (${rule})`),
      "add after the ignoring line in .gitignore:",
      ...[...lines].map((l) => `  ${l}`),
    ].join("\n"),
  );
}

// ── Encrypt: plan, write, stage ──────────────────────────────────────────────

// Short hash of the last commit that changed `enc`, when it is newer than the env file was last
// edited: another key holder's change the local file does not hold yet.
function incomingCommit(top, rel, enc) {
  const r = git(top, ["log", "-1", "--format=%at %h", "--", enc], { soft: true });
  const [at, sha] = r.stdout.trim().split(" ");
  if (r.status !== 0 || sha === undefined) return null;
  return Number(at) > fs.statSync(path.join(top, rel)).mtimeMs / 1000 ? sha : null;
}

// What `encrypt` does for each candidate: { rel, enc, kind: "create" | "update" | "same", map, old }.
// Reads and decrypts only. A file that is not UTF-8, has an invalid line, an unreadable .enc or an
// incoming change is warned about and left out; an unresolved merge conflict stops the run.
function planEncrypt(top, candidates, conflicted) {
  const jobs = [];
  for (const rel of candidates) {
    const enc = `${rel}.enc`;
    const raw = fs.readFileSync(path.join(top, rel));
    const text = raw.toString("utf8");
    if (!Buffer.from(text, "utf8").equals(raw)) {
      warn(`${rel}: not UTF-8 — ${enc} left as it is`);
      continue;
    }
    const { map, problems } = parseEnv(text);
    for (const p of problems)
      warn(
        p.key
          ? `${rel}:${p.line}: duplicate key ${p.key} — ${enc} left as it is`
          : `${rel}:${p.line}: not a KEY=value line — ${enc} left as it is`,
      );
    if (problems.length > 0) continue;
    if (conflicted.has(enc)) throw new Stop(conflictFix(enc));
    if (!fs.existsSync(path.join(top, enc))) {
      jobs.push({ rel, enc, kind: "create", map });
      continue;
    }
    const dec = decryptEnc(top, enc);
    if (dec.noKey) {
      warn(`${enc}: this machine's key does not open it — left as it is`);
      continue;
    }
    const old = parseEnv(dec.text).map;
    const sha = sameMap(old, map) ? null : incomingCommit(top, rel, enc);
    if (sha !== null)
      warn(
        `${enc} changed in ${sha} after ${rel} was last edited — keep theirs: delete ${rel}, run restore · keep yours: touch ${rel}, commit again`,
      );
    else jobs.push({ rel, enc, kind: sameMap(old, map) ? "same" : "update", map, old });
  }
  return jobs;
}

// Decrypts `file` and requires exactly the variables of `expected`.
function verifyEnc(top, file, label, expected) {
  const dec = decryptEnc(top, file, label);
  if (dec.noKey || !sameMap(parseEnv(dec.text).map, expected))
    throw new Stop(`${label} does not decrypt to ${label.replace(/\.enc$/, "")} — nothing kept`);
}

// Runs sops at the repo top; any failure stops with a message naming `label`, never sops' output.
function sopsRun(top, args, label, input) {
  const r = run("sops", args, { cwd: top, input });
  if (r.error) throw new Stop(`sops: ${r.error.message}`);
  if (r.status !== 0) throw new Stop(sopsFailure(r, label));
}

// Runs `change` on an .enc; any error puts the file's original bytes back and carries on up.
function restoringOnError(file, change) {
  const original = fs.readFileSync(file);
  try {
    change();
  } catch (e) {
    fs.writeFileSync(file, original);
    throw e;
  }
}

// One variable at a time: removed keys `unset`, changed and added keys `set` (value on stdin).
// Any failure puts the original bytes back.
function updateEnc(top, { enc, map, old }) {
  const key = (k) => JSON.stringify([k]);
  const ops = [
    ...[...old.keys()]
      .filter((k) => !map.has(k))
      .map((k) => ({ args: ["unset", ...DOTENV, enc, key(k)] })),
    ...[...map]
      .filter(([k, v]) => old.get(k) !== v)
      .map(([k, v]) => ({
        args: ["set", ...DOTENV, "--value-stdin", enc, key(k)],
        input: JSON.stringify(v),
      })),
  ];
  restoringOnError(path.join(top, enc), () => {
    for (const { args, input } of ops) sopsRun(top, args, enc, input);
    verifyEnc(top, enc, enc, map);
  });
}

// First encrypt: the parsed variables, one `KEY=value` line each, go to sops on stdin (the env file
// itself never does) into a temp file beside the target; verified, then renamed into place.
function createEnc(top, { rel, enc, map }) {
  const tmp = path.join(path.dirname(path.join(top, rel)), `.env-backup-tmp-${process.pid}`);
  const text = [...map].map(([k, v]) => `${k}=${v}\n`).join("");
  try {
    sopsRun(
      top,
      [
        "--config",
        path.join(top, ".sops.yaml"),
        "encrypt",
        ...DOTENV,
        "--filename-override",
        rel,
        "--output",
        tmp,
      ],
      enc,
      text,
    );
    verifyEnc(top, tmp, enc, map);
    fs.renameSync(tmp, path.join(top, enc));
  } finally {
    fs.rmSync(tmp, { force: true });
  }
}

// Every job's .enc that is not in the index yet, or whose worktree copy differs from it, goes into
// the commit.
function stageEnc(top, jobs) {
  const untracked = (enc) =>
    git(top, ["ls-files", "--error-unmatch", "--", enc], { soft: true }).status !== 0;
  const changed = jobs.filter(
    (j) =>
      j.kind !== "same" ||
      untracked(j.enc) ||
      git(top, ["diff", "--quiet", "--", j.enc], { soft: true }).status === 1,
  );
  if (changed.length > 0) git(top, ["add", "--", ...changed.map((j) => j.enc)]);
}

// ── Verbs ────────────────────────────────────────────────────────────────────

async function encrypt({ dryRun }) {
  const top = repoTop();
  const conflicted = conflictedEnc(top);
  checkStagedEnc(top, conflicted);
  if (isLinkedWorktree(top)) {
    warn("linked worktree — the main checkout keeps the .enc copies");
    return;
  }
  const { skip } = await loadConfig();
  checkSopsYaml(top);
  if (!sopsUsable()) {
    if (ageKeySourcePresent())
      throw new Stop(
        `age key found but ${SOPS_TOO_OLD} — install or upgrade sops (brew install sops)`,
      );
    warn(`${SOPS_TOO_OLD} and no age key was found — .enc copies not updated`);
    return;
  }
  const candidates = discover(top, skip);
  if (candidates.length === 0) return;
  if (probeKey(top, conflicted, candidates).noKey) {
    warn("no age key on this machine — .enc copies not updated");
    return;
  }
  gitignoreGate(top, candidates);
  const jobs = planEncrypt(top, candidates, conflicted);
  for (const job of jobs) {
    if (job.kind === "same") continue;
    if (dryRun) console.log(`would ${job.kind} ${job.enc}`);
    else {
      if (job.kind === "create") createEnc(top, job);
      else updateEnc(top, job);
      console.log(`${job.kind === "create" ? "created" : "updated"} ${job.enc}`);
    }
  }
  if (!dryRun) stageEnc(top, jobs);
}

// Writes each tracked .enc back as the env file beside it. A present env file is kept, a target git
// would not ignore is refused, and the file is created 0600 (never overwritten).
async function restore() {
  const top = repoTop();
  if (!sopsUsable())
    throw new Stop(`${SOPS_TOO_OLD} — install or upgrade sops (brew install sops)`);
  const refused = [];
  const unopened = [];
  let restored = 0;
  for (const enc of presentEnc(top)) {
    const rel = enc.slice(0, -".enc".length);
    const target = path.join(top, rel);
    if (fs.lstatSync(target, { throwIfNoEntry: false }) !== undefined) {
      console.log(`kept ${rel}`);
    } else if (git(top, ["check-ignore", "-q", "--", rel], { soft: true }).status !== 0) {
      refused.push(rel);
    } else {
      const dec = decryptEnc(top, enc);
      if (dec.noKey) {
        unopened.push(enc);
        continue;
      }
      fs.writeFileSync(target, dec.text, { flag: "wx", mode: 0o600 });
      console.log(`restored ${rel}`);
      restored++;
    }
  }
  if (unopened.length > 0 && restored === 0 && refused.length === 0)
    throw new Stop("no age key on this machine — nothing restored");
  const problems = [
    ...(unopened.length > 0
      ? [
          "this machine's key does not open these copies, so they were not restored:",
          ...unopened.map((f) => `  ${f}`),
        ]
      : []),
    ...(refused.length > 0
      ? [
          "git would not ignore these restore targets, so they were not written:",
          ...refused.map((f) => `  ${f}`),
          "add them to .gitignore (the env file lines), then rerun restore",
        ]
      : []),
  ];
  if (problems.length > 0) throw new Stop(problems.join("\n"));
}

// Moves every tracked .enc to the key now in .sops.yaml: a new data key (`rotate`), then the new
// recipients (`updatekeys`). Both private keys must be available while it runs.
async function rekey() {
  const top = repoTop();
  if (!sopsUsable())
    throw new Stop(`${SOPS_TOO_OLD} — install or upgrade sops (brew install sops)`);
  checkSopsYaml(top);
  const conflicted = conflictedEnc(top);
  const encs = presentEnc(top);
  for (const enc of encs) if (conflicted.has(enc)) throw new Stop(conflictFix(enc));
  const opened = encs.map((enc) => ({ enc, before: decryptEnc(top, enc) }));
  const unopened = opened.filter(({ before }) => before.noKey).map(({ enc }) => enc);
  if (unopened.length === encs.length && encs.length > 0)
    throw new Stop("no age key on this machine — nothing rekeyed");
  if (unopened.length > 0)
    throw new Stop(
      [
        "this machine's key does not open these copies — nothing rekeyed:",
        ...unopened.map((f) => `  ${f}`),
      ].join("\n"),
    );
  const done = [];
  for (const { enc, before } of opened) {
    restoringOnError(path.join(top, enc), () => {
      sopsRun(top, ["rotate", "--in-place", ...DOTENV, enc], enc);
      sopsRun(
        top,
        [
          "--config",
          path.join(top, ".sops.yaml"),
          "updatekeys",
          "--yes",
          "--input-type",
          "dotenv",
          enc,
        ],
        enc,
      );
      verifyEnc(top, enc, enc, parseEnv(before.text).map);
    });
    done.push(enc);
    console.log(`rekeyed ${enc}`);
  }
  if (done.length > 0) git(top, ["add", "--", ...done]);
}

// Post-commit. A path-limited commit (`git commit -- file`) takes its files from a temporary index,
// so the .enc the pre-commit hook updated lands in HEAD while the real index keeps the old copy.
// Stages again each .enc whose worktree copy is HEAD's and whose index entry is not. Never needs sops.
async function restage() {
  const top = repoTop();
  if (isLinkedWorktree(top)) {
    warn("linked worktree — the main checkout keeps the .enc copies");
    return;
  }
  const entries = (args) => git(top, args, { soft: true }).stdout.split("\0").filter(Boolean);
  const blobs = (args, shaAt) =>
    new Map(
      entries(args).map((entry) => {
        const [meta, file] = entry.split("\t");
        return [file, meta.split(" ")[shaAt]];
      }),
    );
  const head = blobs(["ls-tree", "-r", "-z", "HEAD"], 2);
  const index = blobs(["ls-files", "-s", "-z"], 1);
  for (const [enc, headSha] of head) {
    if (!ENC_NAME.test(path.posix.basename(enc)) || !fs.existsSync(path.join(top, enc))) continue;
    const work = git(top, ["hash-object", "--", enc]).trim();
    if (work !== headSha || index.get(enc) === headSha) continue;
    const r = git(top, ["add", "--", enc], { soft: true });
    if (r.status !== 0) warn(`${enc}: git add failed (exit ${r.status}) — run: git add ${enc}`);
  }
}

async function dispatch(argv) {
  const args = parseArgs(argv);
  switch (args.verb) {
    case "help":
      console.log(USAGE);
      return;
    case "encrypt":
      await encrypt(args);
      return;
    case "restore":
      await restore();
      return;
    case "rekey":
      await rekey();
      return;
    case "restage":
      await restage();
      return;
    default:
      return;
  }
}

try {
  await dispatch(process.argv.slice(2));
} catch (e) {
  warn(e.message);
  process.exitCode = e instanceof Stop ? e.code : 1;
}
