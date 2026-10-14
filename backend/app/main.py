import logging
from fastapi import FastAPI, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from app.config import settings
from app.schemas import (
    ChatRequest, ChatResponse, HealthResponse, SchemaResponse, ColumnInfo,
    SaveSessionRequest, SessionSummary, SessionDetail,
    DashboardAnalyticsResponse, PaginatedRecordsResponse,
    ScenarioSimulationRequest, ScenarioSimulationResponse
)
from app.database import (
    check_db_health, execute_readonly_query, get_table_schema_info,
    save_chat_session, list_chat_sessions, get_chat_session_detail, delete_chat_session
)
from app.services.sql_generator import generate_sql
from app.services.sql_validator import validate_and_sanitize_sql, SQLValidationError
from app.services.answer_generator import generate_answer
from app.services.analytics_service import get_dashboard_analytics, get_analytics_records, run_scenario_simulation


logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Intelligent Retail Sales Manager Agent",
    description="LLM-powered text-to-SQL backend for Supabase retail inventory analysis.",
    version="1.0.0"
)

# Enable CORS for future frontend access and local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

COLUMN_DESCRIPTIONS = {
    "id": "Unique row identifier (bigint)",
    "date": "Observation date (date)",
    "store_id": "Store identifier (text)",
    "product_id": "Product identifier (text)",
    "category": "Product category (text)",
    "region": "Sales geographic region (text)",
    "inventory_level": "Current stock level in units (integer)",
    "units_sold": "Number of units sold (integer)",
    "units_ordered": "Number of units ordered (integer)",
    "demand_forecast": "Forecast demand quantity (numeric)",
    "price": "Unit selling price (numeric)",
    "discount": "Discount percentage (integer)",
    "weather_condition": "Weather conditions recorded (text)",
    "holiday_promotion": "Holiday promotion flag (1 or 0) (integer)",
    "competitor_pricing": "Competitor pricing benchmark (numeric)",
    "seasonality": "Season name (text)"
}

@app.get("/health", response_model=HealthResponse, tags=["Health"])
def health():
    """
    Check application status and live database connectivity.
    """
    is_healthy, message = check_db_health()
    if not is_healthy:
        logger.error(f"Health check failed: {message}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database unreachable: {message}"
        )
    return HealthResponse(
        status="ok",
        database="connected",
        details=message
    )

@app.get("/schema", response_model=SchemaResponse, tags=["Schema"])
def schema():
    """
    Returns public.retail_inventory metadata, columns, and data types without exposing credentials.
    """
    try:
        schema_data = get_table_schema_info()
        columns_list = [
            ColumnInfo(
                name=col["column_name"],
                type=col["data_type"],
                description=COLUMN_DESCRIPTIONS.get(col["column_name"], col["data_type"])
            )
            for col in schema_data["columns"]
        ]
        return SchemaResponse(
            table_name=schema_data["table_name"],
            record_count_approx=schema_data["count"],
            columns=columns_list
        )
    except Exception as e:
        logger.error(f"Failed to fetch schema info: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error inspecting schema: {str(e)}"
        )

@app.post("/chat", response_model=ChatResponse, tags=["Chat"])
def chat(request: ChatRequest):
    """
    Accepts a natural-language question, generates and validates safe SQL,
    executes it against Supabase PostgreSQL, and returns grounded answers.
    """
    question = request.question.strip()
    logger.info(f"Received question: {question}")

    # Step 1: Generate SQL query via LLM
    try:
        raw_sql = generate_sql(question)
        logger.info(f"Generated raw SQL: {raw_sql}")
    except Exception as e:
        logger.error(f"SQL Generation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"LLM SQL Generation failed: {str(e)}"
        )

    # Step 2: Validate and Sanitize SQL Query
    try:
        safe_sql = validate_and_sanitize_sql(raw_sql, max_limit=settings.MAX_ROWS_LIMIT)
        logger.info(f"Sanitized SQL: {safe_sql}")
    except SQLValidationError as ve:
        logger.warning(f"SQL Validation rejected: {ve}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Security guardrail rejected query: {str(ve)}"
        )
    except Exception as e:
        logger.error(f"Unexpected validation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Query validation failed: {str(e)}"
        )

    # Step 3: Execute safe query on Supabase read-only transaction
    try:
        rows = execute_readonly_query(safe_sql)
        logger.info(f"Query returned {len(rows)} rows.")
    except Exception as e:
        logger.error(f"Execution failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database execution error: {str(e)}"
        )

    # Step 4: Grounded Answer Synthesis
    try:
        answer = generate_answer(question, safe_sql, rows)
    except Exception as e:
        logger.error(f"Answer generation error: {e}")
        answer = f"Data query succeeded with {len(rows)} records, but natural language synthesis encountered an error: {str(e)}"

    return ChatResponse(
        question=question,
        sql=safe_sql,
        answer=answer,
        data=rows
    )

