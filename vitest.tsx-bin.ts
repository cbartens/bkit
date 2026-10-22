// vitest.tsx-bin.ts — the one place a test gets a tool binary it does not own.
//
// A test that needs `tsx` calls `requireTsx()`: when `node_modules/.bin/tsx` is missing the
// call throws, so the test FAILS with the fix in its message. A test that needs another
// binary (`sops`, `age-keygen`) may self-skip locally, but only through `hasTool(bin)`: it
// returns `false` when the tool is absent from PATH, and throws when `CI` is set so a lane
// that lacks the tool fails instead of skipping the same tests every run. A test never
// checks for a tool itself and never returns early without it.
import fs from "node:fs";
import path from "node:path";

const TSX_BIN = path.join(__dirname, "node_modules", ".bin", "tsx");

export function requireTsx(): string {
  if (!fs.existsSync(TSX_BIN)) {
    throw new Error(`tsx not found at ${TSX_BIN}; run pnpm install`);
  }
  return TSX_BIN;
}

function isExecutableFile(file: string): boolean {
  const st = fs.statSync(file, { throwIfNoEntry: false });
  return st !== undefined && st.isFile() && (st.mode & 0o111) !== 0;
}

export function hasTool(bin: string): boolean {
  const dirs = (process.env.PATH ?? "").split(path.delimiter).filter(Boolean);
  if (dirs.some((dir) => isExecutableFile(path.join(dir, bin)))) return true;
  if (process.env.CI === "true" || process.env.CI === "1") {
    throw new Error(`${bin} not found on PATH; the CI lane must install it`);
  }
  return false;
}
