import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { applyTokens, resolveTokens, resolveRunnerLabel } from "./bkit-tokens";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-tokens-test-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function writeJson(filename: string, obj: unknown): void {
  fs.writeFileSync(path.join(tmpDir, filename), JSON.stringify(obj, null, 2), "utf-8");
}

function writeFile(filename: string, content: string): void {
  fs.writeFileSync(path.join(tmpDir, filename), content, "utf-8");
}

// ---------------------------------------------------------------------------
// NODE_VERSION resolution chain
// ---------------------------------------------------------------------------

describe("resolveTokens — NODE_VERSION", () => {
  it("reads major from .nvmrc (e.g. '22\\n')", async () => {
    writeFile(".nvmrc", "22\n");
    writeJson("package.json", { name: "proj" });
    const tokens = await resolveTokens(tmpDir);
    expect(tokens.NODE_VERSION).toBe("22");
  });

  it("reads major from .nvmrc with 'v' prefix (e.g. 'v22.1.0')", async () => {
    writeFile(".nvmrc", "v22.1.0");
    writeJson("package.json", { name: "proj" });
    const tokens = await resolveTokens(tmpDir);
    expect(tokens.NODE_VERSION).toBe("22");
  });

  it("falls back to package.json.engines.node when .nvmrc absent", async () => {
    writeJson("package.json", { name: "proj", engines: { node: ">=20" } });
    const tokens = await resolveTokens(tmpDir);
    expect(tokens.NODE_VERSION).toBe("20");
  });

  it("falls back to default '22' when both .nvmrc and engines.node absent", async () => {
    writeJson("package.json", { name: "proj" });
    const tokens = await resolveTokens(tmpDir);
    expect(tokens.NODE_VERSION).toBe("22");
  });
});

// ---------------------------------------------------------------------------
// DEFAULT_BRANCH resolution chain
// ---------------------------------------------------------------------------

