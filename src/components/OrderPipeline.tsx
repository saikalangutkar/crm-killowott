"use client";

import React, { useState } from "react";
import {
  Clock,
  RotateCw,
  Truck,
  CheckCircle2,
  XCircle,
  ArrowRight,
  PackageCheck,
  CreditCard,
  Ban,
  User,
} from "lucide-react";
import { CrmOrder, OrderStatus } from "../lib/types";

interface OrderPipelineProps {
  orders: CrmOrder[];
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
  onSelectCustomerById: (customerId: string) => void;
}

const STAGES: {
  id: OrderStatus;
  title: string;
  icon: React.ReactNode;
  accentColor: string;
  badgeBg: string;
}[] = [
  {
    id: "pending",
    title: "Pending Payment",
    icon: <Clock className="h-4 w-4 text-amber-400" />,
    accentColor: "border-amber-500/30 text-amber-300",
    badgeBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  {
    id: "processing",
    title: "Fulfillment & Packing",
    icon: <RotateCw className="h-4 w-4 text-blue-400" />,
    accentColor: "border-blue-500/30 text-blue-300",
    badgeBg: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  {
    id: "shipped",
    title: "Out for Delivery",
    icon: <Truck className="h-4 w-4 text-purple-400" />,
    accentColor: "border-purple-500/30 text-purple-300",
    badgeBg: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
  {
    id: "completed",
    title: "Delivered & Completed",
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
    accentColor: "border-emerald-500/30 text-emerald-300",
    badgeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
];

export function OrderPipeline({
  orders,
  onUpdateStatus,
  onSelectCustomerById,
}: OrderPipelineProps) {
  const [showCancelled, setShowCancelled] = useState(false);

  const cancelledOrders = orders.filter((o) => o.status === "cancelled");

  const getNextStage = (current: OrderStatus): OrderStatus | null => {
    switch (current) {
      case "pending":
        return "processing";
      case "processing":
        return "shipped";
      case "shipped":
        return "completed";
      default:
        return null;
    }
  };

  const getNextStageLabel = (current: OrderStatus): string => {
    switch (current) {
      case "pending":
        return "Start Processing";
      case "processing":
        return "Dispatch (Ship)";
      case "shipped":
        return "Mark Delivered";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-4">
      {/* Pipeline Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <PackageCheck className="h-4 w-4" />
          </div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Real-Time Order Pipeline
          </h2>
          <span className="text-xs text-slate-400">
            ({orders.length} total orders across WooCommerce stages)
          </span>
        </div>

        <button
          onClick={() => setShowCancelled(!showCancelled)}
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
            showCancelled
              ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
          }`}
        >
          <XCircle className="h-3.5 w-3.5" />
          {showCancelled ? "Hide" : "Show"} Cancelled ({cancelledOrders.length})
        </button>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAGES.map((stage) => {
          const stageOrders = orders.filter((o) => o.status === stage.id);
          const stageTotal = stageOrders.reduce((sum, o) => sum + o.total, 0);

          return (
            <div
              key={stage.id}
              className="glass-panel rounded-xl border border-slate-800 flex flex-col min-h-[460px] overflow-hidden"
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {stage.icon}
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    {stage.title}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${stage.badgeBg}`}>
                    {stageOrders.length}
                  </span>
                </div>
              </div>

              {/* Column Volume Bar */}
              <div className="px-3.5 py-1.5 bg-slate-950/40 border-b border-slate-800/40 flex items-center justify-between text-[11px] text-slate-400">
                <span>Total Volume</span>
                <span className="font-semibold text-slate-200">
                  ${stageTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Order Cards Container */}
              <div className="p-3 space-y-3 flex-1 overflow-y-auto">
                {stageOrders.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center text-center text-slate-500 text-xs italic border border-dashed border-slate-800/60 rounded-lg">
                    <span>No orders in this stage</span>
                  </div>
                ) : (
                  stageOrders.map((order) => {
                    const nextStage = getNextStage(order.status);
                    const nextLabel = getNextStageLabel(order.status);

                    return (
                      <div
                        key={order.id}
                        data-testid={`order-card-${order.wooCommerceOrderId}`}
                        className="glass-card rounded-xl p-3.5 border border-slate-700/60 relative group"
                      >
                        {/* Order Header */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-indigo-300">
                            #{order.wooCommerceOrderId}
                          </span>
                          <span className="text-sm font-extrabold text-white">
                            ${order.total.toFixed(2)}
                          </span>
                        </div>

                        {/* Customer Link */}
                        <div className="mt-2 flex items-center justify-between text-xs">
                          <button
                            onClick={() => onSelectCustomerById(order.customerId)}
                            className="font-medium text-slate-200 hover:text-indigo-400 flex items-center gap-1 transition-colors text-left truncate max-w-[160px] cursor-pointer"
                            title={`Open 360° view for ${order.customerName}`}
                          >
                            <User className="h-3 w-3 text-slate-400 shrink-0" />
                            <span className="truncate">{order.customerName}</span>
                          </button>
                        </div>

                        {/* Line Items Preview */}
                        <div className="mt-2 pt-2 border-t border-slate-800/60 space-y-1">
                          {order.lineItems.map((item) => (
                            <div
                              key={item.id}
                              className="text-[11px] text-slate-400 flex items-center justify-between"
                            >
                              <span className="truncate max-w-[140px]" title={item.name}>
                                {item.quantity}x {item.name}
                              </span>
                              <span className="text-slate-300 font-mono text-[10px]">
                                ${item.total.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Payment & Tracking Info */}
                        <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <CreditCard className="h-2.5 w-2.5" />
                            {order.paymentMethod}
                          </span>
                          {order.trackingNumber && (
                            <span className="font-mono text-indigo-400">
                              {order.trackingNumber}
                            </span>
                          )}
                        </div>

                        {/* Interactive Status Transition Actions */}
                        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center gap-1.5">
                          {nextStage && (
                            <button
                              onClick={() => onUpdateStatus(order.id, nextStage)}
                              data-testid={`advance-order-${order.wooCommerceOrderId}`}
                              className="flex-1 flex items-center justify-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold py-1.5 px-2 rounded-lg transition-all cursor-pointer shadow-sm"
                            >
                              <span>{nextLabel}</span>
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          )}

                          {order.status !== "completed" && (
                            <button
                              onClick={() => onUpdateStatus(order.id, "cancelled")}
                              data-testid={`cancel-order-${order.wooCommerceOrderId}`}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 transition-all cursor-pointer"
                              title="Cancel order and trigger AI Win-Back recovery"
                            >
                              <Ban className="h-3.5 w-3.5" />
                            </button>
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

      {/* Cancelled Orders Drawer/Section if toggled */}
      {showCancelled && (
        <div className="glass-panel rounded-xl border border-rose-500/30 p-4 mt-4 animate-in fade-in">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Ban className="h-4 w-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white">
                Cancelled Orders (Excluded from LTV / Triggered AI Recovery)
              </h3>
            </div>
            <span className="text-xs text-rose-300">
              {cancelledOrders.length} orders
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {cancelledOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-slate-900/80 border border-rose-500/20 rounded-lg p-3 text-xs"
              >
                <div className="flex justify-between items-center text-slate-200 font-semibold">
                  <span>Order #{ord.wooCommerceOrderId}</span>
                  <span className="text-rose-400">${ord.total.toFixed(2)}</span>
                </div>
                <p className="text-slate-400 mt-1">Customer: {ord.customerName}</p>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                  Items: {ord.lineItems.map((i) => i.name).join(", ")}
                </p>
                <div className="mt-2 text-[10px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 inline-block">
                  AI Win-Back Recovery Campaign Active
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
