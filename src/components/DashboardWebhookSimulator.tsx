"use client";

import React, { useState, useEffect } from "react";
import { useCrm } from "@/context/CrmContext";
import { SIMULATOR_PRESETS } from "@/lib/seed-data";
import { WooCommerceWebhookPayload } from "@/lib/types";
import { X, Terminal, Send, CheckCircle2, AlertTriangle, Code2 } from "lucide-react";
import { BrandMark } from "./BrandMark";

interface WebhookSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DashboardWebhookSimulator({ isOpen, onClose }: WebhookSimulatorModalProps) {
  const { ingestWebhook } = useCrm();
  const [activeTab, setActiveTab] = useState<"presets" | "custom">("presets");
  const [customJson, setCustomJson] = useState(() =>
    JSON.stringify(SIMULATOR_PRESETS[0].payload, null, 2)
  );
  const [jsonError, setJsonError] = useState<string | null>(null);

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

  const handleDispatchPreset = (presetId: string) => {
    const preset = SIMULATOR_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    // Stamp unique ID and timestamp
    const dynamicPayload: WooCommerceWebhookPayload = {
      ...preset.payload,
      id: Math.floor(2000 + Math.random() * 8000),
      date_created: new Date().toISOString(),
    };

    ingestWebhook(dynamicPayload);
    onClose();
  };

