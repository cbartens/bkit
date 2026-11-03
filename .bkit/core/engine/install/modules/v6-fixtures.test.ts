import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SHIPPED_CI_SCRIPT_HASHES, SHIPPED_HOUSE_RULE_HASHES } from "./core.js";

const DIR = path.join(import.meta.dirname, "__fixtures__", "v6.0.0");
const sha = (rel: string): string =>
  createHash("sha256")
    .update(fs.readFileSync(path.join(DIR, `${rel}.fixture`)))
    .digest("hex");

describe("v6.0.0 fixtures are genuine shipped bytes", () => {
  it.each([
    "check-capstone.mjs",
    "check-capstone.test.mjs",
    "check-dependency-audit.mjs",
    "check-dependency-audit.test.mjs",
  ])("scripts/ci/%s hashes into SHIPPED_CI_SCRIPT_HASHES", (file) => {
    expect(SHIPPED_CI_SCRIPT_HASHES[`scripts/ci/${file}`]).toContain(sha(`scripts/ci/${file}`));
  });

  it.each(["Filler", "Hedging", "LLMSlop", "Verbose"])(
    "House/%s.yml hashes into SHIPPED_HOUSE_RULE_HASHES",
    (rule) => {
      expect(SHIPPED_HOUSE_RULE_HASHES[rule]).toContain(sha(`.vale/styles/House/${rule}.yml`));
    },
  );
});
