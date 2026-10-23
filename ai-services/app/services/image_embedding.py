
import torch
import torch.nn.functional as F
from PIL import Image

from app.core.clip_model import get_clip_components


def generate_image_embedding(image: Image.Image) -> list[float]:
    """
    Convert a PIL image into a normalized CLIP image embedding.
    """

    model, processor, device = get_clip_components()

    image = image.convert("RGB")

    inputs = processor(
        images=image,
        return_tensors="pt",
    )

    inputs = {
        key: value.to(device)
        for key, value in inputs.items()
    }

    with torch.inference_mode():
        features = model.get_image_features(
            pixel_values=inputs["pixel_values"]
        )

        normalized_features = F.normalize(
            features,
            p=2,
            dim=-1,
        )

    return normalized_features[0].cpu().tolist()
