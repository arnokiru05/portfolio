# Data Analysis Projects

A collection of self-contained, reproducible data-analysis projects that
showcase the full workflow — data generation, cleaning, EDA, visualisation,
modelling, and business insight — across different domains and toolsets.

Every project uses a **seeded synthetic dataset** (built by its `generate_data.py`)
that models realistic patterns, so each one runs end-to-end offline and
deterministically.

| # | Project | Focus | Stack |
| --- | --- | --- | --- |
| 01 | [Retail E-commerce Analytics + RFM](01-retail-ecommerce-analytics) | EDA, KPIs, customer segmentation | pandas, matplotlib |
| 02 | [Telecom Customer Churn Prediction](02-telecom-churn-prediction) | Supervised ML classification | scikit-learn |
| 03 | [Streaming Analytics with SQL](03-sql-sales-analytics) | Analytical SQL, window functions | SQLite, pandas |
| 04 | [Ride-Share Demand Forecasting](04-timeseries-demand-forecasting) | Time-series forecasting | scikit-learn |

## Running any project
```bash
cd data-projects
python -m venv .venv && source .venv/bin/activate   # optional
pip install -r requirements.txt

cd 01-retail-ecommerce-analytics
python generate_data.py
python analysis.py            # (or run_queries.py for the SQL project)
```

Each project folder contains its own `README.md` with the approach, results, and
charts, plus an `outputs/` directory of generated figures and a metrics summary.
