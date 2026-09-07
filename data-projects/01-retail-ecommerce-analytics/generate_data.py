"""Generate a realistic synthetic e-commerce transactions dataset.

The data models patterns you would expect in a real online retailer: seasonal
demand (Q4 uplift), a mix of one-time and repeat customers, category-dependent
pricing, and a small share of returns. Everything is seeded so the dataset is
fully reproducible.

Usage:
    python generate_data.py
"""
from __future__ import annotations

import numpy as np
import pandas as pd

SEED = 42
N_CUSTOMERS = 20_000
START_DATE = pd.Timestamp("2023-01-01")
END_DATE = pd.Timestamp("2024-12-31")

CATEGORIES = {
    "Electronics": (80, 900),
    "Home & Kitchen": (15, 250),
    "Fashion": (12, 180),
    "Beauty": (8, 120),
    "Sports & Outdoors": (20, 400),
    "Books": (6, 60),
    "Toys": (10, 150),
}

COUNTRIES = {
    "United Kingdom": 0.42,
    "Germany": 0.14,
    "France": 0.11,
    "United States": 0.10,
    "Spain": 0.07,
    "Netherlands": 0.06,
    "Ireland": 0.05,
    "Australia": 0.05,
}


def _seasonal_weight(day_of_year: np.ndarray) -> np.ndarray:
    """Higher weight in Nov/Dec (holiday season) plus a mild summer bump."""
    holiday = 1.0 + 0.9 * np.exp(-((day_of_year - 330) ** 2) / (2 * 22 ** 2))
    summer = 1.0 + 0.25 * np.exp(-((day_of_year - 180) ** 2) / (2 * 40 ** 2))
    return holiday * summer


def generate() -> pd.DataFrame:
    rng = np.random.default_rng(SEED)

    # Customer base: most customers buy once, a minority are repeat buyers, and
    # a small "whale" tail places many orders. We model each customer's order
    # count directly so the repeat-purchase rate is realistic (~a third repeat).
    customer_ids = np.array([f"C{100000 + i}" for i in range(N_CUSTOMERS)])
    u = rng.random(N_CUSTOMERS)
    order_counts = np.select(
        [u < 0.64, u < 0.83, u < 0.93, u < 0.98],
        [1, 2, 3, rng.integers(4, 8, N_CUSTOMERS)],
        default=rng.integers(8, 20, N_CUSTOMERS),
    ).astype(int)

    # Expand to one row per order.
    order_customer = np.repeat(customer_ids, order_counts)
    global N_ORDERS
    N_ORDERS = int(order_counts.sum())

    # Order dates weighted by seasonality.
    all_days = pd.date_range(START_DATE, END_DATE, freq="D")
    doy = all_days.dayofyear.to_numpy()
    day_weights = _seasonal_weight(doy)
    day_weights = day_weights / day_weights.sum()
    order_dates = rng.choice(all_days, size=N_ORDERS, p=day_weights)

    # Category and price.
    cat_names = list(CATEGORIES.keys())
    cat_probs = np.array([0.16, 0.2, 0.22, 0.14, 0.1, 0.1, 0.08])
    cat_probs = cat_probs / cat_probs.sum()
    order_category = rng.choice(cat_names, size=N_ORDERS, p=cat_probs)

    unit_price = np.empty(N_ORDERS)
    for cat, (lo, hi) in CATEGORIES.items():
        mask = order_category == cat
        n = int(mask.sum())
        # Log-normal-ish pricing bounded to the category range.
        raw = rng.lognormal(mean=np.log((lo + hi) / 2), sigma=0.45, size=n)
        unit_price[mask] = np.clip(raw, lo, hi).round(2)

    quantity = rng.integers(1, 6, size=N_ORDERS)
    # Small quantities are far more common.
    quantity = np.where(rng.random(N_ORDERS) < 0.7, 1, quantity)

    country = rng.choice(list(COUNTRIES), size=N_ORDERS, p=list(COUNTRIES.values()))

    # ~7% of orders are returned.
    is_returned = rng.random(N_ORDERS) < 0.07

    df = pd.DataFrame(
        {
            "order_id": [f"O{500000 + i}" for i in range(N_ORDERS)],
            "customer_id": order_customer,
            "order_date": pd.to_datetime(order_dates),
            "category": order_category,
            "unit_price": unit_price,
            "quantity": quantity,
            "country": country,
            "is_returned": is_returned,
        }
    )
    df["revenue"] = (df["unit_price"] * df["quantity"]).round(2)
    # Returned orders contribute no net revenue.
    df.loc[df["is_returned"], "revenue"] = 0.0
    df = df.sort_values("order_date").reset_index(drop=True)
    return df


if __name__ == "__main__":
    data = generate()
    out_path = "data/online_retail.csv"
    data.to_csv(out_path, index=False)
    print(f"Wrote {len(data):,} orders to {out_path}")
    print(f"Customers: {data['customer_id'].nunique():,}")
    print(f"Date range: {data['order_date'].min().date()} -> {data['order_date'].max().date()}")
    print(f"Gross revenue: ${data['revenue'].sum():,.0f}")
