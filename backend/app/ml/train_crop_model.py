"""
HydroNutri IntelliSense - Crop Recommendation Model Trainer
===========================================================

Trains a Random Forest classifier that recommends a crop from live soil
sensor readings collected by the ESP32.

The model uses only the six parameters the hardware actually measures:

    N, P, K          - NPK soil nutrient sensor
    temperature      - DHT22 / soil probe
    humidity         - DHT22
    ph               - pH probe

Outputs:
    models/crop_model.pkl           - trained model + feature order + crops
    models/crop_model_metrics.json  - accuracy figures for the thesis

Usage:
    python train_crop_model.py
    python train_crop_model.py --data Crop_Recommendation.xlsx
    python train_crop_model.py --outdir ml/models
"""

import argparse
import json
import os
from datetime import datetime

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (accuracy_score, classification_report,
                             confusion_matrix)
from sklearn.model_selection import (StratifiedKFold, cross_val_score,
                                     train_test_split)

# The six features the ESP32 can measure, in the exact order the model
# expects them. The backend must build its input row in this same order.
FEATURES = ["N", "P", "K", "temperature", "humidity", "ph"]

TARGET = "label"
RANDOM_STATE = 42


def load_dataset(path):
    """Reads the dataset from .xlsx or .csv and validates its columns."""
    if path.lower().endswith(".csv"):
        df = pd.read_csv(path)
    else:
        df = pd.read_excel(path)

    missing = [c for c in FEATURES + [TARGET] if c not in df.columns]
    if missing:
        raise ValueError(
            f"Dataset is missing required columns: {missing}\n"
            f"Columns found: {list(df.columns)}"
        )

    # Keep only the columns we train on, so any stray extra column in the
    # spreadsheet cannot accidentally leak into the model.
    df = df[FEATURES + [TARGET]]

    before = len(df)
    df = df.dropna().drop_duplicates()
    if len(df) != before:
        print(f"  Cleaned: removed {before - len(df)} empty/duplicate rows")

    return df


def describe_dataset(df):
    print("\n" + "=" * 62)
    print("DATASET SUMMARY")
    print("=" * 62)
    print(f"Rows: {len(df)}    Crops: {df[TARGET].nunique()}")

    print("\nSamples per crop:")
    for crop, count in df[TARGET].value_counts().items():
        print(f"  {crop:<12} {count:>4}")

    print("\nFeature ranges (useful for Chapter 4):")
    stats = df[FEATURES].describe().T[["min", "mean", "max"]]
    print(stats.round(2).to_string())


def train_model(df):
    """Trains and evaluates the Random Forest. Returns model + metrics."""
    print("\n" + "=" * 62)
    print("TRAINING CROP RECOMMENDATION MODEL")
    print("=" * 62)
    print(f"Features ({len(FEATURES)}): {', '.join(FEATURES)}")

    X = df[FEATURES]
    y = df[TARGET]

    # Stratified split keeps the crop proportions identical in train and
    # test, which matters because the crops are not evenly represented.
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_STATE, stratify=y
    )

    model = RandomForestClassifier(
        n_estimators=300,
        max_depth=None,
        min_samples_leaf=1,
        class_weight="balanced",   # compensates for the uneven crop counts
        random_state=RANDOM_STATE,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    predictions = model.predict(X_test)
    test_accuracy = accuracy_score(y_test, predictions)

    # 5-fold cross-validation is the more defensible number to quote in
    # the thesis, because a single 20% split of ~500 rows is small.
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)
    cv_scores = cross_val_score(model, X, y, cv=cv, n_jobs=-1)

    print(f"\nHold-out test accuracy : {test_accuracy * 100:.2f}%")
    print(f"5-fold CV accuracy     : {cv_scores.mean() * 100:.2f}% "
          f"(+/- {cv_scores.std() * 100:.2f}%)   <-- quote this one")

    print("\nPer-crop performance:")
    print(classification_report(y_test, predictions, digits=3))

    print("Confusion matrix (rows = actual, columns = predicted):")
    labels = sorted(y.unique())
    matrix = confusion_matrix(y_test, predictions, labels=labels)
    print(f"{'':<12}" + "".join(f"{c[:8]:>10}" for c in labels))
    for label, row in zip(labels, matrix):
        print(f"{label:<12}" + "".join(f"{v:>10}" for v in row))

    print("\nFeature importance:")
    importance = sorted(
        zip(FEATURES, model.feature_importances_),
        key=lambda pair: pair[1],
        reverse=True,
    )
    for feature, score in importance:
        print(f"  {feature:<14} {score:.4f}  {'#' * int(score * 50)}")

    metrics = {
        "features": FEATURES,
        "crops": labels,
        "training_samples": int(len(X_train)),
        "test_samples": int(len(X_test)),
        "test_accuracy": round(float(test_accuracy), 4),
        "cv_accuracy_mean": round(float(cv_scores.mean()), 4),
        "cv_accuracy_std": round(float(cv_scores.std()), 4),
        "feature_importance": {f: round(float(s), 4) for f, s in importance},
        "confusion_matrix": matrix.tolist(),
        "confusion_matrix_labels": labels,
        "trained_at": datetime.now().isoformat(timespec="seconds"),
    }
    return model, metrics


def sanity_check(model):
    """Predicts on one hand-made reading so you can see it working."""
    sample = {
        "N": 95.0, "P": 55.0, "K": 90.0,
        "temperature": 19.0, "humidity": 72.0, "ph": 6.4,
    }
    row = pd.DataFrame([sample])[FEATURES]

    prediction = model.predict(row)[0]
    probabilities = model.predict_proba(row)[0]

    print("\n" + "=" * 62)
    print("SANITY CHECK - one simulated sensor reading")
    print("=" * 62)
    print(sample)
    print(f"\n  Recommended crop: {prediction}")
    print("  Confidence per crop:")
    for crop, probability in sorted(
        zip(model.classes_, probabilities), key=lambda p: p[1], reverse=True
    ):
        print(f"    {crop:<12} {probability * 100:5.1f}%")


def main():
    parser = argparse.ArgumentParser(description="Train crop recommendation model")
    parser.add_argument("--data", default="Crop_Recommendation.xlsx",
                        help="path to the dataset (.xlsx or .csv)")
    parser.add_argument("--outdir", default="models",
                        help="folder to save the trained model into")
    args = parser.parse_args()

    print("HydroNutri IntelliSense - Crop Recommendation Trainer")
    print(f"Dataset: {args.data}")

    df = load_dataset(args.data)
    describe_dataset(df)

    model, metrics = train_model(df)
    sanity_check(model)

    os.makedirs(args.outdir, exist_ok=True)
    model_path = os.path.join(args.outdir, "crop_model.pkl")
    metrics_path = os.path.join(args.outdir, "crop_model_metrics.json")

    # Bundle the feature order with the model. Without this, the backend
    # can silently pass columns in the wrong order and get wrong answers
    # with no error raised.
    joblib.dump(
        {"model": model,
         "features": FEATURES,
         "crops": sorted(df[TARGET].unique())},
        model_path,
    )

    with open(metrics_path, "w") as handle:
        json.dump(metrics, handle, indent=2)

    print("\n" + "=" * 62)
    print("SAVED")
    print("=" * 62)
    print(f"  Model   -> {model_path}")
    print(f"  Metrics -> {metrics_path}")
    print("\nNext: load models/crop_model.pkl in your FastAPI /crop endpoint.")


if __name__ == "__main__":
    main()
