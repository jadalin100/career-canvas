#!/usr/bin/env bash
# Rebuilds the site and pushes the runtime files to the gh-pages branch of the
# separate public career-canvas repo. It does not touch the earlier
# career-college-compass project.
# https://jadalin100.github.io/career-canvas/
#
# Run automatically by .git/hooks/post-commit whenever a commit on main
# touches site/ or quizzes/. Run by hand any time with:
#   ./scripts/deploy-pages.sh
set -euo pipefail
cd "$(dirname "$0")/.."

SRC_COMMIT=$(git rev-parse --short HEAD)

python3 site/build_quiz_data.py
python3 site/build_artifact.py
# meetings.json is generated from the slide decks so the site cannot drift from them
( cd slides/build && node build_meetings_json.mjs )

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

git clone --quiet --depth 1 --branch gh-pages https://github.com/jadalin100/career-canvas.git "$TMP"
touch "$TMP/.nojekyll"
cp site/index.html site/quizzes.html site/quiz.html site/studio.html \
   site/quiz-builder.html site/app.js site/style.css site/canvas.css \
   site/canvas.js site/canvas-quizzes.js site/canvas-app.css site/canvas-app.js \
   site/quiz-builder.js site/quizzes.json site/quiz-data.js \
   site/meetings.json site/meetings-data.js site/favicon.svg "$TMP/"

cd "$TMP"
if git diff --quiet; then
  echo "deploy-pages: built site is unchanged, nothing to push"
  exit 0
fi
git add -A
git commit --quiet -m "Deploy: sync from career-development-deca@${SRC_COMMIT}"
git push --quiet origin gh-pages
echo "deploy-pages: pushed update -- https://jadalin100.github.io/career-canvas/"
