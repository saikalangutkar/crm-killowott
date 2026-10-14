"use client";

import React, { useState } from "react";
import { Search, Crown, Users, Sparkles, ChevronRight, UserCheck } from "lucide-react";
import { CrmCustomer, CustomerSegment } from "../lib/types";

interface CustomerTableProps {
  customers: CrmCustomer[];
  onSelectCustomer: (customer: CrmCustomer) => void;
}

export function CustomerTable({ customers, onSelectCustomer }: CustomerTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [segmentFilter, setSegmentFilter] = useState<string>("all");

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone && c.phone.includes(searchTerm));

    const matchesSegment =
      segmentFilter === "all" || c.segment === segmentFilter;

    return matchesSearch && matchesSegment;
  });

  const getSegmentBadge = (segment: CustomerSegment) => {
    switch (segment) {
      case "VIP":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 shadow-sm shadow-amber-500/10">
            <Crown className="h-3 w-3 text-amber-400" />
            VIP Patron
          </span>
        );
      case "Repeat":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
            <Sparkles className="h-3 w-3 text-indigo-400" />
            Repeat
          </span>
        );
      case "New":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            <UserCheck className="h-3 w-3 text-emerald-400" />
            New
          </span>
        );
    }
  };

  const getAvatarInitials = (name: string) => {
    if (!name) return "CU";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="glass-panel rounded-xl border border-slate-800 overflow-hidden">
      {/* Table Header & Controls */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">
              Customer Roster & 360° Management
            </h2>
            <p className="text-[11px] text-slate-400">
              Auto-segmented by Strategy Pattern • Guest checkouts mapped by email
            </p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search name, email, phone..."
              className="bg-slate-950/80 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 w-44 sm:w-56"
            />
          </div>

          <select
            value={segmentFilter}
            onChange={(e) => setSegmentFilter(e.target.value)}
            className="bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
            aria-label="Filter Customers by Segment"
          >
            <option value="all">All Segments</option>
            <option value="VIP">VIP Only</option>
            <option value="Repeat">Repeat Buyers</option>
            <option value="New">New Accounts</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-950/40">
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Segment</th>
              <th className="py-3 px-4 text-right">Lifetime Value (LTV)</th>
              <th className="py-3 px-4 text-center">Orders</th>
              <th className="py-3 px-4 text-right">AOV</th>
              <th className="py-3 px-4">Tags</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40 text-xs">
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500 italic">
                  No customers found matching &quot;{searchTerm}&quot;
                </td>
              </tr>
            ) : (
              filteredCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  onClick={() => onSelectCustomer(customer)}
                  data-testid={`customer-row-${customer.email}`}
                  className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                >
                  {/* Customer Identity */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-slate-800 to-indigo-900 border border-slate-700 flex items-center justify-center font-bold text-xs text-indigo-300 shrink-0">
                        {getAvatarInitials(customer.fullName)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                          {customer.fullName}
                          {customer.wooCommerceId === null && (
                            <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                              Guest
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {customer.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Segment Badge */}
                  <td className="py-3 px-4">
                    {getSegmentBadge(customer.segment)}
                  </td>

                  {/* Lifetime Value */}
                  <td className="py-3 px-4 text-right font-mono font-bold text-white">
                    ${(customer.lifetimeValue || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>

                  {/* Orders Count */}
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                      {customer.ordersCount}
                    </span>
                  </td>

                  {/* Average Order Value */}
                  <td className="py-3 px-4 text-right font-mono text-slate-300">
                    ${(customer.averageOrderValue || 0).toFixed(2)}
                  </td>

                  {/* Tags */}
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {customer.tags && customer.tags.length > 0 ? (
                        customer.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700"
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-600 text-[10px]">—</span>
                      )}
                    </div>
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCustomer(customer);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1 rounded-lg border border-indigo-500/20 transition-all cursor-pointer"
                    >
                      <span>360° Drawer</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
