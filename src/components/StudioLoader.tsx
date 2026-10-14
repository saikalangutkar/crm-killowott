"use client";

import React, { useState, useEffect } from "react";
import { BrandMark } from "./BrandMark";

interface StudioLoaderProps {
  onComplete: () => void;
}

export function StudioLoader({ onComplete }: StudioLoaderProps) {
  const [count, setCount] = useState(0);
  const [isSlidingUp, setIsSlidingUp] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    // If reduced motion, finish quickly
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setCount(100);
      setIsSlidingUp(true);
      setTimeout(() => {
        setIsFinished(true);
        onComplete();
      }, 200);
      return;
    }

    const duration = 1300; // ms
    const startTime = performance.now();

    const easeInOutCubic = (x: number): number => {
      return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    };

    let animationFrameId: number;

    const tick = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeInOutCubic(progress);

      setCount(Math.min(Math.floor(easedProgress * 100), 100));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(tick);
      } else {
        setCount(100);
        setTimeout(() => {
          setIsSlidingUp(true);
          setTimeout(() => {
            setIsFinished(true);
            onComplete();
          }, 600);
        }, 150);
      }
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animationFrameId);
  }, [onComplete]);

  if (isFinished) return null;

  return (
    <aside
      aria-label="Loading Kilowott CRM"
      className={`fixed inset-0 z-[10000] flex flex-col justify-between p-8 sm:p-12 bg-[#0a0a0a] text-white rounded-b-[2rem] sm:rounded-b-[3.5rem] shadow-2xl transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isSlidingUp ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BrandMark className="w-8 h-8 text-[#cf8047]" />
          <span className="text-sm tracking-[0.2em] font-medium text-[#8d8d8d] uppercase">
            Kilowott Studio
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#cf8047] animate-pulse" />
          <span className="text-xs text-[#8d8d8d] font-mono tracking-wider">SYSTEM INITIALIZING</span>
        </div>
      </div>

      {/* Middle Statement */}
      <div className="max-w-xl">
        <p className="text-xs uppercase tracking-[0.25em] text-[#cf8047] font-semibold mb-3">
          WooCommerce Integration Engine
        </p>
        <p className="text-xl sm:text-3xl font-light text-[#f1f0ee] tracking-[-0.02em] leading-snug">
          Calming real-time orders, resolving guest checkouts, and powering agentic customer intelligence.
        </p>
      </div>

      {/* Bottom Counter */}
      <div className="flex items-baseline justify-between border-t border-white/10 pt-6">
        <span className="text-xs text-[#8d8d8d] tracking-widest font-mono uppercase">
          Adapter · Strategy · Observer
        </span>
        <div className="font-mono text-5xl sm:text-8xl font-bold tracking-tighter text-white tabular-nums">
          {String(count).padStart(3, "0")}
        </div>
      </div>
    </aside>
  );
}
