#!/usr/bin/env bats
# roadmap-fold.bats — #380 Sub-plan 1 Task 3.
# Derived Test Matrix rows 1-6, 19, 23, 25 (docs/plans/202607/380-roadmap-analysis-refresh-plan-1.md).
#
# Boundary: real jq + real fs — no mocks. Sources the shipped template copy
# directly (mirrors tests/route-state.bats's REPO_ROOT convention).

REPO_ROOT="$(cd "$(dirname "$BATS_TEST_FILENAME")/.." && pwd)"
ROADMAP_FOLD_SH="${BKIT_ROADMAP_FOLD_SH:-$REPO_ROOT/.bkit/templates/.bkit/scripts/bkit-roadmap-fold.sh}"

setup() {
  TMPD="$(mktemp -d)"
  mkdir -p "$TMPD/docs"
}

teardown() {
  rm -rf "$TMPD"
}

# row 5 — bootstrap: absent roadmap.md -> created with two markers + banner + Backlog
@test "row 5: bootstrap creates docs/roadmap.md with both marker blocks + Backlog region" {
  run bash -c ". '$ROADMAP_FOLD_SH'; bkit_roadmap_fold '$TMPD'"
  [ "$status" -eq 0 ]
  [ -f "$TMPD/docs/roadmap.md" ]
  grep -qF '<!-- bkit:roadmap-status start -->' "$TMPD/docs/roadmap.md"
  grep -qF '<!-- bkit:roadmap-status end -->' "$TMPD/docs/roadmap.md"
  grep -qF '<!-- bkit:roadmap-analysis start -->' "$TMPD/docs/roadmap.md"
  grep -qF '<!-- bkit:roadmap-analysis end -->' "$TMPD/docs/roadmap.md"
  grep -qF '## Backlog / Ideas' "$TMPD/docs/roadmap.md"
}

# row 1 — projects the phase-sectioned board under tracker:none (no MCP call
# attempted by the shell layer at all — this script never calls a tracker).
@test "row 1: projects each FID under its folded latest status (tracker:none)" {
  cat > "$TMPD/docs/roadmap.jsonl" <<'EOF'
{"ts":1,"kind":"feature","repo":"x/y","bkitVersion":"1","workflow":"design","step":"s","key":"412-export-csv","category":"correctness","summary":"CSV export","description":"d","status":"DESIGNED"}
EOF
  run bash -c ". '$ROADMAP_FOLD_SH'; bkit_roadmap_fold '$TMPD'"
  [ "$status" -eq 0 ]
  run grep -A5 '### Design' "$TMPD/docs/roadmap.md"
  [[ "$output" == *"412-export-csv"* ]]
}

# row 2 — deterministic + idempotent full regenerate: two consecutive folds
# over the SAME ledger produce byte-identical marker-block content, and a
# BUILT row written by build is still projected after a later plan-close fold.
@test "row 2: deterministic + idempotent regenerate; a BUILT row survives a later regenerate" {
  cat > "$TMPD/docs/roadmap.jsonl" <<'EOF'
{"ts":1,"kind":"feature","repo":"x/y","bkitVersion":"1","workflow":"design","step":"s","key":"412-export-csv","category":"correctness","summary":"CSV export","description":"d","status":"DESIGNED"}
{"ts":2,"kind":"feature","repo":"x/y","bkitVersion":"1","workflow":"build","step":"s","key":"412-export-csv","category":"correctness","summary":"CSV export","description":"d","status":"BUILT"}
EOF
  bash -c ". '$ROADMAP_FOLD_SH'; bkit_roadmap_fold '$TMPD'"
  cp "$TMPD/docs/roadmap.md" "$TMPD/roadmap-1.md"
  bash -c ". '$ROADMAP_FOLD_SH'; bkit_roadmap_fold '$TMPD'"
  diff "$TMPD/roadmap-1.md" "$TMPD/docs/roadmap.md"

  # append a plan-close row for a DIFFERENT FID; the earlier BUILT row must survive
  echo '{"ts":3,"kind":"feature","repo":"x/y","bkitVersion":"1","workflow":"plan","step":"s","key":"418-rate-limit","category":"infra","summary":"rate limit","description":"d","status":"PLANNED"}' >> "$TMPD/docs/roadmap.jsonl"
  bash -c ". '$ROADMAP_FOLD_SH'; bkit_roadmap_fold '$TMPD'"
  run grep -A5 '### Build' "$TMPD/docs/roadmap.md"
  [[ "$output" == *"412-export-csv"* ]]
}

