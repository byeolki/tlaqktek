from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import sql_connection, create_tables
from app.core.config import settings
from app.core.redis import redis_connection
from app.api import auth, users, platforms, items

app = FastAPI(title=settings.APP_NAME, version=settings.VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    sql_connection()
    redis_connection()
    create_tables() # 개발용

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(platforms.router)
app.include_router(items.router)

@app.get("/")
async def root():
    return {"message": "Welcome to '심밧다' backend"}
