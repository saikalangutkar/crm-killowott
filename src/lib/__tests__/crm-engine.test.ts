import { describe, it, expect, beforeEach } from "vitest";
import {
  CrmEngine,
  WooCommerceAdapter,
  TieredLtvStrategy,
  FrequencyStrategy,
  HybridRfmStrategy,
  SegmentationContext,
  WorkflowEngine,
  CommunicationWorkflowObserver,
  AiTriageObserver,
  AnalyticsObserver,
} from "../crm-engine";
import { AiTriageAgent } from "../ai-triage";
import { WooCommerceOrderPayload, CrmCustomer, CrmOrder } from "../types";

describe("Design Pattern 1: Adapter Pattern (WooCommerceAdapter)", () => {
  let adapter: WooCommerceAdapter;

  beforeEach(() => {
    adapter = new WooCommerceAdapter();
  });

  it("normalizes a standard registered WooCommerce order", () => {
    const payload: WooCommerceOrderPayload = {
      id: 501,
      status: "processing",
      currency: "USD",
      total: "199.50",
      customer_id: 42,
      billing: {
        first_name: "James",
        last_name: "Holden",
        email: "james.holden@rocinante.space",
        phone: "+1 555-0192",
      },
      shipping: {
        first_name: "James",
        last_name: "Holden",
        address_1: "Hangar 4",
        city: "Tycho",
        country: "Belt",
      },
      line_items: [
        {
          id: 1,
          product_id: 10,
          name: "Coffee Machine",
          quantity: 1,
          price: 199.5,
          subtotal: "199.50",
          total: "199.50",
        },
      ],
    };

    const { order, customer } = adapter.adaptOrder(payload);

    expect(order.id).toBe("ord_501");
    expect(order.wooCommerceOrderId).toBe(501);
    expect(order.customerId).toBe("cust_wc_42");
    expect(order.status).toBe("processing");
    expect(order.total).toBe(199.5);
    expect(order.customerEmail).toBe("james.holden@rocinante.space");
    expect(order.lineItems).toHaveLength(1);
    expect(order.lineItems[0].name).toBe("Coffee Machine");

    expect(customer.id).toBe("cust_wc_42");
    expect(customer.wooCommerceId).toBe(42);
    expect(customer.fullName).toBe("James Holden");
    expect(customer.email).toBe("james.holden@rocinante.space");
  });

  it("handles guest checkout (customer_id = 0) and maps by billing email", () => {
    const guestPayload: WooCommerceOrderPayload = {
      id: 502,
      status: "pending",
      currency: "USD",
      total: "75.00",
      customer_id: 0, // Guest checkout
      billing: {
        first_name: "Naomi",
        last_name: "Nagata",
        email: "naomi.nagata@belt.org",
      },
      shipping: {
        address_1: "Ceres Station",
      },
      line_items: [
        {
          id: 2,
          product_id: 22,
          name: "Terminal Tablet",
          quantity: 1,
          price: 75.0,
          subtotal: "75.00",
          total: "75.00",
        },
      ],
    };

    const { order, customer } = adapter.adaptOrder(guestPayload);

    expect(customer.wooCommerceId).toBeNull();
    expect(customer.email).toBe("naomi.nagata@belt.org");
    expect(customer.tags).toContain("Guest Checkout");
    expect(customer.id).toContain("cust_guest_");
    expect(order.customerId).toBe(customer.id);
  });

  it("merges guest checkout into existing customer record if email matches", () => {
    const existingCustomer: CrmCustomer = {
      id: "cust_existing_123",
      wooCommerceId: null,
      email: "alex.kamal@mars.space",
      firstName: "Alex",
      lastName: "Kamal",
      fullName: "Alex Kamal",
      phone: "",
      billingAddress: {},
      shippingAddress: {},
      lifetimeValue: 120.0,
      ordersCount: 1,
      averageOrderValue: 120.0,
      segment: "New",
      tags: ["Guest Checkout"],
      orderIds: ["ord_401"],
      firstOrderDate: "2026-01-01T00:00:00.000Z",
      lastOrderDate: "2026-01-01T00:00:00.000Z",
      createdAt: "2026-01-01T00:00:00.000Z",
    };

    const secondGuestOrder: WooCommerceOrderPayload = {
      id: 503,
      status: "completed",
      currency: "USD",
      total: "250.00",
      customer_id: 0,
      billing: {
        email: "alex.kamal@mars.space",
      },
      shipping: {},
      line_items: [],
    };

    const { order, customer } = adapter.adaptOrder(secondGuestOrder, existingCustomer);

    expect(customer.id).toBe("cust_existing_123");
    expect(customer.orderIds).toContain("ord_401");
    expect(customer.orderIds).toContain("ord_503");
    expect(order.customerId).toBe("cust_existing_123");
  });

  it("normalizes statuses cleanly including WooCommerce variations", () => {
    expect(adapter.normalizeStatus("pending")).toBe("pending");
    expect(adapter.normalizeStatus("on-hold")).toBe("pending");
    expect(adapter.normalizeStatus("processing")).toBe("processing");
    expect(adapter.normalizeStatus("shipped")).toBe("shipped");
    expect(adapter.normalizeStatus("completed")).toBe("completed");
    expect(adapter.normalizeStatus("cancelled")).toBe("cancelled");
    expect(adapter.normalizeStatus("refunded")).toBe("cancelled");
    expect(adapter.normalizeStatus("failed")).toBe("cancelled");
  });
});

