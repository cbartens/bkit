import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as http from "node:http";
import type { AddressInfo } from "node:net";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { CommandError, EXIT, type RunContext } from "../lib";
import { checkPins, fetchAsset, parsePins, pins, type Download } from "./pins";

const sha = (body: string) => createHash("sha256").update(body).digest("hex");

const JQ_URL = "https://example.test/jq-1.8.2/jq-linux-amd64";
const SCRIPT = [
  'JQ_VERSION="1.8.2"',
  `JQ_SHA256="${sha("jq 1.8.2")}"`,
  'curl -fsSLO "https://example.test/jq-${JQ_VERSION}/jq-linux-amd64"',
  'echo "${JQ_SHA256}  jq-linux-amd64" | sha256sum -c -',
].join("\n");

/** Serves fixed bodies by URL; counts requests; any other URL rejects like a 404. */
function fakeDownload(bodies: Record<string, string>) {
  const calls: string[] = [];
  const download: Download = async (url) => {
    calls.push(url);
    if (!(url in bodies)) throw new Error("HTTP 404");
    return Buffer.from(bodies[url]);
  };
  return { download, calls };
}

describe("parsePins", () => {
  it("reads shell, export and Dockerfile ARG pins and fills the version into the URL", () => {
    const text = [
      SCRIPT,
      "export GH_VERSION=2.103.0",
      "export GH_SHA256=abc",
      'curl "https://example.test/v$GH_VERSION/gh.tar.gz"',
      "ARG VALE_VERSION=3.24.0",
      "ARG VALE_SHA256=def",
      'RUN curl -fsSLO "https://example.test/v${VALE_VERSION}/vale_${VALE_VERSION}.tar.gz"',
    ].join("\n");
    expect(parsePins(text)).toEqual([
      {
        tool: "GH",
        version: "2.103.0",
        sha256: "abc",
        url: "https://example.test/v2.103.0/gh.tar.gz",
        problem: null,
      },
      { tool: "JQ", version: "1.8.2", sha256: sha("jq 1.8.2"), url: JQ_URL, problem: null },
      {
        tool: "VALE",
        version: "3.24.0",
        sha256: "def",
        url: "https://example.test/v3.24.0/vale_3.24.0.tar.gz",
        problem: null,
      },
    ]);
  });

  it("treats a version no URL uses as no download (pnpm through corepack)", () => {
    const text = 'ARG PNPM_VERSION=10.34.7\nRUN corepack prepare "pnpm@${PNPM_VERSION}" --activate';
    expect(parsePins(text)).toEqual([
      { tool: "PNPM", version: "10.34.7", sha256: null, url: null, problem: null },
    ]);
  });

  it("flags a downloaded version with no sha256 beside it", () => {
    const text = SCRIPT.split("\n")
      .filter((l) => !l.startsWith("JQ_SHA256="))
      .join("\n");
    expect(parsePins(text)[0]).toMatchObject({ tool: "JQ", problem: "missing-sha256" });
  });

  it("flags a sha256 with no version, a URL with an unknown variable, and two URLs", () => {
    expect(parsePins('NODE_SHA256="abc"')[0]).toMatchObject({ problem: "missing-version" });
    const unresolved = 'X_VERSION=1\nX_SHA256=a\ncurl "https://e.test/${ARCH}/x-${X_VERSION}"';
    expect(parsePins(unresolved)[0]).toMatchObject({ problem: "unresolved-url" });
    const twice =
      'X_VERSION=1\nX_SHA256=a\ncurl "https://e.test/x-${X_VERSION}"\ncurl "https://f.test/x-${X_VERSION}"';
    expect(parsePins(twice)[0]).toMatchObject({ problem: "ambiguous-url" });
  });
});

