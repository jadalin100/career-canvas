#!/usr/bin/env bash
# Rebuilds the quiz site and pushes the runtime files (index.html, quiz.html,
# app.js, style.css, quizzes.json) to the public career-college-compass repo,
# which is what GitHub Pages actually serves at
# https://jadalin100.github.io/career-college-compass/
#
# Run automatically by .git/hooks/post-commit whenever a commit on main
# touches site/ or quizzes/. Run by hand any time with:
#   ./scripts/deploy-pages.sh
set -euo pipefail
cd "$(dirname "$0")/.."

SRC_COMMIT=$(git rev-parse --short HEAD)

python3 site/build_quiz_data.py
python3 site/build_artifact.py

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

git clone --quiet --depth 1 https://github.com/jadalin100/career-college-compass.git "$TMP"
cp site/index.html site/quiz.html site/app.js site/style.css site/quizzes.json "$TMP/"

cd "$TMP"
if git diff --quiet; then
  echo "deploy-pages: built site is unchanged, nothing to push"
  exit 0
fi
git add -A
git commit --quiet -m "Deploy: sync from career-development-deca@${SRC_COMMIT}"
git push --quiet origin main
echo "deploy-pages: pushed update -- https://jadalin100.github.io/career-college-compass/"
