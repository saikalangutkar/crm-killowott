"use client";

import React from "react";
import { DollarSign, Users, Crown, ShoppingBag, TrendingUp } from "lucide-react";
import { CrmCustomer, CrmOrder } from "../lib/types";

interface MetricCardsProps {
  customers: CrmCustomer[];
  orders: CrmOrder[];
}

export function MetricCards({ customers, orders }: MetricCardsProps) {
  // Calculations
  const validOrders = orders.filter((o) => o.status !== "cancelled");
  const grossRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);

  const vipCustomers = customers.filter((c) => c.segment === "VIP");
  const repeatCustomers = customers.filter((c) => c.segment === "Repeat");
  const newCustomers = customers.filter((c) => c.segment === "New");

  const vipRevenue = vipCustomers.reduce((sum, c) => sum + (c.lifetimeValue || 0), 0);
  const vipSharePercent = grossRevenue > 0 ? Math.round((vipRevenue / grossRevenue) * 100) : 0;

  const activeOrders = orders.filter(
    (o) => o.status === "pending" || o.status === "processing" || o.status === "shipped"
  );

  const averageOrderValue = validOrders.length > 0 ? grossRevenue / validOrders.length : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Gross Revenue */}
      <div className="glass-panel rounded-xl p-4.5 border border-slate-800/80 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
        <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
          <span>Gross Revenue</span>
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
            <DollarSign className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-2xl font-bold text-white tracking-tight">
            ${grossRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-400 font-medium">
            <TrendingUp className="h-3 w-3" />
            <span>Avg. Order: ${averageOrderValue.toFixed(2)}</span>
            <span className="text-slate-500">• {validOrders.length} valid orders</span>
          </div>
        </div>
      </div>

      {/* Customer Base & Segmentation */}
      <div className="glass-panel rounded-xl p-4.5 border border-slate-800/80 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors" />
        <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
          <span>Customers Managed</span>
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Users className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-2xl font-bold text-white tracking-tight">
            {customers.length}
          </div>
          <div className="flex items-center gap-2 mt-1.5 text-[11px]">
            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 font-medium">
              {vipCustomers.length} VIP
            </span>
            <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-medium">
              {repeatCustomers.length} Repeat
            </span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-medium">
              {newCustomers.length} New
            </span>
          </div>
        </div>
      </div>

      {/* VIP Share */}
      <div className="glass-panel rounded-xl p-4.5 border border-slate-800/80 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />
        <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
          <span>VIP Revenue Impact</span>
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <Crown className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-2xl font-bold text-amber-300 tracking-tight">
            {vipSharePercent}%
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
            <span>
              ${vipRevenue.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} from {vipCustomers.length} VIP accounts
            </span>
          </div>
        </div>
      </div>

      {/* Active Pipeline Orders */}
      <div className="glass-panel rounded-xl p-4.5 border border-slate-800/80 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors" />
        <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
          <span>Active In Pipeline</span>
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
            <ShoppingBag className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-2xl font-bold text-white tracking-tight">
            {activeOrders.length}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
            <span className="text-amber-400">
              {orders.filter((o) => o.status === "pending").length} Pending
            </span>
            <span>•</span>
            <span className="text-blue-400">
              {orders.filter((o) => o.status === "processing").length} Proc.
            </span>
            <span>•</span>
            <span className="text-purple-400">
              {orders.filter((o) => o.status === "shipped").length} Shipped
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
