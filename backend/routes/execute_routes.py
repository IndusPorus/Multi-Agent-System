from fastapi import (
    APIRouter,
    Depends
)

from models.request_models import CodeRequest

from services.code_executor import (
    execute_code_logic
)

from database import SessionLocal

from models.history import History

from utils.auth import (
    get_current_user
)


router = APIRouter()


@router.post("/execute")
def execute_code(
    request: CodeRequest,
    current_user = Depends(
        get_current_user
    )
):

    result = execute_code_logic(

        request.code,
        request.language
    )

    # SAVE HISTORY
    if current_user:

        db = SessionLocal()

        history = History(

            user_id=current_user.id,

            language=request.language,

            code=request.code,

            output=result.get(
                "output",
                result.get("error", "")
            ),

            review=""
        )

        db.add(history)

        db.commit()

    return result