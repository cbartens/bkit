// install/modules/core.ts — the core module: the core payload blocks, the canonical
// `.bkit/*.md` docs, package.json gate scripts and `.bkit/version` (written last, in
// postDispatch). Also the file helpers every host renderer shares.

import * as fs from "node:fs";
import * as path from "node:path";
import { writeTier1, writeTier2, ensurePackageJsonScripts, type WriteSet } from "../write.js";
import {
  readBkitVersion,
  writeBkitVersion,
  hashFile,
  mergeCanonicalHashes,
} from "../version-file.js";
import type { TokenMap } from "../placeholders.js";
import { listFilesRecursive, syncTemplateCopies } from "../template-copies.js";
import type { PreflightFinding } from "../../checks/before/index.js";
import {
  getPkgRoot,
  getCoreRoot,
  getSharedRoot,
  getBkitDocsRoot,
  TEMPLATE_COPIES_DIR,
} from "../../shared/package-roots.js";
import { getInstallManifest, BKIT_GATE_SCRIPTS, BKIT_OPTIONAL_GATES } from "../manifest.js";
import type { ModuleContext } from "./index.js";

export function listMdFiles(dir: string, prefix?: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .filter((f) => (prefix ? f.startsWith(prefix) : true));
}

export function installFile(
  srcPath: string,
  destPath: string,
  transform: ((content: string) => string) | null,
  dryRun: boolean,
): boolean {
  if (!transform) {
    if (fs.existsSync(destPath)) {
      const src = fs.readFileSync(srcPath);
      const dest = fs.readFileSync(destPath);
      if (src.equals(dest)) return false;
    }
    if (!dryRun) fs.copyFileSync(srcPath, destPath);
    return true;
  }

  const src = fs.readFileSync(srcPath, "utf-8");
  const transformed = transform(src);
  if (fs.existsSync(destPath)) {
    const existing = fs.readFileSync(destPath, "utf-8");
    if (existing === transformed) return false;
  }
  if (!dryRun) fs.writeFileSync(destPath, transformed, "utf-8");
  return true;
}

// Hard allowlist: orphan pruning may ONLY remove files from these generated IDE
// mirror dirs. Mirror SOURCES live package-side under `.bkit/{workflows,prompts}`.
const ORPHAN_PRUNE_DIRS = [
  ".claude/agents",
  ".claude/commands",
  ".cursor/agents",
  ".cursor/commands",
] as const;

export function removeOrphans(
  destDir: string,
  sourceFiles: Set<string>,
  dryRun: boolean,
  prefix?: string,
): string[] {
  const resolved = path.resolve(destDir);
  if (!ORPHAN_PRUNE_DIRS.some((d) => path.resolve(d) === resolved)) {
    throw new Error(`removeOrphans: refusing orphan removal outside allowlist: ${destDir}`);
  }
  if (!fs.existsSync(destDir)) return [];
  const removed: string[] = [];
  for (const f of fs.readdirSync(destDir)) {
    if (!f.endsWith(".md")) continue;
    if (prefix && !f.startsWith(prefix)) continue;
    if (!sourceFiles.has(f)) {
      if (!dryRun) fs.rmSync(path.join(destDir, f));
      removed.push(f);
    }
  }
  return removed;
}

// ---------------------------------------------------------------------------
// Core payload — the files install writes from `core/`, at their
// folder-relative dest paths. The package-only subtrees (engine/, workflows/,
// prompts/, .bkit/, hooks/), the root LICENSE.md and the shared/ and
// templates/ payloads are NOT part of this walk: the host modules write their
// own hook files (sourced from `core/`), and `runBkitDocs` mirrors the
// reference docs.
// ---------------------------------------------------------------------------

