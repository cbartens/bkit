// vitest.tsx-bin.ts — the one place a test gets the `tsx` binary that runs the bkit CLI.
//
// A test that needs `tsx` calls `requireTsx()`: when `node_modules/.bin/tsx` is missing the
// call throws, so the test FAILS with the fix in its message. A test never checks for `tsx`
// itself and never returns early without it — a missing tool is a failure, not a pass.
import fs from "node:fs";
import path from "node:path";

const TSX_BIN = path.join(__dirname, "node_modules", ".bin", "tsx");

export function requireTsx(): string {
  if (!fs.existsSync(TSX_BIN)) {
    throw new Error(`tsx not found at ${TSX_BIN}; run pnpm install`);
  }
  return TSX_BIN;
}
