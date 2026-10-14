import {
  Address,
  AiTriageAlert,
  CommunicationLog,
  CrmCustomer,
  CrmCustomerEvent,
  CrmLineItem,
  CrmOrder,
  CrmOrderEvent,
  CustomerSegment,
  OrderStatus,
  WooCommerceCustomerPayload,
  WooCommerceOrderPayload,
} from "./types";
import { AiTriageAgent } from "./ai-triage";

/* =========================================================================
   DESIGN PATTERN 1: ADAPTER PATTERN (WooCommerceAdapter)
   Converts external raw WooCommerce webhook and API payloads into normalized
   CRM Domain models, handling guest checkout mapping (customer_id = 0).
   ========================================================================= */

export class WooCommerceAdapter {
  /**
   * Normalizes WooCommerce order status into CRM OrderStatus.
   */
  public normalizeStatus(wcStatus: string): OrderStatus {
    const s = (wcStatus || "").toLowerCase().trim();
    if (s === "pending" || s === "on-hold") return "pending";
    if (s === "processing") return "processing";
    if (s === "shipped") return "shipped";
    if (s === "completed") return "completed";
    if (s === "cancelled" || s === "refunded" || s === "failed") return "cancelled";
    return "pending";
  }

  /**
   * Adapts a raw WooCommerce order payload into normalized CRM Order and Customer entities.
   * Explicitly resolves guest checkouts: if customer_id === 0, maps using billing.email.
   */
  public adaptOrder(
    payload: WooCommerceOrderPayload,
    existingCustomer?: CrmCustomer
  ): { order: CrmOrder; customer: CrmCustomer } {
    const billingEmail = (payload.billing?.email || "").trim().toLowerCase();
    const isGuest = !payload.customer_id || payload.customer_id === 0;

    // 1. Resolve Customer Identity
    let customerId: string;
    let firstName = payload.billing?.first_name || (isGuest ? "Guest" : "Customer");
    let lastName = payload.billing?.last_name || "";
    let fullName = `${firstName} ${lastName}`.trim();
    const phone = payload.billing?.phone || "";

    if (existingCustomer) {
      customerId = existingCustomer.id;
      firstName = existingCustomer.firstName || firstName;
      lastName = existingCustomer.lastName || lastName;
      fullName = existingCustomer.fullName || fullName;
    } else if (isGuest) {
      // Deterministic ID for guest mapped by email
      const cleanEmailKey = billingEmail.replace(/[^a-zA-Z0-9]/g, "_");
      customerId = `cust_guest_${cleanEmailKey || payload.id}`;
    } else {
      customerId = `cust_wc_${payload.customer_id}`;
    }

    // 2. Normalize Line Items
    const lineItems: CrmLineItem[] = (payload.line_items || []).map((item, index) => {
      const price = typeof item.price === "number" ? item.price : parseFloat(String(item.total || 0)) / (item.quantity || 1);
      const total = typeof item.total === "number" ? item.total : parseFloat(String(item.total || 0));
      return {
        id: `li_${payload.id}_${item.id || index}`,
        productId: item.product_id || 0,
        name: item.name || "Custom Item",
        quantity: item.quantity || 1,
        price: isNaN(price) ? 0 : price,
        total: isNaN(total) ? 0 : total,
        sku: item.sku || `SKU-${item.product_id || index + 100}`,
      };
    });

    const parsedTotal = typeof payload.total === "number" ? payload.total : parseFloat(String(payload.total || 0));
    const normalizedTotal = isNaN(parsedTotal) ? 0 : parsedTotal;
    const normalizedStatus = this.normalizeStatus(payload.status);

    const nowIso = new Date().toISOString();
    const createdAt = payload.date_created || nowIso;
    const updatedAt = payload.date_modified || nowIso;

    // 3. Construct Normalized Order
    const order: CrmOrder = {
      id: `ord_${payload.id}`,
      wooCommerceOrderId: payload.id,
      customerId,
      customerEmail: billingEmail || (existingCustomer ? existingCustomer.email : `guest_${payload.id}@checkout.local`),
      customerName: fullName || billingEmail,
      status: normalizedStatus,
      total: normalizedTotal,
      currency: (payload.currency || "USD").toUpperCase(),
      lineItems,
      paymentMethod: payload.payment_method_title || payload.payment_method || "Credit Card",
      shippingAddress: payload.shipping || payload.billing || {},
      billingAddress: payload.billing || {},
      createdAt,
      updatedAt,
    };

    // 4. Construct or Update Normalized Customer
    const tags = new Set<string>(existingCustomer?.tags || []);
    if (isGuest) {
      tags.add("Guest Checkout");
    }

    const orderIds = new Set<string>(existingCustomer?.orderIds || []);
    orderIds.add(order.id);

    const customer: CrmCustomer = {
      id: customerId,
      wooCommerceId: isGuest ? null : payload.customer_id,
      email: billingEmail || (existingCustomer ? existingCustomer.email : `guest_${payload.id}@checkout.local`),
      firstName,
      lastName,
      fullName,
      phone: phone || existingCustomer?.phone || "",
      billingAddress: payload.billing || existingCustomer?.billingAddress || {},
      shippingAddress: payload.shipping || existingCustomer?.shippingAddress || {},
      lifetimeValue: existingCustomer?.lifetimeValue || 0, // Will be dynamically computed
      ordersCount: orderIds.size,
      averageOrderValue: 0,
      segment: existingCustomer?.segment || "New",
      tags: Array.from(tags),
      orderIds: Array.from(orderIds),
      firstOrderDate: existingCustomer?.firstOrderDate || createdAt,
      lastOrderDate: createdAt,
      createdAt: existingCustomer?.createdAt || createdAt,
      notes: existingCustomer?.notes || [],
    };

    return { order, customer };
  }