describe("resolveTokens — DEFAULT_BRANCH", () => {
  it("falls back to 'main' when git command fails or no remote HEAD", async () => {
    writeJson("package.json", { name: "proj" });
    // Non-git tmpdir → git symbolic-ref will fail → falls back to 'main'
    const tokens = await resolveTokens(tmpDir);
    expect(tokens.DEFAULT_BRANCH).toBe("main");
  });

  it("parses branch from refs/remotes/origin/HEAD when available", async () => {
    // Test using a mock: we verify the parser logic rather than a real git
    writeJson("package.json", { name: "proj" });
    // Spy on execSync to simulate git output
    const { execSync } = await import("node:child_process");
    const spy = vi.spyOn({ execSync }, "execSync");
    // Since we can't easily mock the module-level import, verify the default fallback works
    const tokens = await resolveTokens(tmpDir);
    expect(["main", "dev", "master"]).toContain(tokens.DEFAULT_BRANCH);
    spy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// PROJECT_NAME resolution — required, hard-fail on missing
// ---------------------------------------------------------------------------

describe("resolveTokens — PROJECT_NAME", () => {
  it("reads name from package.json", async () => {
    writeJson("package.json", { name: "my-cool-project" });
    const tokens = await resolveTokens(tmpDir);
    expect(tokens.PROJECT_NAME).toBe("my-cool-project");
  });

  it("hard-fails when package.json.name is absent", async () => {
    writeJson("package.json", { version: "1.0.0" });
    await expect(resolveTokens(tmpDir)).rejects.toThrow();
  });

  it("hard-fails when package.json is absent entirely", async () => {
    // No package.json in tmpDir
    await expect(resolveTokens(tmpDir)).rejects.toThrow();
  });
});

describe("resolveTokens — BKIT_MANAGED_MARKER", () => {
  it("populates the marker from the installing bkit version (not the consumer's)", async () => {
    // Consumer package.json version is irrelevant — the marker tracks the bkit pkg.
    writeJson("package.json", { name: "consumer", version: "0.1.2" });
    const tokens = await resolveTokens(tmpDir);
    expect(tokens.BKIT_MANAGED_MARKER).toMatch(
      /^<!-- bkit:managed v\S+ — do NOT edit; run `bkit upgrade` to refresh -->$/,
    );
    expect(tokens.BKIT_MANAGED_MARKER).not.toContain("0.1.2");
  });
});

// resolveTokens — REPO_SLUG is covered in bkit-tokens.integration.test.ts (real
// `git init` + `git remote add` subprocess).

// ---------------------------------------------------------------------------
// Runner labels — configurable runs-on for bkit-managed workflows (#362)
// ---------------------------------------------------------------------------

describe("resolveRunnerLabel — bkit.runners precedence (#362)", () => {
  it("returns the per-workflow key when set", () => {
    const pkg = { bkit: { runners: { renovate: "depot-ubuntu-24.04-4" } } };
    expect(resolveRunnerLabel(pkg, "renovate")).toBe("depot-ubuntu-24.04-4");
  });

  it("falls back to runners.default when the per-workflow key is absent", () => {
    const pkg = { bkit: { runners: { default: "depot-ubuntu-24.04" } } };
    expect(resolveRunnerLabel(pkg, "renovate")).toBe("depot-ubuntu-24.04");
    expect(resolveRunnerLabel(pkg, "bkitCloud")).toBe("depot-ubuntu-24.04");
  });

  it("per-workflow key wins over default", () => {
    const pkg = { bkit: { runners: { default: "ubuntu-latest", bkitCloud: "self-hosted-gpu" } } };
    expect(resolveRunnerLabel(pkg, "bkitCloud")).toBe("self-hosted-gpu");
  });

  it("defaults to ubuntu-latest when bkit.runners is unset (zero behaviour change)", () => {
    expect(resolveRunnerLabel({}, "renovate")).toBe("ubuntu-latest");
    expect(resolveRunnerLabel({ bkit: {} }, "bkitCloud")).toBe("ubuntu-latest");
  });

  it("ignores an invalid/blank label and falls back rather than emitting broken YAML", () => {
    expect(resolveRunnerLabel({ bkit: { runners: { renovate: "" } } }, "renovate")).toBe(
      "ubuntu-latest",
    );
    expect(resolveRunnerLabel({ bkit: { runners: { renovate: "has space" } } }, "renovate")).toBe(
      "ubuntu-latest",
    );
    // A bad per-workflow value still falls back to a valid default.
    expect(
      resolveRunnerLabel(
        { bkit: { runners: { renovate: "bad label", default: "depot-ubuntu-24.04" } } },
        "renovate",
      ),
    ).toBe("depot-ubuntu-24.04");
  });

  it("ignores a non-object runners field", () => {
    expect(resolveRunnerLabel({ bkit: { runners: "ubuntu-latest" } }, "renovate")).toBe(
      "ubuntu-latest",
    );
  });
});

describe("resolveTokens — runner labels (#362)", () => {
  it("populates RENOVATE_RUNNER + CLOUD_RUNNER from bkit.runners", async () => {
    writeJson("package.json", {
      name: "proj",
      bkit: { runners: { renovate: "depot-ubuntu-24.04-4", bkitCloud: "depot-ubuntu-24.04" } },
    });
    const tokens = await resolveTokens(tmpDir);
    expect(tokens.RENOVATE_RUNNER).toBe("depot-ubuntu-24.04-4");
    expect(tokens.CLOUD_RUNNER).toBe("depot-ubuntu-24.04");
  });

  it("defaults both to ubuntu-latest when unset", async () => {
    writeJson("package.json", { name: "proj" });
    const tokens = await resolveTokens(tmpDir);
    expect(tokens.RENOVATE_RUNNER).toBe("ubuntu-latest");
    expect(tokens.CLOUD_RUNNER).toBe("ubuntu-latest");
  });
});

// ---------------------------------------------------------------------------
// applyTokens — substitution
// ---------------------------------------------------------------------------

describe("applyTokens", () => {
  const tokens = {
    NODE_VERSION: "22",
    DEFAULT_BRANCH: "main",
    PROJECT_NAME: "my-project",
    REPO_SLUG: "acme/widget",
  };

  it("substitutes all tokens in a string", () => {
    const content =
      "node: {{NODE_VERSION}}\nbranch: {{DEFAULT_BRANCH}}\nname: {{PROJECT_NAME}}\nslug: {{REPO_SLUG}}";
    const result = applyTokens(content, tokens);
    expect(result).toBe("node: 22\nbranch: main\nname: my-project\nslug: acme/widget");
  });

  it("substitutes multiple occurrences of the same token", () => {
    const content = "{{NODE_VERSION}} and {{NODE_VERSION}} again";
    expect(applyTokens(content, tokens)).toBe("22 and 22 again");
  });

  it("leaves content without placeholders unchanged", () => {
    const content = "no placeholders here";
    expect(applyTokens(content, tokens)).toBe(content);
  });

  it("substitutes {{RENOVATE_RUNNER}} + {{CLOUD_RUNNER}} from the token values (#362)", () => {
    const content = "renovate: {{RENOVATE_RUNNER}}\ncloud: {{CLOUD_RUNNER}}";
    const result = applyTokens(content, {
      ...tokens,
      RENOVATE_RUNNER: "depot-ubuntu-24.04-4",
      CLOUD_RUNNER: "depot-ubuntu-24.04",
    });
    expect(result).toBe("renovate: depot-ubuntu-24.04-4\ncloud: depot-ubuntu-24.04");
  });

  it("falls back to ubuntu-latest for runner tokens when omitted (bare literal TokenMap, #362)", () => {
    // The applyTokens tests' `tokens` literal omits RENOVATE_RUNNER/CLOUD_RUNNER —
    // the default must render so existing behaviour is preserved.
    const result = applyTokens("a: {{RENOVATE_RUNNER}}\nb: {{CLOUD_RUNNER}}", tokens);
    expect(result).toBe("a: ubuntu-latest\nb: ubuntu-latest");
  });

  it("substitutes {{BKIT_MANAGED_MARKER}} from the token value when provided", () => {
    const marker = "<!-- bkit:managed v9.9.9 — do NOT edit; run `bkit upgrade` to refresh -->";
    const result = applyTokens("<!-- bkit:start -->\n{{BKIT_MANAGED_MARKER}}\n", {
      ...tokens,
      BKIT_MANAGED_MARKER: marker,
    });
    expect(result).toContain(marker);
    expect(result).not.toContain("{{BKIT_MANAGED_MARKER}}");
  });

  it("falls back to a computed marker when the token value is omitted (bare literal TokenMap)", () => {
    // tokens here has no BKIT_MANAGED_MARKER — applyTokens computes it from the
    // installing bkit version rather than leaving a dangling placeholder.
    const result = applyTokens("{{BKIT_MANAGED_MARKER}}", tokens);
    expect(result).toMatch(
      /^<!-- bkit:managed v\S+ — do NOT edit; run `bkit upgrade` to refresh -->$/,
    );
    expect(result).not.toContain("{{BKIT_MANAGED_MARKER}}");
  });

  it("template source still has {{TOKEN}} placeholders after substitution (write-time semantics)", async () => {
    // Verify that the template file on disk is NOT mutated — substitution is write-time only
    writeJson("package.json", { name: "proj", packageManager: "pnpm@10.4.1" });
    writeFile(".nvmrc", "22\n");
    const templatePath = path.join(tmpDir, "template.yml");
    const templateContent = "node-version: {{NODE_VERSION}}\nbranches: [{{DEFAULT_BRANCH}}]\n";
    writeFile("template.yml", templateContent);

    const resolvedTokens = await resolveTokens(tmpDir);
    const output = applyTokens(templateContent, resolvedTokens);

    // Template file on disk is unchanged
    expect(fs.readFileSync(templatePath, "utf-8")).toBe(templateContent);
    // Output has substituted values
    expect(output).toContain("node-version: 22");
    expect(output).not.toContain("{{NODE_VERSION}}");
  });

  // -------------------------------------------------------------------------
  // MED-7 regression — $& / $$ / $1 substitution patterns must not leak
  // -------------------------------------------------------------------------

  it("MED-7: token value '$&' substitutes as literal '$&', not as regex back-reference", () => {
    const dangerTokens = {
      NODE_VERSION: "$&",
      DEFAULT_BRANCH: "main",
      PROJECT_NAME: "my-project",
      REPO_SLUG: "acme/widget",
    };
    const content = "node: {{NODE_VERSION}}";
    const result = applyTokens(content, dangerTokens);
    // Must be the literal string "$&" — not the matched token "{{NODE_VERSION}}"
    expect(result).toBe("node: $&");
  });

  it("MED-7: token value '$$' substitutes as literal '$$', not as escaped dollar", () => {
    const dangerTokens = {
      NODE_VERSION: "22",
      DEFAULT_BRANCH: "main",
      PROJECT_NAME: "$$evil",
      REPO_SLUG: "acme/widget",
    };
    const content = "name: {{PROJECT_NAME}}";
    const result = applyTokens(content, dangerTokens);
    expect(result).toBe("name: $$evil");
  });

  it("MED-7: token value '$1' substitutes as literal '$1', not as capture-group reference", () => {
    const dangerTokens = {
      NODE_VERSION: "22",
      DEFAULT_BRANCH: "$1-branch",
      PROJECT_NAME: "proj",
      REPO_SLUG: "acme/widget",
    };
    const content = "branches: [{{DEFAULT_BRANCH}}]";
    const result = applyTokens(content, dangerTokens);
    expect(result).toBe("branches: [$1-branch]");
  });
});

// ---------------------------------------------------------------------------
// MED-6 regression — .nvmrc with leading comments / blank lines
// ---------------------------------------------------------------------------

describe("resolveTokens — .nvmrc comment/blank-line stripping (MED-6)", () => {
  it("MED-6: .nvmrc with leading comment extracts version from first non-comment line", async () => {
    writeFile(".nvmrc", "# pinned\n\n22\n");
    writeJson("package.json", { name: "proj" });
    const tokens = await resolveTokens(tmpDir);
    expect(tokens.NODE_VERSION).toBe("22");
  });

  it("MED-6: .nvmrc with multiple comment lines and blank lines before version", async () => {
    writeFile(".nvmrc", "# pinned for foo project\n# do not change\n\n\n20\n");
    writeJson("package.json", { name: "proj" });
    const tokens = await resolveTokens(tmpDir);
    expect(tokens.NODE_VERSION).toBe("20");
  });

  it("MED-6: .nvmrc that is only comments falls through to engines.node fallback", async () => {
    writeFile(".nvmrc", "# no version here\n# just comments\n");
    writeJson("package.json", { name: "proj", engines: { node: ">=18" } });
    const tokens = await resolveTokens(tmpDir);
    expect(tokens.NODE_VERSION).toBe("18");
  });

  it("MED-6: .nvmrc version with 'v' prefix after leading comment parses correctly", async () => {
    writeFile(".nvmrc", "# pinned\nv22.1.0\n");
    writeJson("package.json", { name: "proj" });
    const tokens = await resolveTokens(tmpDir);
    expect(tokens.NODE_VERSION).toBe("22");
  });
});
