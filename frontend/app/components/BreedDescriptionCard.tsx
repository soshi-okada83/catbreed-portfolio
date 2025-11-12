"use client";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { BreedDescription } from "../types/description";

export default function BreedDescriptionCard({
  data,
  className,
}: {
  data: BreedDescription;
  className?: string;
}) {
  return (
    <Card className={`bg-neutral-900/80 border border-neutral-800 ${className ?? ""}`}>
      <CardContent className="space-y-8">
        <header className="border-b border-neutral-800 pb-4">
          <h2 className="text-3xl font-extrabold tracking-tight">🐾 {data.breed}</h2>
          <p className="text-neutral-300 text-sm mt-2 leading-relaxed">{data.overview}</p>
        </header>

        <section className="grid sm:grid-cols-2 gap-6">
          <div className="bg-neutral-800/50 p-5 rounded-2xl">
            <h3 className="font-semibold mb-3 text-lg">基本情報</h3>
            <div className="text-sm grid grid-cols-2 gap-x-3 gap-y-1">
              <span className="opacity-60">原産</span><span>{data.key_facts.origin}</span>
              <span className="opacity-60">サイズ</span><span>{data.key_facts.size}</span>
              <span className="opacity-60">被毛</span><span>{data.key_facts.coat}</span>
              <span className="opacity-60">寿命</span><span>{data.key_facts.lifespan_years}年</span>
              <span className="opacity-60">抜け毛</span><span>{data.key_facts.shedding}</span>
              <span className="opacity-60">低アレルギー</span>
              <span>{data.key_facts.hypoallergenic ? "はい" : "いいえ"}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {data.key_facts.colors.map((c: string, i: number) => (
                <Badge key={i} variant="secondary">{c}</Badge>
              ))}
            </div>
          </div>

          <div className="bg-neutral-800/50 p-5 rounded-2xl">
            <h3 className="font-semibold mb-3 text-lg">気質</h3>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {data.temperament.map((t: string, i: number) => <li key={i}>{t}</li>)}
            </ul>
          </div>
        </section>

        <section className="grid sm:grid-cols-3 gap-6">
          <InfoBox title="お手入れ" text={data.care.grooming} />
          <InfoBox title="運動" text={data.care.exercise} />
          <InfoBox title="しつけ" text={data.care.training} />
        </section>

        <section className="grid sm:grid-cols-2 gap-6">
          <div className="bg-neutral-800/50 p-5 rounded-2xl">
            <h3 className="font-semibold mb-3 text-lg">健康</h3>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {data.health.common_issues.map((h: string, i: number) => <li key={i}>{h}</li>)}
            </ul>
            <p className="text-sm mt-2 opacity-80">{data.health.notes}</p>
          </div>

          <div className="bg-neutral-800/50 p-5 rounded-2xl">
            <h3 className="font-semibold mb-3 text-lg">一緒に暮らすヒント</h3>
            <p className="text-sm"><span className="opacity-60">相性：</span>{data.living_with.good_with.join("・")}</p>
            {data.living_with.cautions.length > 0 && (
              <p className="text-sm mt-2"><span className="opacity-60">注意：</span>{data.living_with.cautions.join("・")}</p>
            )}
          </div>
        </section>

        <section className="bg-neutral-800/50 p-5 rounded-2xl">
          <h3 className="font-semibold mb-3 text-lg">豆知識</h3>
          <p className="text-sm text-neutral-300">{data.fun_fact}</p>
        </section>
      </CardContent>
    </Card>
  );
}

function InfoBox({ title, text }: { title: string; text: string }) {
  return (
    <div className="bg-neutral-800/50 p-5 rounded-2xl">
      <h3 className="font-semibold mb-3 text-lg">{title}</h3>
      <p className="text-sm text-neutral-300 leading-relaxed">{text}</p>
    </div>
  );
}
