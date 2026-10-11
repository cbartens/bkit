// audits/repo/dogfood-noop.test.ts — the repo's own adopted copies are byte-identical to their
// templates as install renders them.

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { getPkgRoot } from "../../shared/package-roots";
import { applyTokens } from "../../install/placeholders";

describe("dogfood-noop", () => {
  // ---------------------------------------------------------------------------
  // Dogfood byte-identity — `scripts/slop`
  // ---------------------------------------------------------------------------
  //
  // Consumers copy the slop-scan plugin from `.bkit/templates/scripts/slop/`; the
  // repo's own `scripts/slop/` copy is the dogfood mirror, so every shipped script
  // must equal its template as install renders it.

  describe("dogfood byte-identity — scripts/slop", () => {
    const pkgRoot = getPkgRoot();
    const shipped = fs.readdirSync(path.join(pkgRoot, ".bkit/templates/scripts/slop")).sort();

    it("ships at least one script", () => {
      expect(shipped.length).toBeGreaterThan(0);
    });

    it.each(shipped)("%s: root copy === rendered template copy", (name) => {
      const root = path.join(pkgRoot, "scripts/slop", name);
      const tmpl = path.join(pkgRoot, ".bkit/templates/scripts/slop", name);
      expect(fs.existsSync(root)).toBe(true);
      const tokens = { DEFAULT_BRANCH: "", PROJECT_NAME: "", REPO_SLUG: "" };
      expect(fs.readFileSync(root, "utf-8")).toBe(
        applyTokens(fs.readFileSync(tmpl, "utf-8"), tokens),
      );
    });
  });
});
