import {
  CrmCustomer,
  CrmOrder,
  AiTriageAlert,
  CommunicationLog,
} from "./types";

export interface CopilotMessage {
  id: string;
  sender: "user" | "copilot";
  text: string;
  timestamp: string;
  dataPoints?: {
    label: string;
    value: string | number;
    badgeColor?: string;
  }[];
  suggestedActions?: {
    label: string;
    actionType: "open_customer" | "dispatch_comm";
    targetId?: string;
  }[];
}

/**
 * Intelligent CRM Copilot Reasoning Engine
 * Evaluates queries against live customer, order, and triage state.
 */
export class CrmCopilotEngine {
  /**
   * Processes a user's natural language question and generates an analytical answer.
   */
  public answerQuery(
    query: string,
    context: {
      customers: CrmCustomer[];
      orders: CrmOrder[];
      alerts: AiTriageAlert[];
      logs: CommunicationLog[];
    }
  ): CopilotMessage {
    const q = query.toLowerCase().trim();
    const id = `copilot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const timestamp = new Date().toISOString();

    // 1. VIP Query (e.g. "top vip", "vip customers", "whales")
    if (q.includes("vip") || q.includes("top customer") || q.includes("highest spend")) {
      const vips = context.customers
        .filter((c) => c.segment === "VIP" || c.lifetimeValue >= 500)
        .sort((a, b) => b.lifetimeValue - a.lifetimeValue);

      const totalVipSpend = vips.reduce((sum, c) => sum + c.lifetimeValue, 0);

      const vipList = vips
        .map(
          (c, idx) =>
            `${idx + 1}. **${c.fullName}** (${c.email}) — LTV: **$${c.lifetimeValue.toFixed(
              2
            )}** across ${c.ordersCount} orders`
        )
        .join("\n");

      return {
        id,
        sender: "copilot",
        text: `Here is the current VIP patron overview:\n\n${vipList}\n\n**Total VIP Cumulative Spend**: $${totalVipSpend.toFixed(
          2
        )} (${vips.length} VIP patrons currently active).`,
        timestamp,
        dataPoints: [
          { label: "VIP Count", value: vips.length, badgeColor: "text-amber-400" },
          {
            label: "VIP Spend",
            value: `$${totalVipSpend.toFixed(0)}`,
            badgeColor: "text-emerald-400",
          },
        ],
        suggestedActions: vips.slice(0, 2).map((c) => ({
          label: `View ${c.firstName}'s 360° Profile`,
          actionType: "open_customer",
          targetId: c.id,
        })),
      };
    }

    // 2. Pending / Processing Orders Query (e.g. "pending", "pipeline", "fulfillment")
    if (q.includes("pending") || q.includes("processing") || q.includes("unfulfilled") || q.includes("orders")) {
      const pendingOrders = context.orders.filter((o) => o.status === "pending");
      const processingOrders = context.orders.filter((o) => o.status === "processing");
      const totalPendingVolume = pendingOrders.reduce((sum, o) => sum + o.total, 0);

      const pendingDetails = pendingOrders
        .map(
          (o) =>
            `• Order **#${o.wooCommerceOrderId}** by ${o.customerName} for **$${o.total.toFixed(
              2
            )}** (Payment: ${o.paymentMethod})`
        )
        .join("\n");

      return {
        id,
        sender: "copilot",
        text: `We currently have **${pendingOrders.length} pending orders** ($${totalPendingVolume.toFixed(
          2
        )} in payment authorization) and **${processingOrders.length} orders in active fulfillment**.\n\n${
          pendingDetails || "All pending orders have been cleared!"
        }`,
        timestamp,
        dataPoints: [
          { label: "Pending", value: pendingOrders.length, badgeColor: "text-amber-400" },
          { label: "Processing", value: processingOrders.length, badgeColor: "text-blue-400" },
          {
            label: "Pending Volume",
            value: `$${totalPendingVolume.toFixed(2)}`,
            badgeColor: "text-slate-300",
          },
        ],
      };
    }

    // 3. Win-Back / Recovery / Cancelled Query (e.g. "recovery", "cancelled", "win-back", "coupon")
    if (q.includes("recovery") || q.includes("cancel") || q.includes("win back") || q.includes("discount")) {
      const cancelledOrders = context.orders.filter((o) => o.status === "cancelled");
      const recoveryAlerts = context.alerts.filter((a) => a.type === "cancellation_recovery");
      const totalLost = cancelledOrders.reduce((sum, o) => sum + o.total, 0);

      return {
        id,
        sender: "copilot",
        text: `Analysis of Order Cancellations & Win-Back Campaigns:\n\n• **${cancelledOrders.length} orders cancelled** representing $${totalLost.toFixed(
          2
        )} in abandoned gross volume.\n• **${
          recoveryAlerts.length
        } AI Win-Back recovery campaigns** have been formulated with dynamic 15–20% discount vouchers (e.g. \`COMEBACK-1077\`).\n• Recommendation: Expedite recovery email dispatches within 2 hours of checkout abandonment to capture up to 18.4% conversion recovery.`,
        timestamp,
        dataPoints: [
          { label: "Cancelled", value: cancelledOrders.length, badgeColor: "text-rose-400" },
          {
            label: "Recovery Campaigns",
            value: recoveryAlerts.length,
            badgeColor: "text-indigo-400",
          },
        ],
      };
    }

    // 4. Draft Outreach / Message Query (e.g. "draft", "write message", "thank you", "elena", "marcus")
    if (q.includes("draft") || q.includes("write") || q.includes("message") || q.includes("greeting")) {
      const targetCustomer =
        context.customers.find(
          (c) =>
            q.includes(c.firstName.toLowerCase()) ||
            q.includes(c.lastName.toLowerCase()) ||
            q.includes(c.email.toLowerCase())
        ) || context.customers[0];

      const copy = `Hello ${targetCustomer?.firstName || "valued customer"}, this is your dedicated concierge at Kilowott. We deeply appreciate your continued patronage (${targetCustomer?.segment} tier). We're curating exclusive preview allocations for our upcoming collection and wanted to offer you early private access. Let us know if you'd like us to reserve a piece for you!`;

      return {
        id,
        sender: "copilot",
        text: `Here is a personalized outreach draft for **${targetCustomer?.fullName}** (${targetCustomer?.segment} Tier):\n\n> *"${copy}"*\n\nChannel: **WhatsApp Concierge** • Tone: **Warm, Exclusive, Professional**.`,
        timestamp,
        dataPoints: [
          { label: "Customer", value: targetCustomer?.fullName || "General", badgeColor: "text-indigo-300" },
          { label: "Channel", value: "WhatsApp", badgeColor: "text-emerald-400" },
        ],
        suggestedActions: [
          {
            label: `Open ${targetCustomer?.firstName}'s 360° Drawer to Send`,
            actionType: "open_customer",
            targetId: targetCustomer?.id,
          },
        ],
      };
    }

    // 5. Default General Summary
    const totalRev = context.orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.total, 0);

    return {
      id,
      sender: "copilot",
      text: `Kilowott CRM Health Summary:\n\n• **Gross Revenue**: $${totalRev.toFixed(
        2
      )} across ${context.orders.length} orders\n• **Customer Base**: ${
        context.customers.length
      } accounts managed (with automatic guest checkout deduplication)\n• **AI Triage Alerts**: ${
        context.alerts.filter((a) => a.status === "pending").length
      } pending action\n• **Communication Logs**: ${
        context.logs.length
      } automated WhatsApp & Email messages delivered.\n\nYou can ask me about top VIPs, pipeline order bottlenecks, cancellation recovery strategies, or ask me to draft personalized outreach!`,
      timestamp,
      dataPoints: [
        { label: "Revenue", value: `$${totalRev.toFixed(0)}`, badgeColor: "text-emerald-400" },
        { label: "Customers", value: context.customers.length, badgeColor: "text-indigo-400" },
      ],
    };
  }
}

