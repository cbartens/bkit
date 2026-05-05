import * as fs from "node:fs";
import * as path from "node:path";
import {
  extractFullManagedBlock,
  extractManagedBlock,
  updateManagedBlock,
  type MarkerStyle,
  type WriteEntry,
  type WriteSet,
} from "./bkit-install.js";
import { applyTokens, type TokenMap } from "./bkit-tokens.js";

export type { WriteSet, WriteEntry };

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

// ---------------------------------------------------------------------------
// Tier 1 — Fully managed (idempotent rewrite of whole file after token substitution)
//
// Semantics: always writes the src content (with tokens applied) to dst.
// If dst exists with identical content, no-op (no double-count in WriteSet).
// ---------------------------------------------------------------------------

export function writeTier1(
  srcPath: string,
  dstPath: string,
  tokens: TokenMap,
  dryRun: boolean,
  ws: WriteSet,
): void {
  const srcRaw = fs.readFileSync(srcPath, "utf-8");
  const srcContent = applyTokens(srcRaw, tokens);

  if (fs.existsSync(dstPath)) {
    const existing = fs.readFileSync(dstPath, "utf-8");
    if (existing === srcContent) return; // identical — no-op
  }

  ensureDir(path.dirname(dstPath));
  if (!dryRun) {
    fs.writeFileSync(dstPath, srcContent, "utf-8");
    // Preserve executable bit from src
    const srcMode = fs.statSync(srcPath).mode;
    fs.chmodSync(dstPath, srcMode);
  }

  ws.writes.push({ path: dstPath, action: "write" });
}

// ---------------------------------------------------------------------------
// Tier 2 — Managed-block (bkit owns content between markers; consumer owns rest)
//
// Semantics:
//   - dest absent            → write whole file (with token substitution)
//   - dest has markers       → update only the bkit block (tokens applied to new block content)
//   - dest present, no marks → append full block at EOF; preserve consumer content above
//
// markerStyle: "html-comment" for markdown/.gitignore; "hash-comment" for YAML/INI/shell.
// ---------------------------------------------------------------------------

export function writeTier2(
  srcPath: string,
  dstPath: string,
  tokens: TokenMap,
  markerStyle: MarkerStyle,
  dryRun: boolean,
  ws: WriteSet,
): void {
  const srcRaw = fs.readFileSync(srcPath, "utf-8");

  if (!fs.existsSync(dstPath)) {
    // dest missing → write whole template (with tokens applied)
    const content = applyTokens(srcRaw, tokens);
    ensureDir(path.dirname(dstPath));
    if (!dryRun) {
      fs.writeFileSync(dstPath, content, "utf-8");
      const srcMode = fs.statSync(srcPath).mode;
      fs.chmodSync(dstPath, srcMode);
    }
    ws.writes.push({ path: dstPath, action: "write" });
    return;
  }

  const destContent = fs.readFileSync(dstPath, "utf-8");
  const fullBlock = extractFullManagedBlock(srcRaw, markerStyle);

  if (fullBlock === null) {
    // Template has no block for this marker style — nothing to manage
    return;
  }

  // Check if dest already has markers
  const blockContent = extractManagedBlock(destContent, markerStyle);

  if (blockContent === null) {
    // dest has no markers → append full block at EOF (with tokens applied)
    const appliedBlock = applyTokens(fullBlock, tokens);
    const sep =
      destContent.length === 0
        ? ""
        : destContent.endsWith("\n\n")
          ? ""
          : destContent.endsWith("\n")
            ? "\n"
            : "\n\n";
    const tail = appliedBlock.endsWith("\n") ? "" : "\n";
    if (!dryRun) {
      fs.writeFileSync(dstPath, destContent + sep + appliedBlock + tail, "utf-8");
    }
    ws.writes.push({ path: dstPath, action: "append" });
    return;
  }

  // dest has markers → update managed block with new content (tokens applied)
  const newBlockContent = extractManagedBlock(srcRaw, markerStyle);
  if (newBlockContent === null) return;

  const appliedNewContent = applyTokens(newBlockContent, tokens);
  if (updateManagedBlock(dstPath, appliedNewContent, dryRun, markerStyle)) {
    ws.writes.push({ path: dstPath, action: "update" });
  }
}

// ---------------------------------------------------------------------------
// Tier 3 — Seed-or-print (write if absent; if present, print suggested diff to printSink)
//
// Semantics:
//   - dest absent  → write file; returns { wrote: true, suggested: false }
//   - dest present → print suggested diff to printSink; returns { wrote: false, suggested: true }
//
// No token substitution (Tier 3 files are comment-less JSON / config — no placeholders).
// dry-run: if dest absent, record in WriteSet but don't write; returns { wrote: false, suggested: false }
// ---------------------------------------------------------------------------

export interface Tier3Result {
  wrote: boolean;
  suggested: boolean;
}

export function writeTier3(
  srcPath: string,
  dstPath: string,
  dryRun: boolean,
  printSink: string[],
  ws: WriteSet,
): Tier3Result {
  if (fs.existsSync(dstPath)) {
    // Present → suggest diff, don't write
    const srcContent = fs.readFileSync(srcPath, "utf-8");
    const dstContent = fs.readFileSync(dstPath, "utf-8");
    if (srcContent !== dstContent) {
      printSink.push(
        `[bkit-install] Tier 3 suggestion for ${dstPath}:\n` +
          `  File already exists. bkit suggests the following content:\n` +
          `  --- current ---\n${dstContent}\n  --- suggested ---\n${srcContent}`,
      );
    }
    return { wrote: false, suggested: srcContent !== dstContent };
  }

  // Absent → write (or record in dry-run)
  ensureDir(path.dirname(dstPath));
  if (!dryRun) {
    fs.copyFileSync(srcPath, dstPath);
    const srcMode = fs.statSync(srcPath).mode;
    fs.chmodSync(dstPath, srcMode);
  }
  ws.writes.push({ path: dstPath, action: "write" });
  return { wrote: !dryRun, suggested: false };
}
