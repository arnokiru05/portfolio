# Data Analysis Projects

A collection of self-contained, reproducible data-analysis projects that
showcase the full workflow — data generation, cleaning, EDA, visualisation,
modelling, and business insight — across different domains and toolsets.

Every project uses a **seeded synthetic dataset** (built by its `generate_data.py`)
that models realistic patterns, so each one runs end-to-end offline and
deterministically.

Each folder is a **standalone, publishable package**: it has its own `README.md`,
`requirements.txt`, `LICENSE`, `.gitignore`, source, and committed `outputs/`, so
it can live either here in the monorepo or as its own GitHub repository.

| # | Project | Focus | Stack | Standalone repo |
| --- | --- | --- | --- | --- |
| 01 | [Retail E-commerce Analytics + RFM](01-retail-ecommerce-analytics) | EDA, KPIs, customer segmentation | pandas, matplotlib | `retail-ecommerce-analytics` |
| 02 | [Telecom Customer Churn Prediction](02-telecom-churn-prediction) | Supervised ML classification | scikit-learn | `telecom-churn-prediction` |
| 03 | [Streaming Analytics with SQL](03-sql-sales-analytics) | Analytical SQL, window functions | SQLite, pandas | `streaming-sql-analytics` |
| 04 | [Ride-Share Demand Forecasting](04-timeseries-demand-forecasting) | Time-series forecasting | scikit-learn | `rideshare-demand-forecasting` |

## Running any project
Each project is independent — install its own requirements and run it from its folder:
```bash
cd 01-retail-ecommerce-analytics
python -m venv .venv && source .venv/bin/activate   # optional
pip install -r requirements.txt
python generate_data.py
python analysis.py            # (or run_queries.py for the SQL project)
```

## Publishing as standalone repositories

The portfolio's project cards link to each project's **own** GitHub repository
(e.g. `github.com/arnokiru05/retail-ecommerce-analytics`). To create and populate
those repositories from this monorepo, run the helper script **on your own
machine** (it needs permission to create repos under your account):

```bash
gh auth login                      # once, if not already authenticated
bash data-projects/publish_standalone_repos.sh
```

For each project the script uses `git subtree split` to extract the folder —
**with its commit history** — into a repo where the project is the root, creates
the public repository if needed, and pushes it. It is idempotent, so re-running
updates the existing repos. Run it **before** the portfolio site goes live so the
"Source Code" links resolve.

> Because the split preserves history and the folders remain here too, the
> monorepo and the standalone repos can coexist; you can later remove
> `data-projects/` from the portfolio repo if you prefer the projects to live
> only in their own repositories.
