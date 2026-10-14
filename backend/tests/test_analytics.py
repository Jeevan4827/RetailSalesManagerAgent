import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_dashboard_analytics_default():
    response = client.get("/analytics/dashboard")
    assert response.status_code == 200
    data = response.json()
    
    # Verify KPIs
    assert "kpis" in data
    kpis = data["kpis"]
    assert kpis["total_records"] == 73100
    assert kpis["total_units_sold"] > 0
    assert kpis["total_revenue"] > 0
    assert kpis["total_inventory"] > 0
    assert kpis["stock_to_demand_ratio"] > 0
    
    # Verify Trends & Breakdowns
    assert len(data["monthly_trends"]) >= 24
    assert len(data["category_breakdown"]) == 5
    assert len(data["regional_breakdown"]) == 4
    assert len(data["weather_impact"]) == 4
    assert len(data["seasonality_impact"]) == 4
    assert len(data["top_products"]) == 10
    
    # Verify Meta
    assert len(data["filter_options"]["categories"]) == 5
    assert len(data["filter_options"]["regions"]) == 4

def test_dashboard_analytics_with_filters():
    response = client.get("/analytics/dashboard?category=Electronics&region=North&holiday_promotion=1")
    assert response.status_code == 200
    data = response.json()
    kpis = data["kpis"]
    assert kpis["total_records"] < 73100
    assert kpis["total_records"] > 0

def test_analytics_records_pagination_and_sorting():
    response = client.get("/analytics/records?page=1&page_size=10&sort_by=revenue&sort_order=desc")
    assert response.status_code == 200
    data = response.json()
    assert data["page"] == 1
    assert data["page_size"] == 10
    assert len(data["records"]) == 10
    assert data["total"] == 73100
    assert data["total_pages"] > 0
    
    # Verify records are sorted descending by revenue
    rev1 = data["records"][0]["revenue"]
    rev2 = data["records"][1]["revenue"]
    assert rev1 >= rev2

def test_analytics_records_search():
    response = client.get("/analytics/records?search=P0001&page_size=5")
    assert response.status_code == 200
    data = response.json()
    assert len(data["records"]) > 0
    for r in data["records"]:
        assert "P0001" in r["product_id"] or "P0001" in r["store_id"]