describe("checkPins", () => {
  it("passes a pin whose sha256 matches the download, in either case", async () => {
    const { download } = fakeDownload({ [JQ_URL]: "jq 1.8.2" });
    const upper = SCRIPT.replace(sha("jq 1.8.2"), sha("jq 1.8.2").toUpperCase());
    const [result] = await checkPins([{ file: "setup.sh", text: upper }], download);
    expect(result).toMatchObject({ file: "setup.sh", tool: "JQ", status: "ok" });
  });

  it("fails a version-only bump: the old hash against the new download", async () => {
    const { download } = fakeDownload({ [JQ_URL]: "jq 1.8.2" });
    const stale = SCRIPT.replace(sha("jq 1.8.2"), sha("jq 1.7.1"));
    const [result] = await checkPins([{ file: "setup.sh", text: stale }], download);
    expect(result).toMatchObject({
      tool: "JQ",
      status: "mismatch",
      expected: sha("jq 1.7.1"),
      actual: sha("jq 1.8.2"),
    });
  });

  it("fails, never passes, when the download fails", async () => {
    const { download } = fakeDownload({});
    const [result] = await checkPins([{ file: "setup.sh", text: SCRIPT }], download);
    expect(result).toMatchObject({ status: "unreachable", error: "HTTP 404" });
  });

  it("downloads a URL once when several files pin it", async () => {
    const { download, calls } = fakeDownload({ [JQ_URL]: "jq 1.8.2" });
    const files = [
      { file: "a", text: SCRIPT },
      { file: "b", text: SCRIPT },
    ];
    const results = await checkPins(files, download);
    expect(results.map((r) => r.status)).toEqual(["ok", "ok"]);
    expect(calls).toEqual([JQ_URL]);
  });

  it("skips a pin with no download and never downloads for a pin with a problem", async () => {
    const { download, calls } = fakeDownload({});
    const text = 'PNPM_VERSION=10\nX_VERSION=1\ncurl "https://e.test/x-${X_VERSION}"';
    const results = await checkPins([{ file: "f", text }], download);
    expect(results.map((r) => [r.tool, r.status])).toEqual([
      ["PNPM", "skipped"],
      ["X", "missing-sha256"],
    ]);
    expect(calls).toEqual([]);
  });
});

describe("bkit ci pins", () => {
  let dir: string;
  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-ci-pins-"));
  });
  afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

  function ctx(file: string[] | undefined) {
    const logs: string[] = [];
    const out: Record<string, unknown>[] = [];
    const c: RunContext = {
      flags: { file },
      cwd: dir,
      json: true,
      log: (m) => logs.push(m),
      emit: (o) => out.push(o),
    };
    return { c, logs, out };
  }

  it("exits 0 and emits every pin when each hash matches", async () => {
    fs.writeFileSync(path.join(dir, "setup.sh"), SCRIPT);
    const { download } = fakeDownload({ [JQ_URL]: "jq 1.8.2" });
    const { c, out } = ctx(["setup.sh"]);
    expect(await pins(c, download)).toBe(EXIT.OK);
    expect(out).toEqual([{ passed: true, pins: [expect.objectContaining({ status: "ok" })] }]);
  });

  it("exits 1 and names the tool and file when a hash is stale", async () => {
    fs.writeFileSync(path.join(dir, "Dockerfile"), SCRIPT.replace(sha("jq 1.8.2"), sha("old")));
    const { download } = fakeDownload({ [JQ_URL]: "jq 1.8.2" });
    const { c, logs, out } = ctx(["Dockerfile"]);
    expect(await pins(c, download)).toBe(EXIT.NO);
    expect(out[0]).toMatchObject({ passed: false });
    expect(logs).toContain(
      `FAIL    JQ 1.8.2 in Dockerfile: sha256 is ${sha("jq 1.8.2")}, the pin says ${sha("old")} (${JQ_URL})`,
    );
  });

  it("refuses no --file and a file that does not exist", async () => {
    const { download } = fakeDownload({});
    await expect(pins(ctx(undefined).c, download)).rejects.toThrow(CommandError);
    await expect(pins(ctx(["nope"]).c, download)).rejects.toThrow("no such file: nope");
  });
});

describe("fetchAsset", () => {
  let server: http.Server;
  let base: string;
  let hits: number;
  beforeEach(async () => {
    hits = 0;
    server = http.createServer((req, res) => {
      hits++;
      if (req.url === "/asset") res.end("payload");
      else res.writeHead(404).end();
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });
  afterEach(() => new Promise<void>((resolve) => server.close(() => resolve())));

  it("returns the body of a 200", async () => {
    expect((await fetchAsset(`${base}/asset`)).toString()).toBe("payload");
  });

  it("throws the status after three attempts", async () => {
    await expect(fetchAsset(`${base}/missing`)).rejects.toThrow("HTTP 404");
    expect(hits).toBe(3);
  });
});
