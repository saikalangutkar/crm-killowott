"use client";

import React, { useState, useMemo } from "react";
import { useCrm } from "@/context/CrmContext";
import { CrmCustomer, CustomerSegment } from "@/lib/types";
import { DashboardCustomerDrawer360 } from "./DashboardCustomerDrawer360";
import { Search, Filter, SlidersHorizontal, User, Award, ArrowUpRight } from "lucide-react";

export function DashboardCustomersTable() {
  const { customers, activeStrategy, setStrategy } = useCrm();
  const [search, setSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState<string>("ALL");
  const [selectedCustomer, setSelectedCustomer] = useState<CrmCustomer | null>(null);

  const filteredCustomers = useMemo(() => {
    return customers.filter((cust) => {
      const fullName = cust.fullName || `${cust.firstName} ${cust.lastName}`.trim();
      const matchesSearch =
        search === "" ||
        fullName.toLowerCase().includes(search.toLowerCase()) ||
        cust.email.toLowerCase().includes(search.toLowerCase()) ||
        cust.phone?.toLowerCase().includes(search.toLowerCase());

      const matchesSegment =
        segmentFilter === "ALL" || cust.segment === segmentFilter;

      return matchesSearch && matchesSegment;
    });
  }, [customers, search, segmentFilter]);

  const segmentBadges: Record<string, { label: string; class: string }> = {
    VIP: { label: "VIP Patron", class: "bg-[#cf8047]/15 text-[#cf8047] border-[#cf8047]/30" },
    Repeat: { label: "Repeat", class: "bg-purple-500/10 text-purple-700 border-purple-500/30" },
    New: { label: "New", class: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30" },
  };

  return (
    <section aria-label="360° Customer Directory" className="flex flex-col gap-6">
      {/* Top Bar with Title, Search, and Strategy Dropdown */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#111111]">
            360° Customer Directory
          </h2>
          <p className="text-xs text-[#8d8d8d]">
            Unified customer roster with dynamic strategy segmentation & deterministic guest reconciliation
          </p>
        </div>

        {/* Strategy Selector on Table Bar */}
        <div className="flex items-center gap-2 bg-[#f1f0ee] px-3.5 py-1.5 rounded-full border border-[#e6e5e2] self-start md:self-auto">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#8d8d8d]" />
          <label htmlFor="customer-table-strategy" className="text-xs text-[#8d8d8d] font-medium">
            Strategy:
          </label>
          <select
            id="customer-table-strategy"
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
      </div>

      {/* Filter Row: Search & Segment Pills */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8d8d8d]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full pl-10 pr-4 py-2 rounded-full bg-[#f1f0ee] border border-[#e6e5e2] text-xs text-[#111111] placeholder:text-[#8d8d8d] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b15f2c]"
          />
        </div>

        {/* Segment Filter Pills */}
        <div className="flex items-center gap-1.5 bg-[#f1f0ee] p-1 rounded-full border border-[#e6e5e2] self-start sm:self-auto">
          {(["ALL", "VIP", "Repeat", "New"] as const).map((seg) => (
            <button
              key={seg}
              onClick={() => setSegmentFilter(seg)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                segmentFilter === seg
                  ? "bg-white text-[#111111] shadow-xs"
                  : "text-[#8d8d8d] hover:text-[#111111]"
              }`}
            >
              {seg === "ALL" ? "All Customers" : seg}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table Container */}
      <div className="rounded-[1.5rem] bg-white border border-[#e6e5e2] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f1f0ee] border-b border-[#e6e5e2] text-[#8d8d8d] font-mono uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Customer</th>
                <th className="py-3.5 px-4">Segment</th>
                <th className="py-3.5 px-4">Lifetime Value (LTV)</th>
                <th className="py-3.5 px-4">Orders</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4 text-right">360° Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6e5e2]">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#8d8d8d] text-xs">
                    No customers match your search query.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const badge = segmentBadges[cust.segment] || segmentBadges.New;
                  const isGuest = !cust.wooCommerceId || cust.wooCommerceId === 0;

                  return (
                    <tr
                      key={cust.id}
                      data-testid={`customer-row-${cust.email}`}
                      onClick={() => setSelectedCustomer(cust)}
                      className="hover:bg-[#f1f0ee] transition-colors cursor-pointer group"
                    >
                      {/* Customer Info */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#0a0a0a] text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {(cust.firstName || "C")[0]}
                            {(cust.lastName || "")[0]}
                          </div>
                          <div>
                            <div className="font-bold text-[#111111] flex items-center gap-1.5">
                              <span>
                                {cust.fullName || `${cust.firstName} ${cust.lastName}`}
                              </span>
                              {isGuest && (
                                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 text-[9px] font-mono border border-emerald-500/20">
                                  Guest (ID=0)
                                </span>
                              )}
                            </div>
                            <div className="text-[#8d8d8d] font-mono text-[11px]">
                              {cust.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Segment Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${badge.class}`}
                        >
                          {cust.segment === "VIP" && <Award className="w-3 h-3" />}
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      {/* LTV */}
                      <td className="py-3.5 px-4 font-bold text-[#111111] tabular-nums font-mono text-sm">
                        ${cust.lifetimeValue.toFixed(2)}
                      </td>

                      {/* Orders */}
                      <td className="py-3.5 px-4 text-[#8d8d8d] font-mono">
                        {cust.ordersCount} order{cust.ordersCount > 1 ? "s" : ""}
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 text-[#8d8d8d]">
                        {cust.billingAddress?.city ? (
                          <span>
                            {cust.billingAddress.city}, {cust.billingAddress.state || cust.billingAddress.country}
                          </span>
                        ) : (
                          <span className="font-mono text-[11px]">—</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-xs text-[#b15f2c] group-hover:underline font-medium">
                          <span>Inspect</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 360° Drawer */}
      <DashboardCustomerDrawer360
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />
    </section>
  );
}