# row 3 — SHIPPED leaves active sections for ## Shipped; ABANDONED hidden from
# every section; a same-key append moves a FID between sections.
@test "row 3: SHIPPED projects to Shipped section; ABANDONED hidden everywhere; same-key append moves sections" {
  cat > "$TMPD/docs/roadmap.jsonl" <<'EOF'
{"ts":1,"kind":"feature","repo":"x/y","bkitVersion":"1","workflow":"design","step":"s","key":"401-login","category":"security","summary":"login","description":"d","status":"DESIGNED"}
{"ts":2,"kind":"feature","repo":"x/y","bkitVersion":"1","workflow":"ship","step":"s","key":"401-login","category":"security","summary":"login","description":"d","status":"SHIPPED"}
{"ts":3,"kind":"feature","repo":"x/y","bkitVersion":"1","workflow":"design","step":"s","key":"402-dropped","category":"other","summary":"dropped","description":"d","status":"DESIGNED"}
{"ts":4,"kind":"feature","repo":"x/y","bkitVersion":"1","workflow":"design","step":"s","key":"402-dropped","category":"other","summary":"dropped","description":"d","status":"ABANDONED"}
EOF
  run bash -c ". '$ROADMAP_FOLD_SH'; bkit_roadmap_fold '$TMPD'"
  [ "$status" -eq 0 ]
  ! grep -q '401-login' <(sed -n '/### Design/,/### Plan/p' "$TMPD/docs/roadmap.md")
  grep -A5 '### Shipped' "$TMPD/docs/roadmap.md" | grep -q '401-login'
  ! grep -q '402-dropped' "$TMPD/docs/roadmap.md"
}

# row 4 — fail-open: malformed/empty input + absent tracker -> exit 0 + [bkit-roadmap] stderr, board never blank.
@test "row 4: fail-open on malformed ledger — exit 0, [bkit-roadmap] stderr, board never blank" {
  printf 'not json at all\n' > "$TMPD/docs/roadmap.jsonl"
  run bash -c ". '$ROADMAP_FOLD_SH'; bkit_roadmap_fold '$TMPD' 2>&1"
  [ "$status" -eq 0 ]
  [ -f "$TMPD/docs/roadmap.md" ]
  grep -qF '<!-- bkit:roadmap-status start -->' "$TMPD/docs/roadmap.md"
}

@test "row 4b: absent ledger -> exit 0, board bootstrapped (never blocked)" {
  run bash -c ". '$ROADMAP_FOLD_SH'; bkit_roadmap_fold '$TMPD' 2>&1"
  [ "$status" -eq 0 ]
  [[ "$output" == *"[bkit-roadmap]"* ]]
}

# row 6 — marker-pair invariant: consumer text above the status block, between
# the two marker blocks, and below the last marker all survive a regenerate
# byte-unchanged.
@test "row 6: consumer text above/between/below marker blocks survives a regenerate byte-unchanged" {
  bash -c ". '$ROADMAP_FOLD_SH'; bkit_roadmap_fold '$TMPD'"
  sed -i.orig '1i\
SCRATCH-ABOVE
' "$TMPD/docs/roadmap.md"
  printf '\nSCRATCH-BELOW\n' >> "$TMPD/docs/roadmap.md"

  echo '{"ts":1,"kind":"feature","repo":"x/y","bkitVersion":"1","workflow":"design","step":"s","key":"412-export-csv","category":"correctness","summary":"CSV export","description":"d","status":"DESIGNED"}' > "$TMPD/docs/roadmap.jsonl"
  bash -c ". '$ROADMAP_FOLD_SH'; bkit_roadmap_fold '$TMPD'"

  grep -qF 'SCRATCH-ABOVE' "$TMPD/docs/roadmap.md"
  grep -qF 'SCRATCH-BELOW' "$TMPD/docs/roadmap.md"
  grep -qF '## Backlog / Ideas' "$TMPD/docs/roadmap.md"
}

