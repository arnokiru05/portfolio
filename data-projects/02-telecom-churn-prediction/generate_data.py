"""Generate a realistic synthetic telecom customer-churn dataset.

Churn is driven by a logistic function of the customer's contract type, tenure,
monthly charges, internet service, support add-ons, and payment method, plus
random noise. This produces a signal that a model can learn without being
trivially separable - mirroring the well-known Telco churn problem.

Usage:
    python generate_data.py
"""
from __future__ import annotations

import numpy as np
import pandas as pd

SEED = 7
N = 7_500


def _sigmoid(x: np.ndarray) -> np.ndarray:
    return 1.0 / (1.0 + np.exp(-x))


def generate() -> pd.DataFrame:
    rng = np.random.default_rng(SEED)

    senior = (rng.random(N) < 0.16).astype(int)
    partner = (rng.random(N) < 0.48).astype(int)
    dependents = ((rng.random(N) < 0.3) & (partner == 1)).astype(int)

    tenure = rng.integers(1, 73, N)

    contract = rng.choice(
        ["Month-to-month", "One year", "Two year"], N, p=[0.55, 0.24, 0.21]
    )
    internet = rng.choice(
        ["Fiber optic", "DSL", "No"], N, p=[0.44, 0.34, 0.22]
    )
    payment = rng.choice(
        ["Electronic check", "Mailed check", "Bank transfer", "Credit card"],
        N,
        p=[0.34, 0.23, 0.22, 0.21],
    )
    paperless = (rng.random(N) < 0.59).astype(int)

    has_net = internet != "No"
    tech_support = np.where(has_net, rng.random(N) < 0.4, False)
    online_security = np.where(has_net, rng.random(N) < 0.38, False)
    streaming = np.where(has_net, rng.random(N) < 0.5, False)

    # Monthly charges build up from base + service add-ons.
    base = 19.5
    charges = (
        base
        + np.where(internet == "Fiber optic", 45, np.where(internet == "DSL", 25, 0))
        + tech_support * 7
        + online_security * 6
        + streaming * 11
        + rng.normal(0, 3, N)
    ).clip(18, 120).round(2)

    total_charges = (charges * tenure * rng.uniform(0.9, 1.05, N)).round(2)

    # Churn logit: month-to-month, fiber, electronic check, short tenure, high
    # charges, senior, and no support all push churn up; long contracts and
    # long tenure pull it down.
    logit = (
        -1.15
        + (contract == "Month-to-month") * 1.35
        + (contract == "Two year") * -1.55
        + (contract == "One year") * -0.7
        + (internet == "Fiber optic") * 0.75
        + (payment == "Electronic check") * 0.7
        + (-0.03 * tenure)
        + (0.012 * (charges - charges.mean()))
        + senior * 0.35
        + (~tech_support & has_net) * 0.4
        + (~online_security & has_net) * 0.3
        + partner * -0.25
        + rng.normal(0, 0.55, N)
    )
    churn = (rng.random(N) < _sigmoid(logit)).astype(int)

    df = pd.DataFrame(
        {
            "customer_id": [f"T{200000 + i}" for i in range(N)],
            "senior_citizen": senior,
            "partner": partner,
            "dependents": dependents,
            "tenure_months": tenure,
            "contract": contract,
            "internet_service": internet,
            "tech_support": tech_support.astype(int),
            "online_security": online_security.astype(int),
            "streaming": streaming.astype(int),
            "paperless_billing": paperless,
            "payment_method": payment,
            "monthly_charges": charges,
            "total_charges": total_charges,
            "churn": churn,
        }
    )
    return df


if __name__ == "__main__":
    data = generate()
    out = "data/telecom_churn.csv"
    data.to_csv(out, index=False)
    print(f"Wrote {len(data):,} customers to {out}")
    print(f"Overall churn rate: {data['churn'].mean():.1%}")
