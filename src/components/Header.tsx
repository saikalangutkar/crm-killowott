"use client";

import React from "react";
import { Zap, Sparkles, SlidersHorizontal, ShieldCheck, Activity } from "lucide-react";

interface HeaderProps {
  onOpenSimulator: () => void;
  activeStrategy: string;
  onChangeStrategy: (strategyName: string) => void;
  webhookCount: number;
}

export function Header({
  onOpenSimulator,
  activeStrategy,
  onChangeStrategy,
  webhookCount,
}: HeaderProps) {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand & Status */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Kilowott CRM
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  WooCommerce Bridge
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Real-time Webhook Ingestion Engine • {webhookCount} events processed
            </p>
          </div>
        </div>

        {/* Design Pattern Badges & Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Strategy Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
            <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-400" />
            <span className="text-slate-400 hidden sm:inline">Strategy:</span>
            <select
              value={activeStrategy}
              onChange={(e) => onChangeStrategy(e.target.value)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
              aria-label="Segmentation Strategy"
            >
              <option value="ltv" className="bg-slate-900 text-slate-200">
                Tiered LTV Strategy
              </option>
              <option value="frequency" className="bg-slate-900 text-slate-200">
                Order Frequency Strategy
              </option>
              <option value="rfm" className="bg-slate-900 text-slate-200">
                Hybrid RFM Strategy
              </option>
            </select>
          </div>

          {/* Design Pattern Indicator Chips */}
          <div className="hidden lg:flex items-center gap-1.5">
            <span
              className="text-[11px] px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1"
              title="Adapter Pattern: Normalizes external WooCommerce payload & handles customer_id = 0 guest checkouts"
            >
              <ShieldCheck className="h-3 w-3 text-cyan-400" />
              Adapter
            </span>
            <span
              className="text-[11px] px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1"
              title="Strategy Pattern: Swappable customer segmentation algorithms"
            >
              <SlidersHorizontal className="h-3 w-3 text-indigo-400" />
              Strategy
            </span>
            <span
              className="text-[11px] px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1"
              title="Observer Pattern: Dispatches notifications & AI Triage on state changes"
            >
              <Activity className="h-3 w-3 text-emerald-400" />
              Observer
            </span>
          </div>

          {/* Primary Action: Webhook Simulator Trigger */}
          <button
            onClick={onOpenSimulator}
            data-testid="simulate-webhook-button"
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-lg shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <Zap className="h-3.5 w-3.5 fill-current" />
            Simulate WooCommerce Webhook
          </button>
        </div>
      </div>
    </header>
  );
}
