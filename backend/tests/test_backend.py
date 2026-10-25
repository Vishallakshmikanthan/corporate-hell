from fastapi.testclient import TestClient
from app.db.database import Base, engine
from app.models import save as _save_model
from app.main import app

Base.metadata.create_all(bind=engine)
client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "CORPORATE HELL" in response.json()["message"]


def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "ai_status" in data


def test_ai_dialogue_fallback():
    payload = {
        "employee_id": "emp_deborah",
        "employee_name": "Deborah Overbyte",
        "archetype": "meeting_addict",
        "role": "manager",
        "department": "operations",
        "bio": "Owns 4 calendars.",
        "morale": 70,
        "stress": 40,
        "energy": 80,
        "trust": 65,
        "current_activity": "meeting",
        "current_task": "Strategic alignment",
    }
    response = client.post("/api/ai/dialogue", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "dialogue" in data
    assert "thought" in data
    assert "emotion" in data
    assert data["source"] in ["ai", "fallback"]


def test_save_game_crud():
    # 1. Create a save
    save_payload = {
        "slot": "test_slot_1",
        "company_name": "Test Synergy Inc",
        "day": 3,
        "mode": "campaign",
        "state_json": {"cash": 45000, "day": 3, "name": "Test Synergy Inc"},
    }
    create_resp = client.post("/api/saves", json=save_payload)
    assert create_resp.status_code == 200
    created = create_resp.json()
    save_id = created["id"]
    assert created["company_name"] == "Test Synergy Inc"

    # 2. List saves
    list_resp = client.get("/api/saves")
    assert list_resp.status_code == 200
    saves = list_resp.json()
    assert any(s["id"] == save_id for s in saves)

    # 3. Get save by id
    get_resp = client.get(f"/api/saves/{save_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["state_json"]["cash"] == 45000

    # 4. Delete save
    del_resp = client.delete(f"/api/saves/{save_id}")
    assert del_resp.status_code == 200

    # 5. Verify deleted
    get_deleted = client.get(f"/api/saves/{save_id}")
    assert get_deleted.status_code == 404


def test_ai_directive_fallback():
    payload = {
        "directive": "Announce 4-day workweek",
        "company_name": "HellWorks Inc.",
        "day": 6,
        "cash": -3672,
        "morale": 65,
        "stress": 45,
        "employee_count": 12,
    }
    response = client.post("/api/ai/directive", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "title" in data
    assert "executive_summary" in data
    assert "action_type" in data
    assert len(data["quotes"]) > 0
    assert data["source"] in ["ai", "fallback"]

