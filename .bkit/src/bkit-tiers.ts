import * as fs from "node:fs";
import * as path from "node:path";
import { updateManagedBlock, type WriteEntry, type WriteSet } from "./bkit-install.js";
import {
  extractFullManagedBlock,
  extractManagedBlock,
  findLineAnchoredMarkers,
  selectMarkers,
  stripManagedBlock,
  type MarkerStyle,
} from "./bkit-markers.js";
import { applyTokens, type TokenMap } from "./bkit-tokens.js";
import type { PreflightFinding } from "./bkit-preflight.js";
import { hashFile } from "./bkit-version.js";

export type { WriteSet, WriteEntry };

// ---------------------------------------------------------------------------
// JsonValue — generic JSON type used throughout Tier-2 JSON helpers
// ---------------------------------------------------------------------------

export type JsonValue = string | number | boolean | null | JsonValue[] | { [k: string]: JsonValue };

// ---------------------------------------------------------------------------
// deepContains — deep-containment check (BAR-167 Phase 1)
//
// Returns { ok, missing, mismatched } where:
//   ok          — true if every path in `template` is present and equal in `consumer`
//   missing     — paths present in template but absent from consumer
//   mismatched  — paths present in both but with incompatible values
//
// Semantics:
//   - Objects: for each key in template, consumer must have the same key with a
//     deep-containing value. Consumer may have extra keys (superset is ok).
//   - Arrays of primitives: template elements must all appear in consumer (subset semantics).
//   - Arrays of objects: for each template element, at least one consumer element must
//     deep-equal it (order-insensitive, asymmetric-size ok: consumer may have more).
//   - Mixed arrays: element-wise containment by type.
//   - Leaf primitives / null: exact equality required.
//   - null template at any path → ok (template owns "nothing").
//   - non-null template, null consumer → missing path.
// ---------------------------------------------------------------------------

export interface DeepContainsResult {
  ok: boolean;
  missing: string[];
  mismatched: string[];
}

export function deepContains(
  template: JsonValue,
  consumer: JsonValue,
  pathPrefix = "",
): DeepContainsResult {
  const missing: string[] = [];
  const mismatched: string[] = [];

  // null template: owns nothing → ok
  if (template === null) {
    return { ok: true, missing, mismatched };
  }

  // non-null template, null consumer → missing
  if (consumer === null) {
    missing.push(pathPrefix || "<root>");
    return { ok: false, missing, mismatched };
  }

  // Both are arrays
  if (Array.isArray(template) && Array.isArray(consumer)) {
    _deepContainsArray(template, consumer, pathPrefix, missing, mismatched);
    return { ok: missing.length === 0 && mismatched.length === 0, missing, mismatched };
  }

  // Type mismatch (one is array, other is not, or different primitive types)
  if (Array.isArray(template) !== Array.isArray(consumer)) {
    mismatched.push(pathPrefix || "<root>");
    return { ok: false, missing, mismatched };
  }

  // Both are plain objects
  if (typeof template === "object" && typeof consumer === "object") {
    const tObj = template as Record<string, JsonValue>;
    const cObj = consumer as Record<string, JsonValue>;
    for (const key of Object.keys(tObj)) {
      const childPath = pathPrefix ? `${pathPrefix}.${key}` : key;
      const tVal = tObj[key]!;
      const cVal = cObj[key];
      if (cVal === undefined) {
        // If template has null for this key, still ok
        if (tVal === null) continue;
        missing.push(childPath);
      } else {
        const sub = deepContains(tVal, cVal, childPath);
        missing.push(...sub.missing);
        mismatched.push(...sub.mismatched);
      }
    }
    return { ok: missing.length === 0 && mismatched.length === 0, missing, mismatched };
  }

  // Both are primitives — exact equality
  if (template !== consumer) {
    mismatched.push(pathPrefix || "<root>");
    return { ok: false, missing, mismatched };
  }

  return { ok: true, missing, mismatched };
}

