import {
  CrmOrder,
  CrmCustomer,
  AiTriageAlert,
  OrderStatus,
} from "./types";

/**
 * Embedded AI Triage Agent
 * Provides autonomous VIP Concierge Briefings and Cancelled-Order Recovery Campaigns.
 */
export class AiTriageAgent {
  /**
   * Evaluates an incoming order or order transition to determine if agentic triage is required.
   */
  public evaluateOrder(
    order: CrmOrder,
    customer: CrmCustomer,
    previousStatus?: OrderStatus
  ): AiTriageAlert | null {
    // 1. Check for Order Cancellation Recovery
    if (order.status === "cancelled" && previousStatus !== "cancelled") {
      return this.generateCancellationRecoveryAlert(order, customer);
    }

    // 2. Check for VIP Concierge Engagement
    const isVipCustomer = customer.segment === "VIP";
    const isHighValueOrder = order.total >= 500;
    const isElevatedToVip = customer.lifetimeValue >= 500;

    if (order.status !== "cancelled" && (isVipCustomer || isHighValueOrder || isElevatedToVip)) {
      return this.generateVipConciergeAlert(order, customer);
    }

    return null;
  }

  /**
   * Generates a VIP Concierge triage alert with synthesized customer loyalty briefing and action items.
   */
  public generateVipConciergeAlert(
    order: CrmOrder,
    customer: CrmCustomer
  ): AiTriageAlert {
    const itemNames = order.lineItems.map((item) => `${item.quantity}x ${item.name}`).join(", ") || "Featured products";
    const totalSpent = (customer.lifetimeValue || 0).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });

    return {
      id: `triage_vip_${order.id}_${Date.now()}`,
      orderId: order.id,
      customerId: customer.id,
      customerName: customer.fullName || `${customer.firstName} ${customer.lastName}`.trim() || customer.email,
      customerEmail: customer.email,
      type: "vip_concierge",
      priority: order.total >= 1000 ? "urgent" : "high",
      summary: `VIP Concierge Briefing: High-value patron purchase ($${order.total.toFixed(2)})`,
      analysis: `Patron ${customer.fullName || customer.email} placed order #${order.wooCommerceOrderId} for $${order.total.toFixed(2)} (${itemNames}). Cumulative Lifetime Value is ${totalSpent} across ${customer.ordersCount} orders. Tier status: VIP.`,
      recommendedAction:
        "Assign dedicated account concierge, flag warehouse for premium luxury packaging, and send executive WhatsApp acknowledgment.",
      suggestedMessage: {
        channel: "whatsapp",
        subject: "Your Kilowott VIP Order is Being Prepared",
        body: `Hello ${customer.firstName || "valued customer"}, thank you for choosing Kilowott. As one of our esteemed VIP patrons, your order #${order.wooCommerceOrderId} ($${order.total.toFixed(2)}) has been expedited with complimentary priority dispatch. If you have any bespoke requests, your dedicated concierge is at your service.`,
      },
      status: "pending",
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Generates an autonomous recovery message with dynamic discount voucher for cancelled orders.
   */
  public generateCancellationRecoveryAlert(
    order: CrmOrder,
    customer: CrmCustomer
  ): AiTriageAlert {
    const couponCode = `COMEBACK-${order.wooCommerceOrderId || Math.floor(1000 + Math.random() * 9000)}`;
    const discountPercent = customer.segment === "VIP" ? 20 : 15;
    const itemsList = order.lineItems.map((i) => i.name).join(", ") || "your selected items";

    return {
      id: `triage_rec_${order.id}_${Date.now()}`,
      orderId: order.id,
      customerId: customer.id,
      customerName: customer.fullName || `${customer.firstName} ${customer.lastName}`.trim() || customer.email,
      customerEmail: customer.email,
      type: "cancellation_recovery",
      priority: "high",
      summary: `Win-Back Alert: Cancelled Order #${order.wooCommerceOrderId} ($${order.total.toFixed(2)})`,
      analysis: `Customer cancelled order #${order.wooCommerceOrderId} valued at $${order.total.toFixed(2)} containing ${itemsList}. Customer segment: ${customer.segment}. High probability of checkout abandonment friction.`,
      recommendedAction: `Dispatch tailored recovery email with time-limited ${discountPercent}% retention discount voucher code: ${couponCode}.`,
      suggestedMessage: {
        channel: "email",
        subject: `We missed you! Here is ${discountPercent}% off your order`,
        couponCode,
        discountPercent,
        body: `Hi ${customer.firstName || "there"},\n\nWe noticed your recent order #${order.wooCommerceOrderId} (${itemsList}) was cancelled. If something didn't go quite right, we'd love the opportunity to assist you.\n\nTo welcome you back, use exclusive voucher code ${couponCode} at checkout for ${discountPercent}% off your next order valid for the next 48 hours.\n\nWarm regards,\nThe Kilowott Concierge Team`,
      },
      status: "pending",
      createdAt: new Date().toISOString(),
    };
  }
}
