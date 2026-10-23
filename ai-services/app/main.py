
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI

from app.api.routes import health, image_search, fit_prediction
from app.core.clip_model import load_clip_model


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load the existing image-search model once at startup.
    load_clip_model()
    yield
    print("ThriftHub AI service shutting down.")


app = FastAPI(
    title="ThriftHub AI Services",
    description="Local AI services for the ThriftHub project.",
    version="1.0.0",
    lifespan=lifespan,
)

app.include_router(health.router)

app.include_router(
    image_search.router,
    prefix="/image-search",
    tags=["Image Search"],
)

app.include_router(
    fit_prediction.router,
    prefix="/fit-prediction",
    tags=["Fit Prediction"],
)


@app.get("/")
def root():
    return {
        "success": True,
        "message": "ThriftHub AI Services is running.",
    }

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
    )