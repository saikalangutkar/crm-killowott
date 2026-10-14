"use client";

import React, { useState } from "react";
import {
  Bot,
  Crown,
  AlertTriangle,
  Send,
  CheckCircle,
  Tag,
  Clock,
  ExternalLink,
} from "lucide-react";
import { AiTriageAlert } from "../lib/types";

interface AiTriageCenterProps {
  alerts: AiTriageAlert[];
  onActionAlert: (alert: AiTriageAlert) => void;
  onDismissAlert: (alertId: string) => void;
  onSelectCustomerById: (customerId: string) => void;
}

export function AiTriageCenter({
  alerts,
  onActionAlert,
  onDismissAlert,
  onSelectCustomerById,
}: AiTriageCenterProps) {
  const [filter, setFilter] = useState<"pending" | "all">("pending");

  const displayedAlerts = alerts.filter((a) => {
    if (filter === "pending") return a.status === "pending";
    return true;
  });

  const pendingCount = alerts.filter((a) => a.status === "pending").length;

  return (
    <div className="glass-panel rounded-xl border border-slate-800 p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/20">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                Embedded AI Triage Agent
              </h2>
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-bold animate-pulse">
                  {pendingCount} Pending Triage
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Autonomous concierge evaluation &amp; win-back recovery campaigns
            </p>
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs">
          <button
            onClick={() => setFilter("pending")}
            className={`px-2.5 py-1 rounded font-medium transition-all cursor-pointer ${
              filter === "pending"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-2.5 py-1 rounded font-medium transition-all cursor-pointer ${
              filter === "all"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All History ({alerts.length})
          </button>
        </div>
      </div>

      {/* Alert Feed */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
        {displayedAlerts.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs italic flex flex-col items-center justify-center gap-1">
            <CheckCircle className="h-5 w-5 text-emerald-500/40" />
            <span>All AI triage alerts have been actioned. No pending escalations.</span>
          </div>
        ) : (
          displayedAlerts.map((alert) => {
            const isVip = alert.type === "vip_concierge";
            const isPending = alert.status === "pending";

            return (
              <div
                key={alert.id}
                data-testid={`triage-card-${alert.type}`}
                className={`rounded-xl border p-4 transition-all relative ${
                  isVip
                    ? "bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-900 border-amber-500/30"
                    : "bg-gradient-to-br from-slate-900 via-rose-950/20 to-slate-900 border-rose-500/30"
                } ${!isPending ? "opacity-75" : ""}`}
              >
                {/* Badge & Timestamp */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isVip ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/40">
                        <Crown className="h-3.5 w-3.5 text-amber-400" />
                        VIP Concierge Alert
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-300 border border-rose-500/40">
                        <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                        Win-Back Recovery Campaign
                      </span>
                    )}

                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {alert.priority}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Summary & Customer Link */}
                <div className="mt-2.5 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    {alert.summary}
                  </h3>
                  <button
                    onClick={() => onSelectCustomerById(alert.customerId)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <span>{alert.customerName}</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>

                {/* Analysis Synthesis */}
                <p className="mt-1 text-xs text-slate-300 leading-relaxed bg-slate-950/40 rounded-lg p-2.5 border border-slate-800/80">
                  <span className="text-slate-400 font-semibold block mb-0.5">
                    Agentic Heuristic Analysis:
                  </span>
                  {alert.analysis}
                </p>

                {/* Coupon Code Pill if present */}
                {alert.suggestedMessage.couponCode && (
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-semibold">
                      <Tag className="h-3 w-3" />
                      Promo Code: {alert.suggestedMessage.couponCode} ({alert.suggestedMessage.discountPercent}% OFF)
                    </span>
                  </div>
                )}

                {/* Proposed Message Preview */}
                <div className="mt-2.5 text-xs bg-slate-950/80 rounded-lg p-2.5 border border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-1">
                    <Send className="h-3 w-3 text-indigo-400" />
                    Synthesized Outreach ({alert.suggestedMessage.channel.toUpperCase()}):
                  </span>
                  <p className="text-slate-200 whitespace-pre-line font-sans italic text-[11px] leading-relaxed">
                    &quot;{alert.suggestedMessage.body}&quot;
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Recommended: {alert.recommendedAction}
                  </span>

                  <div className="flex items-center gap-2">
                    {isPending ? (
                      <>
                        <button
                          onClick={() => onDismissAlert(alert.id)}
                          className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 border border-slate-800 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={() => onActionAlert(alert)}
                          data-testid={`action-triage-${alert.id}`}
                          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg shadow transition-all cursor-pointer ${
                            isVip
                              ? "bg-amber-600 hover:bg-amber-500 text-white"
                              : "bg-rose-600 hover:bg-rose-500 text-white"
                          }`}
                        >
                          <Send className="h-3 w-3" />
                          <span>
                            {isVip
                              ? "Dispatch VIP Concierge (WhatsApp)"
                              : "Dispatch Win-Back Campaign (Email)"}
                          </span>
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle className="h-3.5 w-3.5" /> Actioned &amp; Dispatched
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
