"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import {
  CrmCustomer,
  CrmOrder,
  CommunicationLog,
  AiTriageAlert,
  WooCommerceOrderPayload,
  OrderStatus,
  CustomerSegment,
} from "@/lib/types";
import {
  CrmEngine,
  TieredLtvStrategy,
  FrequencyStrategy,
  HybridRfmStrategy,
} from "@/lib/crm-engine";
import {
  INITIAL_CUSTOMERS,
  INITIAL_ORDERS,
  INITIAL_COMM_LOGS,
  INITIAL_TRIAGE_ALERTS,
} from "@/lib/seed-data";

export interface ToastMessage {
  id: string;
  title: string;
  description: string;
  type?: "success" | "info" | "warning" | "error";
}

interface CrmContextType {
  engine: CrmEngine;
  customers: CrmCustomer[];
  orders: CrmOrder[];
  communicationLogs: CommunicationLog[];
  aiAlerts: AiTriageAlert[];
  activeStrategy: string;
  setStrategy: (strategyKey: "tiered_ltv" | "frequency" | "rfm") => void;
  advanceOrderStatus: (orderId: string | number, nextStatus?: OrderStatus) => void;
  cancelOrder: (orderId: string | number, reason?: string) => void;
  ingestWebhook: (payload: WooCommerceOrderPayload) => { order: CrmOrder; customer: CrmCustomer };
  actionTriageAlert: (alertId: string, channel: "whatsapp" | "email") => void;
  addCustomerNote: (customerId: string, note: string) => void;
  sendDirectCustomerMessage: (customerId: string, channel: "email" | "whatsapp", subject: string, body: string) => void;
  toasts: ToastMessage[];
  showToast: (title: string, description: string, type?: ToastMessage["type"]) => void;
  removeToast: (id: string) => void;
  metrics: {
    grossRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    vipCount: number;
    vipRevenueShare: number;
    activePipelineCount: number;
    repeatRate: number;
  };
}

const CrmContext = createContext<CrmContextType | null>(null);

