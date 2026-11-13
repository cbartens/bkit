#!/bin/sh
# Claim C12: the shipped copy-and-own pre-push hook (.bkit/templates/.husky/pre-push), run by a
# real `git push origin dev`, refuses a batch that carries code and ends on a design close
# (`docs(...): design DONE bkit [skip ci]`), and lets a batch that ends on the ship landing
# commit (`feat(...): ...`, no skip token) past its CI-suppressor guard.
# The scratch consumer resolves `pnpm -s bkit` to this checkout's dist/cli.js.
set -u
ROOT=$(git rev-parse --show-toplevel)
T=$(mktemp -d "${TMPDIR:-/tmp}/c12.XXXXXX")
git init -q --bare "$T/origin.git"
git init -q -b dev "$T/main" && cd "$T/main"
git config user.email p@x && git config user.name p
printf '{"name":"c12","private":true,"scripts":{"bkit":"node %s/dist/cli.js"}}\n' "$ROOT" > package.json
mkdir -p src && echo 'export const base = 1;' > src/base.js
git add . && git commit -qm "chore: base" && git remote add origin "$T/origin.git" && git push -q --no-verify origin dev
cp "$ROOT/.bkit/templates/.husky/pre-push" .git/hooks/pre-push && chmod +x .git/hooks/pre-push
echo 'export const a = 1;' > src/a.js && git add . && git commit -qm "feat(924-a): add feature a"
mkdir -p docs/plans/202611 && echo '# b design' > docs/plans/202611/924-b-design.md
git add . && git commit -qm "docs(924-b): design DONE bkit [skip ci]"
echo "=== shape 1: code, then a design close with [skip ci] last"
git log --format='  %h %s' origin/dev..dev
git push origin dev > "$T/push1.txt" 2>&1; echo "git push exit=$?"
grep -E 'BLOCKED|trigger commit|skip|\[pre-push\] log' "$T/push1.txt" | sed 's/^/  /'
echo "origin/dev moved: $([ "$(git -C "$T/origin.git" rev-parse dev)" = "$(git rev-parse dev)" ] && echo yes || echo no)"
echo 'export const b = 2;' > src/b.js && git add . && git commit -qm "feat(924-b): add feature b"
echo "=== shape 2: same batch, ship landing commit (no token) last"
git log --format='  %h %s' origin/dev..dev
git push origin dev > "$T/push2.txt" 2>&1; echo "git push exit=$?"
echo "  BLOCKED lines: $(grep -c 'BLOCKED' "$T/push2.txt")"
echo "  first 12 lines of hook output:"; head -n 12 "$T/push2.txt" | sed 's/^/  /'
rm -rf "$T"
