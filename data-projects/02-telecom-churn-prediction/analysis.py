"""Telecom customer-churn prediction: EDA + supervised classification.

Reads data/telecom_churn.csv, runs churn EDA, trains Logistic Regression and
Random Forest models inside a scikit-learn Pipeline (with proper encoding and
scaling), evaluates them on a held-out test set (accuracy, precision, recall,
F1, ROC-AUC), and saves charts + a metrics summary to outputs/.

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
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
    roc_curve,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

ACCENT = "#d97736"
INK = "#2b2b2b"
OUT = "outputs"

CATEGORICAL = ["contract", "internet_service", "payment_method"]
NUMERIC = [
    "senior_citizen", "partner", "dependents", "tenure_months",
    "tech_support", "online_security", "streaming", "paperless_billing",
    "monthly_charges", "total_charges",
]
TARGET = "churn"


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
    return pd.read_csv("data/telecom_churn.csv")


def plot_eda(df: pd.DataFrame) -> None:
    fig, axes = plt.subplots(1, 3, figsize=(14, 4.4))

    by_contract = df.groupby("contract")["churn"].mean().sort_values() * 100
    axes[0].bar(by_contract.index, by_contract.values, color=ACCENT)
    axes[0].set_title("Churn Rate by Contract")
    axes[0].set_ylabel("Churn %")
    axes[0].tick_params(axis="x", rotation=20)

    bins = pd.cut(df["tenure_months"], [0, 12, 24, 48, 72],
                  labels=["0-12", "13-24", "25-48", "49-72"])
    by_tenure = df.groupby(bins, observed=True)["churn"].mean() * 100
    axes[1].bar(by_tenure.index.astype(str), by_tenure.values, color="#3d7ea6")
    axes[1].set_title("Churn Rate by Tenure (months)")
    axes[1].set_ylabel("Churn %")

    churned = df[df["churn"] == 1]["monthly_charges"]
    stayed = df[df["churn"] == 0]["monthly_charges"]
    axes[2].hist([stayed, churned], bins=25, stacked=True,
                 color=["#5a9e6f", ACCENT], label=["Stayed", "Churned"])
    axes[2].set_title("Monthly Charges by Outcome")
    axes[2].set_xlabel("Monthly charges ($)")
    axes[2].legend()

    fig.tight_layout()
    fig.savefig(f"{OUT}/eda_churn.png", dpi=130)
    plt.close(fig)


def build_pipeline(model) -> Pipeline:
    pre = ColumnTransformer([
        ("cat", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL),
        ("num", StandardScaler(), NUMERIC),
    ])
    return Pipeline([("pre", pre), ("model", model)])


def evaluate(name: str, pipe: Pipeline, X_test, y_test) -> dict:
    proba = pipe.predict_proba(X_test)[:, 1]
    pred = (proba >= 0.5).astype(int)
    return {
        "model": name,
        "accuracy": accuracy_score(y_test, pred),
        "precision": precision_score(y_test, pred),
        "recall": recall_score(y_test, pred),
        "f1": f1_score(y_test, pred),
        "roc_auc": roc_auc_score(y_test, proba),
        "_proba": proba,
        "_pred": pred,
    }


def plot_roc(results: list[dict], y_test) -> None:
    fig, ax = plt.subplots(figsize=(6, 5.5))
    for res, color in zip(results, [ACCENT, "#3d7ea6"]):
        fpr, tpr, _ = roc_curve(y_test, res["_proba"])
        ax.plot(fpr, tpr, color=color, linewidth=2.2,
                label=f"{res['model']} (AUC={res['roc_auc']:.3f})")
    ax.plot([0, 1], [0, 1], "--", color="#bbbbbb")
    ax.set_xlabel("False positive rate")
    ax.set_ylabel("True positive rate")
    ax.set_title("ROC Curve")
    ax.legend(loc="lower right")
    fig.tight_layout()
    fig.savefig(f"{OUT}/roc_curve.png", dpi=130)
    plt.close(fig)


def plot_confusion(best: dict, y_test) -> None:
    cm = confusion_matrix(y_test, best["_pred"])
    fig, ax = plt.subplots(figsize=(5, 4.5))
    im = ax.imshow(cm, cmap="Oranges")
    ax.set_xticks([0, 1], ["Pred Stay", "Pred Churn"])
    ax.set_yticks([0, 1], ["Actual Stay", "Actual Churn"])
    for i in range(2):
        for j in range(2):
            ax.text(j, i, f"{cm[i, j]:,}", ha="center", va="center",
                    color="white" if cm[i, j] > cm.max() / 2 else INK, fontsize=13)
    ax.set_title(f"Confusion Matrix - {best['model']}")
    fig.colorbar(im, fraction=0.046, pad=0.04)
    fig.tight_layout()
    fig.savefig(f"{OUT}/confusion_matrix.png", dpi=130)
    plt.close(fig)


def plot_feature_importance(pipe: Pipeline) -> pd.Series:
    pre = pipe.named_steps["pre"]
    cat_names = pre.named_transformers_["cat"].get_feature_names_out(CATEGORICAL)
    feat_names = list(cat_names) + NUMERIC
    importances = pd.Series(
        pipe.named_steps["model"].feature_importances_, index=feat_names
    ).sort_values().tail(12)
    fig, ax = plt.subplots(figsize=(8, 5.5))
    ax.barh(importances.index, importances.values, color=ACCENT)
    ax.set_title("Top Churn Drivers (Random Forest)")
    ax.set_xlabel("Feature importance")
    fig.tight_layout()
    fig.savefig(f"{OUT}/feature_importance.png", dpi=130)
    plt.close(fig)
    return importances


def make_cover(df, results, y_test, importances) -> None:
    fig = plt.figure(figsize=(11, 6.5))
    gs = fig.add_gridspec(2, 2, hspace=0.5, wspace=0.3)
    fig.suptitle("Telecom Customer Churn Prediction", fontsize=18, fontweight="bold")

    ax0 = fig.add_subplot(gs[0, 0])
    by_contract = df.groupby("contract")["churn"].mean().sort_values() * 100
    ax0.bar(by_contract.index, by_contract.values, color=ACCENT)
    ax0.set_title("Churn Rate by Contract"); ax0.set_ylabel("%")
    ax0.tick_params(axis="x", rotation=20, labelsize=8)

    ax1 = fig.add_subplot(gs[0, 1])
    for res, color in zip(results, [ACCENT, "#3d7ea6"]):
        fpr, tpr, _ = roc_curve(y_test, res["_proba"])
        ax1.plot(fpr, tpr, color=color, linewidth=2, label=f"{res['model']} ({res['roc_auc']:.2f})")
    ax1.plot([0, 1], [0, 1], "--", color="#bbbbbb")
    ax1.set_title("ROC Curve"); ax1.legend(fontsize=7, loc="lower right")

    ax2 = fig.add_subplot(gs[1, :])
    imp = importances.tail(8)
    ax2.barh(imp.index, imp.values, color="#3d7ea6")
    ax2.set_title("Top Churn Drivers"); ax2.tick_params(labelsize=8)

    for ax in (ax0, ax1, ax2):
        ax.grid(color="#eeeeee")
        for s in ("top", "right"):
            ax.spines[s].set_visible(False)
    fig.savefig(f"{OUT}/cover.png", dpi=130, bbox_inches="tight")
    plt.close(fig)


def write_summary(df, results, best) -> None:
    lines = [
        "# Telecom Customer Churn Prediction - Summary\n",
        f"- **Customers:** {len(df):,}",
        f"- **Overall churn rate:** {df['churn'].mean():.1%}\n",
        "## Model performance (held-out test set)\n",
        "| Model | Accuracy | Precision | Recall | F1 | ROC-AUC |",
        "| --- | ---: | ---: | ---: | ---: | ---: |",
    ]
    for r in results:
        lines.append(
            f"| {r['model']} | {r['accuracy']:.3f} | {r['precision']:.3f} | "
            f"{r['recall']:.3f} | {r['f1']:.3f} | {r['roc_auc']:.3f} |"
        )
    lines.append(
        f"\n**Best model:** {best['model']} (ROC-AUC {best['roc_auc']:.3f}). "
        "The strongest churn drivers are month-to-month contracts, low tenure, "
        "fiber-optic service, and electronic-check payment - a clear profile for "
        "proactive retention offers."
    )
    with open(f"{OUT}/summary.md", "w") as fh:
        fh.write("\n".join(lines) + "\n")
    clean = [{k: v for k, v in r.items() if not k.startswith("_")} for r in results]
    with open(f"{OUT}/metrics.json", "w") as fh:
        json.dump(clean, fh, indent=2)


def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    _style()
    df = load()
    plot_eda(df)

    X = df[CATEGORICAL + NUMERIC]
    y = df[TARGET]
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=SEED_SPLIT, stratify=y
    )

    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, class_weight="balanced"),
        "Random Forest": RandomForestClassifier(
            n_estimators=300, max_depth=12, min_samples_leaf=15,
            class_weight="balanced", random_state=SEED_SPLIT, n_jobs=-1
        ),
    }
    results = []
    fitted = {}
    for name, model in models.items():
        pipe = build_pipeline(model)
        pipe.fit(X_train, y_train)
        fitted[name] = pipe
        results.append(evaluate(name, pipe, X_test, y_test))

    plot_roc(results, y_test)
    best = max(results, key=lambda r: r["roc_auc"])
    plot_confusion(best, y_test)
    importances = plot_feature_importance(fitted["Random Forest"])
    make_cover(df, results, y_test, importances)
    write_summary(df, results, best)

    print("=== Telecom Churn Prediction ===")
    print(f"Churn rate: {df['churn'].mean():.1%}")
    for r in results:
        print(f"{r['model']:>20}: acc={r['accuracy']:.3f} "
              f"recall={r['recall']:.3f} auc={r['roc_auc']:.3f}")
    print(f"Best: {best['model']} (AUC {best['roc_auc']:.3f})")
    print(f"Saved charts + summary to {OUT}/")


SEED_SPLIT = 7

if __name__ == "__main__":
    main()
