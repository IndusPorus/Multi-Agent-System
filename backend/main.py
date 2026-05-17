from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.auth_routes import router as auth_router
from routes.review_routes import router as review_router
from routes.execute_routes import router as execute_router
from database import engine, Base
from models.user import User
from models.history import History
Base.metadata.create_all(bind=engine)
app = FastAPI(
    title="AI Code Review Platform",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routes
app.include_router(review_router)
app.include_router(execute_router)

app.include_router(auth_router)
@app.get("/")
def home():
    return {
        "message": "AI Platform Running"
    }