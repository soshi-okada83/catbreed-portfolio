"use client";
import React, { useCallback, useMemo, useState } from "react";

type PredictResult = {
  top1: { breed: string; score: number };
  top3: Array<{ breed: string; score: number }>;
};

export default function Upload({ onResult }: { onResult: (r: PredictResult) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const acceptTypes = useMemo(() => ["image/jpeg", "image/png", "image/webp"], []);
  const maxMB = 5;

  const validate = (f: File) => {
    if (!acceptTypes.includes(f.type)) {
      return "画像は JPEG/PNG/WebP を選んでください";
    }
    if (f.size > maxMB * 1024 * 1024) {
      return `ファイルは ${maxMB}MB 以下にしてください`;
    }
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
      return;
    }
    setError(null);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }, []);

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handleFiles(e.dataTransfer.files);
  };
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => handleFiles(e.target.files);

  const fakePredict = async (_file: File): Promise<PredictResult> => {
    await new Promise((r) => setTimeout(r, 600));
    return {
      top1: { breed: "Scottish Fold", score: 0.82 },
      top3: [
        { breed: "Scottish Fold", score: 0.82 },
        { breed: "British Shorthair", score: 0.12 },
        { breed: "American Shorthair", score: 0.06 },
      ],
    };
  };

  const callApi = async (file: File): Promise<PredictResult> => {
    const base = process.env.NEXT_PUBLIC_API_URL;
    if (!base) throw new Error("NEXT_PUBLIC_API_URL is not set");
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${base}/predict`, { method: "POST", body: form });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return (await res.json()) as PredictResult;
  };

  const onClickAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const data = process.env.NEXT_PUBLIC_API_URL ? await callApi(file) : await fakePredict(file);
      onResult(data);
    } catch (e) {
      console.error(e);
      setError("推論に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={onDrop}
        className="flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer hover:bg-neutral-900/20 transition"
      >
        <p className="text-lg font-medium">画像をドラッグ＆ドロップ</p>
        <p className="text-sm opacity-70">またはクリックして選択（JPEG/PNG/WebP、{maxMB}MB以下）</p>
        <input type="file" accept={acceptTypes.join(",")} onChange={onChange} className="hidden" id="file-input" />
        <label htmlFor="file-input" className="mt-2 px-4 py-2 rounded-xl shadow bg-neutral-800 hover:bg-neutral-700 active:scale-[0.99]">
          ファイルを選ぶ
        </label>
      </div>

      {preview && (
        <div className="mt-6 grid grid-cols-2 gap-4 items-start">
          <img src={preview} alt="preview" className="w-full h-44 object-cover rounded-xl" />
          <div className="flex flex-col gap-2">
            <p className="text-sm opacity-80">{file?.name} • {(file!.size / 1024).toFixed(0)} KB</p>
            <button
              onClick={onClickAnalyze}
              disabled={loading}
              className="px-4 py-2 rounded-xl shadow bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50"
            >
              {loading ? "解析中..." : "この画像で推論する"}
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-4 text-red-400">{error}</p>}
    </div>
  );
}
