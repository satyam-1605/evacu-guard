"""
Train Random Forest classifier on Jaipur flood risk data.
Saves model to ml/risk_model.joblib
"""
import os
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from sklearn.preprocessing import LabelEncoder

FEATURES = [
    "elevation_m",
    "dist_to_water_km",
    "rainfall_mm",
    "soil_drainage",
    "historical_floods",
    "population_density",
]
LABEL_ORDER = ["low", "medium", "high", "critical"]

def main():
    data_path = os.path.join(os.path.dirname(__file__), "training_data.csv")
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Run generate_data.py first: {data_path}")

    df = pd.read_csv(data_path)
    X = df[FEATURES].values
    y = df["risk_label"].values

    le = LabelEncoder()
    le.classes_ = np.array(LABEL_ORDER)
    y_enc = le.transform(y)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y_enc, test_size=0.2, random_state=42, stratify=y_enc
    )

    clf = RandomForestClassifier(
        n_estimators=100,
        max_depth=8,
        min_samples_split=4,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
    )
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)

    print("=" * 50)
    print("EvacuGuard Risk Model — Training Complete")
    print("=" * 50)
    print(f"\nAccuracy: {acc:.4f} ({acc*100:.1f}%)")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=LABEL_ORDER))

    print("Feature Importances:")
    for feat, imp in sorted(zip(FEATURES, clf.feature_importances_), key=lambda x: -x[1]):
        bar = "#" * int(imp * 40)
        print(f"  {feat:<22} {imp:.4f}  {bar}")

    # Save model bundle
    model_bundle = {
        "model": clf,
        "label_encoder": le,
        "features": FEATURES,
        "label_order": LABEL_ORDER,
        "accuracy": acc,
    }
    out_path = os.path.join(os.path.dirname(__file__), "risk_model.joblib")
    joblib.dump(model_bundle, out_path)
    print(f"\n[OK] Model saved -> {out_path}")

if __name__ == "__main__":
    main()
