"""
Automated Pytest Suite for Multi-Provider AI Platform.
"""

from fastapi.testclient import TestClient
from backend.main import app
from backend.services.provider_router import benchmark_multi_providers

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "online"


def test_provider_router_benchmark():
    prompt = "Write a python function to check prime numbers."
    res = benchmark_multi_providers(prompt)
    assert "providers_compared" in res
    assert res["providers_compared"] == 3
    assert len(res["results"]) == 3
    assert "fastest_provider" in res


def test_compare_endpoint():
    response = client.post("/api/compare", json={"prompt": "Summarize the history of space travel."})
    assert response.status_code == 200
    data = response.json()
    assert "results" in data
    assert len(data["results"]) == 3
