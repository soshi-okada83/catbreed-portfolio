import { BreedDescription } from "../types/description";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function fetchDescription(breed: string, lang: "ja" | "en" = "ja") {
  const r = await fetch(`${API}/describe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ breed, lang }),
  });
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`Describe API failed: ${r.status} ${t}`);
  }
  const json = await r.json();
  return json.data as BreedDescription;
}
