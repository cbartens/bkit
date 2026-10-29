#!/usr/bin/env bash
# C9 (U5): a `codex` job cloned from the template's `opencode` job shape (checkout dev → git user → install agent
# CLI → dispatch) reaches /bkit-auto Step 2 with `node_modules/.bin/bkit` present.
# Probe: (a) list every step of the template opencode job (parsed YAML); (b) list every step of
# openai/codex-action@v1's action.yml (pinned commit); (c) run the exact bkit-auto Step 2 command in a fresh
# clone of this branch (what actions/checkout leaves: tracked files only).
set -u
REPO=/Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
SPIKE="$REPO/docs/plans/202610/logs/719-cloud-variants-add/spike"
W="$SPIKE/work-c9"; rm -rf "$W"; mkdir -p "$W"
echo "== (a) template opencode job steps"
sed -E 's/\{\{[A-Z_]+\}\}/PLACEHOLDER/g' "$REPO/.bkit/templates/.github/workflows/bkit-cloud.yml" >"$W/cloud.yml"
ruby -ryaml -e '
y = YAML.load_file(ARGV[0])
y["jobs"]["opencode"]["steps"].each_with_index { |s, i|
  puts "#{i}: name=#{s["name"].inspect} uses=#{s["uses"].inspect} run_first_line=#{(s["run"] || "").lines.reject { |l| l.strip.start_with?("#") || l.strip.empty? }.first.to_s.strip.inspect}"
}' "$W/cloud.yml"
echo "== (b) openai/codex-action action.yml steps (v1 → commit bdf19a4a223ec2549a3e2274a0cf61556bc07675)"
curl -fsS --max-time 20 -o "$W/action.yml" https://raw.githubusercontent.com/openai/codex-action/bdf19a4a223ec2549a3e2274a0cf61556bc07675/action.yml; echo "curl exit=$?"
ruby -ryaml -e '
y = YAML.load_file(ARGV[0])
y["runs"]["steps"].each_with_index { |s, i|
  r = (s["run"] || "").lines.map(&:strip).grep(/install|pnpm|npm ci|yarn/).join(" | ")
  puts "#{i}: name=#{s["name"].inspect} uses=#{s["uses"].inspect} install_lines=#{r.inspect}"
}' "$W/action.yml"
echo "== (c) fresh clone, bkit-auto Step 2 command"
git clone -q --no-hardlinks --branch "$(git -C "$REPO" branch --show-current)" "$REPO" "$W/checkout"; echo "clone exit=$?"
(cd "$W/checkout" && ls -d node_modules 2>&1; \
  "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit" repo info --allow-detached; echo "step2 exit=$?")
rm -rf "$W"