export const COPILOT_QUICK_PROMPTS = [
  "Who are our top VIP patrons?",
  "Which orders are pending fulfillment?",
  "What is our status on order recovery campaigns?",
  "Draft a thank you message for Elena",
  "Give me an overview of the CRM",
];

const defaultCopilotEngine = new CrmCopilotEngine();

export function queryCrmCopilot(
  query: string,
  context: {
    customers: any[];
    orders: any[];
    communicationLogs?: any[];
    logs?: any[];
    aiAlerts?: any[];
    alerts?: any[];
  }
) {
  const normalizedCustomers = context.customers.map((c) => ({
    ...c,
    id: c.id || c.email,
    fullName: c.fullName || `${c.first_name || ""} ${c.last_name || ""}`.trim(),
    firstName: c.firstName || c.first_name || "",
    lastName: c.lastName || c.last_name || "",
    lifetimeValue: c.lifetimeValue ?? c.total_spend ?? 0,
    ordersCount: c.ordersCount ?? c.orders_count ?? 1,
    segment: c.segment || "New",
  }));

  const res = defaultCopilotEngine.answerQuery(query, {
    customers: normalizedCustomers as any,
    orders: context.orders as any,
    alerts: (context.alerts || context.aiAlerts || []) as any,
    logs: (context.logs || context.communicationLogs || []) as any,
  });

  const dataPointsMap: Record<string, string | number> = {};
  if (res.dataPoints) {
    for (const dp of res.dataPoints) {
      dataPointsMap[dp.label] = dp.value;
    }
  }

  return {
    answer: res.text,
    suggestedAction: res.suggestedActions?.[0]?.label,
    dataPoints: dataPointsMap,
  };
}
