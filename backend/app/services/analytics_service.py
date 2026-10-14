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

def run_scenario_simulation(
    category: Optional[str] = "All",
    region: Optional[str] = "All",
    price_change_pct: float = 0.0,
    demand_shock_pct: float = 0.0,
    target_weather: Optional[str] = "Baseline",
    competitor_discount_pct: float = 0.0,
    is_holiday_mode: bool = False,
) -> Dict[str, Any]:
    """
    Simulates pricing elasticity, demand shocks, weather shifts, and stockout vulnerability
    based on the 73,100 ground-truth records in public.retail_inventory.
    """
    category_elasticities = {
        "Electronics": -1.65,
        "Clothing": -1.45,
        "Furniture": -1.20,
        "Toys": -1.35,
        "Groceries": -0.75,
    }
    
    selected_elasticity = category_elasticities.get(category, -1.35) if category and category != "All" else -1.35

    weather_multipliers = {
        "Sunny": 1.06,
        "Rainy": 0.93,
        "Snowy": 0.87,
        "Cloudy": 1.00,
        "Baseline": 1.00,
    }
    weather_factor = weather_multipliers.get(target_weather, 1.00)
    holiday_factor = 1.25 if is_holiday_mode else 1.00
    competitor_factor = 1.0 - (competitor_discount_pct * 0.35 / 100.0)

    # Price effect: P_new = P_base * (1 + delta_P)
    price_multiplier = 1.0 + (price_change_pct / 100.0)
    
    # Elasticity volume lift: delta_Q = -elasticity * delta_P (e.g. -10% price => +13.5% units)
    price_volume_factor = 1.0 + (-selected_elasticity * (-price_change_pct / 100.0))
    demand_shock_factor = 1.0 + (demand_shock_pct / 100.0)

    # Combined volume multiplier
    total_volume_multiplier = max(0.10, price_volume_factor * demand_shock_factor * weather_factor * holiday_factor * competitor_factor)

    where_sql, params = build_filter_clause(
        category=category,
        region=region,
    )

    with get_db_connection() as conn:
        with conn.cursor() as cur:
            # 1. Baseline Totals
            cur.execute(f"""
                SELECT 
                    COALESCE(SUM(units_sold), 0) AS total_units,
                    COALESCE(SUM(units_sold * price), 0) AS total_revenue,
                    COALESCE(SUM(inventory_level), 0) AS total_inventory,
                    COALESCE(SUM(demand_forecast), 0) AS total_demand
                FROM public.retail_inventory
                WHERE {where_sql};
            """, params)
            base_row = cur.fetchone()

            base_units = int(base_row["total_units"])
            base_revenue = float(base_row["total_revenue"])
            base_inventory = int(base_row["total_inventory"])
            base_demand = float(base_row["total_demand"])

            # 2. Category comparison data
            cur.execute(f"""
                SELECT 
                    category,
                    COALESCE(SUM(units_sold * price), 0) AS base_rev,
                    COALESCE(SUM(units_sold), 0) AS base_u
                FROM public.retail_inventory
                WHERE {where_sql}
                GROUP BY category
                ORDER BY base_rev DESC;
            """, params)
            cat_rows = cur.fetchall()

            category_comparison = []
            for r in cat_rows:
                c_name = r["category"]
                c_elasticity = category_elasticities.get(c_name, selected_elasticity)
                c_vol_factor = max(0.10, (1.0 + (-c_elasticity * (-price_change_pct / 100.0))) * demand_shock_factor * weather_factor * holiday_factor * competitor_factor)
                c_base_rev = float(r["base_rev"])
                c_sim_rev = round(c_base_rev * price_multiplier * c_vol_factor, 2)
                category_comparison.append({
                    "category": c_name,
                    "baseline_revenue": round(c_base_rev, 2),
                    "simulated_revenue": c_sim_rev,
                    "delta_pct": round(((c_sim_rev - c_base_rev) / max(1.0, c_base_rev)) * 100, 1),
                })

            # 3. Regional comparison data
            cur.execute(f"""
                SELECT 
                    region,
                    COALESCE(SUM(units_sold * price), 0) AS base_rev
                FROM public.retail_inventory
                WHERE {where_sql}
                GROUP BY region
                ORDER BY base_rev DESC;
            """, params)
            reg_rows = cur.fetchall()
            regional_comparison = [
                {
                    "region": r["region"],
                    "baseline_revenue": round(float(r["base_rev"]), 2),
                    "simulated_revenue": round(float(r["base_rev"]) * price_multiplier * total_volume_multiplier, 2),
                }
                for r in reg_rows
            ]

            # 4. Identify high-risk stockout SKUs under this simulated demand
            cur.execute(f"""
                SELECT 
                    product_id,
                    category,
                    region,
                    ROUND(AVG(inventory_level), 0) AS avg_inventory,
                    ROUND(AVG(demand_forecast), 1) AS avg_demand,
                    ROUND(AVG(price), 2) AS avg_price
                FROM public.retail_inventory
                WHERE {where_sql}
                GROUP BY product_id, category, region
                ORDER BY avg_demand DESC
                LIMIT 30;
            """, params)
            sku_candidates = cur.fetchall()

            at_risk_skus = []
            total_shortfall_loss = 0.0
            stockout_count = 0

            for s in sku_candidates:
                curr_inv = int(s["avg_inventory"])
                b_demand = float(s["avg_demand"])
                p_avg = float(s["avg_price"]) * price_multiplier
                sim_demand = round(b_demand * total_volume_multiplier, 1)

                if sim_demand > curr_inv:
                    stockout_count += 1
                    shortfall = int(sim_demand - curr_inv)
                    loss = round(shortfall * p_avg, 2)
                    total_shortfall_loss += loss
                    reorder_rec = int(shortfall * 1.25) + 10 # 25% safety stock + base

                    at_risk_skus.append({
                        "product_id": s["product_id"],
                        "category": s["category"],
                        "region": s["region"],
                        "current_inventory": curr_inv,
                        "base_demand": b_demand,
                        "simulated_demand": sim_demand,
                        "shortfall_units": shortfall,
                        "estimated_revenue_loss": loss,
                        "recommended_reorder": reorder_rec,
                    })

            # Sort at-risk SKUs by revenue loss descending
            at_risk_skus.sort(key=lambda x: x["estimated_revenue_loss"], reverse=True)

    # Compute overall simulated metrics
    simulated_units = int(base_units * total_volume_multiplier)
    simulated_revenue = round(base_revenue * price_multiplier * total_volume_multiplier, 2)
    revenue_delta = round(simulated_revenue - base_revenue, 2)
    revenue_delta_pct = round((revenue_delta / max(1.0, base_revenue)) * 100, 2)
    units_delta = simulated_units - base_units
    units_delta_pct = round((units_delta / max(1, base_units)) * 100, 2)

    base_stock_to_demand = round(base_inventory / max(1.0, base_demand), 2)
    sim_demand_total = base_demand * total_volume_multiplier
    simulated_stock_to_demand = round(base_inventory / max(1.0, sim_demand_total), 2)

    net_realized_revenue = max(0.0, round(simulated_revenue - total_shortfall_loss, 2))

    # 5. Price Sensitivity Curve (-30% to +30%)
    price_sensitivity_curve = []
    for test_p in [-30, -20, -10, -5, 0, 5, 10, 20, 30]:
        t_price_mult = 1.0 + (test_p / 100.0)
        t_vol_factor = max(0.10, (1.0 + (-selected_elasticity * (-test_p / 100.0))) * demand_shock_factor * weather_factor * holiday_factor * competitor_factor)
        t_rev = round(base_revenue * t_price_mult * t_vol_factor, 2)
        price_sensitivity_curve.append({
            "price_delta": f"{'+' if test_p > 0 else ''}{test_p}%",
            "price_delta_num": test_p,
            "projected_revenue": t_rev,
            "volume_lift_pct": round((t_vol_factor - 1.0) * 100, 1),
        })

    # AI narrative synthesis
    direction = "positive" if revenue_delta >= 0 else "contractionary"
    summary_parts = [
        f"Simulating a {price_change_pct:+.1f}% price adjustment with a {demand_shock_pct:+.1f}% demand shock yields a {direction} revenue shift of ${abs(revenue_delta):,.2f} ({revenue_delta_pct:+.1f}%).",
        f"Units sold are projected at {simulated_units:,} (lift of {units_delta_pct:+.1f}%).",
    ]
    if stockout_count > 0:
        summary_parts.append(f"Caution: {stockout_count} high-volume SKU cluster(s) face stockout deficit, representing an estimated ${total_shortfall_loss:,.2f} in unrealized sales if replenishment orders are not expedited.")
    else:
        summary_parts.append("Inventory buffers remain healthy with no acute stockout risks detected across top products.")

    ai_executive_summary = " ".join(summary_parts)

    copilot_prompt = (
        f"We simulated a scenario in {category} for {region} region with a {price_change_pct:+.1f}% price shift, "
        f"{demand_shock_pct:+.1f}% demand shock, and {target_weather} weather. Projected revenue shift is {revenue_delta_pct:+.1f}% (${revenue_delta:,.2f}), "
        f"with {stockout_count} SKUs at stockout risk (${total_shortfall_loss:,.2f} loss). What specific replenishment and warehouse rebalancing actions should we take?"
    )

    return {
        "baseline_revenue": round(base_revenue, 2),
        "simulated_revenue": simulated_revenue,
        "revenue_delta": revenue_delta,
        "revenue_delta_pct": revenue_delta_pct,
        "baseline_units": base_units,
        "simulated_units": simulated_units,
        "units_delta": units_delta,
        "units_delta_pct": units_delta_pct,
        "baseline_stock_to_demand": base_stock_to_demand,
        "simulated_stock_to_demand": simulated_stock_to_demand,
        "stockout_vulnerable_skus_count": stockout_count,
        "estimated_stockout_loss": round(total_shortfall_loss, 2),
        "net_realized_revenue": net_realized_revenue,
        "elasticity_coefficient": selected_elasticity,
        "category_comparison": category_comparison,
        "regional_comparison": regional_comparison,
        "price_sensitivity_curve": price_sensitivity_curve,
        "at_risk_skus": at_risk_skus,
        "ai_executive_summary": ai_executive_summary,
        "suggested_copilot_prompt": copilot_prompt,
    }

