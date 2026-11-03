// Claim 7b probe: the design's option A, an in-process filter installed before importing
// node:sqlite, silences the SQLite ExperimentalWarning and only that warning.
// Usage: <node> c7b-warning-filter.mjs   (stderr captured by the caller)
const original = process.emitWarning;
process.emitWarning = function (warning, ...rest) {
  const type = typeof rest[0] === "string" ? rest[0] : rest[0]?.type;
  const text = typeof warning === "string" ? warning : warning?.message;
  if (type === "ExperimentalWarning" && /^SQLite is an experimental feature/.test(String(text)))
    return;
  return original.call(process, warning, ...rest);
};
const { DatabaseSync } = await import("node:sqlite");
new DatabaseSync(":memory:").exec("CREATE VIRTUAL TABLE t USING fts5(x)");
process.emitWarning("an unrelated warning still prints", "ExperimentalWarning");
console.log(`node=${process.version} imported node:sqlite with filter installed`);