  /**
   * Adapts a standalone WooCommerce customer object.
   */
  public adaptCustomer(payload: WooCommerceCustomerPayload): CrmCustomer {
    const fullName = `${payload.first_name || ""} ${payload.last_name || ""}`.trim() || payload.email;
    const totalSpent = typeof payload.total_spent === "number" ? payload.total_spent : parseFloat(String(payload.total_spent || 0));
    const ordersCount = payload.orders_count || 0;
    const ltv = isNaN(totalSpent) ? 0 : totalSpent;

    return {
      id: `cust_wc_${payload.id}`,
      wooCommerceId: payload.id,
      email: (payload.email || "").toLowerCase().trim(),
      firstName: payload.first_name || "",
      lastName: payload.last_name || "",
      fullName,
      phone: payload.billing?.phone || "",
      billingAddress: payload.billing || {},
      shippingAddress: payload.shipping || {},
      lifetimeValue: ltv,
      ordersCount,
      averageOrderValue: ordersCount > 0 ? ltv / ordersCount : 0,
      segment: ltv >= 500 ? "VIP" : ordersCount > 1 ? "Repeat" : "New",
      tags: ltv >= 500 ? ["High Spender"] : [],
      orderIds: [],
      firstOrderDate: new Date().toISOString(),
      lastOrderDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      notes: [],
    };
  }
}

/* =========================================================================
   DESIGN PATTERN 2: STRATEGY PATTERN (SegmentationStrategy)
   Provides swappable segmentation algorithms (Tiered LTV, Frequency, RFM).
   ========================================================================= */

export interface ISegmentationStrategy {
  readonly name: string;
  calculateSegment(customer: CrmCustomer, customerOrders: CrmOrder[]): CustomerSegment;
  getThresholds(): Record<string, unknown>;
}

/**
 * Default Strategy: Tiered Lifetime Value (LTV)
 * - New: < $200
 * - Repeat: $200 - $499.99
 * - VIP: >= $500
 */
export class TieredLtvStrategy implements ISegmentationStrategy {
  public readonly name = "Tiered LTV Strategy";

  constructor(
    private readonly newMax: number = 200,
    private readonly vipMin: number = 500
  ) {}

  public calculateSegment(customer: CrmCustomer, _customerOrders: CrmOrder[]): CustomerSegment {
    const ltv = customer.lifetimeValue || 0;
    if (ltv >= this.vipMin) return "VIP";
    if (ltv >= this.newMax) return "Repeat";
    return "New";
  }

  public getThresholds() {
    return {
      newMax: this.newMax,
      repeatMin: this.newMax,
      repeatMax: this.vipMin,
      vipMin: this.vipMin,
    };
  }
}

/**
 * Alternative Strategy: Order Frequency Strategy
 * - New: 1 order
 * - Repeat: 2 - 4 orders
 * - VIP: 5+ orders
 */
export class FrequencyStrategy implements ISegmentationStrategy {
  public readonly name = "Order Frequency Strategy";

  constructor(
    private readonly repeatMinOrders: number = 2,
    private readonly vipMinOrders: number = 5
  ) {}

