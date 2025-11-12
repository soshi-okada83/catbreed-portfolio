from fastapi import APIRouter, HTTPException  # type: ignore[import]
from pydantic import BaseModel, Field  # type: ignore[import]
from typing import Literal, Any, Dict
import os
from pathlib import Path
from dotenv import dotenv_values  # type: ignore[import]

ENV_PATH = Path(__file__).resolve().parents[2] / ".env"
env_dict = {}
if ENV_PATH.exists():
    env_dict = dotenv_values(ENV_PATH)
    for k, v in env_dict.items():
        if v is not None:
            os.environ[k] = v
else:
    print(f"[describe] .env not found at: {ENV_PATH}")
    
from openai import OpenAI  # type: ignore[import]

router = APIRouter()

# ---------- I/O Schemas ----------
class DescribeRequest(BaseModel):
    breed: str = Field(..., description="猫種名（英語推奨。UIから来るTop-1）")
    lang: Literal["ja", "en"] = "ja"

class DescribeResponse(BaseModel):
    data: Dict[str, Any]

# ---------- Prompts ----------
SYSTEM_PROMPT = """You are a precise cat-breed explainer.
Return ONLY a single JSON object that strictly matches the provided schema.
Do not include any extra keys, commentary, or markdown.
If you are unsure about a fact, keep it generic and safe. Avoid medical certainty.
"""

FORMAT_SCHEMA = """
Produce a JSON object with the following structure:

{
  "breed": string,
  "overview": string (2-3 sentences),
  "key_facts": {
    "origin": string,
    "size": string,            // one of: "小","中","大" in Japanese; or "small","medium","large" in English
    "coat": string,            // "短毛","長毛","両方" (or "short","long","both")
    "colors": string[],        // 2-6 items
    "lifespan_years": string,  // like "12-15"
    "shedding": string,        // "少","中","多" (or "low","medium","high")
    "hypoallergenic": boolean
  },
  "temperament": string[],     // 3-6 items
  "care": {
    "grooming": string,
    "exercise": string,
    "training": string
  },
  "health": {
    "common_issues": string[], // 1-3 items, phrased cautiously
    "notes": string
  },
  "living_with": {
    "good_with": string[],     // 1-4 items
    "cautions": string[]       // 0-3 items
  },
  "fun_fact": string
}
"""

# ---------- OpenAI Client ----------
def get_client() -> OpenAI:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or not api_key.strip():
        print("[describe] OPENAI_API_KEY missing. Loaded keys:", list(env_dict.keys()))
        raise RuntimeError(f"OPENAI_API_KEY is not set (tried {ENV_PATH})")
    return OpenAI(api_key=api_key)

# ---------- Route ----------
@router.post("/describe", response_model=DescribeResponse)
def describe_breed(req: DescribeRequest) -> DescribeResponse:
    client = get_client()

    lang_label = "Japanese" if req.lang == "ja" else "English"
    size_map_hint = "小/中/大" if req.lang == "ja" else "small/medium/large"
    coat_map_hint = "短毛/長毛/両方" if req.lang == "ja" else "short/long/both"
    shed_map_hint = "少/中/多" if req.lang == "ja" else "low/medium/high"

    user_prompt = f"""
Language: {lang_label}
Target breed: "{req.breed}"

Follow this format exactly:
{FORMAT_SCHEMA}

Constraints:
- Write all field values in {lang_label}.
- Keep claims non-medical and cautious; suggest veterinary consultation rather than definitive diagnoses.
- Use {size_map_hint} for size, {coat_map_hint} for coat, and {shed_map_hint} for shedding.
- If information is ambiguous, respond with reasonable, widely accepted generalities (no specific numeric claims beyond lifespan range).
Return ONLY the JSON. No markdown.
"""

    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            temperature=0.4,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
        )
        content = completion.choices[0].message.content or "{}"
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OpenAI error: {e}")

    # JSONパース
    import json
    try:
        data = json.loads(content)
    except Exception:
        raise HTTPException(status_code=502, detail="Model returned non-JSON content")

    return DescribeResponse(data=data)
