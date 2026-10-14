"use client";

import React, { useEffect } from "react";
import { CrmOrder, OrderStatus } from "@/lib/types";
import { useCrm } from "@/context/CrmContext";
import { X, ArrowRight, Package, User, MapPin, Calendar, DollarSign, CheckCircle2 } from "lucide-react";

interface OrderDetailDrawerProps {
  order: CrmOrder | null;
  onClose: () => void;
}

export function OrderDetailDrawer({ order, onClose }: OrderDetailDrawerProps) {
  const { advanceOrderStatus, cancelOrder } = useCrm();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && order) {
        onClose();
      }
    };
    if (order) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [order, onClose]);

  if (!order) return null;

  const statusColors: Record<OrderStatus, { bg: string; text: string; border: string }> = {
    pending: { bg: "bg-amber-500/10", text: "text-amber-700", border: "border-amber-500/30" },
    processing: { bg: "bg-sky-500/10", text: "text-sky-700", border: "border-sky-500/30" },
    shipped: { bg: "bg-purple-500/10", text: "text-purple-700", border: "border-purple-500/30" },
    completed: { bg: "bg-emerald-500/10", text: "text-emerald-700", border: "border-emerald-500/30" },
    cancelled: { bg: "bg-rose-500/10", text: "text-rose-700", border: "border-rose-500/30" },
  };

  const currentTheme = statusColors[order.status] || statusColors.pending;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-detail-title"
      className="fixed inset-0 z-[9990] flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-xl h-full bg-[#ffffff] text-[#111111] shadow-2xl border-l border-[#e6e5e2] flex flex-col justify-between overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-6 border-b border-[#e6e5e2] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#0a0a0a] text-white flex items-center justify-center">
              <Package className="w-4 h-4 text-[#cf8047]" />
            </div>
            <div>
              <h2 id="order-detail-title" className="text-lg font-bold tracking-tight text-[#111111]">
                Order #{order.wooCommerceOrderId}
              </h2>
              <span className="text-xs text-[#8d8d8d] font-mono">
                {new Date(order.createdAt).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border ${currentTheme.bg} ${currentTheme.text} ${currentTheme.border}`}
            >
              {order.status}
            </span>
            <button
              onClick={onClose}
              data-testid="close-order-drawer"
              className="p-2 rounded-full text-[#8d8d8d] hover:text-[#111111] hover:bg-[#f1f0ee] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b15f2c]"
              aria-label="Close order drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {/* Summary Metric Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-[1.25rem] bg-[#f1f0ee] border border-[#e6e5e2]">
              <span className="text-xs text-[#8d8d8d] font-mono uppercase block">Total Amount</span>
              <span className="text-2xl font-bold text-[#111111] tabular-nums">
                ${order.total.toFixed(2)}
              </span>
              <span className="text-[11px] text-[#8d8d8d] block mt-0.5 font-mono">
                {order.currency} via {order.paymentMethod || "Credit Card"}
              </span>
            </div>
            <div className="p-4 rounded-[1.25rem] bg-[#f1f0ee] border border-[#e6e5e2]">
              <span className="text-xs text-[#8d8d8d] font-mono uppercase block">Customer Type</span>
              <span className="text-base font-bold text-[#111111] block mt-1">
                {order.customerId.includes("guest") ? "Guest Checkout" : "Registered Account"}
              </span>
              <span className="text-[11px] text-[#8d8d8d] block font-mono">
                {order.customerId.includes("guest") ? "Mapped by email" : "Native customer"}
              </span>
            </div>
          </div>

          {/* Customer Details */}
          <div className="p-4 rounded-[1.25rem] bg-white border border-[#e6e5e2]">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#8d8d8d] mb-3 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Customer & Billing Info
            </h3>
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-[#111111]">{order.customerName}</p>
              <p className="text-xs text-[#8d8d8d] font-mono">{order.customerEmail}</p>
              {order.billingAddress && (
                <p className="text-xs text-[#8d8d8d] pt-1">
                  {order.billingAddress.address_1}, {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.postcode}, {order.billingAddress.country}
                </p>
              )}
            </div>
          </div>

          {/* Line Items */}
          <div className="p-4 rounded-[1.25rem] bg-white border border-[#e6e5e2]">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#8d8d8d] mb-3 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" /> Purchased Items ({order.lineItems?.length || 1})
            </h3>
            <div className="divide-y divide-[#e6e5e2]">
              {(order.lineItems || []).map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-[#111111]">{item.name}</span>
                    <span className="text-[#8d8d8d] block font-mono">Qty: {item.quantity} · SKU: {item.sku || "N/A"}</span>
                  </div>
                  <span className="font-bold text-[#111111] tabular-nums font-mono">
                    ${Number(item.total).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-[#e6e5e2] bg-[#f1f0ee] flex items-center justify-between gap-4">
          {order.status !== "cancelled" && (
            <button
              onClick={() => {
                cancelOrder(order.id, "Admin cancellation from drawer");
                onClose();
              }}
              className="pill-btn bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-xs cursor-pointer"
            >
              Cancel Order
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {order.status === "pending" && (
              <button
                onClick={() => {
                  advanceOrderStatus(order.id, "processing");
                  onClose();
                }}
                className="pill-btn bg-[#b15f2c] hover:bg-[#cf8047] text-white text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Move to Processing</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {order.status === "processing" && (
              <button
                onClick={() => {
                  advanceOrderStatus(order.id, "shipped");
                  onClose();
                }}
                className="pill-btn bg-purple-700 hover:bg-purple-800 text-white text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Dispatch / Mark Shipped</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {order.status === "shipped" && (
              <button
                onClick={() => {
                  advanceOrderStatus(order.id, "completed");
                  onClose();
                }}
                className="pill-btn bg-emerald-700 hover:bg-emerald-800 text-white text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Delivered & Completed</span>
              </button>
            )}

            {order.status === "completed" && (
              <span className="text-xs font-mono text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Order Fully Fulfilled
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
