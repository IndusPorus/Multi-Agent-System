from fastapi import APIRouter
from models.request_models import CodeRequest
from services.code_executor import execute_code_logic

router = APIRouter()


@router.post("/execute")
def execute_code(request: CodeRequest):

    result = execute_code_logic(
        request.code,
        request.language
    )

    return result