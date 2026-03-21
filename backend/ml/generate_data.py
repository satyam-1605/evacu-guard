"""
Generate synthetic training data for Jaipur flood risk classification.
500 zone samples with 6 features, labeled low/medium/high/critical.
"""
import numpy as np
import pandas as pd
import os

np.random.seed(42)
N = 500

# Feature distributions for Jaipur zones
elevation_m       = np.random.normal(430, 18, N).clip(405, 470)   # Jaipur avg ~430m
dist_to_water_km  = np.random.exponential(2.5, N).clip(0.05, 12)  # Most zones within 3km
rainfall_mm       = np.random.exponential(25, N).clip(0, 120)     # 0-120 mm/hr
soil_drainage     = np.random.choice([1, 2, 3, 4, 5], N,          # 1=poor clay 5=sandy
                                     p=[0.25, 0.25, 0.25, 0.15, 0.10])
historical_floods = np.random.poisson(3, N).clip(0, 12)           # flood events
population_density = np.random.normal(15000, 8000, N).clip(2000, 55000)

def classify_risk(elev, dist, rain, drain, hist, pop):
    """
    Risk scoring logic derived from real Jaipur hydrology:
    - Lower elevation near water with heavy rain = critical
    - Poor drainage + heavy rain in dense areas = high
    - Historical flood zones always elevated
    """
    score = 0.0

    # Elevation penalty (lower = riskier)
    if elev < 415:
        score += 35
    elif elev < 422:
        score += 20
    elif elev < 430:
        score += 10
    else:
        score += 2

    # Proximity to water
    if dist < 0.5:
        score += 30
    elif dist < 1.5:
        score += 18
    elif dist < 3.0:
        score += 8
    else:
        score += 2

    # Rainfall intensity
    if rain >= 65:
        score += 25
    elif rain >= 35:
        score += 15
    elif rain >= 15:
        score += 7
    else:
        score += 1

    # Soil drainage (poor = riskier)
    score += (6 - drain) * 2.5

    # Historical floods
    score += min(hist * 2.5, 20)

    # Population density (denser = higher impact)
    if pop > 35000:
        score += 8
    elif pop > 20000:
        score += 4
    else:
        score += 1

    # Add noise
    score += np.random.normal(0, 4)

    # Classify
    if score >= 75:
        return "critical"
    elif score >= 50:
        return "high"
    elif score >= 28:
        return "medium"
    else:
        return "low"

labels = [
    classify_risk(elevation_m[i], dist_to_water_km[i], rainfall_mm[i],
                  soil_drainage[i], historical_floods[i], population_density[i])
    for i in range(N)
]

df = pd.DataFrame({
    "elevation_m":        elevation_m,
    "dist_to_water_km":   dist_to_water_km,
    "rainfall_mm":        rainfall_mm,
    "soil_drainage":      soil_drainage,
    "historical_floods":  historical_floods,
    "population_density": population_density,
    "risk_label":         labels,
})

out_path = os.path.join(os.path.dirname(__file__), "training_data.csv")
df.to_csv(out_path, index=False)

print(f"Generated {N} samples -> {out_path}")
print("\nClass distribution:")
print(df["risk_label"].value_counts())
print("\nFeature stats:")
print(df.describe().round(2))
