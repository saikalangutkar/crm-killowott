"use client";

import React from "react";
import { useCrm } from "@/context/CrmContext";
import { DollarSign, Users, Award, ShoppingBag, ArrowUpRight } from "lucide-react";

export function DashboardKpis() {
  const { metrics } = useCrm();

  return (
    <section aria-label="Executive KPI Overview" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* 1. Revenue Card (Ink-Black Card) */}
      <div className="p-6 rounded-[2rem] bg-[#0a0a0a] text-white border border-[#e6e5e2]/15 shadow-xl flex flex-col justify-between relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono uppercase tracking-wider text-[#cf8047] font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#cf8047] animate-pulse" />
            Gross Revenue
          </span>
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[#cf8047]">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="text-3xl sm:text-4xl font-bold tracking-tight text-white tabular-nums">
            ${metrics.grossRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-[#8d8d8d] mt-2 flex items-center gap-1.5">
            <span className="text-[#cf8047] font-medium flex items-center">
              +14.2% <ArrowUpRight className="w-3 h-3" />
            </span>
            <span>from normalized WooCommerce orders</span>
          </p>
        </div>
      </div>

      {/* 2. Customers Managed Card */}
      <div className="p-6 rounded-[2rem] bg-[#ffffff] text-[#111111] border border-[#e6e5e2] shadow-xs flex flex-col justify-between hover:border-[#b15f2c]/40 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono uppercase tracking-wider text-[#8d8d8d]">
            Customers Managed
          </span>
          <div className="w-8 h-8 rounded-full bg-[#f1f0ee] flex items-center justify-center text-[#111111]">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111111] tabular-nums">
            {metrics.totalCustomers}
          </div>
          <p className="text-xs text-[#8d8d8d] mt-2">
            Includes deterministic guest checkouts (id = 0)
          </p>
        </div>
      </div>

      {/* 3. VIP Revenue Impact Card */}
      <div className="p-6 rounded-[2rem] bg-[#ffffff] text-[#111111] border border-[#e6e5e2] shadow-xs flex flex-col justify-between hover:border-[#b15f2c]/40 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono uppercase tracking-wider text-[#8d8d8d]">
            VIP Revenue Impact
          </span>
          <div className="w-8 h-8 rounded-full bg-[#f1f0ee] flex items-center justify-center text-[#b15f2c]">
            <Award className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="text-3xl sm:text-4xl font-bold tracking-tight text-[#b15f2c] tabular-nums">
            {metrics.vipRevenueShare.toFixed(1)}%
          </div>
          <p className="text-xs text-[#8d8d8d] mt-2">
            Driven by {metrics.vipCount} VIP patrons in active strategy
          </p>
        </div>
      </div>

      {/* 4. Active In Pipeline Card */}
      <div className="p-6 rounded-[2rem] bg-[#ffffff] text-[#111111] border border-[#e6e5e2] shadow-xs flex flex-col justify-between hover:border-[#b15f2c]/40 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono uppercase tracking-wider text-[#8d8d8d]">
            Active In Pipeline
          </span>
          <div className="w-8 h-8 rounded-full bg-[#f1f0ee] flex items-center justify-center text-[#111111]">
            <ShoppingBag className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111111] tabular-nums">
            {metrics.activePipelineCount}
          </div>
          <p className="text-xs text-[#8d8d8d] mt-2 flex items-center justify-between">
            <span>Orders pending, processing or shipped</span>
            <span className="font-mono text-[11px] text-[#b15f2c] font-semibold">{metrics.repeatRate.toFixed(0)}% repeat</span>
          </p>
        </div>
      </div>
    </section>
  );
}
