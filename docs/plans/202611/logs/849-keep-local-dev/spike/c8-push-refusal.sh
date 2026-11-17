#!/bin/sh
# C8: `--stage=push` can tell a stale push (non-fast-forward, re-prepare) from a server
# refusal (receive-side hook such as branch protection) from git's own push report,
# in any locale. The server refusal is a real pre-receive hook in a local bare remote.
set -u
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1
export GIT_AUTHOR_NAME=p GIT_AUTHOR_EMAIL=p@x GIT_COMMITTER_NAME=p GIT_COMMITTER_EMAIL=p@x
W="$(cd "$(dirname "$0")" && pwd)/_work/c8"
rm -rf "$W"; mkdir -p "$W"; cd "$W" || exit 1
q() { "$@" >/dev/null 2>&1; }
run() { printf '$ %s\n' "$*"; "$@" 2>&1; printf '[exit %s]\n' "$?"; }

q git init -q --bare -b dev origin.git
q git clone -q origin.git a; cd a || exit 1
printf 'x\n' > x.txt; q git add .; q git commit -qm base; q git push -q origin dev
printf 'y\n' > y.txt; q git add .; q git commit -qm prepared; P=$(git rev-parse HEAD)

cat > ../origin.git/hooks/pre-receive <<'EOF'
#!/bin/sh
[ -f "$GIT_DIR/BLOCK" ] && { echo "dev is protected" >&2; exit 1; }
exit 0
EOF
chmod +x ../origin.git/hooks/pre-receive

for loc in C de_DE.UTF-8; do
  echo "=== LC_ALL=$loc: server refusal (pre-receive hook declines a fast-forward push) ==="
  touch ../origin.git/BLOCK
  LC_ALL=$loc LANG=$loc run git push --porcelain origin "$P:refs/heads/dev"
  rm -f ../origin.git/BLOCK
done

# Make the prepared commit stale: someone else advances origin/dev.
cd .. && q git clone -q -b dev origin.git b && cd b && printf 'z\n' > z.txt && q git add . && q git commit -qm other && q git push -q origin dev && cd ../a
for loc in C de_DE.UTF-8; do
  echo "=== LC_ALL=$loc: stale (origin/dev moved; push is not a fast-forward) ==="
  LC_ALL=$loc LANG=$loc run git push --porcelain origin "$P:refs/heads/dev"
done
echo "=== LC_ALL=C: stale after fetching the moved origin/dev first ==="
q git fetch -q origin
LC_ALL=C LANG=C run git push --porcelain origin "$P:refs/heads/dev"
