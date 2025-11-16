export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function fetchBreedChat(breed: string, messages: ChatMessage[]) {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    throw new Error("NEXT_PUBLIC_API_URL is not set");
  }

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
