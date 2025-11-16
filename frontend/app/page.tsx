// "use client";

// import { useState } from "react";
// import Upload from "./components/Upload";

// type PredictResult = {
//   top1: { breed: string; score: number };
//   top3: Array<{ breed: string; score: number }>;
// };

// export default function Page() {
//   const [result, setResult] = useState<PredictResult | null>(null);

//   return (
//     <main className="min-h-dvh px-6 py-10 max-w-4xl mx-auto">
//       <h1 className="text-3xl font-bold">猫種推定アプリ</h1>
//       <p className="mt-2 opacity-80">
//         画像をアップすると、推定された猫種と説明文を表示します。
//       </p>

//       <section className="mt-8">
//         <Upload onResult={setResult} />

//         <div className="mt-8 p-5 rounded-2xl border bg-neutral-900/30">
//           {result ? (
//             <div className="space-y-2">
//               <div className="text-lg font-semibold">
//                 Top-1: {result.top1.breed} ({(result.top1.score * 100).toFixed(1)}%)
//               </div>
//               <div className="text-sm opacity-80">
//                 Top-3:{" "}
//                 {result.top3
//                   .map((x) => `${x.breed} ${(x.score * 100).toFixed(1)}%`)
//                   .join(" / ")}
//               </div>
//             </div>
//           ) : (
//             <span className="opacity-70">結果はここに表示されます</span>
//           )}
//         </div>
//       </section>
//     </main>
//   );
// }
"use client";

import Upload from "./components/Upload";

export default function Page() {
  return (
    <main className="min-h-dvh px-6 py-10 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">猫種推定アプリ</h1>
      <p className="mt-2 opacity-80">
        画像をアップすると、推定された猫種と説明文を表示します。
      </p>

      <section className="mt-8">
        <Upload />
      </section>
    </main>
  );
}
