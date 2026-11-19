import { describe, expect, it } from "vitest";

import { parseAuditReport } from "./audit-report";

const LEGEND = [
  "<!-- prettier-ignore -->",
  "| Severity | Use |",
  "| --- | --- |",
  "| `CRITICAL` | A cross-tenant read |",
  "| `LOW` | A header missing |",
].join("\n");

const HEAD = [
  "<!-- prettier-ignore -->",
  "| ID | Severity | Title | Location | Evidence | Expected | Key |",
  "| --- | --- | --- | --- | --- | --- | --- |",
];

/** A report whose Findings section holds the severity legend and then one finding table. */
const report = (...rows: string[]) =>
  [
    "# Security Audit",
    "",
    "## Findings",
    "",
    LEGEND,
    "",
    ...HEAD,
    ...rows,
    "",
    "## Report",
    "",
  ].join("\n");

const row = (id: string, severity: string, title: string, location: string, key: string) =>
  `| ${id} | ${severity} | ${title} | ${location} | evidence | fix | ${key} |`;

describe("parseAuditReport", () => {
  it("reads IDs, severities, titles and keys from the Findings table", () => {
    const text = report(
      row("security-1", "HIGH", "Token logged", "src/a.ts:10", "new"),
      row("security-2", "LOW", "Verbose error", "src/b.ts:2", "audit-security-verbose-error"),
    );
    const parsed = parseAuditReport(text, "security");
    expect(parsed.findings).toHaveLength(2);
    expect(parsed.findings[0]).toMatchObject({
      id: "security-1",
      severity: "HIGH",
      title: "Token logged",
      location: "src/a.ts:10",
    });
    expect(parsed.findings[0]).not.toHaveProperty("priorKey");
    expect(parsed.findings[1]).toMatchObject({
      id: "security-2",
      severity: "LOW",
      title: "Verbose error",
      location: "src/b.ts:2",
      priorKey: "audit-security-verbose-error",
    });
  });

  it("refuses a row with an unknown key, naming its ID", () => {
    const text = report(
      row("security-1", "HIGH", "Token logged", "src/a.ts:10", "new"),
      row("security-2", "LOW", "Verbose error", "src/b.ts:2", "some-other-key"),
    );
    expect(() => parseAuditReport(text, "security")).toThrow(/security-2/);
    expect(() => parseAuditReport(text, "security")).toThrow(/unknown key/);
  });

  it("refuses a row with an empty severity, naming its ID", () => {
    const text = report(
      row("security-1", "HIGH", "Token logged", "src/a.ts:10", "new"),
      row("security-2", "", "Verbose error", "src/b.ts:2", "new"),
    );
    expect(() => parseAuditReport(text, "security")).toThrow(/security-2/);
    expect(() => parseAuditReport(text, "security")).toThrow(/empty Severity/);
  });

  it("reads a row whose Evidence cell holds a backslash", () => {
    const text = report(
      "| security-1 | HIGH | Token logged | src/a.ts:10 | regex `\\d+` and a\\_b | fix | new |",
    );
    const parsed = parseAuditReport(text, "security");
    expect(parsed.findings).toHaveLength(1);
    expect(parsed.findings[0]).toMatchObject({ id: "security-1", severity: "HIGH" });
  });

  it("reads a lone short None row as no finding", () => {
    const text = report("| None |");
    expect(parseAuditReport(text, "security").findings).toEqual([]);
  });

  it("refuses a row whose Location is not path:line, naming its ID", () => {
    for (const location of ["", "—", "src/a.ts:10-20", "src/a.ts:1, src/b.ts:2", "src/a.ts"]) {
      const text = report(
        row("security-1", "HIGH", "Token logged", "src/a.ts:10", "new"),
        row("security-2", "LOW", "Verbose error", location, "new"),
      );
      expect(() => parseAuditReport(text, "security")).toThrow(/security-2/);
      expect(() => parseAuditReport(text, "security")).toThrow(/Location/);
    }
    const ok = report(row("security-1", "HIGH", "Token logged", "`src/a.ts:10`", "new"));
    expect(parseAuditReport(ok, "security").findings).toHaveLength(1);
  });
});
