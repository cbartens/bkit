#!/bin/sh
# Claim C6 (rejected alternative): `git push . HEAD:dev` from a scratch worktree into a main
# checkout on dev is refused when the main checkout has ANY uncommitted edit (even on an
# unrelated path) under receive.denyCurrentBranch=updateInstead, and without it the refusal
# text is what git prints for a checked-out branch.
set -u
T=$(mktemp -d "${TMPDIR:-/tmp}/c6.XXXXXX")
git init -q -b dev "$T/main" && cd "$T/main"
git config user.email p@x && git config user.name p
printf 'a\n' > landed.txt && printf 'u\n' > unrelated.txt && git add . && git commit -qm base && DEV_AT=$(git rev-parse HEAD)
git worktree add -q --detach "$T/land" "$DEV_AT"
(cd "$T/land" && echo new > g && git add g && git -c user.email=p@x -c user.name=p commit -qm landing)
printf 'u\nowner-edit\n' > unrelated.txt
echo "case A: default receive.denyCurrentBranch, dirty unrelated file"
git -C "$T/land" push "$T/main" HEAD:dev 2>&1; echo "push exit=$?"
echo "case B: receive.denyCurrentBranch=updateInstead, dirty unrelated file"
git config receive.denyCurrentBranch updateInstead
git -C "$T/land" push "$T/main" HEAD:dev 2>&1; echo "push exit=$?"
echo "dev = DEV_AT: $([ "$(git rev-parse dev)" = "$DEV_AT" ] && echo yes || echo no)"
rm -rf "$T"