describe("Design Pattern 2: Strategy Pattern (SegmentationStrategy)", () => {
  const dummyCustomer = (ltv: number, ordersCount: number): CrmCustomer => ({
    id: "cust_test",
    wooCommerceId: 1,
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
    fullName: "Test User",
    phone: "",
    billingAddress: {},
    shippingAddress: {},
    lifetimeValue: ltv,
    ordersCount,
    averageOrderValue: ltv / (ordersCount || 1),
    segment: "New",
    tags: [],
    orderIds: [],
    firstOrderDate: "",
    lastOrderDate: "",
    createdAt: "",
  });

  describe("TieredLtvStrategy", () => {
    const strategy = new TieredLtvStrategy();

    it("classifies customer as 'New' when LTV < 200", () => {
      const cust = dummyCustomer(199.99, 1);
      expect(strategy.calculateSegment(cust, [])).toBe("New");
    });

    it("classifies customer as 'Repeat' when 200 <= LTV < 500", () => {
      const cust1 = dummyCustomer(200.0, 1);
      const cust2 = dummyCustomer(499.99, 2);
      expect(strategy.calculateSegment(cust1, [])).toBe("Repeat");
      expect(strategy.calculateSegment(cust2, [])).toBe("Repeat");
    });

    it("classifies customer as 'VIP' when LTV >= 500", () => {
      const cust = dummyCustomer(500.0, 3);
      expect(strategy.calculateSegment(cust, [])).toBe("VIP");
    });
  });

  describe("FrequencyStrategy", () => {
    const strategy = new FrequencyStrategy();

    it("classifies by order count regardless of total spend", () => {
      const singleOrderBigSpend = dummyCustomer(1200.0, 1);
      const repeatOrderModerateSpend = dummyCustomer(150.0, 3);
      const frequentBuyer = dummyCustomer(250.0, 5);

      expect(strategy.calculateSegment(singleOrderBigSpend, [])).toBe("New");
      expect(strategy.calculateSegment(repeatOrderModerateSpend, [])).toBe("Repeat");
      expect(strategy.calculateSegment(frequentBuyer, [])).toBe("VIP");
    });
  });

  describe("SegmentationContext (Runtime Strategy Swapping)", () => {
    it("allows switching strategies at runtime and re-evaluating", () => {
      const context = new SegmentationContext(new TieredLtvStrategy());
      const customer = dummyCustomer(800.0, 1); // 1 order, high spend

      // Under TieredLtvStrategy: spend >= 500 -> VIP
      expect(context.evaluate(customer, [])).toBe("VIP");

      // Swap to FrequencyStrategy: 1 order -> New
      context.setStrategy(new FrequencyStrategy());
      expect(context.getStrategy().name).toBe("Order Frequency Strategy");
      expect(context.evaluate(customer, [])).toBe("New");

      // Swap to Hybrid RFM Strategy
      context.setStrategy(new HybridRfmStrategy());
      expect(context.evaluate(customer, [])).toBe("VIP");
    });
  });
});

