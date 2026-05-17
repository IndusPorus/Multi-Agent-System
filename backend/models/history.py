from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey
)

from database import Base


class History(Base):

    __tablename__ = "history"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    language = Column(String)

    code = Column(String)

    output = Column(String)

    review = Column(String)