  public calculateSegment(customer: CrmCustomer, customerOrders: CrmOrder[]): CustomerSegment {
    const validOrders = customerOrders.filter((o) => o.status !== "cancelled");
    const count = validOrders.length || customer.ordersCount || 0;

    if (count >= this.vipMinOrders) return "VIP";
    if (count >= this.repeatMinOrders) return "Repeat";
    return "New";
  }

  public getThresholds() {
    return {
      repeatMinOrders: this.repeatMinOrders,
      vipMinOrders: this.vipMinOrders,
    };
  }
}

/**
 * Alternative Strategy: Hybrid RFM (Recency + Frequency + Monetary) Strategy
 */
export class HybridRfmStrategy implements ISegmentationStrategy {
  public readonly name = "Hybrid RFM Strategy";

  public calculateSegment(customer: CrmCustomer, customerOrders: CrmOrder[]): CustomerSegment {
    const ltv = customer.lifetimeValue || 0;
    const validOrders = customerOrders.filter((o) => o.status !== "cancelled");
    const count = validOrders.length || customer.ordersCount || 0;

    if (ltv >= 500 || (count >= 4 && ltv >= 350)) return "VIP";
    if (count >= 2 || ltv >= 200) return "Repeat";
    return "New";
  }

  public getThresholds() {
    return {
      vipLtv: 500,
      vipOrdersWithLtv: { count: 4, ltv: 350 },
      repeatLtv: 200,
      repeatOrders: 2,
    };
  }
}

/**
 * Segmentation Context for runtime swapping of strategies.
 */
export class SegmentationContext {
  private strategy: ISegmentationStrategy;

  constructor(strategy?: ISegmentationStrategy) {
    this.strategy = strategy || new TieredLtvStrategy();
  }

  public setStrategy(strategy: ISegmentationStrategy): void {
    this.strategy = strategy;
  }

  public getStrategy(): ISegmentationStrategy {
    return this.strategy;
  }

  public evaluate(customer: CrmCustomer, customerOrders: CrmOrder[]): CustomerSegment {
    return this.strategy.calculateSegment(customer, customerOrders);
  }
}

/* =========================================================================
   DESIGN PATTERN 3: OBSERVER PATTERN (WorkflowEngine)
   Decouples order/customer lifecycle state events from automated side effects:
   - Communication Workflow Observer (Automated Email & WhatsApp logs)
   - AI Triage Observer (VIP Concierge & Cancelled Order Recovery)
   - Analytics Observer (Real-time aggregate calculations)
   ========================================================================= */

export interface CrmObserver {
  readonly name: string;
  onOrderEvent?(event: CrmOrderEvent): void | Promise<void>;
  onCustomerEvent?(event: CrmCustomerEvent): void | Promise<void>;
}

export class WorkflowEngine {
  private observers: Set<CrmObserver> = new Set();

  public subscribe(observer: CrmObserver): void {
    this.observers.add(observer);
  }

  public unsubscribe(observer: CrmObserver): void {
    this.observers.delete(observer);
  }

  public getObservers(): CrmObserver[] {
    return Array.from(this.observers);
  }

  public notifyOrder(event: CrmOrderEvent): void {
    for (const observer of this.observers) {
      if (observer.onOrderEvent) {
        try {
          observer.onOrderEvent(event);
        } catch (err) {
          console.error(`Observer error in ${observer.name} onOrderEvent:`, err);
        }
      }
    }
  }

  public notifyCustomer(event: CrmCustomerEvent): void {
    for (const observer of this.observers) {
      if (observer.onCustomerEvent) {
        try {
          observer.onCustomerEvent(event);
        } catch (err) {
          console.error(`Observer error in ${observer.name} onCustomerEvent:`, err);
        }
      }
    }
  }
}

/**
 * Concrete Observer 1: Automated Omnichannel Communication Logs (Email & WhatsApp)
 */
export class CommunicationWorkflowObserver implements CrmObserver {
  public readonly name = "CommunicationWorkflowObserver";
  private logs: CommunicationLog[] = [];

  constructor(initialLogs: CommunicationLog[] = []) {
    this.logs = [...initialLogs];
  }

  public getLogs(): CommunicationLog[] {
    return [...this.logs];
  }

  public addLog(log: CommunicationLog): void {
    this.logs.unshift(log);
  }

  public seedLogs(logs: CommunicationLog[]): void {
    this.logs = [...logs];
  }

