#!/bin/sh
# C2 probe setup: a scratch consumer repo with a local bare origin, branch dev,
# one source file with a known bug, a bkit:gate:changed and bkit:test:file
# script, tracker none. Nothing outside $S is written.
set -e
S={REPO}/tmp/260/review/spike/c2
rm -rf "$S"; mkdir -p "$S"
git init -q --bare -b dev "$S/origin.git"
git init -q -b dev "$S/consumer"
cd "$S/consumer"
git config user.email spike@example.invalid; git config user.name spike
mkdir -p src test scripts
# bkit:test:file contract (.bkit/workflows.md): run the one file appended as the
# argument and write a JUnit report to $BKIT_TEST_REPORT.
cat > scripts/test-file.sh <<'SH'
#!/bin/sh
exec node --test --test-reporter=spec --test-reporter-destination=stdout --test-reporter=junit --test-reporter-destination="$BKIT_TEST_REPORT" "$@"
SH
# bkit:gate:changed contract: check the files passed as arguments (here: any
# changed source or test file runs the whole test dir, a superset of the tests
# that import it); nothing relevant changed -> exit 0; JUnit into
# $BKIT_TEST_REPORT_DIR when set.
cat > scripts/gate-changed.sh <<'SH'
#!/bin/sh
hit=0
for f in "$@"; do case $f in src/*.js|test/*.test.js) hit=1 ;; esac; done
[ "$hit" -eq 0 ] && { echo "no source or test file changed"; exit 0; }
if [ -n "$BKIT_TEST_REPORT_DIR" ]; then
  exec node --test --test-reporter=spec --test-reporter-destination=stdout --test-reporter=junit --test-reporter-destination="$BKIT_TEST_REPORT_DIR/node.xml" test/*.test.js
fi
exec node --test test/*.test.js
SH
cat > package.json <<'JSON'
{
  "name": "spike-consumer",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "bkit:gate:changed": "sh scripts/gate-changed.sh",
    "bkit:gate:static-unit": "node --test test/*.test.js",
    "bkit:test:file": "sh scripts/test-file.sh"
  },
  "bkit": {
    "tracker": { "default": "none" },
    "worktrees": { "install": false }
  }
}
JSON
cat > src/add.js <<'JS'
export function add(a, b) {
  return a - b;
}
JS
cat > test/smoke.test.js <<'JS'
import { test } from "node:test";
import assert from "node:assert/strict";
test("smoke", () => assert.equal(1, 1));
JS
printf 'node_modules/\ntmp/\n' > .gitignore
git add -A; git commit -q -m "init"
git remote add origin "$S/origin.git"
git push -q -u origin dev
mkdir -p node_modules/.bin
ln -s {REPO}/dist/cli.js node_modules/.bin/bkit
echo "setup ok: $(git rev-parse --short HEAD) on $(git branch --show-current); origin/dev=$(git rev-parse --short origin/dev)"
