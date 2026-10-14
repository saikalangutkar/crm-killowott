"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Bot,
  Send,
  Sparkles,
  ArrowRight,
  User,
  Trash2,
} from "lucide-react";
import { CopilotMessage, CrmCopilotEngine } from "../lib/crm-copilot";
import {
  CrmCustomer,
  CrmOrder,
  AiTriageAlert,
  CommunicationLog,
} from "../lib/types";

interface AiCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  customers: CrmCustomer[];
  orders: CrmOrder[];
  alerts: AiTriageAlert[];
  logs: CommunicationLog[];
  onSelectCustomerById: (customerId: string) => void;
}

const QUICK_PROMPTS = [
  "Who are our top VIP patrons?",
  "Which orders are pending fulfillment?",
  "Show win-back recovery campaigns",
  "Draft a thank you message for Elena Rostova",
];

const INITIAL_MESSAGES: CopilotMessage[] = [
  {
    id: "init_1",
    sender: "copilot",
    text: "Hello! I am your **Kilowott CRM Copilot**. I have real-time visibility into all customer orders, lifetime values, segment tiers, and autonomous AI triage alerts.\n\nAsk me anything or select a quick query below!",
    timestamp: new Date().toISOString(),
  },
];

export function AiCopilotDrawer({
  isOpen,
  onClose,
  customers,
  orders,
  alerts,
  logs,
  onSelectCustomerById,
}: AiCopilotDrawerProps) {
  const [messages, setMessages] = useState<CopilotMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const copilotEngine = React.useMemo(() => new CrmCopilotEngine(), []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = (textToSend?: string) => {
    const q = textToSend || inputValue;
    if (!q.trim()) return;

    const userMsg: CopilotMessage = {
      id: `user_${Date.now()}`,
      sender: "user",
      text: q,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // Simulate intelligent analytical processing latency (250ms)
    setTimeout(() => {
      const response = copilotEngine.answerQuery(q, {
        customers,
        orders,
        alerts,
        logs,
      });
      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
    }, 250);
  };

  const handleClearHistory = () => {
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="glass-panel-elevated w-screen max-w-lg border-l border-indigo-500/30 p-5 flex flex-col h-full animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white shadow-lg shadow-indigo-600/30">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  Kilowott CRM Copilot
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Online
                  </span>
                </h2>
                <p className="text-[11px] text-slate-400">
                  Real-time contextual AI analysis over {customers.length} patrons &amp; {orders.length} orders
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearHistory}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Reset conversation"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                onClick={onClose}
                data-testid="close-copilot-drawer"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Quick Prompt Chips */}
          <div className="py-2.5 border-b border-slate-800/80 overflow-x-auto">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-[10px] text-slate-500 font-semibold uppercase flex items-center gap-1 mr-1">
                <Sparkles className="h-3 w-3 text-indigo-400" /> Prompts:
              </span>
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  data-testid={`quick-prompt-${idx}`}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-white transition-all cursor-pointer shrink-0"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1">
            {messages.map((msg) => {
              const isCopilot = msg.sender === "copilot";

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isCopilot ? "items-start" : "items-end"}`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl p-3.5 text-xs leading-relaxed space-y-2 ${
                      isCopilot
                        ? "bg-slate-900/90 border border-slate-800 text-slate-200"
                        : "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    }`}
                  >
                    {/* Message Header */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span className="font-semibold flex items-center gap-1">
                        {isCopilot ? (
                          <>
                            <Bot className="h-3 w-3 text-indigo-400" /> Kilowott Copilot
                          </>
                        ) : (
                          <>
                            <User className="h-3 w-3 text-indigo-200" /> You
                          </>
                        )}
                      </span>
                      <span>
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {/* Message Body */}
                    <p className="whitespace-pre-line text-slate-200 font-normal">
                      {msg.text}
                    </p>

                    {/* Data Points Pills */}
                    {msg.dataPoints && msg.dataPoints.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-800/80">
                        {msg.dataPoints.map((dp, i) => (
                          <span
                            key={i}
                            className={`px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono font-semibold ${
                              dp.badgeColor || "text-slate-300"
                            }`}
                          >
                            {dp.label}: {dp.value}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Suggested Action Buttons */}
                    {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                      <div className="space-y-1 pt-1.5">
                        {msg.suggestedActions.map((act, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              if (act.actionType === "open_customer" && act.targetId) {
                                onSelectCustomerById(act.targetId);
                                onClose();
                              }
                            }}
                            className="w-full flex items-center justify-between text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition-all cursor-pointer"
                          >
                            <span>{act.label}</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-1.5 text-xs text-indigo-400 italic bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 w-fit">
                <Sparkles className="h-3.5 w-3.5 animate-spin" />
                <span>Copilot is analyzing CRM memory...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="pt-3 border-t border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about VIPs, pending orders, or request a draft..."
                data-testid="copilot-input"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                data-testid="copilot-submit"
                className="flex items-center justify-center p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all cursor-pointer"
                title="Send query"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