  public onOrderEvent(event: CrmOrderEvent): void {
    const { order, customer, previousStatus, type } = event;
    const timestamp = new Date().toISOString();
    const recipientName = customer.fullName || customer.email;

    if (type === "order:created" || (previousStatus && previousStatus !== order.status)) {
      switch (order.status) {
        case "pending": {
          this.logs.unshift({
            id: `comm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            orderId: order.id,
            customerId: customer.id,
            customerEmail: customer.email,
            customerName: recipientName,
            channel: "email",
            subject: `Order #${order.wooCommerceOrderId} Confirmed!`,
            message: `Hi ${customer.firstName || "Customer"}, we've received your order #${order.wooCommerceOrderId} totaling $${order.total.toFixed(2)}. We will notify you once processing begins!`,
            status: "delivered",
            timestamp,
            eventType: "order:created",
          });
          this.logs.unshift({
            id: `comm_${Date.now() + 1}_${Math.random().toString(36).substring(2, 7)}`,
            orderId: order.id,
            customerId: customer.id,
            customerEmail: customer.email,
            customerName: recipientName,
            channel: "whatsapp",
            message: `Kilowott Update: Order #${order.wooCommerceOrderId} placed successfully ($${order.total.toFixed(2)}). Track status anytime in your portal.`,
            status: "delivered",
            timestamp,
            eventType: "order:created",
          });
          break;
        }

        case "processing": {
          this.logs.unshift({
            id: `comm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            orderId: order.id,
            customerId: customer.id,
            customerEmail: customer.email,
            customerName: recipientName,
            channel: "whatsapp",
            message: `Packing update: Order #${order.wooCommerceOrderId} is now being prepared by our fulfillment team.`,
            status: "delivered",
            timestamp,
            eventType: "order:processing",
          });
          break;
        }

        case "shipped": {
          const tracking = order.trackingNumber || `TRK-${Math.floor(100000 + Math.random() * 900000)}`;
          this.logs.unshift({
            id: `comm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            orderId: order.id,
            customerId: customer.id,
            customerEmail: customer.email,
            customerName: recipientName,
            channel: "email",
            subject: `Your order #${order.wooCommerceOrderId} is on its way!`,
            message: `Great news ${customer.firstName || "there"}! Your order has shipped via Express Courier. Tracking ID: ${tracking}.`,
            status: "delivered",
            timestamp,
            eventType: "order:shipped",
          });
          this.logs.unshift({
            id: `comm_${Date.now() + 1}_${Math.random().toString(36).substring(2, 7)}`,
            orderId: order.id,
            customerId: customer.id,
            customerEmail: customer.email,
            customerName: recipientName,
            channel: "whatsapp",
            message: `🚚 Order #${order.wooCommerceOrderId} dispatched! Track live: https://track.kilowott.local/${tracking}`,
            status: "delivered",
            timestamp,
            eventType: "order:shipped",
          });
          break;
        }

        case "completed": {
          this.logs.unshift({
            id: `comm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            orderId: order.id,
            customerId: customer.id,
            customerEmail: customer.email,
            customerName: recipientName,
            channel: "email",
            subject: `Order #${order.wooCommerceOrderId} Delivered - How did we do?`,
            message: `Hi ${customer.firstName || "Customer"}, your order #${order.wooCommerceOrderId} has arrived! Please let us know if everything met your expectations.`,
            status: "delivered",
            timestamp,
            eventType: "order:completed",
          });
          break;
        }

        case "cancelled": {
          this.logs.unshift({
            id: `comm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            orderId: order.id,
            customerId: customer.id,
            customerEmail: customer.email,
            customerName: recipientName,
            channel: "email",
            subject: `Notice: Order #${order.wooCommerceOrderId} Cancelled`,
            message: `Hello ${customer.firstName || "Customer"}, your order #${order.wooCommerceOrderId} has been marked as cancelled. Any authorizations have been released.`,
            status: "delivered",
            timestamp,
            eventType: "order:cancelled",
          });
          break;
        }
      }
    }
  }
}

/**
 * Concrete Observer 2: Embedded AI Triage Observer (VIP Concierge & Win-Back Recovery)
 */
export class AiTriageObserver implements CrmObserver {
  public readonly name = "AiTriageObserver";
  private alerts: AiTriageAlert[] = [];
  private aiAgent: AiTriageAgent;

  constructor(aiAgent: AiTriageAgent, initialAlerts: AiTriageAlert[] = []) {
    this.aiAgent = aiAgent;
    this.alerts = [...initialAlerts];
  }

