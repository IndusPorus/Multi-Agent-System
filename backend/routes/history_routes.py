from fastapi import (
    APIRouter,
    Depends
)

from sqlalchemy.orm import Session

from database import (
    SessionLocal
)

from models.history import (
    History
)

from utils.auth import (
    get_current_user
)


router = APIRouter()


@router.get("/history")
def get_history(

    current_user = Depends(
        get_current_user
    )
):

    if not current_user:

        return {
            "error": "Unauthorized"
        }

    db: Session = SessionLocal()

    try:

        history = db.query(History).filter(

            History.user_id ==
            current_user.id

        ).all()

        result = []

        for item in history:

            result.append({

                "id": item.id,

                "language": item.language,

                "code": item.code,

                "output": item.output,

                "review": item.review,
            })

        return result

    finally:

        db.close()