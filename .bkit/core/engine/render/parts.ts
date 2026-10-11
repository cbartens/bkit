// render/parts.ts — splice the shared hook parts into each host's hook template.
//
// A host hook template (`.bkit/core/.claude/hooks/bkit-gateguard.cjs`, …) carries only
// what differs per host: its module syntax, its payload adapter, its output envelope.
// The code every host shares lives once in `.bkit/core/hooks/` and is spliced
// in wherever a template line reads `// {{BKIT_PART <file>}}` (JS) or
// `# {{BKIT_PART <file>}}` (shell). The generated hook is plain JS / bash with no runtime
// dependency on bkit, so it works before and without `node_modules`.
//
// Every template read on the install path goes through `readTemplate`, so install,
// upgrade, `bkit check` drift and uninstall all see the generated file.

import * as fs from "node:fs";
import * as path from "node:path";

import { getHooksRoot } from "../shared/package-roots.js";

/** A whole line naming one part: `// {{BKIT_PART name}}` or `# {{BKIT_PART name}}`. */
const PART_LINE = /^[ \t]*(?:\/\/|#)[ \t]*\{\{BKIT_PART[ \t]+([A-Za-z0-9._-]+)\}\}[ \t]*$/gm;

/**
 * `content` with every part line replaced by that part's text. A part never names
 * another part. A missing part is a corrupt package: it throws.
 */
export function renderParts(content: string, partsDir: string = getHooksRoot()): string {
  return content.replace(PART_LINE, (_line, name: string) => {
    const file = path.join(partsDir, name);
    if (!fs.existsSync(file)) {
      throw new Error(`[bkit-render] hook part not found: ${file}`);
    }
    return fs.readFileSync(file, "utf-8").replace(/\n$/, "");
  });
}

/** A template file's content as install writes it, before token substitution. */
export function readTemplate(srcPath: string): string {
  return renderParts(fs.readFileSync(srcPath, "utf-8"));
}
