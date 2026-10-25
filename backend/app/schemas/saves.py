"""
Pydantic schemas for game state saves persistence.
"""
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class SaveCreate(BaseModel):
    slot: str = Field(default="cloud_save", description="Save slot identifier")
    company_name: str
    day: int
    mode: str
    state_json: Dict[str, Any]


class SaveResponse(BaseModel):
    id: int
    slot: str
    company_name: str
    day: int
    mode: str
    created_at: str
    updated_at: str
    state_json: Optional[Dict[str, Any]] = None


class SaveSummary(BaseModel):
    id: int
    slot: str
    company_name: str
    day: int
    mode: str
    created_at: str
    updated_at: str
