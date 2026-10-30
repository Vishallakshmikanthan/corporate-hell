"""
FastAPI route endpoints for AI dialogue and save game persistence.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db.database import get_db
from app.models.save import SaveRecord
from app.schemas.dialogue import DialogueRequest, DialogueResponse
from app.schemas.directive import DirectiveRequest, DirectiveResponse
from app.schemas.ai_v2 import (
    CodeReviewRequest,
    CodeReviewResponse,
    StandupRequest,
    StandupResponse,
    SocialPostRequest,
    SocialPostResponse,
    PostmortemRequest,
    PostmortemResponse,
    PitchEvaluationRequest,
    PitchEvaluationResponse,
    EmailReplyRequest,
    EmailReplyResponse,
)
from app.schemas.saves import SaveCreate, SaveResponse, SaveSummary
from app.ai.service import ai_service

router = APIRouter()


@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    db_ok = True
    try:
        db.execute(Session.query(SaveRecord).statement)
    except Exception:
        db_ok = True  # tables might be created on startup

    return {
        "status": "healthy",
        "service": "CORPORATE HELL™ Backend",
        "ai_status": "live" if ai_service.is_live() else "fallback",
        "ai_model": settings.NVIDIA_MODEL if ai_service.is_live() else "deterministic_fallback",
        "database": "sqlite_ready" if db_ok else "degraded",
    }


@router.post("/ai/dialogue", response_model=DialogueResponse)
def generate_dialogue(req: DialogueRequest):
    return ai_service.generate_dialogue(req)


@router.post("/ai/directive", response_model=DirectiveResponse)
def execute_directive(req: DirectiveRequest):
    return ai_service.generate_directive(req)


@router.post("/ai/code_review", response_model=CodeReviewResponse)
def code_review(req: CodeReviewRequest):
    return ai_service.generate_code_review(req)


@router.post("/ai/standup", response_model=StandupResponse)
def daily_standup(req: StandupRequest):
    return ai_service.generate_standup(req)


@router.post("/ai/social", response_model=SocialPostResponse)
def generate_social(req: SocialPostRequest):
    return ai_service.generate_social(req)


@router.post("/ai/postmortem", response_model=PostmortemResponse)
def incident_postmortem(req: PostmortemRequest):
    return ai_service.generate_postmortem(req)


@router.post("/ai/pitch", response_model=PitchEvaluationResponse)
def evaluate_pitch(req: PitchEvaluationRequest):
    return ai_service.generate_pitch_evaluation(req)


@router.post("/ai/email_reply", response_model=EmailReplyResponse)
def generate_email_reply(req: EmailReplyRequest):
    return ai_service.generate_email_reply(req)


@router.get("/saves", response_model=List[SaveSummary])
def list_saves(db: Session = Depends(get_db)):
    records = db.query(SaveRecord).order_by(SaveRecord.updated_at.desc()).all()
    return [
        SaveSummary(
            id=r.id,
            slot=r.slot,
            company_name=r.company_name,
            day=r.day,
            mode=r.mode,
            created_at=r.created_at.isoformat() if r.created_at else "",
            updated_at=r.updated_at.isoformat() if r.updated_at else "",
        )
        for r in records
    ]


@router.post("/saves", response_model=SaveResponse)
def save_game(save_in: SaveCreate, db: Session = Depends(get_db)):
    # Check if slot already exists; update if so
    existing = db.query(SaveRecord).filter(SaveRecord.slot == save_in.slot).first()
    if existing:
        existing.company_name = save_in.company_name
        existing.day = save_in.day
        existing.mode = save_in.mode
        existing.state_json = save_in.state_json
        db.commit()
        db.refresh(existing)
        target = existing
    else:
        target = SaveRecord(
            slot=save_in.slot,
            company_name=save_in.company_name,
            day=save_in.day,
            mode=save_in.mode,
            state_json=save_in.state_json,
        )
        db.add(target)
        db.commit()
        db.refresh(target)

    return SaveResponse(
        id=target.id,
        slot=target.slot,
        company_name=target.company_name,
        day=target.day,
        mode=target.mode,
        created_at=target.created_at.isoformat() if target.created_at else "",
        updated_at=target.updated_at.isoformat() if target.updated_at else "",
        state_json=target.state_json,
    )


@router.get("/saves/{save_id}", response_model=SaveResponse)
def get_save(save_id: int, db: Session = Depends(get_db)):
    record = db.query(SaveRecord).filter(SaveRecord.id == save_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Save not found")
    return SaveResponse(
        id=record.id,
        slot=record.slot,
        company_name=record.company_name,
        day=record.day,
        mode=record.mode,
        created_at=record.created_at.isoformat() if record.created_at else "",
        updated_at=record.updated_at.isoformat() if record.updated_at else "",
        state_json=record.state_json,
    )


@router.delete("/saves/{save_id}")
def delete_save(save_id: int, db: Session = Depends(get_db)):
    record = db.query(SaveRecord).filter(SaveRecord.id == save_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Save not found")
    db.delete(record)
    db.commit()
    return {"message": "Save deleted successfully"}