# row 19 — a merge=union collision duplicating ledger LINES still projects
# exactly one board row per FID; a deleted roadmap.md is rebuilt byte-identically.
@test "row 19: duplicate ledger lines fold to one board row; a deleted roadmap.md rebuilds identically" {
  cat > "$TMPD/docs/roadmap.jsonl" <<'EOF'
{"ts":2,"kind":"feature","repo":"x/y","bkitVersion":"1","workflow":"build","step":"s","key":"412-export-csv","category":"correctness","summary":"CSV export","description":"d","status":"BUILT"}
{"ts":2,"kind":"feature","repo":"x/y","bkitVersion":"1","workflow":"build","step":"s","key":"412-export-csv","category":"correctness","summary":"CSV export","description":"d","status":"BUILT"}
EOF
  bash -c ". '$ROADMAP_FOLD_SH'; bkit_roadmap_fold '$TMPD'"
  run grep -c '412-export-csv' "$TMPD/docs/roadmap.md"
  [ "$output" -eq 1 ]

  cp "$TMPD/docs/roadmap.md" "$TMPD/before-delete.md"
  rm "$TMPD/docs/roadmap.md"
  bash -c ". '$ROADMAP_FOLD_SH'; bkit_roadmap_fold '$TMPD'"
  # Rebuilt board's marker-status content matches (banner text is identical too
  # since there was no prior consumer scratchpad to lose).
  diff "$TMPD/before-delete.md" "$TMPD/docs/roadmap.md"
}

# row 23 — Shipped caps at last 10 by ts desc; a FID mid-ship (BUILT, no
# SHIPPED row) stays in its active section.
@test "row 23: Shipped section caps at 10 (ts desc); mid-ship FID stays in its active section" {
  {
    for i in $(seq 1 11); do
      printf '{"ts":%d,"kind":"feature","repo":"x/y","bkitVersion":"1","workflow":"ship","step":"s","key":"fid-%02d","category":"other","description":"d","status":"SHIPPED"}\n' "$i" "$i"
    done
    echo '{"ts":100,"kind":"feature","repo":"x/y","bkitVersion":"1","workflow":"build","step":"s","key":"still-building","category":"other","description":"d","status":"BUILT"}'
  } > "$TMPD/docs/roadmap.jsonl"
  bash -c ". '$ROADMAP_FOLD_SH'; bkit_roadmap_fold '$TMPD'"
  run grep -c 'fid-' "$TMPD/docs/roadmap.md"
  [ "$output" -eq 10 ]
  ! grep -q 'fid-01' <(sed -n '/### Shipped/,$p' "$TMPD/docs/roadmap.md")
  grep -A5 '### Build' "$TMPD/docs/roadmap.md" | grep -q 'still-building'
}

# Shipped ranks on `shippedAt` when present, `ts` otherwise, so a row appended
# today for work that shipped long ago cannot evict genuinely recent ships.
@test "Shipped ranks on shippedAt with a ts fallback; a backfill does not evict recent ships" {
  {
    # Ten historic features, backfilled NOW (high ts) but carrying their real
    # ship dates (low shippedAt).
    for i in $(seq 1 10); do
      printf '{"ts":900%02d,"shippedAt":%d,"kind":"feature","repo":"x/y","bkitVersion":"1","workflow":"migrate","step":"s","key":"old-%02d","category":"other","description":"d","status":"SHIPPED"}\n' "$i" "$i" "$i"
    done
    # A genuine recent ship: lower ts than the backfill, no shippedAt.
    echo '{"ts":50000,"kind":"feature","repo":"x/y","bkitVersion":"1","workflow":"ship","step":"s","key":"really-recent","category":"other","description":"d","status":"SHIPPED"}'
  } > "$TMPD/docs/roadmap.jsonl"
  bash -c ". '$ROADMAP_FOLD_SH'; bkit_roadmap_fold '$TMPD'"
  SHIPPED="$(sed -n '/### Shipped/,$p' "$TMPD/docs/roadmap.md")"
  # Survives the cap of 10 despite its ts being the lowest of the eleven.
  echo "$SHIPPED" | grep -q 'really-recent'
  # It outranks every backfilled row, so it is the first data line of the table.
  [ "$(echo "$SHIPPED" | grep -o 'really-recent\|old-[0-9][0-9]' | head -1)" = "really-recent" ]
  # The oldest backfilled row is the one the cap drops.
  ! echo "$SHIPPED" | grep -q 'old-01'
  # The rendered ts column shows the real ship date, not the append time.
  echo "$SHIPPED" | grep -q '| 10 |'
}

