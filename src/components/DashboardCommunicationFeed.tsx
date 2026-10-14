"use client";

import React from "react";
import { useCrm } from "@/context/CrmContext";
import { Mail, MessageSquare, CheckCircle2 } from "lucide-react";

export function DashboardCommunicationFeed() {
  const { communicationLogs } = useCrm();

  return (
    <section aria-label="Automated Communication Feed" className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#111111]">
            Live Communication Feed
          </h2>
          <p className="text-xs text-[#8d8d8d]">
            Decoupled Observer engine audit stream recording automated Email & WhatsApp dispatches
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f1f0ee] border border-[#e6e5e2] text-xs font-mono text-[#111111] self-start sm:self-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{communicationLogs.length} Events Dispatched</span>
        </span>
      </div>

      {/* Feed Container */}
      <div className="rounded-[1.5rem] bg-white border border-[#e6e5e2] shadow-xs divide-y divide-[#e6e5e2] overflow-hidden">
        {communicationLogs.length === 0 ? (
          <div className="text-center py-12 text-[#8d8d8d] text-xs">
            No communication events emitted yet. Advance an order or trigger a webhook to view automated logs.
          </div>
        ) : (
          communicationLogs.map((log) => {
            const isWhatsApp = log.channel === "whatsapp";
            return (
              <div
                key={log.id}
                className="p-4 sm:p-5 hover:bg-[#f1f0ee]/60 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      isWhatsApp
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                        : "bg-sky-500/10 text-sky-600 border border-sky-500/20"
                    }`}
                  >
                    {isWhatsApp ? <MessageSquare className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-bold text-[#111111]">{log.subject || "Order Update"}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                          isWhatsApp
                            ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/30"
                            : "bg-sky-500/10 text-sky-700 border border-sky-500/30"
                        }`}
                      >
                        {log.channel}
                      </span>
                      {log.orderId && (
                        <span className="font-mono text-[10px] text-[#8d8d8d]">
                          ({log.orderId})
                        </span>
                      )}
                    </div>

                    <p className="text-[#8d8d8d] leading-relaxed max-w-2xl break-words">
                      {log.message}
                    </p>

                    <div className="text-[11px] font-mono text-[#8d8d8d] mt-1.5">
                      Recipient: <span className="text-[#111111]">{log.customerName || log.customerEmail}</span> ({log.customerEmail})
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 shrink-0 pl-11 sm:pl-0">
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-600 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase">
                    <CheckCircle2 className="w-3 h-3" /> {log.status}
                  </span>
                  <span className="text-[10px] font-mono text-[#8d8d8d]">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
