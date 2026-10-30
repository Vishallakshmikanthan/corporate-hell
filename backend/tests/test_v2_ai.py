from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_ai_code_review():
    payload = {
        "ticket_title": "Fix memory leak in caching layer",
        "code_diff": "+ const cache = new Map();\n- memory.leak();",
        "author": "Yuki Tanaka",
        "reviewer_archetype": "architect",
    }
    resp = client.post("/api/ai/code_review", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "approved" in data
    assert "comment" in data
    assert isinstance(data["requested_changes"], list)
    assert data["source"] in ["ai", "fallback"]


def test_ai_standup():
    payload = {
        "employee_name": "Priya Nair",
        "role": "Lead DevOps",
        "current_ticket": "AWSome Auto-Scaling Cluster Setup",
        "blockers": "Pending cloud IAM approval",
    }
    resp = client.post("/api/ai/standup", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "yesterday" in data
    assert "today" in data
    assert "blockers" in data
    assert data["corporate_buzzword_count"] >= 1
    assert data["source"] in ["ai", "fallback"]


def test_ai_social():
    payload = {
        "platform": "linkedout",
        "announcement_type": "Series A Funding & 100k Users",
        "company_name": "SynergyPulse Corp",
        "stage": "series_a",
    }
    resp = client.post("/api/ai/social", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "post_content" in data
    assert 0.0 <= data["predicted_virality"] <= 1.0
    assert 1 <= data["cringe_score"] <= 10
    assert isinstance(data["hashtags"], list)
    assert data["source"] in ["ai", "fallback"]


def test_ai_postmortem():
    payload = {
        "incident_title": "AWSome US-East Region Outage",
        "root_cause": "Unchecked recursion in lambda handler during Friday 5PM deploy",
        "downtime_minutes": 45,
        "revenue_lost": 12500.0,
    }
    resp = client.post("/api/ai/postmortem", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "title" in data
    assert "summary" in data
    assert len(data["five_whys"]) >= 3
    assert len(data["action_items"]) >= 2
    assert "executive_excuse" in data
    assert data["source"] in ["ai", "fallback"]
