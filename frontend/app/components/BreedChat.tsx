"use client";

import React, { useState } from "react";
import { ChatMessage, streamBreedChat } from "../lib/fetchBreedChat";

type Props = {
  breed: string;
  className?: string;
};

export default function BreedChat({ breed, className }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasBackend = !!process.env.NEXT_PUBLIC_API_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !hasBackend || loading) return;

    const userMessage: ChatMessage = { role: "user", content: input.trim() };
    const baseMessages = [...messages, userMessage];

    // UI 上はユーザー発言＋空のアシスタントメッセージを先に追加
    setMessages([...baseMessages, { role: "assistant", content: "" }]);
    setInput("");
    setLoading(true);
    setError(null);

    let accumulated = "";

    try {
      await streamBreedChat(breed, baseMessages, (delta) => {
        accumulated += delta;
        setMessages((prev) => {
          if (prev.length === 0) return prev;
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          if (updated[lastIndex].role === "assistant") {
            updated[lastIndex] = {
              ...updated[lastIndex],
              content: accumulated,
            };
          }
          return updated;
        });
      });
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "チャットの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  if (!hasBackend) {
    return (
      <div className={className}>
        <p className="text-sm opacity-70">
          ※ バックエンド未接続のため、AIチャット機能はローカルでは無効です。
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-neutral-700 bg-neutral-900/40 p-4 ${className ?? ""}`}>
      <h3 className="font-semibold mb-2">
        「{breed}」について質問してみる
      </h3>

      <div className="max-h-64 overflow-y-auto space-y-2 mb-3 text-sm">
        {messages.length === 0 && (
          <p className="opacity-70">
            例: 「性格はどんな感じ？」「一人暮らしでも飼いやすい？」「子どもとの相性は？」 など
          </p>
        )}
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={m.role === "user" ? "text-right" : "text-left"}
          >
            <div
              className={
                "inline-block px-3 py-2 rounded-2xl " +
                (m.role === "user"
                  ? "bg-pink-600 text-white"
                  : "bg-neutral-800 text-neutral-100")
              }
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          className="flex-1 rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm"
          placeholder={`${breed} について質問してみよう`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-sm"
        >
          {loading ? "回答中..." : "送信"}
        </button>
      </form>

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
