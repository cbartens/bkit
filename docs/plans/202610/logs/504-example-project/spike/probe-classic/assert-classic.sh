#!/usr/bin/env bash
# Throwaway probe: deterministic classic-script assertion for the built page.
# Claim (design): a PR-time assertion can prove the page loads off disk via an
# ordinary <script src> and carries no type="module" — AI-free, deterministic.
set -u
f="$1"
has_src=0; has_module=0; has_inline_module=0
grep -qE '<script[^>]*[[:space:]]src=|<script[[:space:]]+src=' "$f" && has_src=1
grep -qE '<script[^>]*type[[:space:]]*=[[:space:]]*["'"'"']module["'"'"']' "$f" && has_module=1
grep -qE '<script[^>]*type[[:space:]]*=[[:space:]]*["'"'"']module["'"'"'][^>]*>[^<]*</script>' "$f" && has_inline_module=1
echo "file=$f has_script_src=$has_src has_type_module=$has_module"
if [ "$has_src" -eq 1 ] && [ "$has_module" -eq 0 ]; then
  echo "CLASSIC_ASSERT=PASS"; exit 0
fi
echo "CLASSIC_ASSERT=FAIL"; exit 1
