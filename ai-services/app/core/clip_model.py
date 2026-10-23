
from pathlib import Path

import torch
from transformers import CLIPModel, CLIPProcessor

MODEL_NAME = "openai/clip-vit-base-patch32"

# Keep downloaded model files inside ai-services/model_cache.
PROJECT_ROOT = Path(__file__).resolve().parents[2]
MODEL_CACHE = PROJECT_ROOT / "model_cache"

_model = None
_processor = None
_device = None


def load_clip_model():
    """Load CLIP once when the AI service starts."""
    global _model, _processor, _device

    if _model is not None:
        return

    _device = (
        "mps"
        if torch.backends.mps.is_available()
        else "cpu"
    )

    print(f"Loading CLIP model on: {_device}")

    _processor = CLIPProcessor.from_pretrained(
        MODEL_NAME,
        cache_dir=str(MODEL_CACHE),
        use_fast=False,
    )

    _model = CLIPModel.from_pretrained(
        MODEL_NAME,
        cache_dir=str(MODEL_CACHE),
    )

    _model.to(_device)
    _model.eval()

    print("CLIP model loaded successfully.")


def get_clip_components():
    """Return the loaded model, processor and device."""
    if _model is None or _processor is None:
        raise RuntimeError("CLIP model has not been loaded.")

    return _model, _processor, _device


def is_model_loaded():
    return _model is not None and _processor is not None


def get_model_device():
    return _device
