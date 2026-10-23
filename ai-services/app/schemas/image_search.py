
from pydantic import BaseModel


class ImageEmbeddingResponse(BaseModel):
    success: bool
    model: str
    dimensions: int
    embedding: list[float]
