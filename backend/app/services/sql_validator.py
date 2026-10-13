from typing import List, Dict, Tuple
import sqlglot
from sqlglot import exp

ALLOWED_TABLES = {"retail_inventory", "public.retail_inventory"}

ALLOWED_COLUMNS = {
    "id", "date", "store_id", "product_id", "category", "region",
    "inventory_level", "units_sold", "units_ordered", "demand_forecast",
    "price", "discount", "weather_condition", "holiday_promotion",
    "competitor_pricing", "seasonality"
}

# Forbidden SQL statements / expression types
FORBIDDEN_EXPRESSIONS = (
    exp.Insert,
    exp.Update,
    exp.Delete,
    exp.Drop,
    exp.Alter,
    exp.Create,
    exp.TruncateTable,
    exp.Transaction,
    exp.Commit,
    exp.Rollback,
    exp.Command,
    exp.Grant,
)

# Dangerous PostgreSQL functions to prohibit
DANGEROUS_FUNCTIONS = {
    "pg_sleep",
    "pg_read_file",
    "pg_write_file",
    "pg_ls_dir",
    "current_setting",
    "set_config",
    "version",
    "query_to_xml",
    "dblink",
    "dblink_exec",
}

class SQLValidationError(Exception):
    """Raised when an untrusted SQL query violates safety constraints."""
    pass

def validate_and_sanitize_sql(sql_query: str, max_limit: int = 100) -> str:
    """
    Validates that the SQL query is strictly read-only, references only public.retail_inventory,
    contains no dangerous functions or multi-statements, and enforces a row limit.
    """
    cleaned_sql = sql_query.strip()
    if not cleaned_sql:
        raise SQLValidationError("Empty SQL query.")

    # Remove trailing semicolons for uniform parsing
    cleaned_sql = cleaned_sql.rstrip(";")

    # Prevent multi-statement injection (semicolons in body)
    # Check by parsing with sqlglot
    try:
        parsed_statements = sqlglot.parse(cleaned_sql, read="postgres")
    except Exception as e:
        raise SQLValidationError(f"SQL Syntax Error / Failed to parse query: {str(e)}")

    if not parsed_statements:
        raise SQLValidationError("No valid SQL statement found.")

    if len(parsed_statements) > 1:
        raise SQLValidationError("Multiple SQL statements are not permitted.")

    expression = parsed_statements[0]
    if expression is None:
        raise SQLValidationError("Invalid SQL statement.")

    # Must be a Select or a CTE (Select with 'with' clause)
    if not isinstance(expression, exp.Select):
        raise SQLValidationError(f"Only SELECT queries are allowed. Received: {expression.key.upper()}")

    # Traverse AST and detect forbidden constructs
    for node in expression.walk():
        if isinstance(node, FORBIDDEN_EXPRESSIONS):
            raise SQLValidationError(f"Forbidden SQL operation detected: {node.key.upper()}")

        # Check function calls
        if isinstance(node, exp.Anonymous):
            func_name = node.name.lower()
            if func_name in DANGEROUS_FUNCTIONS:
                raise SQLValidationError(f"Call to prohibited function '{func_name}' is blocked.")

        # Check referenced tables
        if isinstance(node, exp.Table):
            table_name = node.name.lower()
            schema_name = node.db.lower() if node.db else ""
            full_name = f"{schema_name}.{table_name}" if schema_name else table_name

            # Reject system catalogs (pg_*, information_schema)
            if schema_name in {"pg_catalog", "information_schema"} or table_name.startswith("pg_"):
                raise SQLValidationError(f"Access to catalog or system tables ({full_name}) is strictly prohibited.")

            # Validate against allowed retail table
            if table_name != "retail_inventory":
                # Check if it's a CTE defined in this query
                cte_names = [cte.alias.lower() for cte in expression.ctes]
                if table_name not in cte_names:
                    raise SQLValidationError(
                        f"Access to unauthorized table '{full_name}'. Only 'public.retail_inventory' is permitted."
                    )

    # Ensure LIMIT clause exists and does not exceed max_limit
    limit_node = expression.args.get("limit")
    if limit_node is None:
        expression = expression.limit(max_limit)
    else:
        try:
            current_limit = int(limit_node.expression.name)
            if current_limit > max_limit:
                expression = expression.limit(max_limit)
        except (ValueError, AttributeError):
            expression = expression.limit(max_limit)

    return expression.sql(dialect="postgres")
