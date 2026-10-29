#!/usr/bin/env bash
# C2: the design's widened YAML FID regex accepts every tracker's FID incl. Jira digit keys at both YAML
# site shapes ([[ =~ ]] guards and the `dev` commit-scope `grep -oE`), where today's regex rejects them;
# and the design string equals the engine FID_PATTERNS.any.
# Host mode prints the engine pattern; `inner` mode runs in ubuntu:24.04 (runner bash + GNU grep).
set -u
NEW='^([0-9]+|[a-z][a-z0-9]*-[0-9]+)-[a-z0-9-]+$'
OLD='^([0-9]+|[a-z]+-[0-9]+)-[a-z0-9-]+$'
NEW_SCOPE='^\w+\((([0-9]+|[a-z][a-z0-9]*-[0-9]+)-[a-z0-9-]+)\):'
OLD_SCOPE='^\w+\((([0-9]+|[a-z]+-[0-9]+)-[a-z0-9-]+)\):'
if [ "${1:-}" = inner ]; then
  echo "bash=$BASH_VERSION grep=$(grep --version | head -1)"
  for f in 719-cloud-variants-add eng-42-some-slug ab2-12-some-slug proj-7-x feat-no-number Ab2-12-x 12; do
    n=no; o=no
    [[ $f =~ $NEW ]] && n=yes
    [[ $f =~ $OLD ]] && o=yes
    ns=$(printf 'feat(%s): msg\n' "$f" | grep -oE "$NEW_SCOPE" | sed -E 's/^\w+\(([^)]+)\):/\1/' | head -1 || true)
    os=$(printf 'feat(%s): msg\n' "$f" | grep -oE "$OLD_SCOPE" | sed -E 's/^\w+\(([^)]+)\):/\1/' | head -1 || true)
    printf '%-24s guard new=%-3s old=%-3s | scope new=%-24s old=%s\n' "$f" "$n" "$o" "${ns:-<none>}" "${os:-<none>}"
  done
  exit 0
fi
REPO=/Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
ENGINE=$(cd "$REPO" && node --input-type=module -e "import('./dist/commands/workflow/fids.js').then(m=>console.log(m.FID_PATTERNS.any.source))")
echo "engine any = $ENGINE"
echo "design new = $NEW"
[ "$ENGINE" = "$NEW" ] && echo "MATCH engine==design" || echo "DIFFER engine!=design"
SELF=$(cd "$(dirname "$0")" && pwd)/$(basename "$0")
docker run --rm -v "$SELF:/probe.sh:ro" ubuntu:24.04 bash /probe.sh inner
echo "docker exit=$?"
