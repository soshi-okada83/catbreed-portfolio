"use client";

import React, { useEffect, useState } from "react";

export default function ProgressBar({ loading }: { loading: boolean }) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (loading) {
      setVisible(true);
      setProgress(0);

      const interval = setInterval(() => {
        setProgress((prev) => {
          // 80% まではゆっくり伸びる
          if (prev < 80) return prev + 1;
          return prev; 
        });
      }, 50); // 50ms ごとに1%進む

      return () => clearInterval(interval);
    } else {
      // 完了した瞬間に100%にする
      setProgress(100);

      const timeout = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [loading]);

  if (!visible) return null;

  return (
    <div className="w-full mt-4">
      <div className="h-2 w-full bg-neutral-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-pink-500 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="text-xs text-neutral-400 mt-1 text-right">
        {progress}%
      </div>
    </div>
  );
}
