from fastapi import APIRouter

router = APIRouter(
    prefix="/soil",
    tags=["Soil Assessment"]
)

@router.get("/recommend")
def recommend_crop():
    return {
        "best_crop": "Tomato",
        "confidence": 92
    }