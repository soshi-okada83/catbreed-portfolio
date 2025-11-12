"use client";
import * as React from "react";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={
        "rounded-3xl border border-neutral-800 bg-neutral-900/70 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur " +
        (className ?? "")
      }
    >
      {children}
    </div>
  );
}

export function CardContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={"p-6 md:p-8 " + (className ?? "")}>{children}</div>;
}
