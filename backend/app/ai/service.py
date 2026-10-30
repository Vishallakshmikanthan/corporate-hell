"""
NVIDIA GLM-5.3 AI dialogue service.
Integrates with NVIDIA Build API via OpenAI-compatible endpoint.
Implements timeouts, retries, response validation, caching, and graceful fallback.
"""
import json
import logging
import time
from typing import Dict, Optional
from openai import OpenAI
from app.core.config import settings
from app.schemas.dialogue import DialogueRequest, DialogueResponse
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
from app.ai.personas import PERSONAS, get_fallback_dialogue

logger = logging.getLogger(__name__)

# Simple in-memory response cache: cache_key -> (timestamp, DialogueResponse)
_response_cache: Dict[str, tuple[float, DialogueResponse]] = {}
CACHE_TTL_SECONDS = 300  # 5 minutes


class AIService:
    def __init__(self):
        self.client: Optional[OpenAI] = None
        self._init_client()

    def _init_client(self):
        api_key = settings.NVIDIA_API_KEY
        if api_key and api_key.strip():
            try:
                self.client = OpenAI(
                    base_url=settings.NVIDIA_BASE_URL,
                    api_key=api_key.strip(),
                    timeout=settings.AI_REQUEST_TIMEOUT_SECONDS,
                    max_retries=settings.AI_MAX_RETRIES,
                )
                logger.info("NVIDIA AI Client initialized for model %s", settings.NVIDIA_MODEL)
            except Exception as e:
                logger.warning("Failed to initialize NVIDIA OpenAI client: %s", str(e))
                self.client = None
        else:
            logger.info("NVIDIA_API_KEY not configured. Running in high-fidelity deterministic fallback mode.")
            self.client = None

    def is_live(self) -> bool:
        return self.client is not None

    def generate_dialogue(self, req: DialogueRequest) -> DialogueResponse:
        # Check cache
        cache_key = f"{req.archetype}:{req.employee_id}:{req.current_activity}:{req.context.recent_event if req.context else ''}"
        now = time.time()
        if cache_key in _response_cache:
            cached_time, cached_resp = _response_cache[cache_key]
            if now - cached_time < CACHE_TTL_SECONDS:
                return cached_resp

        # If no client, return fallback immediately
        if not self.client:
            seed = int(hash(cache_key) % 1000)
            fallback = get_fallback_dialogue(req.archetype, seed=seed)
            _response_cache[cache_key] = (now, fallback)
            return fallback

        # Build prompt
        system_prompt = PERSONAS.get(req.archetype, PERSONAS["silent_genius"])
        system_prompt += (
            "\n\nYou MUST reply strictly with valid JSON containing:\n"
            "{\n"
            '  "dialogue": "Spoken line (under 30 words)",\n'
            '  "emotion": "one of: neutral, happy, excited, celebratory, smug, sad, angry, frustrated, confused, exhausted, panicked, embarrassed",\n'
            '  "thought": "Internal thought (under 10 words)",\n'
            '  "referencedEventIds": [],\n'
            '  "suggestedAction": null,\n'
            '  "confidence": 0.95\n'
            "}"
        )

        user_content = (
            f"Employee: {req.employee_name} ({req.role} in {req.department})\n"
            f"Vitals: Morale={req.morale:.0f}%, Stress={req.stress:.0f}%, Energy={req.energy:.0f}%\n"
            f"Current Activity: {req.current_activity}\n"
        )
        if req.context:
            if req.context.recent_event:
                user_content += f"Recent Office Event: {req.context.recent_event}\n"
            if req.context.player_decision:
                user_content += f"CEO Decision: {req.context.player_decision}\n"

        try:
            response = self.client.chat.completions.create(
                model=settings.NVIDIA_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_content},
                ],
                temperature=0.8,
                max_tokens=256,
            )

            raw_text = response.choices[0].message.content or ""
            # Strip markdown code blocks if wrapped
            if raw_text.startswith("```"):
                lines = raw_text.splitlines()
                raw_text = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])

            parsed = json.loads(raw_text.strip())
            valid_response = DialogueResponse(
                dialogue=parsed.get("dialogue", "Back to work."),
                emotion=parsed.get("emotion", "neutral"),
                thought=parsed.get("thought", "Productivity."),
                referencedEventIds=parsed.get("referencedEventIds", []),
                suggestedAction=parsed.get("suggestedAction"),
                confidence=min(1.0, max(0.0, float(parsed.get("confidence", 0.9)))),
                source="ai",
            )

            _response_cache[cache_key] = (now, valid_response)
            return valid_response

        except Exception as e:
            logger.warning("NVIDIA AI request failed or returned invalid JSON (%s); using fallback.", str(e))
            seed = int(hash(cache_key) % 1000)
            fallback = get_fallback_dialogue(req.archetype, seed=seed)
            _response_cache[cache_key] = (now, fallback)
            return fallback

    def generate_directive(self, req: "DirectiveRequest") -> "DirectiveResponse":
        from app.schemas.directive import DirectiveResponse, EmployeeQuote

        directive_lower = req.directive.lower()
        now = time.time()
        cache_key = f"directive:{directive_lower.strip()}"
        if cache_key in _response_cache:
            c_time, c_resp = _response_cache[cache_key]
            if now - c_time < CACHE_TTL_SECONDS and isinstance(c_resp, DirectiveResponse):
                return c_resp

        # If live NVIDIA client is available, prompt GLM-5.3
        if self.client:
            sys_prompt = (
                "You are the satirical AI narrator and executive assistant for CORPORATE HELL™, an absurdly realistic corporate simulation game.\n"
                "The CEO (player) has issued an executive directive.\n"
                "Parse the directive, interpret its corporate absurdity, and respond strictly in valid JSON with this exact schema:\n"
                "{\n"
                '  "title": "Short Punchy Title (under 6 words)",\n'
                '  "executive_summary": "Hilarious satirical summary of what happens in the office (under 35 words)",\n'
                '  "action_type": "one of: policy_4day, cut_meetings, morale_boost, audit_spending, trigger_incident, bonus_all, custom",\n'
                '  "action_payload": {},\n'
                '  "cash_delta": 0.0,\n'
                '  "morale_delta": 5.0,\n'
                '  "stress_delta": -2.0,\n'
                '  "quotes": [\n'
                '    {"employee_name": "Yuki Tanaka", "quote": "Satirical reaction (under 15 words)"},\n'
                '    {"employee_name": "Deborah Overbyte", "quote": "Satirical reaction (under 15 words)"}\n'
                "  ],\n"
                '  "confidence": 0.95\n'
                "}"
            )
            user_msg = (
                f"Directive: \"{req.directive}\"\n"
                f"Company: {req.company_name} | Day {req.day} | Treasury: ${req.cash:,.0f} | Morale: {req.morale:.0f}%\n"
            )
            try:
                resp = self.client.chat.completions.create(
                    model=settings.NVIDIA_MODEL,
                    messages=[
                        {"role": "system", "content": sys_prompt},
                        {"role": "user", "content": user_msg},
                    ],
                    temperature=0.85,
                    max_tokens=320,
                )
                raw_text = resp.choices[0].message.content or ""
                if raw_text.startswith("```"):
                    lines = raw_text.splitlines()
                    raw_text = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])
                parsed = json.loads(raw_text.strip())
                res = DirectiveResponse(
                    title=parsed.get("title", "Executive Decree"),
                    executive_summary=parsed.get("executive_summary", "Directive executed across all branches."),
                    action_type=parsed.get("action_type", "custom"),
                    action_payload=parsed.get("action_payload", {}),
                    cash_delta=float(parsed.get("cash_delta", 0.0)),
                    morale_delta=float(parsed.get("morale_delta", 5.0)),
                    stress_delta=float(parsed.get("stress_delta", -2.0)),
                    quotes=[
                        EmployeeQuote(
                            employee_name=q.get("employee_name", "Employee"),
                            quote=q.get("quote", "Understood."),
                        )
                        for q in parsed.get("quotes", [])
                    ],
                    confidence=min(1.0, max(0.0, float(parsed.get("confidence", 0.9)))),
                    source="ai",
                )
                _response_cache[cache_key] = (now, res)
                return res
            except Exception as e:
                logger.warning("NVIDIA GLM-5.3 directive generation failed (%s), using high-fidelity fallback.", str(e))

        # High-fidelity deterministic fallback
        if "4-day" in directive_lower or "four day" in directive_lower or "4 day" in directive_lower:
            fallback = DirectiveResponse(
                title="4-Day Workweek Proclamation",
                executive_summary="The CEO officially announced a 4-day workweek. Engineering rejoiced; Sales is frantically cramming demos into Thursday.",
                action_type="policy_4day",
                morale_delta=15.0,
                stress_delta=-12.0,
                cash_delta=0.0,
                quotes=[
                    EmployeeQuote(employee_name="Yuki Tanaka", quote="Finally, one fewer day of synchronous alignment."),
                    EmployeeQuote(employee_name="Deborah Overbyte", quote="I will schedule 40% more meetings on Monday to compensate."),
                ],
                source="fallback",
            )
        elif "meeting" in directive_lower or "cut" in directive_lower or "calendar" in directive_lower:
            fallback = DirectiveResponse(
                title="Emergency Calendar Cull",
                executive_summary="All recurring syncs sliced in half. Calendar bloat decreased by 50% across all departments.",
                action_type="cut_meetings",
                morale_delta=12.0,
                stress_delta=-14.0,
                cash_delta=0.0,
                quotes=[
                    EmployeeQuote(employee_name="Yuki Tanaka", quote="Miraculous silence in the open plan."),
                    EmployeeQuote(employee_name="Deborah Overbyte", quote="Can we schedule a 15-minute debrief to discuss the canceled meetings?"),
                ],
                source="fallback",
            )
        elif "morale" in directive_lower or "happy" in directive_lower or "boost" in directive_lower:
            fallback = DirectiveResponse(
                title="Mandatory Corporate Joy Initiative",
                executive_summary="Emergency morale injection authorized. Cold brew kegs replenished and executive high-fives declared mandatory.",
                action_type="morale_boost",
                morale_delta=18.0,
                stress_delta=-8.0,
                cash_delta=-1200.0,
                quotes=[
                    EmployeeQuote(employee_name="Priya Nair", quote="Free cold brew?! I forgive the last three sprints."),
                    EmployeeQuote(employee_name="Sandra Keller", quote="I heard management only did this because Glassdoor ratings dropped."),
                ],
                source="fallback",
            )
        elif "spend" in directive_lower or "audit" in directive_lower or "cost" in directive_lower or "money" in directive_lower:
            fallback = DirectiveResponse(
                title="Forensic Corporate Expense Audit",
                executive_summary="Finance scoured corporate card receipts. Discovered $3,400 in questionable 'client dinner' subscriptions and refunded the treasury.",
                action_type="audit_spending",
                morale_delta=-4.0,
                stress_delta=8.0,
                cash_delta=3400.0,
                quotes=[
                    EmployeeQuote(employee_name="Marcus Vane", quote="Those 14 artisan kombucha cases were critical to closing Q3 enterprise pipeline!"),
                    EmployeeQuote(employee_name="Ellen Wang", quote="Every audit finds the same missing receipt from 2021."),
                ],
                source="fallback",
            )
        elif "incident" in directive_lower or "random" in directive_lower or "chaos" in directive_lower:
            fallback = DirectiveResponse(
                title="Chaos Engineering: The Office Rebellion",
                executive_summary="An unexpected workplace crisis erupted! The office printer has jammed itself in existential protest.",
                action_type="trigger_incident",
                morale_delta=-5.0,
                stress_delta=10.0,
                cash_delta=-500.0,
                quotes=[
                    EmployeeQuote(employee_name="Bianca Reyes", quote="This printer again?! It just shredded my department roster!"),
                    EmployeeQuote(employee_name="Steve Bhattacharya", quote="Where is everyone? Why is the machine smoking?"),
                ],
                source="fallback",
            )
        else:
            fallback = DirectiveResponse(
                title="Executive Decree Enacted",
                executive_summary=f"The CEO declared: '{req.directive}'. Executive leadership nodded solemnly while middle management scheduled 14 alignment syncs.",
                action_type="custom",
                morale_delta=6.0,
                stress_delta=-2.0,
                cash_delta=-350.0,
                quotes=[
                    EmployeeQuote(employee_name="Chad Sterling", quote="Brilliant visionary leadership, CEO! Reposting immediately on LinkedIn."),
                    EmployeeQuote(employee_name="Yuki Tanaka", quote="I will ignore this until the Jira ticket appears."),
                ],
                source="fallback",
            )

        _response_cache[cache_key] = (now, fallback)
        return fallback

    def generate_code_review(self, req: CodeReviewRequest) -> CodeReviewResponse:
        cache_key = f"codereview:{req.ticket_title}:{req.reviewer_archetype}"
        now = time.time()
        if cache_key in _response_cache:
            c_time, c_resp = _response_cache[cache_key]
            if now - c_time < CACHE_TTL_SECONDS and isinstance(c_resp, CodeReviewResponse):
                return c_resp

        if self.client:
            try:
                sys_prompt = (
                    "You are a satirical code reviewer in CORPORATE HELL™.\n"
                    f"Reviewer Archetype: {req.reviewer_archetype}.\n"
                    "Reply strictly with JSON:\n"
                    "{\n"
                    '  "approved": true or false,\n'
                    '  "comment": "Snarky / hilarious code review comment under 30 words",\n'
                    '  "requested_changes": ["change 1", "change 2"],\n'
                    '  "snark_level": 7\n'
                    "}"
                )
                user_msg = f"Ticket: {req.ticket_title}\nAuthor: {req.author}\nDiff snippet: {req.code_diff[:300]}"
                resp = self.client.chat.completions.create(
                    model=settings.NVIDIA_MODEL,
                    messages=[
                        {"role": "system", "content": sys_prompt},
                        {"role": "user", "content": user_msg},
                    ],
                    temperature=0.8,
                    max_tokens=220,
                )
                raw_text = resp.choices[0].message.content or ""
                if raw_text.startswith("```"):
                    lines = raw_text.splitlines()
                    raw_text = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])
                parsed = json.loads(raw_text.strip())
                res = CodeReviewResponse(
                    approved=bool(parsed.get("approved", True)),
                    comment=parsed.get("comment", "LGTM with minor reservations."),
                    requested_changes=parsed.get("requested_changes", []),
                    snark_level=int(parsed.get("snark_level", 5)),
                    source="ai",
                )
                _response_cache[cache_key] = (now, res)
                return res
            except Exception as e:
                logger.warning("Code review AI generation failed (%s); using fallback.", str(e))

        # Fallback templates based on archetype
        arch = req.reviewer_archetype.lower()
        if "architect" in arch:
            res = CodeReviewResponse(
                approved=False,
                comment="LGTM in theory, but have you considered rewriting this using event-sourcing and 4 abstract factory interfaces?",
                requested_changes=["Abstract into domain service interfaces", "Decouple database coupling"],
                snark_level=9,
                source="fallback",
            )
        elif "cynic" in arch or "senior" in arch:
            res = CodeReviewResponse(
                approved=False,
                comment="Bold of you to assume this won't crash prod at 3 AM on Saturday. Where are the unit tests?",
                requested_changes=["Add nil/undefined guards", "Write regression tests"],
                snark_level=8,
                source="fallback",
            )
        elif "intern" in arch or "chaos" in arch:
            res = CodeReviewResponse(
                approved=True,
                comment="I ran git push --force on main and everything works fine on my laptop!",
                requested_changes=[],
                snark_level=3,
                source="fallback",
            )
        else:
            res = CodeReviewResponse(
                approved=True,
                comment="LGTM! Merging now so we hit our arbitrary sprint velocity targets.",
                requested_changes=["Clean up leftover console.log statements"],
                snark_level=4,
                source="fallback",
            )
        _response_cache[cache_key] = (now, res)
        return res

    def generate_standup(self, req: StandupRequest) -> StandupResponse:
        cache_key = f"standup:{req.employee_name}:{req.current_ticket or ''}"
        now = time.time()
        if cache_key in _response_cache:
            c_time, c_resp = _response_cache[cache_key]
            if now - c_time < CACHE_TTL_SECONDS and isinstance(c_resp, StandupResponse):
                return c_resp

        if self.client:
            try:
                sys_prompt = (
                    "You are generating a daily agile standup update in CORPORATE HELL™.\n"
                    "Reply strictly with JSON:\n"
                    "{\n"
                    '  "yesterday": "What employee worked on yesterday (under 20 words)",\n'
                    '  "today": "What employee is tackling today (under 20 words)",\n'
                    '  "blockers": "Satirical corporate blocker (under 15 words)",\n'
                    '  "corporate_buzzword_count": 4\n'
                    "}"
                )
                user_msg = f"Employee: {req.employee_name} ({req.role})\nCurrent Ticket: {req.current_ticket}\nBlocker note: {req.blockers}"
                resp = self.client.chat.completions.create(
                    model=settings.NVIDIA_MODEL,
                    messages=[
                        {"role": "system", "content": sys_prompt},
                        {"role": "user", "content": user_msg},
                    ],
                    temperature=0.8,
                    max_tokens=220,
                )
                raw_text = resp.choices[0].message.content or ""
                if raw_text.startswith("```"):
                    lines = raw_text.splitlines()
                    raw_text = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])
                parsed = json.loads(raw_text.strip())
                res = StandupResponse(
                    yesterday=parsed.get("yesterday", "Triaged backlog tech debt."),
                    today=parsed.get("today", "Pushing sprint tickets to review."),
                    blockers=parsed.get("blockers", "Waiting on cross-functional alignment."),
                    corporate_buzzword_count=int(parsed.get("corporate_buzzword_count", 4)),
                    source="ai",
                )
                _response_cache[cache_key] = (now, res)
                return res
            except Exception as e:
                logger.warning("Standup AI generation failed (%s); using fallback.", str(e))

        res = StandupResponse(
            yesterday="Attended 4 alignment meetings to discuss aligning our next alignment meeting.",
            today=f"Focusing on {req.current_ticket or 'quarterly mission-critical deliverables'}.",
            blockers=req.blockers or "Awaiting IAM credentials approval from security committee.",
            corporate_buzzword_count=5,
            source="fallback",
        )
        _response_cache[cache_key] = (now, res)
        return res

    def generate_social(self, req: SocialPostRequest) -> SocialPostResponse:
        cache_key = f"social:{req.platform}:{req.announcement_type}:{req.company_name}"
        now = time.time()
        if cache_key in _response_cache:
            c_time, c_resp = _response_cache[cache_key]
            if now - c_time < CACHE_TTL_SECONDS and isinstance(c_resp, SocialPostResponse):
                return c_resp

        if self.client:
            try:
                sys_prompt = (
                    f"You generate viral satire posts for social media platform: '{req.platform}'.\n"
                    "Platforms: chirper (Twitter parody), linkedout (cringe thought-leader LinkedIn parody), reddot (Reddit developer snark).\n"
                    "Reply strictly with JSON:\n"
                    "{\n"
                    '  "post_content": "The actual post content matching platform tone",\n'
                    '  "predicted_virality": 0.85,\n'
                    '  "cringe_score": 8,\n'
                    '  "hashtags": ["#Synergy", "#TechDisruption"]\n'
                    "}"
                )
                user_msg = f"Company: {req.company_name} (Stage: {req.stage})\nAnnouncement: {req.announcement_type}"
                resp = self.client.chat.completions.create(
                    model=settings.NVIDIA_MODEL,
                    messages=[
                        {"role": "system", "content": sys_prompt},
                        {"role": "user", "content": user_msg},
                    ],
                    temperature=0.85,
                    max_tokens=250,
                )
                raw_text = resp.choices[0].message.content or ""
                if raw_text.startswith("```"):
                    lines = raw_text.splitlines()
                    raw_text = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])
                parsed = json.loads(raw_text.strip())
                res = SocialPostResponse(
                    post_content=parsed.get("post_content", "Exciting news dropping soon."),
                    predicted_virality=float(parsed.get("predicted_virality", 0.7)),
                    cringe_score=int(parsed.get("cringe_score", 6)),
                    hashtags=parsed.get("hashtags", []),
                    source="ai",
                )
                _response_cache[cache_key] = (now, res)
                return res
            except Exception as e:
                logger.warning("Social AI generation failed (%s); using fallback.", str(e))

        if req.platform == "linkedout":
            content = f"🚀 Thrilled to announce {req.company_name} has achieved a new milestone: {req.announcement_type}! What did 72 hours without sleep teach me about B2B founder resilience? A 🧵 on relentless synergy... Agree? 👇"
            cringe = 9
            hashtags = ["#ThoughtLeadership", "#HustleCulture", "#FounderMindset"]
        elif req.platform == "reddot":
            content = f"TIL {req.company_name} shipped {req.announcement_type} on a Friday afternoon without breaking prod (somehow). AMA."
            cringe = 4
            hashtags = ["#programming", "#devops", "#corporate"]
        else:
            content = f"Big announcement! {req.company_name} just rolled out {req.announcement_type}. Zero tech debt, 100% vibes. Link in bio 🚀👇"
            cringe = 6
            hashtags = ["#TechNews", "#Startup", "#SaaS"]

        res = SocialPostResponse(
            post_content=content,
            predicted_virality=0.75,
            cringe_score=cringe,
            hashtags=hashtags,
            source="fallback",
        )
        _response_cache[cache_key] = (now, res)
        return res

    def generate_postmortem(self, req: PostmortemRequest) -> PostmortemResponse:
        cache_key = f"postmortem:{req.incident_title}:{req.downtime_minutes}"
        now = time.time()
        if cache_key in _response_cache:
            c_time, c_resp = _response_cache[cache_key]
            if now - c_time < CACHE_TTL_SECONDS and isinstance(c_resp, PostmortemResponse):
                return c_resp

        if self.client:
            try:
                sys_prompt = (
                    "You are generating a satirical incident postmortem / root-cause analysis for CORPORATE HELL™.\n"
                    "Reply strictly with JSON:\n"
                    "{\n"
                    '  "title": "RCA: Incident Title",\n'
                    '  "summary": "Executive summary under 40 words",\n'
                    '  "five_whys": ["Why 1", "Why 2", "Why 3", "Why 4", "Why 5"],\n'
                    '  "action_items": ["Action 1", "Action 2", "Action 3"],\n'
                    '  "executive_excuse": "Classic corporate PR excuse"\n'
                    "}"
                )
                user_msg = f"Incident: {req.incident_title}\nCause: {req.root_cause}\nDowntime: {req.downtime_minutes} min\nRevenue Lost: ${req.revenue_lost:,.2f}"
                resp = self.client.chat.completions.create(
                    model=settings.NVIDIA_MODEL,
                    messages=[
                        {"role": "system", "content": sys_prompt},
                        {"role": "user", "content": user_msg},
                    ],
                    temperature=0.8,
                    max_tokens=350,
                )
                raw_text = resp.choices[0].message.content or ""
                if raw_text.startswith("```"):
                    lines = raw_text.splitlines()
                    raw_text = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])
                parsed = json.loads(raw_text.strip())
                res = PostmortemResponse(
                    title=parsed.get("title", f"RCA: {req.incident_title}"),
                    summary=parsed.get("summary", "Production experienced brief degradation."),
                    five_whys=parsed.get("five_whys", []),
                    action_items=parsed.get("action_items", []),
                    executive_excuse=parsed.get("executive_excuse", "Upstream network anomaly."),
                    source="ai",
                )
                _response_cache[cache_key] = (now, res)
                return res
            except Exception as e:
                logger.warning("Postmortem AI generation failed (%s); using fallback.", str(e))

        res = PostmortemResponse(
            title=f"Root Cause Analysis: {req.incident_title}",
            summary=f"A {req.downtime_minutes}-minute disruption cost the company ${req.revenue_lost:,.2f}. The incident was traced to: {req.root_cause}.",
            five_whys=[
                f"1. Why did the service fail? -> {req.root_cause}",
                "2. Why was it not caught in staging? -> Staging environment was turned off to reduce AWSome bill",
                "3. Why was staging turned off? -> Finance issued an emergency cost-cutting mandate",
                "4. Why was the mandate issued? -> Executive team bought an enterprise AI subscription",
                "5. Why did they buy the subscription? -> Board demanded AI in every quarterly slide deck",
            ],
            action_items=[
                "Implement automated canary rollback guards",
                "Mandate blue/green deployments for all prod releases",
                "Establish a moratorium on Friday 5 PM deployments",
            ],
            executive_excuse="An unprecedented cascade of third-party cloud provider transit latencies outside our operational perimeter.",
            source="fallback",
        )
        _response_cache[cache_key] = (now, res)
        return res

    def generate_pitch_evaluation(self, req: PitchEvaluationRequest) -> PitchEvaluationResponse:
        cache_key = f"pitch:{req.round_number}:{req.player_response[:40]}"
        now = time.time()
        if cache_key in _response_cache:
            c_time, c_resp = _response_cache[cache_key]
            if now - c_time < CACHE_TTL_SECONDS and isinstance(c_resp, PitchEvaluationResponse):
                return c_resp

        if self.client:
            try:
                sys_prompt = (
                    "You are a senior venture capital partner at Horizon Capital in CORPORATE HELL™.\n"
                    "Evaluate the CEO's response during a high-stakes boardroom pitch.\n"
                    "Reply strictly with valid JSON:\n"
                    "{\n"
                    '  "partner_name": "James Carter",\n'
                    '  "partner_reaction": "Sharp, realistic VC reaction under 30 words",\n'
                    '  "confidence_delta": 8,\n'
                    '  "follow_up_note": "Brief investment memo note under 18 words"\n'
                    "}"
                )
                user_msg = (
                    f"Firm: {req.investor_group} | Round {req.round_number}\n"
                    f"Slide Shown: {req.slide_title}\n"
                    f"Question: {req.investor_question}\n"
                    f"CEO Answer: {req.player_response}\n"
                    f"Metrics: Revenue=${req.revenue:,.0f}, Burn=${req.burn_rate:,.0f}, Morale={req.morale:.0f}%"
                )
                resp = self.client.chat.completions.create(
                    model=settings.NVIDIA_MODEL,
                    messages=[
                        {"role": "system", "content": sys_prompt},
                        {"role": "user", "content": user_msg},
                    ],
                    temperature=0.75,
                    max_tokens=220,
                )
                raw_text = resp.choices[0].message.content or ""
                if raw_text.startswith("```"):
                    lines = raw_text.splitlines()
                    raw_text = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])
                parsed = json.loads(raw_text.strip())
                res = PitchEvaluationResponse(
                    partner_name=parsed.get("partner_name", "James Carter"),
                    partner_reaction=parsed.get("partner_reaction", "That aligns with our thesis on disciplined unit economics."),
                    confidence_delta=max(-25, min(25, int(parsed.get("confidence_delta", 7)))),
                    follow_up_note=parsed.get("follow_up_note", "Strong narrative alignment with current metrics."),
                    source="ai",
                )
                _response_cache[cache_key] = (now, res)
                return res
            except Exception as e:
                logger.warning("Pitch AI evaluation failed (%s); using fallback.", str(e))

        resp_lower = req.player_response.lower()
        if "unit economics" in resp_lower or "organic" in resp_lower or "margin" in resp_lower or "disciplin" in resp_lower:
            delta = 9
            reaction = "James Carter nods approvingly: 'Disciplined unit economics and clear capital efficiency—that is exactly what our IC wants to see.'"
            note = "Partners impressed by sustainable growth thesis."
        elif "aggressiv" in resp_lower or "10x" in resp_lower or "blitz" in resp_lower:
            delta = 4
            reaction = "Sarah Kim leans forward: 'Ambitious growth trajectory, though Daniel is still scrutinizing the near-term burn multiple.'"
            note = "High upside recognized, burn rate flagged for monitoring."
        elif "honest" in resp_lower or "figuring" in resp_lower:
            delta = 5
            reaction = "Priya Mehta smiles: 'Candor is rare in this boardroom. We respect founder self-awareness, provided execution tightens this quarter.'"
            note = "Founder transparency boosted partner trust."
        else:
            delta = 7
            reaction = "James Carter jots a note in his leather folio: 'Compelling positioning. Let us see how the numbers hold up across the next quarter.'"
            note = "Measured positive reception from the partnership."

        res = PitchEvaluationResponse(
            partner_name="James Carter",
            partner_reaction=reaction,
            confidence_delta=delta,
            follow_up_note=note,
            source="fallback",
        )
        _response_cache[cache_key] = (now, res)
        return res

    def generate_email_reply(self, req: EmailReplyRequest) -> EmailReplyResponse:
        cache_key = f"emailreply:{req.subject}:{req.reply_tone}"
        now = time.time()
        if cache_key in _response_cache:
            c_time, c_resp = _response_cache[cache_key]
            if now - c_time < CACHE_TTL_SECONDS and isinstance(c_resp, EmailReplyResponse):
                return c_resp

        if self.client:
            try:
                sys_prompt = (
                    "You are the executive chief-of-staff AI in CORPORATE HELL™.\n"
                    "Draft a sharp, polished executive email reply for the CEO.\n"
                    "Reply strictly with valid JSON:\n"
                    "{\n"
                    '  "draft_reply": "2-4 sentence executive email response",\n'
                    '  "predicted_outcome": "Brief impact preview under 15 words",\n'
                    '  "confidence_delta": 5\n'
                    "}"
                )
                user_msg = f"From: {req.sender_name}\nSubject: {req.subject}\nTone: {req.reply_tone}\nBody: {req.email_body[:400]}"
                resp = self.client.chat.completions.create(
                    model=settings.NVIDIA_MODEL,
                    messages=[
                        {"role": "system", "content": sys_prompt},
                        {"role": "user", "content": user_msg},
                    ],
                    temperature=0.75,
                    max_tokens=240,
                )
                raw_text = resp.choices[0].message.content or ""
                if raw_text.startswith("```"):
                    lines = raw_text.splitlines()
                    raw_text = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])
                parsed = json.loads(raw_text.strip())
                res = EmailReplyResponse(
                    draft_reply=parsed.get("draft_reply", "Thank you for the update. Let's align on execution milestones."),
                    predicted_outcome=parsed.get("predicted_outcome", "+5 Stakeholder Confidence & clear alignment"),
                    confidence_delta=int(parsed.get("confidence_delta", 5)),
                    source="ai",
                )
                _response_cache[cache_key] = (now, res)
                return res
            except Exception as e:
                logger.warning("Email reply AI generation failed (%s); using fallback.", str(e))

        tone = req.reply_tone.lower()
        if "negotiate" in tone:
            draft = (
                f"Thank you for reaching out, {req.sender_name}. While we value this partnership, our current traction and unit economics warrant more favorable terms. "
                f"I have attached our updated projections—let's reconvene Thursday to finalize an agreement that works for both sides."
            )
            outcome = "Strong negotiation leverage (+6 Confidence, better terms)"
            delta = 6
        elif "time" in tone or "defer" in tone:
            draft = (
                f"Appreciate the note, {req.sender_name}. Our engineering and operations leads are currently wrapping up a mission-critical sprint milestone. "
                f"We will deliver the full data package by Friday afternoon with complete audit verification."
            )
            outcome = "Buys 48 hours of breathing room (+2 Trust)"
            delta = 2
        elif "decline" in tone:
            draft = (
                f"Thank you for the proposal, {req.sender_name}. After reviewing our Q3 capital allocation priorities, we have decided to pass on this initiative to maintain strict focus on our core product roadmap."
            )
            outcome = "Preserves treasury focus, closes thread cleanly"
            delta = 1
        else:
            draft = (
                f"Thank you for the productive update, {req.sender_name}. I have reviewed the key points with our leadership team and attached our financial projections, hiring plan, and competitive analysis. "
                f"We are ready to move forward and address any technical questions in our next session."
            )
            outcome = "Positive stakeholder alignment (+5 Confidence & Reputation)"
            delta = 5

        res = EmailReplyResponse(
            draft_reply=draft,
            predicted_outcome=outcome,
            confidence_delta=delta,
            source="fallback",
        )
        _response_cache[cache_key] = (now, res)
        return res


ai_service = AIService()

