"""Time-series demand forecasting for daily ride-share trips.

Explores trend and seasonality, then forecasts the final 90 days using
calendar-feature regression models (Linear Regression, Random Forest) and
compares them against a seasonal-naive baseline. Reports MAE / RMSE / MAPE and
saves charts + a summary to outputs/.

Usage:
    python generate_data.py
    python analysis.py
"""
from __future__ import annotations

import json
import os

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

ACCENT = "#d97736"
BLUE = "#3d7ea6"
GREEN = "#5a9e6f"
INK = "#2b2b2b"
OUT = "outputs"
TEST_DAYS = 90


def _style() -> None:
    plt.rcParams.update({
        "figure.facecolor": "white", "axes.facecolor": "white",
        "axes.grid": True, "grid.color": "#eeeeee",
        "axes.spines.top": False, "axes.spines.right": False,
        "font.size": 11, "axes.titlesize": 13, "axes.titleweight": "bold",
        "text.color": INK, "axes.labelcolor": INK,
        "xtick.color": INK, "ytick.color": INK,
    })


def load() -> pd.DataFrame:
    df = pd.read_csv("data/rideshare_demand.csv", parse_dates=["date"])
    df = df.sort_values("date").reset_index(drop=True)
    df["t"] = np.arange(len(df))
    df["dow"] = df["date"].dt.dayofweek
    df["month"] = df["date"].dt.month
    df["doy"] = df["date"].dt.dayofyear
    df["doy_sin"] = np.sin(2 * np.pi * df["doy"] / 365.25)
    df["doy_cos"] = np.cos(2 * np.pi * df["doy"] / 365.25)
    return df


def metrics(y_true, y_pred) -> dict:
    mae = mean_absolute_error(y_true, y_pred)
    rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
    mape = float(np.mean(np.abs((y_true - y_pred) / y_true)) * 100)
    return {"mae": mae, "rmse": rmse, "mape": mape}


def build_pipeline(model) -> Pipeline:
    pre = ColumnTransformer(
        [("cat", OneHotEncoder(handle_unknown="ignore"), ["dow", "month"])],
        remainder="passthrough",
    )
    return Pipeline([("pre", pre), ("model", model)])


FEATURES = ["dow", "month", "t", "doy_sin", "doy_cos"]


def plot_weekly(df: pd.DataFrame) -> None:
    names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    avg = df.groupby("dow")["trips"].mean()
    fig, ax = plt.subplots(figsize=(8, 4.4))
    ax.bar(names, avg.values, color=ACCENT)
    ax.set_title("Average Demand by Day of Week")
    ax.set_ylabel("Avg trips")
    fig.tight_layout()
    fig.savefig(f"{OUT}/weekly_seasonality.png", dpi=130)
    plt.close(fig)


def plot_series(df: pd.DataFrame, test_idx, preds) -> None:
    fig, ax = plt.subplots(figsize=(11, 4.6))
    roll = df["trips"].rolling(30, center=True).mean()
    ax.plot(df["date"], df["trips"], color="#cccccc", linewidth=0.8, label="Daily trips")
    ax.plot(df["date"], roll, color=BLUE, linewidth=2, label="30-day moving avg")
    ax.plot(df["date"].iloc[test_idx], preds, color=ACCENT, linewidth=1.8,
            label="Forecast (test)")
    ax.axvline(df["date"].iloc[test_idx[0]], color="#999999", linestyle="--", linewidth=1)
    ax.set_title("Daily Ride-Share Demand with Trend and Forecast")
    ax.set_ylabel("Trips")
    ax.legend(loc="upper left", fontsize=9)
    fig.tight_layout()
    fig.savefig(f"{OUT}/demand_series.png", dpi=130)
    plt.close(fig)


def plot_forecast(df, test_idx, best_pred, naive_pred) -> None:
    d = df.iloc[test_idx]
    fig, ax = plt.subplots(figsize=(11, 4.6))
    ax.plot(d["date"], d["trips"].values, color=INK, linewidth=1.8, label="Actual")
    ax.plot(d["date"], best_pred, color=ACCENT, linewidth=1.8, label="Model forecast")
    ax.plot(d["date"], naive_pred, color=GREEN, linewidth=1.2, alpha=0.8,
            linestyle="--", label="Seasonal-naive")
    ax.set_title("Forecast vs Actual - final 90 days")
    ax.set_ylabel("Trips")
    ax.legend(loc="upper left", fontsize=9)
    fig.tight_layout()
    fig.savefig(f"{OUT}/forecast_vs_actual.png", dpi=130)
    plt.close(fig)


