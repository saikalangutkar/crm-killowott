"use client";

import React, { useState } from "react";
import { useCrm } from "@/context/CrmContext";
import { CrmOrder, OrderStatus } from "@/lib/types";
import { OrderDetailDrawer } from "./OrderDetailDrawer";
import {
  Kanban,
  Table as TableIcon,
  ArrowRight,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  Package,
} from "lucide-react";

export function DashboardOrderPipeline() {
  const { orders, advanceOrderStatus } = useCrm();
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [selectedOrder, setSelectedOrder] = useState<CrmOrder | null>(null);

  const columns: { status: OrderStatus; label: string; icon: React.ElementType; color: string; badge: string }[] = [
    { status: "pending", label: "Pending", icon: Clock, color: "text-amber-600", badge: "bg-amber-500/10 text-amber-700 border-amber-500/30" },
    { status: "processing", label: "Processing", icon: Package, color: "text-sky-600", badge: "bg-sky-500/10 text-sky-700 border-sky-500/30" },
    { status: "shipped", label: "Shipped", icon: Truck, color: "text-purple-600", badge: "bg-purple-500/10 text-purple-700 border-purple-500/30" },
    { status: "completed", label: "Completed", icon: CheckCircle2, color: "text-emerald-600", badge: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30" },
    { status: "cancelled", label: "Cancelled", icon: XCircle, color: "text-rose-600", badge: "bg-rose-500/10 text-rose-700 border-rose-500/30" },
  ];

  return (
    <section aria-label="Order Tracking Pipeline" className="flex flex-col gap-6">
      {/* Top Header & View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#111111]">
            Order Tracking Pipeline
          </h2>
          <p className="text-xs text-[#8d8d8d]">
            Live order progression stream with event-driven status advancing & omnichannel triggers
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#f1f0ee] p-1 rounded-full border border-[#e6e5e2] self-start sm:self-auto">
          <button
            onClick={() => setViewMode("kanban")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              viewMode === "kanban"
                ? "bg-white text-[#111111] shadow-xs"
                : "text-[#8d8d8d] hover:text-[#111111]"
            }`}
            aria-label="Kanban View"
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Kanban Pipeline</span>
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              viewMode === "table"
                ? "bg-white text-[#111111] shadow-xs"
                : "text-[#8d8d8d] hover:text-[#111111]"
            }`}
            aria-label="Table View"
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Table View</span>
          </button>
        </div>
      </div>

      {viewMode === "kanban" ? (
        /* Kanban Columns Grid */
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {columns.map((col) => {
            const Icon = col.icon;
            const colOrders = orders.filter((o) => o.status === col.status);

            return (
              <div
                key={col.status}
                className="flex flex-col rounded-[1.5rem] bg-[#f1f0ee] border border-[#e6e5e2] p-3.5 min-h-[500px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-1.5">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${col.color}`} />
                    <span className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                      {col.label}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-white text-[11px] font-mono font-bold text-[#111111] border border-[#e6e5e2]">
                    {colOrders.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
                  {colOrders.length === 0 ? (
                    <div className="p-4 rounded-[1.25rem] border border-dashed border-[#e6e5e2] text-center my-auto text-xs text-[#8d8d8d]">
                      No {col.label.toLowerCase()} orders
                    </div>
                  ) : (
                    colOrders.map((ord) => {
                      const isGuest = ord.customerId.includes("guest");

                      return (
                        <div
                          key={ord.id}
                          onClick={() => setSelectedOrder(ord)}
                          className="p-4 rounded-[1.25rem] bg-white border border-[#e6e5e2] shadow-xs hover:border-[#b15f2c]/50 transition-all cursor-pointer flex flex-col justify-between group"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="font-mono text-xs font-bold text-[#111111]">
                                #{ord.wooCommerceOrderId}
                              </span>
                              <span className="font-mono font-bold text-xs text-[#111111] tabular-nums">
                                ${ord.total.toFixed(2)}
                              </span>
                            </div>

                            <p className="text-xs font-semibold text-[#111111] truncate mb-0.5">
                              {ord.customerName}
                            </p>

                            <p className="text-[11px] text-[#8d8d8d] truncate font-mono">
                              {ord.customerEmail}
                            </p>

                            {isGuest && (
                              <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-mono border border-emerald-500/20">
                                Guest mapped
                              </span>
                            )}
                          </div>

                          {/* Card Action Buttons */}
                          <div className="mt-3 pt-2.5 border-t border-[#e6e5e2] flex items-center justify-between gap-2">
                            <span className="text-[10px] text-[#8d8d8d] font-mono">
                              {ord.lineItems?.length || 1} item{(ord.lineItems?.length || 1) > 1 ? "s" : ""}
                            </span>

                            {ord.status === "pending" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  advanceOrderStatus(ord.wooCommerceOrderId, "processing");
                                }}
                                data-testid={`advance-order-${ord.wooCommerceOrderId}`}
                                className="px-2.5 py-1 rounded-full bg-[#0a0a0a] hover:bg-[#111111] text-white text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                              >
                                <span>Start Processing</span>
                                <ArrowRight className="w-2.5 h-2.5 text-[#cf8047]" />
                              </button>
                            )}

                            {ord.status === "processing" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  advanceOrderStatus(ord.wooCommerceOrderId, "shipped");
                                }}
                                data-testid={`advance-order-${ord.wooCommerceOrderId}`}
                                className="px-2.5 py-1 rounded-full bg-purple-700 hover:bg-purple-800 text-white text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                              >
                                <span>Ship</span>
                                <ArrowRight className="w-2.5 h-2.5" />
                              </button>
                            )}

                            {ord.status === "shipped" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  advanceOrderStatus(ord.wooCommerceOrderId, "completed");
                                }}
                                data-testid={`advance-order-${ord.wooCommerceOrderId}`}
                                className="px-2.5 py-1 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                              >
                                <span>Complete</span>
                                <CheckCircle2 className="w-2.5 h-2.5" />
                              </button>
                            )}

                            {ord.status === "completed" && (
                              <span className="text-[10px] text-emerald-600 font-mono font-medium flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Fulfilled
                              </span>
                            )}

                            {ord.status === "cancelled" && (
                              <span className="text-[10px] text-rose-600 font-mono font-medium flex items-center gap-1">
                                <XCircle className="w-3 h-3" /> Cancelled
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-[1.5rem] bg-white border border-[#e6e5e2] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f1f0ee] border-b border-[#e6e5e2] text-[#8d8d8d] font-mono uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6e5e2]">
                {orders.map((ord) => (
                  <tr
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord)}
                    className="hover:bg-[#f1f0ee] transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-[#111111]">
                      #{ord.wooCommerceOrderId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#111111]">
                        {ord.customerName}
                      </div>
                      <div className="text-[#8d8d8d] font-mono text-[11px]">
                        {ord.customerEmail}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-[#111111] tabular-nums font-mono">
                      ${ord.total.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#f1f0ee] border border-[#e6e5e2] text-[#111111]">
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#8d8d8d] font-mono">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(ord);
                        }}
                        className="text-xs text-[#b15f2c] hover:underline font-medium"
                      >
                        Inspect Drawer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Drawer */}
      <OrderDetailDrawer
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </section>
  );
}
