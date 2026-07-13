import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  parseEnvrc,
  parseDotenv,
  resolveConsumerPnpm,
  renderCorepackLine,
  resolveCloudEnvVars,
  renderCloudEnvBlock,
  renderCloudEnvNotes,
} from "./bkit-cloud-env";

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-cloud-env-test-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function write(rel: string, content: string): void {
  const abs = path.join(tmpDir, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content, "utf-8");
}

describe("parseEnvrc", () => {
  it("extracts dotenv targets in order, unsets (single + multi), and exports", () => {
    const { dotenvFiles, unsets, exports } = parseEnvrc(
      [
        "# a comment",
        "dotenv_if_exists .bkit/.env",
        "dotenv_if_exists apps/web/.env.local",
        "dotenv .env.plain",
        "unset UPSTASH_REDIS_REST_URL",
        "unset FOO BAR",
        'export DIRECT="hello world"',
        "PATH_add ./bin", // ignored — not a directive we follow
      ].join("\n"),
    );
    expect(dotenvFiles).toEqual([".bkit/.env", "apps/web/.env.local", ".env.plain"]);
    expect(unsets).toEqual(["UPSTASH_REDIS_REST_URL", "FOO", "BAR"]);
    expect(exports).toEqual([["DIRECT", "hello world"]]);
  });
});

describe("parseDotenv", () => {
  it("parses KEY=value, honours quotes, export prefix, and '=' inside value", () => {
    const pairs = parseDotenv(
      [
        "# comment",
        "",
        "PLAIN=value",
        'QUOTED="with spaces"',
        "SINGLE='single'",
        "export EXPORTED=exp",
        "URL=postgres://u:p@host/db?a=b",
        "not a valid line",
      ].join("\n"),
    );
    expect(pairs).toEqual([
      ["PLAIN", "value"],
      ["QUOTED", "with spaces"],
      ["SINGLE", "single"],
      ["EXPORTED", "exp"],
      ["URL", "postgres://u:p@host/db?a=b"],
    ]);
  });
});

describe("resolveConsumerPnpm / renderCorepackLine", () => {
  it("parses the full pnpm version from packageManager", () => {
    write("package.json", JSON.stringify({ name: "x", packageManager: "pnpm@10.34.3" }));
    expect(resolveConsumerPnpm(tmpDir)).toBe("10.34.3");
    expect(renderCorepackLine(tmpDir)).toBe(
      "corepack enable && corepack prepare pnpm@10.34.3 --activate",
    );
  });

  it("degrades to bare corepack enable when packageManager is absent", () => {
    write("package.json", JSON.stringify({ name: "x" }));
    expect(resolveConsumerPnpm(tmpDir)).toBe("");
    expect(renderCorepackLine(tmpDir)).toContain("corepack enable");
    expect(renderCorepackLine(tmpDir)).not.toContain("prepare pnpm@ ");
  });
});

describe("resolveCloudEnvVars", () => {
  it("follows .envrc: last-source wins, honours unsets, drops hijack + empty, flags placeholders", () => {
    write(
      ".envrc",
      [
        "dotenv_if_exists .bkit/.env",
        "dotenv_if_exists apps/web/.env.local",
        "unset UPSTASH_REDIS_REST_URL",
      ].join("\n"),
    );
    write(
      ".bkit/.env",
      [
        "GH_BKIT_TOKEN=from_bkit_env",
        "ANTHROPIC_API_KEY=sk-should-be-dropped",
        "UPSTASH_REDIS_REST_URL=redis://dropped",
        "EMPTY_VAR=",
      ].join("\n"),
    );
    write("apps/web/.env.local", ["FOO=bar", "GH_BKIT_TOKEN=override_wins"].join("\n"));

    const res = resolveCloudEnvVars(tmpDir);
    const map = Object.fromEntries(res.included);

    expect(res.hasEnvrc).toBe(true);
    expect(res.sources).toEqual([".bkit/.env", "apps/web/.env.local"]);
    expect(map["FOO"]).toBe("bar");
    expect(map["GH_BKIT_TOKEN"]).toBe("override_wins"); // later source wins
    expect(res.unset).toContain("UPSTASH_REDIS_REST_URL");
    expect(map["UPSTASH_REDIS_REST_URL"]).toBeUndefined();
    expect(res.hijackDropped).toContain("ANTHROPIC_API_KEY");
    expect(map["ANTHROPIC_API_KEY"]).toBeUndefined();
    expect(res.emptySkipped).toContain("EMPTY_VAR");
    // GH_BKIT_TOKEN present → not a placeholder; GH_BKIT_TOKEN_INSTALL absent → placeholder.
    expect(res.placeholders).toEqual(["GH_BKIT_TOKEN_INSTALL"]);
  });

  it("returns an empty resolution (both baseline placeholders) when no .envrc exists", () => {
    write("package.json", JSON.stringify({ name: "x" }));
    const res = resolveCloudEnvVars(tmpDir);
    expect(res.hasEnvrc).toBe(false);
    expect(res.included).toEqual([]);
    expect(res.placeholders).toEqual(["GH_BKIT_TOKEN", "GH_BKIT_TOKEN_INSTALL"]);
  });
});

