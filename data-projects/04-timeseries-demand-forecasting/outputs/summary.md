# Ride-Share Demand Forecasting - Summary

- **Series length:** 1,096 days (2022-01-01 to 2024-12-31)
- **Mean daily trips:** 9,788
- **Test window:** last 90 days

## Forecast accuracy (test set)

| Model | MAE | RMSE | MAPE |
| --- | ---: | ---: | ---: |
| Seasonal-naive (t-7) | 717 | 1,102 | 7.58% |
| Linear Regression | 491 | 816 | 5.37% |
| Random Forest | 665 | 944 | 6.99% |

**Best model:** Linear Regression (MAPE 5.37%). Calendar-feature regression captures the growth trend plus weekly and yearly seasonality, beating the seasonal-naive baseline.
