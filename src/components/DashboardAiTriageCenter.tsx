"use client";

import React, { useState } from "react";
import { useCrm } from "@/context/CrmContext";
import { AiTriageAlert } from "@/lib/types";
import {
  Bot,
  Sparkles,
  ShieldAlert,
  Send,
  CheckCircle2,
  Tag,
  Copy,
  Clock,
  MessageSquare,
  Mail,
} from "lucide-react";
import { BrandMark } from "./BrandMark";

export function DashboardAiTriageCenter() {
  const { aiAlerts, actionTriageAlert, showToast } = useCrm();
  const [filterType, setFilterType] = useState<"ALL" | "vip_concierge" | "cancellation_recovery">("ALL");

  const filteredAlerts = aiAlerts.filter((alert) => {
    if (filterType === "ALL") return true;
    return alert.type === filterType;
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast("Voucher Copied", `Promo code ${code} copied to clipboard`, "info");
  };

  return (
    <section aria-label="AI Agent Triage Center" className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f1f0ee] border border-[#e6e5e2] text-xs font-mono uppercase text-[#b15f2c] mb-2">
            <Bot className="w-3.5 h-3.5 text-[#b15f2c]" />
            <span>Autonomous Heuristic Agent</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-[#111111]">
            AI Agent Triage Center
          </h2>
          <p className="text-xs text-[#8d8d8d]">
            Autonomous background intelligence evaluating VIP intent & recovering cancelled transactions
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-[#f1f0ee] p-1 rounded-full border border-[#e6e5e2] self-start sm:self-auto">
          <button
            onClick={() => setFilterType("ALL")}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              filterType === "ALL" ? "bg-white text-[#111111] shadow-xs" : "text-[#8d8d8d] hover:text-[#111111]"
            }`}
          >
            All Alerts ({aiAlerts.length})
          </button>
          <button
            onClick={() => setFilterType("vip_concierge")}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              filterType === "vip_concierge" ? "bg-white text-[#111111] shadow-xs" : "text-[#8d8d8d] hover:text-[#111111]"
            }`}
          >
            VIP Concierge
          </button>
          <button
            onClick={() => setFilterType("cancellation_recovery")}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              filterType === "cancellation_recovery" ? "bg-white text-[#111111] shadow-xs" : "text-[#8d8d8d] hover:text-[#111111]"
            }`}
          >
            Win-Back Recoveries
          </button>
        </div>
      </div>

      {/* Ink Card Container */}
      <div className="p-6 sm:p-8 rounded-[2rem] bg-[#0a0a0a] text-white border border-[#e6e5e2]/15 shadow-2xl relative overflow-hidden">
        {/* Subtle Watermark */}
        <div className="absolute right-0 top-0 w-80 h-80 opacity-[0.03] text-white pointer-events-none select-none">
          <BrandMark className="w-full h-full" />
        </div>

        <div className="relative z-10 flex flex-col gap-6">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12 text-[#8d8d8d] text-xs">
              No triage alerts pending review.
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const isVip = alert.type === "vip_concierge";
              const isActioned = alert.status === "actioned";

              const promoCode =
                alert.suggestedMessage?.couponCode ||
                (isVip ? "VIP-COMEBACK20" : "SAVE15-RECOVER");

              return (
                <div
                  key={alert.id}
                  className={`p-6 rounded-[1.5rem] border transition-all ${
                    isActioned
                      ? "bg-white/5 border-white/10 opacity-70"
                      : isVip
                      ? "bg-white/[0.04] border-[#cf8047]/40 shadow-lg shadow-[#cf8047]/5"
                      : "bg-white/[0.04] border-rose-500/30"
                  }`}
                >
                  {/* Alert Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isVip ? "bg-[#cf8047]/20 text-[#cf8047]" : "bg-rose-500/20 text-rose-400"
                        }`}
                      >
                        {isVip ? <Sparkles className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                      </div>
                      <div>
                        <span className="text-sm font-bold text-white flex items-center gap-2">
                          <span>{isVip ? "VIP Concierge Alert" : "Win-Back Recovery Campaign"}</span>
                          <span className="text-xs font-mono text-[#8d8d8d] uppercase">
                            ({alert.priority})
                          </span>
                        </span>
                        <span className="text-xs text-[#8d8d8d] font-mono">
                          Customer: {alert.customerName} ({alert.customerEmail}) · Order #{alert.orderId}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isActioned ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed Dispatched
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-mono font-semibold">
                          <Clock className="w-3.5 h-3.5" /> Action Required
                        </span>
                      )}
                    </div>
                  </div>

                  {/* AI Reasoning / Observation */}
                  <div className="p-3.5 rounded-[1rem] bg-black/40 border border-white/10 text-xs text-[#f1f0ee] leading-relaxed mb-4">
                    <span className="text-[#cf8047] font-semibold font-mono uppercase block mb-1">
                      AI Reasoning:
                    </span>
                    {alert.analysis || alert.summary}
                  </div>

                  {/* Copy snippet & promo code */}
                  <div className="flex flex-col gap-2 mb-4">
                    <span className="text-[11px] font-mono text-[#8d8d8d] uppercase">
                      Drafted Outreach Content:
                    </span>
                    <p className="text-xs text-[#b6b6b6] bg-black/20 p-3 rounded-[0.875rem] border border-white/5 italic">
                      "{alert.suggestedMessage?.body || alert.recommendedAction}"
                    </p>

                    {!isVip && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] font-mono text-[#8d8d8d]">Generated Voucher:</span>
                        <button
                          onClick={() => handleCopyCode(promoCode)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-xs font-mono font-bold text-rose-300 hover:bg-rose-500/20 transition-colors cursor-pointer"
                        >
                          <Tag className="w-3 h-3" />
                          <span>{promoCode}</span>
                          <Copy className="w-3 h-3 ml-1" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-[11px] text-[#8d8d8d] font-mono">
                      Observer AI Triage · HITL Guardrail
                    </span>

                    {isActioned ? (
                      <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Outreach logged in Communication Feed
                      </span>
                    ) : (
                      <div className="flex items-center gap-3">
                        {isVip ? (
                          <button
                            onClick={() => actionTriageAlert(alert.id, "whatsapp")}
                            className="pill-btn bg-[#b15f2c] hover:bg-[#cf8047] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-md"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Dispatch VIP Concierge Greeting</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => actionTriageAlert(alert.id, "email")}
                            className="pill-btn bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-md"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Send Recovery Offer</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
