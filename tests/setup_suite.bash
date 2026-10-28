# tests/setup_suite.bash — runs once around every bats run: `bats tests/*.bats` picks it up
# from the directory of the test files.
#
# `.husky/pre-push` runs this tier, and a git hook exports GIT_DIR to every process it starts.
# From a linked worktree that is <main>/.git/worktrees/<name>, and it beats a test's cwd and
# `-C`: `git -C "$tmp" init -q` re-initialises the repo the push came from and writes
# core.bare=true into the main checkout's shared `.git/config`, and a fixture's
# `git config user.email` lands there too. setup_suite clears every GIT_* variable first.
#
# user.name / user.email / core.bare / core.worktree of the repo bats runs from are read before
# the run and after it. A change fails the run (teardown_suite), prints both values, and puts
# the old values back.

BKIT_GUARDED_KEYS="user.name user.email core.bare core.worktree"
BKIT_GUARDED_PATTERN='^(user\.(name|email)|core\.(bare|worktree))$'

setup_suite() {
  local var common
  for var in $(compgen -e); do
    case "$var" in GIT_*) unset "$var" ;; esac
  done
  BKIT_REPO_CONFIG=""
  BKIT_REPO_CONFIG_BEFORE=""
  if common=$(git rev-parse --path-format=absolute --git-common-dir 2>/dev/null); then
    BKIT_REPO_CONFIG="$common/config"
    BKIT_REPO_CONFIG_BEFORE=$(git config --file "$BKIT_REPO_CONFIG" --get-regexp "$BKIT_GUARDED_PATTERN")
  fi
}

teardown_suite() {
  local after key value
  [ -n "$BKIT_REPO_CONFIG" ] || return 0
  after=$(git config --file "$BKIT_REPO_CONFIG" --get-regexp "$BKIT_GUARDED_PATTERN")
  [ "$after" = "$BKIT_REPO_CONFIG_BEFORE" ] && return 0
  for key in $BKIT_GUARDED_KEYS; do
    git config --file "$BKIT_REPO_CONFIG" --unset-all "$key" || :
  done
  while read -r key value; do
    [ -n "$key" ] && git config --file "$BKIT_REPO_CONFIG" --add "$key" "$value"
  done <<<"$BKIT_REPO_CONFIG_BEFORE"
  {
    echo "A bats test changed the git config of the repo the tests run from ($BKIT_REPO_CONFIG)."
    echo "Before the run:"
    echo "${BKIT_REPO_CONFIG_BEFORE:-  (none of $BKIT_GUARDED_KEYS set)}"
    echo "After the run:"
    echo "${after:-  (none of $BKIT_GUARDED_KEYS set)}"
    echo "The old values are back. A git command in a test reached this repo instead of its temp"
    echo "dir: a cwd or -C path outside the temp dir, or a GIT_* variable the test set itself."
  } >&2
  return 1
}
