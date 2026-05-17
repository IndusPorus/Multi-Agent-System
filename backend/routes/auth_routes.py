from fastapi import APIRouter

from pydantic import BaseModel

from sqlalchemy.orm import Session

from database import SessionLocal

from models.user import User

from passlib.context import CryptContext

from jose import jwt

from datetime import (
    datetime,
    timedelta
)


router = APIRouter()


# PASSWORD HASHING

pwd_context = CryptContext(

    schemes=["bcrypt"],

    deprecated="auto"
)


# JWT CONFIG

SECRET_KEY = "SUPER_SECRET_KEY"

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60


# REQUEST MODELS

class SignupRequest(BaseModel):

    username: str

    password: str


class LoginRequest(BaseModel):

    username: str

    password: str


# CREATE JWT TOKEN

def create_access_token(data: dict):

    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(

        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({

        "exp": expire
    })

    encoded_jwt = jwt.encode(

        to_encode,

        SECRET_KEY,

        algorithm=ALGORITHM
    )

    return encoded_jwt


# SIGNUP ROUTE

@router.post("/signup")
def signup(data: SignupRequest):

    db: Session = SessionLocal()

    try:

        existing_user = db.query(User).filter(

            User.username == data.username

        ).first()

        if existing_user:

            return {

                "error":
                "Username already exists"
            }

        hashed_password = pwd_context.hash(

            data.password
        )

        new_user = User(

            username=data.username,

            password=hashed_password
        )

        db.add(new_user)

        db.commit()

        db.refresh(new_user)

        return {

            "message":
            "User created successfully"
        }

    finally:

        db.close()


# LOGIN ROUTE

@router.post("/login")
def login(data: LoginRequest):

    db: Session = SessionLocal()

    try:

        user = db.query(User).filter(

            User.username == data.username

        ).first()

        if not user:

            return {

                "error":
                "Invalid username or password"
            }

        valid_password = pwd_context.verify(

            data.password,

            user.password
        )

        if not valid_password:

            return {

                "error":
                "Invalid username or password"
            }

        access_token = create_access_token({

            "sub": user.username,

            "user_id": user.id
        })

        return {

            "access_token": access_token,

            "token_type": "bearer"
        }

    finally:

        db.close()