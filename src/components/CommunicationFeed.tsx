"use client";

import React from "react";
import { MessageSquare, Mail, CheckCheck } from "lucide-react";
import { CommunicationLog } from "../lib/types";

interface CommunicationFeedProps {
  logs: CommunicationLog[];
}

export function CommunicationFeed({ logs }: CommunicationFeedProps) {
  return (
    <div className="glass-panel rounded-xl border border-slate-800 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">
              Omnichannel Communication Feed
            </h2>
            <p className="text-[11px] text-slate-400">
              Live audit ledger of event-triggered Email &amp; WhatsApp dispatches
            </p>
          </div>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {logs.length} messages logged
        </span>
      </div>

      {/* Logs Stream */}
      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {logs.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs italic">
            No message logs available yet. Trigger an order to generate dispatches.
          </div>
        ) : (
          logs.map((log) => {
            const isWhatsApp = log.channel === "whatsapp";

            return (
              <div
                key={log.id}
                className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 transition-colors text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        isWhatsApp
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                      }`}
                    >
                      {isWhatsApp ? (
                        <MessageSquare className="h-2.5 w-2.5" />
                      ) : (
                        <Mail className="h-2.5 w-2.5" />
                      )}
                      {log.channel}
                    </span>
                    <span className="font-semibold text-slate-200">
                      {log.customerName}
                    </span>
                    <span className="text-slate-500 text-[10px] hidden sm:inline">
                      ({log.customerEmail})
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>

                {log.subject && (
                  <div className="font-medium text-slate-200 text-[11px]">
                    Subject: {log.subject}
                  </div>
                )}

                <p className="text-slate-300 text-[11px] leading-relaxed whitespace-pre-line bg-slate-950/40 p-2 rounded border border-slate-800/60">
                  {log.message}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                  <span className="text-indigo-400 font-mono">
                    Event: {log.eventType}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <CheckCheck className="h-3 w-3" />
                    {log.status.toUpperCase()}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
