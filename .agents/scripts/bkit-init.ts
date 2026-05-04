import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

// PKG_ROOT resolves at runtime to the bkit package root.
//   - Compiled bin (dist/bkit-init.js): __dirname = <pkg>/dist  → PKG_ROOT = <pkg>
//   - Source dogfood (.agents/scripts/bkit-init.ts via bun): __dirname = <repo>/.agents/scripts → PKG_ROOT = <repo>
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = __dirname.endsWith(`${path.sep}.agents${path.sep}scripts`)
  ? path.resolve(__dirname, "..", "..")
  : path.resolve(__dirname, "..");

const PKG_AGENTS = path.join(PKG_ROOT, ".agents");
const PKG_PACKAGE_JSON = path.join(PKG_ROOT, "package.json");

// Subtrees inside .agents/ that should NOT be copied into a consumer's .agents/.
// Skills are project-managed; scripts ship via dist/ + bin entry; package metadata files are private.
const COPY_EXCLUDE = new Set(["skills", "scripts", "README.md"]);

function copyAdditive(src: string, dst: string, dryRun: boolean, log: (rel: string) => void, relRoot: string): number {
  let writes = 0;
  if (!fs.existsSync(src)) return 0;
  const stats = fs.statSync(src);
  if (stats.isFile()) {
    if (fs.existsSync(dst)) return 0;
    if (!dryRun) {
      fs.mkdirSync(path.dirname(dst), { recursive: true });
      fs.copyFileSync(src, dst);
      fs.chmodSync(dst, stats.mode);
    }
    log(path.relative(relRoot, dst));
    return 1;
  }
  if (!dryRun) fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    writes += copyAdditive(path.join(src, entry.name), path.join(dst, entry.name), dryRun, log, relRoot);
  }
  return writes;
}

export function runInit(opts: { dryRun: boolean }): { writes: number } {
  const cwd = process.cwd();
  const target = path.join(cwd, ".agents");
  const tag = opts.dryRun ? "[dry-run] " : "";
  let writes = 0;

  if (!fs.existsSync(PKG_AGENTS)) {
    console.error(`[bkit-init] Packaged .agents/ not found at ${PKG_AGENTS} — package corrupt?`);
    process.exit(1);
  }
  if (!fs.existsSync(PKG_PACKAGE_JSON)) {
    console.error(`[bkit-init] package.json not found at ${PKG_PACKAGE_JSON} — package corrupt?`);
    process.exit(1);
  }

  const pkgVersion = JSON.parse(fs.readFileSync(PKG_PACKAGE_JSON, "utf-8")).version as string;

  for (const entry of fs.readdirSync(PKG_AGENTS, { withFileTypes: true })) {
    if (COPY_EXCLUDE.has(entry.name)) continue;
    const srcPath = path.join(PKG_AGENTS, entry.name);
    const dstPath = path.join(target, entry.name);
    const copied = copyAdditive(srcPath, dstPath, opts.dryRun, (rel) => {
      console.log(`[bkit-init] ${tag}copy: ${rel}`);
    }, cwd);
    writes += copied;
  }

  const versionFile = path.join(target, ".bkit-version");
  let needsVersionWrite = !fs.existsSync(versionFile);
  if (!needsVersionWrite) {
    const existing = fs.readFileSync(versionFile, "utf-8").trim();
    if (existing !== pkgVersion) needsVersionWrite = true;
  }
  if (needsVersionWrite) {
    if (!opts.dryRun) {
      fs.mkdirSync(target, { recursive: true });
      fs.writeFileSync(versionFile, pkgVersion + "\n", "utf-8");
    }
    console.log(`[bkit-init] ${tag}write version pin: ${path.relative(cwd, versionFile)} (${pkgVersion})`);
    writes++;
  }

  return { writes };
}
