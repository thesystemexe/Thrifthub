
from typing import Literal, Optional

from pydantic import BaseModel, Field


class FitPredictionRequest(BaseModel):
    garment_category: Literal["tops", "bottoms"]
    preferred_fit: Literal["slim", "regular", "relaxed"]
    tag_size: str = Field(min_length=1, max_length=20)

    # Body measurements in inches
    body_chest_in: Optional[float] = Field(
        default=None, gt=0, le=100
    )
    body_shoulder_width_in: Optional[float] = Field(
        default=None, gt=0, le=50
    )
    body_waist_in: Optional[float] = Field(
        default=None, gt=0, le=100
    )
    body_inseam_in: Optional[float] = Field(
        default=None, gt=0, le=60
    )
    body_height_in: Optional[float] = Field(
        default=None, gt=0, le=100
    )

    # Garment measurements in inches
    garment_pit_to_pit_in: Optional[float] = Field(
        default=None, gt=0, le=100
    )
    garment_length_in: Optional[float] = Field(
        default=None, gt=0, le=100
    )
    garment_shoulder_width_in: Optional[float] = Field(
        default=None, gt=0, le=60
    )
    garment_sleeve_length_in: Optional[float] = Field(
        default=None, gt=0, le=60
    )
    garment_waist_in: Optional[float] = Field(
        default=None, gt=0, le=100
    )
    garment_inseam_in: Optional[float] = Field(
        default=None, gt=0, le=60
    )


class FitPredictionResponse(BaseModel):
    predicted_fit: str
    model_type: str
    production_ready: bool
    confidence_by_outcome: Optional[dict[str, float]] = None
