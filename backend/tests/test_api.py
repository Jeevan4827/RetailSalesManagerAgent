import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["database"] == "connected"
    assert "retail_inventory" in data["details"]

def test_schema_endpoint():
    response = client.get("/schema")
    assert response.status_code == 200
    data = response.json()
    assert data["table_name"] == "public.retail_inventory"
    assert data["record_count_approx"] == 73100
    assert len(data["columns"]) == 16
    column_names = [c["name"] for c in data["columns"]]
    assert "units_sold" in column_names
    assert "demand_forecast" in column_names

def test_chat_endpoint_live_db():
    test_question = "Which five products sold the most units?"
    mock_sql = "SELECT product_id, SUM(units_sold) AS total_sold FROM public.retail_inventory GROUP BY product_id ORDER BY total_sold DESC LIMIT 5"
    
    with patch("app.main.generate_sql", return_value=mock_sql):
        response = client.post("/chat", json={"question": test_question})
        assert response.status_code == 200
        data = response.json()
        assert data["question"] == test_question
        assert "SELECT" in data["sql"]
        assert len(data["data"]) == 5
        assert "product_id" in data["data"][0]
        assert "total_sold" in data["data"][0]
        assert len(data["answer"]) > 10

def test_chat_endpoint_blocks_destructive_query():
    destructive_sql = "DELETE FROM public.retail_inventory"
    with patch("app.main.generate_sql", return_value=destructive_sql):
        response = client.post("/chat", json={"question": "Delete all data"})
        assert response.status_code == 400
        assert "Security guardrail rejected" in response.json()["detail"]

def test_chat_empty_query_result_handled():
    empty_result_sql = "SELECT product_id, units_sold FROM public.retail_inventory WHERE category = 'NonExistentCategoryXYZ'"
    with patch("app.main.generate_sql", return_value=empty_result_sql):
        response = client.post("/chat", json={"question": "Show sales for NonExistentCategoryXYZ"})
        assert response.status_code == 200
        data = response.json()
        assert len(data["data"]) == 0
        assert len(data["answer"]) > 0

def test_chat_endpoint_invalid_input():
    response = client.post("/chat", json={"question": ""})
    assert response.status_code == 422
