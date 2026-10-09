import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  RETIRED_OWNED_FILES,
  detectRetiredOwnedFiles,
  findRetiredCallers,
  retireOwnedFiles,
  type RetiredFile,
} from "./bkit-retire";
import { readBkitVersion, sha256, writeBkitVersion } from "./bkit-version";

const OLD = ".bkit/scripts/bkit-old.sh";
const LIST: RetiredFile[] = [{ path: OLD, replacement: "`bkit olds run`" }];
const BODY = "#!/usr/bin/env bash\necho old\n";

const dirs: string[] = [];
afterEach(() => {
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

/** A consumer where bkit once wrote OLD with BODY and recorded its hash. */
function consumer(opts: { onDisk?: string; recorded?: boolean } = {}) {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-retire-"));
  dirs.push(cwd);
  if (opts.onDisk !== undefined) {
    fs.mkdirSync(path.join(cwd, ".bkit", "scripts"), { recursive: true });
    fs.writeFileSync(path.join(cwd, OLD), opts.onDisk);
  }
  writeBkitVersion(path.join(cwd, ".bkit", "version"), {
    pinnedVersion: "1.0.0",
    canonicalHashes: {
      ".bkit/scripts/bkit-kept.sh": "abc",
      ...(opts.recorded === false ? {} : { [OLD]: sha256(BODY) }),
    },
  });
  return cwd;
}

const hashesOf = (cwd: string) =>
  readBkitVersion(path.join(cwd, ".bkit", "version"))!.canonicalHashes;
const lines: string[] = [];
const log = (l: string) => lines.push(l);

describe("retireOwnedFiles", () => {
  it("deletes an unedited copy and drops its hash, leaving other hashes", () => {
    const cwd = consumer({ onDisk: BODY });
    expect(retireOwnedFiles(cwd, { dryRun: false, log }, LIST)).toEqual({
      deleted: [OLD],
      kept: [],
    });
    expect(fs.existsSync(path.join(cwd, OLD))).toBe(false);
    expect(hashesOf(cwd)).toEqual({ ".bkit/scripts/bkit-kept.sh": "abc" });
  });

  it("keeps an edited copy but still drops its hash", () => {
    const cwd = consumer({ onDisk: BODY + "echo mine\n" });
    expect(retireOwnedFiles(cwd, { dryRun: false, log }, LIST)).toEqual({
      deleted: [],
      kept: [OLD],
    });
    expect(fs.existsSync(path.join(cwd, OLD))).toBe(true);
    expect(hashesOf(cwd)).not.toHaveProperty(OLD);
  });

  it("keeps a copy with no recorded hash — bkit cannot prove it wrote it", () => {
    const cwd = consumer({ onDisk: BODY, recorded: false });
    expect(retireOwnedFiles(cwd, { dryRun: false, log }, LIST).kept).toEqual([OLD]);
  });

  it("dry-run reports the delete but touches nothing", () => {
    const cwd = consumer({ onDisk: BODY });
    const before = fs.readFileSync(path.join(cwd, ".bkit", "version"), "utf-8");
    expect(retireOwnedFiles(cwd, { dryRun: true, log }, LIST).deleted).toEqual([OLD]);
    expect(fs.existsSync(path.join(cwd, OLD))).toBe(true);
    expect(fs.readFileSync(path.join(cwd, ".bkit", "version"), "utf-8")).toBe(before);
  });

  it("drops the hash of a file the consumer already removed", () => {
    const cwd = consumer();
    expect(retireOwnedFiles(cwd, { dryRun: false, log }, LIST)).toEqual({ deleted: [], kept: [] });
    expect(hashesOf(cwd)).not.toHaveProperty(OLD);
  });

  it("is a no-op without .bkit/version", () => {
    const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-retire-"));
    dirs.push(cwd);
    expect(retireOwnedFiles(cwd, { dryRun: false, log }, LIST)).toEqual({ deleted: [], kept: [] });
  });
});

describe("findRetiredCallers", () => {
  it("finds the path in CI workflows and package.json, with line numbers", () => {
    const cwd = consumer();
    fs.mkdirSync(path.join(cwd, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(cwd, ".github", "workflows", "ci.yml"),
      `jobs:\n  x:\n    run: bash ${OLD}\n`,
    );
    fs.writeFileSync(path.join(cwd, ".github", "workflows", "notes.txt"), `bash ${OLD}\n`);
    fs.writeFileSync(path.join(cwd, "package.json"), `{\n  "scripts": { "x": "bash ${OLD}" }\n}\n`);
    expect(findRetiredCallers(cwd, LIST).map((c) => `${c.file}:${c.line}`)).toEqual([
      path.join(".github", "workflows", "ci.yml") + ":3",
      "package.json:2",
    ]);
  });

  it("finds nothing when no file is retired", () => {
    expect(findRetiredCallers(consumer(), [])).toEqual([]);
  });
});

describe("detectRetiredOwnedFiles", () => {
  it("is silent about an unedited copy — the retire pass deletes it", () => {
    expect(detectRetiredOwnedFiles(consumer({ onDisk: BODY }), LIST)).toEqual([]);
  });

  it("names an edited copy and its replacement, with the delete command inline", () => {
    const [f] = detectRetiredOwnedFiles(consumer({ onDisk: "edited\n" }), LIST);
    expect(f!.severity).toBe("advisory");
    expect(f!.action).toContain("`bkit olds run`");
    expect(f!.action).toContain(`rm ${OLD}`);
  });

  it("names each calling line and its replacement", () => {
    const cwd = consumer();
    fs.writeFileSync(path.join(cwd, "package.json"), `{ "scripts": { "x": "bash ${OLD}" } }\n`);
    const [f] = detectRetiredOwnedFiles(cwd, LIST);
    expect(f!.id).toBe("retired-file-caller:package.json:1");
    expect(f!.action).toBe(
      `In package.json line 1, replace the call to ${OLD} with \`bkit olds run\`.`,
    );
  });
});

describe("the shipped list", () => {
  it("names only paths under .bkit/, each with a replacement", () => {
    for (const r of RETIRED_OWNED_FILES) {
      expect(r.path.startsWith(".bkit/"), r.path).toBe(true);
      expect(r.replacement, r.path).not.toBe("");
    }
  });

  it("names no file bkit still ships", () => {
    const shipped = RETIRED_OWNED_FILES.filter((r) =>
      fs.existsSync(path.join(__dirname, "..", "templates", r.path)),
    );
    expect(shipped).toEqual([]);
  });
});
