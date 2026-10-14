"use client";

import React, { useState } from "react";
import {
  X,
  Crown,
  Sparkles,
  UserCheck,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Send,
  MessageSquare,
  FileText,
  Clock,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Package,
} from "lucide-react";
import {
  CrmCustomer,
  CrmOrder,
  CommunicationLog,
  CustomerSegment,
} from "../lib/types";

interface CustomerDrawer360Props {
  customer: CrmCustomer | null;
  orders: CrmOrder[];
  communicationLogs: CommunicationLog[];
  onClose: () => void;
  onSendManualMessage: (
    customerId: string,
    channel: "whatsapp" | "email",
    message: string
  ) => void;
}

export function CustomerDrawer360({
  customer,
  orders,
  communicationLogs,
  onClose,
  onSendManualMessage,
}: CustomerDrawer360Props) {
  const [activeTab, setActiveTab] = useState<"orders" | "comms" | "notes">("orders");
  const [manualMessage, setManualMessage] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<"whatsapp" | "email">("whatsapp");
  const [sentNotice, setSentNotice] = useState(false);

  if (!customer) return null;

  const customerOrders = orders.filter((o) => o.customerId === customer.id);
  const customerComms = communicationLogs.filter(
    (c) =>
      c.customerId === customer.id ||
      (c.customerEmail && c.customerEmail.toLowerCase() === customer.email.toLowerCase())
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualMessage.trim()) return;

    onSendManualMessage(customer.id, selectedChannel, manualMessage);
    setManualMessage("");
    setSentNotice(true);
    setTimeout(() => setSentNotice(false), 2000);
  };

  const getSegmentBadge = (segment: CustomerSegment) => {
    switch (segment) {
      case "VIP":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/40 shadow-md shadow-amber-500/10">
            <Crown className="h-3.5 w-3.5 text-amber-400" />
            VIP Patron Tier
          </span>
        );
      case "Repeat":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            Repeat Customer
          </span>
        );
      case "New":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
            New Account
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500/10 text-emerald-300 border-emerald-500/30";
      case "shipped":
        return "bg-purple-500/10 text-purple-300 border-purple-500/30";
      case "processing":
        return "bg-blue-500/10 text-blue-300 border-blue-500/30";
      case "cancelled":
        return "bg-rose-500/10 text-rose-300 border-rose-500/30";
      default:
        return "bg-amber-500/10 text-amber-300 border-amber-500/30";
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="glass-panel-elevated w-screen max-w-2xl border-l border-slate-700/80 p-6 flex flex-col overflow-y-auto animate-in slide-in-from-right duration-300">
          {/* Header & Close */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-slate-800 via-indigo-900 to-indigo-600 border border-indigo-500/30 flex items-center justify-center font-bold text-lg text-white shadow-lg">
                {customer.fullName.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    {customer.fullName}
                  </h2>
                  {getSegmentBadge(customer.segment)}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-indigo-400" />
                    {customer.email}
                  </span>
                  {customer.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-emerald-400" />
                      {customer.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              data-testid="close-customer-drawer"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* KPI Summary Grid */}
          <div className="grid grid-cols-3 gap-3 my-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                <DollarSign className="h-3 w-3 text-indigo-400" /> Lifetime Value (LTV)
              </span>
              <div className="text-lg font-bold text-white mt-1">
                ${(customer.lifetimeValue || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                <Package className="h-3 w-3 text-purple-400" /> Total Orders
              </span>
              <div className="text-lg font-bold text-white mt-1">
                {customer.ordersCount} orders
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                <TrendingUp className="h-3 w-3 text-emerald-400" /> Average Order Value
              </span>
              <div className="text-lg font-bold text-white mt-1">
                ${(customer.averageOrderValue || 0).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Profile Details & Addresses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 text-xs">
              <span className="text-slate-400 font-semibold flex items-center gap-1 mb-1">
                <MapPin className="h-3 w-3 text-cyan-400" /> Shipping Destination
              </span>
              <div className="text-slate-300">
                {customer.shippingAddress?.address_1 ? (
                  <>
                    <p>{customer.shippingAddress.address_1}</p>
                    <p>
                      {customer.shippingAddress.city}, {customer.shippingAddress.state} {customer.shippingAddress.postcode}
                    </p>
                    <p>{customer.shippingAddress.country}</p>
                  </>
                ) : (
                  <p className="text-slate-500 italic">No shipping address recorded</p>
                )}
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 text-xs">
              <span className="text-slate-400 font-semibold flex items-center gap-1 mb-1">
                <Calendar className="h-3 w-3 text-amber-400" /> Customer Timestamps
              </span>
              <div className="text-slate-300 space-y-1">
                <p className="flex justify-between">
                  <span className="text-slate-500">First Purchase:</span>
                  <span>{customer.firstOrderDate ? new Date(customer.firstOrderDate).toLocaleDateString() : "—"}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-500">Latest Purchase:</span>
                  <span>{customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : "—"}</span>
                </p>
                <div className="flex flex-wrap gap-1 mt-1.5 pt-1 border-t border-slate-800">
                  {customer.tags?.map((t) => (
                    <span key={t} className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-slate-300">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs: Order History vs Communication Log vs Notes */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-4">
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === "orders"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Package className="h-3.5 w-3.5" />
              Order Timeline ({customerOrders.length})
            </button>
            <button
              onClick={() => setActiveTab("comms")}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === "comms"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Communication Log ({customerComms.length})
            </button>
            <button
              onClick={() => setActiveTab("notes")}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === "notes"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              Internal Notes
            </button>
          </div>

          {/* Tab Content 1: Orders Timeline */}
          {activeTab === "orders" && (
            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {customerOrders.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs italic">
                  No orders recorded for this customer yet.
                </div>
              ) : (
                customerOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">
                          Order #{ord.wooCommerceOrderId}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getStatusBadge(
                            ord.status
                          )}`}
                        >
                          {ord.status.toUpperCase()}
                        </span>
                      </div>
                      <span className="font-bold text-sm text-indigo-300">
                        ${ord.total.toFixed(2)}
                      </span>
                    </div>

                    {/* Line Items */}
                    <div className="space-y-1 bg-slate-950/60 rounded-lg p-2 text-xs">
                      {ord.lineItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center text-slate-300"
                        >
                          <span>
                            {item.quantity}x {item.name}
                          </span>
                          <span className="font-mono text-slate-400">
                            ${item.total.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>Paid via {ord.paymentMethod}</span>
                      <span>{new Date(ord.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab Content 2: Communication Logs */}
          {activeTab === "comms" && (
            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {customerComms.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs italic">
                  No communications logged yet.
                </div>
              ) : (
                customerComms.map((comm) => (
                  <div
                    key={comm.id}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase border ${
                            comm.channel === "whatsapp"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                          }`}
                        >
                          {comm.channel}
                        </span>
                        {comm.subject && (
                          <span className="font-semibold text-slate-200">
                            {comm.subject}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {new Date(comm.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-slate-300 whitespace-pre-line leading-relaxed">
                      {comm.message}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
                      <span>Event: {comm.eventType}</span>
                      <span className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" />
                        Delivered
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab Content 3: Internal Notes */}
          {activeTab === "notes" && (
            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {customer.notes && customer.notes.length > 0 ? (
                customer.notes.map((note, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5"
                  >
                    <Clock className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                    <p>{note}</p>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-500 text-xs italic">
                  No internal notes recorded.
                </div>
              )}
            </div>
          )}

          {/* Omnichannel Dispatch Footer Box */}
          <div className="mt-4 pt-4 border-t border-slate-800">
            <form onSubmit={handleSend} className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-medium text-slate-300">
                  Concierge Direct Outreach
                </span>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="channel"
                      checked={selectedChannel === "whatsapp"}
                      onChange={() => setSelectedChannel("whatsapp")}
                      className="accent-emerald-500"
                    />
                    <span className="text-emerald-400 text-xs">WhatsApp</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="channel"
                      checked={selectedChannel === "email"}
                      onChange={() => setSelectedChannel("email")}
                      className="accent-indigo-500"
                    />
                    <span className="text-indigo-400 text-xs">Email</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualMessage}
                  onChange={(e) => setManualMessage(e.target.value)}
                  placeholder={`Compose custom ${selectedChannel} message to ${customer.firstName}...`}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-md transition-all cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  Send
                </button>
              </div>

              {sentNotice && (
                <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Message logged and simulated to {selectedChannel}!
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
