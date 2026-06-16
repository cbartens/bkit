// slop-scan plugin: boundary/type-suppression
//
// Flags constructs that silence the TypeScript type system at a boundary, so a
// renamed SDK field or a changed signature compiles clean and ships broken while
// the boundary test passes against the wrong shape. Two families:
//   - escape-hatch casts: the double cast (`<expr> as unknown as <T>`) and the
//     any cast (`<expr> as any`). The object-literal target form of the double
//     cast is the highest-signal shape — it is the one that shipped Fraser #122 /
//     PR #282 silently broken.
//   - compiler-suppression directives: the ts-ignore / ts-nocheck /
//     ts-expect-error pragma comments, which suppress the very error a boundary
//     test exists to surface (ts-nocheck disables a whole file).
// See docs/testing.md § "Validated means executed" for the rationale this enforces.
//
// Design notes:
//   - Zero imports. The only coupling to slop-scan is the finding object shape and
//     meta.apiVersion. apiVersion is hard-pinned (not imported) so a future engine
//     API bump fails loud at load instead of running against a mismatched contract.
//   - `delta` is intentionally omitted: slop-scan defaults to per-location matching
//     when a finding carries locations, so a pure line-shift of a pre-existing hit
//     nets to zero and only genuinely new ones register as added occurrences.
//   - Cast patterns use `\s+` (never a literal single space), and the directive
//     pattern is split by an alternation group, so this file never flags its own
//     pattern literals when the tool scans itself; a self-override in
//     slop-scan.config.json is the belt-and-suspenders second layer.
//   - Casts are comment-skipped (a cast inside a comment is inert); directives are
//     NOT comment-skipped, because they ARE comments. Casts err toward
//     under-flagging (a cast sharing a line with `//` is skipped) — a nag, not a wedge.

const DOUBLE_CAST = /\bas\s+unknown\s+as\b/g;
const ANY_CAST = /\bas\s+any\b/g;
const TS_SUPPRESS = /@ts-(ignore|expect-error|nocheck)\b/g;

const WEIGHT = {
  "object-cast": 1.5,
  "double-cast": 1,
  "any-cast": 1,
  "ts-nocheck": 2,
  "ts-ignore": 1.5,
  "ts-expect-error": 1,
};

/** Byte offsets where each line begins, for O(log n) index -> line/column. */
function buildLineStarts(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i += 1) {
    if (text.charCodeAt(i) === 10) {
      starts.push(i + 1);
    }
  }
  return starts;
}

/** Greatest line whose start is <= index (0-based line, 1-based column). */
function locate(lineStarts, index) {
  let lo = 0;
  let hi = lineStarts.length - 1;
  let line = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (lineStarts[mid] <= index) {
      line = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return { line, column: index - lineStarts[line] + 1 };
}

/** True when the match sits inside a line comment or a block/JSDoc continuation. */
function isCommented(lineText, column) {
  const before = lineText.slice(0, column - 1);
  if (before.includes("//")) {
    return true;
  }
  const trimmed = lineText.trimStart();
  return trimmed.startsWith("*") || trimmed.startsWith("/*");
}

/** True when the first non-whitespace char after the cast is `{` (object-literal target). */
function targetsObjectLiteral(text, endIndex) {
  let i = endIndex;
  while (i < text.length && /\s/.test(text[i])) {
    i += 1;
  }
  return text[i] === "{";
}

function collectMatches(text, regex, classify) {
  const out = [];
  regex.lastIndex = 0;
  let match = regex.exec(text);
  while (match !== null) {
    out.push({ index: match.index, kind: classify(text, regex.lastIndex, match) });
    match = regex.exec(text);
  }
  return out;
}

export default {
  meta: {
    name: "slop-scan-plugin-boundary",
    namespace: "boundary",
    // Hard-pinned (not imported) so an engine API change fails loud at load.
    apiVersion: 1,
  },
  rules: {
    "type-suppression": {
      id: "boundary/type-suppression",
      family: "boundary",
      severity: "medium",
      scope: "file",
      requires: ["file.text"],
      supports(context) {
        return context.scope === "file" && Boolean(context.file);
      },
      evaluate(context) {
        const file = context.file;
        const text = context.runtime.store.getFileFact(file.path, "file.text") ?? "";
        if (text.length === 0) {
          return [];
        }

        const options = context.ruleConfig?.options ?? {};
        const objectShapeOnly = options.objectShapeOnly === true;
        const includeAnyCast = options.includeAnyCast !== false;
        const includeTsSuppress = options.includeTsSuppress !== false;

        // Casts — comment-skipped (a cast inside a comment is inert).
        const doubles = collectMatches(text, DOUBLE_CAST, (t, end) =>
          targetsObjectLiteral(t, end) ? "object-cast" : "double-cast",
        );
        const anys =
          !objectShapeOnly && includeAnyCast
            ? collectMatches(text, ANY_CAST, () => "any-cast")
            : [];
        const castMatches = [...doubles, ...anys].filter((m) =>
          objectShapeOnly ? m.kind === "object-cast" : true,
        );

        // Suppression directives — NOT comment-skipped (they are comments).
        const directiveMatches =
          !objectShapeOnly && includeTsSuppress
            ? collectMatches(text, TS_SUPPRESS, (_t, _end, match) => `ts-${match[1]}`)
            : [];

        if (castMatches.length === 0 && directiveMatches.length === 0) {
          return [];
        }

        const lineStarts = buildLineStarts(text);
        const lines = text.split("\n");
        const toHit = (m, skipComments) => {
          const { line, column } = locate(lineStarts, m.index);
          const lineText = lines[line] ?? "";
          if (skipComments && isCommented(lineText, column)) {
            return null;
          }
          return { kind: m.kind, line: line + 1, column, snippet: lineText.trim().slice(0, 120) };
        };

        const hits = [
          ...castMatches.map((m) => toHit(m, true)),
          ...directiveMatches.map((m) => toHit(m, false)),
        ].filter(Boolean);
        if (hits.length === 0) {
          return [];
        }

        hits.sort((a, b) => a.line - b.line || a.column - b.column);
        const score = Math.min(
          10,
          hits.reduce((total, h) => total + (WEIGHT[h.kind] ?? 1), 0),
        );

        return [
          {
            ruleId: "boundary/type-suppression",
            family: "boundary",
            severity: "medium",
            scope: "file",
            path: file.path,
            message: `Found ${hits.length} boundary type-suppression${hits.length === 1 ? "" : "s"} (unsafe cast / ts-suppress directive); assert a real boundary signal — see docs/testing.md § "Validated means executed"`,
            evidence: hits.map((h) => `line ${h.line}: ${h.kind} — ${h.snippet}`),
            score,
            locations: hits.map((h) => ({ path: file.path, line: h.line, column: h.column })),
          },
        ];
      },
    },
  },
  configs: {
    recommended: {
      rules: {
        "boundary/type-suppression": { enabled: true },
      },
    },
  },
};
