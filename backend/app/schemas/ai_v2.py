"""
Pydantic schemas for Corporate Hell v2 AI endpoints:
- Code Review (PRs)
- Daily Standup
- Social Posts (Chirper / LinkedOut / RedDot)
- Incident Postmortems
"""
from typing import List, Literal, Optional
from pydantic import BaseModel, Field


class CodeReviewRequest(BaseModel):
    ticket_title: str
    code_diff: str = ""
    author: str
    reviewer_archetype: str = "architect"


class CodeReviewResponse(BaseModel):
    approved: bool
    comment: str
    requested_changes: List[str] = Field(default_factory=list)
    snark_level: int = Field(default=5, ge=1, le=10)
    source: Literal["ai", "fallback"] = "fallback"


class StandupRequest(BaseModel):
    employee_name: str
    role: str
    current_ticket: Optional[str] = None
    blockers: Optional[str] = None


class StandupResponse(BaseModel):
    yesterday: str
    today: str
    blockers: str
    corporate_buzzword_count: int = 3
    source: Literal["ai", "fallback"] = "fallback"


class SocialPostRequest(BaseModel):
    platform: Literal["chirper", "linkedout", "reddot"]
    announcement_type: str
    company_name: str
    stage: str = "seed"


class SocialPostResponse(BaseModel):
    post_content: str
    predicted_virality: float = Field(ge=0.0, le=1.0)
    cringe_score: int = Field(ge=1, le=10)
    hashtags: List[str] = Field(default_factory=list)
    source: Literal["ai", "fallback"] = "fallback"


class PostmortemRequest(BaseModel):
    incident_title: str
    root_cause: str
    downtime_minutes: int
    revenue_lost: float


class PostmortemResponse(BaseModel):
    title: str
    summary: str
    five_whys: List[str] = Field(default_factory=list)
    action_items: List[str] = Field(default_factory=list)
    executive_excuse: str
    source: Literal["ai", "fallback"] = "fallback"


class PitchEvaluationRequest(BaseModel):
    investor_group: str = "Horizon Capital"
    round_number: int = 1
    investor_question: str
    player_response: str
    slide_title: str = "Growth Strategy"
    company_name: str = "Corporate Hell Inc."
    revenue: float = 480200.0
    burn_rate: float = 38200.0
    morale: float = 68.0


class PitchEvaluationResponse(BaseModel):
    partner_name: str
    partner_reaction: str
    confidence_delta: int = Field(default=6, ge=-25, le=25)
    follow_up_note: str
    source: Literal["ai", "fallback"] = "fallback"


class EmailReplyRequest(BaseModel):
    sender_name: str
    subject: str
    email_body: str
    reply_tone: str = "executive"
    company_name: str = "Corporate Hell Inc."


class EmailReplyResponse(BaseModel):
    draft_reply: str
    predicted_outcome: str
    confidence_delta: int = 4
    source: Literal["ai", "fallback"] = "fallback"

