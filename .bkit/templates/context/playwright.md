<!-- Example. Copy into the repo and own it. -->
<!-- bkit install does not write this file and does not overwrite a copy. -->

# Playwright on GitHub Actions — e2e report

Fits: a web e2e lane that runs Playwright on GitHub Actions and uploads its report with `actions/upload-artifact`. `context=e2e`: downloads the failing run's report artifact and inlines its text files, failing specs first; lists screenshots, videos and traces by path.

- Secret: `GH_TOKEN` in cloud (local `gh auth login` works too).
- Non-secret: `E2E_ARTIFACT` (your upload-artifact name, default `playwright-report`) and `E2E_JOB_RE` (anchored regex for this lane's job name). Edit the defaults in the block.
- CLI: `gh` — base tooling, no provision block.
- Domains: none beyond bkit's derived set (`github.com`).
- One block per lane. A lane whose evidence does not reach GitHub (a native lane on Expo EAS) needs its own block: see `maestro-ios.md` and `expo-workflows.md`.

Copy the block below into `.agents/context.md`, below `<!-- bkit:end -->`.

<!-- context-fetch:start playwright context=e2e -->

```bash
# Playwright on GitHub Actions: inline text files from the failing run's report artifact.
# Discovers its own run. E2E_ARTIFACT = YOUR `actions/upload-artifact` name. One block per lane; fetch from where that lane's evidence lives.
# E2E_JOB_RE ships as a placeholder that matches NO job — anchor it to this lane's exact job
# name before enabling. A loose pattern also matches sibling e2e lanes, and this block then
# downloads THIS lane's artifact and files it as that lane's evidence; wrong evidence sends
# diagnosis after the wrong failure, which is worse than the `NOT CONFIGURED` you get from
# leaving the placeholder in. Until it is edited every run self-skips, naming the placeholder.
# Customise: E2E_ARTIFACT; E2E_JOB_RE (anchored, this lane only); run selection; which report files to inline vs list as binary.
E2E_ARTIFACT="${E2E_ARTIFACT:-playwright-report}"
E2E_JOB_RE="${E2E_JOB_RE:-^your-e2e-job-name$}"
command -v gh >/dev/null 2>&1 \
  || { echo "[context-fetch:playwright] skipped — gh CLI not installed" >&2; exit 0; }
RUN_ID=$(gh run list --branch "$(git branch --show-current)" --limit 1 \
  --json databaseId,conclusion --jq 'if (.[0].conclusion // "") == "success" then "" else (.[0].databaseId // "" | tostring) end' 2>/dev/null)
[ -n "$RUN_ID" ] \
  || { echo "[context-fetch:playwright] skipped — no failing CI run found for this branch" >&2; exit 0; }
# Pipe to REAL jq: `gh --jq` takes one expression and no `--arg`, so the `--jq --arg re "$X" '...'`
# form fails with `accepts at most 1 arg(s), received 4` — and under 2>/dev/null the empty result
# is indistinguishable from "this lane passed", so a failed lane self-skips in silence.
E2E_FAILED=$(gh run view "$RUN_ID" --json jobs 2>/dev/null \
  | jq --arg re "$E2E_JOB_RE" '[.jobs[] | select(.name | test($re; "i")) | select(.conclusion=="failure")] | length' 2>/dev/null || echo 0)
[ "${E2E_FAILED:-0}" -gt 0 ] \
  || { echo "[context-fetch:playwright] skipped — no failed job matching /$E2E_JOB_RE/i in run $RUN_ID" >&2; exit 0; }
DEST=$(mktemp -d)
trap 'rm -rf "$DEST"' EXIT
gh run download "$RUN_ID" -n "$E2E_ARTIFACT" -D "$DEST" 2>/dev/null \
  || { echo "[context-fetch:playwright] skipped — run $RUN_ID published no '$E2E_ARTIFACT' artifact; its e2e evidence is NOT in GitHub" >&2; exit 0; }
# Failing specs first (`test-results/` holds only failures), then the rest. Bound both counts.
E2E_MAX_FILES=20; E2E_MAX_LINES=300
e2e_list() { find "$1" -type f \( -name '*.md' -o -name '*.json' -o -name '*.txt' -o -name '*.log' -o -name '*.xml' \) 2>/dev/null | sort; }
E2E_FILES=$({ e2e_list "$DEST/test-results"; e2e_list "$DEST"; } | awk '!seen[$0]++')
E2E_TOTAL=$(printf '%s' "$E2E_FILES" | grep -c . || true)
printf '===== playwright report (run %s, artifact %s) =====\n' "$RUN_ID" "$E2E_ARTIFACT"
printf '%s\n' "$E2E_FILES" | head -n "$E2E_MAX_FILES" | while read -r f; do
  [ -n "$f" ] || continue
  printf '\n===== file: %s (first %s lines) =====\n' "${f#"$DEST"/}" "$E2E_MAX_LINES"
  head -n "$E2E_MAX_LINES" "$f"
done
[ "$E2E_TOTAL" -gt "$E2E_MAX_FILES" ] && printf '\n===== inlined %s of %s files; the rest were NOT read =====\n' "$E2E_MAX_FILES" "$E2E_TOTAL"
printf '\n===== binary artifacts (not inlined) =====\n'
find "$DEST" -type f \( -name '*.html' -o -name '*.png' -o -name '*.webm' -o -name '*.zip' \) | sed "s|^$DEST/||" | sort
```

<!-- context-fetch:end -->
