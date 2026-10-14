import time
from typing import Dict, Any, List, Optional, Tuple
from app.database import get_db_connection

# In-memory TTL cache for dashboard aggregates: key -> (timestamp, data)
_CACHE: Dict[str, Tuple[float, Any]] = {}
CACHE_TTL_SECONDS = 60.0

def _get_from_cache(cache_key: str) -> Optional[Any]:
    now = time.time()
    if cache_key in _CACHE:
        ts, data = _CACHE[cache_key]
        if now - ts < CACHE_TTL_SECONDS:
            return data
        else:
            del _CACHE[cache_key]
    return None

def _set_cache(cache_key: str, data: Any):
    # Evict old entries if cache grows
    now = time.time()
    if len(_CACHE) > 100:
        expired_keys = [k for k, (ts, _) in _CACHE.items() if now - ts >= CACHE_TTL_SECONDS]
        for k in expired_keys:
            _CACHE.pop(k, None)
    _CACHE[cache_key] = (now, data)

def build_filter_clause(
    category: Optional[str] = None,
    region: Optional[str] = None,
    weather: Optional[str] = None,
    seasonality: Optional[str] = None,
    holiday_promotion: Optional[int] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
) -> Tuple[str, List[Any]]:
    """
    Constructs parameterized WHERE conditions for public.retail_inventory.
    """
    conditions = ["1=1"]
    params: List[Any] = []

    if category and category.lower() != "all":
        conditions.append("category = %s")
        params.append(category)

    if region and region.lower() != "all":
        conditions.append("region = %s")
        params.append(region)

    if weather and weather.lower() != "all":
        conditions.append("weather_condition = %s")
        params.append(weather)

    if seasonality and seasonality.lower() != "all":
        conditions.append("seasonality = %s")
        params.append(seasonality)

    if holiday_promotion is not None and holiday_promotion in (0, 1):
        conditions.append("holiday_promotion = %s")
        params.append(holiday_promotion)

    if start_date:
        conditions.append("date >= %s::date")
        params.append(start_date)

    if end_date:
        conditions.append("date <= %s::date")
        params.append(end_date)

    where_sql = " AND ".join(conditions)
    return where_sql, params

