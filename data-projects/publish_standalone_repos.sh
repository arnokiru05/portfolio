#!/usr/bin/env bash
#
# Publish each data-analysis project in this folder as its own standalone
# GitHub repository, preserving that project's commit history.
#
# ---------------------------------------------------------------------------
# RUN THIS ON YOUR OWN MACHINE (not the Cloud Agent) — it needs permission to
# create repositories under your GitHub account.
#
# Prerequisites:
#   1. GitHub CLI installed and authenticated with repo-creation scope:
#        gh auth login
#   2. A local clone of this portfolio repo WITH FULL HISTORY (not a shallow
#      clone), checked out on the branch that contains data-projects/.
#
# What it does for each project:
#   1. `git subtree split` extracts the project folder — with its history —
#      into a temporary branch where the folder's contents are the repo root.
#   2. Creates a new public repo under your account (skipped if it exists).
#   3. Pushes the extracted history to that repo's `main` branch.
#
# The script is idempotent: re-running updates the existing repos.
# Set GH_USER to override the target account (defaults to arnokiru05).
# ---------------------------------------------------------------------------
set -euo pipefail

GH_USER="${GH_USER:-arnokiru05}"
REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

# folder | standalone-repo-name | description
PROJECTS=(
  "data-projects/01-retail-ecommerce-analytics|retail-ecommerce-analytics|E-commerce retail analytics with RFM customer segmentation (Python, pandas)"
  "data-projects/02-telecom-churn-prediction|telecom-churn-prediction|Telecom customer churn prediction, end-to-end (scikit-learn)"
  "data-projects/03-sql-sales-analytics|streaming-sql-analytics|Streaming analytics in SQL: JOINs, CTEs, and window functions (SQLite)"
  "data-projects/04-timeseries-demand-forecasting|rideshare-demand-forecasting|Ride-share demand time-series forecasting (scikit-learn)"
)

command -v gh >/dev/null 2>&1 || { echo "error: GitHub CLI (gh) is not installed"; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "error: run 'gh auth login' first"; exit 1; }

for entry in "${PROJECTS[@]}"; do
  IFS='|' read -r folder repo desc <<< "$entry"
  echo "==> ${repo}  (${folder})"

  if [ ! -d "$folder" ]; then
    echo "    skip: $folder not found"
    continue
  fi

  split_branch="_split_${repo}"
  git branch -D "$split_branch" 2>/dev/null || true
  git subtree split --prefix="$folder" -b "$split_branch" >/dev/null

  if gh repo view "$GH_USER/$repo" >/dev/null 2>&1; then
    echo "    repo exists — pushing update"
  else
    echo "    creating repo $GH_USER/$repo"
    gh repo create "$GH_USER/$repo" --public --description "$desc"
  fi

  git push "https://github.com/$GH_USER/$repo.git" "$split_branch:main" --force
  git branch -D "$split_branch" >/dev/null
  echo "    done: https://github.com/$GH_USER/$repo"
  echo
done

echo "All projects published. The portfolio's project cards already link to"
echo "these repository URLs, so they will resolve once this has run."