/** A core-owned payload file and how install writes it. */
interface CoreTemplateFile {
  /** Absolute source path. */
  src: string;
  /** Consumer-relative destination. */
  dst: string;
  /** `block`: writeTier2 refreshes the managed block. `whole`: writeTier1. */
  scope: "block" | "whole";
  /** Block-scope marker style. */
  marker: "html-comment" | "slash-comment";
}

/** The markered-text `.agents/*.md` blocks core owns. */
const CORE_AGENT_FILES = ["context.md", "docs.md", "rules.md", "skills.md"] as const;

// The two shared-root files core writes: stored in `shared/`, owned by the core
// manifest, written as html-comment managed blocks.
const CORE_SHARED_FILES: ReadonlyArray<readonly [rel: string, dst: string]> = [
  ["gitignore", ".gitignore"],
  [".gitattributes", ".gitattributes"],
];

// ---------------------------------------------------------------------------
// guardCoreRoot — fail-loud guard for the resolved core payload root.
// Exported so tests can inject an arbitrary (non-existent) path and assert
// the guard fires for ANY missing root — not just the literal ".bkit/core"
// string. This keeps the assertion valid across any future path changes.
//
// Called by runCoreTemplates (below) before any FS access.
// ---------------------------------------------------------------------------

export function guardCoreRoot(root: string, logPrefix = "[bkit-modules]"): void {
  if (!fs.existsSync(root)) {
    console.error(`${logPrefix} Core root not found at ${root} — package corrupt?`);
    process.exit(1);
  }
}

/**
 * The core-owned payload files, sourced from `root` (defaults to the resolved
 * core root). Every file under `core/docs/templates/` is included; `AGENTS.md`
 * and the `.agents/*.md` doctrine files are the block-merged rest.
 */
export function listCoreTemplateFiles(root: string = getCoreRoot()): CoreTemplateFile[] {
  const out: CoreTemplateFile[] = [];
  const agentsDir = path.join(root, ".agents");
  for (const name of CORE_AGENT_FILES) {
    const src = path.join(agentsDir, name);
    if (fs.existsSync(src)) {
      out.push({ src, dst: path.join(".agents", name), scope: "block", marker: "html-comment" });
    }
  }
  const agentsMd = path.join(root, "AGENTS.md");
  if (fs.existsSync(agentsMd)) {
    out.push({ src: agentsMd, dst: "AGENTS.md", scope: "block", marker: "html-comment" });
  }
  for (const abs of listFilesRecursive(path.join(root, "docs", "templates"))) {
    out.push({
      src: abs,
      dst: path.relative(root, abs),
      scope: "block",
      marker: "html-comment",
    });
  }
  return out;
}

/**
 * The shared payload files core writes, sourced from `root` (defaults to the
 * resolved shared root): the `docs/*.md` managed blocks and the two shared-root
 * files the core manifest owns.
 */
export function listSharedTemplateFiles(root: string = getSharedRoot()): CoreTemplateFile[] {
  const out: CoreTemplateFile[] = [];
  for (const [rel, dst] of CORE_SHARED_FILES) {
    const src = path.join(root, rel);
    if (fs.existsSync(src)) out.push({ src, dst, scope: "block", marker: "html-comment" });
  }
  for (const name of listMdFiles(path.join(root, "docs"))) {
    out.push({
      src: path.join(root, "docs", name),
      dst: path.join("docs", name),
      scope: "block",
      marker: "html-comment",
    });
  }
  return out;
}

function runCoreTemplates(
  dryRun: boolean,
  tokens: TokenMap,
  ws: WriteSet,
  logPrefix: string,
): void {
  const root = getCoreRoot();
  guardCoreRoot(root, logPrefix);
  const tag = dryRun ? "[dry-run] " : "";
  const files = [...listCoreTemplateFiles(root), ...listSharedTemplateFiles()];
  for (const { src, dst, scope, marker } of files) {
    const prevLen = ws.writes.length;
    if (scope === "whole") writeTier1(src, dst, tokens, dryRun, ws);
    else writeTier2(src, dst, tokens, marker, dryRun, ws);
    if (ws.writes.length > prevLen) {
      console.log(`${logPrefix} ${tag}core: ${dst}`);
    }
  }
}

