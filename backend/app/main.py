"""
Main FastAPI entry point for CORPORATE HELL™ backend.
"""
from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.database import engine, Base
from app.api.endpoints import router as api_router
from app.models import save as _save_model

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("corporate_hell")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables
    if settings.AUTO_CREATE_TABLES:
        try:
            Base.metadata.create_all(bind=engine)
        except Exception as e:
            logger.warning("Table creation note: %s", str(e))
    logger.info("CORPORATE HELL™ Backend online at %s:%s", settings.HOST, settings.PORT)
    yield
    # Shutdown
    logger.info("CORPORATE HELL™ Backend shutting down.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for CORPORATE HELL™: NVIDIA GLM-5.3 AI Dialogue & Save Persistence",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS setup for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "message": "CORPORATE HELL™ Backend API",
        "tagline": "Synergy is mandatory. Sanity is optional.",
        "docs": "/docs",
    }


@app.get("/health")
def health_alias():
    from app.api.endpoints import health_check
    from app.db.database import SessionLocal
    db = SessionLocal()
    try:
        return health_check(db)
    finally:
        db.close()

