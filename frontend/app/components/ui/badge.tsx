"use client";
import * as React from "react";

type BadgeProps = {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "secondary";
};

export function Badge({ children, className, variant = "default" }: BadgeProps) {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium shadow-sm ";
  const tone =
    variant === "secondary"
      ? "bg-pink-500/15 text-pink-200 border border-pink-400/30"
      : "bg-pink-500 text-white";
  return <span className={`${base} ${tone} ${className ?? ""}`}>{children}</span>;
}
