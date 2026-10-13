import pytest
from app.services.sql_validator import validate_and_sanitize_sql, SQLValidationError

def test_safe_select_query():
    sql = "SELECT product_id, SUM(units_sold) AS total_sold FROM public.retail_inventory GROUP BY product_id ORDER BY total_sold DESC LIMIT 5;"
    sanitized = validate_and_sanitize_sql(sql)
    assert "LIMIT 5" in sanitized
    assert "public.retail_inventory" in sanitized.lower() or "retail_inventory" in sanitized.lower()

def test_auto_limit_added():
    sql = "SELECT * FROM public.retail_inventory"
    sanitized = validate_and_sanitize_sql(sql, max_limit=50)
    assert "LIMIT 50" in sanitized

def test_excessive_limit_reduced():
    sql = "SELECT * FROM public.retail_inventory LIMIT 500"
    sanitized = validate_and_sanitize_sql(sql, max_limit=100)
    assert "LIMIT 100" in sanitized

def test_cte_query():
    sql = """
    WITH regional_sales AS (
        SELECT region, SUM(units_sold) as total FROM public.retail_inventory GROUP BY region
    )
    SELECT * FROM regional_sales ORDER BY total DESC LIMIT 3;
    """
    sanitized = validate_and_sanitize_sql(sql)
    assert "WITH" in sanitized or "with" in sanitized.lower()

def test_reject_delete():
    with pytest.raises(SQLValidationError, match="Only SELECT queries are allowed|Forbidden"):
        validate_and_sanitize_sql("DELETE FROM public.retail_inventory WHERE id = 1;")

def test_reject_update():
    with pytest.raises(SQLValidationError, match="Only SELECT queries are allowed|Forbidden"):
        validate_and_sanitize_sql("UPDATE public.retail_inventory SET units_sold = 0;")

def test_reject_drop():
    with pytest.raises(SQLValidationError, match="Only SELECT queries are allowed|Forbidden"):
        validate_and_sanitize_sql("DROP TABLE public.retail_inventory;")

def test_reject_multiple_statements():
    with pytest.raises(SQLValidationError, match="Multiple SQL statements are not permitted"):
        validate_and_sanitize_sql("SELECT 1 FROM public.retail_inventory; DROP TABLE public.retail_inventory;")

def test_reject_unauthorized_table():
    with pytest.raises(SQLValidationError, match="Access to unauthorized table"):
        validate_and_sanitize_sql("SELECT * FROM users;")

def test_reject_catalog_table():
    with pytest.raises(SQLValidationError, match="catalog or system tables"):
        validate_and_sanitize_sql("SELECT * FROM pg_catalog.pg_tables;")

def test_reject_dangerous_function():
    with pytest.raises(SQLValidationError, match="prohibited function"):
        validate_and_sanitize_sql("SELECT pg_sleep(5) FROM public.retail_inventory;")
