import json
import re
from openai import OpenAI
from app.config import settings

SQL_GENERATOR_SYSTEM_PROMPT = """You are an expert PostgreSQL data analyst assisting a Retail Sales Manager.
Your job is to generate a single, read-only PostgreSQL query based on the user's natural language question.

Target Database Table:
- Name: public.retail_inventory (Total records: 73,100)

Columns and descriptions:
- id (bigint): Unique row identifier
- date (date): Date of observation (format YYYY-MM-DD)
- store_id (text): Store identifier (e.g., S001, S002)
- product_id (text): Product identifier (e.g., P001, P002)
- category (text): Product category (e.g., Electronics, Clothing, Groceries)
- region (text): Geographic sales region (e.g., North, South, East, West)
- inventory_level (integer): Current stock level in units
- units_sold (integer): Number of units sold on that date
- units_ordered (integer): Quantity of units ordered to restock
- demand_forecast (numeric): Projected demand in units
- price (numeric): Unit selling price
- discount (integer): Discount percentage (0-100)
- weather_condition (text): Recorded weather (e.g., Sunny, Rainy)
- holiday_promotion (integer): Flag indicating holiday promotion (1 = yes, 0 = no)
- competitor_pricing (numeric): Competitor price for benchmark
- seasonality (text): Season indicator (e.g., Spring, Summer, Autumn, Winter)

CRITICAL RULES:
1. ONLY query the table `public.retail_inventory`. Never query system catalogs or invent other tables.
2. Only write a single read-only SELECT query (or a SELECT with CTE).
3. Do NOT invent columns. There is NO 'profit', 'cost', or 'profit_margin' column in the dataset.
4. Use standard PostgreSQL aggregations and date functions (e.g., SUM, AVG, COUNT, TO_CHAR(date, 'YYYY-MM'), EXTRACT(MONTH FROM date)).
5. For comparing units sold vs forecast demand, aggregate units_sold and demand_forecast appropriately.
6. When sorting or ranking, always include an appropriate ORDER BY clause.
7. Always provide a reasonable LIMIT (e.g. 5, 10, or up to 50) when returning lists or top/bottom items.
8. Output ONLY the raw SQL query. Do not enclose it in markdown blocks, backticks, or explanatory text.
"""

def get_llm_client() -> OpenAI:
    return OpenAI(
        api_key=settings.OPENAI_API_KEY,
        base_url=settings.OPENAI_BASE_URL
    )

def generate_sql(question: str) -> str:
    """
    Calls the LLM to generate a safe PostgreSQL query for the user's question.
    """
    client = get_llm_client()

    response = client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {"role": "system", "content": SQL_GENERATOR_SYSTEM_PROMPT},
            {"role": "user", "content": f"User question: {question}"}
        ],
        temperature=0.0
    )

    raw_output = response.choices[0].message.content or ""
    raw_output = raw_output.strip()

    # Strip markdown code blocks if the LLM wrapped it
    raw_output = re.sub(r"^```(?:sql)?\s*", "", raw_output, flags=re.IGNORECASE)
    raw_output = re.sub(r"\s*```$", "", raw_output)
    raw_output = raw_output.strip()

    return raw_output
