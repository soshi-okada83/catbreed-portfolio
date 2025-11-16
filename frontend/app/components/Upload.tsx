"use client";
import React, { useCallback, useMemo, useState } from "react";
import { fetchDescription } from "../lib/fetchDescription";
import BreedDescriptionCard from "./BreedDescriptionCard";
import { BreedDescription } from "../types/description";
import BreedChat from "./BreedChat";

type PredictResult = {
  top1: { breed: string; score: number };
  top3: Array<{ breed: string; score: number }>;
};

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState<PredictResult | null>(null);
  const [desc, setDesc] = useState<BreedDescription | null>(null);
  const [descLoading, setDescLoading] = useState(false);

  const acceptTypes = useMemo(() => ["image/jpeg", "image/png", "image/webp"], []);
  const maxMB = 5;

  const contentWrap = "w-full max-w-3xl mx-auto"; // ← 幅をこれで統一

  const validate = (f: File) => {
    if (!acceptTypes.includes(f.type)) return "画像は JPEG/PNG/WebP を選んでください";
    if (f.size > maxMB * 1024 * 1024) return `ファイルは ${maxMB}MB 以下にしてください`;
    return null;
  };

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    const v = validate(f);
    if (v) {
      setError(v);
      setFile(null);
      setPreview(null);
      setDesc(null);
      setResult(null);
      return;
    }
    setError(null);
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setDesc(null);
    setResult(null);
  }, []);

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handleFiles(e.dataTransfer.files);
  };
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => handleFiles(e.target.files);

  const callApi = async (file: File): Promise<PredictResult> => {
    const base = process.env.NEXT_PUBLIC_API_URL;
    if (!base) throw new Error("NEXT_PUBLIC_API_URL is not set");
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${base}/predict`, { method: "POST", body: form });
    if (!res.ok) throw new Error(`API error: ${res.status} ${await res.text().catch(() => "")}`);
    const json = await res.json();
    const prettify = (s: string) => s.replace(/_/g, " ");
    if (json?.top1 && json?.top3) {
      return {
        top1: { breed: prettify(json.top1.class_name), score: json.top1.confidence },
        top3: (json.top3 as Array<{ class_name: string; confidence: number }>).map((x) => ({
          breed: prettify(x.class_name),
          score: x.confidence,
        })),
      };
    }
    if (json?.class_name && typeof json?.confidence === "number") {
      return {
        top1: { breed: prettify(json.class_name), score: json.confidence },
        top3: [{ breed: prettify(json.class_name), score: json.confidence }],
      };
    }
    throw new Error("Unexpected API response");
  };

  const fakePredict = async (_file: File): Promise<PredictResult> => {
    await new Promise((r) => setTimeout(r, 600));
    return {
      top1: { breed: "Ragdoll", score: 0.998 },
      top3: [
        { breed: "Ragdoll", score: 0.998 },
        { breed: "Persian", score: 0.001 },
        { breed: "Birman", score: 0.001 },
      ],
    };
  };

  const onClickAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setDesc(null);

    try {
      const data = process.env.NEXT_PUBLIC_API_URL ? await callApi(file) : await fakePredict(file);
      setResult(data);

      if (process.env.NEXT_PUBLIC_API_URL) {
        setDescLoading(true);
        try {
          const d = await fetchDescription(data.top1.breed, "ja");
          setDesc(d);
        } finally {
          setDescLoading(false);
        }
      }
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "推論に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={contentWrap}>
      {/* アップロード枠*/}
      <div
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={onDrop}
        className="flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer hover:bg-neutral-900/20 transition border-neutral-700"
      >
        <p className="text-lg font-medium">画像をドラッグ＆ドロップ</p>
        <p className="text-sm opacity-70">またはクリックして選択（JPEG/PNG/WebP、{maxMB}MB以下）</p>
        <input type="file" accept={acceptTypes.join(",")} onChange={onChange} className="hidden" id="file-input" />
        <label
          htmlFor="file-input"
          className="mt-2 px-4 py-2 rounded-xl shadow bg-pink-600/90 hover:bg-pink-500 active:scale-[0.99]"
        >
          ファイルを選ぶ
        </label>
      </div>

      {/* プレビュー＋実行ボタン */}
      {preview && (
        <div className="mt-6 grid grid-cols-2 gap-4 items-start">
          <img src={preview} alt="preview" className="w-full h-44 object-cover rounded-xl" />
          <div className="flex flex-col gap-2">
            <p className="text-sm opacity-80">
              {file?.name} • {(file!.size / 1024).toFixed(0)} KB
            </p>
            <button
              onClick={onClickAnalyze}
              disabled={loading}
              className="px-4 py-2 rounded-xl shadow bg-pink-600 hover:bg-pink-500 disabled:opacity-50"
            >
              {loading ? "解析中..." : "この画像で推論する"}
            </button>
          </div>
        </div>
      )}

      {/* 結果 */}
      {result && (
        <div className="mt-8 rounded-2xl border border-dotted border-neutral-700 p-4 text-sm text-neutral-300">
          <div className="font-semibold">
            推定結果（１位）: {result.top1.breed} ({(result.top1.score * 100).toFixed(1)}%)
          </div>
          <div className="opacity-80 mt-1">
            上位３位:{" "}
            {result.top3
              .map((b) => `${b.breed} ${(b.score * 100).toFixed(1)}%`)
              .join(" / ")}
          </div>
        </div>
      )}

      {/* 説明カードは 結果の下 に出す */}
      {descLoading && <p className="mt-6 opacity-80">説明文を生成中…</p>}
      {desc && <BreedDescriptionCard className="mt-6" data={desc} />}

      {/* 猫種ごとのAIチャット */}
      {result && (
        <BreedChat className="mt-6" breed={result.top1.breed} />
      )}

      {error && <p className="mt-4 text-red-400">{error}</p>}
    </div>
  );
}
