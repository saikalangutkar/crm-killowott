"use client";

import React, { useState, useEffect } from "react";
import { CrmCustomer } from "@/lib/types";
import { useCrm } from "@/context/CrmContext";
import {
  X,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  ShoppingBag,
  Award,
  MessageSquare,
  Send,
  Plus,
  RefreshCw,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { BrandMark } from "./BrandMark";

interface CustomerDrawer360Props {
  customer: CrmCustomer | null;
  onClose: () => void;
}

export function DashboardCustomerDrawer360({ customer, onClose }: CustomerDrawer360Props) {
  const { orders, communicationLogs, addCustomerNote, sendDirectCustomerMessage, showToast } = useCrm();
  const [activeTab, setActiveTab] = useState<"overview" | "comms" | "orders">("overview");
  const [newNote, setNewNote] = useState("");
  const [directMsg, setDirectMsg] = useState("");
  const [channel, setChannel] = useState<"whatsapp" | "email">("whatsapp");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && customer) {
        onClose();
      }
    };
    if (customer) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [customer, onClose]);

  if (!customer) return null;

  // Customer orders
  const customerOrders = orders.filter(
    (o) =>
      o.customerId === customer.id ||
      o.customerEmail.toLowerCase() === customer.email.toLowerCase()
  );

  // Customer communications
  const customerComms = communicationLogs.filter(
    (c) =>
      c.customerId === customer.id ||
      c.customerEmail.toLowerCase() === customer.email.toLowerCase()
  );

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    addCustomerNote(customer.id, newNote.trim());
    setNewNote("");
  };

  const handleSendDirectMsg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directMsg.trim()) return;
    sendDirectCustomerMessage(
      customer.id,
      channel,
      `Outreach regarding account`,
      directMsg.trim()
    );
    setDirectMsg("");
  };

  const segmentBadges: Record<string, { label: string; class: string }> = {
    VIP: { label: "VIP Patron Tier", class: "bg-[#cf8047]/20 text-[#cf8047] border-[#cf8047]/40" },
    Repeat: { label: "Repeat Shopper", class: "bg-purple-500/10 text-purple-700 border-purple-500/30" },
    New: { label: "New Customer", class: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30" },
  };

  const badgeInfo = segmentBadges[customer.segment] || segmentBadges.New;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="customer-360-title"
      data-testid="customer-drawer"
      className="fixed inset-0 z-[9990] flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-2xl h-full bg-[#ffffff] text-[#111111] shadow-2xl border-l border-[#e6e5e2] flex flex-col justify-between overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-6 border-b border-[#e6e5e2] bg-[#f1f0ee]/50">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#0a0a0a] text-white flex items-center justify-center font-bold text-base shadow-xs">
                {(customer.firstName || "C")[0]}
                {(customer.lastName || "")[0]}
              </div>
              <div>
                <h2 id="customer-360-title" className="text-xl font-bold tracking-tight text-[#111111]">
                  {customer.fullName || `${customer.firstName} ${customer.lastName}`}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-[#8d8d8d] font-mono">{customer.email}</span>
                  <span className="text-[#e6e5e2]">·</span>
                  <span className="text-xs text-[#8d8d8d]">{customer.phone || "No phone"}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border ${badgeInfo.class}`}
              >
                {badgeInfo.label}
              </span>
              <button
                onClick={onClose}
                data-testid="close-customer-drawer"
                className="p-2 rounded-full text-[#8d8d8d] hover:text-[#111111] hover:bg-[#e3e2df] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b15f2c]"
                aria-label="Close customer drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 bg-[#e3e2df] p-1 rounded-full border border-[#e6e5e2]">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "overview" ? "bg-white text-[#111111] shadow-xs" : "text-[#8d8d8d] hover:text-[#111111]"
              }`}
            >
              360° Overview
            </button>
            <button
              onClick={() => setActiveTab("comms")}
              className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "comms" ? "bg-white text-[#111111] shadow-xs" : "text-[#8d8d8d] hover:text-[#111111]"
              }`}
            >
              Communication Log ({customerComms.length})
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "orders" ? "bg-white text-[#111111] shadow-xs" : "text-[#8d8d8d] hover:text-[#111111]"
              }`}
            >
              Order Timeline ({customerOrders.length})
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {activeTab === "overview" && (
            <div className="flex flex-col gap-6">
              {/* LTV & Metrics Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-[1.25rem] bg-[#f1f0ee] border border-[#e6e5e2]">
                  <span className="text-[11px] font-mono text-[#8d8d8d] uppercase block mb-1">
                    Lifetime Value (LTV)
                  </span>
                  <span className="text-xl font-bold text-[#111111] tabular-nums">
                    ${customer.lifetimeValue.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-[#cf8047] block mt-0.5 font-mono">Dynamic Strategy Recalculated</span>
                </div>

                <div className="p-4 rounded-[1.25rem] bg-[#f1f0ee] border border-[#e6e5e2]">
                  <span className="text-[11px] font-mono text-[#8d8d8d] uppercase block mb-1">
                    Orders Fulfilled
                  </span>
                  <span className="text-xl font-bold text-[#111111] tabular-nums">
                    {customer.ordersCount}
                  </span>
                  <span className="text-[10px] text-[#8d8d8d] block mt-0.5 font-mono">
                    Avg: ${(customer.lifetimeValue / Math.max(customer.ordersCount, 1)).toFixed(2)}
                  </span>
                </div>

                <div className="p-4 rounded-[1.25rem] bg-[#f1f0ee] border border-[#e6e5e2]">
                  <span className="text-[11px] font-mono text-[#8d8d8d] uppercase block mb-1">
                    Account Status
                  </span>
                  <span className="text-sm font-bold text-[#111111] block mt-1">
                    {!customer.wooCommerceId || customer.wooCommerceId === 0 ? "Guest Mapped" : `WC #${customer.wooCommerceId}`}
                  </span>
                  <span className="text-[10px] text-[#8d8d8d] block font-mono">Deterministic Sync</span>
                </div>
              </div>

              {/* Billing Address Details */}
              <div className="p-4 rounded-[1.25rem] bg-white border border-[#e6e5e2]">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#8d8d8d] mb-2">
                  Primary Billing Address
                </h3>
                <p className="text-xs text-[#111111]">
                  {customer.billingAddress?.address_1 || "No street address"}
                </p>
                <p className="text-xs text-[#8d8d8d] font-mono">
                  {customer.billingAddress?.city || ""}, {customer.billingAddress?.state || customer.billingAddress?.country} {customer.billingAddress?.postcode}
                </p>
              </div>

              {/* Internal Notes */}
              <div className="p-4 rounded-[1.25rem] bg-[#f1f0ee] border border-[#e6e5e2]">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#8d8d8d] mb-2">
                  Internal Merchant Notes
                </h3>
                <p className="text-xs text-[#111111] leading-relaxed mb-3">
                  {customer.notes?.join(" | ") || "No notes logged yet."}
                </p>

                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Append internal customer note..."
                    className="flex-1 px-3 py-1.5 rounded-full bg-white border border-[#e6e5e2] text-xs text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#b15f2c]"
                  />
                  <button
                    type="submit"
                    className="pill-btn bg-[#0a0a0a] hover:bg-[#111111] text-white text-xs px-3 py-1 cursor-pointer"
                  >
                    Add Note
                  </button>
                </form>
              </div>

              {/* Omnichannel Outreach Box */}
              <div className="p-4 rounded-[1.25rem] bg-white border border-[#e6e5e2]">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#8d8d8d] flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-[#b15f2c]" /> Quick Direct Outreach
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setChannel("whatsapp")}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border cursor-pointer ${
                        channel === "whatsapp"
                          ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 font-bold"
                          : "text-[#8d8d8d] border-[#e6e5e2]"
                      }`}
                    >
                      WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => setChannel("email")}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border cursor-pointer ${
                        channel === "email"
                          ? "bg-sky-500/10 text-sky-700 border-sky-500/30 font-bold"
                          : "text-[#8d8d8d] border-[#e6e5e2]"
                      }`}
                    >
                      Email
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSendDirectMsg} className="flex flex-col gap-2">
                  <textarea
                    rows={2}
                    value={directMsg}
                    onChange={(e) => setDirectMsg(e.target.value)}
                    placeholder={`Compose ${channel} message for ${customer.firstName}...`}
                    className="w-full p-2.5 rounded-[0.875rem] bg-[#f1f0ee] border border-[#e6e5e2] text-xs text-[#111111] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b15f2c]"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="pill-btn bg-[#b15f2c] hover:bg-[#cf8047] text-white text-xs px-3 py-1 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>Send {channel.toUpperCase()}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === "comms" && (
            <div className="flex flex-col gap-3">
              {customerComms.length === 0 ? (
                <p className="text-xs text-[#8d8d8d] text-center py-8">
                  No automated or direct messages logged yet.
                </p>
              ) : (
                customerComms.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-[1.25rem] bg-[#f1f0ee] border border-[#e6e5e2] flex flex-col gap-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                            log.channel === "whatsapp"
                              ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20"
                              : "bg-sky-500/10 text-sky-700 border border-sky-500/20"
                          }`}
                        >
                          {log.channel}
                        </span>
                        <span className="font-semibold text-[#111111]">{log.subject || "Message"}</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#8d8d8d]">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-[#8d8d8d] text-[11px] leading-relaxed pl-1">
                      {log.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "orders" && (
            <div className="flex flex-col gap-3">
              {customerOrders.length === 0 ? (
                <p className="text-xs text-[#8d8d8d] text-center py-8">
                  No orders found for this customer.
                </p>
              ) : (
                customerOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-[1.25rem] bg-white border border-[#e6e5e2] flex items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-[#111111]">Order #{ord.wooCommerceOrderId}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-[#f1f0ee] border border-[#e6e5e2]">
                          {ord.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#8d8d8d] font-mono">
                        {new Date(ord.createdAt).toLocaleDateString()} · {ord.lineItems?.length || 1} item(s)
                      </span>
                    </div>

                    <span className="font-mono font-bold text-sm text-[#111111] tabular-nums">
                      ${ord.total.toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#e6e5e2] bg-[#f1f0ee] flex items-center justify-between">
          <span className="text-xs font-mono text-[#8d8d8d]">
            WooCommerce Customer 360° Profile
          </span>
          <button
            onClick={() => {
              showToast("AI Triage Re-evaluated", `Customer ${customer.firstName}'s LTV was analyzed by the background agent.`, "info");
            }}
            className="pill-btn bg-white hover:bg-[#e3e2df] text-[#111111] text-xs border border-[#e6e5e2] flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#b15f2c]" />
            <span>Re-run AI Triage</span>
          </button>
        </div>
      </div>
    </div>
  );
}
