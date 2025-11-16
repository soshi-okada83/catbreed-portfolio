from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import Literal, List
from pathlib import Path
import logging
import os
import json

from openai import OpenAI
from dotenv import load_dotenv

router = APIRouter()

logging.basicConfig(level=logging.INFO)

# .env 読み込み
BASE_DIR = Path(__file__).resolve().parents[1]  # backend/
ENV_PATH = BASE_DIR / ".env"
if ENV_PATH.exists():
    load_dotenv(ENV_PATH)
else:
    load_dotenv()

# OpenAI クライアント
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if OPENAI_API_KEY:
    client = OpenAI(api_key=OPENAI_API_KEY)
    logging.info("OPENAI_API_KEY を読み込みました。/breed_chat 有効")
else:
    client = None
    logging.warning("OPENAI_API_KEY が環境変数に設定されていません。/breed_chat は動作しません。")

DEFAULT_CHAT_MODEL = os.getenv("OPENAI_CHAT_MODEL", "gpt-4o-mini")

class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str

class BreedChatRequest(BaseModel):
    breed: str = Field(..., description="推定された猫種名（日本語表記）")
    messages: List[ChatMessage] = Field(..., description="これまでの会話履歴（最新メッセージは user）")
    lang: Literal["ja", "en"] = "ja"

class BreedChatResponse(BaseModel):
    reply: str

def build_system_prompt(breed: str, lang: str) -> str:
    lang_label = "日本語" if lang == "ja" else "英語"
    return (
        f"あなたは猫に詳しい獣医・ブリーダーの役割を持つアシスタントです。\n"
        f"対象の猫種は「{breed}」です。\n"
        f"- 回答は常に{lang_label}で行ってください。\n"
        f"- {breed} に関する性格、飼いやすさ、注意点、健康面などを、"
        f"初心者にも分かりやすく、丁寧に説明してください。\n"
        f"- 分からないことは想像で断定せず、『正確な情報がない』と伝えてください。\n"
        f"- 医療行為の判断が必要な内容は、最終的に必ず獣医師への相談を推奨してください。"
    )

# ===== 通常版 =====
@router.post("/breed_chat", response_model=BreedChatResponse)
async def breed_chat(payload: BreedChatRequest):
    """
    推定された猫種について、ユーザーからの質問に回答するチャットAPI。
    （一括レスポンス版）
    """
    if client is None:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY が設定されていません。")

    if not payload.messages:
        raise HTTPException(status_code=400, detail="messages は1件以上必要です。")

    system_content = build_system_prompt(payload.breed, payload.lang)

    try:
        completion = client.chat.completions.create(
            model=DEFAULT_CHAT_MODEL,
            messages=[
                {"role": "system", "content": system_content},
                *[m.model_dump() for m in payload.messages],
            ],
        )
        reply = completion.choices[0].message.content or ""
        return BreedChatResponse(reply=reply)
    except Exception as e:
        logging.exception("breed_chat failed")
        raise HTTPException(status_code=500, detail=f"Chat failed: {e}")


# ===== ストリーミング版 =====
@router.post("/breed_chat/stream")
async def breed_chat_stream(payload: BreedChatRequest):
    """
    推定された猫種について、回答をストリーミングで返すチャットAPI。
    SSE (text/event-stream) 形式で delta を逐次返す。
    """
    if client is None:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY が設定されていません。")

    if not payload.messages:
        raise HTTPException(status_code=400, detail="messages は1件以上必要です。")

    system_content = build_system_prompt(payload.breed, payload.lang)

    def event_stream():
        try:
            stream = client.chat.completions.create(
                model=DEFAULT_CHAT_MODEL,
                messages=[
                    {"role": "system", "content": system_content},
                    *[m.model_dump() for m in payload.messages],
                ],
                stream=True,
            )

            for chunk in stream:
                delta = chunk.choices[0].delta.content or ""
                if delta:
                    data = json.dumps({"delta": delta}, ensure_ascii=False)
                    yield f"data: {data}\n\n"

            yield "data: [DONE]\n\n"

        except Exception as e:
            logging.exception("breed_chat_stream failed")
            data = json.dumps({"error": str(e)}, ensure_ascii=False)
            yield f"data: {data}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
