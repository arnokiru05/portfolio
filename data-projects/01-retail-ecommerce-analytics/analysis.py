"""Retail e-commerce analytics: KPIs, trends, and RFM customer segmentation.

Reads data/online_retail.csv (produced by generate_data.py), computes business
KPIs and an RFM segmentation, saves charts to outputs/, and writes a metrics
summary to outputs/summary.md.

Usage:
    python generate_data.py   # once, to create the dataset
    python analysis.py
"""
from __future__ import annotations

import json
import os

import matplotlib

matplotlib.use("Agg")  # headless
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

ACCENT = "#d97736"
INK = "#2b2b2b"
PALETTE = ["#d97736", "#3d7ea6", "#5a9e6f", "#b0555a", "#8a6fb0", "#c9a227", "#4c4c4c"]
OUT = "outputs"


def _style() -> None:
    plt.rcParams.update(
        {
            "figure.facecolor": "white",
            "axes.facecolor": "white",
            "axes.edgecolor": "#dddddd",
            "axes.grid": True,
            "grid.color": "#eeeeee",
            "axes.spines.top": False,
            "axes.spines.right": False,
            "font.size": 11,
            "axes.titlesize": 13,
            "axes.titleweight": "bold",
            "text.color": INK,
            "axes.labelcolor": INK,
            "xtick.color": INK,
            "ytick.color": INK,
        }
    )


def load() -> pd.DataFrame:
    df = pd.read_csv("data/online_retail.csv", parse_dates=["order_date"])
    return df


def kpis(df: pd.DataFrame) -> dict:
    valid = df[~df["is_returned"]]
    orders_per_customer = df.groupby("customer_id")["order_id"].nunique()
    return {
        "gross_revenue": float(df["revenue"].sum()),
        "total_orders": int(df["order_id"].nunique()),
        "unique_customers": int(df["customer_id"].nunique()),
        "avg_order_value": float(valid["revenue"].mean()),
        "return_rate": float(df["is_returned"].mean()),
        "repeat_customer_rate": float((orders_per_customer > 1).mean()),
        "revenue_per_customer": float(df.groupby("customer_id")["revenue"].sum().mean()),
    }


def plot_monthly_revenue(df: pd.DataFrame) -> None:
    monthly = (
        df.set_index("order_date")["revenue"].resample("MS").sum() / 1_000
    )
    fig, ax = plt.subplots(figsize=(10, 4.5))
    ax.plot(monthly.index, monthly.values, color=ACCENT, linewidth=2.4, marker="o", markersize=4)
    ax.fill_between(monthly.index, monthly.values, color=ACCENT, alpha=0.12)
    ax.set_title("Monthly Revenue Trend")
    ax.set_ylabel("Revenue ($000s)")
    ax.set_xlabel("")
    fig.autofmt_xdate()
    fig.tight_layout()
    fig.savefig(f"{OUT}/monthly_revenue.png", dpi=130)
    plt.close(fig)


def plot_category_revenue(df: pd.DataFrame) -> None:
    by_cat = df.groupby("category")["revenue"].sum().sort_values() / 1_000
    fig, ax = plt.subplots(figsize=(8, 4.5))
    ax.barh(by_cat.index, by_cat.values, color=ACCENT)
    ax.set_title("Revenue by Category")
    ax.set_xlabel("Revenue ($000s)")
    for i, v in enumerate(by_cat.values):
        ax.text(v, i, f" {v:,.0f}", va="center", fontsize=9)
    fig.tight_layout()
    fig.savefig(f"{OUT}/revenue_by_category.png", dpi=130)
    plt.close(fig)


def compute_rfm(df: pd.DataFrame) -> pd.DataFrame:
    snapshot = df["order_date"].max() + pd.Timedelta(days=1)
    rfm = df.groupby("customer_id").agg(
        recency=("order_date", lambda s: (snapshot - s.max()).days),
        frequency=("order_id", "nunique"),
        monetary=("revenue", "sum"),
    )
    # Score 1-4. Recency: lower is better (higher score).
    rfm["r_score"] = pd.qcut(rfm["recency"], 4, labels=[4, 3, 2, 1]).astype(int)
    rfm["f_score"] = pd.qcut(rfm["frequency"].rank(method="first"), 4, labels=[1, 2, 3, 4]).astype(int)
    rfm["m_score"] = pd.qcut(rfm["monetary"].rank(method="first"), 4, labels=[1, 2, 3, 4]).astype(int)
    rfm["rfm_sum"] = rfm[["r_score", "f_score", "m_score"]].sum(axis=1)

    def segment(row) -> str:
        r, f, m = row["r_score"], row["f_score"], row["m_score"]
        if r >= 3 and f >= 3 and m >= 3:
            return "Champions"
        if r >= 3 and f >= 2:
            return "Loyal"
        if r >= 3 and f <= 2:
            return "Recent / New"
        if r == 2 and f >= 2:
            return "Needs Attention"
        if r <= 2 and m >= 3:
            return "At Risk (High Value)"
        return "Hibernating"

    rfm["segment"] = rfm.apply(segment, axis=1)
    return rfm


