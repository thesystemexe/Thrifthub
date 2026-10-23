
from functools import lru_cache
from pathlib import Path

import joblib
import pandas as pd


# Project root: the folder containing ai-services and ml-training.
PROJECT_ROOT = Path(__file__).resolve().parents[3]

MODEL_PATH = (
    PROJECT_ROOT
    / "ml-training"
    / "thrifthub_synthetic_fit_model.joblib"
)

FEATURE_COLUMNS = [
    "garment_category",
    "body_chest_in",
    "body_shoulder_width_in",
    "body_waist_in",
    "body_inseam_in",
    "body_height_in",
    "preferred_fit",
    "tag_size",
    "garment_pit_to_pit_in",
    "garment_length_in",
    "garment_shoulder_width_in",
    "garment_sleeve_length_in",
    "garment_waist_in",
    "garment_inseam_in",
]


@lru_cache(maxsize=1)
def load_fit_model():
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Fit model not found at {MODEL_PATH}. "
            "Train the model first or update MODEL_PATH."
        )

    return joblib.load(MODEL_PATH)


def predict_fit(input_data: dict) -> dict:
    model = load_fit_model()

    # Keep feature names and order consistent with training.
    dataframe = pd.DataFrame(
        [{column: input_data.get(column) for column in FEATURE_COLUMNS}],
        columns=FEATURE_COLUMNS,
    )

    prediction = str(model.predict(dataframe)[0])

    result = {
        "predicted_fit": prediction,
        "model_type": "synthetic_data_development_only",
        "production_ready": False,
    }

    if hasattr(model, "predict_proba"):
        probabilities = model.predict_proba(dataframe)[0]
        result["confidence_by_outcome"] = {
            str(label): round(float(probability), 4)
            for label, probability in zip(
                model.classes_, probabilities
            )
        }

    return result