// ---------------------------------------------------------------------------
// runCoreModule — core templates + .bkit/version (LAST)
// ---------------------------------------------------------------------------

// Canonical bkit-authored reference docs that live package-side under
// `.bkit/core/.bkit/`. They are read from there at runtime (getBkitDocsRoot) AND
// mirrored into the consumer's `.bkit/` on every install so a consumer can read them
// in-repo without spelunking node_modules. Force-overwritten (Tier 1) — bkit owns
// them, so a consumer edit is replaced. Source of truth is the package's own
// `.bkit/core/.bkit/<name>`. (`advisories.md` is a regenerated runtime artifact,
// `wording.md` is repo-only tooling and `friction.md` is a consumer-owned seed —
// none belongs here. `LICENSE.md` is the PolyForm notice that travels with every
// file bkit writes: PolyForm's Notices section requires a passed-on copy to carry
// the terms or their URL and the Required Notice line.)
export const BKIT_CANONICAL_DOCS = [
  "cloud.md",
  "comparison.md",
  "install.md",
  "jsonl.md",
  "LICENSE.md",
  "providers.md",
  "prompts.md",
  "templates.md",
  "trackers.md",
  "workflows.md",
  "README.md",
] as const;

// Mirror the package's canonical `.bkit/*.md` docs into the consumer's `.bkit/`.
// Tier 1 (force-overwrite + ws-tracked for dry-run/install parity). Each source carries
// the `{{BKIT_MANAGED_MARKER}}` token. Skipped in dogfood: the consumer destination
// resolves to the repo's own installed copies, never the package source.
export function runBkitDocs(
  dryRun: boolean,
  tokens: TokenMap,
  ws: WriteSet,
  logPrefix: string,
): void {
  const tag = dryRun ? "[dry-run] " : "";
  const docsRoot = getBkitDocsRoot();
  // Per-doc write strategy from the manifest: markered-text docs (e.g. prompts.md,
  // which carries the consumer-owned `## Model Overrides` section below `bkit:end`)
  // are block-merged so consumer content survives; the rest are force-overwritten.
  const formatByPath = new Map(getInstallManifest().map((e) => [e.path, e.format]));
  for (const name of BKIT_CANONICAL_DOCS) {
    const srcPath = path.join(docsRoot, name);
    // A doc missing from a partial/corrupt package is skipped (writeTier1 throws on a
    // missing src).
    if (!fs.existsSync(srcPath)) continue;
    const dstPath = path.join(".bkit", name);
    const prevLen = ws.writes.length;
    if (formatByPath.get(path.join(".bkit", name)) === "markered-text") {
      writeTier2(srcPath, dstPath, tokens, "html-comment", dryRun, ws);
    } else {
      writeTier1(srcPath, dstPath, tokens, dryRun, ws);
    }
    if (ws.writes.length > prevLen) {
      console.log(`${logPrefix} ${tag}core: ${dstPath}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Source-rendered host outputs — agents (.agents/prompts source) and commands
// (.bkit/workflows source). Extracted from the host module functions so BOTH
// `bkit install` (via the modules) AND `bkit upgrade` (via renderManagedOutputs)
// render them identically — a single source of truth that can never diverge.
//
// These are bkit-OWNED output files: force-overwritten (installFile), never
// drift-detected, never consumer config. They are NOT recorded in canonicalHashes
// (installFile does not touch ws), matching the install path exactly. Each returns
// the consumer-relative dest paths it wrote (for the upgrade summary).
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Managed-version stamping. The marker shape (stampManagedVersion + regexes) lives
// in install/version-file.ts, shared by the renderer and the `bkit check` detector. Here we
// only resolve WHICH version to stamp: ctx.version (set by install/upgrade) with a
// package-root fallback.
// ---------------------------------------------------------------------------

/**
 * Best-effort read of the installing bkit version from the package root's
 * package.json. Mirrors getInstallingVersion in commands/install/install.ts; duplicated here
 * (not imported) to avoid a modules → install dependency cycle. Returns "0.0.0"
 * when unreadable — the same non-fatal fallback the install side uses.
 */
export function readInstallingVersion(): string {
  try {
    const pkgPath = path.join(getPkgRoot(), "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8")) as { version?: string };
    return pkg.version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}

/** Record a host mirror would-write so `bkit check` exits 1 on content drift. */
export function trackMirrorWrite(ctx: ModuleContext, relPath: string, written: string[]): void {
  written.push(relPath);
  ctx.ws.writes.push({ path: relPath, action: "write" });
}

/**
 * The package.json scripts core keeps: the `bkit:gate:*` / `bkit:deps:*` names every
 * workflow, prompt and hook runs, seeded add-if-missing (a name already declared is
 * never touched, whatever its value). Install (runCoreModule) and upgrade
 * (renderManagedOutputs) both run it, so a
 * clean upgrade leaves `bkit check` nothing to write. A missing gate name is a write,
 * so `bkit check` reports it. A missing or malformed package.json is preflight's to
 * report. Returns the paths written.
 */
export function seedCorePackageJsonScripts(
  ctx: Pick<ModuleContext, "dryRun" | "ws" | "logPrefix">,
): string[] {
  const { dryRun, ws, logPrefix } = ctx;
  const tag = dryRun ? "[dry-run] " : "";
  const written: string[] = [];

  const gates = ensurePackageJsonScripts({ ...BKIT_GATE_SCRIPTS }, dryRun, ws);
  if (gates.added.length > 0) {
    written.push("package.json");
    console.log(`${logPrefix} ${tag}core: package.json scripts added [${gates.added.join(", ")}]`);
  }
  return written;
}

// Tokens that follow `pnpm` in a gate value but are not package.json scripts: the
// package manager's own subcommands (`install` in bkit:gate:install-static-unit-build,
// `audit` / `outdated` in the bkit:deps:* pair) and node_modules binaries pnpm resolves
// directly (`lint-staged` in bkit:gate:format). None can be "missing" as a script.
const PNPM_NOT_A_SCRIPT = new Set([
  "install",
  "run",
  "exec",
  "dlx",
  "audit",
  "outdated",
  "lint-staged",
]);

/**
 * Advisories for the `bkit:gate:*` scripts: the scripts a still-default gate
 * chains that package.json does not declare, and the deeper test tiers the repo has
 * but no gate runs. Read-only; an absent or unparseable package.json yields none.
 */
export function detectGateAdvisories(cwd: string): PreflightFinding[] {
  let declared: Record<string, string>;
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(cwd, "package.json"), "utf-8")) as {
      scripts?: Record<string, string>;
    };
    declared = pkg.scripts ?? {};
  } catch {
    // Absent or malformed package.json — preflight's no-package-json /
    // malformed-package-json blockers already report it.
    return [];
  }
  const findings: PreflightFinding[] = [];

  // Every script a seeded gate default chains MUST exist, or the gate dies on the first
  // missing one and the workflow reads that as a real failure. Checked only where the
  // value is still bkit's default — a consumer who rewrote the gate owns what it calls.
  const missing = new Set<string>();
  for (const [name, seeded] of Object.entries(BKIT_GATE_SCRIPTS)) {
    if (declared[name] !== seeded) continue;
    for (const [, called] of seeded.matchAll(/\bpnpm ([\w:-]+)/g)) {
      if (PNPM_NOT_A_SCRIPT.has(called)) continue;
      if (!(called in declared) && !(called in BKIT_GATE_SCRIPTS)) missing.add(called);
    }
  }
  if (missing.size > 0) {
    const names = [...missing].sort().map((n) => `\`${n}\``);
    findings.push({
      id: "gate-missing-called-scripts",
      severity: "advisory",
      detect: `The bkit:gate scripts call scripts package.json does not declare: ${names.join(", ")}.`,
      action: `Every bkit workflow runs a \`bkit:gate*\` script, so a missing link fails the whole gate. Add ${names.join(", ")} to package.json (\`.bkit/templates.md\` lists the tool scripts and the devDeps they need), or edit the \`bkit:gate*\` scripts to drop what this repo does not have.`,
    });
  }

  // A repo that HAS a deeper tier but declares no gate for it is gated at
  // bkit:gate:static-unit by both /bkit-build and /bkit-debug. bkit does not seed these
  // gates; it detects the mismatch and hands over the line to paste.
  const unwired: string[] = [];
  for (const { gate, parent, declaredBy } of BKIT_OPTIONAL_GATES) {
    const tierCall = declaredBy.find((s) => s in declared);
    if (tierCall === undefined || gate in declared) continue;
    unwired.push(`    "${gate}": "pnpm ${parent} && pnpm ${tierCall}"`);
  }
  if (unwired.length > 0) {
    findings.push({
      id: "gate-tier-not-wired",
      severity: "advisory",
      detect:
        "package.json declares deeper test tiers than any `bkit:gate*` script runs, so `/bkit-build` and `/bkit-debug` gate at `bkit:gate:static-unit` and never execute them.",
      action:
        "Each workflow runs the DEEPEST gate you declare; an undeclared one is skipped, never guessed. Add the gates you want the agent loop to run:\n\n" +
        unwired.join("\n") +
        "\n\nOrder matters — each chains the one above it. Omit a level deliberately to keep it CI-only (E2E in the build loop costs a production build on every remediation attempt). `.bkit/templates.md` lists the tool scripts the gates chain.",
    });
  }
  return findings;
}

/** One command that cannot fail: `true`, `:`, `exit 0`, or an `echo`. */
const NOOP_COMMAND = /^(?:true|:|exit 0|echo(?:\s.*)?)$/;

/** Whether a script value checks nothing: empty, or only no-op commands chained. */
export function isNoopScript(value: string): boolean {
  return value
    .split(/&&|\|\||;|\n/)
    .map((part) => part.trim())
    .every((part) => part === "" || NOOP_COMMAND.test(part));
}

/**
 * Advisory for every `bkit:gate:*` script that is empty or a no-op: it checks nothing,
 * so every agent run and push passes it. Warn-only, at install and `bkit check`, on
 * every branch. Read-only; an absent or unparseable package.json yields none.
 */
export function detectNoopGates(cwd: string): PreflightFinding[] {
  let declared: Record<string, unknown>;
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(cwd, "package.json"), "utf-8")) as {
      scripts?: Record<string, unknown>;
    };
    declared = pkg.scripts ?? {};
  } catch {
    // Absent or malformed package.json — preflight's blockers already report it.
    return [];
  }
  const noop = Object.entries(declared)
    .filter(([name, value]) => name.startsWith("bkit:gate:") && typeof value === "string")
    .filter(([, value]) => isNoopScript(value as string))
    .map(([name, value]) => `\`${name}\` (\`${String(value).trim() || "empty"}\`)`)
    .sort();
  if (noop.length === 0) return [];
  return [
    {
      id: "gate-noop",
      severity: "advisory",
      detect: `These bkit:gate scripts are empty or cannot fail, so they check nothing: ${noop.join(", ")}.`,
      action:
        'Every bkit workflow and the pre-push hook trust a green `bkit:gate*` script, so a no-op gate passes every agent run and push. Point each at the checks it should run (e.g. `"bkit:gate:static": "pnpm typecheck && pnpm lint"`), or delete it from package.json and run `bkit upgrade` to get bkit\'s default back.',
    },
  ];
}

