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


ai_service = AIService()

