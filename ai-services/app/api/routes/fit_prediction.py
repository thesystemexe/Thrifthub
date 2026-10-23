
from fastapi import APIRouter, HTTPException

from app.schemas.fit_prediction import (
    FitPredictionRequest,
    FitPredictionResponse,
)
from app.services.fit_prediction import predict_fit


router = APIRouter()


@router.post(
    "/predict",
    response_model=FitPredictionResponse,
)
def predict_fit_route(request: FitPredictionRequest):
    try:
        return predict_fit(request.model_dump())

    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=503,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Fit prediction failed. Check AI service logs.",
        ) from exc