  public getAlerts(): AiTriageAlert[] {
    return [...this.alerts];
  }

  public addAlert(alert: AiTriageAlert): void {
    this.alerts.unshift(alert);
  }

  public seedAlerts(alerts: AiTriageAlert[]): void {
    this.alerts = [...alerts];
  }

  public onOrderEvent(event: CrmOrderEvent): void {
    const alert = this.aiAgent.evaluateOrder(event.order, event.customer, event.previousStatus);
    if (alert) {
      const exists = this.alerts.some(
        (a) => a.orderId === alert.orderId && a.type === alert.type && a.status === "pending"
      );
      if (!exists) {
        this.alerts.unshift(alert);
      }
    }
  }

  public actionAlert(alertId: string, status: "actioned" | "dismissed" = "actioned"): AiTriageAlert | null {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.status = status;
      return alert;
    }
    return null;
  }
}

/**
 * Concrete Observer 3: Real-Time Analytics Observer
 */
export class AnalyticsObserver implements CrmObserver {
  public readonly name = "AnalyticsObserver";
  public totalRevenue = 0;
  public totalOrders = 0;
  public pipelineCounts: Record<OrderStatus, number> = {
    pending: 0,
    processing: 0,
    shipped: 0,
    completed: 0,
    cancelled: 0,
  };

  public onOrderEvent(event: CrmOrderEvent): void {
    if (event.type === "order:created") {
      this.totalOrders++;
      if (event.order.status !== "cancelled") {
        this.totalRevenue += event.order.total;
      }
    }
  }
}

/* =========================================================================
   CRM ENGINE: Central Orchestrator & State Manager
   ========================================================================= */

export class CrmEngine {
  public readonly adapter: WooCommerceAdapter;
  public readonly segmentationContext: SegmentationContext;
  public readonly workflowEngine: WorkflowEngine;
  public readonly commObserver: CommunicationWorkflowObserver;
  public readonly triageObserver: AiTriageObserver;
  public readonly analyticsObserver: AnalyticsObserver;
  public readonly aiAgent: AiTriageAgent;

  private customers: Map<string, CrmCustomer> = new Map();
  private orders: Map<string, CrmOrder> = new Map();
  private emailToCustomerId: Map<string, string> = new Map();

  constructor() {
    this.adapter = new WooCommerceAdapter();
    this.segmentationContext = new SegmentationContext(new TieredLtvStrategy());
    this.workflowEngine = new WorkflowEngine();
    this.aiAgent = new AiTriageAgent();

    this.commObserver = new CommunicationWorkflowObserver();
    this.triageObserver = new AiTriageObserver(this.aiAgent);
    this.analyticsObserver = new AnalyticsObserver();

    this.workflowEngine.subscribe(this.commObserver);
    this.workflowEngine.subscribe(this.triageObserver);
    this.workflowEngine.subscribe(this.analyticsObserver);
  }

  /**
   * Primary Webhook Ingestion Pipeline:
   * 1. Adapts WooCommerce payload (resolves guest checkouts by email).
   * 2. Recalculates customer LTV and re-evaluates segment via Strategy Pattern.
   * 3. Dispatches order event via Observer Pattern.
   */
  public processWebhook(payload: WooCommerceOrderPayload): {
    order: CrmOrder;
    customer: CrmCustomer;
  } {
    const email = (payload.billing?.email || "").trim().toLowerCase();
    const existingCustomerId = this.emailToCustomerId.get(email);
    const existingCustomer = existingCustomerId ? this.customers.get(existingCustomerId) : undefined;

    // 1. Adapter Pattern translates payload and handles guest ID
    const { order, customer } = this.adapter.adaptOrder(payload, existingCustomer);

    // Save order
    this.orders.set(order.id, order);

    // Save/update customer
    this.customers.set(customer.id, customer);
    if (customer.email) {
      this.emailToCustomerId.set(customer.email.toLowerCase(), customer.id);
    }

    // 2. Re-calculate metrics and auto-segment
    this.recalculateCustomerMetrics(customer.id);
    const updatedCustomer = this.customers.get(customer.id)!;

    // 3. Observer Pattern dispatches event
    const event: CrmOrderEvent = {
      type: "order:created",
      order,
      customer: updatedCustomer,
    };
    this.workflowEngine.notifyOrder(event);

    return { order, customer: updatedCustomer };
  }

