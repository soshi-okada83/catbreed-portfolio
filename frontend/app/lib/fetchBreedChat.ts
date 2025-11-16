export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const getBaseUrl = () => {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) throw new Error("NEXT_PUBLIC_API_URL is not set");
  return base;
};

// 既存の一括取得版（フォールバック用に残しておく）
export async function fetchBreedChat(breed: string, messages: ChatMessage[]) {
  const base = getBaseUrl();

  const res = await fetch(`${base}/breed_chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      breed,
      messages,
      lang: "ja",
    }),
  });

  if (!res.ok) {
    throw new Error(`Chat API error: ${res.status} ${await res.text().catch(() => "")}`);
  }

  const json = await res.json();
  return json.reply as string;
}

// ストリーミング版
export async function streamBreedChat(
  breed: string,
  messages: ChatMessage[],
  onDelta: (delta: string) => void
): Promise<string> {
  const base = getBaseUrl();

  const res = await fetch(`${base}/breed_chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      breed,
      messages,
      lang: "ja",
    }),
  });

  if (!res.ok || !res.body) {
    throw new Error(`Chat Stream API error: ${res.status} ${await res.text().catch(() => "")}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");

  let buffer = "";
  let fullText = "";
  let doneFromServer = false;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // SSE は "\n\n" 区切り
    let sepIndex: number;
    while ((sepIndex = buffer.indexOf("\n\n")) !== -1) {
      const rawEvent = buffer.slice(0, sepIndex);
      buffer = buffer.slice(sepIndex + 2);

      const lines = rawEvent.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;

        const dataStr = trimmed.slice("data:".length).trim();
        if (!dataStr) continue;

        if (dataStr === "[DONE]") {
          doneFromServer = true;
          break;
        }

        try {
          const payload = JSON.parse(dataStr) as { delta?: string; error?: string };
          if (payload.error) {
            throw new Error(payload.error);
          }
          if (payload.delta) {
            fullText += payload.delta;
            onDelta(payload.delta);
          }
        } catch (e) {
          console.error("Failed to parse SSE data:", dataStr, e);
        }
      }
      if (doneFromServer) break;
    }
    if (doneFromServer) break;
  }
  return fullText;
}
