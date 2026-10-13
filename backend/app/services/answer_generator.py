from typing import List, Dict, Any
from openai import OpenAI
from app.config import settings

ANSWER_GENERATOR_SYSTEM_PROMPT = """You are an Intelligent Retail Sales Manager AI Assistant.
Your goal is to answer the user's question clearly, concisely, and accurately based SOLELY on the SQL query results provided.

CRITICAL GUIDELINES:
1. Strict Data Grounding: Base your answer directly on the provided data rows. Never hallucinate numbers, product names, or trends that are not in the query results.
2. Missing / Empty Results: If the query result is empty, explicitly state that no matching records were found in the retail inventory database for that query.
3. Unsupported Metrics: Do NOT speculate or claim actual profit, margins, or cost, because the dataset does NOT contain a cost or profit column.
4. Distinguish Facts from Hypotheses: If explaining an observation, clearly state what the data directly reveals vs any hypotheses.
5. Professional Tone: Formulate a clear executive summary suitable for a store or retail manager. Format key numbers with commas or percentages where appropriate.
"""

def get_llm_client() -> OpenAI:
    return OpenAI(
        api_key=settings.OPENAI_API_KEY,
        base_url=settings.OPENAI_BASE_URL
    )

def generate_answer(question: str, sql_query: str, query_results: List[Dict[str, Any]]) -> str:
    """
    Synthesizes a grounded, natural-language executive answer from query results.
    """
    client = get_llm_client()

    user_content = f"""User Question:
{question}

Executed SQL Query:
{sql_query}

Database Query Results ({len(query_results)} rows):
{query_results}

Please formulate a clear and grounded response based only on these results."""

    response = client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {"role": "system", "content": ANSWER_GENERATOR_SYSTEM_PROMPT},
            {"role": "user", "content": user_content}
        ],
        temperature=0.2
    )

    answer = response.choices[0].message.content or ""
    return answer.strip()