describe("Design Pattern 3: Observer Pattern (WorkflowEngine)", () => {
  let workflowEngine: WorkflowEngine;
  let commObserver: CommunicationWorkflowObserver;
  let triageObserver: AiTriageObserver;
  let aiAgent: AiTriageAgent;

  beforeEach(() => {
    workflowEngine = new WorkflowEngine();
    commObserver = new CommunicationWorkflowObserver();
    aiAgent = new AiTriageAgent();
    triageObserver = new AiTriageObserver(aiAgent);

    workflowEngine.subscribe(commObserver);
    workflowEngine.subscribe(triageObserver);
  });

  it("subscribes and unsubscribes observers correctly", () => {
    expect(workflowEngine.getObservers()).toHaveLength(2);

    const dummyObserver = { name: "DummyObserver" };
    workflowEngine.subscribe(dummyObserver);
    expect(workflowEngine.getObservers()).toHaveLength(3);

    workflowEngine.unsubscribe(dummyObserver);
    expect(workflowEngine.getObservers()).toHaveLength(2);
  });

  it("notifies CommunicationWorkflowObserver on order creation with Email and WhatsApp logs", () => {
    const sampleCustomer: CrmCustomer = {
      id: "cust_1",
      wooCommerceId: 10,
      email: "amos.burton@clarissa.me",
      firstName: "Amos",
      lastName: "Burton",
      fullName: "Amos Burton",
      phone: "+1 555-1234",
      billingAddress: {},
      shippingAddress: {},
      lifetimeValue: 95.0,
      ordersCount: 1,
      averageOrderValue: 95.0,
      segment: "New",
      tags: [],
      orderIds: ["ord_101"],
      firstOrderDate: "",
      lastOrderDate: "",
      createdAt: "",
    };

    const sampleOrder: CrmOrder = {
      id: "ord_101",
      wooCommerceOrderId: 101,
      customerId: "cust_1",
      customerEmail: sampleCustomer.email,
      customerName: sampleCustomer.fullName,
      status: "pending",
      total: 95.0,
      currency: "USD",
      lineItems: [],
      paymentMethod: "Stripe",
      shippingAddress: {},
      billingAddress: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    workflowEngine.notifyOrder({
      type: "order:created",
      order: sampleOrder,
      customer: sampleCustomer,
    });

    const logs = commObserver.getLogs();
    expect(logs.length).toBeGreaterThanOrEqual(2);
    expect(logs.some((l) => l.channel === "email" && l.message.includes("101"))).toBe(true);
    expect(logs.some((l) => l.channel === "whatsapp" && l.message.includes("101"))).toBe(true);
  });

  it("notifies AiTriageObserver and generates VIP Concierge alert when high-value purchase occurs", () => {
    const vipCustomer: CrmCustomer = {
      id: "cust_vip",
      wooCommerceId: 99,
      email: "chrisjen.avasarala@un.gov",
      firstName: "Chrisjen",
      lastName: "Avasarala",
      fullName: "Chrisjen Avasarala",
      phone: "",
      billingAddress: {},
      shippingAddress: {},
      lifetimeValue: 1250.0,
      ordersCount: 2,
      averageOrderValue: 625.0,
      segment: "VIP",
      tags: ["VIP Patron"],
      orderIds: ["ord_201"],
      firstOrderDate: "",
      lastOrderDate: "",
      createdAt: "",
    };

    const vipOrder: CrmOrder = {
      id: "ord_201",
      wooCommerceOrderId: 201,
      customerId: "cust_vip",
      customerEmail: vipCustomer.email,
      customerName: vipCustomer.fullName,
      status: "processing",
      total: 1250.0,
      currency: "USD",
      lineItems: [
        {
          id: "li_1",
          productId: 1,
          name: "Sari Haute Couture",
          quantity: 1,
          price: 1250.0,
          total: 1250.0,
          sku: "SARI-01",
        },
      ],
      paymentMethod: "Apple Pay",
      shippingAddress: {},
      billingAddress: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    workflowEngine.notifyOrder({
      type: "order:created",
      order: vipOrder,
      customer: vipCustomer,
    });

    const alerts = triageObserver.getAlerts();
    expect(alerts.length).toBeGreaterThanOrEqual(1);
    const vipAlert = alerts.find((a) => a.type === "vip_concierge");
    expect(vipAlert).toBeDefined();
    expect(vipAlert?.priority).toBe("urgent");
    expect(vipAlert?.analysis).toContain("Chrisjen Avasarala");
    expect(vipAlert?.suggestedMessage.channel).toBe("whatsapp");
  });

  it("notifies AiTriageObserver on order cancellation and creates recovery campaign with discount voucher", () => {
    const customer: CrmCustomer = {
      id: "cust_regular",
      wooCommerceId: 77,
      email: "camina.drummer@medina.station",
      firstName: "Camina",
      lastName: "Drummer",
      fullName: "Camina Drummer",
      phone: "",
      billingAddress: {},
      shippingAddress: {},
      lifetimeValue: 240.0,
      ordersCount: 2,
      averageOrderValue: 120.0,
      segment: "Repeat",
      tags: [],
      orderIds: ["ord_301"],
      firstOrderDate: "",
      lastOrderDate: "",
      createdAt: "",
    };

    const cancelledOrder: CrmOrder = {
      id: "ord_301",
      wooCommerceOrderId: 301,
      customerId: "cust_regular",
      customerEmail: customer.email,
      customerName: customer.fullName,
      status: "cancelled",
      total: 240.0,
      currency: "USD",
      lineItems: [
        {
          id: "li_drum",
          productId: 88,
          name: "Drummer Flight Suit",
          quantity: 1,
          price: 240.0,
          total: 240.0,
          sku: "SUIT-DRM",
        },
      ],
      paymentMethod: "Stripe",
      shippingAddress: {},
      billingAddress: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    workflowEngine.notifyOrder({
      type: "order:cancelled",
      order: cancelledOrder,
      customer,
      previousStatus: "processing",
    });

    const alerts = triageObserver.getAlerts();
    const recoveryAlert = alerts.find((a) => a.type === "cancellation_recovery");
    expect(recoveryAlert).toBeDefined();
    expect(recoveryAlert?.priority).toBe("high");
    expect(recoveryAlert?.suggestedMessage.couponCode).toContain("COMEBACK-301");
    expect(recoveryAlert?.suggestedMessage.body).toContain("Drummer Flight Suit");
  });
});

describe("CRM Engine: Integrated Ingestion & State Pipeline", () => {
  let engine: CrmEngine;

  beforeEach(() => {
    engine = new CrmEngine();
  });

  it("processes webhook, calculates LTV, and transitions customer segments dynamically", () => {
    // 1. First order: $150 (New segment)
    const order1Payload: WooCommerceOrderPayload = {
      id: 601,
      status: "completed",
      currency: "USD",
      total: "150.00",
      customer_id: 11,
      billing: {
        first_name: "Roberta",
        last_name: "Draper",
        email: "bobbie.draper@mcrn.space",
      },
      shipping: {},
      line_items: [
        {
          id: 1,
          product_id: 50,
          name: "Martian Armor Plating",
          quantity: 1,
          price: 150.0,
          subtotal: "150.00",
          total: "150.00",
        },
      ],
    };

    const res1 = engine.processWebhook(order1Payload);
    expect(res1.customer.segment).toBe("New");
    expect(res1.customer.lifetimeValue).toBe(150.0);
    expect(res1.customer.ordersCount).toBe(1);

    // 2. Second order from same customer: $100 -> Total LTV = $250 (Repeat segment)
    const order2Payload: WooCommerceOrderPayload = {
      id: 602,
      status: "processing",
      currency: "USD",
      total: "100.00",
      customer_id: 11,
      billing: {
        first_name: "Roberta",
        last_name: "Draper",
        email: "bobbie.draper@mcrn.space",
      },
      shipping: {},
      line_items: [
        {
          id: 2,
          product_id: 51,
          name: "Micro-Grav Boots",
          quantity: 1,
          price: 100.0,
          subtotal: "100.00",
          total: "100.00",
        },
      ],
    };

    const res2 = engine.processWebhook(order2Payload);
    expect(res2.customer.segment).toBe("Repeat");
    expect(res2.customer.lifetimeValue).toBe(250.0);
    expect(res2.customer.ordersCount).toBe(2);

    // 3. Third order from same customer: $300 -> Total LTV = $550 (VIP segment)
    const order3Payload: WooCommerceOrderPayload = {
      id: 603,
      status: "processing",
      currency: "USD",
      total: "300.00",
      customer_id: 11,
      billing: {
        first_name: "Roberta",
        last_name: "Draper",
        email: "bobbie.draper@mcrn.space",
      },
      shipping: {},
      line_items: [
        {
          id: 3,
          product_id: 52,
          name: "Goliath Powered Armor Battery",
          quantity: 1,
          price: 300.0,
          subtotal: "300.00",
          total: "300.00",
        },
      ],
    };

    const res3 = engine.processWebhook(order3Payload);
    expect(res3.customer.segment).toBe("VIP");
    expect(res3.customer.lifetimeValue).toBe(550.0);
    expect(res3.customer.tags).toContain("VIP Patron");
  });

  it("advances order status and automatically updates LTV if order is cancelled", () => {
    const payload: WooCommerceOrderPayload = {
      id: 701,
      status: "pending",
      currency: "USD",
      total: "220.00",
      customer_id: 88,
      billing: {
        first_name: "Klaes",
        last_name: "Ashford",
        email: "klaes.ashford@ghostknife.space",
      },
      shipping: {},
      line_items: [],
    };

    const { order, customer } = engine.processWebhook(payload);
    expect(customer.lifetimeValue).toBe(220.0);
    expect(customer.segment).toBe("Repeat");

    // Advance to processing
    const updatedOrder = engine.updateOrderStatus(order.id, "processing");
    expect(updatedOrder?.status).toBe("processing");

    // Now cancel order -> LTV should drop to 0, segment should re-evaluate to New
    const cancelledOrder = engine.updateOrderStatus(order.id, "cancelled");
    expect(cancelledOrder?.status).toBe("cancelled");

    const refreshedCustomer = engine.getCustomer(customer.id);
    expect(refreshedCustomer?.lifetimeValue).toBe(0);
    expect(refreshedCustomer?.segment).toBe("New");
  });
});