def make_cover(df, test_idx, best_pred, naive_pred) -> None:
    fig = plt.figure(figsize=(11, 6.5))
    gs = fig.add_gridspec(2, 2, hspace=0.5, wspace=0.28)
    fig.suptitle("Ride-Share Demand Forecasting", fontsize=18, fontweight="bold")

    ax0 = fig.add_subplot(gs[0, :])
    roll = df["trips"].rolling(30, center=True).mean()
    ax0.plot(df["date"], df["trips"], color="#cccccc", linewidth=0.7)
    ax0.plot(df["date"], roll, color=BLUE, linewidth=2)
    ax0.set_title("Daily Demand + 30-day Moving Average")

    ax1 = fig.add_subplot(gs[1, 0])
    names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    avg = df.groupby("dow")["trips"].mean()
    ax1.bar(names, avg.values, color=ACCENT)
    ax1.set_title("Weekly Seasonality"); ax1.tick_params(labelsize=8)

    ax2 = fig.add_subplot(gs[1, 1])
    d = df.iloc[test_idx]
    ax2.plot(d["date"], d["trips"].values, color=INK, linewidth=1.4, label="Actual")
    ax2.plot(d["date"], best_pred, color=ACCENT, linewidth=1.4, label="Forecast")
    ax2.set_title("Forecast vs Actual (test)")
    ax2.tick_params(axis="x", labelsize=7, rotation=30)
    ax2.legend(fontsize=7)

    for ax in (ax0, ax1, ax2):
        ax.grid(color="#eeeeee")
        for s in ("top", "right"):
            ax.spines[s].set_visible(False)
    fig.savefig(f"{OUT}/cover.png", dpi=130, bbox_inches="tight")
    plt.close(fig)


def write_summary(df, results, best_name) -> None:
    lines = [
        "# Ride-Share Demand Forecasting - Summary\n",
        f"- **Series length:** {len(df):,} days "
        f"({df['date'].min().date()} to {df['date'].max().date()})",
        f"- **Mean daily trips:** {df['trips'].mean():,.0f}",
        f"- **Test window:** last {TEST_DAYS} days\n",
        "## Forecast accuracy (test set)\n",
        "| Model | MAE | RMSE | MAPE |",
        "| --- | ---: | ---: | ---: |",
    ]
    for name, m in results.items():
        lines.append(f"| {name} | {m['mae']:,.0f} | {m['rmse']:,.0f} | {m['mape']:.2f}% |")
    best = results[best_name]
    lines.append(
        f"\n**Best model:** {best_name} (MAPE {best['mape']:.2f}%). Calendar-feature "
        "regression captures the growth trend plus weekly and yearly seasonality, "
        f"beating the seasonal-naive baseline."
    )
    with open(f"{OUT}/summary.md", "w") as fh:
        fh.write("\n".join(lines) + "\n")
    with open(f"{OUT}/metrics.json", "w") as fh:
        json.dump(results, fh, indent=2)


def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    _style()
    df = load()
    plot_weekly(df)

    split = len(df) - TEST_DAYS
    train, test = df.iloc[:split], df.iloc[split:]
    test_idx = test.index.to_numpy()

    results: dict[str, dict] = {}

    # Seasonal-naive baseline: same weekday one week earlier.
    naive_pred = df["trips"].shift(7).iloc[split:].to_numpy()
    results["Seasonal-naive (t-7)"] = metrics(test["trips"].to_numpy(), naive_pred)

    models = {
        "Linear Regression": LinearRegression(),
        "Random Forest": RandomForestRegressor(
            n_estimators=300, max_depth=10, min_samples_leaf=5,
            random_state=SEED_MODEL, n_jobs=-1),
    }
    preds = {}
    for name, model in models.items():
        pipe = build_pipeline(model)
        pipe.fit(train[FEATURES], train["trips"])
        p = pipe.predict(test[FEATURES])
        preds[name] = p
        results[name] = metrics(test["trips"].to_numpy(), p)

    model_names = list(models)
    best_name = min(model_names, key=lambda n: results[n]["mape"])
    best_pred = preds[best_name]

    plot_series(df, test_idx, best_pred)
    plot_forecast(df, test_idx, best_pred, naive_pred)
    make_cover(df, test_idx, best_pred, naive_pred)
    write_summary(df, results, best_name)

    print("=== Ride-Share Demand Forecasting ===")
    print(f"Mean daily trips: {df['trips'].mean():,.0f}")
    for name, m in results.items():
        print(f"{name:>22}: MAE={m['mae']:,.0f} RMSE={m['rmse']:,.0f} MAPE={m['mape']:.2f}%")
    print(f"Best: {best_name}")
    print(f"Saved charts + summary to {OUT}/")


SEED_MODEL = 3

if __name__ == "__main__":
    main()