  const handleSendCustomJson = () => {
    try {
      setJsonError(null);
      const parsed = JSON.parse(customJson);
      if (!parsed.id || !parsed.billing || !parsed.billing.email) {
        throw new Error("Payload must contain 'id' and 'billing.email' properties.");
      }
      ingestWebhook(parsed as WooCommerceWebhookPayload);
      onClose();
    } catch (err: unknown) {
      setJsonError(err instanceof Error ? err.message : "Invalid JSON syntax");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="simulator-modal-title"
      className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-2xl bg-[#ffffff] text-[#111111] rounded-[2rem] p-6 sm:p-8 border border-[#e6e5e2] shadow-2xl relative max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#e6e5e2]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0a0a0a] text-white flex items-center justify-center">
              <Terminal className="w-5 h-5 text-[#cf8047]" />
            </div>
            <div>
              <h2 id="simulator-modal-title" className="text-xl font-bold tracking-tight text-[#111111]">
                WooCommerce Live Webhook Simulator
              </h2>
              <p className="text-xs text-[#8d8d8d]">
                Inject raw WooCommerce v3 transaction events through the CRM Adapter
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-[#8d8d8d] hover:text-[#111111] hover:bg-[#f1f0ee] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b15f2c]"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 my-4 bg-[#f1f0ee] p-1 rounded-full border border-[#e6e5e2]">
          <button
            onClick={() => setActiveTab("presets")}
            className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "presets"
                ? "bg-white text-[#111111] shadow-xs"
                : "text-[#8d8d8d] hover:text-[#111111]"
            }`}
          >
            Presets
          </button>
          <button
            onClick={() => setActiveTab("custom")}
            className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "custom"
                ? "bg-white text-[#111111] shadow-xs"
                : "text-[#8d8d8d] hover:text-[#111111]"
            }`}
          >
            Custom Payload
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto pr-1">
          {activeTab === "presets" ? (
            <div className="grid grid-cols-1 gap-3.5">
              {/* Preset 1: Standard Order */}
              <div className="p-4 rounded-[1.25rem] bg-[#f1f0ee] border border-[#e6e5e2] hover:border-[#b15f2c]/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-[#111111]">
                      Standard Order ($89.00)
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white text-[10px] font-mono text-[#8d8d8d] border border-[#e6e5e2]">
                      New Customer
                    </span>
                  </div>
                  <p className="text-xs text-[#8d8d8d]">
                    Routine order ($89.00) creating an entry for a first-time registered shopper.
                  </p>
                </div>
                <button
                  onClick={() => handleDispatchPreset("standard")}
                  data-testid="dispatch-preset-standard"
                  className="pill-btn bg-[#0a0a0a] hover:bg-[#111111] text-white text-xs whitespace-nowrap self-start sm:self-auto"
                >
                  Dispatch Webhook
                </button>
              </div>

              {/* Preset 2: VIP Whale Order */}
              <div className="p-4 rounded-[1.25rem] bg-[#0a0a0a] text-white border border-[#cf8047]/40 shadow-sm hover:border-[#cf8047] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-white">
                      VIP Whale Order ($1,250.00)
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#cf8047]/20 text-[#cf8047] text-[10px] font-mono font-bold border border-[#cf8047]/30">
                      High LTV Whale
                    </span>
                  </div>
                  <p className="text-xs text-[#8d8d8d]">
                    High-value order ($1,250.00) for Victoria Stirling triggering instant VIP Tier & AI Concierge Greeting.
                  </p>
                </div>
                <button
                  onClick={() => handleDispatchPreset("vip_whale")}
                  data-testid="dispatch-preset-vip_whale"
                  className="pill-btn bg-[#b15f2c] hover:bg-[#cf8047] text-white text-xs whitespace-nowrap self-start sm:self-auto font-semibold"
                >
                  Dispatch Webhook
                </button>
              </div>

              {/* Preset 3: Guest Checkout */}
              <div className="p-4 rounded-[1.25rem] bg-[#f1f0ee] border border-emerald-500/30 hover:border-emerald-500 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-[#111111]">
                      Guest Checkout ($145.00)
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-mono font-bold border border-emerald-500/30">
                      customer_id = 0
                    </span>
                  </div>
                  <p className="text-xs text-[#8d8d8d]">
                    Unregistered guest checkout ($145.00 / $120.00) mapped deterministically to Sarah Guest (sarah.guest@example.com).
                  </p>
                </div>
                <button
                  onClick={() => handleDispatchPreset("guest_checkout")}
                  data-testid="dispatch-preset-guest_checkout"
                  className="pill-btn bg-[#0a0a0a] hover:bg-[#111111] text-white text-xs whitespace-nowrap self-start sm:self-auto"
                >
                  Dispatch Webhook
                </button>
              </div>

              {/* Preset 4: Order Cancellation */}
              <div className="p-4 rounded-[1.25rem] bg-[#f1f0ee] border border-rose-500/30 hover:border-rose-500 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-[#111111]">
                      Order Cancellation ($340.00)
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 text-[10px] font-mono font-bold border border-rose-500/30">
                      AI Win-Back
                    </span>
                  </div>
                  <p className="text-xs text-[#8d8d8d]">
                    Order #2004 cancelled ($340.00), triggering the AI recovery agent with promo voucher SAVE15-RECOVER.
                  </p>
                </div>
                <button
                  onClick={() => handleDispatchPreset("cancellation")}
                  data-testid="dispatch-preset-cancellation"
                  className="pill-btn bg-[#0a0a0a] hover:bg-[#111111] text-white text-xs whitespace-nowrap self-start sm:self-auto"
                >
                  Dispatch Webhook
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs text-[#8d8d8d]">
                <span>Edit JSON Webhook Payload</span>
                <span className="font-mono">WooCommerce v3 Schema</span>
              </div>

              <textarea
                value={customJson}
                onChange={(e) => {
                  setCustomJson(e.target.value);
                  setJsonError(null);
                }}
                rows={12}
                className="w-full p-4 rounded-[1rem] bg-[#0a0a0a] text-emerald-400 font-mono text-xs border border-[#e6e5e2] focus:outline-none focus:ring-2 focus:ring-[#b15f2c]"
                placeholder="Enter valid WooCommerce order JSON..."
              />

              {jsonError && (
                <div className="p-3 rounded-[0.875rem] bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{jsonError}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="pill-btn bg-[#f1f0ee] hover:bg-[#e3e2df] text-[#111111] text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendCustomJson}
                  className="pill-btn bg-[#b15f2c] hover:bg-[#cf8047] text-white text-xs flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Custom Webhook</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
