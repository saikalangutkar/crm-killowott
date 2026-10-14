"use client";

import React, { useState } from "react";
import { X, Zap, Code, Send, CheckCircle2, AlertTriangle, Sparkles, UserX, Crown, ShoppingCart } from "lucide-react";
import { WooCommerceOrderPayload } from "../lib/types";
import { WEBHOOK_PRESETS } from "../lib/seed-data";

interface WebhookSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDispatch: (payload: WooCommerceOrderPayload) => void;
}

export function WebhookSimulatorModal({
  isOpen,
  onClose,
  onDispatch,
}: WebhookSimulatorModalProps) {
  const [activeTab, setActiveTab] = useState<"presets" | "custom">("presets");
  const [selectedPresetId, setSelectedPresetId] = useState<string>("vip_whale");
  const [customJson, setCustomJson] = useState<string>(
    JSON.stringify(WEBHOOK_PRESETS[1].payload, null, 2)
  );
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDispatchPreset = (presetPayload: WooCommerceOrderPayload, presetTitle: string) => {
    // Generate fresh timestamp and unique ID so repeated clicks simulate new live transactions
    const uniqueId = Math.floor(2000 + Math.random() * 8000);
    const freshPayload: WooCommerceOrderPayload = {
      ...presetPayload,
      id: uniqueId,
      date_created: new Date().toISOString(),
      date_modified: new Date().toISOString(),
    };

    onDispatch(freshPayload);
    setDispatchSuccess(`Dispatched: ${presetTitle} (Order #${uniqueId})`);
    setTimeout(() => {
      setDispatchSuccess(null);
      onClose();
    }, 700);
  };

  const handleDispatchCustom = () => {
    try {
      setJsonError(null);
      const parsed = JSON.parse(customJson) as WooCommerceOrderPayload;
      if (!parsed.id) {
        parsed.id = Math.floor(2000 + Math.random() * 8000);
      }
      onDispatch(parsed);
      setDispatchSuccess(`Dispatched custom payload (Order #${parsed.id})`);
      setTimeout(() => {
        setDispatchSuccess(null);
        onClose();
      }, 700);
    } catch (err: unknown) {
      setJsonError(err instanceof Error ? err.message : "Invalid JSON syntax");
    }
  };

  const getPresetIcon = (id: string) => {
    switch (id) {
      case "vip_whale":
        return <Crown className="h-5 w-5 text-amber-400" />;
      case "guest_checkout":
        return <UserX className="h-5 w-5 text-emerald-400" />;
      case "cancellation":
        return <AlertTriangle className="h-5 w-5 text-rose-400" />;
      default:
        return <ShoppingCart className="h-5 w-5 text-blue-400" />;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="glass-panel-elevated w-full max-w-2xl rounded-2xl border border-slate-700/80 p-6 relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Zap className="h-5 w-5 fill-current" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                WooCommerce Live Webhook Simulator
              </h2>
              <p className="text-xs text-slate-400">
                Trigger real-time WooCommerce transaction events into the CRM Adapter & Observer pipeline
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-2 mt-4 mb-4">
          <button
            onClick={() => setActiveTab("presets")}
            className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === "presets"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Live Demo Presets
          </button>
          <button
            onClick={() => setActiveTab("custom")}
            className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === "custom"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <Code className="h-3.5 w-3.5" />
            Custom JSON Payload
          </button>
        </div>

        {/* Success toast inside modal */}
        {dispatchSuccess && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{dispatchSuccess}</span>
          </div>
        )}

        {/* Tab 1: Presets */}
        {activeTab === "presets" ? (
          <div className="space-y-3 overflow-y-auto pr-1 flex-1">
            {WEBHOOK_PRESETS.map((preset) => (
              <div
                key={preset.id}
                onClick={() => setSelectedPresetId(preset.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                  selectedPresetId === preset.id
                    ? "bg-slate-800/90 border-indigo-500/60 ring-1 ring-indigo-500/30"
                    : "bg-slate-900/50 border-slate-800/80 hover:bg-slate-800/40"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 mt-0.5">
                    {getPresetIcon(preset.id)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">
                        {preset.title}
                      </span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${preset.badgeColor}`}>
                        {preset.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {preset.description}
                    </p>
                    <div className="mt-1.5 flex items-center gap-3 text-[11px] text-slate-500">
                      <span>Total: ${preset.payload.total}</span>
                      <span>•</span>
                      <span>Customer: {preset.payload.billing.first_name} {preset.payload.billing.last_name}</span>
                      <span>•</span>
                      <span>Email: {preset.payload.billing.email}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDispatchPreset(preset.payload, preset.title);
                  }}
                  data-testid={`dispatch-preset-${preset.id}`}
                  className="flex items-center gap-1.5 shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow transition-all cursor-pointer"
                >
                  <Send className="h-3 w-3" />
                  Trigger
                </button>
              </div>
            ))}
          </div>
        ) : (
          /* Tab 2: Custom JSON */
          <div className="flex flex-col flex-1 gap-3 overflow-hidden">
            <p className="text-xs text-slate-400">
              Paste or modify raw WooCommerce webhook JSON payload. The <code className="text-indigo-300">WooCommerceAdapter</code> will normalize it into the CRM domain model:
            </p>
            <div className="relative flex-1">
              <textarea
                value={customJson}
                onChange={(e) => setCustomJson(e.target.value)}
                className="w-full h-64 bg-slate-950 font-mono text-xs text-slate-200 border border-slate-800 rounded-xl p-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                placeholder="Enter valid JSON..."
              />
            </div>
            {jsonError && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span>{jsonError}</span>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() =>
                  setCustomJson(JSON.stringify(WEBHOOK_PRESETS[2].payload, null, 2))
                }
                className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 cursor-pointer"
              >
                Load Guest Checkout Template
              </button>
              <button
                onClick={handleDispatchCustom}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-md transition-all cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                Dispatch Custom Webhook
              </button>
            </div>
          </div>
        )}

        {/* Footer info note */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span>Adapter Normalization: customer_id = 0 mapped by billing.email</span>
          <span>Observer Pattern automatically triggers AI Triage & Comms</span>
        </div>
      </div>
    </div>
  );
}
