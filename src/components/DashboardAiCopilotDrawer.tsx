"use client";

import React, { useState, useEffect } from "react";
import { useCrm } from "@/context/CrmContext";
import { queryCrmCopilot, COPILOT_QUICK_PROMPTS } from "@/lib/crm-copilot";
import { BrandMark } from "./BrandMark";
import { X, Send, Bot, User, Sparkles, ArrowRight, CornerDownLeft } from "lucide-react";

interface AiCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCustomerEmail?: (email: string) => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  suggestedAction?: string;
  dataPoints?: Record<string, string | number>;
}

export function DashboardAiCopilotDrawer({
  isOpen,
  onClose,
  onSelectCustomerEmail,
}: AiCopilotDrawerProps) {
  const { customers, orders, communicationLogs, aiAlerts } = useCrm();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I am your Kilowott CRM Autonomous Copilot. I analyze real-time WooCommerce order streams, calculate customer LTV trends, identify pipeline bottlenecks, and draft personalized retention campaigns. How can I assist you today?",
      timestamp: "Just now",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSendQuery = (queryText: string) => {
    if (!queryText.trim()) return;

    const userMsg: Message = {
      role: "user",
      content: queryText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = queryCrmCopilot(queryText, {
        customers,
        orders,
        communicationLogs,
        aiAlerts,
      });

      const assistantMsg: Message = {
        role: "assistant",
        content: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestedAction: response.suggestedAction,
        dataPoints: response.dataPoints,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 450);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="copilot-drawer-title"
      className="fixed inset-0 z-[9995] flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-xl h-full bg-[#0a0a0a] text-white shadow-2xl border-l border-white/10 flex flex-col justify-between overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Watermark */}
        <div className="absolute -bottom-10 -right-10 w-80 h-80 opacity-[0.03] text-white pointer-events-none select-none">
          <BrandMark className="w-full h-full" />
        </div>

        {/* Top Header */}
        <div className="p-6 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#cf8047]/20 text-[#cf8047] flex items-center justify-center border border-[#cf8047]/30">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 id="copilot-drawer-title" className="text-lg font-bold tracking-tight text-white">
                Kilowott CRM Copilot
              </h2>
              <span className="text-xs text-[#8d8d8d] font-mono">
                Agentic Heuristics & Live Knowledge Graph
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            data-testid="close-copilot-drawer"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-[#8d8d8d] hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b15f2c]"
            aria-label="Close copilot drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Prompts Bar */}
        <div className="p-4 border-b border-white/10 bg-white/[0.01] flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-mono uppercase text-[#8d8d8d] shrink-0">
            Suggested Prompts:
          </span>
          {COPILOT_QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={prompt}
              data-testid={`quick-prompt-${idx}`}
              onClick={() => handleSendQuery(prompt)}
              className="shrink-0 px-3 py-1 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-xs text-[#cf8047] transition-all cursor-pointer whitespace-nowrap"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono text-[#8d8d8d]">
                  {msg.role === "user" ? "You" : "Kilowott Copilot"} · {msg.timestamp}
                </span>
              </div>

              <div
                className={`max-w-[88%] p-4 rounded-[1.25rem] text-xs leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-[#b15f2c] text-white rounded-tr-xs"
                    : "bg-white/10 text-[#f1f0ee] border border-white/10 rounded-tl-xs"
                }`}
              >
                {msg.content}

                {/* Optional Data Points Box */}
                {msg.dataPoints && Object.keys(msg.dataPoints).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/15 grid grid-cols-2 gap-2 text-[11px] font-mono">
                    {Object.entries(msg.dataPoints).map(([key, val]) => (
                      <div key={key} className="bg-black/40 p-2 rounded-lg">
                        <span className="text-[#8d8d8d] block text-[9px] uppercase">{key}</span>
                        <span className="text-white font-bold">{val}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-[#8d8d8d] italic">
              <span className="w-1.5 h-1.5 rounded-full bg-[#cf8047] animate-bounce" />
              <span>Copilot evaluating live CRM state...</span>
            </div>
          )}
        </div>

        {/* Input Form */}
        <div className="p-4 border-t border-white/10 bg-white/[0.02]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuery(input);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about customers, LTV, orders, or recovery..."
              className="flex-1 px-4 py-3 rounded-full bg-white/10 border border-white/15 text-xs text-white placeholder:text-[#8d8d8d] focus:outline-none focus:ring-2 focus:ring-[#b15f2c]"
            />
            <button
              type="submit"
              className="pill-btn bg-[#b15f2c] hover:bg-[#cf8047] text-white text-xs px-4 py-3 flex items-center justify-center shrink-0 cursor-pointer"
              aria-label="Send query"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
