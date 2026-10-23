"""
ThriftHub synthetic fit-outcome training example.

IMPORTANT:
- This script trains on SYNTHETIC, rule-generated data only.
- Good evaluation scores do NOT demonstrate real-world fit accuracy.
- Do not use the resulting model for production recommendations without
  validating it against representative, consented customer feedback.
- Measurements are in inches. Blank fields mean not applicable/not supplied.
"""
from pathlib import Path
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import joblib

CSV_PATH = Path(__file__).with_name("thrifthub_synthetic_fit_training_3000.csv")
MODEL_PATH = Path(__file__).with_name("thrifthub_synthetic_fit_model.joblib")
TARGET = "fit_outcome"
DROP_COLUMNS = ["synthetic_data", "record_id", TARGET]

def main():
    df = pd.read_csv(CSV_PATH)
    if len(df) != 3000:
        raise ValueError(f"Expected 3000 rows, found {len(df)}")
    if not df["synthetic_data"].astype(str).str.lower().isin(["true", "1"]).all():
        raise ValueError("Expected synthetic_data=True for every row.")

    X = df.drop(columns=DROP_COLUMNS)
    y = df[TARGET]
    numeric = X.select_dtypes(include=["number"]).columns.tolist()
    categorical = X.select_dtypes(exclude=["number"]).columns.tolist()

    numeric_pipe = Pipeline([
        ("imputer", SimpleImputer(strategy="median", add_indicator=True)),
        ("scaler", StandardScaler()),
    ])
    categorical_pipe = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore")),
    ])
    preprocessor = ColumnTransformer([
        ("numeric", numeric_pipe, numeric),
        ("categorical", categorical_pipe, categorical),
    ])
    model = Pipeline([
        ("preprocess", preprocessor),
        ("classifier", RandomForestClassifier(
            n_estimators=300, min_samples_leaf=3,
            class_weight="balanced", random_state=42
        )),
    ])
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=.2, random_state=42, stratify=y
    )
    model.fit(X_train, y_train)
    pred = model.predict(X_test)
    print("WARNING: evaluation is on synthetic test data only.")
    print(f"Rows: {len(df)}")
    print(f"Synthetic holdout accuracy: {accuracy_score(y_test, pred):.3f}")
    print(classification_report(y_test, pred, zero_division=0))
    print("Confusion matrix labels:", sorted(y.unique()))
    print(confusion_matrix(y_test, pred, labels=sorted(y.unique())))
    joblib.dump(model, MODEL_PATH)
    print(f"Saved model: {MODEL_PATH}")
    print("This model is for pipeline testing, not production use.")

if __name__ == "__main__":
    main()