def plot_rfm_segments(rfm: pd.DataFrame) -> None:
    seg = rfm.groupby("segment").agg(
        customers=("monetary", "size"), revenue=("monetary", "sum")
    )
    order = seg["revenue"].sort_values(ascending=True).index
    seg = seg.loc[order]

    fig, axes = plt.subplots(1, 2, figsize=(12, 5))
    axes[0].barh(seg.index, seg["customers"], color=PALETTE[1])
    axes[0].set_title("Customers per Segment")
    axes[0].set_xlabel("Customers")

    axes[1].barh(seg.index, seg["revenue"] / 1_000, color=ACCENT)
    axes[1].set_title("Revenue per Segment")
    axes[1].set_xlabel("Revenue ($000s)")
    fig.suptitle("RFM Customer Segmentation", fontsize=15, fontweight="bold")
    fig.tight_layout()
    fig.savefig(f"{OUT}/rfm_segments.png", dpi=130)
    plt.close(fig)


def make_cover(df: pd.DataFrame, rfm: pd.DataFrame, k: dict) -> None:
    """Composite dashboard image used as the portfolio preview."""
    fig = plt.figure(figsize=(11, 6.5))
    gs = fig.add_gridspec(2, 2, hspace=0.45, wspace=0.25)
    fig.suptitle("E-commerce Retail Analytics", fontsize=18, fontweight="bold", color=INK)

    ax0 = fig.add_subplot(gs[0, :])
    monthly = df.set_index("order_date")["revenue"].resample("MS").sum() / 1_000
    ax0.plot(monthly.index, monthly.values, color=ACCENT, linewidth=2.4)
    ax0.fill_between(monthly.index, monthly.values, color=ACCENT, alpha=0.12)
    ax0.set_title("Monthly Revenue ($000s)")

    ax1 = fig.add_subplot(gs[1, 0])
    by_cat = df.groupby("category")["revenue"].sum().sort_values() / 1_000
    ax1.barh(by_cat.index, by_cat.values, color=PALETTE[2])
    ax1.set_title("Revenue by Category")
    ax1.tick_params(labelsize=8)

    ax2 = fig.add_subplot(gs[1, 1])
    seg = rfm["segment"].value_counts()
    ax2.barh(seg.index[::-1], seg.values[::-1], color=PALETTE[1])
    ax2.set_title("RFM Segments")
    ax2.tick_params(labelsize=8)

    for ax in (ax0, ax1, ax2):
        ax.grid(color="#eeeeee")
        for s in ("top", "right"):
            ax.spines[s].set_visible(False)
    fig.savefig(f"{OUT}/cover.png", dpi=130, bbox_inches="tight")
    plt.close(fig)


def write_summary(df: pd.DataFrame, rfm: pd.DataFrame, k: dict) -> None:
    seg = rfm.groupby("segment").agg(
        customers=("monetary", "size"), revenue=("monetary", "sum")
    ).sort_values("revenue", ascending=False)
    seg["revenue_share"] = seg["revenue"] / seg["revenue"].sum()

    lines = [
        "# Retail E-commerce Analytics - Summary\n",
        f"- **Date range:** {df['order_date'].min().date()} to {df['order_date'].max().date()}",
        f"- **Gross revenue:** ${k['gross_revenue']:,.0f}",
        f"- **Orders:** {k['total_orders']:,}",
        f"- **Unique customers:** {k['unique_customers']:,}",
        f"- **Average order value:** ${k['avg_order_value']:,.2f}",
        f"- **Return rate:** {k['return_rate']:.1%}",
        f"- **Repeat-customer rate:** {k['repeat_customer_rate']:.1%}",
        f"- **Revenue per customer:** ${k['revenue_per_customer']:,.2f}\n",
        "## RFM segment breakdown\n",
        "| Segment | Customers | Revenue | Revenue share |",
        "| --- | ---: | ---: | ---: |",
    ]
    for name, row in seg.iterrows():
        lines.append(
            f"| {name} | {int(row['customers']):,} | ${row['revenue']:,.0f} | {row['revenue_share']:.1%} |"
        )
    top = seg.index[0]
    lines.append(
        f"\n**Key insight:** *{top}* customers make up "
        f"{seg.loc[top, 'customers'] / k['unique_customers']:.1%} of the base but drive "
        f"{seg.loc[top, 'revenue_share']:.1%} of revenue - the clearest target for retention spend."
    )
    with open(f"{OUT}/summary.md", "w") as fh:
        fh.write("\n".join(lines) + "\n")
    with open(f"{OUT}/metrics.json", "w") as fh:
        json.dump(k, fh, indent=2)


def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    _style()
    df = load()
    k = kpis(df)
    plot_monthly_revenue(df)
    plot_category_revenue(df)
    rfm = compute_rfm(df)
    plot_rfm_segments(rfm)
    make_cover(df, rfm, k)
    write_summary(df, rfm, k)

    print("=== Retail E-commerce Analytics ===")
    for key, val in k.items():
        print(f"{key:>24}: {val:,.2f}" if isinstance(val, float) else f"{key:>24}: {val:,}")
    print("Segments:")
    print(rfm["segment"].value_counts().to_string())
    print(f"\nSaved charts + summary to {OUT}/")


if __name__ == "__main__":
    main()
