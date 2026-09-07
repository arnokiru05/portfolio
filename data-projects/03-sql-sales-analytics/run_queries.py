"""Run the analytical queries in queries.sql against the SQLite database.

Parses queries.sql (split on "-- name:" markers), executes each against
data/streaming.db, prints the results, and saves key charts + a markdown
summary to outputs/.

Usage:
    python generate_data.py
    python run_queries.py
"""
from __future__ import annotations

import os
import re
import sqlite3

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import pandas as pd

ACCENT = "#d97736"
INK = "#2b2b2b"
DB_PATH = "data/streaming.db"
OUT = "outputs"


def _style() -> None:
    plt.rcParams.update({
        "figure.facecolor": "white", "axes.facecolor": "white",
        "axes.grid": True, "grid.color": "#eeeeee",
        "axes.spines.top": False, "axes.spines.right": False,
        "font.size": 11, "axes.titlesize": 13, "axes.titleweight": "bold",
        "text.color": INK, "axes.labelcolor": INK,
        "xtick.color": INK, "ytick.color": INK,
    })


def parse_queries(path: str = "queries.sql") -> dict[str, str]:
    with open(path) as fh:
        text = fh.read()
    blocks = re.split(r"-- name:\s*(\w+)\s*\n", text)
    # blocks = [preamble, name1, body1, name2, body2, ...]
    queries: dict[str, str] = {}
    for i in range(1, len(blocks), 2):
        name = blocks[i]
        body = blocks[i + 1]
        # Drop trailing comment-only lines but keep the SQL.
        queries[name] = body.strip()
    return queries


def run_all(con: sqlite3.Connection, queries: dict[str, str]) -> dict[str, pd.DataFrame]:
    results = {}
    for name, sql in queries.items():
        # A query body may contain leading comment lines; pandas handles them.
        results[name] = pd.read_sql_query(sql, con)
    return results


def chart_genre(df: pd.DataFrame) -> None:
    d = df.sort_values("views")
    fig, ax = plt.subplots(figsize=(8, 4.5))
    ax.barh(d["genre"], d["views"], color=ACCENT)
    ax.set_title("Views by Genre")
    ax.set_xlabel("Views")
    fig.tight_layout()
    fig.savefig(f"{OUT}/views_by_genre.png", dpi=130)
    plt.close(fig)


def chart_growth(df: pd.DataFrame) -> None:
    fig, ax = plt.subplots(figsize=(10, 4.4))
    ax.plot(df["month"], df["running_total"], color=ACCENT, linewidth=2.4, marker="o", markersize=3)
    ax.set_title("Cumulative Views Over Time (running total)")
    ax.set_ylabel("Cumulative views")
    step = max(1, len(df) // 12)
    ax.set_xticks(range(0, len(df), step))
    ax.set_xticklabels(df["month"].iloc[::step], rotation=45, ha="right")
    fig.tight_layout()
    fig.savefig(f"{OUT}/cumulative_views.png", dpi=130)
    plt.close(fig)


def chart_revenue(df: pd.DataFrame) -> None:
    d = df.sort_values("monthly_revenue")
    fig, ax = plt.subplots(figsize=(8, 4.5))
    ax.barh(d["country"], d["monthly_revenue"], color="#3d7ea6")
    ax.set_title("Monthly Subscription Revenue by Country")
    ax.set_xlabel("Revenue ($)")
    fig.tight_layout()
    fig.savefig(f"{OUT}/revenue_by_country.png", dpi=130)
    plt.close(fig)


def make_cover(genre: pd.DataFrame, growth: pd.DataFrame, plan: pd.DataFrame) -> None:
    fig = plt.figure(figsize=(11, 6.5))
    gs = fig.add_gridspec(2, 2, hspace=0.5, wspace=0.3)
    fig.suptitle("Streaming Analytics with SQL", fontsize=18, fontweight="bold")

    ax0 = fig.add_subplot(gs[0, :])
    ax0.plot(growth["month"], growth["running_total"], color=ACCENT, linewidth=2.4)
    ax0.set_title("Cumulative Views Over Time")
    step = max(1, len(growth) // 10)
    ax0.set_xticks(range(0, len(growth), step))
    ax0.set_xticklabels(growth["month"].iloc[::step], rotation=45, ha="right", fontsize=8)

    ax1 = fig.add_subplot(gs[1, 0])
    d = genre.sort_values("views")
    ax1.barh(d["genre"], d["views"], color="#5a9e6f")
    ax1.set_title("Views by Genre"); ax1.tick_params(labelsize=8)

    ax2 = fig.add_subplot(gs[1, 1])
    ax2.bar(plan["plan"], plan["avg_views_per_user"], color="#3d7ea6")
    ax2.set_title("Avg Views / User by Plan"); ax2.tick_params(labelsize=8)

    for ax in (ax0, ax1, ax2):
        ax.grid(color="#eeeeee")
        for s in ("top", "right"):
            ax.spines[s].set_visible(False)
    fig.savefig(f"{OUT}/cover.png", dpi=130, bbox_inches="tight")
    plt.close(fig)


def df_to_md(df: pd.DataFrame) -> str:
    header = "| " + " | ".join(map(str, df.columns)) + " |"
    sep = "| " + " | ".join(["---"] * len(df.columns)) + " |"
    rows = [
        "| " + " | ".join("" if pd.isna(v) else str(v) for v in row) + " |"
        for row in df.itertuples(index=False)
    ]
    return "\n".join([header, sep, *rows])


def write_summary(results: dict[str, pd.DataFrame]) -> None:
    genre = results["genre_performance"]
    growth = results["monthly_growth"]
    plan = results["engagement_by_plan"]
    rev = results["revenue_by_country"]

    top_genre = genre.iloc[0]
    total_mrr = rev["monthly_revenue"].sum()
    lines = [
        "# Streaming SQL Analytics - Summary\n",
        f"- **Total monthly subscription revenue:** ${total_mrr:,.0f}",
        f"- **Most-watched genre:** {top_genre['genre']} "
        f"({int(top_genre['views']):,} views, {top_genre['completion_rate_pct']}% completion)",
        f"- **Top plan by engagement:** {plan.iloc[0]['plan']} "
        f"({plan.iloc[0]['avg_views_per_user']} views/user)\n",
        "## Genre performance\n",
        df_to_md(genre),
        "\n## Month-over-month growth (tail)\n",
        df_to_md(growth.tail(6)),
    ]
    with open(f"{OUT}/summary.md", "w") as fh:
        fh.write("\n".join(lines) + "\n")


def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    _style()
    con = sqlite3.connect(DB_PATH)
    queries = parse_queries()
    results = run_all(con, queries)
    con.close()

    chart_genre(results["genre_performance"])
    chart_growth(results["monthly_growth"])
    chart_revenue(results["revenue_by_country"])
    make_cover(results["genre_performance"], results["monthly_growth"],
               results["engagement_by_plan"])
    write_summary(results)

    print("=== Streaming SQL Analytics ===")
    for name, df in results.items():
        print(f"\n--- {name} ---")
        print(df.head(6).to_string(index=False))
    print(f"\nSaved charts + summary to {OUT}/")


if __name__ == "__main__":
    main()