# row 25 — self-heal repair of a missing/mangled marker pair re-emits the
# markers WITHOUT swallowing adjacent consumer text.
@test "row 25: self-heal a mangled marker pair without swallowing adjacent consumer text" {
  cat > "$TMPD/docs/roadmap.md" <<'EOF'
# Roadmap

CONSUMER PARAGRAPH THAT MUST SURVIVE

<!-- bkit:roadmap-status start -->
stale content, end marker missing (mangled)
EOF
  echo '{"ts":1,"kind":"feature","repo":"x/y","bkitVersion":"1","workflow":"design","step":"s","key":"412-export-csv","category":"correctness","summary":"CSV export","description":"d","status":"DESIGNED"}' > "$TMPD/docs/roadmap.jsonl"

  run bash -c ". '$ROADMAP_FOLD_SH'; bkit_roadmap_fold '$TMPD' 2>&1"
  [ "$status" -eq 0 ]
  grep -qF 'CONSUMER PARAGRAPH THAT MUST SURVIVE' "$TMPD/docs/roadmap.md"
  grep -qF 'stale content, end marker missing (mangled)' "$TMPD/docs/roadmap.md"
  grep -qF '412-export-csv' "$TMPD/docs/roadmap.md"
  [[ "$output" == *"[bkit-roadmap]"* ]]
}

@test "row 26: first bootstrap over a hand-authored board preserves its content under Backlog / Ideas" {
  cat > "$TMPD/docs/roadmap.md" <<'EOF'
# My Own Roadmap

- ship the billing rewrite
- decide on the queue vendor
EOF
  echo '{"ts":1,"kind":"feature","repo":"x/y","bkitVersion":"1","workflow":"design","step":"s","key":"412-export-csv","category":"correctness","summary":"CSV export","description":"d","status":"DESIGNED"}' > "$TMPD/docs/roadmap.jsonl"

  run bash -c ". '$ROADMAP_FOLD_SH'; bkit_roadmap_fold '$TMPD' 2>&1"
  [ "$status" -eq 0 ]
  # the consumer's own text survives, and lands in the never-regenerated region
  grep -qF 'ship the billing rewrite' "$TMPD/docs/roadmap.md"
  grep -qF 'decide on the queue vendor' "$TMPD/docs/roadmap.md"
  [ "$(grep -n '## Backlog / Ideas' "$TMPD/docs/roadmap.md" | cut -d: -f1)" \
    -lt "$(grep -n 'ship the billing rewrite' "$TMPD/docs/roadmap.md" | cut -d: -f1)" ]
  # and the full scaffold is written around it
  grep -qF '<!-- bkit:roadmap-status start -->' "$TMPD/docs/roadmap.md"
  grep -qF '<!-- bkit:roadmap-analysis start -->' "$TMPD/docs/roadmap.md"
  grep -qF '412-export-csv' "$TMPD/docs/roadmap.md"
  [[ "$output" == *"preserved under"* ]]
}

@test "row 27: a board that already carries markers is NOT re-bootstrapped" {
  cat > "$TMPD/docs/roadmap.md" <<'EOF'
# Roadmap

<!-- bkit:roadmap-status start -->
old board
<!-- bkit:roadmap-status end -->

## Backlog / Ideas

consumer note
EOF
  echo '{"ts":1,"kind":"feature","repo":"x/y","bkitVersion":"1","workflow":"design","step":"s","key":"412-export-csv","category":"correctness","summary":"CSV export","description":"d","status":"DESIGNED"}' > "$TMPD/docs/roadmap.jsonl"

  run bash -c ". '$ROADMAP_FOLD_SH'; bkit_roadmap_fold '$TMPD' 2>&1"
  [ "$status" -eq 0 ]
  [[ "$output" != *"bootstrapping docs/roadmap.md"* ]]
  grep -qF 'consumer note' "$TMPD/docs/roadmap.md"
  grep -qF '412-export-csv' "$TMPD/docs/roadmap.md"
  [ "$(grep -c '## Backlog / Ideas' "$TMPD/docs/roadmap.md")" -eq 1 ]
}
