"use client";

import React from "react";
import Link from "next/link";
import { BrandMark } from "./BrandMark";
import { LiveClockChip } from "./LiveClockChip";
import { useCrm } from "@/context/CrmContext";
import { Terminal, Bot, SlidersHorizontal, ArrowLeft } from "lucide-react";

interface DashboardTopBarProps {
  onOpenSimulator: () => void;
  onOpenCopilot: () => void;
}

export function DashboardTopBar({ onOpenSimulator, onOpenCopilot }: DashboardTopBarProps) {
  const { activeStrategy, setStrategy } = useCrm();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#ffffff]/90 backdrop-blur-md border-b border-[#e6e5e2] py-3">
      <div className="max-w-[88rem] mx-auto px-5 sm:px-8 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Brand & Return Link */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-[#8d8d8d] hover:text-[#111111] transition-colors p-1"
            title="Return to Landing Page"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Landing</span>
          </Link>

          <div className="h-4 w-px bg-[#e6e5e2]" />

          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#0a0a0a] text-white flex items-center justify-center shadow-xs">
              <BrandMark className="w-4 h-4 text-[#cf8047]" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-[#111111] leading-none">
                Kilowott CRM
              </h1>
              <span className="text-[10px] text-[#8d8d8d] font-mono tracking-wider uppercase">
                Executive Studio
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Strategy Selector */}
        <div className="hidden md:flex items-center gap-2 bg-[#f1f0ee] px-3 py-1.5 rounded-full border border-[#e6e5e2]">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#8d8d8d]" />
          <label htmlFor="strategy-select" className="text-xs font-medium text-[#8d8d8d]">
            Segmentation Strategy:
          </label>
          <select
            id="strategy-select"
            aria-label="Segmentation Strategy"
            value={activeStrategy}
            onChange={(e) => setStrategy(e.target.value as "tiered_ltv" | "frequency" | "rfm")}
            className="bg-transparent text-xs font-semibold text-[#111111] focus:outline-none cursor-pointer"
          >
            <option value="tiered_ltv">Tiered LTV Strategy ($1,000 threshold)</option>
            <option value="frequency">Order Frequency Strategy (3+ orders)</option>
            <option value="rfm">Hybrid RFM Strategy (Recency + Spend)</option>
          </select>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <LiveClockChip className="hidden sm:inline-flex" />

          {/* AI Copilot Trigger */}
          <button
            onClick={onOpenCopilot}
            data-testid="open-copilot-button"
            className="pill-btn bg-[#f1f0ee] hover:bg-[#e3e2df] text-[#111111] text-xs border border-[#e6e5e2] flex items-center gap-1.5"
            aria-label="Open AI Copilot"
          >
            <Bot className="w-3.5 h-3.5 text-[#b15f2c]" />
            <span className="hidden sm:inline">AI Copilot</span>
          </button>

          {/* Dark Webhook Simulator Pill */}
          <button
            onClick={onOpenSimulator}
            data-testid="simulate-webhook-button"
            className="pill-btn bg-[#0a0a0a] hover:bg-[#111111] text-white text-xs flex items-center gap-2 shadow-sm"
          >
            <Terminal className="w-3.5 h-3.5 text-[#cf8047]" />
            <span>Webhook Simulator</span>
          </button>

          {/* User Avatar */}
          <div className="w-9 h-9 rounded-full bg-[#f1f0ee] border border-[#e6e5e2] flex items-center justify-center text-xs font-bold text-[#111111] shadow-xs">
            KC
          </div>
        </div>
      </div>
    </header>
  );
}
