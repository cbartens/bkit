// Claim 7 probe: node:sqlite opens with FTS5 on the Node 24 builds bkit allows, and what it
// prints to stderr on import. Also captures the error a missing module raises, so the
// fallback can key on it. Usage: <node> c7-sqlite-fts5.mjs   (stderr captured by the caller)
const { DatabaseSync } = await import("node:sqlite");
console.log(
  `node=${process.version} sqlite=${process.versions.sqlite} node_shared_sqlite=${process.config.variables.node_shared_sqlite} platform=${process.platform}/${process.arch}`,
);
const db = new DatabaseSync(":memory:");
db.exec("CREATE VIRTUAL TABLE t USING fts5(summary, body)");
db.prepare("INSERT INTO t VALUES (?, ?)").run("stub union keeps appended rows", "merge=union");
const hit = db
  .prepare("SELECT summary, bm25(t, 10.0, 1.0) AS s FROM t WHERE t MATCH ?")
  .all('"union" OR "nothing"');
console.log(`fts5=ok rows=${hit.length} bm25=${typeof hit[0]?.s}`);
try {
  db.exec("CREATE VIRTUAL TABLE u USING fts9(x)");
  console.log("missing-module probe: no error (unexpected)");
} catch (e) {
  if (!String(e?.message).includes("no such module")) throw e;
  console.log(
    `missing-module error: code=${e?.code} errcode=${e?.errcode} errstr=${e?.errstr} message=${e?.message}`,
  );
}