function _deepContainsArray(
  template: JsonValue[],
  consumer: JsonValue[],
  pathPrefix: string,
  missing: string[],
  mismatched: string[],
): void {
  // Classify template elements as primitive or object
  for (let i = 0; i < template.length; i++) {
    const tEl = template[i]!;
    const elPath = pathPrefix ? `${pathPrefix}[${i}]` : `[${i}]`;

    if (tEl === null || typeof tEl !== "object") {
      // Primitive — subset: consumer must contain this value
      if (!consumer.includes(tEl)) {
        missing.push(elPath);
      }
    } else if (Array.isArray(tEl)) {
      // Nested array element — must find an equal consumer element
      const found = consumer.some((cEl) => Array.isArray(cEl) && deepContains(tEl, cEl, "").ok);
      if (!found) {
        missing.push(elPath);
      }
    } else {
      // Object element — order-insensitive deep-equal containment
      const found = consumer.some(
        (cEl) =>
          cEl !== null &&
          typeof cEl === "object" &&
          !Array.isArray(cEl) &&
          deepContains(tEl, cEl, "").ok,
      );
      if (!found) {
        missing.push(elPath);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// deepMergeJson — recursive JSON merge primitive (P3.T1)
//
// Semantics (from DE-8 contract spec):
//   - Objects: merge recursively (override keys win; base keys retained if absent from override)
//   - Arrays: override replaces base (no concat — arrays are treated as atomic values)
//   - Primitives / null: override replaces base
// ---------------------------------------------------------------------------

export function deepMergeJson(base: JsonValue, override: JsonValue): JsonValue {
  if (override === null || typeof override !== "object" || Array.isArray(override)) {
    return override;
  }
  if (base === null || typeof base !== "object" || Array.isArray(base)) {
    // base is not a plain object — override wins wholesale
    return override;
  }
  // Both are plain objects — recursive merge.
  //
  // Key ORDER follows `override` (the bkit template) for keys it defines, then appends
  // base-only (consumer) keys. The template is the authority on ordering: this matters for
  // order-significant maps like opencode's last-match-wins `permission.bash`, where a
  // `git push --force-with-lease*: allow` placed last in the template must stay last after an
  // upgrade/reconverge merge. Starting from `{...base}` (consumer order) instead let a stale
  // consumer ordering put the narrower `git push --force*: deny` after it, silently DENYING
  // force-with-lease (which rules.md permits on personal branches). (#255 P2-10)
  const baseObj = base as { [k: string]: JsonValue };
  const overrideObj = override as { [k: string]: JsonValue };
  const result: { [k: string]: JsonValue } = {};
  // 1. Template keys first, in template order (recurse where both sides are plain objects).
  for (const [key, val] of Object.entries(overrideObj)) {
    const baseVal = baseObj[key];
    if (
      key in baseObj &&
      baseVal !== null &&
      typeof baseVal === "object" &&
      !Array.isArray(baseVal) &&
      val !== null &&
      typeof val === "object" &&
      !Array.isArray(val)
    ) {
      result[key] = deepMergeJson(baseVal, val);
    } else {
      result[key] = val;
    }
  }
  // 2. Consumer-only keys preserved, appended after the template's keys.
  for (const [key, val] of Object.entries(baseObj)) {
    if (!(key in result)) {
      result[key] = val;
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// writeTier2JsonContained — deep-containment JSON helper (BAR-167 Phase 1)
//
// No __bkit__ envelope required.
//
// Contract:
//   - dest absent         → write template as-is (first install)
//   - dest present, valid JSON, template contained → no-op (idempotent)
//   - dest present, valid JSON, containment fails → deepMergeJson(existing, template)
//     (template wins on key collisions; consumer-only keys outside template tree preserved)
//   - dest present, malformed JSON → overwrite with template
//   - schemaFlipped: true when a path value changed type during deep-merge
// ---------------------------------------------------------------------------

export function writeTier2JsonContained(
  srcPath: string,
  dstPath: string,
  dryRun: boolean,
  ws: WriteSet,
): void {
  const srcRaw = fs.readFileSync(srcPath, "utf-8");
  let template: Record<string, JsonValue>;
  try {
    template = JSON.parse(srcRaw) as Record<string, JsonValue>;
  } catch {
    throw new Error(`writeTier2JsonContained: template at ${srcPath} is not valid JSON`);
  }

  if (!fs.existsSync(dstPath)) {
    // First install — write template as-is
    ensureDir(path.dirname(dstPath));
    if (!dryRun) {
      fs.writeFileSync(dstPath, JSON.stringify(template, null, 2) + "\n", "utf-8");
      const srcMode = fs.statSync(srcPath).mode;
      fs.chmodSync(dstPath, srcMode);
    }
    ws.writes.push({ path: dstPath, action: "write" });
    return;
  }

  // dest exists — read and check containment
  const dstRaw = fs.readFileSync(dstPath, "utf-8");
  let existing: Record<string, JsonValue>;
  try {
    existing = JSON.parse(dstRaw) as Record<string, JsonValue>;
  } catch {
    // Malformed destination — refuse to overwrite; require manual fix (matches malformed-package-json blocker discipline)
    throw new Error(
      `[bkit] ${dstPath} is malformed JSON — fix manually before running bkit install`,
    );
  }

  // Check if existing already contains the template
  const containsResult = deepContains(template as JsonValue, existing as JsonValue);
  if (containsResult.ok) {
    return; // idempotent — no change needed
  }

  // Deep-merge: existing base, template override (template wins on conflicts)
  const merged = deepMergeJson(existing as JsonValue, template as JsonValue);
  const mergedStr = JSON.stringify(merged, null, 2) + "\n";
  if (mergedStr === dstRaw) return; // idempotent guard

  if (!dryRun) {
    fs.writeFileSync(dstPath, mergedStr, "utf-8");
  }
  ws.writes.push({ path: dstPath, action: "update" });
}

// ---------------------------------------------------------------------------
// migrateLegacyBkitEnvelope — strip __bkit__ envelope from consumer doc (BAR-167 Phase 1)
//
// Pure function — no file I/O.
//
// Contract:
//   - __bkit__ absent → { stripped: false, deepMerged: false, schemaFlipped: false, outDoc: doc }
//   - __bkit__ present → strip it; run deepContains(template, stripped)
//     - ok=true → no further change; { stripped: true, deepMerged: false, schemaFlipped: false }
//     - ok=false → deepMergeJson(stripped, template); { stripped: true, deepMerged: true, schemaFlipped }
//   - schemaFlipped: true when at least one path in the merge changed value type
// ---------------------------------------------------------------------------

export interface MigrateLegacyBkitEnvelopeResult {
  stripped: boolean;
  deepMerged: boolean;
  schemaFlipped: boolean;
  outDoc: Record<string, JsonValue>;
}

export function migrateLegacyBkitEnvelope(
  doc: Record<string, JsonValue>,
  template: Record<string, JsonValue>,
): MigrateLegacyBkitEnvelopeResult {
  const noOp: MigrateLegacyBkitEnvelopeResult = {
    stripped: false,
    deepMerged: false,
    schemaFlipped: false,
    outDoc: doc,
  };

  // No envelope — nothing to migrate
  if (!("__bkit__" in doc) || doc["__bkit__"] === undefined) {
    return noOp;
  }

  // Strip __bkit__ from doc
  const stripped: Record<string, JsonValue> = {};
  for (const [k, v] of Object.entries(doc)) {
    if (k !== "__bkit__") stripped[k] = v;
  }

  // Check if stripped doc already contains the template
  const containsResult = deepContains(template as JsonValue, stripped as JsonValue);
  if (containsResult.ok) {
    return {
      stripped: true,
      deepMerged: false,
      schemaFlipped: false,
      outDoc: stripped,
    };
  }

  // Deep-merge: stripped base, template override
  const merged = deepMergeJson(stripped as JsonValue, template as JsonValue) as Record<
    string,
    JsonValue
  >;

  // Detect schema flip: any path where the type changed from stripped to merged
  const schemaFlipped = _detectSchemaFlip(stripped, merged);

  return {
    stripped: true,
    deepMerged: true,
    schemaFlipped,
    outDoc: merged,
  };
}

/** Detect if any path type-flipped between two objects (shallow first level only for perf). */
function _detectSchemaFlip(
  before: Record<string, JsonValue>,
  after: Record<string, JsonValue>,
): boolean {
  for (const key of Object.keys(after)) {
    const bVal = before[key];
    const aVal = after[key];
    if (bVal === undefined) continue; // new key — not a flip
    if (bVal === null && aVal === null) continue;
    const bIsArray = Array.isArray(bVal);
    const aIsArray = Array.isArray(aVal);
    if (bIsArray !== aIsArray) return true;
    if (!bIsArray && typeof bVal !== typeof aVal) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

export function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

// ---------------------------------------------------------------------------
// fully-managed format — idempotent rewrite of whole file after token substitution
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
// create-if-missing — write the src content (tokens applied) once, when dst is absent.
//
// The consumer owns the file from then on: a present dst is never read or touched.
// Pushes nothing to the WriteSet in either mode, so the file gets no hash and
// `bkit check` never reports it — dry-run and live stay in parity by construction.
// Returns whether it wrote (always false on dry-run).
// ---------------------------------------------------------------------------

export function writeIfAbsent(
  srcPath: string,
  dstPath: string,
  tokens: TokenMap,
  dryRun: boolean,
): boolean {
  if (dryRun || fs.existsSync(dstPath)) return false;
  ensureDir(path.dirname(dstPath));
  fs.writeFileSync(dstPath, applyTokens(fs.readFileSync(srcPath, "utf-8"), tokens), "utf-8");
  return true;
}

// ---------------------------------------------------------------------------
// markered-text format — managed-block (bkit owns content between markers; consumer owns rest)
//
// Semantics:
//   - dest absent            → write whole file (with token substitution)
//   - dest has markers       → update only the bkit block (tokens applied to new block content)
//   - dest present, no marks → append full block at EOF; preserve consumer content above
//
// markerStyle: "html-comment" for markdown/.gitignore; "hash-comment" for YAML/INI/shell.
//
// noMarkerMigration (optional, default off — no other markered-text file's behaviour
// changes): two independent, self-limiting migration triggers, each firing only for
// a shape that cannot occur once a file carries markers in the current layout:
//   - no markers, hash matches a prior canonical hash → replace wholesale (same bytes
//     a fresh install would produce). A file with no markers whose full-file hash
//     matches bkit's own record is provably ours and unmodified — the case of a file
//     an older bkit wrote whole, with no markers at all.
//   - no markers, hash unknown/differs → append the block (unchanged default
//     behaviour) and print wiring instructions — the consumer's own file needs one
//     line added to call into the appended block.
//   - markers present, but nothing meaningful lives after the end marker → replace
//     wholesale. Covers a file whose markers wrap the WHOLE file (nothing left
//     outside to preserve) — an ordinary block-content-only merge would silently
//     discard whatever those markers wrap that the template puts outside the
//     block. Self-limiting: once
//     genuinely migrated, real content lives after the end marker and this never
//     fires again, so it can never be reused to wholesale-replace a file that has
//     legitimate consumer content outside the block (unlike a hash comparison, whose
//     recorded value is refreshed after every write and would eventually "match"
//     ANY stable, unmodified file — bkit's own included).
//   - markers present, real content after the end marker → falls through to the
//     normal markers-present update (unchanged default behaviour).
// ---------------------------------------------------------------------------

export interface Tier2NoMarkerMigration {
  /** Consumer-relative path — the `canonicalHashes` key space. `dstPath` itself may be
   * absolute (the upgrade engine passes an absolute path), so this is carried
   * separately rather than derived from it. */
  relPath: string;
  /** Canonical hashes recorded before this run (from `.bkit/version`), keyed by
   * `relPath`. */
  canonicalHashes: Record<string, string>;
  /** Wiring-instructions text, printed via `console.warn`. `{{PATH}}` is substituted
   * with `dstPath`. */
  wiringMessage: string;
  /** Optional: also push a structured advisory (install has a sink; `bkit upgrade`
   * does not, and prints via `console.warn` alone). */
  advisories?: PreflightFinding[];
}

export function writeTier2(
  srcPath: string,
  dstPath: string,
  tokens: TokenMap,
  markerStyle: MarkerStyle,
  dryRun: boolean,
  ws: WriteSet,
  noMarkerMigration?: Tier2NoMarkerMigration,
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
    // extractManagedBlock returns null for BOTH "no markers" and "ambiguous markers"
    // (duplicates / inverted). Only the former should append — appending on the latter
    // compounds corruption (dogfood docs grew a second stamped block every install).
    const [startMarker, endMarker] = selectMarkers(markerStyle);
    const starts = findLineAnchoredMarkers(destContent, startMarker);
    const ends = findLineAnchoredMarkers(destContent, endMarker);
    if (starts.length > 0 || ends.length > 0) {
      console.warn(
        `[bkit] Managed block markers present but unparseable in ${dstPath} — skipping (expected exactly one start/end)`,
      );
      return;
    }

    if (noMarkerMigration) {
      const currentHash = hashFile(dstPath);
      const recordedHash = noMarkerMigration.canonicalHashes[noMarkerMigration.relPath];
      if (currentHash && recordedHash && currentHash === recordedHash) {
        // Ours and unmodified (an older bkit's copy without markers) — replace wholesale,
        // same bytes a fresh install would produce.
        const content = applyTokens(srcRaw, tokens);
        if (!dryRun) {
          fs.writeFileSync(dstPath, content, "utf-8");
          const srcMode = fs.statSync(srcPath).mode;
          fs.chmodSync(dstPath, srcMode);
        }
        ws.writes.push({ path: dstPath, action: "update" });
        return;
      }
    }

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
    if (noMarkerMigration) {
      const message = noMarkerMigration.wiringMessage.replace(/\{\{PATH\}\}/g, dstPath);
      console.warn(message);
      noMarkerMigration.advisories?.push({
        id: `tier2-block-appended-needs-wiring-${path.basename(dstPath)}`,
        severity: "advisory",
        detect: `${dstPath} exists with consumer-owned content and no bkit markers — the bkit-managed block was appended at EOF but is not wired into your driver.`,
        action: message,
      });
    }
    return;
  }

  // Stale-position markers: markers ARE present and parseable, but nothing meaningful
  // lives after the end marker. A block whose markers wrap the WHOLE file (the shape
  // of a gateguard.js an older bkit wrote, with `bkit:end` literally at EOF) has this
  // exact signature — the driver that belongs OUTSIDE the block is trapped INSIDE
  // it, and an ordinary "replace only what's between the markers" merge would
  // silently discard it (there is nothing in `afterBlock` to preserve it). Self-limiting
  // by construction: once genuinely migrated, real driver content lives after the end
  // marker, this is permanently false, and every later run takes the ordinary path below.
  if (noMarkerMigration) {
    const [, endMarker] = selectMarkers(markerStyle);
    const endIdx = findLineAnchoredMarkers(destContent, endMarker)[0]!;
    const endLineEnd = destContent.indexOf("\n", endIdx + endMarker.length);
    const afterBlock = endLineEnd === -1 ? "" : destContent.slice(endLineEnd + 1);
    if (afterBlock.trim() === "") {
      const content = applyTokens(srcRaw, tokens);
      if (content !== destContent) {
        if (!dryRun) {
          fs.writeFileSync(dstPath, content, "utf-8");
          const srcMode = fs.statSync(srcPath).mode;
          fs.chmodSync(dstPath, srcMode);
        }
        ws.writes.push({ path: dstPath, action: "update" });
      }
      return;
    }
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
// Managed package.json scripts — add-if-missing with consumer ownership
//
// Semantics:
//   - File absent           → no-op, returns missingPkg: true
//   - File malformed JSON   → no-op, returns malformed: true
//   - script key absent     → add with default value (recorded as one update)
//   - script key exists     → preserve consumer value (never overwrite)
//
// One WriteSet entry per call when any script was added. Drift
// surfaces in `bkit check` because `dryRun=true` still pushes to ws.writes.
// ---------------------------------------------------------------------------

export function ensurePackageJsonScripts(
  scripts: Record<string, string>,
  dryRun: boolean,
  ws: WriteSet,
): {
  added: string[];
  preserved: string[];
  missingPkg: boolean;
  malformed: boolean;
} {
  const pkgPath = "package.json";
  if (!fs.existsSync(pkgPath)) {
    return { added: [], preserved: [], missingPkg: true, malformed: false };
  }
  const raw = fs.readFileSync(pkgPath, "utf-8");
  let pkg: Record<string, unknown>;
  try {
    pkg = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return { added: [], preserved: [], missingPkg: false, malformed: true };
  }

  let pkgScripts = (pkg.scripts as Record<string, string> | undefined) ?? undefined;
  const added: string[] = [];
  const preserved: string[] = [];

  for (const [name, value] of Object.entries(scripts)) {
    if (pkgScripts && Object.prototype.hasOwnProperty.call(pkgScripts, name)) {
      preserved.push(name);
    } else {
      if (!pkgScripts) {
        pkgScripts = {};
        pkg.scripts = pkgScripts;
      }
      pkgScripts[name] = value;
      added.push(name);
    }
  }

  if (added.length > 0) {
    ws.writes.push({ path: pkgPath, action: "update" });
    if (!dryRun) {
      // Preserve indent style and trailing newline of the original file.
      const indentMatch = raw.match(/\n([ \t]+)"/);
      const indent = indentMatch ? indentMatch[1] : "  ";
      const trailingNewline = raw.endsWith("\n") ? "\n" : "";
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, indent) + trailingNewline, "utf-8");
    }
  }
  return { added, preserved, missingPkg: false, malformed: false };
}
