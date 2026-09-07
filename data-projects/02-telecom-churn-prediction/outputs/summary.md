# Telecom Customer Churn Prediction - Summary

- **Customers:** 7,500
- **Overall churn rate:** 32.0%

## Model performance (held-out test set)

| Model | Accuracy | Precision | Recall | F1 | ROC-AUC |
| --- | ---: | ---: | ---: | ---: | ---: |
| Logistic Regression | 0.745 | 0.575 | 0.775 | 0.661 | 0.838 |
| Random Forest | 0.740 | 0.569 | 0.784 | 0.659 | 0.833 |

**Best model:** Logistic Regression (ROC-AUC 0.838). The strongest churn drivers are month-to-month contracts, low tenure, fiber-optic service, and electronic-check payment - a clear profile for proactive retention offers.
