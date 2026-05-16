from fastapi import APIRouter

from models.request_models import CodeRequest
from services.ai_service import review_code_logic

router = APIRouter()


@router.post("/review")
def review_code(request: CodeRequest):

    return review_code_logic(
        request.code,
        request.language
    )