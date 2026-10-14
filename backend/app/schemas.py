from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class ChatRequest(BaseModel):
    question: str = Field(..., min_length=2, max_length=500, description="Natural language question about retail inventory/sales")

class ChatResponse(BaseModel):
    question: str
    sql: str
    answer: str
    data: List[Dict[str, Any]]

class HealthResponse(BaseModel):
    status: str
    database: str
    details: Optional[str] = None

class ColumnInfo(BaseModel):
    name: str
    type: str
    description: str

class SchemaResponse(BaseModel):
    table_name: str
    record_count_approx: Optional[int] = None
    columns: List[ColumnInfo]

class ChatMessageItem(BaseModel):
    id: Optional[str] = None
    role: str = Field(..., pattern="^(user|assistant)$")
    content: str
    sql: Optional[str] = None
    data: Optional[List[Dict[str, Any]]] = None
    timestamp: Optional[str] = None

class SaveSessionRequest(BaseModel):
    session_id: Optional[str] = None
    title: Optional[str] = None
    messages: List[ChatMessageItem]

class SessionSummary(BaseModel):
    id: str
    title: str
    created_at: str
    updated_at: str
    message_count: int

class SessionDetail(BaseModel):
    id: str
    title: str
    created_at: str
    updated_at: str
    messages: List[ChatMessageItem]

class KpiMetrics(BaseModel):
    total_records: int
    total_units_sold: int
    total_revenue: float
    total_inventory: int
    total_units_ordered: int
    avg_discount: float
    avg_price: float
    total_demand_forecast: float
    stock_to_demand_ratio: float
    active_stores_count: int
    active_products_count: int

class FilterOptions(BaseModel):
    categories: List[str]
    regions: List[str]
    weather_conditions: List[str]
    seasonalities: List[str]
    date_range: Dict[str, str]

class DashboardAnalyticsResponse(BaseModel):
    kpis: KpiMetrics
    monthly_trends: List[Dict[str, Any]]
    category_breakdown: List[Dict[str, Any]]
    regional_breakdown: List[Dict[str, Any]]
    weather_impact: List[Dict[str, Any]]
    seasonality_impact: List[Dict[str, Any]]
    promotional_impact: Dict[str, Any]
    top_products: List[Dict[str, Any]]
    filter_options: FilterOptions

class PaginatedRecordsResponse(BaseModel):
    records: List[Dict[str, Any]]
    total: int
    page: int
    page_size: int
    total_pages: int

