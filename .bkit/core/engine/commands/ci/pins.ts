// bkit ci pins — download each version + sha256 pinned tool and check its hash.
//
// A file pins a tool as `<TOOL>_VERSION` plus `<TOOL>_SHA256` (shell `X="v"`, `export X=v`,
// Dockerfile `ARG X=v`) and downloads it from a URL that spells `${<TOOL>_VERSION}`.
// Renovate bumps the version and leaves the hash, so a version-only bump fails only when
// the image is rebuilt or the setup script reruns. This check fails first, naming the tool:
// on a hash that differs, a download that fails, or a downloaded version with no hash.
// A version no URL in the file uses (pnpm through corepack) is not a download: skipped.

import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";

import { CommandError, EXIT, type RunContext } from "../lib.js";

/** One tool's pin in one file. */
export interface Pin {
  tool: string;
  version: string | null;
  sha256: string | null;
  /** The download URL with every known `*_VERSION` filled in; null when no URL uses the version. */
  url: string | null;
  /** Set when the pin cannot be checked as written. */
  problem: "missing-sha256" | "missing-version" | "unresolved-url" | "ambiguous-url" | null;
}

export type PinStatus = "ok" | "mismatch" | "unreachable" | "skipped" | NonNullable<Pin["problem"]>;

export interface PinResult {
  file: string;
  tool: string;
  version: string | null;
  url: string | null;
  status: PinStatus;
  expected: string | null;
  actual: string | null;
  error: string | null;
}

export type Download = (url: string) => Promise<Buffer>;

const ASSIGNMENT =
  /^\s*(?:ARG\s+|export\s+)?([A-Z][A-Z0-9]*)_(VERSION|SHA256)=("?)([^"\s]+)\3\s*$/gm;
const URL = /https?:\/\/[^\s"'<>]+/g;
const VERSION_REF = /\$\{?([A-Z][A-Z0-9]*)_VERSION\}?/g;
const ATTEMPTS = 3;
const TIMEOUT_MS = 120_000;

/** Every `*_VERSION` / `*_SHA256` pin in `text`, with the URL its version downloads from. */
export function parsePins(text: string): Pin[] {
  const versions = new Map<string, string>();
  const hashes = new Map<string, string>();
  for (const m of text.matchAll(ASSIGNMENT)) {
    (m[2] === "VERSION" ? versions : hashes).set(m[1], m[4]);
  }
  const urls = new Map<string, Set<string>>();
  for (const [raw] of text.matchAll(URL)) {
    for (const ref of raw.matchAll(VERSION_REF)) {
      const filled = raw.replace(VERSION_REF, (whole, tool: string) => versions.get(tool) ?? whole);
      const seen = urls.get(ref[1]) ?? new Set<string>();
      urls.set(ref[1], seen.add(filled));
    }
  }

  const tools = [...new Set([...versions.keys(), ...hashes.keys()])].sort();
  return tools.map((tool): Pin => {
    const version = versions.get(tool) ?? null;
    const sha256 = hashes.get(tool) ?? null;
    const found = [...(urls.get(tool) ?? [])];
    const url = found.length === 1 ? found[0] : null;
    const problem =
      version === null
        ? "missing-version"
        : found.length > 1
          ? "ambiguous-url"
          : url !== null && url.includes("$")
            ? "unresolved-url"
            : url !== null && sha256 === null
              ? "missing-sha256"
              : null;
    return { tool, version, sha256, url, problem };
  });
}

/** GET `url` and return its body; retried, a non-2xx status or a timeout throws. */
export const fetchAsset: Download = async (url) => {
  let last: unknown;
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (err) {
      last = err;
    }
  }
  throw last instanceof Error ? last : new Error(String(last));
};

/** Check every pin of every file; each URL is downloaded once. */
export async function checkPins(
  files: { file: string; text: string }[],
  download: Download,
): Promise<PinResult[]> {
  const digests = new Map<string, Promise<string>>();
  const digest = (url: string) => {
    const known = digests.get(url);
    if (known) return known;
    const pending = download(url).then((body) => createHash("sha256").update(body).digest("hex"));
    digests.set(url, pending);
    return pending;
  };

  const results: PinResult[] = [];
  for (const { file, text } of files) {
    for (const pin of parsePins(text)) {
      const base = { file, tool: pin.tool, version: pin.version, url: pin.url };
      const expected = pin.sha256?.toLowerCase() ?? null;
      const none = { expected, actual: null, error: null };
      if (pin.problem) {
        results.push({ ...base, ...none, status: pin.problem });
      } else if (pin.url === null || expected === null) {
        results.push({ ...base, ...none, status: "skipped" });
      } else {
        try {
          const actual = await digest(pin.url);
          const status = actual === expected ? "ok" : "mismatch";
          results.push({ ...base, expected, actual, error: null, status });
        } catch (err) {
          const error = err instanceof Error ? err.message : String(err);
          results.push({ ...base, ...none, status: "unreachable", error });
        }
      }
    }
  }
  return results;
}

const FAILURE: Record<Exclude<PinStatus, "ok" | "skipped">, (r: PinResult) => string> = {
  mismatch: (r) => `sha256 is ${r.actual}, the pin says ${r.expected} (${r.url})`,
  unreachable: (r) => `download failed: ${r.error} (${r.url})`,
  "missing-sha256": (r) => `downloaded from ${r.url} but has no ${r.tool}_SHA256 beside it`,
  "missing-version": (r) => `${r.tool}_SHA256 has no ${r.tool}_VERSION beside it`,
  "unresolved-url": (r) => `download URL still has an unknown variable: ${r.url}`,
  "ambiguous-url": (r) => `${r.tool}_VERSION is used in more than one download URL`,
};

/** `bkit ci pins`: exit 0 when every download pin's sha256 matches what its URL serves. */
export async function pins(ctx: RunContext, download: Download = fetchAsset): Promise<number> {
  const given = ctx.flags.file;
  const names = Array.isArray(given) ? given : typeof given === "string" ? [given] : [];
  if (names.length === 0) throw new CommandError(EXIT.USAGE, "give at least one --file");
  const files = names.map((file) => {
    const abs = path.resolve(ctx.cwd, file);
    if (!fs.existsSync(abs)) throw new CommandError(EXIT.USAGE, `no such file: ${file}`);
    return { file, text: fs.readFileSync(abs, "utf-8") };
  });

  const results = await checkPins(files, download);
  for (const r of results) {
    const label = `${r.tool} ${r.version ?? "(no version)"} in ${r.file}`;
    if (r.status === "ok") ctx.log(`ok      ${label}`);
    else if (r.status === "skipped") ctx.log(`skipped ${label}: no download URL uses it`);
    else ctx.log(`FAIL    ${label}: ${FAILURE[r.status](r)}`);
  }
  for (const { file } of files) {
    if (!results.some((r) => r.file === file)) ctx.log(`no *_VERSION / *_SHA256 pins in ${file}`);
  }
  const passed = results.every((r) => r.status === "ok" || r.status === "skipped");
  ctx.emit({ passed, pins: results });
  return passed ? EXIT.OK : EXIT.NO;
}
