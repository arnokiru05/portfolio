"""Generate a daily urban ride-share demand time series.

The series combines a growth trend, weekly seasonality (weekend peaks), yearly
seasonality (summer high / winter low), holiday effects, and noise - the
ingredients of a realistic demand-forecasting problem. Seeded for reproducibility.

Usage:
    python generate_data.py
"""
from __future__ import annotations

import numpy as np
import pandas as pd

SEED = 3
START = "2022-01-01"
END = "2024-12-31"
BASE = 8_000

# A few fixed-date holidays with a demand multiplier (spikes and dips).
HOLIDAYS = {
    "01-01": 0.7,   # New Year's Day (quiet morning-after)
    "07-04": 1.25,  # Independence Day
    "12-24": 0.8,   # Christmas Eve
    "12-25": 0.6,   # Christmas Day
    "12-31": 1.5,   # New Year's Eve
    "11-28": 1.2,   # late-Nov holiday travel (approx.)
}


def generate() -> pd.DataFrame:
    rng = np.random.default_rng(SEED)
    dates = pd.date_range(START, END, freq="D")
    n = len(dates)
    t = np.arange(n)

    # Growth trend (~35% over the window).
    trend = 1.0 + 0.35 * (t / n)

    # Weekly seasonality: Fri/Sat peak, midweek trough.
    weekday_factor = np.array([0.92, 0.9, 0.95, 1.0, 1.18, 1.28, 1.05])
    weekly = weekday_factor[dates.dayofweek.to_numpy()]

    # Yearly seasonality via a Fourier term peaking mid-summer.
    doy = dates.dayofyear.to_numpy()
    yearly = 1.0 + 0.15 * np.sin(2 * np.pi * (doy - 80) / 365.25)

    demand = BASE * trend * weekly * yearly

    # Holiday effects.
    md = dates.strftime("%m-%d").to_numpy()
    for key, mult in HOLIDAYS.items():
        demand[md == key] *= mult

    # Multiplicative noise.
    demand *= rng.normal(1.0, 0.05, n)
    demand = np.clip(demand, 0, None).round().astype(int)

    return pd.DataFrame({"date": dates, "trips": demand})


if __name__ == "__main__":
    df = generate()
    out = "data/rideshare_demand.csv"
    df.to_csv(out, index=False)
    print(f"Wrote {len(df):,} days to {out}")
    print(f"Date range: {df['date'].min().date()} -> {df['date'].max().date()}")
    print(f"Mean daily trips: {df['trips'].mean():,.0f}")
