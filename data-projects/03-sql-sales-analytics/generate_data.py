"""Build a small relational SQLite database for a streaming service.

Creates streaming.db with three related tables - users, titles, and views - so
the analysis can demonstrate JOINs, CTEs, aggregations, and window functions on
realistic, reproducible data.

Usage:
    python generate_data.py
"""
from __future__ import annotations

import os
import sqlite3

import numpy as np
import pandas as pd

SEED = 11
N_USERS = 6_000
N_TITLES = 1_400
N_VIEWS = 90_000
DB_PATH = "data/streaming.db"

GENRES = {
    "Drama": 0.2, "Comedy": 0.18, "Action": 0.15, "Documentary": 0.1,
    "Thriller": 0.1, "Sci-Fi": 0.09, "Romance": 0.08, "Horror": 0.06,
    "Animation": 0.04,
}
COUNTRIES = ["US", "UK", "IN", "DE", "BR", "NG", "CA", "AU"]
PLANS = {"Basic": 0.42, "Standard": 0.4, "Premium": 0.18}
PLAN_PRICE = {"Basic": 6.99, "Standard": 12.99, "Premium": 17.99}


def generate() -> None:
    rng = np.random.default_rng(SEED)
    os.makedirs("data", exist_ok=True)

    # --- titles ---
    genres = list(GENRES)
    titles = pd.DataFrame({
        "title_id": np.arange(1, N_TITLES + 1),
        "title": [f"Title {i:04d}" for i in range(1, N_TITLES + 1)],
        "type": rng.choice(["Movie", "Series"], N_TITLES, p=[0.62, 0.38]),
        "genre": rng.choice(genres, N_TITLES, p=list(GENRES.values())),
        "release_year": rng.integers(1995, 2025, N_TITLES),
        "runtime_min": rng.integers(80, 160, N_TITLES),
        "country": rng.choice(COUNTRIES, N_TITLES),
    })
    added = pd.to_datetime("2019-01-01") + pd.to_timedelta(
        rng.integers(0, 365 * 6, N_TITLES), unit="D")
    titles["date_added"] = added.date.astype(str)

    # --- users ---
    plans = rng.choice(list(PLANS), N_USERS, p=list(PLANS.values()))
    signup = pd.to_datetime("2019-01-01") + pd.to_timedelta(
        rng.integers(0, 365 * 6, N_USERS), unit="D")
    users = pd.DataFrame({
        "user_id": np.arange(1, N_USERS + 1),
        "country": rng.choice(COUNTRIES, N_USERS),
        "plan": plans,
        "monthly_price": [PLAN_PRICE[p] for p in plans],
        "signup_date": signup.date.astype(str),
    })

    # --- views --- (genre popularity skews which titles get watched)
    genre_pop = titles["genre"].map(GENRES).to_numpy()
    title_weight = genre_pop * rng.uniform(0.5, 1.5, N_TITLES)
    title_weight /= title_weight.sum()
    view_titles = rng.choice(titles["title_id"], N_VIEWS, p=title_weight)

    # Higher-tier plans stream more, and each user has an activity factor, so a
    # minority of subscribers drive a disproportionate share of views.
    plan_factor = users["plan"].map({"Basic": 1.0, "Standard": 1.5, "Premium": 2.4}).to_numpy()
    user_weight = plan_factor * rng.gamma(2.0, 1.0, N_USERS)
    user_weight /= user_weight.sum()
    view_users = rng.choice(users["user_id"], N_VIEWS, p=user_weight)

    watch = pd.to_datetime("2022-01-01") + pd.to_timedelta(
        rng.integers(0, 365 * 3, N_VIEWS), unit="D")
    runtime_lookup = titles.set_index("title_id")["runtime_min"]
    rt = runtime_lookup.loc[view_titles].to_numpy()
    frac = rng.beta(5, 2, N_VIEWS)  # most watches are near-complete
    minutes = (rt * frac).round().astype(int)
    completed = (frac > 0.8).astype(int)
    rating = np.where(rng.random(N_VIEWS) < 0.35, rng.integers(1, 6, N_VIEWS), np.nan)

    views = pd.DataFrame({
        "view_id": np.arange(1, N_VIEWS + 1),
        "user_id": view_users,
        "title_id": view_titles,
        "watch_date": watch.date.astype(str),
        "minutes_watched": minutes,
        "completed": completed,
        "rating": rating,
    })

    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
    con = sqlite3.connect(DB_PATH)
    titles.to_sql("titles", con, index=False)
    users.to_sql("users", con, index=False)
    views.to_sql("views", con, index=False)
    con.executescript(
        "CREATE INDEX idx_views_title ON views(title_id);"
        "CREATE INDEX idx_views_user ON views(user_id);"
    )
    con.commit()
    con.close()
    print(f"Built {DB_PATH}: {N_USERS:,} users, {N_TITLES:,} titles, {N_VIEWS:,} views")


if __name__ == "__main__":
    generate()