export function CrmProvider({ children }: { children: React.ReactNode }) {
  // Initialize engine once
  const [engine] = useState(() => {
    const e = new CrmEngine();
    e.seed(INITIAL_CUSTOMERS, INITIAL_ORDERS, INITIAL_COMM_LOGS, INITIAL_TRIAGE_ALERTS);
    return e;
  });

  const [customers, setCustomers] = useState<CrmCustomer[]>(() => engine.getAllCustomers());
  const [orders, setOrders] = useState<CrmOrder[]>(() => engine.getAllOrders());
  const [communicationLogs, setCommunicationLogs] = useState<CommunicationLog[]>(() => engine.getCommunicationLogs());
  const [aiAlerts, setAiAlerts] = useState<AiTriageAlert[]>(() => engine.getTriageAlerts());
  const [activeStrategy, setActiveStrategyKey] = useState<string>("tiered_ltv");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((title: string, description: string, type: ToastMessage["type"] = "success") => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const syncStateFromEngine = useCallback(() => {
    setCustomers(engine.getAllCustomers());
    setOrders(engine.getAllOrders());
    setCommunicationLogs(engine.getCommunicationLogs());
    setAiAlerts(engine.getTriageAlerts());
  }, [engine]);

  const setStrategy = useCallback(
    (strategyKey: "tiered_ltv" | "frequency" | "rfm") => {
      let strategy;
      let label = "Tiered Lifetime Value";
      if (strategyKey === "frequency") {
        strategy = new FrequencyStrategy();
        label = "Order Frequency Strategy";
      } else if (strategyKey === "rfm") {
        strategy = new HybridRfmStrategy();
        label = "Hybrid RFM Strategy";
      } else {
        strategy = new TieredLtvStrategy();
      }

      engine.segmentationContext.setStrategy(strategy);
      for (const cust of engine.getAllCustomers()) {
        engine.recalculateCustomerMetrics(cust.id);
      }
      setActiveStrategyKey(strategyKey);
      syncStateFromEngine();
      showToast("Segmentation Strategy Switched", `Switched to: ${label}`, "info");
    },
    [engine, showToast, syncStateFromEngine]
  );

  const resolveOrderId = useCallback((id: string | number): string => {
    const all = engine.getAllOrders();
    const exact = all.find((o) => o.id === String(id) || o.wooCommerceOrderId === Number(id));
    return exact ? exact.id : String(id).startsWith("ord_") ? String(id) : `ord_${id}`;
  }, [engine]);

  const advanceOrderStatus = useCallback(
    (orderIdInput: string | number, nextStatus?: OrderStatus) => {
      const orderId = resolveOrderId(orderIdInput);
      const order = engine.getOrder(orderId);
      if (!order) return;

      let targetStatus: OrderStatus = nextStatus || "completed";
      if (!nextStatus) {
        if (order.status === "pending") targetStatus = "processing";
        else if (order.status === "processing") targetStatus = "shipped";
        else if (order.status === "shipped") targetStatus = "completed";
      }

      const updated = engine.updateOrderStatus(orderId, targetStatus);
      syncStateFromEngine();
      if (updated) {
        showToast(
          "Order Status Transitioned",
          `Order #${updated.wooCommerceOrderId} transitioned to "${targetStatus.toUpperCase()}" for ${updated.customerName}`,
          "success"
        );
      }
    },
    [engine, resolveOrderId, showToast, syncStateFromEngine]
  );

  const cancelOrder = useCallback(
    (orderIdInput: string | number, reason?: string) => {
      const orderId = resolveOrderId(orderIdInput);
      const updated = engine.updateOrderStatus(orderId, "cancelled");
      syncStateFromEngine();
      if (updated) {
        showToast(
          "Order Cancelled",
          `Order #${updated.wooCommerceOrderId} cancelled (${reason || "Customer requested"}). AI Win-back campaign triggered.`,
          "warning"
        );
      }
    },
    [engine, resolveOrderId, showToast, syncStateFromEngine]
  );

  const ingestWebhook = useCallback(
    (payload: WooCommerceOrderPayload) => {
      const result = engine.processWebhook(payload);
      syncStateFromEngine();

      const isGuest = !payload.customer_id || payload.customer_id === 0;
      const guestNote = isGuest ? " (Guest checkout mapped by email)" : "";
      showToast(
        "Ingested WooCommerce Webhook",
        `Order #${payload.id} ($${Number(payload.total).toFixed(2)}) processed for ${result.customer.fullName || result.customer.firstName}${guestNote}.`,
        "success"
      );

      return result;
    },
    [engine, showToast, syncStateFromEngine]
  );

  const actionTriageAlert = useCallback(
    (alertId: string, channel: "whatsapp" | "email") => {
      const alert = engine.getTriageAlerts().find((a) => a.id === alertId);
      if (!alert) return;

      engine.actionTriageAlert(alertId, "actioned");

      // Also append to communication logs
      engine.addManualCommunication({
        orderId: alert.orderId,
        customerId: alert.customerId,
        customerEmail: alert.customerEmail,
        customerName: alert.customerName,
        channel,
        subject: alert.type === "vip_concierge" ? "VIP Private Client Concierge Greeting" : "Order Win-Back Recovery Offer",
        message: alert.recommendedAction || alert.summary,
        status: "sent",
        eventType: "triage:manual_action",
      });

      syncStateFromEngine();
      showToast(
        "AI Action Dispatched",
        `Dispatched ${channel.toUpperCase()} outreach to customer ${alert.customerName || alert.customerEmail}.`,
        "success"
      );
    },
    [engine, showToast, syncStateFromEngine]
  );

  const addCustomerNote = useCallback(
    (customerId: string, note: string) => {
      const customer = engine.getAllCustomers().find(
        (c) => c.id === customerId || c.email.toLowerCase() === customerId.toLowerCase()
      );
      if (customer) {
        customer.notes = customer.notes ? [...customer.notes, note] : [note];
        syncStateFromEngine();
        showToast("Note Added", `Internal note saved for ${customer.fullName}`, "info");
      }
    },
    [engine, showToast, syncStateFromEngine]
  );

  const sendDirectCustomerMessage = useCallback(
    (customerId: string, channel: "email" | "whatsapp", subject: string, body: string) => {
      const customer = engine.getAllCustomers().find(
        (c) => c.id === customerId || c.email.toLowerCase() === customerId.toLowerCase()
      );
      const recipientName = customer?.fullName || customerId;
      const recipientEmail = customer?.email || customerId;

      engine.addManualCommunication({
        orderId: customer?.orderIds?.[0] || "general",
        customerId: customer?.id || customerId,
        customerEmail: recipientEmail,
        customerName: recipientName,
        channel,
        subject,
        message: body,
        status: "sent",
        eventType: "crm:direct_outreach",
      });

      syncStateFromEngine();
      showToast(
        `${channel.toUpperCase()} Sent`,
        `Direct ${channel} outreach logged for ${recipientName}`,
        "success"
      );
    },
    [engine, showToast, syncStateFromEngine]
  );

  const metrics = useMemo(() => {
    const grossRevenue = orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.total, 0);

    const totalOrders = orders.length;
    const totalCustomers = customers.length;
    const vips = customers.filter((c) => c.segment === "VIP");
    const vipCount = vips.length;
    const vipRevenue = vips.reduce((sum, c) => sum + c.lifetimeValue, 0);
    const vipRevenueShare = grossRevenue > 0 ? (vipRevenue / grossRevenue) * 100 : 0;
    const activePipelineCount = orders.filter((o) => ["pending", "processing", "shipped"].includes(o.status)).length;

    const repeatCustomers = customers.filter((c) => c.ordersCount > 1).length;
    const repeatRate = totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;

    return {
      grossRevenue,
      totalOrders,
      totalCustomers,
      vipCount,
      vipRevenueShare,
      activePipelineCount,
      repeatRate,
    };
  }, [customers, orders]);

  return (
    <CrmContext.Provider
      value={{
        engine,
        customers,
        orders,
        communicationLogs,
        aiAlerts,
        activeStrategy,
        setStrategy,
        advanceOrderStatus,
        cancelOrder,
        ingestWebhook,
        actionTriageAlert,
        addCustomerNote,
        sendDirectCustomerMessage,
        toasts,
        showToast,
        removeToast,
        metrics,
      }}
    >
      {children}
    </CrmContext.Provider>
  );
}

export function useCrm() {
  const context = useContext(CrmContext);
  if (!context) {
    throw new Error("useCrm must be used within a CrmProvider");
  }
  return context;
}