  /**
   * Interactive order status progression (e.g. pending -> processing -> shipped -> completed / cancelled).
   */
  public updateOrderStatus(orderId: string, newStatus: OrderStatus): CrmOrder | null {
    const order = this.orders.get(orderId);
    if (!order) return null;

    const previousStatus = order.status;
    if (previousStatus === newStatus) return order;

    order.status = newStatus;
    order.updatedAt = new Date().toISOString();
    this.orders.set(order.id, order);

    // Recalculate customer LTV when status changes
    this.recalculateCustomerMetrics(order.customerId);
    const customer = this.customers.get(order.customerId);

    if (customer) {
      const event: CrmOrderEvent = {
        type: newStatus === "cancelled" ? "order:cancelled" : "order:status_changed",
        order,
        customer,
        previousStatus,
      };
      this.workflowEngine.notifyOrder(event);
    }

    return order;
  }

  /**
   * Recalculates LTV, AOV, and re-segments customer using current Strategy.
   */
  public recalculateCustomerMetrics(customerId: string): CrmCustomer | null {
    const customer = this.customers.get(customerId);
    if (!customer) return null;

    const customerOrders = Array.from(this.orders.values()).filter((o) => o.customerId === customerId);

    const validOrders = customerOrders.filter((o) => o.status !== "cancelled");
    const ltv = validOrders.reduce((sum, o) => sum + o.total, 0);
    const aov = validOrders.length > 0 ? ltv / validOrders.length : 0;

    const previousSegment = customer.segment;
    customer.lifetimeValue = Math.round(ltv * 100) / 100;
    customer.ordersCount = customerOrders.length;
    customer.averageOrderValue = Math.round(aov * 100) / 100;

    // Strategy Pattern calculates segment
    customer.segment = this.segmentationContext.evaluate(customer, customerOrders);

    // Update tags
    const tagSet = new Set(customer.tags || []);
    if (customer.segment === "VIP") {
      tagSet.add("VIP Patron");
    }
    customer.tags = Array.from(tagSet);

    this.customers.set(customer.id, customer);

    if (previousSegment !== customer.segment) {
      this.workflowEngine.notifyCustomer({
        type: customer.segment === "VIP" ? "customer:vip_elevated" : "customer:updated",
        customer,
        previousSegment,
      });
    }

    return customer;
  }

  // --- Query Methods ---
  public getCustomer(id: string): CrmCustomer | undefined {
    return this.customers.get(id);
  }

  public getCustomerByEmail(email: string): CrmCustomer | undefined {
    const customerId = this.emailToCustomerId.get(email.trim().toLowerCase());
    return customerId ? this.customers.get(customerId) : undefined;
  }

  public getOrder(id: string): CrmOrder | undefined {
    return this.orders.get(id);
  }

  public getAllCustomers(): CrmCustomer[] {
    return Array.from(this.customers.values()).sort(
      (a, b) => (b.lifetimeValue || 0) - (a.lifetimeValue || 0)
    );
  }

  public getAllOrders(): CrmOrder[] {
    return Array.from(this.orders.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getCommunicationLogs(): CommunicationLog[] {
    return this.commObserver.getLogs();
  }

  public getTriageAlerts(): AiTriageAlert[] {
    return this.triageObserver.getAlerts();
  }

  public actionTriageAlert(alertId: string, status: "actioned" | "dismissed" = "actioned"): AiTriageAlert | null {
    return this.triageObserver.actionAlert(alertId, status);
  }

  public addManualCommunication(log: Omit<CommunicationLog, "id" | "timestamp">): CommunicationLog {
    const fullLog: CommunicationLog = {
      ...log,
      id: `comm_manual_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    this.commObserver.addLog(fullLog);
    return fullLog;
  }

  /**
   * Seeds demo data into the engine.
   */
  public seed(
    customers: CrmCustomer[],
    orders: CrmOrder[],
    logs: CommunicationLog[] = [],
    alerts: AiTriageAlert[] = []
  ): void {
    this.customers.clear();
    this.orders.clear();
    this.emailToCustomerId.clear();

    for (const c of customers) {
      this.customers.set(c.id, c);
      if (c.email) {
        this.emailToCustomerId.set(c.email.toLowerCase(), c.id);
      }
    }

    for (const o of orders) {
      this.orders.set(o.id, o);
    }

    for (const c of customers) {
      this.recalculateCustomerMetrics(c.id);
    }

    if (logs.length > 0) {
      this.commObserver.seedLogs(logs);
    }

    if (alerts.length > 0) {
      this.triageObserver.seedAlerts(alerts);
    }
  }
}
