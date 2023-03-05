#!/bin/sh

echo "\n"
echo "***** Running Pre-Commit Build ******"

npm run pre-commit
status=$?

echo "\n"

if [ $status -eq 0 ]; then
  echo "***** Build Successful. Staging new coverage badge (if coverage changed) and committing the following changes: ******"
  git add assets/coverage-badge.svg
  git --no-pager diff --staged --name-only
else
  echo "***** Build failled, aborting commit. *****"
fi

echo "\n"

exit $status