export function runCoreModule(ctx: ModuleContext): void {
  const { dryRun, ws, advisories, logPrefix, postDispatch } = ctx;
  const tag = dryRun ? "[dry-run] " : "";
  const cwd = process.cwd();
  const PKG_ROOT = getPkgRoot();
  const PKG_PACKAGE_JSON = path.join(PKG_ROOT, "package.json");

  if (!fs.existsSync(PKG_PACKAGE_JSON)) {
    console.error(`${logPrefix} package.json not found at ${PKG_PACKAGE_JSON} — package corrupt?`);
    process.exit(1);
  }

  const pkgVersion = JSON.parse(fs.readFileSync(PKG_PACKAGE_JSON, "utf-8")).version as string;

  // Capture first-install signal NOW (before any writes) — used for the post-install banner.
  // The .bkit/version write happens in postDispatch, so a mid-install crash in a later
  // module leaves no .bkit/version on disk.
  const versionFile = path.join(cwd, ".bkit", "version");
  const isFirstInstall = !fs.existsSync(versionFile);

  // 2. Core payload pass (AGENTS.md, `.agents/*.md`, `docs/templates/**`, the two
  // shared-root files core owns). Each host module writes its own hook files.
  console.log(`${logPrefix} ${tag}Running core payload pass`);
  runCoreTemplates(dryRun, ctx.tokens, ws, logPrefix);

  // 3b. bkit canonical docs pass — mirror the package's reference docs
  // (cloud/IDEs/prompts/trackers/workflows/README/install/comparison) into the
  // consumer's `.bkit/` so they are readable in-repo. Force-overwrite (Tier 1).
  console.log(`${logPrefix} ${tag}Running bkit docs pass`);
  runBkitDocs(dryRun, ctx.tokens, ws, logPrefix);

  // 3b2. Template copies — the whole templates root into the consumer's
  // `.bkit/templates/` (never applied to the repo; no-op in dogfood).
  console.log(`${logPrefix} ${tag}Running template copies pass`);
  const templateChanges = syncTemplateCopies(cwd, { dryRun, ws });
  for (const [verb, paths] of Object.entries(templateChanges)) {
    for (const p of paths) {
      console.log(`${logPrefix} ${tag}template ${verb}: ${path.join(TEMPLATE_COPIES_DIR, p)}`);
    }
  }

  // 3c. The bkit:gate:* / bkit:deps:* package.json scripts (add-if-missing). The
  // advisories read the result.
  seedCorePackageJsonScripts(ctx);
  if (!dryRun) advisories.push(...detectGateAdvisories(cwd));
  advisories.push(...detectNoopGates(cwd));

  // 4. .bkit/version write — deferred to postDispatch so it only persists when ALL modules succeed.
  // This ensures a mid-install crash in a subsequent module does not suppress the first-install
  // banner on retry (MED-4).
  // C3 fix: write JSON format with canonicalHashes populated from ws.writes (fully populated
  // by the time postDispatch runs — all modules have completed). canonicalHashes records the
  // sha256 of each bkit-managed consumer file as written, enabling drift detection on upgrade.
  postDispatch.push(() => {
    // Read existing file to check whether an update is needed.
    const existingVersion = readBkitVersion(versionFile);
    const existingCanonical = existingVersion?.canonicalHashes ?? {};

    // Build new canonicalHashes entries from ws.writes (files written in this run).
    // ws.writes is fully populated by the time postDispatch runs.
    // Exclude .bkit/version itself and .agents/ internal files (not consumer-facing).
    const newCanonicalEntries: Record<string, string> = {};
    for (const entry of ws.writes) {
      const absPath = path.isAbsolute(entry.path) ? entry.path : path.resolve(cwd, entry.path);
      const relPath = path.relative(cwd, absPath);
      if (relPath === path.join(".bkit", "version")) continue;
      if (relPath.startsWith(".agents" + path.sep)) continue;
      // Template copies carry no hash.
      if (relPath.startsWith(TEMPLATE_COPIES_DIR + path.sep)) continue;
      if (!fs.existsSync(absPath)) continue;
      const hash = hashFile(absPath);
      if (hash) newCanonicalEntries[relPath] = hash;
    }

    // Merge: existing hashes preserved, new writes overwrite (hashes stay current),
    // and entries whose path is gone are pruned (mergeCanonicalHashes).
    const { canonicalHashes, pruned } = mergeCanonicalHashes(
      cwd,
      existingCanonical,
      newCanonicalEntries,
    );

    // Decide whether a write is needed: version mismatch, first install, new canonical
    // entries, a pruned stale entry, or a changed claudeAllowDerived record.
    const versionChanged = !existingVersion || existingVersion.pinnedVersion !== pkgVersion;
    const hasNewEntries = Object.keys(newCanonicalEntries).length > 0;
    const claudeAllowDerived = ctx.claudeAllowRecorded ?? existingVersion?.claudeAllowDerived ?? [];
    const derivedChanged =
      JSON.stringify(claudeAllowDerived) !==
      JSON.stringify(existingVersion?.claudeAllowDerived ?? []);
    const needsWrite = versionChanged || hasNewEntries || pruned > 0 || derivedChanged;

    if (needsWrite) {
      console.log(
        `${logPrefix} ${tag}write version pin: ${path.relative(cwd, versionFile)} (${pkgVersion})`,
      );
      ws.writes.push({ path: versionFile, action: "write" });
      if (!dryRun) {
        writeBkitVersion(versionFile, {
          pinnedVersion: pkgVersion,
          canonicalHashes,
          claudeAllowDerived: [...claudeAllowDerived],
        });
      }
    }
  });

  // 5. First-run extra logging (only when .bkit/version was absent at start of install)
  if (isFirstInstall) {
    advisories.push({
      id: "first-install-postinstall-steps",
      severity: "advisory",
      detect: "First install detected (.bkit/version was absent).",
      action:
        "Post-install steps:\n\n" +
        "1. Add BKIT_GH_TOKEN_INSTALL to your GitHub Actions repository secrets:\n" +
        "   - Create a classic PAT with `read:packages` scope (fine-grained PATs are\n" +
        "     not currently supported by GitHub Packages npm registry).\n" +
        "   - GitHub Settings → Secrets and variables → Actions → New repository secret\n" +
        "   - Name: BKIT_GH_TOKEN_INSTALL\n" +
        "   - See README.md ## Consumer CI auth for full setup.\n\n" +
        "2. Add a `.npmrc` at your repo root with the @cbartens registry mapping (the\n" +
        "   auth token is NOT stored here — it goes in pnpm's user-level config):\n" +
        "     @cbartens:registry=https://npm.pkg.github.com\n\n" +
        "3. Write the token into pnpm's user-level config (run once; CI does this in its\n" +
        "   install step). pnpm >=10.34.3 401s on a project-.npmrc ${BKIT_GH_TOKEN_INSTALL} ref:\n" +
        '     pnpm config set "//npm.pkg.github.com/:_authToken=$BKIT_GH_TOKEN_INSTALL"\n\n' +
        "4. Run `pnpm install` to refresh the lockfile, then commit.\n\n" +
        "Note: bkit seeded the bkit:gate:* / bkit:deps:* package.json scripts every workflow\n" +
        "runs (existing values are never touched). The tool scripts they chain (typecheck,\n" +
        "lint, format:check, lint:prose, slop:delta) and the devDeps those need are yours to\n" +
        "add: see .bkit/templates.md.",
    });
  }
}

// ---------------------------------------------------------------------------
// runClaudeModule — byte-identical mirror from .agents/ → .claude/
// ---------------------------------------------------------------------------

export const BKIT_PREFIX = "bkit-";
