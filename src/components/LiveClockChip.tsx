"use client";

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export function LiveClockChip({ className = "" }: { className?: string }) {
  const [timeStr, setTimeStr] = useState<string>("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f1f0ee] border border-[#e6e5e2] text-xs font-mono text-[#111111] backdrop-blur-md shadow-xs select-none ${className}`}
      aria-label={`Current system time: ${timeStr}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#b15f2c] animate-pulse" aria-hidden="true" />
      <Clock className="w-3.5 h-3.5 text-[#8d8d8d]" aria-hidden="true" />
      <span className="tabular-nums tracking-wide font-medium">{timeStr || "--:--:--"}</span>
      <span className="text-[10px] text-[#8d8d8d] font-sans font-semibold">LIVE</span>
    </div>
  );
}