def get_dashboard_analytics(
    category: Optional[str] = None,
    region: Optional[str] = None,
    weather: Optional[str] = None,
    seasonality: Optional[str] = None,
    holiday_promotion: Optional[int] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Computes comprehensive executive KPIs and infographics dataset directly in PostgreSQL.
    """
    cache_key = f"dash:{category}:{region}:{weather}:{seasonality}:{holiday_promotion}:{start_date}:{end_date}"
    cached = _get_from_cache(cache_key)
    if cached:
        return cached

    where_sql, params = build_filter_clause(
        category=category,
        region=region,
        weather=weather,
        seasonality=seasonality,
        holiday_promotion=holiday_promotion,
        start_date=start_date,
        end_date=end_date,
    )

    with get_db_connection() as conn:
        with conn.cursor() as cur:
            # 1. Main Executive KPIs
            kpi_query = f"""
                SELECT 
                    COUNT(*) AS total_records,
                    COALESCE(SUM(units_sold), 0) AS total_units_sold,
                    COALESCE(SUM(units_sold * price), 0) AS total_revenue,
                    COALESCE(SUM(inventory_level), 0) AS total_inventory,
                    COALESCE(SUM(units_ordered), 0) AS total_units_ordered,
                    COALESCE(AVG(discount), 0) AS avg_discount,
                    COALESCE(AVG(price), 0) AS avg_price,
                    COALESCE(SUM(demand_forecast), 0) AS total_demand_forecast,
                    COUNT(DISTINCT store_id) AS active_stores_count,
                    COUNT(DISTINCT product_id) AS active_products_count
                FROM public.retail_inventory
                WHERE {where_sql};
            """
            cur.execute(kpi_query, params)
            kpi_row = cur.fetchone() or {}

            total_units_sold = int(kpi_row.get("total_units_sold") or 0)
            total_revenue = float(kpi_row.get("total_revenue") or 0.0)
            total_inventory = int(kpi_row.get("total_inventory") or 0)
            total_demand = float(kpi_row.get("total_demand_forecast") or 0.0)

            # Stock to demand ratio in percentage
            stock_to_demand = round((total_inventory / total_demand * 100), 1) if total_demand > 0 else 100.0

            kpis = {
                "total_records": int(kpi_row.get("total_records") or 0),
                "total_units_sold": total_units_sold,
                "total_revenue": round(total_revenue, 2),
                "total_inventory": total_inventory,
                "total_units_ordered": int(kpi_row.get("total_units_ordered") or 0),
                "avg_discount": round(float(kpi_row.get("avg_discount") or 0.0), 2),
                "avg_price": round(float(kpi_row.get("avg_price") or 0.0), 2),
                "total_demand_forecast": round(total_demand, 2),
                "stock_to_demand_ratio": stock_to_demand,
                "active_stores_count": int(kpi_row.get("active_stores_count") or 0),
                "active_products_count": int(kpi_row.get("active_products_count") or 0),
            }

            # 2. Monthly Trends (Sales, Revenue, Demand Forecast)
            monthly_query = f"""
                SELECT 
                    to_char(date, 'YYYY-MM') AS month,
                    SUM(units_sold) AS units_sold,
                    ROUND(SUM(units_sold * price), 2) AS revenue,
                    ROUND(SUM(demand_forecast), 0) AS demand
                FROM public.retail_inventory
                WHERE {where_sql}
                GROUP BY to_char(date, 'YYYY-MM')
                ORDER BY month ASC;
            """
            cur.execute(monthly_query, params)
            monthly_trends = [
                {
                    "month": r["month"],
                    "units_sold": int(r["units_sold"] or 0),
                    "revenue": float(r["revenue"] or 0.0),
                    "demand": float(r["demand"] or 0.0),
                }
                for r in cur.fetchall()
            ]

            # 3. Category Breakdown
            cat_query = f"""
                SELECT 
                    category,
                    SUM(units_sold) AS units_sold,
                    ROUND(SUM(units_sold * price), 2) AS revenue,
                    SUM(inventory_level) AS inventory,
                    ROUND(AVG(discount), 1) AS avg_discount,
                    ROUND(AVG(price), 2) AS avg_price
                FROM public.retail_inventory
                WHERE {where_sql}
                GROUP BY category
                ORDER BY revenue DESC;
            """
            cur.execute(cat_query, params)
            category_breakdown = [
                {
                    "category": r["category"],
                    "units_sold": int(r["units_sold"] or 0),
                    "revenue": float(r["revenue"] or 0.0),
                    "inventory": int(r["inventory"] or 0),
                    "avg_discount": float(r["avg_discount"] or 0.0),
                    "avg_price": float(r["avg_price"] or 0.0),
                }
                for r in cur.fetchall()
            ]

            # 4. Regional Breakdown
            region_query = f"""
                SELECT 
                    region,
                    SUM(units_sold) AS units_sold,
                    ROUND(SUM(units_sold * price), 2) AS revenue,
                    SUM(inventory_level) AS inventory,
                    COUNT(DISTINCT store_id) AS stores_count
                FROM public.retail_inventory
                WHERE {where_sql}
                GROUP BY region
                ORDER BY revenue DESC;
            """
            cur.execute(region_query, params)
            regional_breakdown = [
                {
                    "region": r["region"],
                    "units_sold": int(r["units_sold"] or 0),
                    "revenue": float(r["revenue"] or 0.0),
                    "inventory": int(r["inventory"] or 0),
                    "stores_count": int(r["stores_count"] or 0),
                }
                for r in cur.fetchall()
            ]

            # 5. Weather Impact
            weather_query = f"""
                SELECT 
                    weather_condition,
                    SUM(units_sold) AS units_sold,
                    ROUND(SUM(units_sold * price), 2) AS revenue,
                    ROUND(AVG(units_sold), 1) AS avg_units_per_day,
                    ROUND(AVG(discount), 1) AS avg_discount
                FROM public.retail_inventory
                WHERE {where_sql}
                GROUP BY weather_condition
                ORDER BY revenue DESC;
            """
            cur.execute(weather_query, params)
            weather_impact = [
                {
                    "weather_condition": r["weather_condition"],
                    "units_sold": int(r["units_sold"] or 0),
                    "revenue": float(r["revenue"] or 0.0),
                    "avg_units_per_day": float(r["avg_units_per_day"] or 0.0),
                    "avg_discount": float(r["avg_discount"] or 0.0),
                }
                for r in cur.fetchall()
            ]

            # 6. Seasonality Impact
            season_query = f"""
                SELECT 
                    seasonality,
                    SUM(units_sold) AS units_sold,
                    ROUND(SUM(units_sold * price), 2) AS revenue,
                    SUM(units_ordered) AS units_ordered
                FROM public.retail_inventory
                WHERE {where_sql}
                GROUP BY seasonality
                ORDER BY revenue DESC;
            """
            cur.execute(season_query, params)
            seasonality_impact = [
                {
                    "seasonality": r["seasonality"],
                    "units_sold": int(r["units_sold"] or 0),
                    "revenue": float(r["revenue"] or 0.0),
                    "units_ordered": int(r["units_ordered"] or 0),
                }
                for r in cur.fetchall()
            ]

            # 7. Promotional Impact Comparison
            promo_query = f"""
                SELECT 
                    holiday_promotion,
                    COUNT(*) AS count_records,
                    ROUND(AVG(units_sold), 1) AS avg_units,
                    ROUND(AVG(units_sold * price), 2) AS avg_revenue,
                    ROUND(AVG(discount), 1) AS avg_discount
                FROM public.retail_inventory
                WHERE {where_sql}
                GROUP BY holiday_promotion;
            """
            cur.execute(promo_query, params)
            promo_data = {r["holiday_promotion"]: r for r in cur.fetchall()}
            p1 = promo_data.get(1, {})
            p0 = promo_data.get(0, {})

            promotional_impact = {
                "promo_days": int(p1.get("count_records") or 0),
                "regular_days": int(p0.get("count_records") or 0),
                "promo_avg_units": float(p1.get("avg_units") or 0.0),
                "regular_avg_units": float(p0.get("avg_units") or 0.0),
                "promo_avg_revenue": float(p1.get("avg_revenue") or 0.0),
                "regular_avg_revenue": float(p0.get("avg_revenue") or 0.0),
                "promo_avg_discount": float(p1.get("avg_discount") or 0.0),
                "regular_avg_discount": float(p0.get("avg_discount") or 0.0),
            }

            # 8. Top 10 Best Selling Products
            top_prod_query = f"""
                SELECT 
                    product_id,
                    category,
                    SUM(units_sold) AS units_sold,
                    ROUND(SUM(units_sold * price), 2) AS revenue,
                    SUM(inventory_level) AS inventory,
                    ROUND(SUM(demand_forecast), 0) AS demand
                FROM public.retail_inventory
                WHERE {where_sql}
                GROUP BY product_id, category
                ORDER BY units_sold DESC
                LIMIT 10;
            """
            cur.execute(top_prod_query, params)
            top_products = [
                {
                    "product_id": r["product_id"],
                    "category": r["category"],
                    "units_sold": int(r["units_sold"] or 0),
                    "revenue": float(r["revenue"] or 0.0),
                    "inventory": int(r["inventory"] or 0),
                    "demand": float(r["demand"] or 0.0),
                }
                for r in cur.fetchall()
            ]

            result = {
                "kpis": kpis,
                "monthly_trends": monthly_trends,
                "category_breakdown": category_breakdown,
                "regional_breakdown": regional_breakdown,
                "weather_impact": weather_impact,
                "seasonality_impact": seasonality_impact,
                "promotional_impact": promotional_impact,
                "top_products": top_products,
                "filter_options": {
                    "categories": ["Clothing", "Electronics", "Furniture", "Groceries", "Toys"],
                    "regions": ["East", "North", "South", "West"],
                    "weather_conditions": ["Cloudy", "Rainy", "Snowy", "Sunny"],
                    "seasonalities": ["Autumn", "Spring", "Summer", "Winter"],
                    "date_range": {"min_date": "2022-01-01", "max_date": "2024-01-01"},
                },
            }

            _set_cache(cache_key, result)
            return result

def get_analytics_records(
    category: Optional[str] = None,
    region: Optional[str] = None,
    weather: Optional[str] = None,
    seasonality: Optional[str] = None,
    holiday_promotion: Optional[int] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    sort_by: str = "date",
    sort_order: str = "desc",
    page: int = 1,
    page_size: int = 20,
    search: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Returns filtered, sorted, paginated records with total count and metadata.
    """
    where_sql, params = build_filter_clause(
        category=category,
        region=region,
        weather=weather,
        seasonality=seasonality,
        holiday_promotion=holiday_promotion,
        start_date=start_date,
        end_date=end_date,
    )

    # Search filter (product_id or store_id)
    if search and search.strip():
        where_sql += " AND (product_id ILIKE %s OR store_id ILIKE %s)"
        pattern = f"%{search.strip()}%"
        params.extend([pattern, pattern])

    # Allowed sorting fields whitelist
    ALLOWED_SORT = {
        "date": "date",
        "units_sold": "units_sold",
        "revenue": "(units_sold * price)",
        "inventory_level": "inventory_level",
        "units_ordered": "units_ordered",
        "demand_forecast": "demand_forecast",
        "price": "price",
        "discount": "discount",
        "category": "category",
        "region": "region",
    }
    sort_column = ALLOWED_SORT.get(sort_by, "date")
    direction = "ASC" if sort_order.lower() == "asc" else "DESC"

    page = max(1, page)
    page_size = min(max(5, page_size), 100)
    offset = (page - 1) * page_size

    with get_db_connection() as conn:
        with conn.cursor() as cur:
            # Get total count
            count_query = f"SELECT COUNT(*) AS total FROM public.retail_inventory WHERE {where_sql};"
            cur.execute(count_query, params)
            total = cur.fetchone()["total"]

            # Query page
            records_query = f"""
                SELECT 
                    id,
                    date::text AS date,
                    store_id,
                    product_id,
                    category,
                    region,
                    inventory_level,
                    units_sold,
                    units_ordered,
                    ROUND(demand_forecast, 1) AS demand_forecast,
                    ROUND(price, 2) AS price,
                    discount,
                    ROUND(units_sold * price, 2) AS revenue,
                    weather_condition,
                    holiday_promotion,
                    seasonality
                FROM public.retail_inventory
                WHERE {where_sql}
                ORDER BY {sort_column} {direction}
                LIMIT %s OFFSET %s;
            """
            cur.execute(records_query, params + [page_size, offset])
            rows = cur.fetchall()

            clean_rows = []
            for r in rows:
                clean_row = {}
                for k, v in r.items():
                    if hasattr(v, "to_eng_string"):
                        clean_row[k] = float(v)
                    else:
                        clean_row[k] = v
                clean_rows.append(clean_row)

            total_pages = (total + page_size - 1) // page_size if total > 0 else 1

            return {
                "records": clean_rows,
                "total": total,
                "page": page,
                "page_size": page_size,
                "total_pages": total_pages,
            }
