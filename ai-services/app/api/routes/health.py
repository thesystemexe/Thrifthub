
from fastapi import APIRouter

from app.core.clip_model import (
    MODEL_NAME,
    get_model_device,
    is_model_loaded,
)

router = APIRouter()


@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "ThriftHub AI Services",
        "model": MODEL_NAME,
        "device": get_model_device(),
        "model_loaded": is_model_loaded(),
    }
