"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  CrmEngine,
  TieredLtvStrategy,
  FrequencyStrategy,
  HybridRfmStrategy,
} from "../lib/crm-engine";
import {
  INITIAL_CUSTOMERS,
  INITIAL_ORDERS,
  INITIAL_COMM_LOGS,
  INITIAL_TRIAGE_ALERTS,
} from "../lib/seed-data";
import {
  CrmCustomer,
  CrmOrder,
  CommunicationLog,
  AiTriageAlert,
  OrderStatus,
  WooCommerceOrderPayload,
} from "../lib/types";
import { Header } from "../components/Header";
import { MetricCards } from "../components/MetricCards";
import { WebhookSimulatorModal } from "../components/WebhookSimulatorModal";
import { OrderPipeline } from "../components/OrderPipeline";
import { CustomerTable } from "../components/CustomerTable";
import { CustomerDrawer360 } from "../components/CustomerDrawer360";
import { AiTriageCenter } from "../components/AiTriageCenter";
import { CommunicationFeed } from "../components/CommunicationFeed";
import { AiCopilotDrawer } from "../components/AiCopilotDrawer";
import {
  PackageCheck,
  Users,
  Bot,
  MessageSquare,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export default function Home() {
  // Initialize singleton engine instance
  const engine = useMemo(() => {
    const inst = new CrmEngine();
    inst.seed(
      INITIAL_CUSTOMERS,
      INITIAL_ORDERS,
      INITIAL_COMM_LOGS,
      INITIAL_TRIAGE_ALERTS
    );
    return inst;
  }, []);

  // Reactive state synced with engine
  const [customers, setCustomers] = useState<CrmCustomer[]>([]);
  const [orders, setOrders] = useState<CrmOrder[]>([]);
  const [commLogs, setCommLogs] = useState<CommunicationLog[]>([]);
  const [triageAlerts, setTriageAlerts] = useState<AiTriageAlert[]>([]);
  const [activeStrategyKey, setActiveStrategyKey] = useState<string>("ltv");
  const [webhookCount, setWebhookCount] = useState<number>(4);

  // UI Navigation & Modals
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CrmCustomer | null>(null);
  const [mainView, setMainView] = useState<"pipeline" | "customers" | "triage" | "comms">("pipeline");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state from engine
  const refreshState = () => {
    setCustomers(engine.getAllCustomers());
    setOrders(engine.getAllOrders());
    setCommLogs(engine.getCommunicationLogs());
    setTriageAlerts(engine.getTriageAlerts());

    // If drawer is open, refresh selected customer data
    if (selectedCustomer) {
      const refreshed = engine.getCustomer(selectedCustomer.id);
      if (refreshed) setSelectedCustomer(refreshed);
    }
  };

  useEffect(() => {
    refreshState();
  }, [engine]);

  // Handle Strategy Selection (Strategy Pattern)
  const handleChangeStrategy = (strategyKey: string) => {
    setActiveStrategyKey(strategyKey);
    if (strategyKey === "frequency") {
      engine.segmentationContext.setStrategy(new FrequencyStrategy());
    } else if (strategyKey === "rfm") {
      engine.segmentationContext.setStrategy(new HybridRfmStrategy());
    } else {
      engine.segmentationContext.setStrategy(new TieredLtvStrategy());
    }

    // Re-evaluate all customer segments
    for (const c of engine.getAllCustomers()) {
      engine.recalculateCustomerMetrics(c.id);
    }

    refreshState();
    triggerToast(`Switched to: ${engine.segmentationContext.getStrategy().name}`);
  };

  // Toast Helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 4000);
  };

  // Webhook Simulator Dispatch
  const handleDispatchWebhook = (payload: WooCommerceOrderPayload) => {
    const isGuest = !payload.customer_id || payload.customer_id === 0;
    const res = engine.processWebhook(payload);
    setWebhookCount((prev) => prev + 1);
    refreshState();

    const guestNotice = isGuest ? " (Guest checkout mapped by email)" : "";
    triggerToast(
      `Ingested WooCommerce Webhook: Order #${res.order.wooCommerceOrderId} ($${res.order.total.toFixed(2)}) for ${res.customer.fullName}${guestNotice}`
    );
  };

  // Interactive Pipeline Status Advancement
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    const updated = engine.updateOrderStatus(orderId, newStatus);
    refreshState();
    if (updated) {
      triggerToast(
        `Order #${updated.wooCommerceOrderId} transitioned to "${newStatus.toUpperCase()}"`
      );
    }
  };

  // AI Triage Action Approval
  const handleActionTriageAlert = (alert: AiTriageAlert) => {
    engine.actionTriageAlert(alert.id, "actioned");

    // Dispatch simulated communication to customer
    engine.addManualCommunication({
      orderId: alert.orderId,
      customerId: alert.customerId,
      customerEmail: alert.customerEmail,
      customerName: alert.customerName,
      channel: alert.suggestedMessage.channel,
      subject: alert.suggestedMessage.subject,
      message: alert.suggestedMessage.body,
      status: "delivered",
      eventType: alert.type === "vip_concierge" ? "ai:vip_concierge_dispatched" : "ai:win_back_dispatched",
    });

    refreshState();
    triggerToast(
      `AI Action Dispatched: Sent ${alert.suggestedMessage.channel.toUpperCase()} outreach to ${alert.customerName}`
    );
  };

  // AI Triage Alert Dismissal
  const handleDismissTriageAlert = (alertId: string) => {
    engine.actionTriageAlert(alertId, "dismissed");
    refreshState();
    triggerToast("AI triage alert dismissed.");
  };

  // Customer Drawer Selection by ID
  const handleSelectCustomerById = (customerId: string) => {
    const cust = engine.getCustomer(customerId);
    if (cust) {
      setSelectedCustomer(cust);
    }
  };

  // Manual Outreach from Drawer
  const handleSendManualMessage = (
    customerId: string,
    channel: "whatsapp" | "email",
    message: string
  ) => {
    const cust = engine.getCustomer(customerId);
    if (!cust) return;

    engine.addManualCommunication({
      orderId: cust.orderIds[cust.orderIds.length - 1] || "general",
      customerId: cust.id,
      customerEmail: cust.email,
      customerName: cust.fullName,
      channel,
      subject: channel === "email" ? "A note from your Kilowott Concierge" : undefined,
      message,
      status: "delivered",
      eventType: "concierge:manual_outreach",
    });

    refreshState();
    triggerToast(`Sent manual ${channel.toUpperCase()} message to ${cust.fullName}`);
  };

  const pendingTriageCount = triageAlerts.filter((a) => a.status === "pending").length;

  return (
    <div className="min-h-screen flex flex-col bg-[#080c14] text-slate-100">
      {/* Executive Header */}
      <Header
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        activeStrategy={activeStrategyKey}
        onChangeStrategy={handleChangeStrategy}
        webhookCount={webhookCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className="p-3 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-200 text-xs flex items-center justify-between shadow-lg shadow-indigo-950/50 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
              <span className="font-medium">{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-indigo-400 hover:text-white text-xs px-2 py-0.5 rounded cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Real-time Financial & Customer Metric KPI Cards */}
        <MetricCards customers={customers} orders={orders} />

        {/* View Switcher Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setMainView("pipeline")}
              className={`flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                mainView === "pipeline"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-400/30"
                  : "bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <PackageCheck className="h-4 w-4" />
              Order Pipeline Kanban
              <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-[10px]">
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setMainView("customers")}
              className={`flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                mainView === "customers"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-400/30"
                  : "bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <Users className="h-4 w-4" />
              360° Customer Directory
              <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-[10px]">
                {customers.length}
              </span>
            </button>

            <button
              onClick={() => setMainView("triage")}
              className={`flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                mainView === "triage"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-400/30"
                  : "bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <Bot className="h-4 w-4" />
              AI Agent Triage Center
              {pendingTriageCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-extrabold text-[10px] animate-pulse">
                  {pendingTriageCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMainView("comms")}
              className={`flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                mainView === "comms"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-400/30"
                  : "bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              Omnichannel Log Feed
              <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-[10px]">
                {commLogs.length}
              </span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>360° Synchronized CRM</span>
          </div>
        </div>

        {/* View Content Panels */}
        {mainView === "pipeline" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <OrderPipeline
              orders={orders}
              onUpdateStatus={handleUpdateOrderStatus}
              onSelectCustomerById={handleSelectCustomerById}
            />

            {/* Quick mini-summary of customers below pipeline */}
            <div className="pt-4">
              <CustomerTable
                customers={customers}
                onSelectCustomer={(cust) => setSelectedCustomer(cust)}
              />
            </div>
          </div>
        )}

        {mainView === "customers" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <CustomerTable
              customers={customers}
              onSelectCustomer={(cust) => setSelectedCustomer(cust)}
            />
          </div>
        )}

        {mainView === "triage" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
            <div className="lg:col-span-2">
              <AiTriageCenter
                alerts={triageAlerts}
                onActionAlert={handleActionTriageAlert}
                onDismissAlert={handleDismissTriageAlert}
                onSelectCustomerById={handleSelectCustomerById}
              />
            </div>
            <div className="lg:col-span-1">
              <CommunicationFeed logs={commLogs} />
            </div>
          </div>
        )}

        {mainView === "comms" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
            <div className="lg:col-span-2">
              <CommunicationFeed logs={commLogs} />
            </div>
            <div className="lg:col-span-1">
              <AiTriageCenter
                alerts={triageAlerts}
                onActionAlert={handleActionTriageAlert}
                onDismissAlert={handleDismissTriageAlert}
                onSelectCustomerById={handleSelectCustomerById}
              />
            </div>
          </div>
        )}
      </main>

      {/* 360° Customer Drawer */}
      <CustomerDrawer360
        customer={selectedCustomer}
        orders={orders}
        communicationLogs={commLogs}
        onClose={() => setSelectedCustomer(null)}
        onSendManualMessage={handleSendManualMessage}
      />

      {/* Webhook Simulator Modal */}
      <WebhookSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onDispatch={handleDispatchWebhook}
      />

      {/* Interactive AI CRM Copilot Drawer */}
      <AiCopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        customers={customers}
        orders={orders}
        alerts={triageAlerts}
        logs={commLogs}
        onSelectCustomerById={handleSelectCustomerById}
      />

      {/* Floating AI Copilot Trigger Button */}
      <button
        onClick={() => setIsCopilotOpen(true)}
        data-testid="open-copilot-button"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 text-white font-bold text-xs px-4 py-3 rounded-full shadow-2xl shadow-indigo-600/50 hover:shadow-indigo-500/80 ring-2 ring-white/20 transition-all transform hover:-translate-y-1 active:translate-y-0 cursor-pointer group"
      >
        <Bot className="h-4 w-4 group-hover:scale-110 transition-transform" />
        <span>Ask AI Copilot</span>
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
      </button>
    </div>
  );
}