describe("renderCloudEnvBlock", () => {
  it("emits resolved lines, placeholder lines for absent baseline, and appends autocompact", () => {
    write(".envrc", "dotenv_if_exists .bkit/.env");
    write(".bkit/.env", "GH_BKIT_TOKEN=real");
    const block = renderCloudEnvBlock(resolveCloudEnvVars(tmpDir));
    const lines = block.split("\n");
    expect(lines).toContain("GH_BKIT_TOKEN=real");
    expect(lines).toContain("GH_BKIT_TOKEN_INSTALL=<classic PAT with read:packages>");
    expect(lines).toContain("CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=70");
  });

  it("does not append autocompact when it was resolved from a source", () => {
    write(".envrc", "dotenv_if_exists .bkit/.env");
    write(".bkit/.env", "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=50");
    const block = renderCloudEnvBlock(resolveCloudEnvVars(tmpDir));
    expect(block.match(/CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=/g)).toHaveLength(1);
    expect(block).toContain("CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=50");
  });
});

describe("renderCloudEnvNotes", () => {
  it("summarises dropped/unset/empty/placeholder categories", () => {
    write(".envrc", ["dotenv_if_exists .bkit/.env", "unset SECRET_DROP"].join("\n"));
    write(
      ".bkit/.env",
      ["GH_BKIT_TOKEN=x", "ANTHROPIC_API_KEY=y", "SECRET_DROP=z", "EMPTY="].join("\n"),
    );
    const notes = renderCloudEnvNotes(resolveCloudEnvVars(tmpDir));
    expect(notes).toContain("resolved");
    expect(notes).toContain("SECRET_DROP");
    expect(notes).toContain("ANTHROPIC_API_KEY");
    expect(notes).toContain("EMPTY");
    expect(notes).toContain("GH_BKIT_TOKEN_INSTALL"); // placeholder
  });

  it("emits a no-.envrc message when none exists", () => {
    write("package.json", JSON.stringify({ name: "x" }));
    expect(renderCloudEnvNotes(resolveCloudEnvVars(tmpDir))).toContain("No `.envrc` found");
  });
});

// Drift guard: the generated .claude/cloud.md template duplicates the vale-install
// block from the canonical .bkit/cloud.md. Keep the version literal in lockstep.
describe("template ↔ .bkit/cloud.md parity", () => {
  const pkgRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "..");
  const template = fs.readFileSync(
    path.join(pkgRoot, ".bkit", "templates", ".claude", "cloud.md"),
    "utf-8",
  );

  it("vale version in the template matches the canonical .bkit/cloud.md", () => {
    const cloudMd = fs.readFileSync(path.join(pkgRoot, ".bkit", "cloud.md"), "utf-8");
    const re = /VALE_VERSION="(\d+\.\d+\.\d+)"/;
    const tplVale = template.match(re)?.[1];
    const canonVale = cloudMd.match(re)?.[1];
    expect(tplVale).toBeDefined();
    expect(canonVale).toBeDefined();
    expect(tplVale).toBe(canonVale);
  });

  it("template carries the generation sentinels the module substitutes", () => {
    expect(template).toContain("@@CLOUD_ENV_VARS@@");
    expect(template).toContain("@@CLOUD_ENV_NOTES@@");
    expect(template).toContain("@@CLOUD_COREPACK@@");
    expect(template).toContain("{{PROJECT_NAME}}");
  });
});