@app.post("/sessions", tags=["Sessions"])
def create_session(req: SaveSessionRequest):
    """
    Saves a completed chat session trajectory into the Supabase database.
    """
    if not req.messages:
        raise HTTPException(status_code=400, detail="Cannot save an empty chat session.")

    # Determine a good title if not provided
    first_user_msg = next((m.content for m in req.messages if m.role == "user"), None)
    title = req.title or (first_user_msg[:45] + "..." if first_user_msg and len(first_user_msg) > 45 else first_user_msg) or "Retail Conversation"

    try:
        session_id = save_chat_session(title=title, messages=[m.model_dump() for m in req.messages], session_id=req.session_id)
        return {"status": "success", "session_id": session_id, "title": title}
    except Exception as e:
        logger.error(f"Failed to save session: {e}")
        raise HTTPException(status_code=500, detail=f"Database error saving session: {str(e)}")

@app.get("/sessions", response_model=List[SessionSummary], tags=["Sessions"])
def get_sessions():
    """
    Retrieves all saved conversation sessions.
    """
    try:
        return list_chat_sessions()
    except Exception as e:
        logger.error(f"Failed to list sessions: {e}")
        raise HTTPException(status_code=500, detail=f"Database error fetching sessions: {str(e)}")

@app.get("/sessions/{session_id}", response_model=SessionDetail, tags=["Sessions"])
def get_session(session_id: str):
    """
    Retrieves full message details for a specific session.
    """
    try:
        session = get_chat_session_detail(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found.")
        return session
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch session detail: {e}")
        raise HTTPException(status_code=500, detail=f"Database error fetching session: {str(e)}")

@app.delete("/sessions/{session_id}", tags=["Sessions"])
def remove_session(session_id: str):
    """
    Deletes a conversation session from the database.
    """
    try:
        success = delete_chat_session(session_id)
        if not success:
            raise HTTPException(status_code=404, detail="Session not found.")
        return {"status": "deleted", "session_id": session_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete session: {e}")
        raise HTTPException(status_code=500, detail=f"Database error deleting session: {str(e)}")

@app.get("/analytics/dashboard", response_model=DashboardAnalyticsResponse, tags=["Analytics"])
def get_analytics(
    category: Optional[str] = Query(None, description="Category filter (Clothing, Electronics, Furniture, Groceries, Toys)"),
    region: Optional[str] = Query(None, description="Region filter (East, North, South, West)"),
    weather: Optional[str] = Query(None, description="Weather filter (Sunny, Rainy, Cloudy, Snowy)"),
    seasonality: Optional[str] = Query(None, description="Seasonality filter (Autumn, Spring, Summer, Winter)"),
    holiday_promotion: Optional[int] = Query(None, description="Promotion status: 1 or 0"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
):
    """
    Computes high-performance executive KPIs, time-series trends, and categorical breakdowns.
    """
    try:
        data = get_dashboard_analytics(
            category=category,
            region=region,
            weather=weather,
            seasonality=seasonality,
            holiday_promotion=holiday_promotion,
            start_date=start_date,
            end_date=end_date,
        )
        return data
    except Exception as e:
        logger.error(f"Failed to fetch dashboard analytics: {e}")
        raise HTTPException(status_code=500, detail=f"Error computing analytics: {str(e)}")

@app.get("/analytics/records", response_model=PaginatedRecordsResponse, tags=["Analytics"])
def get_records(
    category: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    weather: Optional[str] = Query(None),
    seasonality: Optional[str] = Query(None),
    holiday_promotion: Optional[int] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    sort_by: str = Query("date", description="Field to sort by (date, units_sold, revenue, inventory_level, demand_forecast, price, discount)"),
    sort_order: str = Query("desc", description="asc or desc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=5, le=100),
    search: Optional[str] = Query(None, description="Search product_id or store_id"),
):
    """
    Returns filtered, sorted, paginated records with total count and metadata.
    """
    try:
        return get_analytics_records(
            category=category,
            region=region,
            weather=weather,
            seasonality=seasonality,
            holiday_promotion=holiday_promotion,
            start_date=start_date,
            end_date=end_date,
            sort_by=sort_by,
            sort_order=sort_order,
            page=page,
            page_size=page_size,
            search=search,
        )
    except Exception as e:
        logger.error(f"Failed to fetch paginated records: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching records: {str(e)}")

@app.post("/analytics/simulate", response_model=ScenarioSimulationResponse, tags=["Analytics"])
def simulate_scenario(request: ScenarioSimulationRequest):
    """
    Simulates price elasticity, demand shocks, weather shifts, and stockout vulnerability.
    """
    try:
        return run_scenario_simulation(
            category=request.category,
            region=request.region,
            price_change_pct=request.price_change_pct,
            demand_shock_pct=request.demand_shock_pct,
            target_weather=request.target_weather,
            competitor_discount_pct=request.competitor_discount_pct,
            is_holiday_mode=request.is_holiday_mode or False,
        )
    except Exception as e:
        logger.error(f"Failed to run scenario simulation: {e}")
        raise HTTPException(status_code=500, detail=f"Error running simulation: {str(e)}")

