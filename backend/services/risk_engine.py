"""
Risk Engine: loads trained Random Forest model and exposes predict().
"""
import os
import joblib
import numpy as np
from typing import Dict, Any, Optional

FEATURES = [
    "elevation_m",
    "dist_to_water_km",
    "rainfall_mm",
    "soil_drainage",
    "historical_floods",
    "population_density",
]
LABEL_ORDER = ["low", "medium", "high", "critical"]
RISK_SCORES = {"low": 20, "medium": 50, "high": 75, "critical": 92}


class RiskEngine:
    def __init__(self):
        self._model = None
        self._le = None
        self._feature_importances: Dict[str, float] = {}
        self._accuracy: float = 0.0
        self._loaded = False

    def load(self) -> bool:
        model_path = os.path.join(
            os.path.dirname(__file__), "..", "ml", "risk_model.joblib"
        )
        model_path = os.path.abspath(model_path)
        if not os.path.exists(model_path):
            print(f"[RiskEngine] Model not found at {model_path} — using rule-based fallback")
            return False
        try:
            bundle = joblib.load(model_path)
            self._model = bundle["model"]
            self._le = bundle["label_encoder"]
            self._accuracy = bundle.get("accuracy", 0.0)
            importances = self._model.feature_importances_
            self._feature_importances = {
                feat: float(imp) for feat, imp in zip(FEATURES, importances)
            }
            self._loaded = True
            print(f"[RiskEngine] Model loaded — accuracy {self._accuracy:.3f}")
            return True
        except Exception as e:
            print(f"[RiskEngine] Failed to load model: {e}")
            return False

    def predict(self, features: Dict[str, float]) -> Dict[str, Any]:
        """
        Returns: {label, risk_score, probabilities, feature_importances}
        """
        X = np.array([[
            features.get("elevation_m", 430),
            features.get("dist_to_water_km", 2.5),
            features.get("rainfall_mm", 0),
            features.get("soil_drainage", 3),
            features.get("historical_floods", 2),
            features.get("population_density", 10000),
        ]])

        if self._loaded and self._model is not None:
            pred_enc = self._model.predict(X)[0]
            proba = self._model.predict_proba(X)[0]
            label = self._le.inverse_transform([pred_enc])[0]
            probabilities = {cls: float(p) for cls, p in zip(LABEL_ORDER, proba)}
        else:
            label = self._rule_based(features)
            probabilities = {l: 0.05 for l in LABEL_ORDER}
            probabilities[label] = 0.85

        risk_score = RISK_SCORES.get(label, 50)
        # Fine-tune score from probabilities
        weighted = sum(RISK_SCORES.get(l, 0) * p for l, p in probabilities.items())
        risk_score = round(weighted, 1)

        return {
            "label": label,
            "risk_score": risk_score,
            "probabilities": probabilities,
            "feature_importances": self._feature_importances,
        }

    def _rule_based(self, features: Dict[str, float]) -> str:
        """Simple rule-based fallback when model not available."""
        score = 0
        elev = features.get("elevation_m", 430)
        dist = features.get("dist_to_water_km", 2.5)
        rain = features.get("rainfall_mm", 0)
        drain = features.get("soil_drainage", 3)
        hist = features.get("historical_floods", 2)

        if elev < 415: score += 3
        elif elev < 422: score += 2
        if dist < 0.5: score += 3
        elif dist < 1.5: score += 2
        if rain >= 65: score += 3
        elif rain >= 35: score += 2
        elif rain >= 15: score += 1
        score += max(0, 3 - drain)
        score += min(hist // 3, 2)

        if score >= 8: return "critical"
        if score >= 5: return "high"
        if score >= 3: return "medium"
        return "low"

    def predict_zone(self, zone_properties: Dict) -> Dict[str, Any]:
        """Predict risk for a hazard zone using its stored properties."""
        features = {
            "elevation_m": zone_properties.get("elevation_m", 430),
            "dist_to_water_km": zone_properties.get("dist_to_water_km", 2.5),
            "rainfall_mm": zone_properties.get("rainfall_mm", 0),
            "soil_drainage": zone_properties.get("soil_drainage", 3),
            "historical_floods": zone_properties.get("historical_floods", 2),
            "population_density": zone_properties.get("population_density", 10000),
        }
        return self.predict(features)


# Singleton
risk_engine = RiskEngine()
