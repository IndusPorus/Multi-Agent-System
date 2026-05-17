from jose import jwt

from fastapi import Header

from database import SessionLocal

from models.user import User


SECRET_KEY = "SUPER_SECRET_KEY"

ALGORITHM = "HS256"


def get_current_user(
    authorization: str = Header(None)
):

    if not authorization:

        return None

    try:

        token = authorization.split(" ")[1]

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("user_id")

        db = SessionLocal()

        user = db.query(User).filter(
            User.id == user_id
        ).first()

        return user

    except:

        return None