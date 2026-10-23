
import io

from fastapi import APIRouter, File, HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError

from app.core.clip_model import (
    MODEL_NAME,
    is_model_loaded,
)
from app.schemas.image_search import ImageEmbeddingResponse
from app.services.image_embedding import generate_image_embedding

router = APIRouter()

MAX_IMAGE_BYTES = 3 * 1024 * 1024

ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
}


@router.post(
    "/embed",
    response_model=ImageEmbeddingResponse,
)
async def embed_image(file: UploadFile = File(...)):
    """Accept a clothing photo and return its CLIP embedding."""

    try:
        if not is_model_loaded():
            raise HTTPException(
                status_code=503,
                detail="AI model is not ready.",
            )

        if file.content_type not in ALLOWED_CONTENT_TYPES:
            raise HTTPException(
                status_code=415,
                detail="Upload a JPEG, PNG, or WebP image.",
            )

        image_bytes = await file.read(MAX_IMAGE_BYTES + 1)

        if not image_bytes:
            raise HTTPException(
                status_code=400,
                detail="The uploaded image is empty.",
            )

        if len(image_bytes) > MAX_IMAGE_BYTES:
            raise HTTPException(
                status_code=413,
                detail="Image must be 3 MB or smaller.",
            )

        # Verify the file is a real, readable image.
        with Image.open(io.BytesIO(image_bytes)) as source:
            source.verify()

        # Reopen after verification and convert to RGB.
        with Image.open(io.BytesIO(image_bytes)) as source:
            image = source.convert("RGB")

        embedding = generate_image_embedding(image)

        return ImageEmbeddingResponse(
            success=True,
            model=MODEL_NAME,
            dimensions=len(embedding),
            embedding=embedding,
        )

    except HTTPException:
        raise

    except (
        UnidentifiedImageError,
        Image.DecompressionBombError,
        OSError,
        ValueError,
    ):
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is not a valid image.",
        )

    finally:
        await file.close()
